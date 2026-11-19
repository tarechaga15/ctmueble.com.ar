function parseClientName(userAgent) {
  const ua = String(userAgent || '');
  if (!ua) return 'Dispositivo desconocido';

  let os = 'Dispositivo';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/iphone/i.test(ua)) os = 'iPhone';
  else if (/ipad/i.test(ua)) os = 'iPad';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Navegador Web';
  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Apple Safari';
  else if (/opera|opr\//i.test(ua)) browser = 'Opera';
  else if (/postman/i.test(ua)) browser = 'Postman';

  return `${browser} en ${os}`;
}

function getIpAddress(req) {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const parts = forwarded.split(',');
    return parts[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

function getClientDetails(req) {
  const ua = req?.headers?.['user-agent'] || null;
  return {
    ip: getIpAddress(req),
    userAgent: ua,
    clientName: parseClientName(ua)
  };
}

module.exports = {
  parseClientName,
  getIpAddress,
  getClientDetails
};
