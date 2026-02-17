"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuLicores() {
  const [openSection, setOpenSection] = useState("cervezas");
  const [currentAd, setCurrentAd] = useState(0);

  const ads = ["/ads/ad6.png", "/ads/ad8.png", "/ads/ad7.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        "¡Destapa la amistad con Cerveza Poker! Lager colombiana con balance perfecto entre amargor y suavidad.",
    },
    {
      id: "wiskey",
      title: "Wiskey",
      image: "/licores/jack.png",
      name: "Jack Daniel's",
      description: "Whiskey americano con notas ahumadas y sabor intenso.",
    },
    {
      id: "aguardiente",
      title: "Aguardiente",
      image: "/licores/aguardiente.png",
      name: "Aguardiente Antioqueño",
      description:
        "Tradicional aguardiente colombiano con sabor anisado suave.",
    },
    {
      id: "ron",
      title: "Ron",
      image: "/licores/ron.png",
      name: "Ron Medellín",
      description: "Ron añejo con notas dulces ideal para compartir.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-black text-white pb-32 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 🔥 SLIDER PREMIUM */}
        <div className="relative h-48 rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={ads[currentAd]}
                alt="Publicidad"
                fill
                className=""
                priority
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/40" />

          {/* Indicadores */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-6 rounded-full transition-all ${
                  currentAd === index ? "bg-yellow-400 w-10" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* TITULO */}
        <h2 className="text-center text-yellow-400 tracking-widest text-lg">
          MENÚ DIGITAL
        </h2>

        {/* 🔥 SECCIONES MEJORADAS */}
        <div className="space-y-4">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-yellow-400/20
                         bg-white/5 backdrop-blur-xl
                         shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex justify-between items-center px-5 py-5"
              >
                <span className="text-lg font-semibold">{section.title}</span>

                <motion.div
                  animate={{
                    rotate: openSection === section.id ? 180 : 0,
                  }}
                >
                  <ChevronDown size={22} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-yellow-400/20 px-5 py-6 flex gap-5 items-center">
                      {/* Imagen flotante */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                        className="relative w-24 h-36"
                      >
                        <Image
                          src={section.image}
                          alt={section.name}
                          fill
                          className="object-contain drop-shadow-[0_0_25px_rgba(255,193,7,0.6)]"
                        />
                      </motion.div>

                      <div>
                        <h4 className="text-yellow-400 font-bold mb-2">
                          {section.name}
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* 🔥 BOTÓN PREMIUM */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-2xl 
                     bg-yellow-500 text-black font-bold tracking-wide
                     shadow-[0_0_25px_rgba(255,193,7,0.5)]"
        >
          📞 Llamar mesero
        </motion.button>
      </div>

      {/* 🔥 FOOTER MEJORADO */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-yellow-400/20 flex">
        <div className="w-1/2 py-4 text-center text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
          🎵 Música
        </div>
        <div className="w-px bg-yellow-400/20"></div>
        <div className="w-1/2 py-4 text-center text-yellow-400 hover:bg-yellow-500 hover:text-black transition">
          📖 Menú
        </div>
      </div>
    </div>
  );
}
