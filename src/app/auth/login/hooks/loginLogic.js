// loginLogic.js

export async function loginUser({ email, password }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${API_URL}/api/authusers/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
