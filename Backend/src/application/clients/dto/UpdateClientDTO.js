/**
 * DTO (Data Transfer Object) para actualizar un cliente existente.
 * Se utiliza para validar y transferir datos de actualización de clientes a través de PUT.
 */
class UpdateClientDTO {
  /**
   * Constructor del DTO de actualización de cliente.
 * @param {Object} params - Parámetros del cliente a actualizar
 * @param {string} [params.address] - ID de la nueva dirección
 * @param {string|null} [params.representative] - UUID del representante (o null para desvincular)
 * @param {string|null} [params.contact] - UUID del contacto (persons.id) o null para desvincular
 * @param {Object} [params.billing] - Datos de facturación alternativa { cuit, address, location, province, paysIva }
   */
  constructor({
    name,
    address,
    representative,
    contact,
    billing
  }) {
    this.name = name;
    this.address = address;
    this.representative = representative;
    this.contact = contact;
    this.billing = billing;
  }

  /**
   * Valida que al menos un campo esté presente para actualizar.
   * @throws {Error} Si no hay campos para actualizar
   */
  validate() {
    if (
      this.name === undefined &&
      this.address === undefined &&
      this.representative === undefined &&
      this.contact === undefined &&
      this.billing === undefined
    ) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
    if (this.name !== undefined && (typeof this.name !== 'string' || this.name.trim().length === 0)) {
      throw new Error('El nombre debe ser un string no vacío');
    }
    if (this.representative !== undefined && this.representative !== null && typeof this.representative !== 'string') {
      throw new Error('El representante debe ser un UUID (string) o null');
    }
    if (this.contact !== undefined && this.contact !== null && typeof this.contact !== 'string') {
      throw new Error('El contacto debe ser un UUID (string) o null');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    const obj = {};
    if (this.name !== undefined) obj.name = this.name;
    if (this.address !== undefined) obj.address = this.address;
    if (this.representative !== undefined) obj.representative = this.representative;
    if (this.contact !== undefined) obj.contact = this.contact;
    if (this.billing !== undefined) obj.billing = this.billing;
    return obj;
  }
}

module.exports = UpdateClientDTO;

