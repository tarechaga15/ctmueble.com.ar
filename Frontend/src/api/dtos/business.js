/**
 * DTOs de empresas. Alineados con gestion.ctmueble.com.ar/src/application/business/dto.
 *
 * GET: BusinessDTO — respuesta al obtener datos de empresa.
 */

/**
 * DTO para transferir datos de empresas (GET – respuesta).
 * @typedef {Object} BusinessDTO
 * @property {string} name
 * @property {string} cuit
 * @property {Array<Object>} [addresses]
 */

/**
 * Normaliza respuesta GET de empresa.
 * @param {BusinessDTO} data
 * @returns {BusinessDTO}
 */
export function createBusinessDTO(data) {
  return {
    name: data.name,
    cuit: data.cuit,
    addresses: data.addresses ?? [],
  };
}
