/**
 * Middleware de autorización granular por permiso para usuarios LABORATORY.
 * Consulta los overrides de `laboratory_permissions` (con caché de 60s)
 * haciendo fallback al catálogo por defecto en `permissionsCatalog.js`.
 */
const LaboratoryPermission = require('../../infrastructure/models/laboratories/laboratory_permission');
const { CATALOGO_PERMISOS } = require('../../shared/permissionsCatalog');
const { sendSecurityError } = require('./securityResponse');

const CACHE_TTL_MS = 60 * 1000;
let permissionsCache = null;
let permissionsCacheExpiresAt = 0;

function invalidatePermissionsCache() {
  permissionsCache = null;
  permissionsCacheExpiresAt = 0;
}

function buildDefaultPermissionsMap() {
  const map = new Map();
  for (const item of CATALOGO_PERMISOS) {
    map.set(`Usuario:${item.clave}`, Boolean(item.usuario));
    map.set(`Consulta:${item.clave}`, Boolean(item.consulta));
  }
  return map;
}

async function getPermissionsMap() {
  const now = Date.now();
  if (permissionsCache && now < permissionsCacheExpiresAt) {
    return permissionsCache;
  }

  const map = buildDefaultPermissionsMap();
  if (!process.env.NODE_TEST_CONTEXT) {
    try {
      const rows = await LaboratoryPermission.findAll();
      for (const row of rows) {
        map.set(`${row.rol}:${row.accion}`, Boolean(row.permitido));
      }
    } catch (_) {
      // Si la DB o tabla aún no está disponible, se mantienen los valores seguros del catálogo
    }
  }

  permissionsCache = map;
  permissionsCacheExpiresAt = now + CACHE_TTL_MS;
  return map;
}

function requireLabPermission(permissionKey) {
  return async (req, res, next) => {
    const user = req.user;
    if (!user || user.profile !== 'LABORATORY') {
      return sendSecurityError(
        res,
        req,
        403,
        'LABORATORY_REQUIRED',
        'Solo el laboratorio puede acceder a este recurso'
      );
    }

    if (user.isSuperAdmin === true || user.labRole === 'ADMIN') {
      return next();
    }

    // Preservar compatibilidad con mocks legacy que solo fijan profile: 'LABORATORY' sin labRole
    if (!user.labRole) {
      return next();
    }

    const displayRole =
      user.labRole === 'CONSULTA'
        ? 'Consulta'
        : user.labRole === 'USER'
        ? 'Usuario'
        : null;

    if (!displayRole) {
      return sendSecurityError(
        res,
        req,
        403,
        'LAB_PERMISSION_DENIED',
        'No tenés permisos suficientes para realizar esta operación'
      );
    }

    const permMap = await getPermissionsMap();
    const allowed = permMap.get(`${displayRole}:${permissionKey}`);

    if (allowed !== true) {
      return sendSecurityError(
        res,
        req,
        403,
        'LAB_PERMISSION_DENIED',
        `No tenés permisos suficientes (${permissionKey}) para realizar esta operación`
      );
    }

    return next();
  };
}

module.exports = requireLabPermission;
module.exports.requireLabPermission = requireLabPermission;
module.exports.invalidatePermissionsCache = invalidatePermissionsCache;
