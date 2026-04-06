"use client";

import { useState, useMemo, useEffect, act } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Pencil,
  Trash2,
  Users,
  DollarSign,
  CheckIcon,
  LockIcon,
} from "lucide-react";
import EditEmpleadosModal from "./EditEmpleadosModal";
import ChangePassword from "./changePassword";
import Swal from "sweetalert2";
import {
  getEmpleados,
  deleteEmpleado,
  activateEmpleado,
} from "../hooks/empleados";
import { resolve } from "path";
import AddButton from "../../components/AddButton";

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosActivos, setEmpleadosActivos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [changePassword, setChangePassword] = useState(null);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [mostratAlertaCreacion, setMostratAlertaCreacion] = useState(false);
  const [mensajeCreacion, setMensajeCreacion] = useState("");

  const totalNomina = useMemo(() => {
    return empleadosActivos.reduce((acc, emp) => acc + Number(emp.salary), 0);
  }, [empleadosActivos]);

  const cardStyle =
    "bg-gradient-to-br from-black via-[#050816] to-[#0a0f2a] border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300";

  const actualizarListaEmpleados = async () => {
    const result = await getEmpleados();
    setEmpleados(result);
    setEmpleadosActivos(result.filter((emp) => emp.is_active));
  };

  useEffect(() => {
    if (mostratAlertaCreacion) {
      console.log(mensajeCreacion);
      Swal.fire({
        title: mensajeCreacion.process || "Usuario creado",
        text:
          mensajeCreacion.message || "El empleado fue creado correctamente.",
        icon: "success",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0a0f2a",
        color: "#fff",
      });
      setMostratAlertaCreacion(false);
      setMensajeCreacion("");
    }
  }, [mostratAlertaCreacion, mensajeCreacion]);

  const eliminarEmpleado = (id, nombre) => {
    Swal.fire({
      title: "¿Estás seguro?",
      html: `Vas a eliminar a <b>${nombre}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      background: "#0a0f2a",
      color: "#fff",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        const result = await deleteEmpleado(id);
        if (result instanceof Error) {
          Swal.showValidationMessage(`${result.message}`);
        }
        resolve();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Eliminado",
          text: "El empleado fue eliminado correctamente.",
          icon: "success",
          confirmButtonColor: "#16a34a",
          background: "#0a0f2a",
          color: "#fff",
        });
        actualizarListaEmpleados();
      }
    });
  };

  const activarEmpleado = async (id, empleado) => {
    try {
      const result = await activateEmpleado(id, empleado);
      if (result instanceof Error) {
        throw result;
      }
      actualizarListaEmpleados();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo activar el empleado.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        background: "#0a0f2a",
        color: "#fff",
      });
    }
  };

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const result = await getEmpleados();
        setEmpleados(result);
        setEmpleadosActivos(result.filter((emp) => emp.is_active));
      } catch (error) {
        return error;
      }
    };
    cargarEmpleados();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      {/* TÍTULO */}
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-500 tracking-wide leading-tight">
          Gestión de Empleados
        </h2>

        <AddButton
          onClick={() => {
            setEmpleadoEditar(null);
            setModalOpen(true);
          }}
          text={"Empleado"}
        />
      </div>

      {/* CARDS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className={cardStyle}>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Users size={16} />
            Total Empleados
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">
            {empleadosActivos.length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <DollarSign size={16} />
            Nómina Total
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-400 mt-2 wrap-break-word">
            ${totalNomina.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className={cardStyle}>
        <div className="hidden md:grid grid-cols-6 text-gray-400 border-b border-yellow-500/30 pb-4 mb-4 text-sm">
          <span>Empleado</span>
          <span>Teléfono</span>
          <span>Oficio</span>
          <span>Fecha Ingreso</span>
          <span>Salario</span>
          <span>Acciones</span>
        </div>

        <div className="overflow-y-auto max-h-120 scroll-table pr-1">
          {empleados
            .slice()
            .sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))
            .map((emp) => (
              <div
                key={emp.id}
                className="border-b border-yellow-500/10 py-3 sm:py-4"
              >
                {/* Desktop */}
                <div className="hidden md:grid md:grid-cols-6 md:items-center text-sm hover:bg-white/5 transition-colors rounded-lg px-2 py-1">
                  <span className="text-yellow-400 font-medium">
                    {emp.first_name}
                  </span>
                  <span>{emp.telephone_number}</span>
                  <span className="text-purple-400">{emp.role_name}</span>
                  <span>{emp.date_joined.split("T")[0]}</span>
                  <span className="text-green-400 font-semibold">
                    ${Number(emp.salary).toLocaleString("es-CO")}
                  </span>

                  {emp.is_active ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEmpleadoEditar(emp);
                          setModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition"
                        aria-label={`Editar ${emp.first_name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          eliminarEmpleado(emp.id, emp.first_name, emp)
                        }
                        className="text-red-500 hover:text-red-400 transition"
                        aria-label={`Eliminar ${emp.first_name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setChangePassword(emp);
                          setModalPasswordOpen(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition"
                        aria-label={`Cambiar clave de ${emp.first_name}`}
                      >
                        <LockIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => activarEmpleado(emp.id, emp)}
                        className="text-green-500 hover:text-green-400 transition"
                        aria-label={`Activar ${emp.first_name}`}
                      >
                        <CheckIcon size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div className="md:hidden rounded-xl border border-yellow-500/20 bg-black/35 p-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-yellow-400 font-semibold text-base truncate">
                        {emp.first_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {emp.is_active ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                    <span className="text-green-400 font-semibold text-sm text-right">
                      ${Number(emp.salary).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-black/40 border border-yellow-500/10 px-2 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Teléfono
                      </p>
                      <p className="text-white break-all">
                        {emp.telephone_number}
                      </p>
                    </div>

                    <div className="rounded-lg bg-black/40 border border-yellow-500/10 px-2 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Oficio
                      </p>
                      <p className="text-purple-300">{emp.role_name}</p>
                    </div>

                    <div className="col-span-2 rounded-lg bg-black/40 border border-yellow-500/10 px-2 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Fecha ingreso
                      </p>
                      <p className="text-white">
                        {emp.date_joined.split("T")[0]}
                      </p>
                    </div>
                  </div>

                  {emp.is_active ? (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setEmpleadoEditar(emp);
                          setModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-blue-400/30 bg-blue-500/10 px-2 py-2 text-blue-300"
                        aria-label={`Editar ${emp.first_name}`}
                      >
                        <Pencil size={15} />
                        <span className="text-xs">Editar</span>
                      </button>

                      <button
                        onClick={() =>
                          eliminarEmpleado(emp.id, emp.first_name, emp)
                        }
                        className="flex items-center justify-center gap-1 rounded-lg border border-red-400/30 bg-red-500/10 px-2 py-2 text-red-300"
                        aria-label={`Eliminar ${emp.first_name}`}
                      >
                        <Trash2 size={15} />
                        <span className="text-xs">Eliminar</span>
                      </button>

                      <button
                        onClick={() => {
                          setChangePassword(emp);
                          setModalPasswordOpen(true);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-yellow-400/30 bg-yellow-500/10 px-2 py-2 text-yellow-300"
                        aria-label={`Cambiar clave de ${emp.first_name}`}
                      >
                        <LockIcon size={15} />
                        <span className="text-xs">Clave</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => activarEmpleado(emp.id, emp)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-green-300"
                      aria-label={`Activar ${emp.first_name}`}
                    >
                      <CheckIcon size={15} />
                      <span className="text-sm font-medium">
                        Activar empleado
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL */}
      <EditEmpleadosModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEmpleadoEditar(null);
        }}
        onSave={(message) => {
          setModalOpen(false);
          setEmpleadoEditar(null);
          setMensajeCreacion(message);
          setMostratAlertaCreacion(true);
        }}
        empleadoEditar={empleadoEditar}
        actualizarListaEmpleados={actualizarListaEmpleados}
      />

      <ChangePassword
        isOpen={modalPasswordOpen}
        onClose={() => {
          setModalPasswordOpen(false);
          setChangePassword(null);
        }}
        selectedEmployee={changePassword}
      />
    </motion.div>
  );
}
