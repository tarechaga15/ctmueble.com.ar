const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const verifyJWT = require('../middlewares/jwt.verify');
const { verifyAuthCookieCsrf } = require('../middlewares/csrf');
const { createRateLimiter } = require('../middlewares/rateLimit');

const authRegisterLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  code: 'AUTH_REGISTER_RATE_LIMIT',
  message: 'Demasiados intentos de registro, intente nuevamente más tarde.'
});

const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  code: 'AUTH_RATE_LIMIT',
  message: 'Demasiados intentos de autenticación, intente nuevamente más tarde.'
});

const authRefreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  code: 'AUTH_REFRESH_RATE_LIMIT',
  message: 'Demasiadas renovaciones de token, intente nuevamente más tarde.'
});

const authVerificationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  code: 'AUTH_VERIFY_RATE_LIMIT',
  message: 'Demasiadas solicitudes de verificación, intente nuevamente más tarde.'
});

router.post('/register', authRegisterLimiter, authController.register);
router.post('/login', authLoginLimiter, authController.login);
router.post('/logout', verifyAuthCookieCsrf, authController.logout);
router.post('/refresh_token', authRefreshLimiter, verifyAuthCookieCsrf, authController.refreshToken);
router.get('/session', verifyJWT, authController.session);

// Desafío y verificación de 2FA durante el inicio de sesión
router.post('/2fa/verify', authVerificationLimiter, authController.verify2FA);
router.post('/2fa/resend', authVerificationLimiter, authController.resend2FA);

// Rutas de Verificación de Correo (OTP y Magic Link)
router.get('/mailing-status', authController.getMailingStatus);
router.post('/send-verification', authVerificationLimiter, authController.sendVerification);
router.post('/verify-otp', authVerificationLimiter, authController.verifyOtp);
router.get('/verify-link', authVerificationLimiter, authController.verifyLink);
router.post('/verify-link', authVerificationLimiter, authController.verifyLink);

// Rutas de Recuperación de Contraseña (Olvidó su contraseña)
router.post('/forgot-password', authVerificationLimiter, authController.forgotPassword);
router.post('/verify-reset-code', authVerificationLimiter, authController.verifyResetCode);
router.post('/reset-password', authVerificationLimiter, authController.resetPassword);

module.exports = router;
