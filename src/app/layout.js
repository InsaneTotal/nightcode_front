import "./globals.css";
import Image from "next/image";
import { Twitter, Instagram, Facebook } from "lucide-react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="relative overflow-hiddenw-full bg-gradient-to-r from-[#3a1f3f] to-[#1f1024] border-b border-yellow-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex justify-between items-center px-8 py-4 before:absolute  before:inset-0 before:bg-[radial-gradient(circle_at_20%_50%,rgba(255,193,7,0.08),transparent_40%)] before:pointer-events-none">
          <div className="flex items-center gap-3 text-white">
            <Image
              src="/imagen_apu.png"
              alt="Logo Apu's Bar"
              width={60}
              height={60}
              className="rounded-md drop-shadow-[0_0_12px_rgba(255,193,7,0.6)]"
            />
            <span className="text-3xl font-semibold tracking-wide bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Apu's Bar
            </span>
          </div>

          <div className="flex gap-4 text-yellow-500">
            <Twitter className="hover:scale-110 transition cursor-pointer" />
            <Instagram className="hover:scale-110 transition cursor-pointer" />
            <Facebook className="hover:scale-110 transition cursor-pointer" />
          </div>
        </header>
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

        {children}

        <footer className=" relative bg-gradient-to-r from-[#1f1024] to-[#120815] border-t border-yellow-400/20 text-gray-300 pt-12 pb-6 px-8 overflow-hidden">
          {/* Glow decorativo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,193,7,0.08),transparent_60%)] pointer-events-none"></div>

          <div className="relative max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
            {/* Columna 1 */}
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                NightCode
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                Plataforma inteligente para la gestión moderna de bares.
                Optimiza tu equipo y domina la noche.
              </p>
            </div>

            {/* Columna 2 */}
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

            {/* Columna 3 */}
            <div>
              <h3 className="text-yellow-400 font-medium mb-3">Síguenos</h3>
              <div className="flex gap-4 text-yellow-400">
                <Twitter className="hover:scale-110 hover:text-yellow-300 transition cursor-pointer" />
                <Instagram className="hover:scale-110 hover:text-yellow-300 transition cursor-pointer" />
                <Facebook className="hover:scale-110 hover:text-yellow-300 transition cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Línea inferior */}
          <div className="relative mt-10 border-t border-yellow-400/10 pt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} NightCode. Todos los derechos
            reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}
