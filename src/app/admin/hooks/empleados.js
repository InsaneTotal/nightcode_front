export async function createEmpleado(user) {
  try {
    const responde = await fetch("http://localhost:8000/api/authusers/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!responde.ok) {
      throw new Error("Error al guardar el usuario.");
    }

    const data = await responde.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateEmpleado(id, user) {
  try {
    const responde = await fetch(
      `http://localhost:8000/api/authusers/users/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function getEmpleados() {
  try {
    const response = await fetch("http://localhost:8000/api/authusers/users/");
    if (!response.ok) {
      throw new Error("Error al obtener los empleados.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
