
async function resolveDistrictId(districtVal) {
  if (!districtVal) return null;
  const str = String(districtVal).trim();
  if (!str) return null;

  try {
    const { District } = require('../../../infrastructure/models');
    if (!District) return null;

    // 1. Coincidencia directa por id (e.g. 'AR-C', 'AR-B')
    const direct = await District.findOne({ where: { id: str } });
    if (direct) return direct.id;

    // 2. Mapeo por código numérico / INDEC
    const numeric = parseInt(str, 10);
    if (!isNaN(numeric)) {
      const byNum = await District.findOne({ where: { numeric_id: numeric } });
      if (byNum) return byNum.id;

      const indecMap = {
        0: 'AR-C', 1: 'AR-C', 2: 'AR-C', 6: 'AR-B', 10: 'AR-K', 14: 'AR-X', 18: 'AR-W',
        22: 'AR-H', 26: 'AR-U', 30: 'AR-E', 34: 'AR-P', 38: 'AR-Y',
        42: 'AR-L', 46: 'AR-F', 50: 'AR-M', 54: 'AR-N', 58: 'AR-Q',
        62: 'AR-R', 66: 'AR-A', 70: 'AR-J', 74: 'AR-D', 78: 'AR-Z',
        82: 'AR-S', 86: 'AR-G', 90: 'AR-T', 94: 'AR-V'
      };
      if (indecMap[numeric]) {
        const match = await District.findOne({ where: { id: indecMap[numeric] } });
        if (match) return match.id;
      }
    }

    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Servicio de aplicación para autenticación: registro, login, rotación de refresh tokens y logout.
 * Sin dependencia de Neon Auth.
 */
const crypto = require('crypto');
const User = require('../../../domain/users/entities/User');
const AuthTokensDTO = require('../dto/AuthTokensDTO');
const SessionRevocationService = require('../../../infrastructure/auth/services/SessionRevocationService');

// Hash bcrypt válido (cost 12) usado para igualar tiempos de respuesta cuando el email no existe.
const DUMMY_BCRYPT_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oL6s8nK6G';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthApplicationService {
  /**
   * @param {Object} deps
   * @param {*} deps.userRepository
   * @param {*} deps.personRepository
   * @param {*} deps.passwordHasher - { hash, compare }
   * @param {*} deps.jwtService
   * @param {*} [deps.revocationService]
   */
  constructor({ userRepository, personRepository, passwordHasher, jwtService, revocationService }) {
    this.userRepository = userRepository;
    this.personRepository = personRepository;
    this.passwordHasher = passwordHasher;
    this.jwtService = jwtService;
    this.revocationService = revocationService || SessionRevocationService.getInstance();
  }

  async _runInTransaction(workFn) {
    let dbModule = null;
    try {
      dbModule = require('../../../infrastructure/config/db');
    } catch (_) {
      // Modulo no disponible en tests unitarios puros
    }

    if (dbModule && typeof dbModule.withTransaction === 'function') {
      return await dbModule.withTransaction(workFn);
    }

    return await workFn(null);
  }

  async _resolveDistrictId(districtVal) {
    return resolveDistrictId(districtVal);
  }

  /**
   * Registra un usuario CLIENT y crea atómicamente su registro `persons`.
   */
  async register(mail, password, data = {}) {
    const normalizedMail = String(mail || '').trim().toLowerCase();
    if (!normalizedMail || normalizedMail.length > 254 || !EMAIL_REGEX.test(normalizedMail)) {
      const err = new Error('Correo electrónico inválido');
      err.code = 'INVALID_EMAIL';
      throw err;
    }

    if (typeof password !== 'string' || password.length < 12 || password.length > 64) {
      const err = new Error('La contraseña debe tener entre 12 y 64 caracteres');
      err.code = 'WEAK_PASSWORD';
      throw err;
    }

    const personSource = data && typeof data === 'object' ? data.person || data : {};
    const personName = String(personSource.name ?? data?.name ?? '').trim();
    const personDni = String(personSource.dni ?? data?.dni ?? '').trim();

    if (!personName || !personDni) {
      const err = new Error('Los datos de persona (name, dni) son obligatorios');
      err.code = 'PERSON_DATA_REQUIRED';
      throw err;
    }

    if (!this.personRepository) {
      const err = new Error('Repositorio de personas no disponible');
      err.code = 'PERSON_REPOSITORY_MISSING';
      throw err;
    }

    const existing = await this.userRepository.findByMail(normalizedMail);
    if (existing) {
      const err = new Error('No fue posible completar el registro con los datos ingresados');
      err.code = 'REGISTRATION_CONFLICT';
      throw err;
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const saved = await this._runInTransaction(async (tx) => {
      const user = new User({
        mail: normalizedMail,
        profile: 'CLIENT',
        passwordHash,
        name: personName,
        dni: personDni
      });
      const createdUser = await this.userRepository.save(user, { transaction: tx });

      // Validar y normalizar district y country para evitar violaciones de clave foránea
      let districtId = personSource.districtId ?? personSource.district ?? null;
      if (districtId) {
        districtId = await this._resolveDistrictId(districtId);
      }

      let rawPhone = personSource.phone ?? null;
      let rawCountryCode = personSource.countryCode ?? personSource.country_code ?? null;
      if (rawPhone && typeof rawPhone === 'object') {
        if (!rawCountryCode) {
          rawCountryCode = rawPhone.country_code ?? rawPhone.countryCode ?? null;
        }
        rawPhone = rawPhone.phone ?? null;
      }
      let cleanCountryCode = rawCountryCode ? String(rawCountryCode).replace(/\D/g, '').slice(0, 3) : null;
      if (!cleanCountryCode && (personSource.countryId === 'AR' || personSource.country === 'AR' || !personSource.country)) {
        cleanCountryCode = '54';
      }

      const personPayload = {
        name: personName,
        dni: personDni,
        address: personSource.address ?? null,
        phone: rawPhone ? String(rawPhone).trim() : null,
        mail: personSource.mail ? String(personSource.mail).trim().toLowerCase() : normalizedMail,
        country_code: cleanCountryCode,
        location: personSource.location ?? null,
        district: districtId,
        country: personSource.countryId ?? personSource.country ?? 'AR',
        userId: createdUser.id,
        origin: 'CLIENT',
        isThirdParty: false
      };

      await this.personRepository.save(personPayload, { transaction: tx });
      return createdUser;
    });

    const tokens = this.jwtService.generateTokens({
      access: { id: saved.id },
      refresh: { id: saved.id }
    });

    return new AuthTokensDTO({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      sessionId: tokens.sid,
      userMail: saved.mail,
      user: this._userToApiResponse(saved)
    });
  }

  /**
   * Login resistente a enumeración de cuentas y ataques de timing.
   */
  async login(mail, password, { deviceId = null, deviceFingerprint = null } = {}) {
    const normalizedMail = String(mail || '').trim().toLowerCase();
    const rawPassword = typeof password === 'string' ? password : '';

    if (!normalizedMail || !rawPassword || rawPassword.length > 128) {
      const err = new Error('Credenciales inválidas');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const user = await this.userRepository.findByMail(normalizedMail);
    const targetHash = user && user.passwordHash ? user.passwordHash : DUMMY_BCRYPT_HASH;
    const valid = await this.passwordHasher.compare(rawPassword, targetHash);

    if (!user || !valid) {
      const err = new Error('Credenciales inválidas');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (user.isActive === false) {
      const err = new Error('Cuenta de usuario desactivada');
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }

    // Si tiene habilitado el doble factor (2FA), verificar si el dispositivo ya es de confianza
    if (user.twoFactorEnabled && user.twoFactorMethod && user.twoFactorMethod !== 'NONE') {
      let isTrusted = false;
      if (deviceId && deviceFingerprint) {
        try {
          const TrustedDeviceService = require('../../../infrastructure/auth/services/TrustedDeviceService');
          isTrusted = await TrustedDeviceService.getInstance().isDeviceTrusted({
            userId: user.id,
            deviceId,
            deviceFingerprint
          });
        } catch (_) {}
      }

      if (!isTrusted) {
        const tempToken = this.jwtService.sign2FATempToken({
          id: user.id,
          mail: user.mail,
          method: user.twoFactorMethod
        });

        return {
          requires2FA: true,
          method: user.twoFactorMethod,
          tempToken,
          userMail: user.mail,
          user: this._userToApiResponse(user)
        };
      }
    }

    const tokens = this.jwtService.generateTokens({
      access: { id: user.id },
      refresh: { id: user.id }
    });

    return new AuthTokensDTO({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      sessionId: tokens.sid,
      userMail: user.mail,
      user: this._userToApiResponse(user)
    });
  }

  /**
   * Verifica el segundo factor (OTP por mail, TOTP o código de recuperación) para completar el login.
   * Si se solicita, registra el dispositivo como confiable por 7 días.
   */
  async verify2FALogin({ tempToken, code, isRecoveryCode = false, trustDevice = false, deviceId = null, deviceFingerprint = null, req = null }) {
    if (!tempToken || !code) {
      const err = new Error('Token temporal y código de verificación requeridos');
      err.code = 'INVALID_2FA_PAYLOAD';
      throw err;
    }

    let payload;
    try {
      payload = this.jwtService.verify2FATempToken(tempToken);
    } catch (_) {
      const err = new Error('La sesión de verificación ha expirado. Ingrese nuevamente.');
      err.code = '2FA_SESSION_EXPIRED';
      throw err;
    }

    if (payload.jti && typeof this.revocationService?.isRevoked === 'function') {
      const alreadyRevoked = await this.revocationService.isRevoked(payload.jti, null);
      if (alreadyRevoked) {
        const err = new Error('La sesión de verificación ya fue utilizada o invalidada. Ingrese nuevamente.');
        err.code = '2FA_SESSION_EXPIRED';
        throw err;
      }
    }

    const user = await this.userRepository.findByIdWithSecrets(payload.id);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    if (user.isActive === false) {
      const err = new Error('Cuenta de usuario desactivada');
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }

    try {
      // Verificación mediante código de recuperación de emergencia
      if (isRecoveryCode) {
        const RecoveryCodeService = require('../../../infrastructure/auth/services/RecoveryCodeService');
        const validRecovery = await RecoveryCodeService.getInstance().validateAndConsumeCode(user.id, code);
        if (!validRecovery) {
          const err = new Error('Código de recuperación inválido o ya utilizado');
          err.code = 'INVALID_RECOVERY_CODE';
          throw err;
        }
      } else {
        const TwoFactorAuthService = require('../../security/TwoFactorAuthService');
        const twoFactorService = TwoFactorAuthService.getInstance();

        if (user.twoFactorMethod === 'EMAIL') {
          await twoFactorService.verifyEmailOtp({
            mail: user.mail,
            otpCode: code
          });
        } else if (user.twoFactorMethod === 'TOTP') {
          const valid = twoFactorService.verifyTotp({
            token: code,
            secret: user.twoFactorSecret
          });
          if (!valid) {
            const err = new Error('Código de Google Authenticator inválido o expirado');
            err.code = 'INVALID_2FA_CODE';
            throw err;
          }
        } else {
          const err = new Error('Método 2FA no configurado para este usuario');
          err.code = 'UNSUPPORTED_2FA_METHOD';
          throw err;
        }
      }
    } catch (verifyErr) {
      if (payload.jti && typeof this.revocationService?.incrementAttempt === 'function') {
        const failedAttempts = await this.revocationService.incrementAttempt(`auth:2fa:att:${payload.jti}`, 600);
        if (failedAttempts >= 5) {
          if (typeof this.revocationService?.revokeToken === 'function') {
            await this.revocationService.revokeToken(payload.jti, 600);
          }
          const maxErr = new Error('Se superó el máximo de intentos de verificación 2FA. Ingrese nuevamente.');
          maxErr.code = '2FA_MAX_ATTEMPTS';
          throw maxErr;
        }
      }
      throw verifyErr;
    }

    if (payload.jti && typeof this.revocationService?.revokeToken === 'function') {
      await this.revocationService.revokeToken(payload.jti, 600);
    }

    // Si el usuario eligió confiar en este dispositivo por 7 días
    if (trustDevice && deviceId && deviceFingerprint) {
      try {
        const TrustedDeviceService = require('../../../infrastructure/auth/services/TrustedDeviceService');
        await TrustedDeviceService.getInstance().trustDevice({
          userId: user.id,
          deviceId,
          deviceFingerprint,
          req,
          durationDays: 7
        });
      } catch (_) {}
    }

    const tokens = this.jwtService.generateTokens({
      access: { id: user.id },
      refresh: { id: user.id }
    });

    return new AuthTokensDTO({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      sessionId: tokens.sid,
      userMail: user.mail,
      user: this._userToApiResponse(user)
    });
  }

  /**
   * Reenvía el código de verificación al correo durante el flujo de login 2FA.
   */
  async resend2FALogin({ tempToken }) {
    if (!tempToken) {
      const err = new Error('Token temporal requerido');
      err.code = 'TEMP_TOKEN_REQUIRED';
      throw err;
    }

    let payload;
    try {
      payload = this.jwtService.verify2FATempToken(tempToken);
    } catch (_) {
      const err = new Error('La sesión de verificación ha expirado. Ingrese nuevamente.');
      err.code = '2FA_SESSION_EXPIRED';
      throw err;
    }

    if (payload.jti && typeof this.revocationService?.isRevoked === 'function') {
      const alreadyRevoked = await this.revocationService.isRevoked(payload.jti, null);
      if (alreadyRevoked) {
        const err = new Error('La sesión de verificación ya fue utilizada o invalidada. Ingrese nuevamente.');
        err.code = '2FA_SESSION_EXPIRED';
        throw err;
      }
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    if (user.isActive === false) {
      const err = new Error('Cuenta de usuario desactivada');
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }

    if (user.twoFactorMethod !== 'EMAIL') {
      const err = new Error('El reenvío solo está disponible para verificación por correo');
      err.code = 'RESEND_NOT_AVAILABLE';
      throw err;
    }

    const TwoFactorAuthService = require('../../security/TwoFactorAuthService');
    const twoFactorService = TwoFactorAuthService.getInstance();

    await twoFactorService.sendEmailOtp({
      mail: user.mail,
      name: user.name,
      userId: user.id
    });

    return {
      success: true,
      message: `Código de verificación reenviado a ${user.mail}`
    };
  }

  /**
   * Verifica, consume por única vez y rota el refresh token manteniendo la familia `sid`.
   */
  async refreshTokens(refreshToken) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      const err = new Error('Refresh token requerido');
      err.code = 'REFRESH_TOKEN_REQUIRED';
      throw err;
    }

    let payload;
    try {
      const verifier = this.jwtService.verifyRefreshToken || this.jwtService.verify;
      payload = verifier.call(this.jwtService, refreshToken);
    } catch (e) {
      if (e && e.name === 'TokenExpiredError') {
        const err = new Error('Refresh token expirado');
        err.code = 'REFRESH_TOKEN_EXPIRED';
        throw err;
      }
      const err = new Error('Refresh token inválido');
      err.code = 'REFRESH_TOKEN_INVALID';
      throw err;
    }

    if (!payload || payload.id == null) {
      const err = new Error('Refresh token inválido');
      err.code = 'REFRESH_TOKEN_INVALID';
      throw err;
    }

    if (await this.revocationService.isRevoked(payload.jti, payload.sid)) {
      const err = new Error('Sesión revocada');
      err.code = 'REFRESH_TOKEN_REVOKED';
      throw err;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const remainingSec = payload.exp ? Math.max(60, payload.exp - nowSec) : 7 * 24 * 3600;
    const firstUse = await this.revocationService.consumeRefreshToken(payload.jti, payload.sid, remainingSec);
    if (!firstUse) {
      const err = new Error('Refresh token reutilizado; sesión invalidada por seguridad');
      err.code = 'REFRESH_TOKEN_REUSED';
      throw err;
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      const err = new Error('Usuario no encontrado para refresh');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    if (user.isActive === false) {
      const err = new Error('Cuenta de usuario desactivada');
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }

    const tokens = this.jwtService.generateTokens({
      access: { id: user.id },
      refresh: { id: user.id },
      sid: payload.sid
    });

    return new AuthTokensDTO({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      sessionId: tokens.sid,
      userMail: user.mail,
      user: this._userToApiResponse(user)
    });
  }

  /**
   * Revoca de forma efectiva la sesión actual (access token, refresh token y familia `sid`).
   */
  async logout({ accessToken = null, refreshToken = null } = {}) {
    let userId = null;
    let sid = null;
    const nowSec = Math.floor(Date.now() / 1000);

    if (accessToken && typeof accessToken === 'string') {
      try {
        const decodedAt = this.jwtService.verifyAccessToken(accessToken);
        userId = userId || decodedAt?.id || null;
        sid = sid || decodedAt?.sid || null;
        if (decodedAt?.jti) {
          const ttl = decodedAt.exp ? Math.max(60, decodedAt.exp - nowSec) : 900;
          await this.revocationService.revokeToken(decodedAt.jti, ttl);
        }
      } catch (_) {
        const unsafeAt = this.jwtService.decode(accessToken);
        userId = userId || unsafeAt?.id || null;
        sid = sid || unsafeAt?.sid || null;
        if (unsafeAt?.jti) await this.revocationService.revokeToken(unsafeAt.jti, 900);
      }
    }

    if (refreshToken && typeof refreshToken === 'string') {
      try {
        const verifier = this.jwtService.verifyRefreshToken || this.jwtService.verify;
        const decodedRt = verifier.call(this.jwtService, refreshToken);
        userId = userId || decodedRt?.id || null;
        sid = sid || decodedRt?.sid || null;
        if (decodedRt?.jti) {
          const ttl = decodedRt.exp ? Math.max(60, decodedRt.exp - nowSec) : 7 * 24 * 3600;
          await this.revocationService.revokeToken(decodedRt.jti, ttl);
        }
      } catch (_) {
        const unsafeRt = this.jwtService.decode(refreshToken);
        userId = userId || unsafeRt?.id || null;
        sid = sid || unsafeRt?.sid || null;
        if (unsafeRt?.jti) await this.revocationService.revokeToken(unsafeRt.jti, 7 * 24 * 3600);
      }
    }

    if (sid) {
      await this.revocationService.revokeSession(sid, 7 * 24 * 3600);
      try {
        const UserSessionService = require('../../../infrastructure/auth/services/UserSessionService');
        await UserSessionService.getInstance().revokeSessionBySid(sid);
      } catch (_) {}
    }

    return {
      revoked: Boolean(sid || accessToken || refreshToken),
      user: userId != null ? { id: userId } : null,
      sessionId: sid
    };
  }

  /**
   * Devuelve usuario por ID en formato API (para middleware JWT).
   */
  async getUserForRequest(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    let isSuperAdmin = user.mail === 'tarechaga15@gmail.com' || user.mail === 'dev@ctmueble.com.ar';
    let labRole = isSuperAdmin ? 'ADMIN' : null;

    try {
      const memberships = await this.userRepository.findUserLaboratories(userId);
      if (Array.isArray(memberships) && memberships.length > 0) {
        labRole = memberships[0].role || 'USER';
        if (labRole === 'ADMIN') isSuperAdmin = true;
      }
    } catch (_) {}

    return {
      ...this._userToApiResponse(user),
      isSuperAdmin,
      labRole,
      isActive: user.isActive !== false
    };
  }

  _userToApiResponse(user) {
    const isSuperAdmin = user.mail === 'tarechaga15@gmail.com' || user.mail === 'dev@ctmueble.com.ar';
    return {
      id: user.id,
      mail: user.mail,
      name: user.name ?? null,
      dni: user.dni ?? null,
      profile: user.profile,
      laboratory: user.laboratory ?? null,
      isSuperAdmin,
      created_at: user.createdAt
    };
  }
}

module.exports = AuthApplicationService;
