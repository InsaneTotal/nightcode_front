"use client";

import { useState } from "react";
import Image from "next/image";

export default function Register() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-[url('/img_fondo_bar.jpg')] bg-cover bg-center flex flex-col items-center pt-2 px-4 pb-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 items-center pt-2 px-4 rounded-2xl shadow-lg w-full max-w-6xl grid md:grid-cols-2 overflow-hidden">
        <div className="flex flex-col items-center justify-center  p-10 text-white">
          <Image
            src="/logo_sinfondo.png"
            alt="Logo NightCode"
            width={400}
            height={400}
            className="rounded-md "
          />
          <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] pb-6">
            Bienvenido
          </h1>
          <p className="text-gray-300 text-center mb-12 max-w-md">
            registra tus empleados y controla tu bar de manera eficiente con
            NightCode, la plataforma inteligente para la gestión moderna de
            bares. Optimiza tu equipo y domina la noche.
          </p>
        </div>
        {/* FORM CARD */}
        <div
          className="bg-gradient-to-br from-[#4b2c4f] to-[#2e1b30] 
                      w-full max-w-lg rounded-[40px] 
                      shadow-[0_0_40px_rgba(255,204,0,0.4)] 
                      p-8 text-white mt-6"
        >
          <h2 className="text-yellow-500 text-2xl font-semibold mb-6 text-center col-span-2">
            Formulario de Registro
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
                <option value="1">Cédula</option>
                <option value="2">Tarjeta de Identidad</option>
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
                <option value="1">Administrador</option>
                <option value="2">Mesero</option>
                <option value="3">Empleado</option>
              </select>
            </div>

            {/* BOTÓN */}
            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-[#4b2c4f] border border-yellow-500 
                 text-white px-8 py-2 rounded-full 
                 hover:bg-yellow-500 hover:text-black 
                 transition duration-300"
              >
                Registrar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
