import { authFetch } from "../../../../utils/authFetch";

export async function fetchDocumentTypes() {
  try {
    const response = await authFetch(
      "http://localhost:8000/api/authusers/typedocuments/",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );
    if (!response.ok) {
      throw new Error("Error al obtener los tipos de documento.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
