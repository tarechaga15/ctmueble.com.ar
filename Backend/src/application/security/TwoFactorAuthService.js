const { Op } = require('sequelize');
const crypto = require('crypto');
const {
  generateSecret,
  generateTotp,
  verifyTotp,
  generateOtpAuthUri
} = require('./totp');
const QRCode = require('qrcode');
const MailingService = require('../../infrastructure/mailing/MailingService');
const EmailVerification = require('../../infrastructure/models/security/email_verification');

class TwoFactorAuthService {
  constructor(options = {}) {
    this.mailingService = options.mailingService || new MailingService();
    this.emailVerificationModel = options.emailVerificationModel || EmailVerification;
    this.expirationMinutes = 10;
  }

  static getInstance() {
    if (!TwoFactorAuthService._instance) {
      TwoFactorAuthService._instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService._instance;
  }

  /**
   * Genera el secreto Base32 y el código QR para configurar Google Authenticator / Authy.
   */
  async generateTotpSetup({ userMail }) {
    const secret = generateSecret();
    const issuer = 'CTM Oficina Virtual';
    const otpauthUrl = generateOtpAuthUri({
      secret,
      issuer,
      label: userMail || 'usuario@ctmueble.com.ar'
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl, {
      margin: 2,
      width: 256,
      color: {
        dark: '#1b080a',
        light: '#ffffff'
      }
    });

    return {
      secret,
      otpauthUrl,
      qrCode
    };
  }

  /**
   * Genera un código TOTP para un secreto (útil para pruebas y validaciones internas).
   */
  generateTotp({ secret, time }) {
    return generateTotp(secret, time);
  }

  /**
   * Verifica un token TOTP de 6 dígitos ingresado por el usuario contra su secreto.
   */
  verifyTotp({ token, secret }) {
    return verifyTotp(token, secret);
  }

  /**
   * Genera un código OTP de 6 dígitos y lo envía al correo del usuario.
   */
  async sendEmailOtp({ mail, name, userId }) {
    const normalizedMail = String(mail || '').trim().toLowerCase();
    if (!normalizedMail) {
      throw new Error('Correo electrónico requerido');
    }

    const isConfigured = await this.mailingService.isConfigured();
    if (!isConfigured) {
      const err = new Error('El servicio de correo electrónico no está configurado');
      err.code = 'MAILING_NOT_CONFIGURED';
      throw err;
    }

    // Generar código de 6 dígitos criptográficamente seguro con prefijo de propósito 2FA
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(`2FA:${otpCode}`).digest('hex');
    const dummyTokenHash = `2fa_otp_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + this.expirationMinutes * 60 * 1000);

    // Invalidar registros 2FA previos no verificados para este mail (sin afectar verificaciones de registro)
    await this.emailVerificationModel.destroy({
      where: {
        mail: normalizedMail,
        verified_at: null,
        token_hash: { [Op.like]: '2fa_otp_%' }
      }
    });

    await this.emailVerificationModel.create({
      user_id: userId || null,
      mail: normalizedMail,
      otp_code_hash: otpHash,
      token_hash: dummyTokenHash,
      expires_at: expiresAt,
      attempts: 0
    });

    await this.mailingService.sendTwoFactorOtpEmail({
      to: normalizedMail,
      name,
      otpCode
    });

    return {
      sent: true,
      mail: normalizedMail,
      expiresAt
    };
  }

  /**
   * Verifica un código OTP enviado al correo.
   */
  async verifyEmailOtp({ mail, otpCode }) {
    const normalizedMail = String(mail || '').trim().toLowerCase();
    const cleanCode = String(otpCode || '').trim().replace(/\s+/g, '');

    if (!normalizedMail || !cleanCode || !/^\d{6}$/.test(cleanCode)) {
      const err = new Error('Código de verificación inválido');
      err.code = 'INVALID_OTP';
      throw err;
    }

    const now = new Date();
    const record = await this.emailVerificationModel.findOne({
      where: {
        mail: normalizedMail,
        verified_at: null,
        token_hash: { [Op.like]: '2fa_otp_%' }
      },
      order: [['created_at', 'DESC']]
    });

    if (!record) {
      const err = new Error('No hay un código pendiente o ya ha expirado');
      err.code = 'NO_PENDING_OTP';
      throw err;
    }

    if (record.expires_at < now) {
      await record.destroy();
      const err = new Error('El código ha expirado, solicite uno nuevo');
      err.code = 'OTP_EXPIRED';
      throw err;
    }

    if (record.attempts >= 5) {
      await record.destroy();
      const err = new Error('Demasiados intentos fallidos. Solicite un nuevo código');
      err.code = 'TOO_MANY_ATTEMPTS';
      throw err;
    }

    const incomingHash = crypto.createHash('sha256').update(`2FA:${cleanCode}`).digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(record.otp_code_hash, 'hex')
    );

    if (!isValid) {
      await record.increment('attempts', { by: 1 });
      const remaining = 5 - (record.attempts + 1);
      const err = new Error(
        `Código incorrecto. ${remaining > 0 ? `Le quedan ${remaining} intento(s)` : 'Código invalidado'}`
      );
      err.code = 'INVALID_OTP';
      throw err;
    }

    // Éxito: marcar como verificado y destruir
    await record.update({ verified_at: now });
    return true;
  }
}

module.exports = TwoFactorAuthService;
