import { authFetch } from "../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchRoles() {
  try {
    const response = await authFetch(
      `${API_URL}/api/authusers/roles/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
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
