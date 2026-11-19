/**
 * DTO (Data Transfer Object) para crear una nueva persona.
 * Se utiliza para validar y transferir datos de creación de personas a través de POST.
 */
class CreatePersonDTO {
  /**
   * Constructor del DTO de creación de persona.
   * @param {Object} params - Parámetros de la persona a crear
   * @param {string} params.name - Nombre de la persona
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
   * Valida que los campos requeridos estén presentes.
   * @throws {Error} Si faltan campos requeridos
   */
  validate() {
    if (!this.name) {
      throw new Error('El nombre de la persona es requerido');
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

module.exports = CreatePersonDTO;
