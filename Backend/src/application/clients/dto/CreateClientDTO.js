/**
 * DTO (Data Transfer Object) para crear un nuevo cliente.
 * Se utiliza para validar y transferir datos de creación de clientes a través de POST.
 */
class CreateClientDTO {
  /**
   * Constructor del DTO de creación de cliente.
   * @param {Object} params - Parámetros del cliente a crear
   * @param {string} params.cuit - CUIT de la empresa
   * @param {string|Object} params.address - ID de dirección existente u objeto con datos de nueva dirección
   * @param {string} [params.address.address] - Dirección física (si se proporciona objeto)
   * @param {string} [params.address.location] - Localidad (si se proporciona objeto)
   * @param {string} [params.address.province] - Provincia (si se proporciona objeto)
   * @param {string} params.representative - UUID del representante (persons.id)
   * @param {string} params.billing.cuit - CUIT de la empresa de facturación
   * @param {string} params.billing.address - Dirección de la empresa de facturación
   * @param {string} params.billing.location - Localidad de la empresa de facturación
   * @param {string} params.billing.province - Provincia de la empresa de facturación
   * @param {boolean} params.billing.paysIva - Indica si la empresa paga IVA
   * @param {string|Object} [params.contact] - UUID del contacto (persons.id) u objeto para crear nueva persona
   */
  constructor({
    cuit,
    name,
    address,
    representative,
    billing,
    contact
  }) {
    this.cuit = cuit;
    this.name = name;
    this.address = address;
    this.representative = representative;
    this.billing = billing;
    this.contact = contact;
  }

  /**
   * Valida que los campos requeridos estén presentes.
   * @throws {Error} Si faltan campos requeridos
   */
  validate() {
    if (!this.cuit) {
      throw new Error('El CUIT es requerido');
    }
    if (!this.address) {
      throw new Error('La dirección es requerida');
    }
    const cleanCuit = String(this.cuit).replace(/\D/g, '');
    const isLegal = cleanCuit.startsWith('30') || cleanCuit.startsWith('33') || cleanCuit.startsWith('34');
    if (isLegal && !this.representative) {
      throw new Error('El representante (UUID) es requerido');
    }
    if (!this.billing) {
      throw new Error('La facturación es requerida');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      cuit: this.cuit,
      name: this.name,
      address: this.address,
      representative: this.representative,
      contact: this.contact,
      billing: this.billing
    };
  }
}

module.exports = CreateClientDTO;

