const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const PasswordReset = require('../../infrastructure/models/security/password_reset');
const MailingService = require('../../infrastructure/mailing/MailingService');
const UserRepository = require('../../infrastructure/repositories/users/UserRepository');

class PasswordResetService {
  constructor(options = {}) {
    this.model = options.model || PasswordReset;
    this.mailingService = options.mailingService || new MailingService();
    this.userRepository = options.userRepository || new UserRepository();
    this.passwordHasher = options.passwordHasher || {
      hash: (plain) => bcrypt.hash(plain, 12),
      compare: (plain, hash) => bcrypt.compare(plain, hash)
    };
    this.expirationMinutes = 15;
    this.maxAttempts = 5;
  }

  _hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }

  _constantTimeCompare(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  _createError(message, code, statusCode = 400) {
    const err = new Error(message);
    err.code = code;
    err.statusCode = statusCode;
    return err;
  }

  /**
   * Inicia el flujo de restablecimiento de contraseña.
   * No revela si el correo existe en el sistema (anti-enumeración).
   */
  async requestPasswordReset({ mail, frontendUrl }) {
    const isConfigured = await this.mailingService.isConfigured();
    if (!isConfigured) {
      throw this._createError(
        'El servicio de correo no está configurado en el sistema.',
        'MAILING_NOT_CONFIGURED',
        503
      );
    }

    const normalizedMail = String(mail || '').trim().toLowerCase();
    if (!normalizedMail || !normalizedMail.includes('@')) {
      throw this._createError('El correo electrónico es inválido.', 'INVALID_EMAIL', 400);
    }

    const genericResponse = {
      success: true,
      message: 'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.'
    };

    const user = await this.userRepository.findByMail(normalizedMail);
    if (!user) {
      return genericResponse;
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');

    const otpHash = this._hash(otpCode);
    const tokenHash = this._hash(resetToken);
    const expiresAt = new Date(Date.now() + this.expirationMinutes * 60 * 1000);

    // Invalidar solicitudes previas no utilizadas para este correo
    await this.model.destroy({
      where: {
        mail: normalizedMail,
        used_at: null
      }
    });

    await this.model.create({
      user_id: user.id,
      mail: normalizedMail,
      otp_code_hash: otpHash,
      token_hash: tokenHash,
      expires_at: expiresAt,
      attempts: 0
    });

    await this.mailingService.sendPasswordResetEmail({
      to: normalizedMail,
      name: user.name || null,
      otpCode,
      resetToken,
      frontendUrl
    });

    return genericResponse;
  }

  /**
   * Busca y valida un registro de restablecimiento activo por token o por mail + otpCode.
   */
  async _findAndValidateRecord({ mail, otpCode, token }) {
    const cleanToken = token ? String(token).trim() : '';
    const cleanOtp = otpCode ? String(otpCode).trim() : '';
    const normalizedMail = mail ? String(mail).trim().toLowerCase() : '';

    if (!cleanToken && (!normalizedMail || !cleanOtp)) {
      throw this._createError(
        'Debe proporcionar el token o el correo electrónico junto con el código de verificación.',
        'MISSING_RESET_CREDENTIALS',
        400
      );
    }

    let record = null;
    if (cleanToken) {
      const tokenHash = this._hash(cleanToken);
      record = await this.model.findOne({
        where: {
          token_hash: tokenHash,
          used_at: null
        },
        order: [['created_at', 'DESC']]
      });
    } else {
      record = await this.model.findOne({
        where: {
          mail: normalizedMail,
          used_at: null
        },
        order: [['created_at', 'DESC']]
      });
    }

    if (!record) {
      throw this._createError(
        'El código o enlace de restablecimiento es inválido o ya fue utilizado.',
        'INVALID_RESET_CODE',
        400
      );
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      throw this._createError(
        'El código o enlace de restablecimiento ha expirado. Solicitá uno nuevo.',
        'RESET_CODE_EXPIRED',
        400
      );
    }

    if (record.attempts >= this.maxAttempts) {
      throw this._createError(
        'Se superó el máximo de intentos permitidos. Solicitá un nuevo código.',
        'TOO_MANY_ATTEMPTS',
        429
      );
    }

    if (cleanToken) {
      const tokenHash = this._hash(cleanToken);
      if (!this._constantTimeCompare(tokenHash, record.token_hash)) {
        if (typeof record.increment === 'function') {
          await record.increment('attempts');
        } else {
          await record.update({ attempts: record.attempts + 1 });
        }
        throw this._createError('El enlace de restablecimiento es inválido.', 'INVALID_RESET_CODE', 400);
      }
    } else {
      const otpHash = this._hash(cleanOtp);
      if (!this._constantTimeCompare(otpHash, record.otp_code_hash)) {
        if (typeof record.increment === 'function') {
          await record.increment('attempts');
        } else {
          await record.update({ attempts: record.attempts + 1 });
        }
        throw this._createError('El código de verificación es incorrecto.', 'INVALID_RESET_CODE', 400);
      }
    }

    return record;
  }

  /**
   * Verifica si un código OTP o token de restablecimiento es válido sin consumirlo.
   */
  async verifyResetCode({ mail, otpCode, token }) {
    const record = await this._findAndValidateRecord({ mail, otpCode, token });
    return {
      valid: true,
      mail: record.mail
    };
  }

  /**
   * Restablece la contraseña del usuario validando el código OTP o token.
   */
  async resetPassword({ mail, otpCode, token, newPassword }) {
    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 64) {
      throw this._createError(
        'La contraseña debe tener entre 12 y 64 caracteres.',
        'WEAK_PASSWORD',
        400
      );
    }

    const record = await this._findAndValidateRecord({ mail, otpCode, token });
    const newPasswordHash = await this.passwordHasher.hash(newPassword);

    await this.userRepository.updatePassword(record.user_id, newPasswordHash);
    await record.update({ used_at: new Date() });

    // Revocar todas las sesiones activas y dispositivos de confianza del usuario tras restablecer contraseña
    try {
      const UserSessionService = require('../../infrastructure/auth/services/UserSessionService');
      await UserSessionService.getInstance().revokeOtherSessions(record.user_id, null);
    } catch (_) {}
    try {
      const TrustedDeviceService = require('../../infrastructure/auth/services/TrustedDeviceService');
      await TrustedDeviceService.getInstance().revokeAllDevices(record.user_id);
    } catch (_) {}

    return {
      success: true,
      message: 'Tu contraseña ha sido restablecida correctamente.'
    };
  }
}

module.exports = PasswordResetService;
