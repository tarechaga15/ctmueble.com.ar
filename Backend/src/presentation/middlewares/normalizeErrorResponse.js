function getDefaultCodeByStatus(statusCode) {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    default:
      if (statusCode >= 500) return 'INTERNAL_SERVER_ERROR';
      return 'REQUEST_ERROR';
  }
}

function extractMessage(body, statusCode) {
  if (!body) {
    return statusCode >= 500 ? 'Error interno del servidor' : 'Solicitud inválida';
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body.message === 'string' && body.message.trim() !== '') {
    return body.message;
  }

  if (typeof body.error === 'string' && body.error.trim() !== '') {
    return body.error;
  }

  return statusCode >= 500 ? 'Error interno del servidor' : 'Solicitud inválida';
}

function normalizeErrorResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const statusCode = res.statusCode || 200;
    if (statusCode < 400) {
      return originalJson(body);
    }

    const normalizedBody = typeof body === 'object' && body !== null ? body : {};
    const code = normalizedBody.code || getDefaultCodeByStatus(statusCode);
    const message = extractMessage(body, statusCode);

    const details = { ...normalizedBody };
    delete details.code;
    delete details.message;
    delete details.error;

    const payload = { code, message };
    if (Object.keys(details).length > 0) {
      payload.details = details;
    }

    return originalJson(payload);
  };

  next();
}

module.exports = normalizeErrorResponse;

