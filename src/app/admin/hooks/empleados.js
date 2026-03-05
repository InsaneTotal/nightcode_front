export async function createEmpleado(user) {
  try {
    const response = await fetch("http://localhost:8000/api/authusers/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Error al guardar el usuario.");
    }
    const message = {
      process: "Empleado creado",
      message: "Usuario creado exitosamente",
    };
    return message;
  } catch (error) {
    throw error;
  }
}

export async function updateEmpleado(id, user) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/authusers/users/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario.");
    }

    const message = {
      process: "Empleado actualizado",
      message: "Usuario actualizado exitosamente",
    };
    return message;
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

export async function deleteEmpleado(id, empleado) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/authusers/users/${id}/deactivate/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...empleado, is_active: false }),
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar el empleado.");
    }
  } catch (error) {
    throw error;
  }
}
