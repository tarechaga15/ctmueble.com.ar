/**
 * DTO (Data Transfer Object) para transferir datos de empresas.
 * Representa la estructura de datos que se envía al cliente.
 */
class BusinessDTO {
  /**
   * Constructor del DTO de empresa.
   * @param {Object} params - Datos de la empresa
   * @param {string} params.name - Nombre de la empresa
   * @param {string} params.cuit - CUIT de la empresa
   * @param {Array} params.addresses - Lista de direcciones
   */
  constructor({
    name,
    cuit,
    addresses = [],
    source = null
  }) {
    this.name = name;
    this.cuit = cuit;
    this.addresses = addresses;
    this.source = source;
  }
  toJSON() {
    return {
      name: this.name,
      cuit: this.cuit,
      addresses: this.addresses,
      source: this.source
    };
  }
}

module.exports = BusinessDTO;

