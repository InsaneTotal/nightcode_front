export default function HistorialPedidos({ historial }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {historial.length === 0 && (
        <p className="rounded-2xl border border-dashed border-yellow-500/20 bg-black/20 px-6 py-8 text-center text-gray-400">
          No hay pedidos en el historial.
        </p>
      )}

      {historial.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-black/35 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 sm:p-5 shadow-lg"
        >
          {/* Encabezado */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
            <div>
              <h2 className="text-yellow-400 font-bold text-lg sm:text-xl">
                Mesa {pedido.mesa}
              </h2>
              <p className="text-xs text-gray-500">Orden #{pedido.id}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:text-right">
              <span className="inline-flex px-3 py-1 rounded-full text-xs border border-gray-600 text-gray-300 bg-black/30">
                {pedido.estadoLabel || "Historial"}
              </span>
              <div className="text-sm text-gray-400">{pedido.hora}</div>
            </div>
          </div>

          {/* Tabla interna */}
          <div className="bg-black/45 rounded-xl p-3 sm:p-4">
            <div className="grid grid-cols-2 text-xs text-yellow-400 mb-2 font-semibold uppercase tracking-wide">
              <span>Cantidad</span>
              <span>Producto</span>
            </div>

            {pedido.pedido.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-3 text-sm border-t border-yellow-500/10 py-2"
              >
                <span className="text-center font-semibold text-yellow-200">
                  {item.cantidad}
                </span>
                <span className="wrap-break-word text-white/95">
                  {item.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
