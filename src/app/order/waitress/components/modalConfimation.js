"use client";

import Swal from "sweetalert2";

export function showModalConfirmation({
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "warning",
  onConfirm,
}) {
  Swal.fire({
    title,
    text: message,
    icon,
    background: "#0b0b0b",
    color: "#ffffff",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
}
