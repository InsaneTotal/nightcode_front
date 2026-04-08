import { authFetch } from "../../../../utils/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ORDERS_BASE_URL = `${API_URL}/api/order/orders/`;
const getOrderUrl = (orderId) => ORDERS_BASE_URL + String(orderId) + "/";

export async function createOrder(mesaId, userId = 1) {
  const response = await authFetch(ORDERS_BASE_URL, {
    //esto crea una nueva orden para una mesa específica
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_mesa: mesaId,
      id_users: userId,
      id_order_status: 1,
      details: [],
    }),
  });

  if (!response.ok) {
    throw new Error("Error creando orden");
  }

  return await response.json();
}

//esto hace que al momento de añadir un nuevo producto, va a traer lo de la base de datos y a crear nuevos productos, fusionando los nuevos con los existentes, y luego actualiza la orden completa con todos los productos (nuevos + existentes)
export async function addProductsToOrder(orderId, products) {
  const getResponse = await authFetch(getOrderUrl(orderId));
  if (!getResponse.ok) {
    throw new Error("Error obteniendo orden");
  }
  const order = await getResponse.json();

  const newDetails = products.map((product) => ({
    drink_id: product.id,
    amount: product.cantidad,
    unit_price: String(product.precio),
  }));

  const existingDetails = order.details.map((detail) => ({
    drink_id: detail.drink.id,
    amount: detail.amount,
    unit_price: String(detail.unit_price),
  }));

  const allDetails = [...existingDetails, ...newDetails];

  const response = await authFetch(getOrderUrl(orderId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      details: allDetails,
    }),
  });

  if (!response.ok) {
    throw new Error("Error agregando productos");
  }

  return await response.json();
}

export async function updateOrder(orderId, products) {
  // esto funciona para actualizar el pedido de una mesa, fusionando los nuevos productos con los existentes, pero si no hay productos, elimina la orden
  if (products.length === 0) {
    const response = await authFetch(getOrderUrl(orderId), {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error eliminando orden");
    }

    return null;
  } else {
    const newDetails = products.map((product) => ({
      drink_id: product.id,
      amount: product.cantidad,
      unit_price: String(product.precio),
    }));

    const response = await authFetch(getOrderUrl(orderId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        details: newDetails,
      }),
    });

    if (!response.ok) {
      throw new Error("Error actualizando orden");
    }

    return await response.json();
  }
}
