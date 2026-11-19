const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const EmailVerification = require('../../infrastructure/models/security/email_verification');
const MailingService = require('../../infrastructure/mailing/MailingService');
const UserRepository = require('../../infrastructure/repositories/users/UserRepository');

class EmailVerificationService {
  constructor(options = {}) {
    this.model = options.model || EmailVerification;
    this.mailingService = options.mailingService || new MailingService();
    this.userRepository = options.userRepository || new UserRepository();
    this.expirationMinutes = 15;
    this.maxAttempts = 5;
  }

  async _applyInvitationPasswordIfProvided(record, newPassword) {
    if (newPassword === undefined || newPassword === null || String(newPassword) === '') {
      return false;
    }

    const pwd = String(newPassword);
    if (pwd.length < 12 || pwd.length > 64) {
      const err = new Error('La contraseña debe tener entre 12 y 64 caracteres.');
      err.code = 'WEAK_PASSWORD';
      throw err;
    }

    if (!record.user_id) {
      return false;
    }

    const passwordHash = await bcrypt.hash(pwd, 12);
    await this.userRepository.updatePassword(record.user_id, passwordHash);
    return true;
  }

  /**
   * Indica si la verificación por correo es requerida en base a la configuración de mailing.
   */
  async isMailingConfigured() {
    return this.mailingService.isConfigured();
  }

  /**
   * Hashea un código o token con SHA-256 para almacenamiento seguro.
   */
  _hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }

  /**
   * Comparación en tiempo constante para evitar ataques de timing.
   */
  _constantTimeCompare(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Inicia el proceso de verificación generando el OTP de 6 dígitos y el enlace con token.
   * Si no hay mailing configurado, no bloquea el proceso.
   */
  async initiateVerification({ mail, name, userId, frontendUrl }) {
    const isConfigured = await this.mailingService.isConfigured();
    if (!isConfigured) {
      return {
        mailingRequired: false,
        verified: true,
        message: 'Mailing no configurado. Verificación omitida automáticamente.'
      };
    }

    const normalizedMail = String(mail || '').trim().toLowerCase();
    if (!normalizedMail) {
      throw new Error('El correo electrónico es requerido para la verificación');
    }

    // 1. Generar código OTP numérico de 6 dígitos (100000 - 999999)
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // 2. Generar token criptográfico para el enlace de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Hashes para la base de datos
    const otpHash = this._hash(otpCode);
    const tokenHash = this._hash(verificationToken);

    const expiresAt = new Date(Date.now() + this.expirationMinutes * 60 * 1000);

    // 4. Invalidar códigos previos no utilizados para este correo (aislado de OTPs 2FA)
    await this.model.destroy({
      where: {
        mail: normalizedMail,
        verified_at: null,
        ...(this.model === EmailVerification ? { token_hash: { [Op.notLike]: '2fa_otp_%' } } : {})
      }
    });

    // 5. Guardar registro de verificación
    await this.model.create({
      user_id: userId || null,
      mail: normalizedMail,
      otp_code_hash: otpHash,
      token_hash: tokenHash,
      expires_at: expiresAt,
      attempts: 0
    });

    // 6. Enviar correo vía Resend
    await this.mailingService.sendVerificationEmail({
      to: normalizedMail,
      name,
      otpCode,
      verificationToken,
      frontendUrl
    });

    return {
      mailingRequired: true,
      verified: false,
      mail: normalizedMail,
      expiresAt
    };
  }

  /**
   * Valida un código OTP de 6 dígitos ingresado por el usuario.
   */
  async verifyOtp({ mail, otpCode, newPassword = null }) {
    const normalizedMail = String(mail || '').trim().toLowerCase();
    const cleanOtp = String(otpCode || '').replace(/\D/g, '');

    if (cleanOtp.length !== 6) {
      const err = new Error('El código OTP debe ser de 6 dígitos');
      err.code = 'INVALID_OTP_FORMAT';
      throw err;
    }

    const record = await this.model.findOne({
      where: {
        mail: normalizedMail,
        verified_at: null,
        ...(this.model === EmailVerification ? { token_hash: { [Op.notLike]: '2fa_otp_%' } } : {})
      },
      order: [['created_at', 'DESC']]
    });

    if (!record) {
      const err = new Error('No hay una verificación pendiente para este correo o el código ya fue utilizado');
      err.code = 'NO_PENDING_VERIFICATION';
      throw err;
    }

    if (new Date() > new Date(record.expires_at)) {
      const err = new Error('El código de verificación ha expirado. Solicitá uno nuevo.');
      err.code = 'OTP_EXPIRED';
      throw err;
    }

    if (record.attempts >= this.maxAttempts) {
      const err = new Error('Se superó el número máximo de intentos. Solicitá un nuevo código.');
      err.code = 'MAX_ATTEMPTS_EXCEEDED';
      throw err;
    }

    // Incrementar contador de intentos
    await record.increment('attempts');

    const inputHash = this._hash(cleanOtp);
    const matches = this._constantTimeCompare(inputHash, record.otp_code_hash);

    if (!matches) {
      const remaining = this.maxAttempts - (record.attempts + 1);
      const err = new Error(
        `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intentos.` : 'Límite alcanzado.'}`
      );
      err.code = 'INVALID_OTP_CODE';
      throw err;
    }

    // Si se recibió una contraseña de activación/invitación, validarla y aplicarla antes de marcar verificado
    const passwordUpdated = await this._applyInvitationPasswordIfProvided(record, newPassword);

    // Código válido: marcar como verificado
    await record.update({ verified_at: new Date() });

    return {
      success: true,
      verified: true,
      mail: record.mail,
      passwordUpdated
    };
  }

  /**
   * Valida el enlace de verificación mediante el token criptográfico.
   */
  async verifyLinkToken(token, mail, { newPassword = null } = {}) {
    if (!token || typeof token !== 'string') {
      const err = new Error('Token de verificación requerido');
      err.code = 'INVALID_TOKEN';
      throw err;
    }

    const tokenHash = this._hash(token.trim());

    const whereClause = {
      token_hash: tokenHash,
      verified_at: null
    };

    if (mail) {
      whereClause.mail = String(mail).trim().toLowerCase();
    }

    const record = await this.model.findOne({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    if (!record) {
      const err = new Error('El enlace de verificación es inválido o ya ha sido utilizado.');
      err.code = 'INVALID_OR_USED_TOKEN';
      throw err;
    }

    if (new Date() > new Date(record.expires_at)) {
      const err = new Error('El enlace de verificación ha expirado. Ingresá al sistema para solicitar uno nuevo.');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }

    // Si se recibió una contraseña de activación/invitación, validarla y aplicarla antes de marcar verificado
    const passwordUpdated = await this._applyInvitationPasswordIfProvided(record, newPassword);

    // Marcar como verificado
    await record.update({ verified_at: new Date() });

    return {
      success: true,
      verified: true,
      mail: record.mail,
      passwordUpdated
    };
  }
}

module.exports = EmailVerificationService;
