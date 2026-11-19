/**
 * DTO (Data Transfer Object) para transferir datos de clientes.
 * Representa la estructura de datos que se envía al cliente.
 */
class ClientDTO {
  /**
   * Constructor del DTO de cliente.
   * @param {Object} params - Datos del cliente
   * @param {string} params.id - ID del cliente
   * @param {string} params.cuit - CUIT de la empresa
   * @param {string} params.name - Nombre de la empresa
   * @param {Object} params.representative - Datos del representante
   * @param {Object} [params.contact] - Datos del contacto (persona vinculada)
   * @param {Object} params.address - Dirección del cliente
   * @param {string} params.origin - Origen del cliente
   * @param {string} params.user - ID del usuario asociado
   * @param {Object} [params.billing] - Datos de facturación alternativa (cuit, address, location, province, paysIva)
   */
  constructor({
    id,
    cuit,
    name,
    representative,
    contact,
    contacts,
    address,
    origin,
    user,
    billing
  }) {
    this.id = id;
    this.cuit = cuit;
    this.name = name;
    this.representative = representative;
    this.contact = contact;
    this.contacts = Array.isArray(contacts) && contacts.length > 0 ? contacts : (contact ? [contact] : []);
    this.address = address;
    this.origin = origin;
    this.user = user;
    this.billing = billing ?? null;
  }
}

module.exports = ClientDTO;

