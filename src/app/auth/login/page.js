"use client";

import { useState } from "react";
import Image from "next/image";

export default function Login() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-[url('/img_fondo_bar.jpg')] bg-cover bg-center flex flex-col items-center pt-2 px-4 pb-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 items-center pt-2 px-4 rounded-2xl shadow-lg w-full max-w-6xl grid md:grid-cols-2 overflow-hidden">
        {/* LADO IZQUIERDO */}
        <div className="flex flex-col items-center justify-center p-10 text-white">
          <Image
            src="/logo_sinfondo.png"
            alt="Logo NightCode"
            width={400}
            height={401}
            className="rounded-md"
          />
          <h1 className="text-5xl items-center font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] pb-6">
            Bienvenido
          </h1>
          <p className="text-gray-300 text-center mb-12 max-w-md">
            Accede a NightCode y gestiona tu bar en tiempo real. Controla
            empleados, pedidos y ventas desde un solo lugar.
          </p>
        </div>

        {/* FORM LOGIN */}
        <div
          className="bg-gradient-to-br from-[#4b2c4f] to-[#2e1b30] 
          w-full max-w-lg rounded-[40px] 
          shadow-[0_0_40px_rgba(255,204,0,0.4)] 
          p-8 text-white mt-6"
        >
          <h2 className="text-yellow-500 text-2xl font-semibold mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form className="space-y-4">
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

            {/* BOTÓN */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-[#4b2c4f] border border-yellow-500 
                text-white px-8 py-2 rounded-full 
                hover:bg-yellow-500 hover:text-black 
                transition duration-300"
              >
                Ingresar
              </button>
            </div>

            {/* LINK REGISTER */}
            <p className="text-center text-sm text-gray-400 pt-4">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-yellow-400 hover:underline">
                Regístrate aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
