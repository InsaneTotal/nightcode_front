import { authFetch } from "../../../../utils/authFetch";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getDrinks() {
  const response = await authFetch(
    `${API_URL}/api/authinventory/drinks/`,
  );

  if (!response.ok) {
    throw new Error("Error cargando bebidas");
  }

  return await response.json();
}
