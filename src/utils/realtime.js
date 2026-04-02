const DEFAULT_REALTIME_PATH = "/ws/realtime/";
const listeners = new Set();

let socket = null;
let reconnectTimer = null;
let reconnectEnabled = false;

function normalizeUrl(url) {
  if (!url) return "";

  const trimmed = String(url).trim();
  if (!trimmed) return "";

  if (/^wss?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http/i, "ws").replace(/\/$/, "");
  }

  return trimmed;
}

function getRealtimeUrl() {
  const explicitUrl = normalizeUrl(process.env.NEXT_PUBLIC_REALTIME_WS_URL);
  if (explicitUrl) {
    return explicitUrl;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const wsBase = normalizeUrl(apiBase.replace(/^http/i, "ws"));
  return `${wsBase}${DEFAULT_REALTIME_PATH}`;
}

function parseMessage(data) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return { type: "message", raw: data };
    }
  }

  if (data && typeof data === "object") {
    return data;
  }

  return { type: "message", raw: data };
}

function notifyListeners(payload) {
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error("Error handling realtime event:", error);
    }
  });
}

function scheduleReconnect() {
  if (!reconnectEnabled || typeof window === "undefined") {
    return;
  }

  if (reconnectTimer) {
    return;
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectSocket();
  }, 5000);
}

function connectSocket() {
  if (typeof window === "undefined") {
    return null;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket;
  }

  const url = getRealtimeUrl();
  if (!url) {
    return null;
  }

  reconnectEnabled = true;
  socket = new WebSocket(url);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    notifyListeners(parseMessage(event.data));
  };

  socket.onerror = () => {
    try {
      socket?.close();
    } catch {}
  };

  socket.onclose = () => {
    if (reconnectEnabled && listeners.size > 0) {
      scheduleReconnect();
    }
  };

  return socket;
}

function disconnectSocket() {
  reconnectEnabled = false;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    try {
      socket.close();
    } catch {}
  }

  socket = null;
}

export function subscribeRealtimeUpdates(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);
  connectSocket();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      disconnectSocket();
    }
  };
}

export function matchesRealtimeTopics(payload, topics = []) {
  const haystack = [
    payload?.resource,
    payload?.type,
    payload?.event,
    payload?.channel,
    payload?.entity,
    payload?.action,
    payload?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!topics || topics.length === 0) {
    return true;
  }

  return topics.some((topic) => haystack.includes(String(topic).toLowerCase()));
}
