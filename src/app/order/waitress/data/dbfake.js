// MINI BASE DE DATOS ESTÁTICA

export const productosDB = [
  { id: 1, nombre: "Aguardiente", precio: 50000 },
  { id: 2, nombre: "Cerveza", precio: 30000 },
  { id: 3, nombre: "Ron", precio: 60000 },
  { id: 4, nombre: "Whisky", precio: 90000 },
  { id: 5, nombre: "Tequila", precio: 75000 },
];

export const mesasDB = [
  {
    id: 1,
    pedido: "En cola",
    estado: "En consumo",
    color: "yellow",
    items: [
      { id: 1, nombre: "Aguardiente", precio: 50000 },
      { id: 2, nombre: "Cerveza", precio: 30000 },
    ],
  },
  {
    id: 2,
    pedido: "Entregado",
    estado: "Libre",
    color: "green",
    items: [],
  },
  {
    id: 3,
    pedido: "Listo",
    estado: "Pendiente",
    color: "red",
    items: [{ id: 3, nombre: "Ron", precio: 60000 }],
  },
];
