import { authFetch } from "../../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getOrders() {
  try {
    const response = await authFetch(`${API_URL}/api/order/orders/`);

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function getSoldDrinks() {
  try {
    const response = await authFetch(
      `${API_URL}/api/order/orders/top-drinks-today/`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch sold drinks");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sold drinks:", error);
    throw error;
  }
}
