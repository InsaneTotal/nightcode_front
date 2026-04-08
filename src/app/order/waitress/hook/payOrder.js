import { authFetch } from "../../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ORDERS_BASE_URL = `${API_URL}/api/order/orders/`;
const getOrderPayUrl = (orderId) => ORDERS_BASE_URL + String(orderId) + "/pay/";

export async function getPayments() {
  const response = await authFetch(`${API_URL}/api/order/payment-methods/`);

  if (!response.ok) {
    throw new Error("Error obteniendo métodos de pago");
  }

  return await response.json();
}

export async function payOrder(orderId, paymentMethodId) {
  const response = await authFetch(getOrderPayUrl(orderId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_payment: paymentMethodId,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al pagar orden");
  }

  return await response.json();
}
