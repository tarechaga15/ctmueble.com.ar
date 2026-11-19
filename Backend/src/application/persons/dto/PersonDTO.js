/**
 * DTO (Data Transfer Object) para transferir datos de personas.
 * Representa la estructura de datos que se envía al cliente.
 * El teléfono se expone siempre como { country_code, phone }.
 */
class PersonDTO {
  /**
   * Constructor del DTO de persona.
   * @param {Object} params - Datos de la persona
   * @param {string} params.id - ID de la persona
   * @param {string} params.name - Nombre de la persona
   * @param {string} params.dni - DNI de la persona
   * @param {string} params.address - Dirección
   * @param {{ country_code: string|null, phone: string|null }} params.phone - Teléfono con código de país
   * @param {string} params.mail - Email
   * @param {string} params.location - Localidad
   * @param {Object} params.district - Datos del distrito
   * @param {Object} params.country - Datos del país
   * @param {string} params.userId - ID del usuario asociado
   */
  constructor({
    id,
    name,
    dni,
    address,
    phone,
    mail,
    location,
    district,
    country,
    userId,
    origin,
    isThirdParty
  }) {
    this.id = id;
    this.name = name;
    this.dni = dni;
    this.address = address;
    this.phone = phone ?? { country_code: null, phone: null };
    this.mail = mail;
    this.location = location;
    this.district = district;
    this.country = country;
    this.userId = userId;
    this.user = userId; // alias para compatibilidad
    this.origin = origin;
    this.isThirdParty = isThirdParty;
  }
}

module.exports = PersonDTO;
