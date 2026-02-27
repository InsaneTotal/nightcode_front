async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("token");
  const response = await fetch(
    "http://localhost:8000/api/authusers/token/refresh/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    },
  );

  if (!response.ok) {
    throw new Error("Error al refrescar el token.");
  }

  const data = await response.json();
  if (data.access) {
    localStorage.setItem("token", data.access);
    return data.access;
  }
}

export async function authFetch(url, options = {}) {
  let token = localStorage.getItem("token");
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  let response = await fetch(url, options);
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      options.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, options);
    } catch (e) {
      throw new Error(
        "No se pudo refrescar el token. Por favor, inicia sesión nuevamente.",
      );
    }
  }
  return response;
}
