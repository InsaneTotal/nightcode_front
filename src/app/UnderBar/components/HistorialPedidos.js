export default function HistorialPedidos({ historial }) {
  return (
    <div className="space-y-6">
      {historial.length === 0 && (
        <p className="text-center text-gray-400">
          No hay pedidos en el historial.
        </p>
      )}

      {historial.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-black border border-yellow-500/40 rounded-xl p-5 shadow-lg"
        >
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-yellow-400 font-bold text-lg">
              Mesa {pedido.mesa}
            </h2>
            <span className="text-sm text-gray-400">{pedido.hora}</span>
          </div>

          {/* Tabla interna */}
          <div className="bg-black/50 rounded-lg p-3">
            <div className="grid grid-cols-2 text-xs text-yellow-400 mb-2 font-semibold">
              <span>Cantidad</span>
              <span>Producto</span>
            </div>

            {pedido.pedido.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 text-sm border-t border-yellow-500/10 py-1"
              >
                <span className="text-center">{item.cantidad}</span>
                <span>{item.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
