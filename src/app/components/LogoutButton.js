import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("id_role");
    router.push("/auth/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-lg mt-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <LogOut size={22} />
        <h2 className="text-xl font-medium">Sesión</h2>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 transition py-3 px-8 rounded-xl font-semibold"
      >
        Cerrar Sesión
      </motion.button>
    </motion.div>
  );
}
