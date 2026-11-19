/**
 * Servicio de dominio de ensayos.
 * Encapsula la lógica de negocio y permisos de los ensayos con códigos de estado HTTP semánticos.
 */
function domainError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

class EssayDomainService {
  generateCode() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  validateClientDataForEssay(client) {
    if (!client) {
      throw domainError('Cliente no proporcionado', 400, 'CLIENT_REQUIRED');
    }

    if (!client.cuit) {
      throw domainError('El cliente debe tener CUIT (referencia a bussiness)', 400, 'CLIENT_CUIT_REQUIRED');
    }

    if (!client.address) {
      throw domainError(
        'No se encontraron los datos de la dirección del cliente; debe cargarse el cliente con la relación de dirección',
        400,
        'CLIENT_ADDRESS_REQUIRED'
      );
    }

    const addr = client.address;
    if (addr.address == null) {
      throw domainError('La dirección del cliente no tiene el campo address (calle/número)', 400, 'CLIENT_ADDRESS_INCOMPLETE');
    }
    if (addr.location == null) {
      throw domainError('La dirección del cliente no tiene localidad', 400, 'CLIENT_ADDRESS_INCOMPLETE');
    }
    if (addr.district == null) {
      throw domainError('La dirección del cliente no tiene provincia', 400, 'CLIENT_ADDRESS_INCOMPLETE');
    }

    if (client.representative) {
      const rep = client.representative;
      if (rep.name == null) throw domainError('El representante del cliente debe tener nombre', 400, 'CLIENT_REP_INCOMPLETE');
      if (rep.dni == null) throw domainError('El representante del cliente debe tener DNI', 400, 'CLIENT_REP_INCOMPLETE');
    }

    if (client.contact) {
      const c = client.contact;
      if (c.name == null) throw domainError('El contacto del cliente debe tener nombre', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.dni == null) throw domainError('El contacto del cliente debe tener DNI', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.mail == null) throw domainError('El contacto del cliente debe tener correo electrónico', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.phone == null) throw domainError('El contacto del cliente debe tener teléfono', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.address == null) throw domainError('El contacto del cliente debe tener dirección', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.location == null) throw domainError('El contacto del cliente debe tener localidad', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.district == null) throw domainError('El contacto del cliente debe tener distrito', 400, 'CLIENT_CONTACT_INCOMPLETE');
      if (c.country_code == null) throw domainError('El contacto del cliente debe tener código de país', 400, 'CLIENT_CONTACT_INCOMPLETE');
    }
  }

  validateEssayElements(elements) {
    if (!elements || typeof elements !== 'object') {
      throw domainError('Los elementos del ensayo son requeridos', 400, 'ESSAY_ELEMENTS_REQUIRED');
    }

    if (elements.product == null || String(elements.product).trim() === '') {
      throw domainError('El producto del elemento es requerido', 400, 'ELEMENT_PRODUCT_REQUIRED');
    }

    if (elements.manufacturer == null || String(elements.manufacturer).trim() === '') {
      throw domainError('El fabricante del elemento es requerido', 400, 'ELEMENT_MANUFACTURER_REQUIRED');
    }

    if (!elements.date) {
      throw domainError('La fecha del elemento es requerida', 400, 'ELEMENT_DATE_REQUIRED');
    }
    const date = elements.date instanceof Date ? elements.date : new Date(elements.date);
    if (isNaN(date.getTime())) {
      throw domainError('La fecha del elemento no es válida', 400, 'ELEMENT_DATE_INVALID');
    }

    if (elements.country == null || String(elements.country).trim() === '') {
      throw domainError('El país de origen del elemento es requerido', 400, 'ELEMENT_COUNTRY_REQUIRED');
    }
  }

  validateCanSetTerms(profile) {
    if (profile !== 'LABORATORY') {
      throw domainError('No autorizado para establecer términos de ensayo', 403, 'LABORATORY_REQUIRED');
    }
  }

  determineContactStrategy(profile, providedContactId) {
    if (profile === 'CLIENT') {
      return {
        strategy: 'CLIENT_AUTO',
        contactId: null
      };
    } else if (profile === 'LABORATORY') {
      return {
        strategy: 'LABORATORY_PROVIDED',
        contactId: providedContactId
      };
    }
    throw domainError('Perfil de usuario no válido para crear ensayo', 403, 'INVALID_PROFILE');
  }

  shouldRemoveBillingAmount(profile) {
    return profile === 'CLIENT';
  }

  validateCanLoadSampleResults(profile) {
    if (profile !== 'LABORATORY') {
      throw domainError('No autorizado para cargar resultados de muestras', 403, 'LABORATORY_REQUIRED');
    }
  }

  validateCanAcceptOrRejectEssay(profile, essayStatus) {
    if (profile !== 'LABORATORY') {
      throw domainError('Solo el laboratorio puede aceptar o rechazar un ensayo', 403, 'LABORATORY_REQUIRED');
    }
    if (essayStatus !== 'REQUESTED') {
      throw domainError('Solo se puede aceptar o rechazar un ensayo en estado REQUESTED', 400, 'INVALID_ESSAY_STATE');
    }
  }

  validateCanCreateContract(profile, essayStatus) {
    if (profile !== 'LABORATORY') {
      throw domainError('Solo el laboratorio puede crear el contrato', 403, 'LABORATORY_REQUIRED');
    }
    if (essayStatus !== 'ACCEPTED') {
      throw domainError(
        'Solo se puede crear el contrato cuando el ensayo está aceptado (estado ACCEPTED)',
        400,
        'INVALID_ESSAY_STATE'
      );
    }
  }

  validateCanCreateWorkOrder(essayStatus) {
    if (essayStatus !== 'SERVICE_AGREEMENT_MADED') {
      throw domainError(
        'Solo se puede crear orden de trabajo cuando el contrato está generado (estado SERVICE_AGREEMENT_MADED)',
        400,
        'INVALID_ESSAY_STATE'
      );
    }
  }

  validateCanEmitReport(countSamplesWithResultAndActiveWorkOrder) {
    const minimumRequired = 2;
    if (countSamplesWithResultAndActiveWorkOrder == null || countSamplesWithResultAndActiveWorkOrder < minimumRequired) {
      throw domainError(
        `Solo se puede emitir informe si hay al menos ${minimumRequired} resultados de muestras cargados con orden de trabajo activa`,
        400,
        'INSUFFICIENT_SAMPLE_RESULTS'
      );
    }
  }

  validateWorkOrderSamplesForReport(countSamplesWithResult) {
    this.validateCanEmitReport(countSamplesWithResult);
  }
}

module.exports = EssayDomainService;
