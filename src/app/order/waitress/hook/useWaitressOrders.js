import { getDrinkTables } from "./drinkTables";
import { getOrders } from "./orders";
import { createOrder, addProductsToOrder, updateOrder } from "./createOrder";
import { authFetch } from "../../../../utils/authFetch";

const transformOrdersToTables = (tablesData, ordersData) => { // Fusiona mesas con sus órdenes para obtener estado y productos
  return tablesData.map((mesa) => {
    const order = ordersData.find(
      (o) => o.id_mesa === mesa.id && o.id_order_status !== 4
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


//esto calcula el total, agrega productos a una mesa, actualiza el pedido de una mesa, libera una mesa y ocupa una mesa
export function useWaitressOrders(setTables, setMesaActiva, setOpenPago) { 
  const calcularTotal = (items) =>
    items.reduce(
      (acc, item) =>
        acc + Number(item.precio) * (item.cantidad ? item.cantidad : 1),
      0,
    );

  const agregarProductosAMesa = async (tables, mesaId, productos) => {  //esto agrega productos a una mesa, si la mesa no tiene orden, crea una nueva orden y luego agrega los productos
    try {
      const mesa = tables.find(m => m.id === mesaId);
      let orderId = mesa?.orderId;

      if (!orderId) {
        const newOrder = await createOrder(mesaId);
        orderId = newOrder.id;
      }

      await addProductsToOrder(orderId, productos);

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders()
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error agregando productos:", error);
      alert("Error al agregar productos. Por favor intenta nuevamente.");
    }
  };



  const actualizarPedidoMesa = async (tables, mesaId, nuevosProductos) => { // esto actualiza el pedido de una mesa, fusionando los nuevos productos con los existentes
    try {
      const mesa = tables.find(m => m.id === mesaId);
      const orderId = mesa?.orderId;

      if (orderId) {
        await updateOrder(orderId, nuevosProductos);
      }

      const [tablesData, ordersData] = await Promise.all([
        getDrinkTables(),
        getOrders()
      ]);

      const tablesWithOrders = transformOrdersToTables(tablesData, ordersData);
      setTables(tablesWithOrders);
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      alert("Error al actualizar el pedido. Por favor intenta nuevamente.");
    }
  };



  const liberarMesa = async (tables, id) => { //esto libera una mesa, cambiando su estado a libre y actualizando el estado de la orden a pagada
    try {
      const mesa = tables.find(m => m.id === id);
      const orderId = mesa?.orderId;

      if (orderId) {
        await authFetch(`http://127.0.0.1:8000/api/order/orders/${orderId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_order_status: 4,
          }),
        });
      }

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



const confirmarPago = async (tables, mesaActiva, metodoPago) => {
  try {

    const mesa = tables.find((m) => m.id === mesaActiva);

    if (!mesa || !mesa.orderId) {
      console.error("Mesa sin orden activa");
      return;
    }

    const response = await authFetch(
      `http://127.0.0.1:8000/api/order/orders/${mesa.orderId}/pay/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_payment: metodoPago,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al pagar");
    }

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
    setTables((prev) =>
      prev.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
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
    liberarMesa,
    confirmarPago,
    ocuparMesa,
  };
}
