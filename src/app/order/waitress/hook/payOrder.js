import { authFetch } from "../../../../utils/authFetch";

const ORDERS_BASE_URL = "http://127.0.0.1:8000/api/order/orders/";
const getOrderPayUrl = (orderId) =>
  ORDERS_BASE_URL + String(orderId) + "/pay/";

export async function getPayments() {
  const response = await authFetch(
    "http://127.0.0.1:8000/api/order/payment-methods/"
  );

  if (!response.ok) {
    throw new Error("Error obteniendo métodos de pago");
  }

  return await response.json();
}

export async function payOrder(orderId, paymentMethodId) {
  const response = await authFetch(
      getOrderPayUrl(orderId),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_payment: paymentMethodId
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Error al pagar orden");
  }

  return await response.json();
}