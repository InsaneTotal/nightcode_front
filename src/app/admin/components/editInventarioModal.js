"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Upload } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  getCategories,
  createInventory,
  updateInventory,
} from "../hooks/inventory";

export default function EditInventarioModal({
  isOpen,
  onClose,
  onSave,
  selectedProduct,
  isNewProduct,
}) {
  const [formData, setFormData] = useState({
    name: "",
    url_img: "",
    price: 0,
    description: "",
    amount: 0,
    category: 0,
  });
  const [imageChanged, setImageChanged] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  // Si en el futuro hay más categorías, aquí se pueden cargar
  const [categories, setCategories] = useState([]);

  const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const loadCategories = async () => {
      try {
        const data = await getCategories({ signal });
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      // Buscar el id de la categoría a partir del nombre si es necesario
      let categoryId = selectedProduct.category;
      if (
        !categoryId &&
        selectedProduct.category_name &&
        categories.length > 0
      ) {
        const found = categories.find(
          (cat) => cat.name === selectedProduct.category_name,
        );
        categoryId = found ? found.id : 0;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: selectedProduct.name || "",
        url_img: selectedProduct.url_img || "",
        price: toNumber(selectedProduct.price, 0),
        description: selectedProduct.description || "",
        amount: toNumber(selectedProduct.amount, 0),
        category: categoryId || 0,
      });
      setImageChanged(false);
    } else {
      setFormData({
        name: "",
        url_img: "",
        price: 0,
        description: "",
        amount: 0,
        category: 0,
      });
      setImageChanged(false);
    }
  }, [selectedProduct, categories]);

  /* ================= FORMAT ================= */

  const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "";
    return num.toLocaleString("es-CO");
  };

  /* ================= TOOLTIP ================= */

  const showTooltip = (message) => {
    setTooltip(message);
    setTimeout(() => setTooltip(null), 2000);
  };

  if (!isOpen) return null;
  /* ================= VALIDACIONES ================= */

  // validate solo retorna true/false, no muestra tooltip
  const validate = () => {
    if (formData.amount < 0) return false;
    if (formData.price <= 0) return false;
    if (!formData.description || !formData.description.trim()) return false;
    return true;
  };

  /* ================= SWEET ALERT CONFIRM ================= */
  const showAlert = async (res) => {
    if (res instanceof Error) {
      await Swal.fire({
        title: "Error",
        text: res.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });

      return;
    }

    onSave({ ...formData });

    await Swal.fire({
      title: "Actualizado",
      text: res.message,
      icon: "success",
      background: "#18181b",
      color: "#fff",
      confirmButtonColor: "#16a34a",
      timer: 1500,
      showConfirmButton: false,
    });

    onClose();
  };

  const confirmSave = async () => {
    if (formData.amount < 0) {
      showTooltip("La cantidad no puede ser negativa");
      return;
    }
    if (formData.price <= 0) {
      showTooltip("El precio debe ser mayor a 0");
      return;
    }
    if (!formData.description || !formData.description.trim()) {
      showTooltip("La descripción es obligatoria");
      return;
    }

    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará el producto en el inventario.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      background: "#18181b",
      color: "#fff",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      customClass: {
        popup: "rounded-2xl border border-yellow-600/30",
      },
    });

    if (result.isConfirmed) {
      if (isNewProduct) {
        const response = await createInventory({ ...formData });
        await showAlert(response);
      }

      if (!isNewProduct) {
        const payload = { ...formData };

        if (!imageChanged) {
          delete payload.url_img;
        }

        const response = await updateInventory(selectedProduct.id, payload);
        await showAlert(response);
      }
    }
  };

  /* ================= INPUT HANDLERS ================= */

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, amount: Number(value) }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: Number(value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showTooltip("El archivo debe ser una imagen");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageChanged(true);
      setFormData((prev) => ({ ...prev, url_img: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      confirmSave();
    }
  };

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  // Ya no se usa isValid, todo se valida con validate()

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
    <div
      onKeyDown={handleKeyDown}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-linear-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/30 rounded-2xl p-8 relative"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* IMAGE */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-64 h-72 bg-zinc-900 border border-yellow-600/20 rounded-xl flex items-center justify-center">
              <Image
                src={formData.url_img || "/placeholder.png"}
                alt={formData.name || "Producto"}
                width={200}
                height={200}
                className="h-56 object-contain"
                unoptimized={isLocalhostImage(formData.url_img)}
              />
            </div>

            <label className="cursor-pointer bg-zinc-900 border border-yellow-500/30 hover:border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Upload size={16} />
              Cambiar imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* FORM */}
          <div className="flex-1 space-y-6">
            <motion.input
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-2/3 pl-2 bg-transparent border border-yellow-600/20 rounded-lg py-1 text-yellow-500 focus:outline-none focus:border-yellow-500"
            />

            {/* CATEGORIAS */}

            <div>
              <label className="text-gray-400 mb-2 block">Categoría:</label>
              <select
                name="category_name"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full bg-transparent border border-yellow-600/20 rounded-lg py-2 px-3 text-gray-400 focus:outline-none focus:border-yellow-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option
                    key={category.id || category.name}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CANTIDAD */}
            <div>
              <p className="text-gray-400 mb-2">Cantidad:</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      amount: Math.max(0, formData.amount - 1),
                    })
                  }
                  className="bg-zinc-900 border border-red-500 text-red-500 p-2 rounded-lg"
                >
                  <Minus size={16} />
                </button>

                <motion.input
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  value={formatNumber(formData.amount) || 0}
                  onChange={handleQuantityChange}
                  className="w-24 text-center bg-transparent border border-yellow-600/20 rounded-lg py-1 text-white focus:outline-none focus:border-yellow-500"
                />

                <button
                  onClick={() =>
                    setFormData({ ...formData, amount: formData.amount + 1 })
                  }
                  className="bg-zinc-900 border border-green-500 text-green-500 p-2 rounded-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* PRECIO */}
            <div>
              <p className="text-gray-400 mb-2">Precio:</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      price: Math.max(0, formData.price - 100),
                    })
                  }
                  className="bg-zinc-900 border border-red-500 text-red-500 p-2 rounded-lg"
                >
                  <Minus size={16} />
                </button>

                <motion.input
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  value={`$ ${formatNumber(formData.price) || 0}`}
                  onChange={handlePriceChange}
                  className="w-32 text-center bg-transparent border border-yellow-600/20 rounded-lg py-1 text-green-400 font-semibold focus:outline-none focus:border-yellow-500"
                />

                <button
                  onClick={() =>
                    setFormData({ ...formData, price: formData.price + 100 })
                  }
                  className="bg-zinc-900 border border-green-500 text-green-500 p-2 rounded-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <p className="text-gray-400 mb-2">Descripción:</p>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-zinc-900 border border-yellow-600/20 rounded-xl p-4 text-sm focus:outline-none focus:border-yellow-500"
                rows={4}
              />
            </div>

            {/* GUARDAR */}
            <div className="flex justify-end">
              <button
                onClick={confirmSave}
                disabled={!validate()}
                className={`px-8 py-3 rounded-full text-white font-semibold transition-all ${
                  validate()
                    ? "bg-green-700 hover:bg-green-600"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        {/* TOOLTIP */}
        {tooltip && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            {tooltip}
          </div>
        )}
      </motion.div>
    </div>
  );
}
