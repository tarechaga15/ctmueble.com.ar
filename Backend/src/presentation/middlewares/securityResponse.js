const SecurityAuditService = require('../../application/security/SecurityAuditService');

function getRequestActor(req) {
  return req?.user?.id || req?.ip || 'unknown';
}

function sanitizePathForLog(req) {
  const raw = req?.originalUrl || req?.url || '';
  return String(raw).split('?')[0];
}

function logDeniedAccess(req, status, code, message) {
  const actor = getRequestActor(req);
  const method = req?.method || 'UNKNOWN';
  const safePath = sanitizePathForLog(req);

  if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
    console.warn(
      `[SECURITY] access_denied status=${status} code=${code} actor=${actor} method=${method} path=${safePath} message="${message}"`
    );
  }

  if (status === 401 || status === 403 || status === 429) {
    SecurityAuditService.recordFromRequest(req, {
      action: status === 429 ? 'RATE_LIMIT_EXCEEDED' : status === 403 ? 'ACCESS_FORBIDDEN' : 'AUTH_DENIED',
      resource: safePath || 'http',
      outcome: 'DENIED',
      metadata: { status, code }
    }).catch(() => {});
  }
}

function sendSecurityError(res, req, status, code, message) {
  logDeniedAccess(req, status, code, message);
  return res.status(status).json({ code, message });
}

module.exports = {
  sendSecurityError
};
