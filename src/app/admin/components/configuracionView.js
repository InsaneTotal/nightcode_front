"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Shield, Settings2, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import LogoutButton from "../../components/LogoutButton";

export default function ConfiguracionView() {
  const router = useRouter();
  const { empresa, setEmpresa } = useApp();

  const [form, setForm] = useState(empresa);
  const [password, setPassword] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const handleSaveCompany = () => {
    setEmpresa(form);
  };

  const handleChangePassword = () => {
    if (password.nueva !== password.confirmar) return;
    setPassword({ actual: "", nueva: "", confirmar: "" });
  };

  return (
    <div className="w-full h-full bg-[#0f172a] text-white p-8 overflow-y-auto">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-semibold">Configuración</h1>
        <p className="text-gray-400 mt-2">
          Administra los datos generales y preferencias del sistema.
        </p>
      </motion.div>

      <div className="grid xl:grid-cols-2 gap-8">
        {/* ================= EMPRESA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={22} />
            <h2 className="text-xl font-medium">Información de la Empresa</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre Comercial"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#111827] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />

            <input
              type="text"
              placeholder="Razón Social"
              value={form.razonSocial}
              onChange={(e) =>
                setForm({ ...form, razonSocial: e.target.value })
              }
              className="w-full bg-[#111827] p-3 rounded-xl focus:ring-2 focus:ring-yellow-500"
            />

            <input
              type="text"
              placeholder="NIT"
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
              className="w-full bg-[#111827] p-3 rounded-xl focus:ring-2 focus:ring-yellow-500"
            />

            {/* LOGO */}
            <div>
              <label className="text-sm text-gray-400">
                Logo de la empresa
              </label>

              <div className="flex items-center gap-4 mt-3">
                <Image
                  src={form.logo}
                  alt="Logo"
                  width={14}
                  height={14}
                  className="w-14 h-14 object-contain bg-[#111827] rounded-xl p-2"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({
                        ...form,
                        logo: reader.result,
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveCompany}
              className="flex items-center justify-center gap-2 bg-yellow-500 text-black font-semibold py-2 rounded-xl mt-4"
            >
              <Save size={18} />
              Guardar Cambios
            </motion.button>
          </div>
        </motion.div>

        {/* ================= SEGURIDAD ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield size={22} />
            <h2 className="text-xl font-medium">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={password.actual}
              onChange={(e) =>
                setPassword({ ...password, actual: e.target.value })
              }
              className="w-full bg-[#111827] p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password.nueva}
              onChange={(e) =>
                setPassword({ ...password, nueva: e.target.value })
              }
              className="w-full bg-[#111827] p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={password.confirmar}
              onChange={(e) =>
                setPassword({ ...password, confirmar: e.target.value })
              }
              className="w-full bg-[#111827] p-3 rounded-xl"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleChangePassword}
              className="bg-blue-500 hover:bg-blue-600 transition py-2 rounded-xl mt-4"
            >
              Actualizar Contraseña
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ================= PREFERENCIAS ================= */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-lg mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings2 size={22} />
          <h2 className="text-xl font-medium">Preferencias del Sistema</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div className="bg-[#111827] p-4 rounded-xl">
            Moneda predeterminada
          </div>
          <div className="bg-[#111827] p-4 rounded-xl">Zona horaria</div>
          <div className="bg-[#111827] p-4 rounded-xl">
            Impuestos configurados
          </div>
          <div className="bg-[#111827] p-4 rounded-xl">Gestión de roles</div>
        </div>
      </motion.div>

      {/* ================= SESIÓN ================= */}
      <LogoutButton />
    </div>
  );
}
