import { authFetch } from "../../../../utils/authFetch"; // 🔥 NUEVO ARCHIVO PARA FUNCIONES DE PAGO

export async function getPayments() {
  const response = await authFetch(
    "http://127.0.0.1:8000/api/order/payment-methods/"
  );

  if (!response.ok) {
    throw new Error("Error obteniendo métodos de pago");
  }

  return await response.json();
}

export async function payOrder(orderId, paymentMethodId) { // 🔥 NUEVA FUNCIÓN PARA PAGAR ORDEN
  const response = await authFetch(
    `http://127.0.0.1:8000/api/order/orders/${orderId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_payment: paymentMethodId,
        id_order_status: 2,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Error al pagar orden");
  }

  return await response.json();
}