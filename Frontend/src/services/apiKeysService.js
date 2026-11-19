import api from "./axios";

export const apiKeysService = {
  /**
   * Consulta pública si el sistema requiere verificación de correo (si mailing está activo).
   */
  getMailingStatus: async () => {
    try {
      const response = await api.get("/auth/mailing-status");
      return response.data || { mailingRequired: false };
    } catch {
      return { mailingRequired: false };
    }
  },

  /**
   * Envía el código OTP y el enlace de verificación al correo.
   */
  sendVerification: async ({ mail, name, frontendUrl }) => {
    const response = await api.post("/auth/send-verification", {
      mail,
      name,
      frontendUrl: frontendUrl || (typeof window !== "undefined" ? window.location.origin : ""),
    });
    return response.data;
  },

  /**
   * Valida el código OTP de 6 dígitos (opcionalmente fijando nueva contraseña si es invitación).
   */
  verifyOtp: async ({ mail, otpCode, newPassword }) => {
    const payload = { mail, otpCode };
    if (newPassword) payload.newPassword = newPassword;
    const response = await api.post("/auth/verify-otp", payload);
    return response.data;
  },

  /**
   * Valida la cuenta mediante el enlace y token recibido por correo.
   * Cuando incluye `newPassword` (invitación), envía POST para no exponer credenciales en la URL.
   */
  verifyLink: async ({ token, mail, newPassword }) => {
    if (newPassword) {
      const response = await api.post("/auth/verify-link", {
        token,
        mail,
        newPassword,
      });
      return response.data;
    }
    const response = await api.get("/auth/verify-link", {
      params: { token, mail },
    });
    return response.data;
  },

  /**
   * Consulta el estado de configuración de un servicio (solo LABORATORY).
   */
  getStatus: async (service = "MAILING") => {
    const response = await api.get("/api-keys/status", {
      params: { service },
    });
    return response.data;
  },

  /**
   * Guarda y cifra una API Key en AES-256-GCM (solo LABORATORY).
   */
  saveApiKey: async ({ service = "MAILING", provider = "RESEND", name, apiKey, metadata }) => {
    const response = await api.post("/api-keys", {
      service,
      provider,
      name,
      apiKey,
      metadata,
    });
    return response.data;
  },

  /**
   * Envía un correo de prueba para validar que la API Key funciona (solo LABORATORY).
   */
  testMailing: async (to) => {
    const response = await api.post("/api-keys/test-mailing", { to });
    return response.data;
  },

  /**
   * Desactiva una API Key (solo LABORATORY).
   */
  deleteApiKey: async (id) => {
    const response = await api.delete(`/api-keys/${id}`);
    return response.data;
  },
};
