/**
 * Entidad de dominio que representa una persona.
 * Una persona puede estar asociada a un ensayo o cliente.
 */
class Person {
  /**
   * Constructor de la entidad Person.
   * @param {Object} params - Parámetros de la persona
   * @param {string} params.name - Nombre de la persona
   * @param {string} [params.phone] - Teléfono: string o objeto { country_code: string, phone: string }
   * @param {string} [params.country_code] - Código de país (usado si phone es string)
   */
  constructor({
    id,
    name,
    dni,
    address,
    phone,
    mail,
    country_code,
    location,
    district,
    country,
    userId,
    origin,
    isThirdParty
  }) {
    const { phone: phoneValue, country_code: countryCodeValue } = this._normalizePhone(phone, country_code);
    this.id = id;
    this.name = name;
    this.dni = dni;
    this.address = address;
    this.phone = phoneValue;
    this.mail = mail;
    this.country_code = countryCodeValue;
    this.location = location;
    this.district = district;
    this.country = country;
    this.userId = userId;
    this.origin = origin || null;
    this.isThirdParty = Boolean(isThirdParty);
  }

  /**
   * Normaliza phone: acepta string o objeto { country_code, phone }.
   * @private
   */
  _normalizePhone(phone, country_code) {
    if (phone != null && typeof phone === 'object' && !Array.isArray(phone)) {
      return {
        phone: phone.phone ?? null,
        country_code: phone.country_code ?? country_code ?? null
      };
    }
    return { phone: phone ?? null, country_code: country_code ?? null };
  }

  /**
   * Actualiza los datos de la persona.
   * @param {Object} data - Objeto con los nuevos datos a actualizar
   */
  update(data) {
    Object.assign(this, data);
  }
  /**
   * Valida la información y que cumpla con los formatos requeridos.
   * Lanza un error si algún campo no cumple los requisitos.
   */
  validate() {
    // Validaciones básicas
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      throw new Error('El nombre es requerido y debe ser un string no vacío');
    }
    if (this.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.mail)) {
      throw new Error('El formato del mail no es válido');
    }
    const phoneNum = this.phone != null ? String(this.phone).trim() : '';
    if (phoneNum.length > 0 && !/^[\d\s()+-]{6,20}$/.test(phoneNum)) {
      throw new Error('El formato del teléfono no es válido');
    }
    if (this.country_code != null && this.country_code !== '') {
      const cc = String(this.country_code).trim();
      if (cc.length > 0 && !/^\d{1,4}$/.test(cc)) {
        throw new Error('El código de país debe ser numérico (1 a 4 dígitos)');
      }
    }
    if (!this.userId || typeof this.userId !== 'string' || this.userId.trim().length === 0) {
      throw new Error('El usuario es requerido y debe ser un string no vacío');
    }
    if (!this.origin || typeof this.origin !== 'string' || this.origin.trim().length === 0) {
      throw new Error('El origen es requerido y debe ser un string no vacío');
    }
    if (typeof this.isThirdParty !== 'boolean') {
      throw new Error('El tercer party es requerido y debe ser un booleano');
    }
  }
}

module.exports = Person;
