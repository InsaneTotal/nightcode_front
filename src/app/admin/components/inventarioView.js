"use client";

import { useState, useMemo } from "react";
import { Search, Pencil } from "lucide-react";
import EditInventarioModal from "./editInventarioModal"; // 👈 IMPORT

export default function InventarioView() {
  const [search, setSearch] = useState("");

  // 🔥 Ahora products es estado (antes era const normal)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Poker Pipona",
      quantity: 6,
      price: 5600,
      image: "/cervezas/poker.png",
      description: "Cerveza Poker Pipona 500ml",
    },
    {
      id: 2,
      name: "Cerveza Poker Vidrio",
      quantity: 180,
      price: 3500,
      image: "/cervezas/cerveza_poker_vidrio.jpg",
      description: "Cerveza Poker Vidrio 500ml",
    },
    {
      id: 3,
      name: "Cerveza Heineken",
      quantity: 120,
      price: 4200,
      image: "/heineken.png",
      description: "Cerveza Heineken 500ml",
    },
  ]);

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
      </div>

      <div className="space-y-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`${cardStyle} flex flex-col md:flex-row md:items-center md:justify-between gap-6`}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-40 h-48 bg-zinc-900 border border-yellow-600/20 rounded-xl flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-40 object-contain"
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
                      product.quantity <= 10 ? "text-red-500" : "text-white"
                    }`}
                  >
                    {product.quantity}
                  </span>
                </p>

                <p className="text-sm text-gray-400">
                  Precio:{" "}
                  <span className="text-green-400 font-semibold">
                    ${product.price.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* 🔥 BOTÓN EDITAR */}
            <button
              onClick={() => setSelectedProduct(product)}
              className="bg-zinc-900 border border-white/10 p-3 rounded-xl transition-colors hover:border-yellow-500"
            >
              <Pencil size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {selectedProduct && (
        <EditInventarioModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === updatedProduct.id ? updatedProduct : p,
              ),
            );
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
