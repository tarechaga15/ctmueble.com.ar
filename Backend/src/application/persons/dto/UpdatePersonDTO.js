/**
 * DTO (Data Transfer Object) para actualizar una persona existente.
 * Se utiliza para validar y transferir datos de actualización de personas a través de PUT.
 */
class UpdatePersonDTO {
  /**
   * Constructor del DTO de actualización de persona.
   * @param {Object} params - Parámetros de la persona a actualizar
   * @param {string} [params.name] - Nombre de la persona
   * @param {string} [params.dni] - DNI de la persona
   * @param {string} [params.address] - Dirección de la persona
   * @param {string} [params.phone] - Teléfono de la persona
   * @param {string} [params.mail] - Email de la persona
   * @param {string} [params.countryCode] - Código de país
   * @param {string} [params.location] - Localidad
   * @param {string} [params.districtId] - ID del distrito
   * @param {string} [params.countryId] - ID del país
   */
  constructor({
    name,
    dni,
    address,
    phone,
    mail,
    countryCode,
    location,
    districtId,
    countryId
  }) {
    this.name = name;
    this.dni = dni;
    this.address = address;
    this.phone = phone;
    this.mail = mail;
    this.countryCode = countryCode;
    this.location = location;
    this.districtId = districtId;
    this.countryId = countryId;
  }

  /**
   * Valida que al menos un campo esté presente para actualizar.
   * @throws {Error} Si no hay campos para actualizar
   */
  validate() {
    const hasAnyField = 
      this.name !== undefined ||
      this.dni !== undefined ||
      this.address !== undefined ||
      this.phone !== undefined ||
      this.mail !== undefined ||
      this.countryCode !== undefined ||
      this.location !== undefined ||
      this.districtId !== undefined ||
      this.countryId !== undefined;

    if (!hasAnyField) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      name: this.name,
      dni: this.dni,
      address: this.address,
      phone: this.phone,
      mail: this.mail,
      countryCode: this.countryCode,
      location: this.location,
      districtId: this.districtId,
      countryId: this.countryId
    };
  }
}

module.exports = UpdatePersonDTO;
