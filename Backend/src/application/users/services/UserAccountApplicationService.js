const PasswordHasherService = require('../../../infrastructure/auth/services/PasswordHasherService');
const TwoFactorAuthService = require('../../security/TwoFactorAuthService');
const UserSessionService = require('../../../infrastructure/auth/services/UserSessionService');
const RecoveryCodeService = require('../../../infrastructure/auth/services/RecoveryCodeService');
const TrustedDeviceService = require('../../../infrastructure/auth/services/TrustedDeviceService');
const UserRepository = require('../../../infrastructure/repositories/users/UserRepository');

function httpError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

class UserAccountApplicationService {
  constructor(options = {}) {
    this.userRepository = options.userRepository || new UserRepository();
    this.passwordHasher = options.passwordHasher || PasswordHasherService;
    this.twoFactorService = options.twoFactorService || TwoFactorAuthService.getInstance();
    this.sessionService = options.sessionService || UserSessionService.getInstance();
    this.recoveryCodeService = options.recoveryCodeService || RecoveryCodeService.getInstance();
    this.trustedDeviceService = options.trustedDeviceService || TrustedDeviceService.getInstance();
  }

  /**
   * Cambia la contraseña del usuario previa verificación de la actual.
   */
  async changePassword({ userId, currentPassword, newPassword, confirmPassword, currentSid }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!currentPassword) throw httpError('Debe ingresar la contraseña actual', 400, 'CURRENT_PASSWORD_REQUIRED');
    if (!newPassword) throw httpError('Debe ingresar la nueva contraseña', 400, 'NEW_PASSWORD_REQUIRED');

    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 64) {
      throw httpError('La nueva contraseña debe tener entre 12 y 64 caracteres', 400, 'WEAK_PASSWORD');
    }

    if (newPassword !== confirmPassword) {
      throw httpError('La nueva contraseña y su confirmación no coinciden', 400, 'PASSWORD_MISMATCH');
    }

    if (currentPassword === newPassword) {
      throw httpError('La nueva contraseña no puede ser idéntica a la actual', 400, 'PASSWORD_SAME_AS_CURRENT');
    }

    const user = await this.userRepository.findByIdWithSecrets(userId);
    if (!user || !user.passwordHash) {
      throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const matches = await this.passwordHasher.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw httpError('La contraseña actual es incorrecta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const newHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    // Revocar todas las demás sesiones y dispositivos de confianza por seguridad
    if (currentSid) {
      await this.sessionService.revokeOtherSessions(userId, currentSid);
    }
    await this.trustedDeviceService.revokeAllDevices(userId);

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Se cerraron las demás sesiones activas por seguridad.'
    };
  }

  /**
   * Obtiene el estado actual de la autenticación en dos factores (2FA).
   */
  async getTwoFactorStatus(userId) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const user = await this.userRepository.findById(userId);
    if (!user) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    return {
      enabled: Boolean(user.twoFactorEnabled),
      method: user.twoFactorMethod || 'NONE',
      confirmedAt: user.twoFactorConfirmedAt || null,
      mail: user.mail
    };
  }

  /**
   * Inicia la configuración de 2FA por correo enviando el código de confirmación.
   */
  async setupEmail2FA({ userId }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const user = await this.userRepository.findById(userId);
    if (!user) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    await this.twoFactorService.sendEmailOtp({
      mail: user.mail,
      name: user.name,
      userId
    });

    return {
      success: true,
      mail: user.mail,
      message: `Código de seguridad enviado a ${user.mail}`
    };
  }

  /**
   * Confirma la activación de 2FA por correo mediante el código recibido.
   */
  async confirmEmail2FA({ userId, otpCode }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const user = await this.userRepository.findById(userId);
    if (!user) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    await this.twoFactorService.verifyEmailOtp({
      mail: user.mail,
      otpCode
    });

    await this.userRepository.updateTwoFactor(userId, {
      twoFactorEnabled: true,
      twoFactorMethod: 'EMAIL',
      twoFactorConfirmedAt: new Date()
    });

    // Generar siempre códigos de recuperación de emergencia frescos al activar 2FA
    const generated = await this.recoveryCodeService.generateCodes(userId, 8);
    const recoveryCodes = generated.codes;

    return {
      success: true,
      method: 'EMAIL',
      recoveryCodes,
      codes: recoveryCodes,
      message: 'Autenticación en dos pasos (OTP por correo) activada correctamente'
    };
  }

  /**
   * Genera el secreto y código QR para configurar Google Authenticator.
   */
  async setupTotp2FA({ userId }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const user = await this.userRepository.findById(userId);
    if (!user) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    const setup = await this.twoFactorService.generateTotpSetup({ userMail: user.mail });

    await this.userRepository.updateTwoFactor(userId, {
      twoFactorTempSecret: setup.secret
    });

    return {
      success: true,
      secret: setup.secret,
      otpauthUrl: setup.otpauthUrl,
      qrCode: setup.qrCode,
      message: 'Escaneá el código QR en Google Authenticator o cargá la clave manualmente'
    };
  }

  /**
   * Confirma la activación de Google Authenticator mediante el primer código válido.
   */
  async confirmTotp2FA({ userId, code }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const user = await this.userRepository.findByIdWithSecrets(userId);
    if (!user) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    if (!user.twoFactorTempSecret) {
      throw httpError(
        'No se ha iniciado la configuración de Google Authenticator o la sesión expiró',
        400,
        'NO_PENDING_TOTP_SETUP'
      );
    }

    const isValid = this.twoFactorService.verifyTotp({
      token: code,
      secret: user.twoFactorTempSecret
    });

    if (!isValid) {
      throw httpError('El código ingresado es incorrecto o ha expirado', 400, 'INVALID_TOTP_CODE');
    }

    await this.userRepository.updateTwoFactor(userId, {
      twoFactorEnabled: true,
      twoFactorMethod: 'TOTP',
      twoFactorSecret: user.twoFactorTempSecret,
      twoFactorTempSecret: null,
      twoFactorConfirmedAt: new Date()
    });

    // Generar siempre códigos de recuperación de emergencia frescos al activar 2FA
    const generated = await this.recoveryCodeService.generateCodes(userId, 8);
    const recoveryCodes = generated.codes;

    return {
      success: true,
      method: 'TOTP',
      recoveryCodes,
      codes: recoveryCodes,
      message: 'Google Authenticator activado correctamente como segundo factor de autenticación'
    };
  }

  /**
   * Desactiva el 2FA verificando la contraseña actual del usuario.
   */
  async disable2FA({ userId, password }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!password) throw httpError('Debe ingresar su contraseña para desactivar el 2FA', 400, 'PASSWORD_REQUIRED');

    const user = await this.userRepository.findByIdWithSecrets(userId);
    if (!user || !user.passwordHash) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    const matches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!matches) {
      throw httpError('Contraseña incorrecta', 400, 'INVALID_PASSWORD');
    }

    await this.userRepository.updateTwoFactor(userId, {
      twoFactorEnabled: false,
      twoFactorMethod: 'NONE',
      twoFactorSecret: null,
      twoFactorTempSecret: null,
      twoFactorConfirmedAt: null
    });

    // Invalida también los códigos de recuperación y dispositivos de confianza
    await this.recoveryCodeService.generateCodes(userId, 0).catch(() => {});
    await this.trustedDeviceService.revokeAllDevices(userId);

    return {
      success: true,
      message: 'Autenticación en dos pasos desactivada correctamente'
    };
  }

  /**
   * Obtiene la cantidad de códigos de recuperación de emergencia disponibles.
   */
  async getRecoveryCodesStatus(userId) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const status = await this.recoveryCodeService.getStatus(userId);
    return {
      total: status.total,
      remaining: status.remaining,
      totalCodes: status.total,
      remainingCodes: status.remaining
    };
  }

  /**
   * Genera un nuevo conjunto de 8 códigos de recuperación de emergencia (invalida anteriores).
   * Requiere confirmar la contraseña actual.
   */
  async generateRecoveryCodes({ userId, password }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!password) throw httpError('Debe ingresar su contraseña para generar códigos', 400, 'PASSWORD_REQUIRED');

    const user = await this.userRepository.findByIdWithSecrets(userId);
    if (!user || !user.passwordHash) throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    const matches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!matches) {
      throw httpError('Contraseña incorrecta', 400, 'INVALID_PASSWORD');
    }

    const result = await this.recoveryCodeService.generateCodes(userId, 8);
    return {
      success: true,
      codes: result.codes,
      recoveryCodes: result.codes,
      count: result.count,
      message: 'Se generaron 8 nuevos códigos de recuperación de emergencia.'
    };
  }

  /**
   * Obtiene los dispositivos de confianza activos del usuario.
   */
  async getTrustedDevices(userId) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    return this.trustedDeviceService.getUserTrustedDevices(userId);
  }

  /**
   * Revoca un dispositivo de confianza específico.
   */
  async revokeTrustedDevice({ userId, deviceId }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!deviceId) throw httpError('ID de dispositivo requerido', 400, 'DEVICE_ID_REQUIRED');
    return this.trustedDeviceService.revokeDevice(userId, deviceId);
  }

  /**
   * Revoca todos los dispositivos de confianza del usuario.
   */
  async revokeAllTrustedDevices(userId) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const count = await this.trustedDeviceService.revokeAllDevices(userId);
    return { success: true, count };
  }

  /**
   * Lista las sesiones activas del usuario.
   */
  async getActiveSessions({ userId, currentSid }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    return this.sessionService.getUserSessions(userId, currentSid);
  }

  /**
   * Revoca una sesión específica del usuario.
   */
  async revokeSession({ userId, sessionId }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!sessionId) throw httpError('ID de sesión requerido', 400, 'SESSION_ID_REQUIRED');
    return this.sessionService.revokeSession(userId, sessionId);
  }

  /**
   * Revoca todas las demás sesiones excepto la actual.
   */
  async revokeOtherSessions({ userId, currentSid }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const count = await this.sessionService.revokeOtherSessions(userId, currentSid);
    return { count, success: true };
  }
}

module.exports = UserAccountApplicationService;
