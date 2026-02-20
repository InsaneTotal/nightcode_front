"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Upload } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function EditInventarioModal({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState(product.quantity);
  const [price, setPrice] = useState(product.price);
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(product.image);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setQuantity(product.quantity);
    setPrice(product.price);
    setDescription(product.description);
    setImage(product.image);
  }, [product]);

  /* ================= FORMAT ================= */

  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toLocaleString("es-CO");
  };

  /* ================= TOOLTIP ================= */

  const showTooltip = (message) => {
    setTooltip(message);
    setTimeout(() => setTooltip(null), 2000);
  };

  /* ================= VALIDACIONES ================= */

  const validate = () => {
    if (quantity < 0) {
      showTooltip("La cantidad no puede ser negativa");
      return false;
    }

    if (price <= 0) {
      showTooltip("El precio debe ser mayor a 0");
      return false;
    }

    if (!description.trim()) {
      showTooltip("La descripción es obligatoria");
      return false;
    }

    return true;
  };

  /* ================= SWEET ALERT CONFIRM ================= */

  const confirmSave = async () => {
    if (!validate()) return;

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
      onSave({
        ...product,
        quantity,
        price,
        description,
        image,
      });

      await Swal.fire({
        title: "Actualizado",
        text: "El producto fue actualizado correctamente.",
        icon: "success",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#16a34a",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
    }
  };

  /* ================= INPUT HANDLERS ================= */

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setQuantity(Number(value));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPrice(Number(value));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showTooltip("El archivo debe ser una imagen");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      confirmSave();
    }
  };

  const isValid = quantity >= 0 && price > 0 && description.trim() !== "";

  return (
    <div
      onKeyDown={handleKeyDown}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/30 rounded-2xl p-8 relative"
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
              <img
                src={image}
                alt={product.name}
                className="h-56 object-contain"
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
            <h2 className="text-2xl font-bold text-yellow-500">
              {product.name}
            </h2>

            {/* CANTIDAD */}
            <div>
              <p className="text-gray-400 mb-2">Cantidad:</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="bg-zinc-900 border border-red-500 text-red-500 p-2 rounded-lg"
                >
                  <Minus size={16} />
                </button>

                <motion.input
                  key={quantity}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  value={formatNumber(quantity)}
                  onChange={handleQuantityChange}
                  className="w-24 text-center bg-transparent border border-yellow-600/20 rounded-lg py-1 text-white focus:outline-none focus:border-yellow-500"
                />

                <button
                  onClick={() => setQuantity((q) => q + 1)}
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
                  onClick={() => setPrice((p) => Math.max(0, p - 100))}
                  className="bg-zinc-900 border border-red-500 text-red-500 p-2 rounded-lg"
                >
                  <Minus size={16} />
                </button>

                <motion.input
                  key={price}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  value={`$ ${formatNumber(price)}`}
                  onChange={handlePriceChange}
                  className="w-32 text-center bg-transparent border border-yellow-600/20 rounded-lg py-1 text-green-400 font-semibold focus:outline-none focus:border-yellow-500"
                />

                <button
                  onClick={() => setPrice((p) => p + 100)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-yellow-600/20 rounded-xl p-4 text-sm focus:outline-none focus:border-yellow-500"
                rows={4}
              />
            </div>

            {/* GUARDAR */}
            <div className="flex justify-end">
              <button
                onClick={confirmSave}
                disabled={!isValid}
                className={`px-8 py-3 rounded-full text-white font-semibold transition-all ${
                  isValid
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
