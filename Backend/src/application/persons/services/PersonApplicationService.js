/**
 * Servicio de aplicación para gestionar personas.
 * - Aislamiento multi-tenant estricto para evitar exposición de PII (DNI, teléfono, domicilio, correo).
 * - Búsqueda en SQL con escape de comodines y límite de filas (`searchAvailable`).
 */
const PersonDTO = require('../dto/PersonDTO');

function httpError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

class PersonApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  async _assertUserCanAccessPerson(person) {
    if (!person) {
      throw httpError('Persona no encontrada', 404, 'PERSON_NOT_FOUND');
    }
    const user = this.context?.user;
    if (!user) {
      throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    }
    if (user.profile === 'LABORATORY') {
      return;
    }
    if (person.userId && String(person.userId) === String(user.id)) {
      return;
    }
    if (typeof this.personRepository.isPersonAccessibleByUser === 'function') {
      const accessible = await this.personRepository.isPersonAccessibleByUser(person.id, user);
      if (accessible) return;
    }
    throw httpError('Persona no encontrada', 404, 'PERSON_NOT_FOUND');
  }

  async _assertUserCanAccessClient(clientId) {
    if (!clientId) throw httpError('clientId es requerido', 400, 'CLIENT_ID_REQUIRED');
    const user = this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (user.profile === 'LABORATORY') return;

    if (!this.clientRepository) {
      throw httpError('No tienes permisos sobre este cliente', 403, 'CLIENT_FORBIDDEN');
    }
    const client = await this.clientRepository.findById(clientId);
    if (!client || String(client.userId) !== String(user.id)) {
      throw httpError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
    }
  }

  async getPerson(id) {
    if (!id) throw httpError('ID de persona requerido', 400, 'PERSON_ID_REQUIRED');
    const person = await this.personRepository.findById(id);
    await this._assertUserCanAccessPerson(person);
    return this.mapToDTO(person);
  }

  async getPersonForUser(userId, origin, isThirdParty) {
    if (!userId) return null;
    return this.personRepository.findByUserId(userId, origin, isThirdParty);
  }

  async getAllPersons() {
    const user = this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const persons = await this.personRepository.findAll({ user, limit: 200 });
    return persons.map((person) => this.mapToDTO(person));
  }

  async createPerson(data, isThirdParty = false) {
    const user = this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');

    const normalized = this._normalizePhoneInput(data);
    const effectiveThirdParty = Boolean(isThirdParty || normalized.isThirdParty === true);

    if (!effectiveThirdParty) {
      await this.personValidationService.validateClientCanCreatePerson(user, async (uid) =>
        this.personRepository.findByUserId(uid, 'CLIENT', false)
      );
    }

    const assignUserId = this.personValidationService.shouldAssignUserId(user, effectiveThirdParty);

    const person = new this.person({
      ...normalized,
      userId: assignUserId ? user.id : null,
      origin: user.profile === 'CLIENT' ? 'CLIENT' : 'LABORATORY',
      isThirdParty: effectiveThirdParty
    });

    await person.validate();
    return this.mapToDTO(await this.personRepository.save(person));
  }

  _normalizePhoneInput(data) {
    const out = { ...data };
    if (out.phone != null && typeof out.phone === 'object' && !Array.isArray(out.phone)) {
      out.country_code =
        out.phone.country_code ?? out.phone.countryCode ?? out.country_code ?? out.countryCode ?? null;
      out.phone = out.phone.phone ?? null;
    }
    if (out.countryCode && !out.country_code) {
      out.country_code = out.countryCode;
    }
    return out;
  }

  async updatePerson(id, data) {
    if (!id) throw httpError('ID de persona requerido', 400, 'PERSON_ID_REQUIRED');
    const person = await this.personRepository.findById(id);
    await this._assertUserCanAccessPerson(person);

    const normalized = this._normalizePhoneInput(data);
    const updatePayload = {
      ...normalized,
      district: normalized.districtId !== undefined ? normalized.districtId : normalized.district,
      country_code: normalized.countryCode !== undefined ? normalized.countryCode : normalized.country_code,
      country: normalized.countryId !== undefined ? normalized.countryId : normalized.country
    };
    delete updatePayload.districtId;
    delete updatePayload.countryId;
    delete updatePayload.countryCode;

    const merged = {
      id: person.id,
      name: updatePayload.name !== undefined ? updatePayload.name : person.name,
      dni: updatePayload.dni !== undefined ? updatePayload.dni : person.dni,
      address: updatePayload.address !== undefined ? updatePayload.address : person.address,
      phone: updatePayload.phone !== undefined ? updatePayload.phone : person.phone,
      mail: updatePayload.mail !== undefined ? updatePayload.mail : person.mail,
      country_code: updatePayload.country_code !== undefined ? updatePayload.country_code : person.country_code,
      location: updatePayload.location !== undefined ? updatePayload.location : person.location,
      district:
        updatePayload.district !== undefined ? updatePayload.district : person.district?.id ?? person.district,
      country: updatePayload.country !== undefined ? updatePayload.country : person.country?.id ?? person.country,
      userId: person.userId,
      origin: person.origin,
      isThirdParty: person.isThirdParty
    };

    const personEntity = new this.person(merged);
    await personEntity.validate();
    await this.personRepository.update(personEntity);

    if (this.userRepository && person.userId && (updatePayload.name || updatePayload.dni)) {
      try {
        const linkedUser = await this.userRepository.findById(person.userId);
        if (linkedUser) {
          if (updatePayload.name) linkedUser.name = String(updatePayload.name).trim();
          if (updatePayload.dni) linkedUser.dni = String(updatePayload.dni).trim();
          await this.userRepository.update(linkedUser);
        }
      } catch (_) {}
    }

    const updated = await this.personRepository.findById(id);
    return this.mapToDTO(updated);
  }

  async getMyPersonProfile() {
    const userId = this.context?.user?.id;
    if (!userId) return null;
    const person = await this.personRepository.findByUserId(userId, null, false);
    return person ? this.mapToDTO(person) : null;
  }

  async getPersonsByClient(clientId) {
    if (!clientId) return [];
    await this._assertUserCanAccessClient(clientId);
    const persons = await this.personRepository.findByClient(clientId);
    return persons.map((p) => this.mapToDTO(p));
  }

  async linkPersonToClient(personId, clientId) {
    if (!personId || !clientId) {
      throw httpError('personId y clientId son requeridos', 400, 'PARAMS_REQUIRED');
    }
    await this._assertUserCanAccessClient(clientId);
    const person = await this.personRepository.findById(personId);
    await this._assertUserCanAccessPerson(person);
    await this.personRepository.linkToClient(personId, clientId);
  }

  async unlinkPersonFromClient(personId, clientId) {
    if (!personId || !clientId) {
      throw httpError('personId y clientId son requeridos', 400, 'PARAMS_REQUIRED');
    }
    await this._assertUserCanAccessClient(clientId);
    await this.personRepository.unlinkFromClient(personId, clientId);
  }

  async searchAvailablePersons(searchTerm, userOverride = null, clientId = null) {
    const user = userOverride || this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');

    if (typeof this.personRepository.searchAvailable === 'function') {
      const results = await this.personRepository.searchAvailable({
        query: typeof searchTerm === 'string' ? searchTerm : '',
        clientId,
        user,
        limit: 50
      });
      return results.map((p) => this.mapToDTO(p)).filter(Boolean);
    }

    return [];
  }

  mapToDTO(person) {
    if (!person) return null;
    const formatDistrict = (d) => {
      if (!d) return null;
      if (typeof d === 'object' && d.id) return { id: d.id, name: d.name ?? null };
      if (typeof d === 'string') return { id: d, name: null };
      return null;
    };
    const formatCountry = (c) => {
      if (!c) return null;
      if (typeof c === 'object' && c.id) {
        return { id: c.id, name: c.name ?? null, country_code: c.country_code ?? null };
      }
      if (typeof c === 'string') return { id: c, name: null };
      return null;
    };
    let phone = null;
    if (person.phone != null && typeof person.phone === 'object') {
      phone = {
        country_code: person.phone.country_code ?? person.country_code ?? null,
        phone: person.phone.phone ?? null
      };
    } else if (person.phone != null || person.country_code != null) {
      phone = {
        country_code: person.country_code ?? null,
        phone: person.phone ?? null
      };
    }
    return new PersonDTO({
      id: person.id,
      name: person.name,
      dni: person.dni,
      address: person.address,
      phone,
      mail: person.mail,
      location: person.location,
      district: formatDistrict(person.district),
      country: formatCountry(person.country),
      userId: person.userId,
      origin: person.origin || null,
      isThirdParty: person.isThirdParty ?? false
    });
  }
}

module.exports = PersonApplicationService;
