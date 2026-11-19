/**
 * Variables de entorno expuestas al cliente (Vite).
 * En .env usá el prefijo VITE_ para que estén disponibles aquí.
 * @see https://vitejs.dev/guide/env-and-mode.html
 */
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
export default {
  /** URL base del API sin barra final (evita doble barra en rutas y redirects en preflight CORS). */
  API_URL: typeof rawApiUrl === "string" ? rawApiUrl.replace(/\/+$/, "") : rawApiUrl,
};
