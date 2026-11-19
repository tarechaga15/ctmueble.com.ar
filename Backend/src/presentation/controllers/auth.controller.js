const { getAuthService } = require('../../shared/serviceFactory');
const { sendSecurityError } = require('../middlewares/securityResponse');
const {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
  generateCsrfToken
} = require('../utils/authCookies');

const authService = getAuthService();
const UserSessionService = require('../../infrastructure/auth/services/UserSessionService');

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  const visible = local.length > 2 ? local.slice(0, 2) + '***' : local[0] + '***';
  return `${visible}@${domain}`;
}

async function auditEvent(req, payload) {
  try {
    const SecurityAuditService = require('../../application/security/SecurityAuditService');
    await SecurityAuditService.recordFromRequest(req, payload);
  } catch (_) {
    // Fallback silencioso si el módulo aún no está cargado
  }
}

function shouldIncludeJsonTokens() {
  return process.env.NODE_ENV !== 'production';
}

exports.register = async (req, res) => {
  try {
    const { mail, password, data } = req.body || {};
    const result = await authService.register(mail, password, data);

    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });

    // Registrar sesión en base de datos y evento de auditoría antes de responder (serverless-safe)
    await Promise.allSettled([
      UserSessionService.getInstance().createSession({
        sid: result.sessionId,
        userId: result.user?.id,
        req
      }),
      auditEvent(req, {
        action: 'AUTH_REGISTER',
        resource: 'users',
        resourceId: result.user?.id || null,
        userId: result.user?.id || null,
        sessionId: result.sessionId,
        outcome: 'SUCCESS'
      })
    ]);

    return res.status(201).json({
      msg: 'Usuario creado',
      ...result.toJSON({ includeTokens: shouldIncludeJsonTokens(), csrfToken })
    });
  } catch (err) {
    console.error('[AUTH_REGISTER_ERROR]', {
      code: err.code || 'AUTH_REGISTER_ERROR',
      message: err.message,
      stack: err.stack,
      original: err.original ? String(err.original) : undefined
    });

    await auditEvent(req, {
      action: 'AUTH_REGISTER',
      resource: 'users',
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || 'AUTH_REGISTER_ERROR', errorMessage: err.message }
    });

    const status =
      err.code === 'REGISTRATION_CONFLICT' ||
      err.code === 'PERSON_DATA_REQUIRED' ||
      err.code === 'INVALID_EMAIL' ||
      err.code === 'WEAK_PASSWORD'
        ? 400
        : 500;

    const clientMessage =
      err.code === 'REGISTRATION_CONFLICT'
        ? 'El correo ingresado ya se encuentra registrado'
        : err.code === 'PERSON_DATA_REQUIRED'
        ? 'Los datos de la persona son obligatorios'
        : err.code === 'INVALID_EMAIL'
        ? 'Correo electrónico inválido'
        : err.code === 'WEAK_PASSWORD'
        ? 'La contraseña debe tener entre 12 y 64 caracteres'
        : 'Ocurrió un error al procesar el registro';

    return sendSecurityError(res, req, status, err.code || 'AUTH_REGISTER_ERROR', clientMessage);
  }
};

exports.login = async (req, res) => {
  try {
    const { mail, password, deviceId, deviceFingerprint, rememberMe = true } = req.body || {};
    const result = await authService.login(mail, password, { deviceId, deviceFingerprint });

    // Si el usuario requiere 2FA (por correo o por Google Authenticator)
    if (result && result.requires2FA) {
      if (result.method === 'EMAIL') {
        try {
          const TwoFactorAuthService = require('../../application/security/TwoFactorAuthService');
          await TwoFactorAuthService.getInstance().sendEmailOtp({
            mail: result.userMail,
            name: result.user?.name,
            userId: result.user?.id
          });
        } catch (e) {
          console.error('[AUTH_2FA_EMAIL_SEND_ERROR]', e.message);
        }
      }

      await auditEvent(req, {
        action: 'AUTH_LOGIN_2FA_CHALLENGE',
        resource: 'users',
        resourceId: result.user?.id || null,
        userId: result.user?.id || null,
        outcome: 'SUCCESS',
        metadata: { method: result.method }
      });

      return res.json({
        requires2FA: true,
        method: result.method,
        tempToken: result.tempToken,
        emailMasked: maskEmail(result.userMail),
        rememberMe: Boolean(rememberMe),
        msg: 'Se requiere verificación en dos pasos (2FA)'
      });
    }

    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberMe: Boolean(rememberMe)
    });

    // Registrar sesión en base de datos y auditoría antes de cerrar la función serverless
    await Promise.allSettled([
      UserSessionService.getInstance().createSession({
        sid: result.sessionId,
        userId: result.user?.id,
        req,
        rememberMe: Boolean(rememberMe)
      }),
      auditEvent(req, {
        action: 'AUTH_LOGIN',
        resource: 'sessions',
        resourceId: result.sessionId,
        userId: result.user?.id || null,
        sessionId: result.sessionId,
        outcome: 'SUCCESS'
      })
    ]);

    return res.json({
      msg: 'Login correcto',
      ...result.toJSON({ includeTokens: shouldIncludeJsonTokens(), csrfToken })
    });
  } catch (err) {
    await auditEvent(req, {
      action: 'AUTH_LOGIN',
      resource: 'sessions',
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || 'AUTH_LOGIN_ERROR' }
    });

    if (err.code === 'ACCOUNT_DISABLED') {
      return sendSecurityError(res, req, 403, 'ACCOUNT_DISABLED', 'Cuenta de usuario desactivada');
    }

    const status =
      err.code === 'INVALID_CREDENTIALS' || err.code === 'INVALID_PASSWORD' || err.code === 'USER_NOT_FOUND'
        ? 401
        : 500;
    const message = status === 401 ? 'Credenciales inválidas' : 'Error interno de autenticación';
    return sendSecurityError(res, req, status, status === 401 ? 'INVALID_CREDENTIALS' : 'AUTH_LOGIN_ERROR', message);
  }
};

exports.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieAccess = req.cookies && req.cookies[ACCESS_COOKIE_NAME];
    const cookieRefresh = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    const headerAuth = !isProd && req.headers && typeof req.headers['authorization'] === 'string'
      ? req.headers['authorization'].replace(/^Bearer\s+/i, '').trim()
      : null;
    const bodyToken = !isProd && req.body ? req.body.refreshToken || req.body.token || null : null;
    const bodyAccess = !isProd && req.body ? req.body.accessToken || null : null;

    const result = await authService.logout({
      accessToken: cookieAccess || headerAuth || bodyAccess || null,
      refreshToken: cookieRefresh || bodyToken || null
    });

    const sidToRevoke = result.sessionId || req.auth?.sid;
    if (sidToRevoke) {
      await UserSessionService.getInstance().revokeSessionBySid(sidToRevoke);
    }

    clearAuthCookies(res);

    await auditEvent(req, {
      action: 'AUTH_LOGOUT',
      resource: 'sessions',
      resourceId: result.sessionId || null,
      userId: result.user?.id || req.user?.id || null,
      sessionId: result.sessionId || null,
      outcome: 'SUCCESS'
    });

    return res.json({ msg: 'Logout correcto', user: result.user });
  } catch (err) {
    clearAuthCookies(res);
    return sendSecurityError(res, req, 500, err.code || 'AUTH_LOGOUT_ERROR', 'Error al cerrar sesión');
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieRt = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    const bodyRt = req.body ? req.body.refreshToken || req.body.token : null;
    const rt = cookieRt || bodyRt;

    if (!rt) {
      return sendSecurityError(res, req, 401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token requerido');
    }

    const result = await authService.refreshTokens(rt);
    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: (req.cookies && req.cookies[CSRF_COOKIE_NAME]) || undefined
    });

    await auditEvent(req, {
      action: 'AUTH_REFRESH',
      resource: 'sessions',
      resourceId: result.sessionId,
      userId: result.user?.id || null,
      sessionId: result.sessionId,
      outcome: 'SUCCESS'
    });

    return res.json({
      msg: 'Tokens renovados',
      ...result.toJSON({ includeTokens: shouldIncludeJsonTokens(), csrfToken })
    });
  } catch (err) {
    if (
      err.code === 'REFRESH_TOKEN_REUSED' ||
      err.code === 'REFRESH_TOKEN_REVOKED' ||
      err.code === 'REFRESH_TOKEN_EXPIRED' ||
      err.code === 'REFRESH_TOKEN_INVALID' ||
      err.code === 'ACCOUNT_DISABLED'
    ) {
      clearAuthCookies(res);
    }

    await auditEvent(req, {
      action: 'AUTH_REFRESH',
      resource: 'sessions',
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || 'AUTH_REFRESH_ERROR' }
    });

    const status =
      err.code === 'REFRESH_TOKEN_REQUIRED'
        ? 400
        : err.code === 'ACCOUNT_DISABLED'
        ? 403
        : err.code === 'REFRESH_TOKEN_EXPIRED' ||
          err.code === 'REFRESH_TOKEN_INVALID' ||
          err.code === 'REFRESH_TOKEN_REVOKED' ||
          err.code === 'REFRESH_TOKEN_REUSED' ||
          err.code === 'USER_NOT_FOUND'
        ? 401
        : 500;
    return sendSecurityError(res, req, status, err.code || 'AUTH_REFRESH_ERROR', err.message);
  }
};

exports.session = async (req, res) => {
  let csrfToken = req.cookies && req.cookies[CSRF_COOKIE_NAME];
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
    setAuthCookies(res, { csrfToken });
  } else if (typeof res.setHeader === 'function') {
    res.setHeader('X-CSRF-Token', csrfToken);
  }

  return res.json({
    authenticated: true,
    user: req.user,
    csrf_token: csrfToken
  });
};


const EmailVerificationService = require('../../application/security/EmailVerificationService');
const emailVerificationService = new EmailVerificationService();

exports.getMailingStatus = async (_req, res) => {
  try {
    const mailingRequired = await emailVerificationService.isMailingConfigured();
    return res.status(200).json({ mailingRequired });
  } catch (_) {
    return res.status(200).json({ mailingRequired: false });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const { mail, name, frontendUrl } = req.body || {};
    const targetMail = mail || req.user?.mail;
    const targetName = name || req.user?.name;

    const result = await emailVerificationService.initiateVerification({
      mail: targetMail,
      name: targetName,
      userId: req.user?.id || null,
      frontendUrl
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      code: err.code || 'VERIFICATION_ERROR',
      message: err.message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mail, otpCode, newPassword } = req.body || {};
    const targetMail = mail || req.user?.mail;

    const result = await emailVerificationService.verifyOtp({
      mail: targetMail,
      otpCode,
      newPassword
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      code: err.code || 'INVALID_OTP',
      message: err.message
    });
  }
};

exports.verifyLink = async (req, res) => {
  try {
    const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
    const source = hasBody ? req.body : (req.query || {});
    const { token, mail, newPassword } = source;
    const result = await emailVerificationService.verifyLinkToken(token, mail, { newPassword });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      code: err.code || 'INVALID_LINK',
      message: err.message
    });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { tempToken, code, isRecoveryCode, trustDevice, deviceId, deviceFingerprint, rememberMe = true } = req.body || {};
    const result = await authService.verify2FALogin({
      tempToken,
      code,
      isRecoveryCode: Boolean(isRecoveryCode),
      trustDevice: Boolean(trustDevice),
      deviceId,
      deviceFingerprint,
      req
    });

    const csrfToken = setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberMe: Boolean(rememberMe)
    });

    // Registrar sesión en base de datos y evento de auditoría antes de responder
    await Promise.allSettled([
      UserSessionService.getInstance().createSession({
        sid: result.sessionId,
        userId: result.user?.id,
        req,
        rememberMe: Boolean(rememberMe)
      }),
      auditEvent(req, {
        action: 'AUTH_LOGIN_2FA_SUCCESS',
        resource: 'sessions',
        resourceId: result.sessionId,
        userId: result.user?.id || null,
        sessionId: result.sessionId,
        outcome: 'SUCCESS'
      })
    ]);

    return res.json({
      msg: 'Login correcto',
      ...result.toJSON({ includeTokens: shouldIncludeJsonTokens(), csrfToken })
    });
  } catch (err) {
    await auditEvent(req, {
      action: 'AUTH_LOGIN_2FA_FAILURE',
      resource: 'sessions',
      outcome: 'FAILURE',
      metadata: { errorCode: err.code || '2FA_VERIFY_ERROR', message: err.message }
    });

    const status =
      err.status ||
      (err.code === '2FA_MAX_ATTEMPTS' ? 429 : err.code === 'ACCOUNT_DISABLED' ? 403 : 400);
    return sendSecurityError(res, req, status, err.code || 'INVALID_2FA_CODE', err.message || 'Código de seguridad inválido');
  }
};

exports.resend2FA = async (req, res) => {
  try {
    const { tempToken } = req.body || {};
    const result = await authService.resend2FALogin({ tempToken });
    return res.json(result);
  } catch (err) {
    const status = err.status || 400;
    return sendSecurityError(res, req, status, err.code || '2FA_RESEND_ERROR', err.message || 'Error al reenviar código');
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const PasswordResetService = require('../../application/security/PasswordResetService');
    const passwordResetService = new PasswordResetService();
    const { mail, frontendUrl } = req.body || {};
    const result = await passwordResetService.requestPasswordReset({ mail, frontendUrl });
    await auditEvent(req, {
      action: 'AUTH_PASSWORD_RESET_REQUESTED',
      resource: 'users',
      outcome: 'SUCCESS',
      metadata: { mail: maskEmail(mail) }
    });
    return res.json(result);
  } catch (err) {
    const status = err.statusCode || err.status || 400;
    return sendSecurityError(
      res,
      req,
      status,
      err.code || 'FORGOT_PASSWORD_ERROR',
      err.message || 'Error al solicitar el restablecimiento de contraseña'
    );
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const PasswordResetService = require('../../application/security/PasswordResetService');
    const passwordResetService = new PasswordResetService();
    const { mail, otpCode, token } = req.body || {};
    const result = await passwordResetService.verifyResetCode({ mail, otpCode, token });
    return res.json(result);
  } catch (err) {
    const status = err.statusCode || err.status || 400;
    return sendSecurityError(
      res,
      req,
      status,
      err.code || 'VERIFY_RESET_CODE_ERROR',
      err.message || 'Error al verificar el código de restablecimiento'
    );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const PasswordResetService = require('../../application/security/PasswordResetService');
    const passwordResetService = new PasswordResetService();
    const { mail, otpCode, token, newPassword } = req.body || {};
    const result = await passwordResetService.resetPassword({ mail, otpCode, token, newPassword });
    await auditEvent(req, {
      action: 'AUTH_PASSWORD_RESET_COMPLETED',
      resource: 'users',
      outcome: 'SUCCESS',
      metadata: { mail: maskEmail(mail) }
    });
    return res.json(result);
  } catch (err) {
    const status = err.statusCode || err.status || 400;
    return sendSecurityError(
      res,
      req,
      status,
      err.code || 'RESET_PASSWORD_ERROR',
      err.message || 'Error al restablecer la contraseña'
    );
  }
};
