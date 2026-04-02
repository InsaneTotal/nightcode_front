"use client";

import { memo, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "../../utils/authFetch";
import {
  BACKEND_CONNECTION_ERROR,
  buildApiUrl,
  fetchWithTimeout,
  getApiBase,
} from "../../utils/networkConfig";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../utils/realtime";

const DRINKS_PATH = "/api/authinventory/drinks/";
const CATEGORIES_PATH = "/api/authinventory/categories/";
const ADS = ["/ads/ad6.png", "/ads/ad8.png", "/ads/ad7.png"];

const formatMoney = (value) =>
  "$" + Math.round(Number(value || 0)).toLocaleString("es-CO");

const normalizeCategoryKey = (drink) => {
  const id = drink?.category ?? drink?.id_category ?? drink?.category_id;
  if (id !== undefined && id !== null && id !== "") {
    return String(id);
  }
  const name = drink?.category_name || drink?.category?.name || "Sin categoria";
  return "name:" + String(name).toLowerCase();
};

const getCategoryNameForDrink = (drink, categoriesById) => {
  const id = drink?.category ?? drink?.id_category ?? drink?.category_id;
  if (id !== undefined && id !== null && categoriesById[String(id)]) {
    return categoriesById[String(id)];
  }
  return drink?.category_name || drink?.category?.name || "Sin categoria";
};

const isLocalhostImage = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const ProductCard = memo(function ProductCard({
  product,
  hidden,
  onImageError,
}) {
  return (
    <div className="flex gap-4 items-center rounded-xl border border-yellow-400/10 bg-black/20 p-3">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity }}
        className="relative w-20 h-28 shrink-0"
      >
        {product.image && !hidden && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain drop-shadow-[0_0_20px_rgba(255,193,7,0.45)]"
            unoptimized={isLocalhostImage(product.image)}
            onError={() => onImageError(product.id)}
          />
        )}
      </motion.div>

      <div className="flex-1 min-w-0">
        <h4 className="text-yellow-400 font-bold mb-1 truncate">
          {product.name}
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-green-400 font-semibold">
            {formatMoney(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
});

export default function MenuLicores() {
  const [openSection, setOpenSection] = useState(null);
  const [currentAd, setCurrentAd] = useState(0);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hiddenImages, setHiddenImages] = useState({});
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterFeedback, setWaiterFeedback] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductImageError = (productId) => {
    setHiddenImages((prev) => ({ ...prev, [productId]: true }));
  };

  // Guardar parámetros QR en sessionStorage cuando se abre la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesa = params.get("mesa");
    const token = params.get("token");

    if (mesa && token) {
      sessionStorage.setItem("mesaId", mesa);
      sessionStorage.setItem("mesa_token", token);
    }
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleCallWaiter = async () => {
    const params = new URLSearchParams(window.location.search);
    const mesaId = params.get("mesa") || sessionStorage.getItem("mesaId");
    const token = params.get("token") || sessionStorage.getItem("mesa_token");

    if (!mesaId || !token) {
      setWaiterFeedback("QR inválido: falta token de mesa");
      return;
    }

    setCallingWaiter(true);
    setWaiterFeedback("");

    try {
      const apiBase = getApiBase();

      // Intenta ruta principal
      let response = await fetchWithTimeout(
        `${apiBase}/api/order/drink-tables/${mesaId}/call-waiter/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );

      // Si falla, prueba alias
      if (!response.ok && response.status === 404) {
        response = await fetchWithTimeout(
          `${apiBase}/api/order/tables/${mesaId}/call-waiter/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );
      }

      if (!response.ok) {
        const error = await response.json();
        setWaiterFeedback(`Error: ${error.detail || "Error al llamar mesero"}`);
        return;
      }

      const data = await response.json();
      setWaiterFeedback(`✓ ${data.detail}`);
    } catch (error) {
      setWaiterFeedback(error?.message || BACKEND_CONNECTION_ERROR);
      console.error(error);
    } finally {
      setCallingWaiter(false);
    }
  };

  const loadMenuFromApi = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const drinksUrl = buildApiUrl(DRINKS_PATH);
      const categoriesUrl = buildApiUrl(CATEGORIES_PATH);

      // Intentar sin auth primero, si falla con 401, entonces con token
      const publicFetch = async (url) => {
        let res = await fetchWithTimeout(url);
        if (res.status === 401 || res.status === 403) {
          // Si el backend requiere auth, reintentar con token
          res = await authFetch(url);
        }
        return res;
      };

      const [drinksResponse, categoriesResponse] = await Promise.all([
        publicFetch(drinksUrl),
        publicFetch(categoriesUrl),
      ]);

      if (!drinksResponse.ok) {
        throw new Error("No se pudo cargar el inventario de bebidas");
      }

      if (!categoriesResponse.ok) {
        throw new Error("No se pudieron cargar las categorias");
      }

      const drinks = await drinksResponse.json();
      const categories = await categoriesResponse.json();

      const categoriesById = Array.isArray(categories)
        ? categories.reduce((acc, category) => {
            acc[String(category.id)] = category.name || "Sin categoria";
            return acc;
          }, {})
        : {};

      const visibleDrinks = (Array.isArray(drinks) ? drinks : []).filter(
        (drink) => !/auth\s*test/i.test(String(drink?.name || "")),
      );

      const grouped = visibleDrinks.reduce((acc, drink) => {
        const key = normalizeCategoryKey(drink);
        const categoryName = getCategoryNameForDrink(drink, categoriesById);

        if (!acc[key]) {
          acc[key] = {
            id: key,
            title: categoryName,
            products: [],
          };
        }

        acc[key].products.push({
          id: drink.id,
          name: drink.name || "Producto sin nombre",
          description: drink.description || "Sin descripcion",
          price: Number(drink.price || 0),
          amount: Number(drink.amount || 0),
          image: drink.url_img || null,
        });

        return acc;
      }, {});

      const mappedSections = Object.values(grouped)
        .map((section) => ({
          ...section,
          products: section.products.sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      setSections(mappedSections);
      setOpenSection(mappedSections[0]?.id ?? null);
    } catch (err) {
      setError(err.message || BACKEND_CONNECTION_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuFromApi();
  }, [loadMenuFromApi]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, [
          "inventory",
          "drinks",
          "categories",
          "menu",
          "products",
        ])
      ) {
        loadMenuFromApi();
      }
    });

    return () => unsubscribe();
  }, [loadMenuFromApi]);

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-[#0b0b0b] to-black text-white pb-32 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 🔥 SLIDER PREMIUM */}
        <div className="relative h-48 rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={ADS[currentAd]}
                alt="Publicidad"
                fill
                className=""
                priority
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/40" />

          {/* Indicadores */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {ADS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-6 rounded-full transition-all ${
                  currentAd === index ? "bg-yellow-400 w-10" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* TITULO */}
        <h2 className="text-center text-yellow-400 tracking-widest text-lg">
          MENÚ DIGITAL
        </h2>

        {/* 🔥 SECCIONES MEJORADAS */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center text-gray-400">
              Cargando menu desde inventario...
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-400">{error}</div>
          )}

          {!loading && !error && sections.length === 0 && (
            <div className="text-center text-gray-400">
              No hay bebidas registradas.
            </div>
          )}

          {sections.map((section) => (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-yellow-400/20
                         bg-white/5 backdrop-blur-xl
                         shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex justify-between items-center px-5 py-5"
              >
                <span className="text-lg font-semibold">{section.title}</span>

                <motion.div
                  animate={{
                    rotate: openSection === section.id ? 180 : 0,
                  }}
                >
                  <ChevronDown size={22} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-yellow-400/20 px-5 py-6 space-y-4">
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          hidden={Boolean(hiddenImages[product.id])}
                          onImageError={handleProductImageError}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* 🔥 BOTÓN PREMIUM */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCallWaiter}
          disabled={callingWaiter}
          className="w-full py-4 rounded-2xl 
                     bg-yellow-500 text-black font-bold tracking-wide
                     shadow-[0_0_25px_rgba(255,193,7,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {callingWaiter ? "Llamando..." : "📞 Llamar mesero"}
        </motion.button>

        {waiterFeedback && (
          <p className="text-center text-sm text-yellow-300">
            {waiterFeedback}
          </p>
        )}
      </div>

      {/* 🔥 FOOTER MEJORADO */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-yellow-400/20 flex">
        <div className="w-1/2 py-4 text-center text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
          🎵 Música
        </div>
        <div className="w-px bg-yellow-400/20"></div>
        <div className="w-1/2 py-4 text-center text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
          📖 Menú
        </div>
      </div>
    </div>
  );
}
