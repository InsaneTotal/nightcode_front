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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-yellow-600/30 bg-linear-to-br from-[#4b2c4f] to-[#2e1b30] p-4 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:p-6 lg:p-8"
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white sm:right-5 sm:top-5"
        >
          <X />
        </button>
        <div className="flex-1 space-y-6">
          <h2 className="text-yellow-500 text-2xl font-semibold mb-6 text-center col-span-2">
            Agregar Categoría
          </h2>
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
              className="w-full rounded-lg border border-yellow-600/20 bg-transparent px-3 py-2 text-yellow-500 focus:outline-none focus:border-yellow-500 md:w-2/3"
              // className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
