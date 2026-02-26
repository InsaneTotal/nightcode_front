"use client";
import { useState, useEffect } from "react";

export default function EmpleadoModal({
  isOpen,
  onClose,
  onSave,
  empleadoEditar,
}) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    oficio: "",
    fecha: "",
    salario: "",
  });

  useEffect(() => {
    if (empleadoEditar) {
      setForm(empleadoEditar);
    } else {
      setForm({
        nombre: "",
        telefono: "",
        oficio: "",
        fecha: "",
        salario: "",
      });
    }
  }, [empleadoEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-yellow-500/40 rounded-xl p-6 w-[400px] shadow-2xl">
        <h2 className="text-yellow-400 text-xl font-bold mb-4">
          {empleadoEditar ? "Editar Empleado" : "Agregar Empleado"}
        </h2>

        <div className="space-y-3">
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
          />

          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
          />

          <input
            name="oficio"
            placeholder="Oficio"
            value={form.oficio}
            onChange={handleChange}
            className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
          />

          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
          />

          <input
            name="salario"
            placeholder="Salario"
            value={form.salario}
            onChange={handleChange}
            className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-500 rounded text-gray-400"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 rounded text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
