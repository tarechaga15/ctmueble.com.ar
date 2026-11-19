'use strict';

/**
 * Serialización canónica y determinista de datos (RFC 8785 JSON Canonicalization Scheme).
 * Garantiza que dos estructuras equivalentes produzcan exactamente la misma cadena UTF-8
 * sin importar el orden de inserción de las propiedades ni las diferencias de plataforma.
 */
function canonicalize(data) {
  if (data === null || data === undefined) {
    return 'null';
  }

  const type = typeof data;

  if (type === 'boolean') {
    return data ? 'true' : 'false';
  }

  if (type === 'number') {
    if (!Number.isFinite(data)) {
      return 'null';
    }
    return String(data);
  }

  if (type === 'string') {
    return JSON.stringify(data);
  }

  if (data instanceof Date) {
    return JSON.stringify(data.toISOString());
  }

  if (Array.isArray(data)) {
    const elements = data.map((item) => canonicalize(item));
    return `[${elements.join(',')}]`;
  }

  if (type === 'object') {
    // Si tiene toJSON (como modelos Sequelize o clases de dominio)
    if (typeof data.toJSON === 'function') {
      return canonicalize(data.toJSON());
    }

    const keys = Object.keys(data)
      .filter((k) => data[k] !== undefined && typeof data[k] !== 'function')
      .sort();

    const pairs = keys.map((key) => {
      const val = canonicalize(data[key]);
      return `${JSON.stringify(key)}:${val}`;
    });

    return `{${pairs.join(',')}}`;
  }

  return 'null';
}

module.exports = {
  canonicalize
};
