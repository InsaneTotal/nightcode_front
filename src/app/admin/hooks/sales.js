import { authFetch } from "../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchSalesData() {
  const response = await authFetch(`${API_URL}/api/order/orders/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sales data");
  }

  const data = await response.json();
  return data;
}
