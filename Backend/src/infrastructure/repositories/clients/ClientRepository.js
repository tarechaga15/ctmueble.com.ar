/**
 * Implementación del repositorio de clientes usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio Client.
 */
const IClientRepository = require('../../../domain/clients/repositories/IClientRepository');
const Client = require('../../../domain/clients/entities/Client');
const { Client: ClientModel, Bussiness, BussinessAddress, Persons, Country, District, ClientsContacts } = require('../../models');

class ClientRepository extends IClientRepository {
  async findById(id) {
    const clientData = await ClientModel.findOne({
      where: { id },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      plain: true,
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Persons,
          as: 'representativeRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: Persons,
          as: 'contactRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: ClientsContacts,
          as: 'contacts',
          required: false,
          include: [
            {
              model: Persons,
              as: 'contactContact',
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        }
      ]
    });

    if (!clientData) return null;

    return this.mapToDomain(clientData);
  }

  async findAll() {
    const clientsData = await ClientModel.findAll({
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Persons,
          as: 'representativeRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: Persons,
          as: 'contactRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: ClientsContacts,
          as: 'contacts',
          required: false,
          include: [
            {
              model: Persons,
              as: 'contactContact',
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        }
      ]
    });

    return clientsData.map(client => this.mapToDomain(client));
  }

  /**
   * Busca un cliente por su CUIT usando Sequelize.
   * @param {string} cuit - CUIT del cliente
   * @returns {Promise<Client|null>} Entidad Client o null si no existe
   */
  async findByCuit(cuit) {
    const clientData = await ClientModel.findOne({
      where: { cuit },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
      ]
    });
    return clientData ? this.mapToDomain(clientData) : null;
  }

  /**
   * Busca un cliente por CUIT y origen (sin filtrar por usuario específico).
   * Útil para saber si un cliente ya fue agendado por el laboratorio.
   * @param {string} cuit
   * @param {string} origin
   * @returns {Promise<Client|null>}
   */
  async findOneByCuitAndOrigin(cuit, origin) {
    const clientData = await ClientModel.findOne({
      where: { cuit, origin },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Persons, 
          as: 'representativeRef', 
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        { 
          model: Persons, 
          as: 'contactRef', 
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        }
      ]
    });
    return clientData ? this.mapToDomain(clientData) : null;
  }

  /**
   * Busca un cliente por CUIT, usuario y origen.
   * Útil para saber si ya existe una copia agendada para un laboratorio.
   * @param {string} cuit
   * @param {string} userId
   * @param {string} origin
   * @returns {Promise<Client|null>}
   */
  async findOneByCuitUserAndOrigin(cuit, userId, origin) {
    const clientData = await ClientModel.findOne({
      where: { cuit, user: userId, origin },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Persons,
          as: 'representativeRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: Persons,
          as: 'contactRef',
          attributes: [
            'id',
            'name',
            'dni',
            'address',
            'location',
            'district',
            'country',
            'mail',
            'phone',
            'country_code',
            'origin',
            'user_id',
            'is_third_party'
          ],
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        },
        {
          model: ClientsContacts,
          as: 'contacts',
          required: false,
          include: [
            {
              model: Persons,
              as: 'contactContact',
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        }
      ]
    });

    return clientData ? this.mapToDomain(clientData) : null;
  }

  /**
   * Obtiene todos los clientes de un origen dado (independientemente del usuario creador).
   * Útil para perfiles como LABORATORY donde todos los usuarios del laboratorio
   * comparten la misma agenda de clientes.
   * @param {string} origin
   * @returns {Promise<Client[]>}
   */
  async findAllByOrigin(origin) {
    const clientsData = await ClientModel.findAll({
      where: { origin },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Persons, 
          as: 'representativeRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }, { model: Country, as: 'countryData', attributes: ['id', 'name'] }]
        },
        { 
          model: Persons, 
          as: 'contactRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }, { model: Country, as: 'countryData', attributes: ['id', 'name'] }]
        },
        {
          model: ClientsContacts,
          as: 'contacts',
          required: false,
          include: [
            {
              model: Persons,
              as: 'contactContact',
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        }
      ]
    });

    return clientsData.map(client => this.mapToDomain(client));
  }

  /**
   * Lista todos los clientes de un usuario y origen concreto.
   * Se usa para obtener los clientes agendados del laboratorio.
   * @param {string} userId
   * @param {string} origin
   * @returns {Promise<Client[]>}
   */
  async findAllByUserAndOrigin(userId, origin) {
    const clientsData = await ClientModel.findAll({
      where: { user: userId, origin },
      attributes: ['id', 'name', 'cuit', 'address', 'address_address', 'address_location', 'address_province', 'address_district', 'representative', 'contact', 'origin', 'user', 'billing_cuit', 'billing_address', 'billing_location', 'billing_province', 'billing_iva'],
      include: [
        { model: Bussiness, as: 'bussiness', attributes: ['name'], required: false },
        { 
          model: BussinessAddress, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          required: false,
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        {
          model: District,
          as: 'clientDistrictData',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Persons, 
          as: 'representativeRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }, { model: Country, as: 'countryData', attributes: ['id', 'name'] }]
        },
        { 
          model: Persons, 
          as: 'contactRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }, { model: Country, as: 'countryData', attributes: ['id', 'name'] }]
        },
        {
          model: ClientsContacts,
          as: 'contacts',
          required: false,
          include: [
            {
              model: Persons,
              as: 'contactContact',
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        }
      ]
    });

    return clientsData.map(client => this.mapToDomain(client));
  }

  /**
   * Guarda un nuevo cliente usando Sequelize.
   * Convierte la entidad de dominio a formato Sequelize.
   * @param {Client} client - Entidad Client a guardar
   * @returns {Promise<Client>} Entidad Client con ID asignado
   */
  async save(client) {
    let addressFk = null;
    let addressAddress = null;
    let addressLocation = null;
    let addressProvince = null;
    let addressDistrict = null;

    if (typeof client.address === 'string') {
      addressFk = client.address;
    } else if (client.address && typeof client.address === 'object') {
      addressFk = client.address.id ?? null;
      addressAddress = client.address.address ?? null;
      addressLocation = client.address.location ?? null;
      addressProvince = client.address.province ?? null;
      addressDistrict = typeof client.address.district === 'object' ? client.address.district?.id : (client.address.district ?? null);
    }

    const clientData = await ClientModel.create({
      cuit: client.cuit,
      name: client.name ?? null,
      address: addressFk,
      address_address: addressAddress,
      address_location: addressLocation,
      address_province: addressProvince,
      address_district: addressDistrict,
      representative: client.representativeId,
      contact: client.contactId ?? null,
      origin: client.origin,
      user: client.userId,
      billing_cuit: client.billing_cuit ?? null,
      billing_address: client.billing_address ?? null,
      billing_location: client.billing_location ?? null,
      billing_province: client.billing_province ?? null,
      billing_iva: client.billing_pays_iva ?? null
    });

    return this.mapToDomain(clientData);
  }

  /**
   * Actualiza un cliente existente usando Sequelize.
   * @param {Client} client - Entidad Client con los cambios
   * @returns {Promise<Client>} Entidad Client actualizada
   */
  async update(client) {
    const updates = {
      representative: client.representativeId,
      address: client.addressId
    };
    if (client.name !== undefined) updates.name = client.name;
    if (client.address && typeof client.address === 'object') {
      if (client.address.address !== undefined) updates.address_address = client.address.address;
      if (client.address.location !== undefined) updates.address_location = client.address.location;
      if (client.address.province !== undefined) updates.address_province = client.address.province;
      if (client.address.district !== undefined) {
        updates.address_district = typeof client.address.district === 'object' ? client.address.district?.id : client.address.district;
      }
    }
    if (client.contactId !== undefined) updates.contact = client.contactId;
    if (
      client.billing_cuit !== undefined ||
      client.billing_address !== undefined ||
      client.billing_location !== undefined ||
      client.billing_province !== undefined ||
      client.billing_pays_iva !== undefined
    ) {
      updates.billing_cuit = client.billing_cuit ?? null;
      updates.billing_address = client.billing_address ?? null;
      updates.billing_location = client.billing_location ?? null;
      updates.billing_province = client.billing_province ?? null;
      updates.billing_iva = client.billing_pays_iva ?? null;
    }
    await ClientModel.update(updates, { where: { id: client.id } });

    return client;
  }

  /**
   * Elimina un cliente por su ID usando Sequelize.
   * @param {string} id - ID del cliente a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    await ClientModel.destroy({ where: { id } });
  }

  /**
   * Convierte un modelo de Sequelize a una entidad de dominio Client.
   * Mapea las relaciones y datos anidados.
   * @param {Object} clientData - Modelo de Sequelize
   * @returns {Client} Entidad Client de dominio
   */
  mapToDomain(clientData) {
    const hasBilling =
      clientData?.billing_cuit != null ||
      clientData?.billing_address != null ||
      clientData?.billing_location != null ||
      clientData?.billing_province != null ||
      clientData?.billing_iva != null;

    const billing = hasBilling
      ? {
          cuit: clientData.billing_cuit ?? null,
          address: clientData.billing_address ?? null,
          location: clientData.billing_location ?? null,
          province: clientData.billing_province ?? null,
          paysIva: clientData.billing_iva ?? null,
        }
      : null;

    // Resolver dirección: si tiene relación clientAddress o si tiene dirección propia a nivel cliente
    let resolvedAddress = clientData.clientAddress;
    if (!resolvedAddress && (clientData.address_address || clientData.address_location || clientData.address_province)) {
      resolvedAddress = {
        id: clientData.address ?? clientData.id,
        address: clientData.address_address,
        location: clientData.address_location,
        province: clientData.address_province,
        district: clientData.clientDistrictData ?? clientData.address_district ?? null,
        districtData: clientData.clientDistrictData ?? null,
        origin: clientData.origin,
        user: clientData.user
      };
    }

    let contacts = [];
    if (Array.isArray(clientData.contacts) && clientData.contacts.length > 0) {
      contacts = clientData.contacts.map(c => c.contactContact).filter(Boolean);
    }
    if (contacts.length === 0 && clientData.contactRef) {
      contacts = [clientData.contactRef];
    }

    return new Client({
      id: clientData.id,
      name: clientData.name || clientData.bussiness?.name || null,
      cuit: clientData.cuit,
      address: resolvedAddress,
      representative: clientData.representativeRef,
      contact: clientData.contactRef,
      contacts,
      origin: clientData.origin,
      userId: clientData.user,
      billing,
    });
  }

  async addContactToClient(clientId, personId) {
    if (!clientId || !personId) throw new Error('clientId y personId son requeridos');
    const existing = await ClientsContacts.findOne({
      where: { client: clientId, contact: personId }
    });
    if (existing) return existing;
    return await ClientsContacts.create({
      client: clientId,
      contact: personId
    });
  }

  async removeContactFromClient(clientId, personId) {
    if (!clientId || !personId) throw new Error('clientId y personId son requeridos');
    await ClientsContacts.destroy({
      where: { client: clientId, contact: personId }
    });
  }

  async isContactLinked(clientId, personId) {
    if (!clientId || !personId) return false;
    const count = await ClientsContacts.count({
      where: { client: clientId, contact: personId }
    });
    return count > 0;
  }

  async getContactsByClientId(clientId) {
    if (!clientId) throw new Error('clientId es requerido');
    const links = await ClientsContacts.findAll({
      where: { client: clientId },
      include: [
        {
          model: Persons,
          as: 'contactContact',
          include: [
            { model: District, as: 'districtData', attributes: ['id', 'name'] },
            { model: Country, as: 'countryData', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    const PersonRepository = require('../persons/PersonRepository');
    const personRepo = new PersonRepository();

    const contacts = [];
    const seenIds = new Set();
    for (const link of links) {
      if (link.contactContact && !seenIds.has(link.contactContact.id)) {
        seenIds.add(link.contactContact.id);
        contacts.push(personRepo.mapToDomain(link.contactContact));
      }
    }

    if (contacts.length === 0) {
      const client = await ClientModel.findByPk(clientId, {
        include: [
          {
            model: Persons,
            as: 'contactRef',
            include: [
              { model: District, as: 'districtData', attributes: ['id', 'name'] },
              { model: Country, as: 'countryData', attributes: ['id', 'name'] }
            ]
          }
        ]
      });
      if (client?.contactRef) {
        contacts.push(personRepo.mapToDomain(client.contactRef));
      }
    }

    return contacts;
  }
}

module.exports = ClientRepository;

