import { authFetch } from "../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createEmpleado(user) {
  try {
    const response = await authFetch(`${API_URL}/api/authusers/users/`, {
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
    const response = await authFetch(`${API_URL}/api/authusers/users/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

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
    const response = await authFetch(`${API_URL}/api/authusers/users/`);
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
    const response = await authFetch(
      `${API_URL}/api/authusers/users/${id}/deactivate/`,
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

export async function activateEmpleado(id, empleado) {
  try {
    const response = await authFetch(
      `${API_URL}/api/authusers/users/${id}/activate/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...empleado, is_active: true }),
      },
    );
    if (!response.ok) {
      throw new Error("Error al activar el empleado.");
    }
  } catch (error) {
    throw error;
  }
}

export async function changePassword(id, newPassword, confirmPassword) {
  try {
    const response = await authFetch(
      `${API_URL}/api/authusers/users/${id}/change-password/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
          confirm_password: confirmPassword,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || "Error al cambiar la contraseña.";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const successMessage = data.message || "Contraseña cambiada exitosamente.";
    return successMessage;
  } catch (error) {
    throw error;
  }
}
