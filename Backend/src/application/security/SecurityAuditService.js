/**
 * Servicio centralizado de auditoría de seguridad (append-only).
 * - Redacta recursivamente secretos, tokens, contraseñas y cabeceras sensibles antes de persistir.
 * - Escribe de forma no bloqueante en `security_audit_logs` y degrada a log estructurado si la tabla o DB no está disponible.
 */
const SENSITIVE_KEY_PATTERN = /(password|pass|secret|token|cookie|authorization|registerkey|csrf|privatekey|cert|apikey|api_key|otp|tempToken|signature|twoFactorSecret)/i;
const { extractDeviceInfo } = require('../../infrastructure/auth/utils/deviceInfo');
const SnapshotCryptoService = require('../../infrastructure/security/SnapshotCryptoService');

function redactValue(value, depth = 0) {
  if (depth > 4) return '[TRUNCATED]';
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.length > 512 ? `${value.slice(0, 512)}…` : value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 25).map((item) => redactValue(item, depth + 1));
  }
  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      clean[k] = '[REDACTED]';
    } else {
      clean[k] = redactValue(v, depth + 1);
    }
  }
  return clean;
}

function resolveRequestIp(req) {
  if (!req) return null;
  if (process.env.VERCEL && req.headers && typeof req.headers['x-vercel-forwarded-for'] === 'string') {
    return req.headers['x-vercel-forwarded-for'].split(',')[0].trim().slice(0, 64);
  }
  if (req.ip) {
    return String(req.ip).slice(0, 64);
  }
  const xff = req.headers && typeof req.headers['x-forwarded-for'] === 'string'
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : null;
  return xff ? xff.slice(0, 64) : null;
}

class SecurityAuditService {
  static redact(metadata) {
    return redactValue(metadata);
  }

  static async record(entry = {}) {
    const cryptoService = SnapshotCryptoService.getInstance();

    const normalized = {
      request_id: entry.requestId ? String(entry.requestId).slice(0, 64) : null,
      user_id: entry.userId ? String(entry.userId) : null,
      session_id: entry.sessionId ? String(entry.sessionId).slice(0, 64) : null,
      action: String(entry.action || 'UNKNOWN_ACTION').slice(0, 80),
      resource: String(entry.resource || 'unknown').slice(0, 80),
      resource_id: entry.resourceId != null ? String(entry.resourceId).slice(0, 128) : null,
      outcome: String(entry.outcome || 'SUCCESS').slice(0, 24),
      ip_address: entry.ipAddress ? String(entry.ipAddress).slice(0, 64) : null,
      user_agent: entry.userAgent ? String(entry.userAgent).slice(0, 512) : null,
      client_name: entry.clientName ? String(entry.clientName).slice(0, 120) : null,
      device_id: entry.deviceId ? String(entry.deviceId).slice(0, 100) : null,
      device_fingerprint: entry.deviceFingerprint ? String(entry.deviceFingerprint).slice(0, 128) : null,
      metadata: entry.metadata ? redactValue(entry.metadata) : null
    };

    // Calcular hash e integridad criptográfica firmada del registro de auditoría
    try {
      const previousHash = entry.previousHash || null;
      const { canonicalHash } = cryptoService.hashCanonical({
        request_id: normalized.request_id,
        user_id: normalized.user_id,
        session_id: normalized.session_id,
        action: normalized.action,
        resource: normalized.resource,
        resource_id: normalized.resource_id,
        outcome: normalized.outcome,
        ip_address: normalized.ip_address,
        device_id: normalized.device_id,
        device_fingerprint: normalized.device_fingerprint,
        metadata: normalized.metadata,
        previous_hash: previousHash
      });
      const { signature } = cryptoService.signHash(canonicalHash);
      normalized.record_hash = canonicalHash;
      normalized.signature = signature;
      normalized.previous_hash = previousHash;
    } catch (_) {}

    if (
      (process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT)) &&
      process.env.ENABLE_TEST_AUDIT_DB !== 'true'
    ) {
      return normalized;
    }

    try {
      const SecurityAuditLog = require('../../infrastructure/models/security/security_audit_log');
      // Pasamos `transaction: null` para que los eventos de auditoría (incluyendo fallos 401/403) no se pierdan en un rollback.
      await SecurityAuditLog.create(normalized, { transaction: null });
    } catch (err) {
      console.info(
        JSON.stringify({
          type: 'SECURITY_AUDIT_FALLBACK',
          timestamp: new Date().toISOString(),
          ...normalized,
          persistError: err.message
        })
      );
    }

    return normalized;
  }

  static async recordFromRequest(req, payload = {}) {
    const device = extractDeviceInfo(req, {
      deviceId: payload.deviceId,
      deviceFingerprint: payload.deviceFingerprint,
      sessionId: payload.sessionId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      clientName: payload.clientName
    });

    return SecurityAuditService.record({
      requestId: payload.requestId || req?.requestId || req?.headers?.['x-request-id'] || null,
      userId: payload.userId !== undefined ? payload.userId : req?.user?.id || null,
      sessionId: device.sessionId,
      action: payload.action,
      resource: payload.resource,
      resourceId: payload.resourceId,
      outcome: payload.outcome || 'SUCCESS',
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      clientName: device.clientName,
      deviceId: device.deviceId,
      deviceFingerprint: device.deviceFingerprint,
      previousHash: payload.previousHash || null,
      metadata: {
        method: req?.method || undefined,
        path: req?.baseUrl ? `${req.baseUrl}${req.path || ''}` : (req?.path || req?.originalUrl?.split('?')[0] || undefined),
        ...(payload.metadata || {})
      }
    });
  }
}

module.exports = SecurityAuditService;
