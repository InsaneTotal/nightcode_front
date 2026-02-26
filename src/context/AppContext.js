"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

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

  // 🔥 Cargar datos guardados
  useEffect(() => {
    try {
      const empresaGuardada = localStorage.getItem("empresa");
      const usuarioGuardado = localStorage.getItem("usuario");
      const temaGuardado = localStorage.getItem("tema");

      if (empresaGuardada) setEmpresa(JSON.parse(empresaGuardada));
      if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
      if (temaGuardado) setTema(temaGuardado);
    } catch (error) {
      console.error("Error cargando datos:", error);
      localStorage.clear();
    }

    setCargado(true);
  }, []);

  // 🔥 Guardar automáticamente
  useEffect(() => {
    if (cargado) {
      localStorage.setItem("empresa", JSON.stringify(empresa));
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("tema", tema);
    }
  }, [empresa, usuario, tema, cargado]);

  // 🔐 Login simulado
  const login = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  // 🚪 Cerrar sesión
  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };
  return (
    <AppContext.Provider
      value={{
        empresa,
        setEmpresa,
        usuario,
        setUsuario,
        login,
        cerrarSesion,
        tema,
        setTema,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
