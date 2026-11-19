const { getEnvService, buildContext } = require('../../shared/serviceFactory');
const { handleControllerError } = require('../utils/controllerError');
const SecurityAuditService = require('../../application/security/SecurityAuditService');

function createEnvApplicationService(req) {
  return getEnvService(buildContext(req));
}

module.exports.fetch = async (req, res) => {
  try {
    const envApplicationService = createEnvApplicationService(req);
    const env = await envApplicationService.fetch({ user: req.user, mode: req.query.mode });
    return res.json(env);
  } catch (error) {
    return handleControllerError(res, error, 'env.controller.fetch');
  }
};

module.exports.get = async (req, res) => {
  try {
    const envApplicationService = createEnvApplicationService(req);
    const env = await envApplicationService.get({ id: req.query.id, user: req.user });
    return res.json(env);
  } catch (error) {
    return handleControllerError(res, error, 'env.controller.get');
  }
};

module.exports.update = async (req, res) => {
  const envId = req.query.id;
  try {
    const envApplicationService = createEnvApplicationService(req);
    const env = await envApplicationService.update({
      id: envId,
      value: req.body?.value,
      user: req.user
    });
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_UPDATE',
      resource: 'env',
      resourceId: envId,
      outcome: 'SUCCESS'
    }).catch(() => {});
    return res.json(env);
  } catch (error) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_UPDATE',
      resource: 'env',
      resourceId: envId,
      outcome: 'FAILURE',
      metadata: { errorCode: error.code || 'ENV_UPDATE_FAILED' }
    }).catch(() => {});
    return handleControllerError(res, error, 'env.controller.update');
  }
};

module.exports.add = async (req, res) => {
  const envId = req.body?.id;
  try {
    const envApplicationService = createEnvApplicationService(req);
    const env = await envApplicationService.add({
      id: envId,
      label: req.body?.label,
      type: req.body?.type,
      value: req.body?.value,
      user: req.user
    });
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_ADD',
      resource: 'env',
      resourceId: envId,
      outcome: 'SUCCESS'
    }).catch(() => {});
    return res.json(env);
  } catch (error) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_ADD',
      resource: 'env',
      resourceId: envId,
      outcome: 'FAILURE',
      metadata: { errorCode: error.code || 'ENV_ADD_FAILED' }
    }).catch(() => {});
    return handleControllerError(res, error, 'env.controller.add');
  }
};

module.exports.delete = async (req, res) => {
  const envId = req.query.id;
  try {
    const envApplicationService = createEnvApplicationService(req);
    const env = await envApplicationService.delete({ id: envId, user: req.user });
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_DELETE',
      resource: 'env',
      resourceId: envId,
      outcome: 'SUCCESS'
    }).catch(() => {});
    return res.json(env);
  } catch (error) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'ENV_DELETE',
      resource: 'env',
      resourceId: envId,
      outcome: 'FAILURE',
      metadata: { errorCode: error.code || 'ENV_DELETE_FAILED' }
    }).catch(() => {});
    return handleControllerError(res, error, 'env.controller.delete');
  }
};
