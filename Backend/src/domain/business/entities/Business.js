/**
 * Entidad de dominio que representa una empresa.
 * Una empresa puede tener múltiples direcciones asociadas.
 */
class Business {
  /**
   * Constructor de la entidad Business.
   * @param {Object} params - Parámetros de la empresa
   * @param {string} params.cuit - CUIT de la empresa (identificador único)
   * @param {string} params.name - Nombre de la empresa
   * @param {Array} params.addresses - Lista de direcciones de la empresa
   */
  constructor({
    cuit,
    name,
    addresses = []
  }) {
    this.cuit = cuit;
    this.name = name;
    this.addresses = addresses;
  }

  /**
   * Agrega una nueva dirección a la empresa.
   * @param {Object} address - Objeto con los datos de la dirección
   */
  addAddress(address) {
    this.addresses.push(address);
  }

  /**
   * Actualiza una dirección existente.
   * @param {string} addressId - ID de la dirección a actualizar
   * @param {Object} addressData - Nuevos datos de la dirección
   * @throws {Error} Si la dirección no existe
   */
  updateAddress(addressId, addressData) {
    const address = this.addresses.find(a => a.id === addressId);
    if (!address) {
      throw new Error('Dirección no encontrada');
    }
    Object.assign(address, addressData);
  }

  /**
   * Elimina una dirección de la empresa.
   * @param {string} addressId - ID de la dirección a eliminar
   */
  removeAddress(addressId) {
    this.addresses = this.addresses.filter(a => a.id !== addressId);
  }
}

module.exports = Business;

