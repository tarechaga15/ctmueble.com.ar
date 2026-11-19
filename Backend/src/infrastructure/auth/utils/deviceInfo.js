'use strict';

const { getClientDetails, parseClientName, getIpAddress } = require('./clientInfo');

/**
 * Extrae y normaliza de forma segura la información del dispositivo y la sesión
 * a partir de la petición HTTP Express o datos equivalentes.
 * 
 * Reutiliza exactamente los mismos mecanismos de detección de cliente
 * empleados en sesiones y dispositivos de confianza (UserSession y UserTrustedDevice).
 */
function extractDeviceInfo(req = {}, extra = {}) {
  const client = getClientDetails(req);

  // Headers estandarizados para identificación de dispositivo
  const headers = req?.headers || {};
  const query = req?.query || {};
  const body = req?.body || {};

  const deviceId =
    extra.deviceId ||
    headers['x-device-id'] ||
    headers['x-client-device-id'] ||
    req?.deviceId ||
    query.deviceId ||
    (typeof body === 'object' && body !== null ? body.deviceId : null) ||
    null;

  const deviceFingerprint =
    extra.deviceFingerprint ||
    headers['x-device-fingerprint'] ||
    headers['x-client-fingerprint'] ||
    req?.deviceFingerprint ||
    query.deviceFingerprint ||
    (typeof body === 'object' && body !== null ? body.deviceFingerprint : null) ||
    null;

  const sessionId =
    extra.sessionId ||
    req?.auth?.sid ||
    req?.session?.id ||
    headers['x-session-id'] ||
    req?.cookies?.sessionId ||
    null;

  return {
    ipAddress: extra.ipAddress || client.ip || getIpAddress(req),
    userAgent: extra.userAgent || client.userAgent || null,
    clientName: extra.clientName || client.clientName || parseClientName(client.userAgent),
    deviceId: deviceId ? String(deviceId).trim().slice(0, 100) : null,
    deviceFingerprint: deviceFingerprint ? String(deviceFingerprint).trim().slice(0, 128) : null,
    sessionId: sessionId ? String(sessionId).trim().slice(0, 64) : null
  };
}

module.exports = {
  extractDeviceInfo
};
