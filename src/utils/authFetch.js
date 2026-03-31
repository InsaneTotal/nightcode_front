import { buildApiUrl, fetchWithTimeout } from "./networkConfig";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("No hay refresh token. Inicia sesión nuevamente.");
  }

  const response = await fetchWithTimeout(buildApiUrl("/api/authusers/token/refresh/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    let errorMsg = "Error al refrescar el token.";
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();

  if (data.access) {
    localStorage.setItem("accessToken", data.access);
    return data.access;
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error(
      "No se recibió un nuevo access token. Inicia sesión nuevamente.",
    );
  }
}

export async function authFetch(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  options.headers = {
    ...(options.headers || {}),
  };

  if (token) {
    options.headers.Authorization = "Bearer " + token;
  }

  let response = await fetchWithTimeout(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    // Si no hay refreshToken, es usuario invitado (QR sin sesión)
    if (!refreshToken) {
      return response; // Retorna 401 sin intentar refrescar
    }

    try {
      token = await refreshAccessToken();
      options.headers.Authorization = "Bearer " + token;
      response = await fetchWithTimeout(url, options);
    } catch (e) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error(
        e.message || "No se pudo refrescar el token. Inicia sesión nuevamente.",
      );
    }
  }

  return response;
}
