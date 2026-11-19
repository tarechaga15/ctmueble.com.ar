/**
 * Re-exporta la instancia única de Sequelize para evitar pools duplicados hacia Neon.
 */
module.exports = require('../src/infrastructure/config/db');
