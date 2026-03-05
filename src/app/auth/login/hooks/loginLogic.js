// loginLogic.js

export async function loginUser({ email, password }) {
  try {
    const response = await fetch("http://localhost:8000/api/authusers/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Credenciales inválidas o error de servidor.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}
