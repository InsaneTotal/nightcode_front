"use client";
import { useState, useEffect } from "react";
import { fetchDocumentTypes } from "../../admin/hooks/typeDocument";
import { fetchRoles } from "../../admin/hooks/roles";
import { createEmpleado, updateEmpleado } from "../hooks/empleados";

export default function EmpleadoModal({
  isOpen,
  onClose,
  empleadoEditar,
  onSave,
  actualizarListaEmpleados,
}) {
  const [docTypes, setDocTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [hidePassword, setHidePassword] = useState(false);

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

  useEffect(() => {
    if (empleadoEditar) {
      setHidePassword(true);
      setFormData({
        first_name: empleadoEditar.first_name || "",
        last_name: empleadoEditar.last_name || "",
        telephone_number: empleadoEditar.telephone_number || "",
        id_type_document: empleadoEditar.id_type_document || "",
        document_number: empleadoEditar.document_number || "",
        email: empleadoEditar.email || "",
        id_role: empleadoEditar.id_role || "",
        salary: empleadoEditar.salary || "",
      });
    } else {
      setHidePassword(false);
      setFormData({
        first_name: "",
        last_name: "",
        telephone_number: "",
        id_type_document: "",
        document_number: "",
        email: "",
        password: "",
        confirm_password: "",
        id_role: "",
        salary: "",
      });
    }
  }, [empleadoEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formToSend = {
      ...formData,
      username: formData.email,
      // is_active: true,
    };
    delete formToSend.confirm_password;
    try {
      if (empleadoEditar) {
        const result = await updateEmpleado(empleadoEditar.id, formToSend);
        if (!result || result.error) {
          setError(
            "Error al actualizar el empleado. Por favor, intente nuevamente.",
          );
          return error;
        }
        onSave(result);
        actualizarListaEmpleados();
      } else {
        const result = await createEmpleado(formToSend);
        if (!result || result.error) {
          console.log(formToSend);
          setError(
            "Error al crear el empleado. Por favor, intente nuevamente.",
          );

          return error;
        }
        // Limpiar el formulario al crear usuario
        setFormData({
          first_name: "",
          last_name: "",
          telephone_number: "",
          id_type_document: "",
          document_number: "",
          email: "",
          password: "",
          confirm_password: "",
          salary: "",
          id_role: "",
        });
        onSave(result);
        actualizarListaEmpleados();
        // if (onEmpleadoCreado) {
        //   await onEmpleadoCreado();
        // }
      }
    } catch (error) {
      setError("Error al guardar el empleado. Por favor, intente nuevamente.");
    }
  };
  return (
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
              value={formData.first_name || ""}
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
              value={formData.last_name || ""}
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
              name="telephone_number"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.telephone_number || ""}
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
              value={formData.id_type_document || ""}
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
              name="document_number"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.document_number || ""}
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
              value={formData.email || ""}
              placeholder="Email"
            />
          </div>
          {!hidePassword && (
            <>
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
                  value={formData.password || ""}
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
                  value={formData.confirm_password || ""}
                  placeholder="Confirmar Contraseña"
                />
              </div>
            </>
          )}
          {/* ROL */}
          <div>
            <label className="text-sm">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="id_role"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.id_role || ""}
            >
              <option value="">Seleccione el rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">
              Salario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="salary"
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-full bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.salary || ""}
              placeholder="Salario"
            />
          </div>

          {/* BOTÓN */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="button"
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
          {error && (
            <p className="col-span-2 text-center text-red-500 text-sm pt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
