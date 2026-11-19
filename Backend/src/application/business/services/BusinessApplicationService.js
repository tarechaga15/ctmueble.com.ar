/**
 * Servicio de aplicación para gestionar empresas.
 * - Consultas SOAP a ARCA/AFIP se ejecutan estrictamente FUERA de transacciones SQL.
 * - Escrituras multi-tabla se ejecutan dentro de `withTransaction`.
 */
const BusinessDTO = require('../dto/BusinessDTO');

function sanitizeCuit(cuit) {
  const digits = String(cuit || '').replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits)) {
    const err = new Error('El CUIT debe contener exactamente 11 dígitos numéricos');
    err.status = 400;
    err.code = 'INVALID_CUIT';
    throw err;
  }
  return digits;
}

class BusinessApplicationService {
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

  async getBusiness(cuit, user) {
    const cleanCuit = sanitizeCuit(cuit);
    let business = await this.businessRepository.findByCuit(cleanCuit);

    if (!business && this.padronService) {
      // Llamada SOAP externa FUERA de cualquier transacción SQL
      const padron = await this.padronService.getPadron(cleanCuit);
      if (padron) {
        if (padron.type !== 'LEGAL') {
          const err = new Error('El CUIT no corresponde a una persona jurídica.');
          err.status = 400;
          throw err;
        }
        business = await this.createBusiness(padron);
      } else {
        return null;
      }
    }

    if (!business) {
      return null;
    }

    const addresses = await this.businessRepository.findAddresses(cleanCuit, user || this.context?.user);
    return new BusinessDTO({
      name: business.name,
      cuit: business.cuit,
      addresses,
      source: this.determineBusinessSource(business, addresses)
    });
  }

  async getBusinessForEssay(cuit, user) {
    const effectiveUser = user || this.context?.user;
    const cleanCuit = sanitizeCuit(cuit);
    let business = await this.businessRepository.findByCuit(cleanCuit);

    if (!business) {
      if (!this.padronService) {
        const err = new Error('Empresa no encontrada');
        err.status = 404;
        throw err;
      }
      const padron = await this.padronService.getPadron(cleanCuit);
      if (padron) {
        if (padron.type !== 'LEGAL') {
          const err = new Error('El CUIT no corresponde a una persona jurídica.');
          err.status = 400;
          throw err;
        }
        business = await this.createBusiness(padron);
      } else {
        const err = new Error('Empresa no encontrada');
        err.status = 404;
        throw err;
      }
    }

    const addresses = await this.businessRepository.findAddresses(cleanCuit, effectiveUser);
    const clients = await this.businessRepository.findClientsByCuit(cleanCuit, effectiveUser);
    const representatives = [
      ...new Map(clients.filter((c) => c.representative).map((c) => [c.representative.id, c.representative])).values()
    ];

    return {
      cuit: business.cuit,
      name: business.name,
      source: this.determineBusinessSource(business, addresses),
      addresses,
      representatives,
      clients
    };
  }

  async createBusiness(data) {
    const cleanCuit = sanitizeCuit(data.cuit);
    const addresses = await this.normalizeAddresses(data.addresses);

    const business = new this.business({
      cuit: cleanCuit,
      name: data.name,
      addresses,
      source: data.source
    });

    await this._runInTransaction(async () => {
      await this.businessRepository.save(business);
      for (const address of addresses || []) {
        await this.businessRepository.addAddress(cleanCuit, address);
      }
    });

    return this.mapBusinessToDTO(business);
  }

  async createBusinessManually(data, user) {
    if (!data?.cuit || !data?.name) {
      const err = new Error('CUIT y nombre son obligatorios para crear una empresa manualmente.');
      err.status = 400;
      throw err;
    }

    const cleanCuit = sanitizeCuit(data.cuit);
    const existingBusiness = await this.businessRepository.findByCuit(cleanCuit);
    if (existingBusiness) {
      const err = new Error('La empresa ya existe.');
      err.status = 409;
      throw err;
    }

    await this.createBusiness({
      cuit: cleanCuit,
      name: String(data.name).trim(),
      addresses: [],
      source: 'MANUAL'
    });

    return this.getBusiness(cleanCuit, user || this.context?.user);
  }

  async syncBusinessByCuit(cuit, user) {
    const effectiveUser = user || this.context?.user;
    const cleanCuit = sanitizeCuit(cuit);
    const business = await this.businessRepository.findByCuit(cleanCuit);
    if (!business) {
      const err = new Error('Empresa no encontrada');
      err.status = 404;
      throw err;
    }

    if (!this.padronService) {
      const err = new Error('Servicio de padrón ARCA no disponible');
      err.status = 503;
      throw err;
    }

    // Consulta SOAP externa FUERA de la transacción SQL
    const padron = await this.padronService.getPadron(cleanCuit);
    if (!padron) {
      const err = new Error('No se encontraron datos actualizados para el CUIT.');
      err.status = 404;
      throw err;
    }

    if (padron.type !== 'LEGAL') {
      const err = new Error('El CUIT no corresponde a una persona jurídica.');
      err.status = 400;
      throw err;
    }

    const normalizedAddresses = await this.normalizeAddresses(padron.addresses);

    await this._runInTransaction(async () => {
      const updatedBusiness = new this.business({
        cuit: business.cuit,
        name: padron.name || business.name,
        addresses: business.addresses || [],
        source: 'PADRON'
      });

      await this.businessRepository.update(updatedBusiness);

      const existingAddresses = await this.businessRepository.findAddresses(cleanCuit, effectiveUser);
      const hasPublicAddresses = existingAddresses.some((address) => address.origin === 'PUBLIC');

      if (!hasPublicAddresses) {
        for (const address of normalizedAddresses) {
          await this.businessRepository.addAddress(cleanCuit, {
            ...address,
            origin: 'PUBLIC'
          });
        }
      }
    });

    return this.getBusiness(cleanCuit, effectiveUser);
  }

  async addAddress(cuit, addressData, user) {
    const effectiveUser = user || this.context?.user;
    const cleanCuit = sanitizeCuit(cuit);
    const business = await this.businessRepository.findByCuit(cleanCuit);
    if (!business) {
      const err = new Error('Empresa no encontrada');
      err.status = 404;
      throw err;
    }

    addressData.origin = this.addressOriginService.determineOrigin(effectiveUser, addressData.origin);
    addressData.user = effectiveUser.id;

    return this.businessRepository.addAddress(cleanCuit, addressData);
  }

  async updateAddress(addressId, addressData, user) {
    return this.businessRepository.updateAddress(addressId, addressData, user || this.context?.user);
  }

  async deleteAddress(addressId, user) {
    return this.businessRepository.deleteAddress(addressId, user || this.context?.user);
  }

  async getRepresentatives(cuit) {
    if (cuit) {
      const cleanCuit = sanitizeCuit(cuit);
      const clients = await this.businessRepository.findClientsByCuit(cleanCuit, this.context?.user);
      return [
        ...new Map(clients.filter((c) => c.representative).map((c) => [c.representative.id, c.representative])).values()
      ];
    }
    return [];
  }

  async normalizeAddresses(addresses = []) {
    if (!Array.isArray(addresses) || addresses.length === 0 || !this.districtRepository) {
      return Array.isArray(addresses) ? addresses : [];
    }

    const districts = await this.districtRepository.findAll();

    const findDistrictIdByProvinceNumericId = (provinceNumericId) => {
      if (!provinceNumericId) return null;
      const match = districts.find(
        (district) => district.numeric_id && String(district.numeric_id) === String(provinceNumericId)
      );
      return match ? match.id : null;
    };

    return addresses.map((address) => {
      if (address.district) {
        return address;
      }

      const districtId = findDistrictIdByProvinceNumericId(address.province);
      const location = districtId === 'AR-C' ? 'Capital Federal' : address.location;

      return {
        ...address,
        location,
        district: districtId ?? null
      };
    });
  }

  determineBusinessSource(business, addresses = []) {
    if (business?.source === 'MANUAL') {
      return 'MANUAL';
    }
    const hasPublicAddress = Array.isArray(addresses) && addresses.some((address) => address.origin === 'PUBLIC');
    return hasPublicAddress ? 'PADRON' : 'MANUAL';
  }

  mapBusinessToDTO(business) {
    return new BusinessDTO({
      name: business.name,
      cuit: business.cuit,
      addresses: business.addresses,
      source: this.determineBusinessSource(business, business.addresses)
    }).toJSON();
  }
}

module.exports = BusinessApplicationService;
