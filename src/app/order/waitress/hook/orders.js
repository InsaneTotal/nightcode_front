export async function getOrders() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/order/orders/");

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}