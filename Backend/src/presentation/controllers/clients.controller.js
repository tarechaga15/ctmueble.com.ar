const { getClientService, getPadronService, buildContext } = require('../../shared/serviceFactory');
const CreateClientDTO = require('../../application/clients/dto/CreateClientDTO');
const UpdateClientDTO = require('../../application/clients/dto/UpdateClientDTO');
const { handleControllerError } = require('../utils/controllerError');
const { sendSecurityError } = require('../middlewares/securityResponse');

function rejectConsultaWrite(req, res) {
  if (req.user?.profile === 'LABORATORY' && req.user?.labRole === 'CONSULTA') {
    sendSecurityError(res, req, 403, 'LAB_PERMISSION_DENIED', 'El rol Consulta no tiene permisos de escritura');
    return true;
  }
  return false;
}

function createClientService(req) {
  return getClientService(buildContext(req));
}

exports.fetch = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const clients = await clientService.getAllClients();
    return res.json(clients);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.fetch');
  }
};

exports.get = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const client = await clientService.getClient(req.query.id);
    return res.json(client);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.get');
  }
};

exports.search = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const search =
      req.query.search ||
      req.query.term ||
      req.query.name ||
      req.query.cuit ||
      '';
    const clients = await clientService.searchClientsByNameOrCuit(search);
    return res.json(clients);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.search');
  }
};

exports.create = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const createClientDTO = new CreateClientDTO(req.body);
    createClientDTO.validate();

    const clientService = createClientService(req);
    const client = await clientService.createClient(createClientDTO.toPlainObject());
    return res.json(client);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.create');
  }
};

exports.update = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const updateClientDTO = new UpdateClientDTO(req.body);
    updateClientDTO.validate();

    const clientService = createClientService(req);
    const client = await clientService.updateClient(req.query.id, updateClientDTO.toPlainObject());
    return res.json(client);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.update');
  }
};

exports.delete = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const clientService = createClientService(req);
    const client = await clientService.deleteClient(req.query.id);
    return res.json(client);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.delete');
  }
};

exports.getPadron = async (req, res) => {
  try {
    const padronService = getPadronService();
    if (!padronService) return res.status(503).json({ error: 'PadronService no disponible' });
    const padron = await padronService.getPadron(req.params.cuit);
    if (!padron) {
      return res.json(null);
    }
    return res.json(padron);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.getPadron');
  }
};

exports.searchByBusiness = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const businesses = await clientService.searchClientsByBusiness(req.query.search || '', req.user);
    return res.json(businesses);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.searchByBusiness');
  }
};

exports.getOrCreateForEssay = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const client = await clientService.getOrCreateClientForEssay(req.body, req.user);
    return res.json(client);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.getOrCreateForEssay');
  }
};

exports.getScheduled = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const clients = await clientService.getScheduledClients();
    return res.json(clients);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.getScheduled');
  }
};

exports.addScheduled = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const clientId = req.body?.clientId || req.body?.id;
    const cuit = req.body?.cuit;
    if (!clientId && !cuit) {
      return res.status(400).json({ error: 'clientId o CUIT es requerido' });
    }
    const clientService = createClientService(req);
    const client = await clientService.addScheduledClient(req.body);
    return res.status(201).json({ success: true, client });
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.addScheduled');
  }
};

exports.isScheduled = async (req, res) => {
  try {
    const clientId = req.query.clientId || req.query.id;
    const cuit = req.query.cuit;
    const contactId = req.query.contactId || req.query.contact;
    if (!clientId && !cuit) {
      return res.status(400).json({ error: 'clientId o CUIT es requerido' });
    }
    const clientService = createClientService(req);
    const result = await clientService.isClientScheduled({ clientId, cuit, contactId });
    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.isScheduled');
  }
};

exports.getContacts = async (req, res) => {
  try {
    const clientService = createClientService(req);
    const clientId = req.params.clientId || req.params.id || req.query.clientId || req.query.id;
    if (!clientId) return res.status(400).json({ error: 'clientId es requerido' });
    const contacts = await clientService.getContactsByClient(clientId);
    return res.json(contacts);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.getContacts');
  }
};

exports.addContact = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const clientService = createClientService(req);
    const clientId = req.params.clientId || req.params.id || req.body?.clientId || req.query?.clientId;
    if (!clientId) return res.status(400).json({ error: 'clientId es requerido' });
    const contactInput = req.body?.contact ?? req.body?.contactId ?? req.body?.personId ?? req.body;
    const contacts = await clientService.addContactToClient(clientId, contactInput);
    return res.status(201).json(contacts);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.addContact');
  }
};

exports.removeContact = async (req, res) => {
  try {
    if (rejectConsultaWrite(req, res)) return;
    const clientService = createClientService(req);
    const clientId = req.params.clientId || req.params.id || req.body?.clientId || req.query?.clientId;
    const contactId = req.params.contactId || req.query.contactId || req.query.personId || req.body?.contactId || req.body?.personId;
    if (!clientId || !contactId) return res.status(400).json({ error: 'clientId y contactId son requeridos' });
    const result = await clientService.removeContactFromClient(clientId, contactId);
    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'clients.controller.removeContact');
  }
};
