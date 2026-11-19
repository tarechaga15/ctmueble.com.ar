/**
 * Implementación del repositorio de empresas usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio Business.
 * Gestiona también las direcciones asociadas a las empresas.
 */
const IBusinessRepository = require('../../../domain/business/repositories/IBusinessRepository');
const Business = require('../../../domain/business/entities/Business');
const { Bussiness: BusinessModel, BussinessAddress: BusinessAddressModel, Persons, Country, District, Client: ClientModel } = require('../../models');
const { Op } = require('sequelize');

class BusinessRepository extends IBusinessRepository {
  /**
   * @param {Object} [options]
   * @param {Object} [options.transaction] - Transacción de base de datos asociada a este repositorio (opcional)
   */
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  /**
   * Permite actualizar la transacción asociada al repositorio.
   * Útil si se quiere reutilizar la instancia entre diferentes contextos.
   * @param {Object|null} transaction
   */
  setTransaction(transaction) {
    this.transaction = transaction || null;
  }
  /**
   * Busca una empresa por su CUIT usando Sequelize.
   * @param {string} cuit - CUIT de la empresa
   * @returns {Promise<Business|null>} Entidad Business o null si no existe
   */
  async findByCuit(cuit) {
    const businessData = await BusinessModel.findOne({ where: { cuit } });
    return businessData ? this.mapToDomain(businessData) : null;
  }

  /**
   * Guarda una nueva empresa usando Sequelize.
   * Convierte la entidad de dominio a formato Sequelize.
   * @param {Business} business - Entidad Business a guardar
   * @returns {Promise<Business>} Entidad Business guardada
   */
  async save(business) {
    const activeTransaction = this.transaction;
    const options = activeTransaction ? { transaction: activeTransaction } : {};
    const businessData = await BusinessModel.create({
      cuit: business.cuit,
      name: business.name
    }, options);

    return this.mapToDomain(businessData);
  }

  /**
   * Actualiza una empresa existente usando Sequelize.
   * @param {Business} business - Entidad Business con los cambios
   * @returns {Promise<Business>} Entidad Business actualizada
   */
  async update(business) {
    await BusinessModel.update({
      name: business.name
    }, {
      where: { cuit: business.cuit }
    });

    return business;
  }

  async findAddresses(cuit, user) {
    const whereClause = {
      cuit,
      [Op.or]: [
        { origin: 'PUBLIC' },
        ...(user && user.profile === 'LABORATORY' ? [{ origin: 'LABORATORY' }] : []),
        ...(user && user.id ? [{ origin: 'CLIENT', user: user.id }] : [])
      ]
    };

    const addressesData = await BusinessAddressModel.findAll({
      where: whereClause,
      include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
    });
    const formatDistrict = (d) => (!d ? null : { id: d.id, name: d.name ?? null });
    return addressesData.map(addr => ({
      id: addr.id,
      address: addr.address,
      location: addr.location,
      district: formatDistrict(addr.districtData),
      origin: addr.origin
    }));
  }

  /**
   * Agrega una dirección a una empresa.
   * @param {string} cuit - CUIT de la empresa
   * @param {Object} addressData - Datos de la dirección
   * @returns {Promise<Object>} Dirección creada
   */
  async addAddress(cuit, addressData) {
    const activeTransaction = this.transaction;
    const options = activeTransaction ? { transaction: activeTransaction } : {};
    const address = await BusinessAddressModel.create({
      cuit,
      address: addressData.address ?? '',
      location: addressData.location ?? '',
      district: addressData.district ?? null,
      origin: addressData.origin || 'PUBLIC',
      user: addressData.user
    }, options);

    return {
      id: address.id,
      address: address.address,
      location: address.location,
      district: address.district,
      origin: address.origin,
      user: address.user
    };
  }

  async updateAddress(addressId, addressData, user) {
    let whereClause = { id: addressId };
    if (user && user.profile === 'CLIENT') {
      whereClause.origin = 'CLIENT';
      whereClause.user = user.id;
    } else if (user && user.profile === 'LABORATORY') {
      whereClause.origin = 'LABORATORY';
    }

    const address = await BusinessAddressModel.findOne({ where: whereClause });
    if (!address) {
      throw new Error('Dirección no encontrada');
    }

    await address.update({
      address: addressData.address !== undefined && addressData.address !== null ? addressData.address : address.address,
      location: addressData.location !== undefined && addressData.location !== null ? addressData.location : address.location,
      district: addressData.district !== undefined ? addressData.district : address.district
    });

    return {
      id: address.id,
      address: address.address,
      location: address.location,
      district: address.district,
      origin: address.origin
    };
  }

  async deleteAddress(addressId, user) {
    let whereClause = { id: addressId };
    if (user && user.profile === 'CLIENT') {
      whereClause.origin = 'CLIENT';
      whereClause.user = user.id;
    }

    const address = await BusinessAddressModel.findOne({ where: whereClause });
    if (!address) {
      throw new Error('Dirección no encontrada');
    }

    await address.destroy();
    return true;
  }

  /**
   * Busca todos los clientes de una empresa (por CUIT).
   * Útil para mostrar clientes existentes y evitar duplicados.
   * @param {string} cuit - CUIT de la empresa
   * @param {Object} user - Usuario que realiza la consulta
   * @returns {Promise<Array<Object>>} Lista de clientes con sus datos
   */
  async findClientsByCuit(cuit, user) {
    
    const whereClause = { cuit };
    
    // Si es CLIENT, solo mostrar sus propios clientes
    if (user && user.profile === 'CLIENT') {
      whereClause.user = user.id;
    }

    const clientsData = await ClientModel.findAll({
      where: whereClause,
      attributes: ['id', 'cuit', 'representative', 'contact', 'origin', 'user'],
      include: [
        { 
          model: BusinessAddressModel, 
          as: 'clientAddress', 
          attributes: ['id', 'address', 'location', 'district', 'origin', 'user'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        },
        { 
          model: Persons, 
          as: 'representativeRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
          include: [
            { model: Country, as: 'countryData' },
            { model: District, as: 'districtData' }
          ]
        },
        { 
          model: Persons, 
          as: 'contactRef', 
          attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'mail', 'phone', 'country_code'],
          include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
        }
      ],
      order: [['origin', 'ASC'], ['user', 'ASC']] // Ordenar por origen y usuario
    });

    return clientsData.map(client => ({
      id: client.id,
      cuit: client.cuit,
      address: client.clientAddress ? {
        id: client.clientAddress.id,
        address: client.clientAddress.address,
        location: client.clientAddress.location,
        district: client.clientAddress.districtData ? { id: client.clientAddress.districtData.id, name: client.clientAddress.districtData.name } : (client.clientAddress.district ? { id: client.clientAddress.district, name: null } : null),
        origin: client.clientAddress.origin
      } : null,
      representative: client.representativeRef ? {
        id: client.representativeRef.id,
        name: client.representativeRef.name,
        dni: client.representativeRef.dni,
        contact: null
      } : null,
      contact: client.contactRef ? {
        id: client.contactRef.id,
        name: client.contactRef.name,
        dni: client.contactRef.dni,
        address: client.contactRef.address,
        location: client.contactRef.location,
        district: client.contactRef.districtData ? { id: client.contactRef.districtData.id, name: client.contactRef.districtData.name } : (client.contactRef.district ? { id: client.contactRef.district, name: null } : null),
        mail: client.contactRef.mail,
        phone: client.contactRef.phone,
        country_code: client.contactRef.country_code
      } : null,
      origin: client.origin,
      userId: client.user
    }));
  }

  /**
   * Convierte un modelo de Sequelize a una entidad de dominio Business.
   * @param {Object} businessData - Modelo de Sequelize
   * @returns {Business} Entidad Business de dominio
   */
  mapToDomain(businessData) {
    return new Business({
      cuit: businessData.cuit,
      name: businessData.name,
      addresses: []
    });
  }
}

module.exports = BusinessRepository;

