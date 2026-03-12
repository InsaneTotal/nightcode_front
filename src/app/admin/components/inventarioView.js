"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Pencil } from "lucide-react";
import { getInventory, updateInventory } from "../hooks/inventory";
import EditInventarioModal from "./editInventarioModal"; // 👈 IMPORT
import Image from "next/image";
import AddButton from "../../components/AddButton";

export default function InventarioView() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // mensaje de creación/actualización y visibilidad de alerta
  const [creationMessage, setCreationMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const inventoryData = await getInventory();
        setProducts(inventoryData);
      } catch (error) {
        console.error("Error loading inventory:", error);
      }
    };
    loadInventory();
  }, []);

  // oculta la alerta automáticamente después de unos segundos
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  // 🔥 Producto seleccionado para editar
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, products]);

  const cardStyle =
    "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-yellow-600/20 rounded-2xl p-6";

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-500">
          Inventario
        </h1>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-yellow-600/20 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
          />
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <AddButton
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
        />

        {/* alerta temporal */}
        {showAlert && (
          <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">
            {creationMessage}
          </div>
        )
        }
      </div>

      <div className="space-y-8">
        {products.map((product) => (
          <div
            key={product.id}
            className={`${cardStyle} flex flex-col md:flex-row md:items-center md:justify-between gap-6`}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-40 h-40 min-w-40 bg-zinc-900 border border-yellow-600/20 rounded-xl flex items-center justify-center p-2">
                <Image
                  src={product.url_img}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="object-contain max-w-full max-h-full"
                />
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-yellow-400 mb-3">
                  {product.name}
                </h2>

                <p className="text-sm text-gray-400 mb-2">
                  {product.description}
                </p>

                <p className="text-sm text-gray-400">
                  Cantidad:{" "}
                  <span
                    className={`font-semibold ${
                      product.amount <= 10 ? "text-red-500" : "text-white"
                    }`}
                  >
                    {product.amount}
                  </span>
                </p>

                <p className="text-sm text-gray-400">
                  Precio:{" "}
                  <span className="text-green-400 font-semibold">
                    ${Math.round(product.price).toLocaleString("es-CO")}
                  </span>
                </p>
              </div>
            </div>

            {/* 🔥 BOTÓN EDITAR */}
            <button
              onClick={() => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
              className="bg-zinc-900 border border-white/10 p-3 rounded-xl transition-colors hover:border-yellow-500"
            >
              <Pencil size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}

      <EditInventarioModal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedProduct(null);
          setIsModalOpen(false);
        }}
        onSave={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        selectedProduct={selectedProduct}
        // updateInventory={ShowUpdatedInventory}
      />
    </div>
  );
}
