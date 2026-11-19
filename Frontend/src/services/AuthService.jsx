import api, { setCsrfToken, getCsrfToken, rawAxios } from "./axios";
import { getDeviceFingerprint } from "../lib/deviceFingerprint";

export const AuthService = {
  /**
   * Inicia sesión con mail y contraseña.
   * Envía cookies HttpOnly (ctm_at, ctm_rt) y guarda el CSRF token recibido.
   * Envía también huella de dispositivo para validar si es un equipo de confianza y preferencia 'rememberMe'.
   */
  async login(mail, password, { rememberMe = true } = {}) {
    let deviceId, deviceFingerprint;
    try {
      const fp = await getDeviceFingerprint();
      deviceId = fp.deviceId;
      deviceFingerprint = fp.deviceFingerprint;
    } catch {
      // Continuar sin huella si ocurre un error
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ctm_remember_me", rememberMe ? "true" : "false");
    }

    const res = await api.post("/auth/login", {
      mail,
      password,
      deviceId,
      deviceFingerprint,
      rememberMe: Boolean(rememberMe),
    });
    const data = res.data || {};

    // Si se requiere segundo factor de autenticación (2FA), no se emiten tokens aún
    if (data.requires2FA) {
      return data;
    }

    const csrf = res.headers?.["x-csrf-token"] || data.csrf_token;
    if (csrf) setCsrfToken(csrf);

    // En development, el backend también devuelve access_token/refresh_token en JSON
    if (data.access_token && typeof localStorage !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.refresh_token && typeof localStorage !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  /**
   * Completa la autenticación validando el segundo factor (código OTP, Google Authenticator o de recuperación).
   * Permite marcar el dispositivo como confiable por 7 días y respetar la preferencia 'rememberMe'.
   */
  async verify2FA({ tempToken, code, isRecoveryCode = false, trustDevice = false, rememberMe = true }) {
    let deviceId, deviceFingerprint;
    try {
      const fp = await getDeviceFingerprint();
      deviceId = fp.deviceId;
      deviceFingerprint = fp.deviceFingerprint;
    } catch {
      // Continuar sin huella
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ctm_remember_me", rememberMe ? "true" : "false");
    }

    const res = await api.post("/auth/2fa/verify", {
      tempToken,
      code,
      isRecoveryCode,
      trustDevice,
      deviceId,
      deviceFingerprint,
      rememberMe: Boolean(rememberMe),
    });
    const data = res.data || {};

    const csrf = res.headers?.["x-csrf-token"] || data.csrf_token;
    if (csrf) setCsrfToken(csrf);

    if (data.access_token && typeof localStorage !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.refresh_token && typeof localStorage !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  /**
   * Reenvía el código de verificación al correo durante el flujo 2FA.
   */
  async resend2FA({ tempToken }) {
    const res = await api.post("/auth/2fa/resend", { tempToken });
    return res.data;
  },

  /**
   * Registro de usuario nuevo.
   */
  async register({ mail, password, person }) {
    const res = await api.post("/auth/register", {
      mail,
      password,
      data: person ? { ...person } : {},
    });
    const data = res.data || {};

    const csrf = res.headers?.["x-csrf-token"] || data.csrf_token;
    if (csrf) setCsrfToken(csrf);

    if (data.access_token && typeof localStorage !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.refresh_token && typeof localStorage !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  /**
   * Cierre de sesión (invalida cookies y sesión en servidor).
   */
  async logout() {
    try {
      const at = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;
      const rt = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
      await api.post("/auth/logout", { accessToken: at, refreshToken: rt });
    } catch {
      // Continuar con limpieza local incluso si la petición falla
    } finally {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  },

  /**
   * Renovación de tokens por cookie ctm_rt (y fallback por body en dev).
   */
  async refreshTokens() {
    const refreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
    const body = refreshToken ? { token: refreshToken, refreshToken } : {};

    const csrf = getCsrfToken();
    const headers = csrf ? { "X-CSRF-Token": csrf } : {};

    const res = await rawAxios.post("/auth/refresh_token", body, { headers });
    const data = res.data || {};

    const newCsrf = res.headers?.["x-csrf-token"] || data.csrf_token;
    if (newCsrf) setCsrfToken(newCsrf);

    if (data.access_token && typeof localStorage !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.refresh_token && typeof localStorage !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  /**
   * Consulta el estado de sesión activa al backend (GET /auth/session).
   * Útil para autenticar mediante cookie HttpOnly al recargar la página.
   */
  async getSession() {
    try {
      const res = await api.get("/auth/session");
      const data = res.data || {};
      const csrf = res.headers?.["x-csrf-token"] || data.csrf_token;
      if (csrf) setCsrfToken(csrf);
      return data;
    } catch {
      return null;
    }
  },

  getToken() {
    return typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;
  },

  /**
   * Determina rápidamente si hay sesión en base a cookie o token en localStorage.
   */
  isAuthenticated() {
    // Si hay token JWT legacy en localStorage, se valida expiración
    const token = this.getToken();
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const pad = base64.length % 4;
          if (pad) base64 += "=".repeat(4 - pad);
          const payload = JSON.parse(atob(base64));
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            return false;
          }
          return true;
        }
      } catch {
        // Fallback a verificación por cookie
      }
    }

    // Si opera con cookies HttpOnly, la presencia de ctm_csrf o ctm_at indica sesión
    if (typeof document !== "undefined") {
      return /(?:^|; )(ctm_csrf|ctm_at)=/.test(document.cookie);
    }

    return false;
  },

  async forgotPassword(mail) {
    const frontendUrl = typeof window !== "undefined" ? window.location.origin : undefined;
    const res = await api.post("/auth/forgot-password", { mail, frontendUrl });
    return res.data;
  },

  async verifyResetCode({ mail, otpCode, token }) {
    const res = await api.post("/auth/verify-reset-code", { mail, otpCode, token });
    return res.data;
  },

  async resetPassword({ mail, otpCode, token, newPassword }) {
    const res = await api.post("/auth/reset-password", { mail, otpCode, token, newPassword });
    return res.data;
  },
};
