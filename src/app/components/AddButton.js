import { Plus } from "lucide-react";
export default function AddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm font-medium transition"
    >
      <Plus size={18} />
      Agregar
    </button>
  );
}
