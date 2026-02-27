import { authFetch } from "../../../utils/authFetch";

export async function fetchRoles() {
  try {
    const response = await authFetch(
      "http://localhost:8000/api/authusers/roles/",
    );

    if (!response.ok) {
      throw new Error("Error al obtener los roles.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
