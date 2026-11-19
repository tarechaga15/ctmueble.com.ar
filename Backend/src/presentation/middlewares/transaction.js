/**
 * Middleware ligero de contexto de request.
 * Reemplaza el antiguo `transactionMiddleware` global pre-autenticación:
 * - NO abre transacciones SQL antes de autenticar/validar ni durante operaciones externas (Puppeteer/R2/AFIP).
 * - Las mutaciones de base de datos utilizan explícitamente `sequelize.withTransaction(...)` en la capa de aplicación,
 *   asegurando `await commit()` antes de enviar la respuesta HTTP y evitando agotamiento del pool en Neon.
 */
module.exports = function requestContextMiddleware(req, res, next) {
  req.transaction = null;
  req.context = {
    transaction: null,
    user: req.user || null,
    request: req,
    response: res
  };

  res.on('finish', () => {
    req.context = null;
  });

  res.on('close', () => {
    req.context = null;
  });

  return next();
};
