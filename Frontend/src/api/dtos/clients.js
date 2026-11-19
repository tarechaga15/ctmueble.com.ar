/**
 * DTOs de clientes. Alineados con gestion.ctmueble.com.ar/src/application/clients/dto.
 *
 * GET: ClientDTO — respuesta al obtener un cliente o lista.
 * POST: CreateClientDTO — body para crear cliente.
 * PUT: UpdateClientDTO — body para actualizar cliente.
 */

/**
 * DTO para transferir datos de clientes (GET – respuesta).
 * @typedef {Object} ClientDTO
 * @property {string} id
 * @property {string} cuit
 * @property {string} name
 * @property {Object} representative
 * @property {Object} [contact]
 * @property {Object} address
 * @property {string} origin
 * @property {string} user
 * @property {Object} [billing] - facturación alternativa (cuit, address, location, province, paysIva)
 */

/**
 * Normaliza respuesta GET de cliente.
 * @param {ClientDTO} data
 * @returns {ClientDTO}
 */
export function createClientDTO(data) {
  return {
    id: data.id,
    cuit: data.cuit,
    name: data.name,
    representative: data.representative,
    contact: data.contact ?? null,
    address: data.address,
    origin: data.origin,
    user: data.user,
    billing: data.billing ?? null,
  };
}

/**
 * DTO para crear un nuevo cliente (POST – body).
 * @typedef {Object} CreateClientDTO
 * @property {string} cuit
 * @property {string|Object} address - ID de dirección existente u objeto { address, location, province }
 * @property {string|Object} representative - UUID del representante (persons.id) u objeto para crear nueva persona
 * @property {string|Object} [contact] - UUID del contacto u objeto para crear nueva persona
 * @property {Object} [billing] - Datos de facturación alternativa { cuit, address, location, province, paysIva }
 */

/**
 * @param {CreateClientDTO} data
 * @returns {CreateClientDTO}
 */
export function createCreateClientDTO(data) {
  return {
    cuit: data.cuit,
    name: data.name,
    address: data.address,
    representative: data.representative,
    contact: data.contact,
    billing: data.billing,
  };
}

/**
 * Valida CreateClientDTO antes de POST.
 * @param {CreateClientDTO} dto
 * @throws {Error}
 */
export function validateCreateClientDTO(dto) {
  if (!dto.cuit) throw new Error("El CUIT es requerido");
  if (!dto.address) throw new Error("La dirección es requerida");
  const clean = String(dto.cuit).replace(/\D/g, "");
  const isLegal = clean.startsWith("30") || clean.startsWith("33") || clean.startsWith("34");
  if (isLegal && !dto.representative) throw new Error("El representante (UUID) es requerido");
}

/**
 * Convierte CreateClientDTO a objeto para enviar en POST.
 * @param {CreateClientDTO} dto
 * @returns {Object}
 */
export function toPlainCreateClientDTO(dto) {
  return {
    cuit: dto.cuit,
    name: dto.name,
    address: dto.address,
    representative: dto.representative,
    contact: dto.contact,
    billing: dto.billing,
  };
}

/**
 * DTO para actualizar un cliente (PUT – body).
 * @typedef {Object} UpdateClientDTO
 * @property {string} [address]
 * @property {string|null} [representative]
 * @property {string|null} [contact]
 * @property {Object} [billing] - Datos de facturación alternativa { cuit, address, location, province, paysIva }
 */

/**
 * @param {UpdateClientDTO} data
 * @returns {UpdateClientDTO}
 */
export function createUpdateClientDTO(data) {
  return {
    name: data.name,
    address: data.address,
    representative: data.representative,
    contact: data.contact,
    billing: data.billing,
  };
}

/**
 * Valida UpdateClientDTO antes de PUT.
 * @param {UpdateClientDTO} dto
 * @throws {Error}
 */
export function validateUpdateClientDTO(dto) {
  if (
    dto.name === undefined &&
    dto.address === undefined &&
    dto.representative === undefined &&
    dto.contact === undefined &&
    dto.billing === undefined
  )
    throw new Error("Debe proporcionar al menos un campo para actualizar");
  if (
    dto.representative !== undefined &&
    dto.representative !== null &&
    typeof dto.representative !== "string"
  )
    throw new Error("El representante debe ser un UUID (string) o null");
  if (
    dto.contact !== undefined &&
    dto.contact !== null &&
    typeof dto.contact !== "string"
  )
    throw new Error("El contacto debe ser un UUID (string) o null");
}

/**
 * Convierte UpdateClientDTO a objeto para enviar en PUT.
 * @param {UpdateClientDTO} dto
 * @returns {Object}
 */
export function toPlainUpdateClientDTO(dto) {
  const obj = {};
  if (dto.name !== undefined) obj.name = dto.name;
  if (dto.address !== undefined) obj.address = dto.address;
  if (dto.representative !== undefined) obj.representative = dto.representative;
  if (dto.contact !== undefined) obj.contact = dto.contact;
  if (dto.billing !== undefined) obj.billing = dto.billing;
  return obj;
}
