import axios from "axios";
import env from "../env";
import { getDeviceFingerprint } from "../lib/deviceFingerprint";

export const API_URL = env.API_URL;

let inMemoryCsrfToken = null;
let cachedDeviceInfo = null;
let cachedDevicePromise = null;

function resolveDeviceInfoCached() {
  if (cachedDeviceInfo) return Promise.resolve(cachedDeviceInfo);
  if (!cachedDevicePromise) {
    cachedDevicePromise = getDeviceFingerprint()
      .then((info) => {
        cachedDeviceInfo = info;
        return info;
      })
      .catch(() => ({ deviceId: null, deviceFingerprint: null }));
  }
  return cachedDevicePromise;
}

export function getCsrfToken() {
  if (inMemoryCsrfToken) return inMemoryCsrfToken;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(
      /(?:^|; )ctm_csrf=([^;]*)/
    );
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export function setCsrfToken(token) {
  if (typeof token === "string" && token.trim()) {
    inMemoryCsrfToken = token.trim();
  }
}

/**
 * Instancia limpia de axios sin interceptores para renovar tokens sin loops ni side-effects.
 */
export const rawAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Envía y recibe cookies ctm_at, ctm_rt y ctm_csrf
});

// Interceptor para agregar CSRF Token, Idempotency-Key, Device Headers y Authorization fallback (en dev)
api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};

  // Si existe token manual en localStorage (entorno de development legacy), se envía como fallback
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Adjuntar huella e identificador de dispositivo para auditoría y detección de sesiones confiables
  try {
    const dev = await resolveDeviceInfoCached();
    if (dev?.deviceId && !config.headers["X-Device-Id"]) {
      config.headers["X-Device-Id"] = dev.deviceId;
    }
    if (dev?.deviceFingerprint && !config.headers["X-Device-Fingerprint"]) {
      config.headers["X-Device-Fingerprint"] = dev.deviceFingerprint;
    }
  } catch {
    // Fail open si fingerprinting falla en el navegador
  }

  // Adjuntar X-CSRF-Token en métodos de mutación
  const method = (config.method || "").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers["X-CSRF-Token"] = csrf;
    }

    // Generar Idempotency-Key para métodos POST y PUT si no viene explícita
    if (["POST", "PUT"].includes(method) && !config.headers["Idempotency-Key"] && !config.headers["idempotency-key"]) {
      const randomKey = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      config.headers["Idempotency-Key"] = randomKey;
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de respuesta para actualizar CSRF y manejar refresh automático ante 401
api.interceptors.response.use(
  (response) => {
    const headerCsrf = response.headers?.["x-csrf-token"];
    const bodyCsrf = response.data?.csrf_token;
    if (headerCsrf || bodyCsrf) {
      setCsrfToken(headerCsrf || bodyCsrf);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || "";

    // No reintentar rutas de autenticación básicas para evitar bucles
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh_token") ||
      url.includes("/auth/refreshToken") ||
      url.includes("/auth/session");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers["authorization"] = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // Enviar refresh con credentials: true (la cookie ctm_rt viaja automáticamente)
        const refreshBody = {};
        const legacyRt = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
        if (legacyRt) {
          refreshBody.token = legacyRt;
          refreshBody.refreshToken = legacyRt;
        }

        const refreshHeaders = {};
        const csrf = getCsrfToken();
        if (csrf) {
          refreshHeaders["X-CSRF-Token"] = csrf;
        }

        const refreshRes = await rawAxios.post("/auth/refresh_token", refreshBody, {
          headers: refreshHeaders,
        });

        const newCsrf = refreshRes.headers?.["x-csrf-token"] || refreshRes.data?.csrf_token;
        if (newCsrf) {
          setCsrfToken(newCsrf);
        }

        const newAccessToken = refreshRes.data?.access_token;
        const newRefreshToken = refreshRes.data?.refresh_token;

        if (newAccessToken && typeof localStorage !== "undefined") {
          localStorage.setItem("access_token", newAccessToken);
        }
        if (newRefreshToken && typeof localStorage !== "undefined") {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
        }

        isRefreshing = false;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          try {
            localStorage.setItem("auth_error", "Sesión expirada. Inicia sesión nuevamente.");
          } catch {
            // ignorar
          }
        }
        if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
