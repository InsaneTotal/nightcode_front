"use client";
function ProductList({ pedido }) {
  return (
    <div className="space-y-2">
      {pedido.map((item, index) => (
        <div
          key={index}
          className="flex items-start justify-between gap-3 rounded-xl border border-yellow-500/10 bg-black/35 px-3 py-2"
        >
          <span className="inline-flex min-w-8 justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-200">
            {item.cantidad}
          </span>
          <span className="flex-1 text-sm leading-5 text-white/95 text-right sm:text-left">
            {item.nombre}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function VistaPedidos({ pedidos, onMarcarServida }) {
  return (
    <div className="space-y-4">
      <div className="hidden md:grid md:grid-cols-[90px_1fr_180px_170px] text-center px-5 py-4 rounded-2xl border border-yellow-500/30 bg-black/35 font-semibold text-sm uppercase tracking-wide text-yellow-200">
        <div>Mesa</div>
        <div>Pedido</div>
        <div>Estado</div>
        <div>Acción</div>
      </div>

      {pedidos.map((pedido) => (
        <article
          key={pedido.id}
          className="rounded-2xl border border-yellow-500/25 bg-black/35 backdrop-blur-sm overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="flex flex-col gap-4 p-4 sm:p-5 md:p-6 md:grid md:grid-cols-[90px_1fr_180px_170px] md:items-start md:gap-4">
            <div className="flex items-center justify-between md:block md:text-center">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 md:hidden">
                Mesa
              </div>
              <div className="text-3xl font-black text-yellow-400 md:text-2xl md:font-bold">
                {pedido.mesa}
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between md:hidden">
                <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Pedido
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                    pedido.mesaStatusId === 3
                      ? "border-sky-400/40 bg-sky-500/10 text-sky-200"
                      : "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                  }`}
                >
                  {pedido.mesaStatusLabel || pedido.estadoLabel || "Enviado"}
                </span>
              </div>

              <ProductList pedido={pedido.pedido} />
            </div>

            <div className="hidden md:flex md:justify-center">
              <span
                className={`inline-flex h-fit items-center rounded-full px-4 py-2 text-sm font-semibold border ${
                  pedido.mesaStatusId === 3
                    ? "border-sky-400/40 bg-sky-500/10 text-sky-200"
                    : "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                }`}
              >
                {pedido.mesaStatusLabel || pedido.estadoLabel || "Enviado"}
              </span>
            </div>

            <div className="flex flex-col gap-2 md:items-stretch md:justify-center">
              <button
                onClick={() => onMarcarServida?.(pedido)}
                disabled={pedido.mesaStatusId === 3}
                className="inline-flex items-center justify-center rounded-xl border border-sky-400/40 px-4 py-3 text-sm font-semibold text-sky-200 transition duration-300 hover:bg-sky-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pedido.mesaStatusId === 3 ? "Servida" : "Marcar servida"}
              </button>

              <div className="text-xs text-gray-400 text-center md:text-left">
                Último cambio: {pedido.hora}
              </div>
            </div>
          </div>
        </article>
      ))}

      {pedidos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-yellow-500/20 p-8 text-center text-gray-400 bg-black/20">
          No hay pedidos pendientes
        </div>
      )}
    </div>
  );
}
