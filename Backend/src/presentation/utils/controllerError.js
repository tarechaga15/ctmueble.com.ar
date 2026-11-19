/**
 * Helper unificado para respuestas de error en controladores HTTP.
 * - Respeta `error.status` / `error.statusCode` cuando proviene de reglas de dominio/aplicación (400/401/403/404/409/422).
 * - Sanitiza mensajes internos y excepciones técnicas para no exponer detalles SQL, excepciones de base de datos ni trazas internas al cliente.
 */

function isTechnicalOrDatabaseError(error) {
  if (!error) return false;
  if (
    error instanceof TypeError ||
    error instanceof ReferenceError ||
    error instanceof RangeError ||
    error instanceof SyntaxError ||
    error instanceof URIError
  ) {
    return true;
  }
  const name = String(error.name || '');
  if (
    name.startsWith('Sequelize') ||
    name.includes('Database') ||
    name.includes('Connection') ||
    name.includes('Postgres') ||
    name.includes('Timeout')
  ) {
    return true;
  }
  const msg = String(error.message || '');
  if (
    /violates foreign key|violates unique|violates not-null|relation .* does not exist|syntax error at or near|cannot read propert|is not defined|invalid status code|sql: /i.test(
      msg
    )
  ) {
    return true;
  }
  return false;
}

function handleControllerError(res, error, contextLabel = 'Controller') {
  const rawStatus = Number(error?.status || error?.statusCode);
  let status = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599 ? rawStatus : 500;

  const isTechnical = isTechnicalOrDatabaseError(error);
  if (isTechnical) {
    status = 500;
  }

  // Errores de validación de DTOs sin `.status` explícito -> 400 Bad Request
  if (
    status === 500 &&
    !isTechnical &&
    error &&
    typeof error.message === 'string' &&
    /(es requerido|son requeridos|obligatorio|inválid|no válido|al menos un|debe ser|formato)/i.test(error.message)
  ) {
    status = 400;
  }

  if (status >= 500 || isTechnical) {
    console.error(`[${contextLabel}]`, error?.stack || error?.message || error);
  }

  const safeMessage =
    status >= 500 || isTechnical
      ? 'Ocurrió un error inesperado al procesar la solicitud. Por favor, intente nuevamente más tarde.'
      : error?.message || 'Error al procesar la solicitud';

  const defaultCode = status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR';
  const code = error?.code && !isTechnical ? error.code : defaultCode;

  const body = {
    code,
    error: safeMessage,
    message: safeMessage
  };

  return res.status(status).json(body);
}

module.exports = {
  handleControllerError,
  isTechnicalOrDatabaseError
};

