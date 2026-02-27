export async function fetchRoles() {
  try {
    const response = await fetch("http://localhost:8000/api/authusers/roles/", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los roles.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
