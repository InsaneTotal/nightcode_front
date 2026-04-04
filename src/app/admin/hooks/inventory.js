import { authFetch } from "../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getInventory() {
  const response = await authFetch(`${API_URL}/api/authinventory/drinks/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }

  const data = await response.json();
  return data;
}

export async function updateInventory(id, updatedData) {
  const response = await authFetch(
    `${API_URL}/api/authinventory/drinks/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(updatedData),
    },
  );

  if (!response.ok) {
    let errorText = "Failed to update inventory";
    try {
      const errData = await response.json();
      console.error("inventory update error response", errData);
      errorText = errData.detail || JSON.stringify(errData);
    } catch (e) {
      console.error("error parsing inventory error body", e);
    }
    throw new Error(errorText);
  }

  const res = { message: "Producto actualizado con exito" };
  return res;
}

export async function createInventory(drinkData) {
  const response = await authFetch(`${API_URL}/api/authinventory/drinks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(drinkData),
  });

  if (!response.ok) {
    throw new Error("Failed to create inventory item");
  }

  const res = { message: "Producto ingresado con exito" };
  return res;
}

export async function getCategories() {
  const response = await authFetch(`${API_URL}/api/authinventory/categories/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  return data;
}

export async function createCategory(categoryData) {
  const response = await authFetch(`${API_URL}/api/authinventory/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    const rawMessage = Array.isArray(errorData)
      ? errorData[0]
      : typeof errorData === "string"
        ? errorData
        : errorData?.name?.[0] ||
          errorData?.non_field_errors?.[0] ||
          errorData?.detail ||
          errorData?.message ||
          "";

    const normalizedMessage = String(rawMessage).toLowerCase();
    const message = normalizedMessage.includes("already exists")
      ? "Esta categoría ya existe"
      : normalizedMessage.includes("nombre") &&
          normalizedMessage.includes("exists")
        ? "Esta categoría ya existe"
        : rawMessage || "Error al crear la categoría";

    throw new Error(message);
  }

  const res = { message: "Categoría creada con éxito" };
  return res;
}
