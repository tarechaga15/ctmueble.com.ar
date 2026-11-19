/**
 * DTOs de personas. Alineados con gestion.ctmueble.com.ar/src/application/persons/dto.
 *
 * GET: PersonDTO — respuesta al obtener una persona o lista.
 * POST: CreatePersonDTO — body para crear persona.
 * PUT: UpdatePersonDTO — body para actualizar persona.
 */

/**
 * DTO para transferir datos de personas (GET – respuesta).
 * @typedef {Object} PersonDTO
 * @property {string} id
 * @property {string} name
 * @property {string} dni
 * @property {string} address
 * @property {string} phone
 * @property {string} mail
 * @property {string} countryCode
 * @property {string} location
 * @property {Object} district
 * @property {Object} country
 * @property {string} user
 * @property {string} [origin]
 * @property {boolean} [isThirdParty]
 */

/**
 * Normaliza respuesta GET de persona.
 * @param {PersonDTO} data
 * @returns {PersonDTO}
 */
export function createPersonDTO(data) {
  return {
    id: data.id,
    name: data.name,
    dni: data.dni,
    address: data.address,
    phone: data.phone,
    mail: data.mail,
    countryCode: data.countryCode,
    location: data.location,
    district: data.district,
    country: data.country,
    user: data.user,
    origin: data.origin,
    isThirdParty: data.isThirdParty,
  };
}

/**
 * DTO para crear una persona (POST – body).
 * @typedef {Object} CreatePersonDTO
 * @property {string} name
 * @property {string} [dni]
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [mail]
 * @property {string} [countryCode]
 * @property {string} [location]
 * @property {string} [districtId]
 * @property {string} [countryId]
 */

export function createCreatePersonDTO(data) {
  return {
    name: data.name,
    dni: data.dni,
    address: data.address,
    phone: data.phone,
    mail: data.mail,
    countryCode: data.countryCode,
    location: data.location,
    districtId: data.districtId,
    countryId: data.countryId,
  };
}

/**
 * Valida CreatePersonDTO antes de POST.
 * @param {CreatePersonDTO} dto
 * @throws {Error}
 */
export function validateCreatePersonDTO(dto) {
  if (!dto.name) throw new Error("El nombre de la persona es requerido");
}

/**
 * Convierte CreatePersonDTO a objeto para enviar en POST.
 * @param {CreatePersonDTO} dto
 * @returns {Object}
 */
export function toPlainCreatePersonDTO(dto) {
  return {
    name: dto.name,
    dni: dto.dni,
    address: dto.address,
    phone: dto.phone,
    mail: dto.mail,
    countryCode: dto.countryCode,
    location: dto.location,
    districtId: dto.districtId,
    countryId: dto.countryId,
  };
}

/**
 * DTO para actualizar una persona (PUT – body).
 * @typedef {Object} UpdatePersonDTO
 * @property {string} [name]
 * @property {string} [dni]
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [mail]
 * @property {string} [countryCode]
 * @property {string} [location]
 * @property {string} [districtId]
 * @property {string} [countryId]
 */

export function createUpdatePersonDTO(data) {
  return {
    name: data.name,
    dni: data.dni,
    address: data.address,
    phone: data.phone,
    mail: data.mail,
    countryCode: data.countryCode,
    location: data.location,
    districtId: data.districtId,
    countryId: data.countryId,
  };
}

/**
 * Valida UpdatePersonDTO antes de PUT.
 * @param {UpdatePersonDTO} dto
 * @throws {Error}
 */
export function validateUpdatePersonDTO(dto) {
  const hasAny =
    dto.name !== undefined ||
    dto.dni !== undefined ||
    dto.address !== undefined ||
    dto.phone !== undefined ||
    dto.mail !== undefined ||
    dto.countryCode !== undefined ||
    dto.location !== undefined ||
    dto.districtId !== undefined ||
    dto.countryId !== undefined;
  if (!hasAny) throw new Error("Debe proporcionar al menos un campo para actualizar");
}

/**
 * Convierte UpdatePersonDTO a objeto para enviar en PUT.
 * @param {UpdatePersonDTO} dto
 * @returns {Object}
 */
export function toPlainUpdatePersonDTO(dto) {
  const obj = {};
  if (dto.name !== undefined) obj.name = dto.name;
  if (dto.dni !== undefined) obj.dni = dto.dni;
  if (dto.address !== undefined) obj.address = dto.address;
  if (dto.phone !== undefined) obj.phone = dto.phone;
  if (dto.mail !== undefined) obj.mail = dto.mail;
  if (dto.countryCode !== undefined) obj.countryCode = dto.countryCode;
  if (dto.location !== undefined) obj.location = dto.location;
  if (dto.districtId !== undefined) obj.districtId = dto.districtId;
  if (dto.countryId !== undefined) obj.countryId = dto.countryId;
  return obj;
}
