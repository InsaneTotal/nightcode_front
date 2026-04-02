"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Custom hook para manejar conexión WebSocket en tiempo real de órdenes
 * @param {Object} options - Opciones del hook
 * @param {number} [options.tableId] - ID de la mesa a suscribirse
 * @param {Function} [options.onEvent] - Callback cuando llega un evento
 * @param {number} [options.reconnectMs] - Milisegundos para reintentar conexión (default: 2500)
 * @returns {Object} - Estado y métodos del hook
 */
export function useOrderRealtime(options = {}) {
  const { tableId, onEvent, reconnectMs = 2500 } = options;

  const [connectionState, setConnectionState] = useState("connecting"); // "connecting" | "open" | "closed" | "error"
  const [lastEvent, setLastEvent] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const manuallyClosedRef = useRef(false);

  // Construir URL correctamente
  const wsUrl = useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_WS_BASE_URL?.trim() || "ws://127.0.0.1:8000";
    const normalized = base.endsWith("/") ? base.slice(0, -1) : base;

    // FIX: Query string debe ir antes del slash final
    if (tableId) {
      return `${normalized}/ws/orders/?table=${tableId}`;
    }
    return `${normalized}/ws/orders/`;
  }, [tableId]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const sendJson = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, cannot send:", payload);
      return false;
    }
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Error sending JSON via WebSocket:", error);
      return false;
    }
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();
    setConnectionState("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to:", wsUrl);
        setConnectionState("open");
      };

      ws.onmessage = (message) => {
        try {
          const parsed = JSON.parse(message.data);
          setLastEvent(parsed);
          onEvent?.(parsed);
        } catch (error) {
          console.warn(
            "Failed to parse WebSocket message:",
            message.data,
            error,
          );
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("error");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setConnectionState("closed");
        wsRef.current = null;

        // Reintentar conexión si fue cerrada inesperadamente
        if (!manuallyClosedRef.current) {
          console.log(`Reconnecting in ${reconnectMs}ms...`);
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectMs);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionState("error");
    }
  }, [clearReconnectTimer, onEvent, reconnectMs, wsUrl]);

  // Efecto: Conectar/desconectar
  useEffect(() => {
    manuallyClosedRef.current = false;
    connect();

    return () => {
      manuallyClosedRef.current = true;
      clearReconnectTimer();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [connect, clearReconnectTimer]);

  // Suscribirse a una mesa específica
  const subscribeTable = useCallback(
    (id) => {
      if (typeof id !== "number") {
        console.error("subscribeTable expects a number, got:", typeof id);
        return false;
      }
      return sendJson({ action: "subscribe_table", table_id: id });
    },
    [sendJson],
  );

  // Desuscribirse de una mesa
  const unsubscribeTable = useCallback(
    (id) => {
      if (typeof id !== "number") {
        console.error("unsubscribeTable expects a number, got:", typeof id);
        return false;
      }
      return sendJson({ action: "unsubscribe_table", table_id: id });
    },
    [sendJson],
  );

  return {
    connectionState,
    isConnected: connectionState === "open",
    lastEvent,
    sendJson,
    subscribeTable,
    unsubscribeTable,
  };
}
