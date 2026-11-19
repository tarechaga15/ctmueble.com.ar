/**
 * Servicio de infraestructura para hashear y verificar contraseñas (bcrypt).
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Genera hash de una contraseña en texto plano.
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
async function hash(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verifica si la contraseña en texto plano coincide con el hash.
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashPassword - Hash almacenado
 * @returns {Promise<boolean>} True si coinciden
 */
async function compare(plainPassword, hashPassword) {
  return bcrypt.compare(plainPassword, hashPassword);
}

module.exports = {
  hash,
  compare
};
