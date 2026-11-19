/**
 * Entidad de dominio que representa un cliente.
 * Un cliente es una empresa que solicita ensayos.
 */
class Client {
  /**
   * Constructor de la entidad Client.
   * @param {Object} params - Parámetros del cliente
   * @param {string} params.id - Identificador único del cliente
   * @param {string} params.cuit - CUIT de la empresa
   * @param {string} params.name - Nombre de la empresa
   * @param {string} params.address - Dirección del cliente
   * @param {string} params.representative - Representante del cliente
   * @param {string} params.contact - Contacto del cliente
   * @param {string} params.origin - Origen del cliente (CLIENT o LABORATORY)
   * @param {string} params.userId - ID del usuario que creó el cliente
   * @param {Object} [params.billing] - Datos de facturación alternativa (cuit, address, location, province, paysIva)
   */
  constructor({
    id,
    name,
    cuit,
    address,
    representative,
    contact,
    contacts,
    origin,
    userId,
    billing
  }) {
    this.id = id;
    this.name = name;
    this.cuit = cuit;
    this.address = address;
    this.representative = representative;
    this.contact = contact;
    this.contacts = Array.isArray(contacts) && contacts.length > 0 ? contacts : (contact ? [contact] : []);
    this.origin = origin;
    this.userId = userId;
    this.billing_cuit = billing?.cuit;
    this.billing_address = billing?.address;
    this.billing_location = billing?.location;
    this.billing_province = billing?.province;
    this.billing_pays_iva = billing?.paysIva;
  }

  get addressId() {
    return typeof this.address === 'string' ? this.address : this.address?.id;
  }

  get representativeId() {
    return typeof this.representative === 'string' ? this.representative : this.representative?.id;
  }

  get contactId() {
    return typeof this.contact === 'string' ? this.contact : this.contact?.id;
  }

  /**
   * Actualiza el representante del cliente.
   * @param {Object} representative - Representante del cliente
   */
  /**
   * Actualiza el nombre del cliente.
   * @param {string} name - Nombre del cliente
   */
  updateName(name) {
    this.name = name;
  }

  updateRepresentative(representative) {
    this.representative = representative;
  }

  /**
   * Actualiza la dirección del cliente.
   * @param {Object} address - Dirección del cliente
   */
  updateAddress(address) {
    this.address = address;
  }

  /**
   * Actualiza el contacto del cliente.
   * @param {Object} contact - Contacto del cliente
   */
  updateContact(contact) {
    this.contact = contact;
  }

  /**
   * Actualiza los datos de facturación alternativa.
   * @param {Object} billing - { cuit, address, location, province, paysIva }
   */
  updateBilling(billing) {
    this.billing_cuit = billing?.cuit;
    this.billing_address = billing?.address;
    this.billing_location = billing?.location;
    this.billing_province = billing?.province;
    this.billing_pays_iva = billing?.paysIva;
  }
  /**
   * Valida la información y que cumpla con los formatos requeridos.
   * Lanza un error si algún campo no cumple los requisitos.
   */
  validate() {
    if (!this.cuit || !/^\d{11}$/.test(String(this.cuit))) {
      throw new Error('El CUIT es requerido y debe tener 11 dígitos numéricos');
    }
    if (!this.address) {
      throw new Error('La dirección es requerida');
    }
    if (typeof this.address === 'string' && this.address.trim().length === 0) {
      throw new Error('La dirección es requerida y debe ser un string no vacío');
    }
    if (typeof this.address === 'object' && (!this.address.address || String(this.address.address).trim().length === 0)) {
      throw new Error('La dirección es requerida');
    }
    const cleanCuit = String(this.cuit || '').replace(/\D/g, '');
    const isLegal = cleanCuit.startsWith('30') || cleanCuit.startsWith('33') || cleanCuit.startsWith('34');
    if (isLegal) {
      if (!this.representative || typeof this.representative !== 'string' || this.representative.trim().length === 0) {
        throw new Error('El representante es requerido y debe ser un string no vacío');
      }
    }
    if (!this.contact || typeof this.contact !== 'string' || this.contact.trim().length === 0) {
      throw new Error('El contacto es requerido y debe ser un string no vacío');
    }
    if(this.billing_cuit && !/^\d{11}$/.test(String(this.billing_cuit))) {
      throw new Error('El CUIT de facturación es requerido y debe tener 11 dígitos numéricos');
    }
    if (this.billing_address !== undefined && this.billing_address !== null) {
      if (typeof this.billing_address !== 'string' || this.billing_address.trim().length === 0) {
        throw new Error('La dirección de facturación es requerida y debe ser un string no vacío');
      }
    }
    if (this.billing_location !== undefined && this.billing_location !== null) {
      if (typeof this.billing_location !== 'string' || this.billing_location.trim().length === 0) {
        throw new Error('La localidad de facturación es requerida y debe ser un string no vacío');
      }
    }
    if (this.billing_province !== undefined && this.billing_province !== null) {
      if (typeof this.billing_province !== 'string' || this.billing_province.trim().length === 0) {
        throw new Error('La provincia de facturación es requerida y debe ser un string no vacío');
      }
    }
    if (this.billing_pays_iva !== undefined && this.billing_pays_iva !== null) {
      if (typeof this.billing_pays_iva !== 'boolean') {
        throw new Error('El pago de IVA es requerido y debe ser un booleano');
      }
    }
    if (!this.origin || typeof this.origin !== 'string' || this.origin.trim().length === 0) {
      throw new Error('El origen es requerido y debe ser un string no vacío');
    }
    if (!this.userId || typeof this.userId !== 'string' || this.userId.trim().length === 0) {
      throw new Error('El usuario es requerido y debe ser un string no vacío');
    }
    return true;
  }
  
}

module.exports = Client;

