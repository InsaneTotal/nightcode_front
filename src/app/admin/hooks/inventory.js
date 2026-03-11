import { authFetch } from "../../../utils/authFetch";

export async function getInventory() {
  const response = await authFetch(
    "http://localhost:8000/api/authinventory/drinks/",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }

  const data = await response.json();
  return data;
}

export async function updateInventory(id, updatedData) {
  const response = await authFetch(
    `http://localhost:8000/api/authinventory/drinks/${id}/`,
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

  const data = await response.json();
  return data;
}
