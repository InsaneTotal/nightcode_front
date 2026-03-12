import { authFetch } from "../../../../utils/authFetch";

export async function getOrders() {
  try {
    const response = await authFetch("http://127.0.0.1:8000/api/order/orders/");

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
      "http://127.0.0.1:8000/api/order/orders/top-drinks-today/",
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
