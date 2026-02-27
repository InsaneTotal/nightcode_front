"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Pencil, Trash2, Users, DollarSign } from "lucide-react";
import EditEmpleadosModal from "./EditEmpleadosModal";
import Swal from "sweetalert2";
import { getEmpleados } from "../hooks/empleados";

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const totalNomina = 15500;
  // const totalNomina = useMemo(() => {
  //   return empleados.reduce((acc, emp) => acc + Number(emp.salario), 0);
  // }, [empleados]);

  const cardStyle =
    "bg-gradient-to-br from-black via-[#050816] to-[#0a0f2a] border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300";

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

      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            setEmpleados((prev) => prev.filter((emp) => emp.id !== id));
            resolve();
          }, 1000);
        });
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
      }
    });
  };

  // const guardarEmpleado = (nuevoEmpleado) => {
  //   if (empleadoEditar) {
  //     // EDITAR
  //     setEmpleados((prev) =>
  //       prev.map((emp) =>
  //         emp.id === empleadoEditar.id ? { ...emp, ...nuevoEmpleado } : emp,
  //       ),
  //     );
  //   } else {
  //     // AGREGAR
  //     setEmpleados((prev) => [
  //       ...prev,
  //       {
  //         ...nuevoEmpleado,
  //         id: Date.now(),
  //         salario: Number(nuevoEmpleado.salario),
  //       },
  //     ]);
  //   }

  //   setModalOpen(false);
  //   setEmpleadoEditar(null);
  // };

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const result = await getEmpleados();
        setEmpleados(result);
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

        <button
          onClick={() => {
            setEmpleadoEditar(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          <UserPlus size={18} />
          Agregar
        </button>
      </div>

      {/* CARDS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className={cardStyle}>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Users size={16} />
            Total Empleados
          </p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {empleados.length}
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
      <div className={cardStyle}>
        <div className="grid grid-cols-6 text-gray-400 border-b border-yellow-500/30 pb-4 mb-4 text-sm">
          <span>Empleado</span>
          <span>Teléfono</span>
          <span>Oficio</span>
          <span>Fecha</span>
          <span>Salario</span>
          <span>Acciones</span>
        </div>

        {empleados.map((emp) => (
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
              ${Number(emp.salario).toLocaleString("es-CO")}
            </span>

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
                onClick={() => eliminarEmpleado(emp.id, emp.first_name)}
                className="text-red-500 hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <EditEmpleadosModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEmpleadoEditar(null);
        }}
        empleadoEditar={empleadoEditar}
      />
    </motion.div>
  );
}
