"use client";

import "./globals.css";
import { Twitter, Instagram, Facebook, LogOut } from "lucide-react";
import { AppProvider, useApp } from "../context/AppContext";

function LayoutContent({ children }) {
  const { empresa, usuario, cerrarSesion, tema } = useApp();

  return (
    <div
      className={
        tema === "dark" ? "bg-[#120815] min-h-screen" : "bg-white min-h-screen"
      }
    >
      {/* HEADER */}
      <header className="relative overflow-hidden w-full bg-gradient-to-r from-[#3a1f3f] to-[#1f1024] border-b border-yellow-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex justify-between items-center px-8 py-4">
        {/* Logo + Nombre */}
        <div className="flex items-center gap-3 text-white">
          {empresa.logo ? (
            <img
              src={empresa.logo}
              alt="Logo Empresa"
              className="w-14 h-14 object-cover rounded-md drop-shadow-[0_0_12px_rgba(255,193,7,0.6)]"
            />
          ) : (
            <div className="w-14 h-14 bg-yellow-400/20 rounded-md flex items-center justify-center text-yellow-400 font-bold">
              {empresa.nombre?.charAt(0)}
            </div>
          )}

          <span className="text-3xl font-semibold tracking-wide bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            {empresa.nombre}
          </span>
        </div>

        {/* Usuario / Redes */}
        <div className="flex items-center gap-6 text-yellow-400">
          {usuario ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white">{usuario.nombre}</p>
                <p className="text-xs text-yellow-400/80 capitalize">
                  {usuario.rol}
                </p>
              </div>

              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 px-3 py-1 border border-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Twitter className="hover:scale-110 transition cursor-pointer" />
              <Instagram className="hover:scale-110 transition cursor-pointer" />
              <Facebook className="hover:scale-110 transition cursor-pointer" />
            </div>
          )}
        </div>
      </header>

      {/* Línea animada */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

      {/* CONTENIDO */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-r from-[#1f1024] to-[#120815] border-t border-yellow-400/20 text-gray-300 pt-12 pb-6 px-8">
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              NightCode
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Plataforma inteligente para la gestión moderna de bares. Optimiza
              tu equipo y domina la noche.
            </p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-medium mb-3">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-yellow-400 transition cursor-pointer">
                Inicio
              </li>
              <li className="hover:text-yellow-400 transition cursor-pointer">
                Registro
              </li>
              <li className="hover:text-yellow-400 transition cursor-pointer">
                Contacto
              </li>
              <li className="hover:text-yellow-400 transition cursor-pointer">
                Términos
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-yellow-400 font-medium mb-3">Síguenos</h3>
            <div className="flex gap-4 text-yellow-400">
              <Twitter className="hover:scale-110 transition cursor-pointer" />
              <Instagram className="hover:scale-110 transition cursor-pointer" />
              <Facebook className="hover:scale-110 transition cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="relative mt-10 border-t border-yellow-400/10 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {empresa.nombre}. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
