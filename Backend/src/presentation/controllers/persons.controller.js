const { getPersonService, buildContext } = require('../../shared/serviceFactory');
const CreatePersonDTO = require('../../application/persons/dto/CreatePersonDTO');
const UpdatePersonDTO = require('../../application/persons/dto/UpdatePersonDTO');
const { handleControllerError } = require('../utils/controllerError');

function createPersonService(req) {
  return getPersonService(buildContext(req));
}

exports.me = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const person = await personService.getMyPersonProfile();
    return res.json(person);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.me');
  }
};

exports.unlinkClient = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const personId = req.body?.personId || req.params?.id;
    const clientId = req.body?.clientId || req.params?.client;
    await personService.unlinkPersonFromClient(personId, clientId);
    return res.json({ success: true });
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.unlinkClient');
  }
};

exports.get = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const person = await personService.getPerson(req.query.id);
    return res.json(person);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.get');
  }
};

exports.fetch = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const persons = await personService.getAllPersons();
    return res.json(persons);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.fetch');
  }
};

exports.create = async (req, res) => {
  try {
    const createPersonDTO = new CreatePersonDTO(req.body);
    createPersonDTO.validate();

    const personService = createPersonService(req);
    const person = await personService.createPerson(createPersonDTO.toPlainObject());
    return res.json(person);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.create');
  }
};

exports.update = async (req, res) => {
  try {
    if (req.body == null || !req.body.data) {
      const err = new Error('Datos no válidos');
      err.status = 400;
      throw err;
    }
    const personId = req.body.id ?? req.params?.id;
    if (!personId) {
      const err = new Error('ID de persona no indicado');
      err.status = 400;
      throw err;
    }

    const updatePersonDTO = new UpdatePersonDTO(req.body.data);
    updatePersonDTO.validate();

    const personService = createPersonService(req);
    const person = await personService.updatePerson(personId, updatePersonDTO.toPlainObject());
    return res.json(person);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.update');
  }
};

exports.linkClient = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const personId = req.body?.personId || req.params?.id;
    const clientId = req.body?.clientId || req.params?.client;
    await personService.linkPersonToClient(personId, clientId);
    return res.json({ success: true });
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.linkClient');
  }
};

exports.getByClient = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const persons = await personService.getPersonsByClient(req.params.clientId, req.user);
    return res.json(persons);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.getByClient');
  }
};

exports.searchAvailable = async (req, res) => {
  try {
    const personService = createPersonService(req);
    const searchTerm =
      typeof req.query?.search === 'string'
        ? req.query.search
        : typeof req.query?.term === 'string'
        ? req.query.term
        : typeof req.query?.q === 'string'
        ? req.query.q
        : '';
    const persons = await personService.searchAvailablePersons(searchTerm, req.user);
    return res.json(persons);
  } catch (error) {
    return handleControllerError(res, error, 'persons.controller.searchAvailable');
  }
};

exports.search = exports.searchAvailable;
