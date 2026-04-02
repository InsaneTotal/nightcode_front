const DEFAULT_API_BASE = "http://127.0.0.1:8000";

export const BACKEND_CONNECTION_ERROR =
  "No se pudo conectar al backend, revisa NEXT_PUBLIC_API_URL";

export function getApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  const resolved = fromEnv && fromEnv.trim() ? fromEnv.trim() : DEFAULT_API_BASE;
  return resolved.replace(/\/$/, "");
}

export function buildApiUrl(path) {
  return `${getApiBase()}${path}`;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError" || error instanceof TypeError) {
      throw new Error(BACKEND_CONNECTION_ERROR);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}