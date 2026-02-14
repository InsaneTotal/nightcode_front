"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function MenuLicores() {
  const [openSection, setOpenSection] = useState("cervezas");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: "cervezas",
      title: "Cervezas",
      image: "/cervezas/poker.png",
      name: "POKER",
      description:
        "¡Destapa la amistad con Cerveza Poker! La lager colombiana por excelencia con el balance perfecto entre amargor y suavidad.",
    },
    {
      id: "wiskey",
      title: "Wiskey",
      image: "/licores/jack.png",
      name: "Jack Daniel's",
      description:
        "Whiskey americano con notas ahumadas y sabor intenso, perfecto para la noche.",
    },
    {
      id: "aguardiente",
      title: "Aguardiente",
      image: "/licores/aguardiente.png",
      name: "Aguardiente Antioqueño",
      description:
        "Tradicional aguardiente colombiano con sabor anisado suave y refrescante.",
    },
    {
      id: "ron",
      title: "Ron",
      image: "/licores/ron.png",
      name: "Ron Medellín",
      description:
        "Ron añejo con notas dulces y acarameladas ideal para compartir.",
    },
    {
      id: "otros",
      title: "Otros",
      image: "/licores/vodka.png",
      name: "Absolut Vodka",
      description:
        "Vodka premium de sabor limpio y suave, perfecto para cocteles.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* PUBLICIDAD */}
        <div className="h-40 flex items-center justify-center">
          <h2 className="text-4xl tracking-widest text-gray-300">PUBLICIDAD</h2>
        </div>
        {/* MENU TITULO */}
        <div className="text-center py-3 border-b border-yellow-600">
          <h3 className="text-yellow-500 text-lg tracking-widest">MENU</h3>
        </div>
        {/* SECCIONES */}
        <div className="space-y-4 mt-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl overflow-hidden
                         bg-gradient-to-r from-[#3a1f3f] to-[#1f1024]
                         shadow-[0_10px_30px_rgba(0,0,0,0.6)]
                         transition-all duration-300"
            >
              {/* BOTÓN */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex justify-between items-center px-6 py-5
                            transition-all duration-300
                            ${
                              openSection === section.id
                                ? "bg-black"
                                : "bg-transparent hover:bg-white/5"
                            }`}
              >
                <span className="text-white text-lg tracking-wide font-medium">
                  {section.title}
                </span>

                <ChevronDown
                  className={`transition-all duration-300 ${
                    openSection === section.id
                      ? "rotate-180 text-yellow-400"
                      : "text-yellow-500"
                  }`}
                />
              </button>

              {/* CONTENIDO */}
              {openSection === section.id && (
                <div className="bg-[#0f0f0f] p-6 animate-fadeIn">
                  <div
                    className="flex gap-6 p-5 rounded-xl
                                  bg-[#141414]
                                  shadow-[0_0_40px_rgba(255,193,7,0.08)]"
                  >
                    {/* IMAGEN */}
                    <div className="relative w-28 h-40 animate-[float_3s_ease-in-out_infinite]">
                      <Image
                        src={section.image}
                        alt={section.name}
                        fill
                        className="object-contain drop-shadow-[0_0_25px_rgba(255,204,0,0.6)]"
                      />
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div>
                      <h4 className="text-yellow-500 font-semibold mb-2">
                        {section.name}
                      </h4>
                      <p className="text-sm text-gray-300">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BOTÓN LLAMAR MESERO */}
        <div className="mt-8 mb-6 flex justify-center">
          <button
            className="max-w-72 px-10 py-4 rounded-2xl 
                       bg-gradient-to-r from-yellow-400 to-yellow-200
                       text-black font-bold text-lg tracking-wide
                       shadow-[0_0_30px_rgba(255,193,7,0.5)]
                       hover:scale-105 hover:shadow-[0_0_40px_rgba(255,193,7,0.7)]
                       transition duration-300"
          >
            📞 Llamar mesero
          </button>
        </div>
      </div>
      {/* FOOTER */}
      {/* BARRA INFERIOR ESTILO HEADER */}
      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        {/* Línea dorada animada */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

        <div
          className="relative overflow-hidden w-full
               bg-gradient-to-r from-[#3a1f3f] to-[#1f1024]
               border-t border-yellow-400/30
               shadow-[0_-10px_30px_rgba(0,0,0,0.6)]
               flex
               before:absolute before:inset-0 
               before:bg-[radial-gradient(circle_at_80%_50%,rgba(255,193,7,0.08),transparent_40%)] 
               before:pointer-events-none"
        >
          {/* MITAD IZQUIERDA */}
          <div
            className="w-1/2 text-center py-6
                 text-yellow-400 font-medium tracking-wide
                 hover:bg-yellow-400 hover:text-black
                 transition duration-300 cursor-pointer"
          >
            🎵 Escucha tu música
          </div>

          {/* Separador */}
          <div className="w-px bg-yellow-400/20"></div>

          {/* MITAD DERECHA */}
          <div
            className="w-1/2 text-center py-6
                 text-yellow-400 font-medium tracking-wide
                 hover:bg-yellow-400 hover:text-black
                 transition duration-300 cursor-pointer"
          >
            📖 Menú
          </div>
        </div>
      </div>
    </div>
  );
}
