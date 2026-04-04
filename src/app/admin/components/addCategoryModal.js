"use client";

import { createCategory } from "../hooks/inventory";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Swal from "sweetalert2";

export default function AddCategoryModal({ isOpen, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setCategoryName("");
    setErrorMessage("");
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = categoryName.trim();
    if (!name) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await createCategory({ name });
      setCategoryName("");
      onSave();
      onClose();

      await Swal.fire({
        title: "Categoría creada",
        text: "La categoría se registró correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No se pudo crear la categoría.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    return typeof categoryName === "string" && categoryName.trim().length > 0;
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 ">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-linear-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/30 rounded-2xl p-8 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X />
        </button>
        <div className="flex-1 space-y-6">
          <h2>Agregar Categoría</h2>
          <div className="mt-4">
            <label className="text-gray-400 mb-2 block">
              Nombre categoría:
            </label>
            <motion.input
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              type="text"
              name="name"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-2/3 pl-2 bg-transparent border border-yellow-600/20 rounded-lg py-1 text-yellow-500 focus:outline-none focus:border-yellow-500"
            />
            {errorMessage && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-5">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!validate() || isSubmitting}
              className={`px-8 py-3 rounded-full text-white font-semibold transition-all ${
                validate() && !isSubmitting
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Guardando..." : "Agregar Categoria"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
