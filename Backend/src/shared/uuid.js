/**
 * Helper para usar uuid (módulo ESM) desde CommonJS.
 * Evita ERR_REQUIRE_ESM usando import() dinámico.
 */
let cachedV4 = null;

/**
 * Genera un UUID v4. Usar con await en contextos async.
 * @returns {Promise<string>}
 */
async function getUuidV4() {
  if (!cachedV4) {
    const uuid = await import('uuid');
    cachedV4 = uuid.v4;
  }
  return cachedV4();
}

module.exports = { getUuidV4 };
