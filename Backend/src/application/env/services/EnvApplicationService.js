/**
 * Servicio de aplicación para gestionar variables de entorno del sistema (`environment_variables`).
 * - Las operaciones expuestas por API requieren perfil `LABORATORY`.
 * - Expone `fetchSystemData()` y `getSystemValue(id)` con caché en memoria de corta duración (60s)
 *   para uso interno seguro durante generación de PDFs y órdenes de trabajo sin exponer endpoints públicos.
 */
const { Env } = require('../../../infrastructure/models');

let envCache = {
  data: null,
  expiresAt: 0
};
const ENV_CACHE_TTL_MS = 60 * 1000;

function extractEnvValue(row) {
  if (!row) return null;
  if (row.type === 'TEXT') return row.value_text;
  if (row.type === 'NUMBER') return row.value_number;
  if (row.type === 'DECIMAL') return row.value_decimal;
  if (row.type === 'TIMESTAMP') return row.value_timestamp;
  return null;
}

function invalidateEnvCache() {
  envCache = { data: null, expiresAt: 0 };
}

class EnvApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  _requireLaboratory(actionLabel) {
    const user = this.context?.user;
    if (!user || user.profile !== 'LABORATORY') {
      const err = new Error(`No tienes permisos para ${actionLabel} variables de entorno`);
      err.status = 403;
      err.code = 'LABORATORY_REQUIRED';
      throw err;
    }
  }

  /**
   * Uso interno de infraestructura/aplicación (plantillas PDF, cálculo de incertidumbre).
   */
  async fetchSystemData() {
    const now = Date.now();
    if (envCache.data && envCache.expiresAt > now) {
      return { ...envCache.data };
    }
    const rows = await Env.findAll();
    const envData = {};
    for (const row of rows) {
      envData[row.id] = extractEnvValue(row);
    }
    envCache = {
      data: envData,
      expiresAt: now + ENV_CACHE_TTL_MS
    };
    return { ...envData };
  }

  async getSystemValue(id) {
    const all = await this.fetchSystemData();
    if (Object.prototype.hasOwnProperty.call(all, id)) {
      return { id, value: all[id] };
    }
    const row = await Env.findOne({ where: { id } });
    if (!row) return null;
    return { id: row.id, value: extractEnvValue(row) };
  }

  async fetch({ mode } = {}) {
    this._requireLaboratory('obtener');
    if (mode === 'DATA') {
      return this.fetchSystemData();
    }
    const env = await Env.findAll();
    return env.map((e) => ({
      id: e.id,
      label: e.label,
      type: e.type,
      value: extractEnvValue(e),
      hardcoded: e.hardcoded
    }));
  }

  async get({ id }) {
    this._requireLaboratory('obtener');
    const env = await Env.findOne({ where: { id } });
    if (!env) {
      const err = new Error('Variable de entorno no encontrada');
      err.status = 404;
      err.code = 'ENV_NOT_FOUND';
      throw err;
    }
    return {
      id: env.id,
      label: env.label,
      type: env.type,
      value: extractEnvValue(env),
      hardcoded: env.hardcoded
    };
  }

  async update({ id, value }) {
    this._requireLaboratory('actualizar');
    const env = await Env.findOne({ where: { id } });
    if (!env) {
      const err = new Error('Variable de entorno no encontrada');
      err.status = 404;
      err.code = 'ENV_NOT_FOUND';
      throw err;
    }
    const updatePayload = {};
    if (env.type === 'TEXT') updatePayload.value_text = value;
    else if (env.type === 'NUMBER') updatePayload.value_number = value;
    else if (env.type === 'DECIMAL') updatePayload.value_decimal = value;
    else if (env.type === 'TIMESTAMP') updatePayload.value_timestamp = value;

    await env.update(updatePayload);
    invalidateEnvCache();
    return env;
  }

  async add({ id, label, type, value }) {
    this._requireLaboratory('agregar');
    const insert = {};
    if (type === 'TEXT') insert.value_text = value;
    else if (type === 'NUMBER') insert.value_number = value;
    else if (type === 'DECIMAL') insert.value_decimal = value;
    else if (type === 'TIMESTAMP') insert.value_timestamp = value;

    const env = await Env.create({ id, ...insert, label, type });
    invalidateEnvCache();
    return env;
  }

  async delete({ id }) {
    this._requireLaboratory('eliminar');
    const env = await Env.findOne({ where: { id } });
    if (!env) {
      const err = new Error('Variable de entorno no encontrada');
      err.status = 404;
      err.code = 'ENV_NOT_FOUND';
      throw err;
    }
    if (env.hardcoded) {
      const err = new Error('No se puede eliminar una variable de entorno hardcoded');
      err.status = 400;
      err.code = 'ENV_HARDCODED';
      throw err;
    }
    await env.destroy();
    invalidateEnvCache();
    return true;
  }
}

EnvApplicationService.invalidateCache = invalidateEnvCache;

module.exports = EnvApplicationService;
