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
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 tracking-wide">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className={cardStyle}>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Users size={16} />
            Total Empleados
          </p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {empleadosActivos.length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <DollarSign size={16} />
            Nómina Total
          </p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ${totalNomina.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* TABLA */}
      <div className={`${cardStyle} `}>
        <div className="grid grid-cols-6 text-gray-400 border-b border-yellow-500/30 pb-4 mb-4 text-sm">
          <span>Empleado</span>
          <span>Teléfono</span>
          <span>Oficio</span>
          <span>Fecha Ingreso</span>
          <span>Salario</span>
          <span>Acciones</span>
        </div>
        <div className="overflow-y-auto max-h-75 scroll-table">
          {empleados
            .slice()
            .sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))
            .map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-6 py-4 border-b border-yellow-500/10 text-sm hover:bg-white/5 transition-colors"
              >
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
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        eliminarEmpleado(emp.id, emp.first_name, emp)
                      }
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setChangePassword(emp);
                        setModalPasswordOpen(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      <LockIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => activarEmpleado(emp.id, emp)}
                      className="text-green-500 hover:text-green-400 transition"
                    >
                      <CheckIcon size={16} />
                    </button>
                  </div>
                )}
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
    </motion.div>
  );
}
