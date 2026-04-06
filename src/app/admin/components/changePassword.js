"use client";

import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { changePassword } from "../hooks/empleados";

export default function ChangePassword({ isOpen, onClose, selectedEmployee }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasBothPasswords =
    newPassword.trim() !== "" && confirmPassword.trim() !== "";
  const passwordsDontMatch =
    hasBothPasswords && newPassword !== confirmPassword;
  const displayMessage = passwordsDontMatch
    ? "Las contraseñas no coinciden."
    : errorMessage;
  const isFormValid =
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword;

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setIsSubmitting(false);
    onClose?.();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Ambos campos son obligatorios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const employeeId = selectedEmployee?.id;
    if (!employeeId) {
      setErrorMessage("No se pudo identificar el empleado.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await changePassword(
        employeeId,
        newPassword,
        confirmPassword,
      );
      handleClose();

      await Swal.fire({
        title: "Contraseña actualizada",
        text: result.message || "La contraseña se cambió correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Error al cambiar la contraseña. Inténtalo de nuevo.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 ">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-linear-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/30 rounded-2xl p-8 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X />
        </button>
        <div className="flex-1 space-y-6">
          <h2>Cambiar Contraseña</h2>
          <div className="mt-4">
            <label className="text-gray-400 mb-2 block">Nueva Contraseña</label>
            <motion.input
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              type="password"
              name="newPassword"
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-2/3 pl-2 bg-transparent border border-yellow-600/20 rounded-lg py-1 text-yellow-500 focus:outline-none focus:border-yellow-500"
            />
            <label className="text-gray-400 mb-2 block">
              Confirmar Contraseña
            </label>

            <motion.input
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              type="password"
              name="confirmPassword"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-2/3 pl-2 bg-transparent border border-yellow-600/20 rounded-lg py-1 text-yellow-500 focus:outline-none focus:border-yellow-500"
            />
            {displayMessage && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-5">{displayMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`px-8 py-3 rounded-full text-white font-semibold transition-all ${
                isFormValid && !isSubmitting
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
