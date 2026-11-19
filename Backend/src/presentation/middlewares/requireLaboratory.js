/**
 * Middleware que restringe el acceso a usuarios con perfil LABORATORY.
 * Debe usarse después de verifyJWT para que req.user exista.
 */
const { sendSecurityError } = require('./securityResponse');

function requireLaboratory(req, res, next) {
  const profile = req.user?.profile;
  if (profile !== 'LABORATORY') {
    return sendSecurityError(
      res,
      req,
      403,
      'LABORATORY_REQUIRED',
      'Solo el laboratorio puede acceder a este recurso'
    );
  }
  next();
}

module.exports = requireLaboratory;
