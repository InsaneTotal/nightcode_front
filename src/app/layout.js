"use client";

import "./globals.css";
import { Twitter, Instagram, Facebook, LogOut, X, Menu } from "lucide-react";
import { AppProvider, useApp } from "../context/AppContext";
import { useState } from "react";
import Image from "next/image";

function LayoutContent({ children }) {
  const { empresa, usuario, cerrarSesion, tema } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleCloseMenu = () => setMenuOpen(false);

  return (
    <div
      className={
        tema === "dark" ? "bg-[#120815] min-h-screen" : "bg-white min-h-screen"
      }
    >
      {/* HEADER */}
      <header className="relative overflow-visible w-full bg-linear-to-r from-[#3a1f3f] to-[#1f1024] border-b border-yellow-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 md:px-8 py-4">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Logo + Nombre */}
          <div className="flex items-center gap-3 text-white">
            {empresa.logo ? (
              <Image
                src={empresa.logo}
                alt="Logo Empresa"
                width={20}
                height={20}
                className="w-14 h-14 object-cover rounded-md drop-shadow-[0_0_12px_rgba(255,193,7,0.6)]"
              />
            ) : (
              <div className="w-14 h-14 bg-yellow-400/20 rounded-md flex items-center justify-center text-yellow-400 font-bold">
                {empresa.nombre?.charAt(0)}
              </div>
            )}

            <span className="text-3xl font-semibold tracking-wide bg-linear-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              {empresa.nombre}
            </span>
          </div>

          {/* Usuario / Redes */}
          <div className="hidden md:flex items-center gap-6 text-yellow-400 ml-auto">
            {usuario ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white">{usuario.name}</p>
                  <p className="text-xs text-yellow-400/80 capitalize">
                    {usuario.role?.name}
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
          {/* Menú móvil */}
          <button
            className="md:hidden text-yellow-400 ml-auto mr-0.5"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`md:hidden absolute right-2 top-[calc(100%+8px)] z-50 w-[min(92vw,320px)] transition-all duration-300 ${
            menuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="rounded-xl border border-yellow-400/20 bg-[#0a0f2a] p-4 text-yellow-400">
            {usuario ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white">{usuario.name}</p>
                  <p className="text-xs text-yellow-400/80 capitalize">
                    {usuario.role?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    cerrarSesion();
                    handleCloseMenu();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition"
                >
                  <LogOut size={16} />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Twitter />
                <Instagram />
                <Facebook />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Línea animada */}
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

      {/* CONTENIDO */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="relative bg-linear-to-r from-[#1f1024] to-[#120815] border-t border-yellow-400/20 text-gray-300 pt-12 pb-6 px-8">
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-2xl font-semibold bg-linear-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
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
