import { getDrinkTables } from "./drinkTables";
import { getOrders } from "./orders";
import { createOrder, addProductsToOrder, updateOrder } from "./createOrder";
import { authFetch } from "../../../../utils/authFetch";

const ORDER_STATUS_CANCELLED = 5;
const ORDER_STATUS_PAID = 4;
const TABLE_STATUS_FREE = 1;
const TABLE_STATUS_OCCUPIED = 2;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ORDERS_BASE_URL = `${API_URL}/api/order/orders/`;
const getOrderUrl = (orderId) => ORDERS_BASE_URL + String(orderId) + "/";
const getOrderPayUrl = (orderId) => getOrderUrl(orderId) + "pay/";
const getTableUrl = (tableId) => `${API_URL}/api/order/drink-tables/${tableId}/`;

const syncTableStatus = async (tableId, statusId) => {
  const payloads = [
    { status: statusId },
    { id_status: statusId },
    { id_table_status: statusId },
  ];

  for (const payload of payloads) {
    const response = await authFetch(getTableUrl(tableId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    }
  }

  return false;
};

const transformOrdersToTables = (tablesData, ordersData) => {
  return tablesData.map((mesa) => {
    const order = ordersData.find(
      (o) =>
        o.id_mesa === mesa.id &&
        ![ORDER_STATUS_CANCELLED, ORDER_STATUS_PAID].includes(o.id_order_status),
    );
    return { 
      ...mesa,
      orderId: order?.id,
      items: order
        ? Object.values(
            order.details.reduce((acc, detail) => {
              const nombre = detail.drink.name;
              const id = detail.drink.id;
              const cantidad = Number(detail.amount || 1);
              if (!acc[nombre]) {
                acc[nombre] = {
                  id: id,
                  nombre,
                  precio: Number(detail.unit_price),
                  cantidad: 0,
                };
              }

              acc[nombre].cantidad += cantidad;

              return acc;
            }, {}),
          )
        : [],

      color:
        order && order.details.length > 0
          ? "yellow"
          : mesa.status === 1
          ? "green"
          : "red",
    };
  });
};

export function useWaitressOrders(setTables, setMesaActiva, setOpenPago) { 
  const calcularTotal = (items) =>
    items.reduce(
      (acc, item) =>
        acc + Number(item.precio) * (item.cantidad ? item.cantidad : 1),
      0,
    );

  const agregarProductosAMesa = async (tables, mesaId, productos) => {
    try {
      const mesa = tables.find((m) => m.id === mesaId);
      let orderId = mesa?.orderId;

      if (!orderId) {
        const newOrder = await createOrder(mesaId);
        orderId = newOrder.id;
      }

      await addProductsToOrder(orderId, productos);
      await syncTableStatus(mesaId, TABLE_STATUS_OCCUPIED);

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders(),
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error agregando productos:", error);
      alert("Error al agregar productos. Por favor intenta nuevamente.");
    }
  };



  const actualizarPedidoMesa = async (tables, mesaId, nuevosProductos) => {
    try {
      const mesa = tables.find((m) => m.id === mesaId);
      const orderId = mesa?.orderId;

      if (orderId) {
        await updateOrder(orderId, nuevosProductos);
      }

      if (nuevosProductos.length > 0) {
        await syncTableStatus(mesaId, TABLE_STATUS_OCCUPIED);
      } else {
        await syncTableStatus(mesaId, TABLE_STATUS_FREE);
      }

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders(),
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      alert("Error al actualizar el pedido. Por favor intenta nuevamente.");
    }
  };



  const liberarMesa = async (tables, id) => {
    try {
      const mesa = tables.find((m) => m.id === id);
      const orderId = mesa?.orderId;

      if (orderId) {
        await authFetch(getOrderUrl(orderId), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_order_status: ORDER_STATUS_PAID,
          }),
        });
      }

      await syncTableStatus(id, TABLE_STATUS_FREE);

      setTables((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                estado: "Libre",
                color: "green",
                pedido: "Sin pedido",
                items: [],
                orderId: null,
              }
            : m,
        ),
      );
      setMesaActiva(null);
    } catch (error) {
      console.error("Error liberando mesa:", error);
      alert("Error al liberar la mesa. Por favor intenta nuevamente.");
    }
  };

  const cancelarPedidoMesa = async (tables, mesaId) => {
    try {
      const mesa = tables.find((m) => m.id === mesaId);
      const orderId = mesa?.orderId;

      if (!orderId) {
        return;
      }

      await authFetch(getOrderUrl(orderId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_order_status: ORDER_STATUS_CANCELLED,
        }),
      });

      await syncTableStatus(mesaId, TABLE_STATUS_FREE);

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders(),
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);
      setMesaActiva(null);
    } catch (error) {
      console.error("Error cancelando pedido:", error);
      alert("Error al cancelar el pedido. Por favor intenta nuevamente.");
    }
  };

  const confirmarPago = async (tables, mesaActiva, metodoPago) => {
    try {
      const mesa = tables.find((m) => m.id === mesaActiva);

      if (!mesa || !mesa.orderId) {
        console.error("Mesa sin orden activa");
        return;
      }

      const response = await authFetch(getOrderPayUrl(mesa.orderId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_payment: metodoPago,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al pagar");
      }

      await syncTableStatus(mesaActiva, TABLE_STATUS_FREE);

      setTables((prev) =>
        prev.map((mesaItem) =>
          mesaItem.id === mesaActiva
            ? {
                ...mesaItem,
                status: TABLE_STATUS_FREE,
                estado: "Libre",
                color: "green",
                items: [],
                orderId: null,
              }
            : mesaItem,
        ),
      );

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders(),
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);

      setMesaActiva(null);
      setOpenPago(false);
    } catch (error) {
      console.error("Error al pagar:", error);
    }
  };


  const ocuparMesa = async (tables, id) => {
    try {
      await syncTableStatus(id, TABLE_STATUS_OCCUPIED);

      setTables((prev) =>
        prev.map((mesa) =>
          mesa.id === id
            ? {
                ...mesa,
                status: TABLE_STATUS_OCCUPIED,
                estado: "En consumo",
                color: "yellow",
                pedido: "Nuevo pedido",
                orderId: null,
                items: [],
              }
            : mesa,
        ),
      );

      setMesaActiva(id);
    } catch (error) {
      console.error("Error ocupando mesa:", error);
    }
  };

  return {
    calcularTotal,
    agregarProductosAMesa,
    actualizarPedidoMesa,
    cancelarPedidoMesa,
    liberarMesa,
    confirmarPago,
    ocuparMesa,
  };
}
