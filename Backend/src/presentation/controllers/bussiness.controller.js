const { getBusinessService, getPadronService, buildContext } = require('../../shared/serviceFactory');
const { handleControllerError } = require('../utils/controllerError');

function createBusinessService(req) {
  return getBusinessService(buildContext(req));
}

exports.get = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const business = await businessService.getBusiness(req.query.cuit, req.user);
    return res.json(business);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.get');
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const business = await businessService.getBusiness(req.query.cuit, req.user);
    return res.json(business ? business.addresses : []);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.getAddresses');
  }
};

exports.addAddress = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const address = await businessService.addAddress(
      req.query.cuit,
      {
        address: req.body?.address,
        location: req.body?.location,
        province: req.body?.province,
        district: req.body?.district ?? null
      },
      req.user
    );
    return res.json(address);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.addAddress');
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const address = await businessService.updateAddress(
      req.query.id,
      {
        address: req.body?.address,
        location: req.body?.location,
        province: req.body?.province,
        district: req.body?.district
      },
      req.user
    );
    return res.json(address);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.updateAddress');
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const result = await businessService.deleteAddress(req.query.id, req.user);
    return res.json({ success: result });
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.deleteAddress');
  }
};

exports.getPadron = async (req, res) => {
  try {
    const padronService = getPadronService();
    if (!padronService) return res.status(503).json({ error: 'PadronService no disponible' });
    const padron = await padronService.getPadron(req.query.cuit);
    return res.json(padron);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.getPadron');
  }
};

exports.getRepresentatives = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const representatives = await businessService.getRepresentatives(req.query.cuit);
    return res.json(representatives);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.getRepresentatives');
  }
};

exports.getBusinessForEssay = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const business = await businessService.getBusinessForEssay(req.query.cuit, req.user);
    return res.json(business);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.getBusinessForEssay');
  }
};

exports.createManual = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const business = await businessService.createBusinessManually(
      {
        cuit: req.body?.cuit,
        name: req.body?.name
      },
      req.user
    );
    return res.json(business);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.createManual');
  }
};

exports.syncByCuit = async (req, res) => {
  try {
    const businessService = createBusinessService(req);
    const business = await businessService.syncBusinessByCuit(req.query.cuit, req.user);
    return res.json(business);
  } catch (error) {
    return handleControllerError(res, error, 'bussiness.controller.syncByCuit');
  }
};
