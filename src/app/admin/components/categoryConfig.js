import { useState, useEffect } from "react";
import { getCategories } from "../hooks/inventory";

export default function CATEGORY_CONFIG() {
  return (
    <div>
      <div className="space-y-8">Inventario</div>
    </div>
  );
}

// export const normalizeCategory = (raw) => {
// if (!raw) return "otros";
// const value = raw.toLowerCase().trim();
// return CATEGORY_CONFIG[value] ? value : "otros";
// };

// export const getCategoryLabel = (key) =>
// CATEGORY_CONFIG[key]?.label ?? "Otros";
// // // inventoryGrouping.js
// import { CATEGORY_CONFIG, normalizeCategory, getCategoryLabel } from "./categoriesConfig";

// export function buildInventoryGroups(items, options = {}) {
// const {
// search = "",
// onlyActive = false,
// lowStockThreshold = null,
// hideEmptyCategories = true,
// } = options;

// const searchText = search.toLowerCase().trim();

// // 1) Filtrar primero
// const filtered = items.filter((item) => {
// const matchSearch =
// !searchText ||
// item.name?.toLowerCase().includes(searchText) ||
// item.category?.toLowerCase().includes(searchText);

// const matchActive = !onlyActive || item.active === true;

// const matchLowStock =
// lowStockThreshold == null || (item.stock ?? 0) <= lowStockThreshold;

// return matchSearch && matchActive && matchLowStock;
// });

// // 2) Agrupar por categoria normalizada
// const map = new Map();

// for (const item of filtered) {
// const categoryKey = normalizeCategory(item.category);

// if (!map.has(categoryKey)) {
// map.set(categoryKey, {
// key: categoryKey,
// label: getCategoryLabel(categoryKey),
// order: CATEGORY_CONFIG[categoryKey]?.order ?? 999,
// items: [],
// });
// }

// map.get(categoryKey).items.push(item);
// }

// // 3) Ordenar items dentro de cada categoria
// for (const group of map.values()) {
// group.items.sort((a, b) => a.name.localeCompare(b.name));
// }

// // 4) Convertir a array y ordenar categorias
// let groups = Array.from(map.values()).sort((a, b) => a.order - b.order);

// // 5) Mostrar categorias vacias si quieres estructura fija
// if (!hideEmptyCategories) {
// const allKeys = Object.keys(CATEGORY_CONFIG);
// const existing = new Set(groups.map((g) => g.key));

// for (const key of allKeys) {
// if (!existing.has(key)) {
// groups.push({
// key,
// label: getCategoryLabel(key),
// order: CATEGORY_CONFIG[key].order,
// items: [],
// });
// }
// }

// groups.sort((a, b) => a.order - b.order);
// }

// return groups;
// }

// CategoryAccordion.jsx
// import { ChevronDown } from "lucide-react";

// export default function CategoryAccordion({
// title,
// count,
// isOpen,
// onToggle,
// children,
// }) {
// return (
// <section className="border rounded-xl overflow-hidden bg-white">
// <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition" >
// <div className="flex items-center gap-3">
// <h3 className="font-semibold text-gray-800">{title}</h3>
// <span className="text-sm px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
// {count}
// </span>
// </div>

// <ChevronDown
// className={transition-transform ${isOpen ? "rotate-180" : ""}}
// size={18}
// />
// </button>

// {isOpen && <div className="p-4 space-y-3">{children}</div>}
// </section>
// );
// }

// // InventarioView.jsx (ejemplo de integracion)
// import { useMemo, useState } from "react";
// import CategoryAccordion from "./CategoryAccordion";
// import { buildInventoryGroups } from "../utils/inventoryGrouping";

// export default function InventarioView({ beverages }) {
// const [search, setSearch] = useState("");
// const [openKeys, setOpenKeys] = useState(new Set()); // categorias abiertas

// const groups = useMemo(() => {
// return buildInventoryGroups(beverages, {
// search,
// onlyActive: false,
// lowStockThreshold: null,
// hideEmptyCategories: true,
// });
// }, [beverages, search]);

// // Abrir automaticamente primera categoria cuando haya resultados y nada abierto
// useMemo(() => {
// if (groups.length > 0 && openKeys.size === 0) {
// setOpenKeys(new Set([groups[0].key]));
// }
// }, [groups, openKeys.size]);

// const toggleCategory = (key) => {
// setOpenKeys((prev) => {
// const next = new Set(prev);
// if (next.has(key)) next.delete(key);
// else next.add(key); // multiplo abierto
// return next;
// });
// };

// return (
// <div className="space-y-4">
// <div>
// <input
// value={search}
// onChange={(e) => setSearch(e.target.value)}
// placeholder="Buscar bebida o categoria..."
// className="w-full border rounded-lg px-3 py-2"
// />
// </div>

// {groups.length === 0 && (
// <p className="text-gray-500">No hay bebidas para mostrar.</p>
// )}

// {groups.map((group) => (
// <CategoryAccordion
// key={group.key}
// title={group.label}
// count={group.items.length}
// isOpen={openKeys.has(group.key)}
// onToggle={() => toggleCategory(group.key)}
// >
// {group.items.map((item) => (
// <article key={item.id} className="border rounded-lg p-3 flex items-center justify-between" >
// <div>
// <p className="font-medium text-gray-800">{item.name}</p>
// <p className="text-sm text-gray-500">
// Stock: {item.stock} | Precio: ${item.price}
// </p>
// </div>

// <div className="flex gap-2">
// <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm">
// Editar
// </button>
// <button className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">
// Eliminar
// </button>
// </div>
// </article>
// ))}
// </CategoryAccordion>
// ))}
// </div>
// );
// }

// Notas rápidas para que no falle en tu caso real:

// Si en tu backend la categoría viene como tipo Bebidas, cerveza, Cerveza, etc., sí o sí normalízala.
// Haz la búsqueda antes de agrupar para que cada acordeón muestre solo resultados relevantes.
// Si prefieres que solo un acordeón esté abierto a la vez, en toggleCategory cierras todos y abres solo uno.
// Si quieres, en el siguiente mensaje te doy la misma estructura pero adaptada exactamente a tus nombres actuales de propiedades del inventario (los que ya trae tu API).
