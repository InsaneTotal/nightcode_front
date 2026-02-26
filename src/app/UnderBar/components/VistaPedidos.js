"use client";
export default function VistaPedidos({ pedidos, marcarListo }) {
  return (
    <div className="rounded-2xl border border-yellow-500/30">
      <div
        className="grid grid-cols-3 text-center p-5
      border-b border-yellow-500/30 font-semibold"
      >
        <div>Mesa</div>
        <div>Pedido</div>
        <div>Acción</div>
      </div>

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="grid grid-cols-3 text-center p-6
          border-b border-yellow-500/10
          hover:bg-gradient-to-r from-[#3a1f3f] to-[#1f1024]
          transition duration-300"
        >
          <div>{pedido.mesa}</div>

          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-3">
            {/* Subtítulos */}
            <div className="grid grid-cols-2 text-xs text-yellow-400 mb-2 font-semibold">
              <span>Cantidad</span>
              <span>Producto</span>
            </div>

            {/* Productos */}
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

          <div>
            <button
              onClick={() => marcarListo(pedido)}
              className="px-5 py-2 rounded-full text-sm
              border border-yellow-500/40
              text-yellow-400
              hover:bg-yellow-500
              hover:text-black
              hover:shadow-[0_0_15px_rgba(234,179,8,0.7)]
              transition duration-300"
            >
              Marcar Listo
            </button>
          </div>
        </div>
      ))}

      {pedidos.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No hay pedidos pendientes
        </div>
      )}
    </div>
  );
}
