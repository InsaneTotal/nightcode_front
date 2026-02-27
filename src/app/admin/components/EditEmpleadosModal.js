"use client";
import { useState, useEffect } from "react";
import { fetchDocumentTypes } from "../../admin/hooks/typeDocument";
import { fetchRoles } from "../../admin/hooks/roles";

export default function EmpleadoModal({
  isOpen,
  onClose,
  onSave,
  empleadoEditar,
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    id_type_document: "",
    document: "",
    email: "",
    password: "",
    confirm_password: "",
    id_rol: "",
  });
  const [docTypes, setDocTypes] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadData = async () => {
      try {
        const [types, rolesData] = await Promise.all([
          fetchDocumentTypes(signal),
          fetchRoles(signal),
        ]);

        setDocTypes(types);
        setRoles(rolesData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error cargando datos:", error);
        }
      }
    };

    loadData();

    return () => {
      controller.abort(); // Cancela las peticiones al desmontar
    };
  }, []);

  const getInitialForm = (empleado) =>
    empleado || {
      first_name: "",
      last_name: "",
      phone: "",
      id_type_document: "",
      document: "",
      email: "",
      password: "",
      confirm_password: "",
      id_rol: "",
    };

  useEffect(() => {
    setForm(getInitialForm(empleadoEditar));
  }, [empleadoEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    // <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    //   <div className="bg-black border border-yellow-500/40 rounded-xl p-6 w-[400px] shadow-2xl">
    //     <h2 className="text-yellow-400 text-xl font-bold mb-4">
    //       {empleadoEditar ? "Editar Empleado" : "Agregar Empleado"}
    //     </h2>

    //     <div className="space-y-3">
    //       <input
    //         name="nombre"
    //         placeholder="Nombre"
    //         value={form.nombre}
    //         onChange={handleChange}
    //         className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
    //       />

    //       <input
    //         name="telefono"
    //         placeholder="Teléfono"
    //         value={form.telefono}
    //         onChange={handleChange}
    //         className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
    //       />

    //       <input
    //         name="oficio"
    //         placeholder="Oficio"
    //         value={form.oficio}
    //         onChange={handleChange}
    //         className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
    //       />

    //       <input
    //         type="date"
    //         name="fecha"
    //         value={form.fecha}
    //         onChange={handleChange}
    //         className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
    //       />

    //       <input
    //         name="salario"
    //         placeholder="Salario"
    //         value={form.salario}
    //         onChange={handleChange}
    //         className="w-full bg-black border border-yellow-500/30 p-2 rounded text-white"
    //       />
    //     </div>

    //     <div className="flex justify-end gap-3 mt-5">
    //       <button
    //         onClick={onClose}
    //         className="px-4 py-2 border border-gray-500 rounded text-gray-400"
    //       >
    //         Cancelar
    //       </button>

    //       <button
    //         onClick={handleSubmit}
    //         className="px-4 py-2 bg-green-600 rounded text-white"
    //       >
    //         Guardar
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="bg-linear-to-br from-[#4b2c4f] to-[#2e1b30] 
                      w-full max-w-lg rounded-[40px] 
                      shadow-[0_0_40px_rgba(255,204,0,0.4)] 
                      p-8 text-white mt-6 "
      >
        <h2 className="text-yellow-500 text-2xl font-semibold mb-6 text-center col-span-2">
          {empleadoEditar ? "Editar Empleado" : "Agregar Empleado"}
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NOMBRE */}
          <div>
            <label className="text-sm">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Nombre"
            />
          </div>

          {/* APELLIDO */}
          <div>
            <label className="text-sm">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Apellido"
            />
          </div>

          {/* TELEFONO */}
          <div>
            <label className="text-sm">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Teléfono"
            />
          </div>

          {/* TIPO DOCUMENTO */}
          <div>
            <label className="text-sm">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              name="id_type_document"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Seleccione el tipo de documento</option>
              {docTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* NUMERO DOCUMENTO */}
          <div>
            <label className="text-sm">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="document"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Número de Documento"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Email"
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="text-sm">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Contraseña"
            />
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div>
            <label className="text-sm">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirm_password"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Confirmar Contraseña"
            />
          </div>

          {/* ROL */}
          <div className="md:col-span-2">
            <label className="text-sm">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="id_rol"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Seleccione el rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.name}
                </option>
              ))}
            </select>
          </div>

          {/* BOTÓN */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              onClick={onClose}
              className="bg-[#4b2c4f] border border-yellow-500 
                 text-white mr-4 px-8 py-2 rounded-full 
                 hover:bg-yellow-500 hover:text-black 
                 transition duration-300"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="bg-[#4b2c4f] border border-yellow-500 
                 text-white px-8 py-2 rounded-full 
                 hover:bg-yellow-500 hover:text-black 
                 transition duration-300"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
