/**
 * Implementación del repositorio de personas usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio Person.
 */
const { Op } = require('sequelize');
const IPersonRepository = require('../../../domain/persons/repositories/IPersonRepository');
const Person = require('../../../domain/persons/entities/Person');
const { Persons: PersonModel, ClientsContacts, Client: ClientModel, Country, District } = require('../../models');
const { escapeLike } = require('../../../shared/sqlLike');

class PersonRepository extends IPersonRepository {
  async findById(id) {
    if (id == null) throw new Error('El id es requerido');
    const personData = await PersonModel.findOne({
      where: { id },
      include: [
        { model: Country, as: 'countryData' },
        { model: District, as: 'districtData' }
      ]
    });

    if (!personData) return null;

    return this.mapToDomain(personData);
  }

  async findAll({ user = null, limit = 200 } = {}) {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 200), 500);
    const where = await this._buildTenantWhere(user);

    const personsData = await PersonModel.findAll({
      where,
      limit: safeLimit,
      include: [
        { model: Country, as: 'countryData' },
        { model: District, as: 'districtData' }
      ]
    });

    return personsData.map((person) => this.mapToDomain(person));
  }

  async _buildTenantWhere(user) {
    if (!user || user.profile !== 'CLIENT') {
      return {};
    }
    const ownedClients = await ClientModel.findAll({
      where: { user: user.id },
      attributes: ['id', 'representative', 'contact']
    });

    const clientIds = ownedClients.map((c) => c.id);
    const directPersonIds = new Set();
    for (const c of ownedClients) {
      if (c.representative) directPersonIds.add(c.representative);
      if (c.contact) directPersonIds.add(c.contact);
    }

    if (clientIds.length > 0) {
      const links = await ClientsContacts.findAll({
        where: { client: { [Op.in]: clientIds } },
        attributes: ['contact']
      });
      for (const link of links) {
        if (link.contact) directPersonIds.add(link.contact);
      }
    }

    const orClauses = [{ user_id: user.id }];
    if (directPersonIds.size > 0) {
      orClauses.push({ id: { [Op.in]: [...directPersonIds] } });
    }
    return { [Op.or]: orClauses };
  }

  async isPersonAccessibleByUser(personId, user) {
    if (!personId) return false;
    if (!user || user.profile === 'LABORATORY') return true;

    const tenantWhere = await this._buildTenantWhere(user);
    const count = await PersonModel.count({
      where: {
        [Op.and]: [{ id: personId }, tenantWhere]
      }
    });
    return count > 0;
  }

  /**
   * Búsqueda parametrizada en SQL con escape de comodines, límite de resultados y aislamiento por tenant.
   */
  async searchAvailable({ query = '', clientId = null, user = null, limit = 50 } = {}) {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
    const andConditions = [];

    const tenantWhere = await this._buildTenantWhere(user);
    if (Object.keys(tenantWhere).length > 0 || tenantWhere[Op.or]) {
      andConditions.push(tenantWhere);
    }

    if (clientId) {
      const existingLinks = await ClientsContacts.findAll({
        where: { client: clientId },
        attributes: ['contact']
      });
      const linkedIds = existingLinks.map((l) => l.contact).filter(Boolean);
      if (linkedIds.length > 0) {
        andConditions.push({ id: { [Op.notIn]: linkedIds } });
      }
    }

    const trimmed = String(query || '').trim();
    if (trimmed) {
      const escaped = `%${escapeLike(trimmed)}%`;
      andConditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: escaped } },
          { dni: { [Op.iLike]: escaped } },
          { mail: { [Op.iLike]: escaped } }
        ]
      });
    }

    const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

    const rows = await PersonModel.findAll({
      where,
      limit: safeLimit,
      order: [['name', 'ASC']],
      include: [
        { model: Country, as: 'countryData' },
        { model: District, as: 'districtData' }
      ]
    });

    return rows.map((r) => this.mapToDomain(r));
  }

  async findByUserId(userId, origin, isThirdParty) {
    if (userId == null) throw new Error('El userId es requerido');
    const where = { user_id: userId };
    if (origin != null) where.origin = origin;
    if (isThirdParty != null) where.is_third_party = isThirdParty;

    const personData = await PersonModel.findOne({
      where,
      include: [
        { model: Country, as: 'countryData' },
        { model: District, as: 'districtData' }
      ]
    });
    return personData ? this.mapToDomain(personData) : null;
  }

  async save(person, options = {}) {
    const personData = await PersonModel.create({
      name: person.name,
      dni: person.dni ?? '',
      address: person.address ?? null,
      phone: person.phone ?? null,
      mail: person.mail ?? '',
      country_code: person.country_code ?? null,
      location: person.location ?? null,
      district: person.district ?? null,
      country: person.country ?? null,
      user_id: person.userId ?? null,
      origin: person.origin ?? null,
      is_third_party: person.isThirdParty ?? false
    }, options);

    person.id = personData.id;
    return person;
  }

  async update(person) {
    const current = await PersonModel.findByPk(person.id);
    await PersonModel.update(
      {
        name: person.name,
        dni: person.dni ?? current?.dni ?? '',
        address: person.address !== undefined ? person.address : current?.address,
        phone: person.phone !== undefined ? person.phone : current?.phone,
        mail: person.mail ?? current?.mail ?? '',
        country_code: person.country_code !== undefined ? person.country_code : current?.country_code,
        location: person.location !== undefined ? person.location : current?.location,
        district: person.district !== undefined ? person.district : current?.district,
        country: person.country !== undefined ? person.country : current?.country,
        origin: person.origin !== undefined ? person.origin : current?.origin,
        is_third_party: person.isThirdParty !== undefined ? person.isThirdParty : current?.is_third_party
      },
      {
        where: { id: person.id }
      }
    );

    return person;
  }

  async delete(id) {
    await PersonModel.destroy({ where: { id } });
  }

  async linkToClient(personId, clientId) {
    const existingLink = await ClientsContacts.findOne({
      where: { contact: personId, client: clientId }
    });

    if (existingLink) {
      return existingLink;
    }

    return ClientsContacts.create({
      contact: personId,
      client: clientId
    });
  }

  async unlinkFromClient(personId, clientId) {
    if (!personId || !clientId) throw new Error('personId y clientId son requeridos');
    await ClientsContacts.destroy({
      where: { contact: personId, client: clientId }
    });
  }

  async findByClient(clientId) {
    if (!clientId) throw new Error('clientId es requerido');
    const links = await ClientsContacts.findAll({
      where: { client: clientId },
      include: [
        {
          model: PersonModel,
          as: 'contactContact',
          include: [
            { model: Country, as: 'countryData' },
            { model: District, as: 'districtData' }
          ]
        }
      ]
    });

    return links
      .filter((link) => link.contactContact)
      .map((link) => this.mapToDomain(link.contactContact));
  }

  mapToDomain(personData) {
    const person = new Person({
      id: personData.id,
      name: personData.name,
      dni: personData.dni,
      address: personData.address,
      phone: personData.phone,
      mail: personData.mail,
      country_code: personData.country_code,
      location: personData.location,
      district: personData.district,
      country: personData.country,
      userId: personData.user_id || personData.user,
      origin: personData.origin,
      isThirdParty: personData.is_third_party
    });

    person.district = personData.districtData;
    person.country = personData.countryData;

    return person;
  }
}

module.exports = PersonRepository;
