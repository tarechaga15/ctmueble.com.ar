/**
 * Entidad de dominio que representa el snapshot del cliente asociado a un ensayo (essay_client).
 * Contiene id, cuit, representative, address, contact y billing desagregados,
 * compatible con el mapeo desde BD y con saveEssayClient.
 */
class EssayClient {
  /**
   * Constructor de la entidad EssayClient.
   * @param {Object} params - Parámetros del cliente del ensayo
   * @param {string} [params.id] - ID del registro essay_client (solo cuando viene de BD)
   * @param {string} params.cuit - CUIT del cliente
   * @param {string} [params.name] - Razón social / nombre de la empresa (desde Bussiness)
   * @param {Object} [params.representative] - Representante { id, name, dni, contactId? }
   * @param {Object} [params.address] - Dirección { id?, address, location, province }
   * @param {Object} [params.contact] - Contacto del ensayo { id, name, dni, address, location, district, country, country_code, mail, phone }. phone puede ser string o { country_code, phone }
   * @param {Object} [params.billing] - Facturación { cuit, address, location, province, paysIva }
   */
  constructor({
    id,
    cuit,
    name,
    representative,
    address,
    contact,
    billing
  }) {
    this.id = id ?? null;
    this.cuit = cuit ?? null;
    this.name = name ?? null;
    this.representative = representative ?? null;
    this.address = address ?? null;
    this.contact = contact ?? null;
    this.billing = billing ?? null;
  }

  /**
   * Normaliza el teléfono del contacto: acepta string o objeto { country_code, phone } (p. ej. PersonDTO).
   * @param {string|Object|null} phone - Teléfono en string o { country_code, phone }
   * @param {string|null} countryCodeFallback - Código de país si phone es string
   * @returns {{ phone: string|null, country_code: string|null }}
   */
  static _normalizeContactPhone(phone, countryCodeFallback = null) {
    if (phone != null && typeof phone === 'object' && !Array.isArray(phone)) {
      return {
        phone: phone.phone ?? null,
        country_code: phone.country_code ?? countryCodeFallback ?? null
      };
    }
    return {
      phone: typeof phone === 'string' ? phone : (phone ?? null),
      country_code: countryCodeFallback ?? null
    };
  }

  /**
   * Crea un EssayClient a partir del cliente cargado (Client entity o ClientDTO)
   * para usarlo en saveEssayClient.
   * @param {Object} client - Cliente con address, representative, contact, billing (ej. ClientDTO de getClient)
   * @returns {EssayClient} Entidad EssayClient
   */
  static fromClient(client, contactOverride = null) {
    const addr = client.address || {};
    const rep = client.representative || {};
    const essayContact = contactOverride || client.contact;
    const billing = client.billing || {};
    const normalizedPhone = essayContact
      ? EssayClient._normalizeContactPhone(
          essayContact.phone,
          essayContact.country_code ?? essayContact.countryCode ?? null
        )
      : { phone: null, country_code: null };

    const rawDistrict = essayContact.district;
    const contactDistrict = (typeof rawDistrict === 'object' && rawDistrict !== null)
      ? (rawDistrict.id ?? null)
      : (essayContact.district ?? null);

    const rawCountry = essayContact.country;
    const contactCountry = (typeof rawCountry === 'object' && rawCountry !== null)
      ? (rawCountry.id ?? null)
      : (essayContact.country ?? null);

    const contactPayload = essayContact
      ? {
          id: essayContact.id,
          name: essayContact.name ?? null,
          dni: essayContact.dni ?? null,
          address: essayContact.address ?? null,
          location: essayContact.location ?? null,
          district: contactDistrict ? String(contactDistrict).trim().slice(0, 6) : null,
          country: contactCountry ? String(contactCountry).trim().slice(0, 2) : null,
          country_code: normalizedPhone.country_code,
          mail: essayContact.mail ?? null,
          phone: normalizedPhone.phone
        }
      : null;

    const rawRepId = (typeof rep.id === 'object' && rep.id !== null) ? rep.id.id : rep.id;
    const cleanRepId = (typeof rawRepId === 'string' && rawRepId.trim() && rawRepId.trim() !== '[object Object]')
      ? rawRepId.trim()
      : null;
    const repName = (typeof rep.name === 'string' && rep.name.trim()) ? rep.name.trim() : null;
    const repDni = (typeof rep.dni === 'string' && rep.dni.trim()) ? rep.dni.trim() : (rep.dni ? String(rep.dni).trim() : null);

    const repContact = rep.contactData || rep.contact;
    const rawRepContactId = (repContact && typeof repContact === 'object') ? (repContact.id ?? repContact.contact ?? null) : repContact;
    const cleanRepContactId = (typeof rawRepContactId === 'string' && rawRepContactId.trim() && rawRepContactId.trim() !== '[object Object]') ? rawRepContactId.trim() : null;

    const representativePayload = (cleanRepId || repName || repDni)
      ? {
          id: cleanRepId,
          name: repName,
          dni: repDni,
          contactId: cleanRepContactId
        }
      : null;

    const rawAddrId = (typeof addr.id === 'object' && addr.id !== null) ? addr.id.id : addr.id;
    const cleanAddrId = (typeof rawAddrId === 'string' && rawAddrId.trim() && rawAddrId.trim() !== '[object Object]') ? rawAddrId.trim() : null;

    return new EssayClient({
      cuit: client.cuit,
      name: client.name ?? client.bussiness?.name ?? client.business?.name ?? (client.contact ? (client.contact.name || null) : null),
      representative: representativePayload,
      address: addr.address != null || addr.location != null || addr.province != null || cleanAddrId != null
        ? {
            id: cleanAddrId,
            address: addr.address ?? null,
            location: addr.location ?? null,
            province: addr.province ?? null
          }
        : null,
      contact: contactPayload,
      billing: billing.cuit != null || billing.address != null || billing.paysIva != null
        ? {
            cuit: billing.cuit ?? null,
            address: billing.address ?? null,
            location: billing.location ?? null,
            province: billing.province ?? null,
            paysIva: billing.paysIva ?? null
          }
        : null
    });
  }

  /**
   * Devuelve el payload en formato de persistencia para saveEssayClient (essay_client).
   * @param {string} essayId - ID del ensayo
   * @returns {Object} Objeto listo para EssayClientModel.create()
   */
  toPersistencePayload(essayId) {
    const addr = this.address || {};
    const rep = this.representative || {};
    const essayContact = this.contact || {};
    const billing = this.billing || {};
    const normalizedPhone = EssayClient._normalizeContactPhone(
      essayContact.phone,
      essayContact.country_code ?? essayContact.countryCode ?? null
    );
    const rawCountryCode = normalizedPhone.country_code ?? essayContact.country_code ?? essayContact.countryCode;
    const cleanCountryCode = rawCountryCode != null
      ? (typeof rawCountryCode === 'object' ? (rawCountryCode.country_code || rawCountryCode.id) : String(rawCountryCode).replace(/\D/g, '').slice(0, 3))
      : null;

    const rawDistrict = essayContact.district;
    const contactDistrict = (typeof rawDistrict === 'object' && rawDistrict !== null)
      ? (rawDistrict.id ?? null)
      : (essayContact.districtId ?? rawDistrict ?? null);

    const rawCountry = essayContact.country;
    const contactCountry = (typeof rawCountry === 'object' && rawCountry !== null)
      ? (rawCountry.id ?? null)
      : (essayContact.countryId ?? rawCountry ?? null);

    const rawAddrId = (typeof addr.id === 'object' && addr.id !== null) ? addr.id.id : addr.id;
    const cleanAddrId = (typeof rawAddrId === 'string' && rawAddrId.trim() && rawAddrId.trim() !== '[object Object]') ? rawAddrId.trim() : null;

    const rawRepId = (typeof rep.id === 'object' && rep.id !== null) ? rep.id.id : rep.id;
    const cleanRepId = (typeof rawRepId === 'string' && rawRepId.trim() && rawRepId.trim() !== '[object Object]') ? rawRepId.trim() : null;

    const rawContactId = (typeof essayContact.id === 'object' && essayContact.id !== null) ? essayContact.id.id : essayContact.id;
    const cleanContactId = (typeof rawContactId === 'string' && rawContactId.trim() && rawContactId.trim() !== '[object Object]') ? rawContactId.trim() : null;

    return {
      essay: essayId,
      cuit: this.cuit,
      name: this.name ?? null,
      address: cleanAddrId,
      representative: cleanRepId,
      contact: cleanContactId,
      address_address: addr.address ?? null,
      address_location: addr.location ?? null,
      address_province: addr.province ?? null,
      representative_name: rep.name ?? null,
      representative_dni: rep.dni ?? null,
      representative_contact: rep.contactId ?? null,
      contact_name: essayContact.name ?? null,
      contact_dni: essayContact.dni ?? null,
      contact_mail: essayContact.mail ?? null,
      contact_country_code: cleanCountryCode ? String(cleanCountryCode).trim().slice(0, 3) : null,
      contact_phone: normalizedPhone.phone,
      contact_address: essayContact.address ?? null,
      contact_location: essayContact.location ?? null,
      contact_district: contactDistrict ? String(contactDistrict).trim().slice(0, 6) : null,
      contact_country: contactCountry ? String(contactCountry).trim().slice(0, 2) : null,
      billing_cuit: billing.cuit ?? null,
      billing_address: billing.address ?? null,
      billing_location: billing.location ?? null,
      billing_province: billing.province ?? null,
      billing_iva: billing.paysIva ?? null
    };
  }
}

module.exports = EssayClient;
