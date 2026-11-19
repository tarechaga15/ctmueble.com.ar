/**
 * Servicio de aplicación para gestionar clientes.
 * - Aislamiento multi-tenant estricto: un usuario `CLIENT` únicamente puede leer, modificar,
 *   eliminar o gestionar contactos de sus propios clientes (`client.userId === user.id`).
 * - Mutaciones compuestas envueltas en `withTransaction`.
 */
const ClientDTO = require('../dto/ClientDTO');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val) {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

function httpError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

class ClientApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  async _runInTransaction(workFn) {
    let db = null;
    try {
      db = require('../../../infrastructure/config/db');
    } catch (_) {
      // Módulo no disponible en tests unitarios puros
    }

    if (db && typeof db.withTransaction === 'function') {
      return await db.withTransaction(workFn);
    }
    return workFn(null);
  }

  _assertCanAccessClient(client, { requireOwnership = false } = {}) {
    if (!client) {
      throw httpError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
    }
    const user = this.context?.user;
    if (!user) {
      throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    }
    if (user.profile === 'CLIENT') {
      if (!client.userId || String(client.userId) !== String(user.id)) {
        throw httpError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
      }
      if (client.origin && client.origin !== 'CLIENT') {
        throw httpError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
      }
      return;
    }
    if (requireOwnership && client.userId && String(client.userId) !== String(user.id)) {
      throw httpError('No tienes permisos sobre este cliente', 403, 'CLIENT_FORBIDDEN');
    }
  }

  async getClient(id) {
    if (!id) throw httpError('ID de cliente requerido', 400, 'CLIENT_ID_REQUIRED');
    const client = await this.clientRepository.findById(id);
    this._assertCanAccessClient(client);
    return this.mapToDTO(client);
  }

  async getAllClients() {
    const user = this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');

    if (user.profile === 'CLIENT') {
      const clients = await this.clientRepository.findAllByUserAndOrigin(user.id, 'CLIENT');
      return clients.map((client) => this.mapToDTO(client));
    }
    if (user.profile === 'LABORATORY') {
      const clients = typeof this.clientRepository.findAllByOrigin === 'function'
        ? await this.clientRepository.findAllByOrigin('LABORATORY')
        : await this.clientRepository.findAllByUserAndOrigin(user.id, 'LABORATORY');
      const seenCuits = new Set();
      const uniqueClients = [];
      for (const client of clients) {
        const key = client.cuit || client.id;
        if (!seenCuits.has(key)) {
          seenCuits.add(key);
          uniqueClients.push(client);
        }
      }
      return uniqueClients.map((client) => this.mapToDTO(client));
    }
    return [];
  }

  async createClient(data, user) {
    user = user || this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const origin = this.clientOriginService.determineOrigin(user);

    const savedClient = await this._runInTransaction(async () => {
      let addressValue = data.address;
      if (typeof data.address === 'object' && data.address !== null) {
        const provCode = (data.address.province || data.address.district || '').toString().trim();
        addressValue = {
          address: data.address.address,
          location: data.address.location || data.address.province,
          province: provCode,
          district: provCode || null
        };
      }

      let representativeId = null;
      if (data.representative) {
        if (typeof data.representative === 'object') {
          const representative = await this.personService.createPerson(data.representative, true);
          representativeId = representative.id;
        } else if (typeof data.representative === 'string') {
          representativeId = data.representative;
        }
      }

      let contactId = null;
      if (user.profile === 'CLIENT') {
        const personForUser = await this.personService.getPersonForUser(user.id, 'CLIENT', false);
        if (personForUser && personForUser.id) {
          contactId = personForUser.id;
        } else if (typeof data.contact === 'string') {
          contactId = data.contact;
        } else if (typeof data.contact === 'object') {
          const contact = await this.personService.createPerson(data.contact, false);
          contactId = contact.id;
        }
      } else {
        if (typeof data.contact === 'string') {
          contactId = data.contact;
        } else if (typeof data.contact === 'object') {
          const contact = await this.personService.createPerson(data.contact, true);
          contactId = contact.id;
        }
      }

      const billing = {
        cuit: data.billing?.cuit ?? null,
        address: data.billing?.address ?? null,
        location: data.billing?.location ?? null,
        province: data.billing?.province ?? null,
        paysIva: data.billing?.paysIva ?? null
      };

      const client = new this.client({
        name: data.name ?? null,
        cuit: data.cuit,
        address: addressValue,
        representative: representativeId,
        contact: contactId,
        origin,
        userId: user.id,
        billing
      });

      await client.validate();
      return this.clientRepository.save(client);
    });

    return this.getClient(savedClient.id);
  }

  async updateClient(id, data) {
    if (!id) throw httpError('ID de cliente requerido', 400, 'CLIENT_ID_REQUIRED');

    await this._runInTransaction(async () => {
      const client = await this.clientRepository.findById(id);
      this._assertCanAccessClient(client, { requireOwnership: this.context?.user?.profile === 'CLIENT' });

      if (data.name !== undefined) {
        client.updateName(data.name);
      }
      if (data.representative !== undefined) {
        client.updateRepresentative(data.representative);
      }
      if (data.contact !== undefined) {
        client.updateContact(data.contact);
      }
      if (data.address !== undefined) {
        let addressValue = data.address;
        if (typeof data.address === 'object' && data.address !== null) {
          const provCode = (data.address.province || data.address.district || '').toString().trim();
          addressValue = {
            address: data.address.address,
            location: data.address.location || data.address.province,
            province: provCode,
            district: provCode || null
          };
        }
        client.updateAddress(addressValue);
      }
      if (data.billing !== undefined) {
        const billing = {
          cuit: data.billing?.cuit ?? client.billing_cuit ?? null,
          address: data.billing?.address ?? client.billing_address ?? null,
          location: data.billing?.location ?? client.billing_location ?? null,
          province: data.billing?.province
            ? String(data.billing.province).trim()
            : client.billing_province ?? null,
          paysIva: data.billing?.paysIva !== undefined ? data.billing.paysIva : client.billing_pays_iva ?? null
        };
        client.updateBilling(billing);
      }

      await this.clientRepository.update(client);
    });

    return this.getClient(id);
  }

  async deleteClient(id) {
    if (!id) throw httpError('ID de cliente requerido', 400, 'CLIENT_ID_REQUIRED');
    const client = await this.clientRepository.findById(id);
    const user = this.context?.user;
    if (!user) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');

    if (user.profile === 'CLIENT') {
      this._assertCanAccessClient(client, { requireOwnership: true });
      if (String(client.userId) !== String(user.id)) {
        throw httpError('No tienes permisos para eliminar este cliente', 403, 'CLIENT_FORBIDDEN');
      }
    } else if (user.profile === 'LABORATORY') {
      this._assertCanAccessClient(client, { requireOwnership: false });
      if (client.origin !== 'LABORATORY') {
        throw httpError('No tienes permisos para eliminar este cliente', 403, 'CLIENT_FORBIDDEN');
      }
    }

    await this.clientRepository.delete(client.id);
    return true;
  }

  async getScheduledClients() {
    const user = this.context?.user;
    if (!user?.id) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (user.profile !== 'LABORATORY') {
      return this.getAllClients();
    }
    const clients = typeof this.clientRepository.findAllByOrigin === 'function'
      ? await this.clientRepository.findAllByOrigin('LABORATORY')
      : await this.clientRepository.findAllByUserAndOrigin(user.id, 'LABORATORY');
    const seenCuits = new Set();
    const uniqueClients = [];
    for (const client of clients) {
      const key = client.cuit || client.id;
      if (!seenCuits.has(key)) {
        seenCuits.add(key);
        uniqueClients.push(client);
      }
    }
    return uniqueClients.map((c) => this.mapToDTO(c));
  }

  async searchClientsByNameOrCuit(search) {
    const term = (search || '').trim();
    const user = this.context?.user;
    if (!user) {
      throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    }

    const baseList = user.profile === 'LABORATORY' ? await this.getScheduledClients() : await this.getAllClients();
    if (!term) return baseList;
    const lower = term.toLowerCase();
    return baseList.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const businessName = (c.business?.name || '').toLowerCase();
      const cuit = String(c.cuit || '');
      return name.includes(lower) || businessName.includes(lower) || cuit.includes(term);
    });
  }

  async searchClientsByBusiness(search) {
    return this.searchClientsByNameOrCuit(search);
  }

  async getOrCreateClientForEssay(data, user) {
    const effectiveUser = user || this.context?.user;
    if (!effectiveUser) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (data?.id || data?.clientId) {
      return this.getClient(data.id || data.clientId);
    }
    return this.createClient(data, effectiveUser);
  }

  async addScheduledClient(params) {
    const userId = this.context?.user?.id;
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (this.context?.user?.profile !== 'LABORATORY') {
      throw httpError('Solo el perfil laboratorio puede agendar clientes', 403, 'LABORATORY_REQUIRED');
    }

    const clientId = typeof params === 'string' ? params : (params?.clientId || params?.id);
    const cuit = typeof params === 'object' ? params?.cuit : null;
    const contactId = typeof params === 'object' ? (params?.contactId || params?.contact?.id || (typeof params?.contact === 'string' ? params.contact : null)) : null;
    const updateData = typeof params === 'object' ? (params?.updateData || params) : null;

    const targetId = await this._runInTransaction(async () => {
      let baseClient = null;
      let essayClient = null;

      if (clientId && isUuid(clientId)) {
        baseClient = await this.clientRepository.findById(clientId);
        if (!baseClient) {
          try {
            const { EssayClient: EssayClientModel } = require('../../../infrastructure/models');
            if (EssayClientModel) {
              essayClient = await EssayClientModel.findByPk(clientId);
            }
          } catch (_) {}
        }
      }
      if (!baseClient && (cuit || essayClient?.cuit)) {
        baseClient = await this.clientRepository.findByCuit(cuit || essayClient?.cuit);
      }

      const cuitToUse = cuit || essayClient?.cuit || baseClient?.cuit;
      if (!cuitToUse) {
        throw httpError('CUIT o clientId requerido para agendar', 400, 'CUIT_REQUIRED');
      }

      let scheduledClient = null;
      if (typeof this.clientRepository.findOneByCuitAndOrigin === 'function') {
        scheduledClient = await this.clientRepository.findOneByCuitAndOrigin(cuitToUse, 'LABORATORY');
      } else {
        scheduledClient = await this.clientRepository.findOneByCuitUserAndOrigin(
          cuitToUse,
          userId,
          'LABORATORY'
        );
      }

      const contactToLink = contactId || essayClient?.contact;

      if (scheduledClient) {
        if (contactToLink) {
          await this.clientRepository.addContactToClient(scheduledClient.id, contactToLink);
        }
        if (updateData) {
          if (updateData.name) scheduledClient.updateName(updateData.name);
          if (updateData.address) scheduledClient.updateAddress(updateData.address);
          if (updateData.representative) scheduledClient.updateRepresentative(updateData.representative);
          if (updateData.billing) scheduledClient.updateBilling(updateData.billing);
          await this.clientRepository.update(scheduledClient);
        }
        return scheduledClient.id;
      }

      let addressValue = null;
      if (typeof updateData?.address === 'string') {
        addressValue = updateData.address;
      } else if (updateData?.address && typeof updateData.address === 'object') {
        addressValue = { ...updateData.address };
        if (!addressValue.id) {
          addressValue.id = baseClient?.addressId || (typeof baseClient?.address === 'string' ? baseClient.address : null) || essayClient?.address || null;
        }
      } else {
        addressValue = (baseClient ? (baseClient.addressId || baseClient.address) : null) || essayClient?.address || null;
      }

      const rawRep = updateData?.representative;
      let representativeId = (typeof rawRep === 'string' ? rawRep : rawRep?.id) ||
        (baseClient ? baseClient.representativeId : null) ||
        essayClient?.representative ||
        null;

      const primaryContactId = contactToLink ||
        (typeof updateData?.contact === 'string' ? updateData.contact : updateData?.contact?.id) ||
        (baseClient ? baseClient.contactId : null) ||
        null;

      const cleanCuit = String(cuitToUse || '').replace(/\D/g, '');
      const isLegal = cleanCuit.startsWith('30') || cleanCuit.startsWith('33') || cleanCuit.startsWith('34');
      if (isLegal && !representativeId && primaryContactId) {
        representativeId = primaryContactId;
      }

      const billingValue = updateData?.billing ||
        (baseClient ? baseClient.billing : null) ||
        (essayClient ? {
          cuit: essayClient.billing_cuit,
          address: essayClient.billing_address,
          location: essayClient.billing_location,
          province: essayClient.billing_province,
          paysIva: essayClient.billing_iva
        } : null);

      const nameValue = updateData?.name ||
        (baseClient ? baseClient.name : null) ||
        essayClient?.name ||
        null;

      const scheduled = new this.client({
        name: nameValue,
        cuit: cuitToUse,
        address: addressValue,
        representative: representativeId,
        contact: primaryContactId,
        origin: 'LABORATORY',
        userId,
        billing: billingValue
      });

      await scheduled.validate();
      const saved = await this.clientRepository.save(scheduled);
      if (primaryContactId && saved?.id) {
        await this.clientRepository.addContactToClient(saved.id, primaryContactId);
      }
      return saved.id;
    });

    return this.getClient(targetId);
  }

  async isClientScheduled(options = {}) {
    const userId = this.context?.user?.id;
    if (!userId) return { scheduled: false, isContactLinked: false, clientId: null };
    const clientId = typeof options === 'string' ? options : (options?.clientId || options?.id);
    const cuit = typeof options === 'object' ? options?.cuit : null;
    const contactId = typeof options === 'object' ? (options?.contactId || options?.contact?.id || (typeof options?.contact === 'string' ? options.contact : null)) : null;

    let scheduledClient = null;
    let cuitToCheck = cuit;

    if (clientId && isUuid(clientId)) {
      const c = await this.clientRepository.findById(clientId);
      if (c && c.origin === 'LABORATORY') {
        scheduledClient = c;
      } else if (c?.cuit) {
        cuitToCheck = c.cuit;
      } else {
        try {
          const { EssayClient: EssayClientModel } = require('../../../infrastructure/models');
          if (EssayClientModel) {
            const ec = await EssayClientModel.findByPk(clientId);
            if (ec?.cuit) {
              cuitToCheck = ec.cuit;
            }
          }
        } catch (_) {}
      }
    }
    if (!scheduledClient && cuitToCheck) {
      if (typeof this.clientRepository.findOneByCuitAndOrigin === 'function') {
        scheduledClient = await this.clientRepository.findOneByCuitAndOrigin(cuitToCheck, 'LABORATORY');
      } else {
        scheduledClient = await this.clientRepository.findOneByCuitUserAndOrigin(cuitToCheck, userId, 'LABORATORY');
      }
    }

    const isScheduled = !!scheduledClient;
    let isContactLinked = false;
    if (scheduledClient && contactId) {
      isContactLinked = await this.clientRepository.isContactLinked(scheduledClient.id, contactId);
    }

    return {
      scheduled: isScheduled,
      clientId: scheduledClient?.id || null,
      isContactLinked
    };
  }

  async getContactsByClient(clientId) {
    if (!clientId) throw httpError('clientId es requerido', 400, 'CLIENT_ID_REQUIRED');
    const client = await this.clientRepository.findById(clientId);
    this._assertCanAccessClient(client);
    const contacts = await this.clientRepository.getContactsByClientId(clientId);
    return contacts.map((c) => this.personService.mapToDTO(c));
  }

  async addContactToClient(clientId, contactInput) {
    if (!clientId) throw httpError('clientId es requerido', 400, 'CLIENT_ID_REQUIRED');
    const client = await this.clientRepository.findById(clientId);
    this._assertCanAccessClient(client, { requireOwnership: this.context?.user?.profile === 'CLIENT' });

    await this._runInTransaction(async () => {
      let personId = typeof contactInput === 'string' ? contactInput : contactInput?.contactId;
      if (!personId && typeof contactInput === 'object' && contactInput !== null) {
        const personDTO = await this.personService.createPerson(
          {
            ...contactInput,
            origin: this.context?.user?.profile || 'CLIENT',
            isThirdParty: true
          },
          true
        );
        personId = personDTO.id;
      }
      if (!personId) throw httpError('No se pudo determinar el solicitante', 400, 'CONTACT_REQUIRED');

      // Verificar que la persona a vincular pertenezca o sea accesible para el usuario
      await this.personService.getPerson(personId);
      await this.clientRepository.addContactToClient(clientId, personId);
    });

    return this.getContactsByClient(clientId);
  }

  async removeContactFromClient(clientId, contactId) {
    if (!clientId || !contactId) {
      throw httpError('clientId y contactId son requeridos', 400, 'PARAMS_REQUIRED');
    }
    const client = await this.clientRepository.findById(clientId);
    this._assertCanAccessClient(client, { requireOwnership: this.context?.user?.profile === 'CLIENT' });
    await this.clientRepository.removeContactFromClient(clientId, contactId);
    return { success: true };
  }

  mapToDTO(client) {
    const formatDistrict = (d) => {
      if (!d) return null;
      if (typeof d === 'object' && d.id) return { id: d.id, name: d.name ?? null };
      if (typeof d === 'string') return { id: d, name: null };
      return null;
    };

    const formatPhone = (person) => {
      if (person && (person.phone != null || person.country_code != null)) {
        return {
          country_code: person.country_code ?? null,
          phone: person.phone ?? null
        };
      }
      return null;
    };

    const formatPerson = (p, includeIsThirdParty = false) => {
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        dni: p.dni,
        address: p.address,
        location: p.location,
        district: formatDistrict(p.district ?? p.districtData),
        mail: p.mail,
        phone: formatPhone(p),
        country: p.countryData ?? p.country ?? null,
        country_code: p.country_code,
        origin: p.origin ?? null,
        userId: p.user_id ?? p.userId ?? null,
        user: p.user_id ?? p.userId ?? null,
        isThirdParty: includeIsThirdParty ? p.is_third_party ?? p.isThirdParty ?? false : undefined
      };
    };

    const contactPayload = formatPerson(client.contact);
    const representativePayload = formatPerson(client.representative, true);

    const billingPayload = {
      cuit: client.billing_cuit,
      address: client.billing_address,
      location: client.billing_location,
      province: client.billing_province ? String(client.billing_province).trim() : null,
      paysIva: client.billing_pays_iva
    };

    const districtSource = client.address?.districtData ?? client.address?.district ?? client.address?.province;
    const addressPayload = client.address
      ? {
          id: client.address.id,
          address: client.address.address,
          location: client.address.location,
          province: client.address.province
            ? String(client.address.province).trim()
            : typeof client.address.district === 'object'
            ? client.address.district?.id
            : client.address.district,
          district: formatDistrict(districtSource),
          origin: client.address.origin,
          userId: client.address.user ?? null,
          user: client.address.user ?? null
        }
      : client.address;

    return new ClientDTO({
      id: client.id,
      cuit: client.cuit,
      name: client.name,
      representative: representativePayload,
      contact: contactPayload,
      contacts: (client.contacts || []).map((c) => formatPerson(c)),
      address: addressPayload,
      origin: client.origin,
      user: client.userId,
      billing: billingPayload
    });
  }
}

module.exports = ClientApplicationService;
