import api from "./axios";

/**
 * Obtiene el usuario actual (autenticado por JWT).
 * @returns {Promise<{ id: string, mail: string, profile: string, laboratory?: string, name?: string, dni?: string }>}
 */
export async function getCurrentUser() {
  const response = await api.get("/users/get");
  return response.data;
}

/**
 * Actualiza los datos del cliente/perfil del usuario actual.
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updateClientData(data) {
  const response = await api.put("/users/update_data", data);
  return response.data;
}

/**
 * Actualiza la contraseña del usuario.
 */
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  const response = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
}

/**
 * Consulta el estado actual de 2FA del usuario.
 */
export async function getTwoFactorStatus() {
  const response = await api.get("/users/2fa/status");
  return response.data;
}

/**
 * Inicia la configuración de 2FA por correo electrónico enviando código.
 */
export async function setupEmail2FA() {
  const response = await api.post("/users/2fa/email/setup");
  return response.data;
}

/**
 * Confirma la activación de 2FA por correo con el código recibido.
 */
export async function confirmEmail2FA(otpCode) {
  const response = await api.post("/users/2fa/email/confirm", { otpCode });
  return response.data;
}

/**
 * Inicia la configuración de Google Authenticator (TOTP), devolviendo QR y clave.
 */
export async function setupTotp2FA() {
  const response = await api.post("/users/2fa/totp/setup");
  return response.data;
}

/**
 * Confirma la activación de Google Authenticator mediante código de 6 dígitos.
 */
export async function confirmTotp2FA(code) {
  const response = await api.post("/users/2fa/totp/confirm", { code });
  return response.data;
}

/**
 * Desactiva el 2FA verificando contraseña actual.
 */
export async function disable2FA(password) {
  const response = await api.post("/users/2fa/disable", { password });
  return response.data;
}

/**
 * Consulta todas las sesiones activas del usuario.
 */
export async function getActiveSessions() {
  const response = await api.get("/users/sessions");
  return response.data;
}

/**
 * Revoca una sesión específica por ID.
 */
export async function revokeSession(sessionId) {
  const response = await api.delete(`/users/sessions/${sessionId}`);
  return response.data;
}

/**
 * Revoca todas las demás sesiones excepto la actual.
 */
export async function revokeOtherSessions() {
  const response = await api.delete("/users/sessions/other");
  return response.data;
}

/**
 * Consulta la cantidad de códigos de recuperación de emergencia disponibles.
 */
export async function getRecoveryCodesStatus() {
  const response = await api.get("/users/2fa/recovery-codes");
  return response.data;
}

/**
 * Genera un nuevo conjunto de códigos de recuperación de emergencia validando contraseña.
 */
export async function generateRecoveryCodes(password) {
  const response = await api.post("/users/2fa/recovery-codes/generate", { password });
  return response.data;
}

/**
 * Consulta los dispositivos de confianza activos.
 */
export async function getTrustedDevices() {
  const response = await api.get("/users/trusted-devices");
  return response.data;
}

/**
 * Revoca un dispositivo de confianza específico.
 */
export async function revokeTrustedDevice(id) {
  const response = await api.delete(`/users/trusted-devices/${id}`);
  return response.data;
}

/**
 * Revoca todos los dispositivos de confianza.
 */
export async function revokeAllTrustedDevices() {
  const response = await api.delete("/users/trusted-devices/all");
  return response.data;
}

export const usersService = {
  getCurrentUser,
  updateClientData,
  changePassword,
  getTwoFactorStatus,
  setupEmail2FA,
  confirmEmail2FA,
  setupTotp2FA,
  confirmTotp2FA,
  disable2FA,
  getRecoveryCodesStatus,
  generateRecoveryCodes,
  getTrustedDevices,
  revokeTrustedDevice,
  revokeAllTrustedDevices,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
};
