const { getUserService, getUserAccountService, buildContext } = require('../../shared/serviceFactory');
const { handleControllerError } = require('../utils/controllerError');
const SecurityAuditService = require('../../application/security/SecurityAuditService');

function createUserService(req) {
  return getUserService(buildContext(req));
}

function createUserAccountService(req) {
  return getUserAccountService(buildContext(req));
}

exports.getUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    const userAppService = createUserService(req);
    const user = await userAppService.getUser(userId);
    return res.json(user);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getUser');
  }
};

exports.getClientData = async (req, res) => {
  try {
    const userService = createUserService(req);
    const client = await userService.getClientData({ user: req.user?.id });
    return res.json(client);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getClientData');
  }
};

exports.updateClientData = async (req, res) => {
  try {
    const userService = createUserService(req);
    const updatedClient = await userService.updateClientData({
      user: req.user?.id,
      data: req.body
    });
    return res.json(updatedClient);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.updateClientData');
  }
};

exports.switchProfile = async (req, res) => {
  const targetProfile = req.body?.profile;
  try {
    const userAppService = createUserService(req);
    const user = await userAppService.switchProfile(req.user?.id, targetProfile);
    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SWITCH_PROFILE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS',
      metadata: { targetProfile }
    }).catch(() => {});
    return res.json(user);
  } catch (err) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SWITCH_PROFILE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'FAILURE',
      metadata: { targetProfile, errorCode: err.code || 'SWITCH_PROFILE_FAILED' }
    }).catch(() => {});
    return handleControllerError(res, err, 'users.controller.switchProfile');
  }
};

exports.switchLaboratory = async (req, res) => {
  const targetLaboratory = req.body?.laboratory;
  try {
    const userAppService = createUserService(req);
    const result = await userAppService.switchLaboratory(req.user?.id, targetLaboratory);
    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SWITCH_LABORATORY',
      resource: 'laboratories_members',
      resourceId: targetLaboratory,
      outcome: 'SUCCESS'
    }).catch(() => {});
    return res.json({ success: result });
  } catch (err) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SWITCH_LABORATORY',
      resource: 'laboratories_members',
      resourceId: targetLaboratory,
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || 'SWITCH_LAB_FAILED' }
    }).catch(() => {});
    return handleControllerError(res, err, 'users.controller.switchLaboratory');
  }
};

exports.fetchUserLaboratories = async (req, res) => {
  try {
    const userAppService = createUserService(req);
    const laboratories = await userAppService.getUserLaboratories(req.user?.id);
    return res.json(laboratories);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.fetchUserLaboratories');
  }
};

// ==================== CONFIGURACIÓN DE CUENTA ====================

// 1. Cambio de contraseña
exports.changePassword = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const result = await accountService.changePassword({
      userId: req.user?.id,
      currentPassword,
      newPassword,
      confirmPassword,
      currentSid: req.auth?.sid
    });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_PASSWORD_CHANGE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json(result);
  } catch (err) {
    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_PASSWORD_CHANGE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || 'PASSWORD_CHANGE_FAILED', message: err.message }
    }).catch(() => {});

    return handleControllerError(res, err, 'users.controller.changePassword');
  }
};

// 2. Doble factor de autenticación (2FA)
exports.getTwoFactorStatus = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const status = await accountService.getTwoFactorStatus(req.user?.id);
    return res.json(status);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getTwoFactorStatus');
  }
};

exports.setupEmail2FA = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const result = await accountService.setupEmail2FA({ userId: req.user?.id });
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.setupEmail2FA');
  }
};

exports.confirmEmail2FA = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { otpCode } = req.body || {};
    const result = await accountService.confirmEmail2FA({ userId: req.user?.id, otpCode });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_2FA_ENABLE_EMAIL',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.confirmEmail2FA');
  }
};

exports.setupTotp2FA = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const result = await accountService.setupTotp2FA({ userId: req.user?.id });
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.setupTotp2FA');
  }
};

exports.confirmTotp2FA = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { code } = req.body || {};
    const result = await accountService.confirmTotp2FA({ userId: req.user?.id, code });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_2FA_ENABLE_TOTP',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.confirmTotp2FA');
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { password } = req.body || {};
    const result = await accountService.disable2FA({ userId: req.user?.id, password });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_2FA_DISABLE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.disable2FA');
  }
};

// 3. Sesiones activas
exports.getActiveSessions = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const sessions = await accountService.getActiveSessions({
      userId: req.user?.id,
      currentSid: req.auth?.sid
    });
    return res.json(sessions);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getActiveSessions');
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { id } = req.params;
    await accountService.revokeSession({ userId: req.user?.id, sessionId: id });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SESSION_REVOKE',
      resource: 'sessions',
      resourceId: id,
      userId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.revokeSession');
  }
};

exports.revokeOtherSessions = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const result = await accountService.revokeOtherSessions({
      userId: req.user?.id,
      currentSid: req.auth?.sid
    });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_SESSIONS_REVOKE_OTHERS',
      resource: 'sessions',
      userId: req.user?.id,
      outcome: 'SUCCESS',
      metadata: { count: result.count }
    }).catch(() => {});

    return res.json({
      success: true,
      count: result.count,
      message: 'Todas las demás sesiones han sido cerradas'
    });
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.revokeOtherSessions');
  }
};

// 4. Códigos de recuperación de emergencia
exports.getRecoveryCodesStatus = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const status = await accountService.getRecoveryCodesStatus(req.user?.id);
    return res.json(status);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getRecoveryCodesStatus');
  }
};

exports.generateRecoveryCodes = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { password } = req.body || {};
    const result = await accountService.generateRecoveryCodes({ userId: req.user?.id, password });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_RECOVERY_CODES_GENERATE',
      resource: 'users',
      resourceId: req.user?.id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.generateRecoveryCodes');
  }
};

// 5. Dispositivos de confianza
exports.getTrustedDevices = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const devices = await accountService.getTrustedDevices(req.user?.id);
    return res.json(devices);
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.getTrustedDevices');
  }
};

exports.revokeTrustedDevice = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const { id } = req.params;
    await accountService.revokeTrustedDevice({ userId: req.user?.id, deviceId: id });

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_TRUSTED_DEVICE_REVOKE',
      resource: 'user_trusted_devices',
      resourceId: id,
      outcome: 'SUCCESS'
    }).catch(() => {});

    return res.json({ success: true, message: 'Dispositivo revocado correctamente' });
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.revokeTrustedDevice');
  }
};

exports.revokeAllTrustedDevices = async (req, res) => {
  try {
    const accountService = createUserAccountService(req);
    const result = await accountService.revokeAllTrustedDevices(req.user?.id);

    SecurityAuditService.recordFromRequest(req, {
      action: 'USER_TRUSTED_DEVICES_REVOKE_ALL',
      resource: 'user_trusted_devices',
      outcome: 'SUCCESS',
      metadata: { count: result.count }
    }).catch(() => {});

    return res.json({ success: true, count: result.count, message: 'Todos los dispositivos de confianza fueron revocados' });
  } catch (err) {
    return handleControllerError(res, err, 'users.controller.revokeAllTrustedDevices');
  }
};
