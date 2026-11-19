'use strict';

const LaboratoryUserApplicationService = require('../../application/laboratories/services/LaboratoryUserApplicationService');
const { handleControllerError } = require('../utils/controllerError');
const { sendSecurityError } = require('../middlewares/securityResponse');
const { LabMembers } = require('../../infrastructure/models');

const labUserService = new LaboratoryUserApplicationService();

async function checkIsSuperAdmin(req) {
  const userId = req.user?.id;
  const userMail = req.user?.mail;

  if (userMail === 'tarechaga15@gmail.com' || userMail === 'dev@ctmueble.com.ar') {
    return true;
  }

  if (req.user?.isSuperAdmin || req.user?.labRole === 'ADMIN') {
    return true;
  }

  if (userId) {
    const member = await LabMembers.findOne({ where: { user: userId } });
    if (member && member.role === 'ADMIN') {
      return true;
    }
  }

  return false;
}

exports.listUsers = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede gestionar usuarios del laboratorio');
    }

    const users = await labUserService.listUsers();
    return res.json(users);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.listUsers');
  }
};

exports.createUser = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede crear usuarios del laboratorio');
    }

    const { nombreCompleto, dni, email, rol, telefono } = req.body || {};
    const frontendUrl = req.headers['origin'] || req.headers['referer'] || undefined;

    const result = await labUserService.createUser({
      nombreCompleto,
      dni,
      email,
      rol,
      telefono,
      frontendUrl
    });

    return res.status(201).json(result);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.createUser');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede modificar usuarios del laboratorio');
    }

    const { id } = req.params;
    const { nombreCompleto, dni, rol, activo } = req.body || {};

    const result = await labUserService.updateUser(id, {
      nombreCompleto,
      dni,
      rol,
      activo
    });

    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.updateUser');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede resetear contraseñas');
    }

    const { id } = req.params;
    const { password } = req.body || {};

    const result = await labUserService.resetPassword(id, password);
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.resetPassword');
  }
};

exports.resendActivation = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede reenviar activaciones');
    }

    const { id } = req.params;
    const frontendUrl = req.headers['origin'] || req.headers['referer'] || undefined;

    const result = await labUserService.resendActivation(id, frontendUrl);
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.resendActivation');
  }
};

exports.getPermissionsMatrix = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede consultar la matriz de permisos');
    }

    const data = await labUserService.getPermissionsMatrix();
    return res.json(data);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.getPermissionsMatrix');
  }
};

exports.updatePermissionsMatrix = async (req, res) => {
  try {
    const isSuperAdmin = await checkIsSuperAdmin(req);
    if (!isSuperAdmin) {
      return sendSecurityError(res, req, 403, 'SUPERADMIN_REQUIRED', 'Solo el superadministrador puede modificar la matriz de permisos');
    }

    const { items } = req.body || {};
    const result = await labUserService.updatePermissionsMatrix(items);
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'laboratoryUsers.controller.updatePermissionsMatrix');
  }
};
