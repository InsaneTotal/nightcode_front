"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const AppContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CURRENT_USER_URL = `${API_URL}/api/authusers/me/`;

function normalizeUsuario(userData) {
  if (!userData) return null;

  const roleId =
    userData.role?.id ??
    userData.role_id ??
    userData.id_role ??
    userData.rol?.id ??
    userData.rol_id ??
    "";

  const roleName =
    userData.role?.name ??
    userData.role_name ??
    userData.rol?.name ??
    userData.rol_name ??
    userData.rol ??
    "";

  const normalizedName =
    userData.name ??
    userData.nombre ??
    userData.username ??
    userData.email ??
    "";

  return {
    ...userData,
    name: normalizedName,
    nombre: normalizedName,
    role: {
      ...(userData.role || {}),
      id: roleId === null || roleId === undefined ? "" : String(roleId),
      name: roleName,
    },
    rol: roleName,
  };
}

export function AppProvider({ children }) {
  const [empresa, setEmpresa] = useState({
    nombre: "NightCode",
    razonSocial: "",
    nit: "",
    logo: "/imagen_apu.png",
  });

  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState("dark");
  const [cargado, setCargado] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuthStorage = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("id_role");
  };

  const loadCurrentUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
      setUsuario(null);
      setAuthLoading(false);
      return null;
    }

    setAuthLoading(true);

    try {
      const response = await authFetch(CURRENT_USER_URL);

      if (!response.ok) {
        throw new Error("No se pudo obtener el usuario autenticado.");
      }

      const data = await response.json();
      const normalizedUser = normalizeUsuario(data);

      setUsuario(normalizedUser);
      localStorage.setItem("usuario", JSON.stringify(normalizedUser));
      localStorage.setItem("id_role", normalizedUser?.role?.id || "");

      return normalizedUser;
    } catch (error) {
      console.error("Error cargando usuario autenticado:", error);
      setUsuario(null);
      clearAuthStorage();
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔥 Cargar datos guardados
  useEffect(() => {
    try {
      const empresaGuardada = localStorage.getItem("empresa");
      const usuarioGuardado = localStorage.getItem("usuario");
      const temaGuardado = localStorage.getItem("tema");

      if (empresaGuardada) setEmpresa(JSON.parse(empresaGuardada));
      if (usuarioGuardado)
        setUsuario(normalizeUsuario(JSON.parse(usuarioGuardado)));
      if (temaGuardado) setTema(temaGuardado);
    } catch (error) {
      console.error("Error cargando datos:", error);
      clearAuthStorage();
    }

    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    loadCurrentUser();
  }, [cargado]);

  // 🔥 Guardar automáticamente
  useEffect(() => {
    if (cargado) {
      localStorage.setItem("empresa", JSON.stringify(empresa));
      if (usuario) {
        localStorage.setItem("usuario", JSON.stringify(usuario));
      } else {
        localStorage.removeItem("usuario");
      }
      localStorage.setItem("tema", tema);
    }
  }, [empresa, usuario, tema, cargado]);

  const login = (datosUsuario) => {
    const normalizedUser = normalizeUsuario(datosUsuario);
    setUsuario(normalizedUser);
    localStorage.setItem("usuario", JSON.stringify(normalizedUser));
    localStorage.setItem("id_role", normalizedUser?.role?.id || "");
  };

  // 🚪 Cerrar sesión
  const cerrarSesion = () => {
    setUsuario(null);
    setAuthLoading(false);
    clearAuthStorage();
  };
  return (
    <AppContext.Provider
      value={{
        empresa,
        setEmpresa,
        usuario,
        setUsuario,
        login,
        loadCurrentUser,
        cerrarSesion,
        tema,
        setTema,
        authLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
