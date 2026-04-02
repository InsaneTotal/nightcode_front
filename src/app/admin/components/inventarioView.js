"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Pencil, ChevronDown } from "lucide-react";
import { getInventory, getCategories } from "../hooks/inventory";
import EditInventarioModal from "./editInventarioModal"; // 👈 IMPORT
import Image from "next/image";
import AddButton from "../../components/AddButton";
import {
  matchesRealtimeTopics,
  subscribeRealtimeUpdates,
} from "../../../utils/realtime";

export default function InventarioView() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(new Set());

  const loadData = useCallback(async () => {
    try {
      const [inventoryData, categoriesData] = await Promise.all([
        getInventory(),
        getCategories(),
      ]);

      const inventoryList = Array.isArray(inventoryData)
        ? inventoryData
        : inventoryData?.results || [];

      const categoriesList = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData?.results || [];

      setProducts(inventoryList);
      setCategories(categoriesList);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdates((event) => {
      if (
        matchesRealtimeTopics(event, [
          "inventory",
          "drinks",
          "category",
          "categories",
          "product",
          "products",
        ])
      ) {
        loadData();
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  // oculta la alerta automáticamente después de unos segundos
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  // Filtrar productos según el término de búsqueda
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((product) => {
      if (!term) return true;

      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      const category = (product.category_name || "").toLowerCase();

      return (
        name.includes(term) ||
        description.includes(term) ||
        category.includes(term)
      );
    });
  }, [products, search]);

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const product of filteredProducts) {
      const categoryId =
        product.category_id ?? product.category ?? "sin-categoria";
      if (!map.has(categoryId)) {
        map.set(categoryId, []);
      }
      map.get(categoryId).push(product);
    }
    return map;
  }, [filteredProducts]);

  const categoryGroups = useMemo(() => {
    const groups = categories.map((category) => ({
      id: category.id,
      name: category.name,
      items: productsByCategory.get(category.id) || [],
    }));

    for (const [key, items] of productsByCategory.entries()) {
      const alreadyExists = groups.some((group) => group.id === key);
      if (!alreadyExists) {
        const fallbackName =
          key === "sin-categoria"
            ? "Sin categoría"
            : items[0]?.category_name || `Categoría ${key}`;

        groups.push({
          id: key,
          name: fallbackName,
          items,
        });
      }
    }

    return groups.filter((group) => group.items.length > 0);
  }, [categories, productsByCategory]);

  const toggleCategory = (categoryId) => {
    setOpenCategory((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // 🔥 Producto seleccionado para editar

  const cardStyle =
    "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/20 rounded-2xl p-6";

  const isLocalhostImage = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1"
      );
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-500">
          Inventario
        </h1>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-yellow-600/20 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
          />
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <AddButton
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
            setIsNewProduct(true);
          }}
        />
      </div>
      <div className="space-y-8">
        {categoryGroups.length === 0 && (
          <p className="text-center text-gray-400">
            No se encontraron productos.
          </p>
        )}
        {categoryGroups.map((group) => {
          const isOpen = openCategory.has(group.id);

          return (
            <div
              key={group.id}
              className="border border-yellow-600 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCategory(group.id)}
                className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-yellow-400">
                    {group.name}
                  </h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-gray-300">
                    {group.items.length}
                  </span>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-gray-300 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 space-y-8">
                    {group.items.map((product) => (
                      <div
                        key={product.id}
                        className={`${cardStyle} flex flex-col md:flex-row md:items-center md:justify-between gap-6`}
                      >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="w-40 h-40 min-w-40 bg-zinc-900 border border-yellow-600/20 rounded-xl flex items-center justify-center p-2">
                            <Image
                              src={product.url_img}
                              alt={product.name}
                              width={120}
                              height={120}
                              className="object-contain max-w-full max-h-full"
                              unoptimized={isLocalhostImage(product.url_img)}
                            />
                          </div>

                          <div className="text-center md:text-left">
                            <h2 className="text-lg font-semibold text-yellow-400 mb-3">
                              {product.name}
                            </h2>

                            <p className="text-sm text-gray-400 mb-2">
                              {product.description}
                            </p>

                            <p className="text-sm text-gray-400">
                              Cantidad:{" "}
                              <span
                                className={`font-semibold ${
                                  product.amount <= 10
                                    ? "text-red-500"
                                    : "text-white"
                                }`}
                              >
                                {product.amount}
                              </span>
                            </p>

                            <p className="text-sm text-gray-400">
                              Precio:{" "}
                              <span className="text-green-400 font-semibold">
                                $
                                {Math.round(product.price).toLocaleString(
                                  "es-CO",
                                )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsNewProduct(false);
                            setIsModalOpen(true);
                          }}
                          className="bg-zinc-900 border border-white/10 p-3 rounded-xl transition-colors hover:border-yellow-500"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 MODAL */}

      <EditInventarioModal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedProduct(null);
          setIsModalOpen(false);
        }}
        onSave={() => {
          loadData();
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        selectedProduct={selectedProduct}
        isNewProduct={isNewProduct}
        // updateInventory={ShowUpdatedInventory}
      />
    </div>
  );
}
