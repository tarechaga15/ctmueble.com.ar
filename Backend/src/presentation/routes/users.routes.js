const express = require('express');
const router = express.Router();

const usersController = require("../controllers/users.controller");
const laboratoryUsersRouter = require("./laboratoryUsers.routes");
const requireLaboratory = require("../middlewares/requireLaboratory");

// Gestión interna de usuarios del laboratorio (solo superadmin)
router.use("/laboratory", requireLaboratory, laboratoryUsersRouter);

router.get("/get", usersController.getUser);
router.get("/get_data", usersController.getClientData);
router.put("/update_data", usersController.updateClientData);
router.put("/switch_profile", usersController.switchProfile);
router.get("/fetch_user_laboratories", usersController.fetchUserLaboratories);
router.put("/switch_laboratory", usersController.switchLaboratory);

// Seguridad y Configuración de Cuenta
router.put("/change-password", usersController.changePassword);

// Doble Factor de Autenticación (2FA)
router.get("/2fa/status", usersController.getTwoFactorStatus);
router.post("/2fa/email/setup", usersController.setupEmail2FA);
router.post("/2fa/email/confirm", usersController.confirmEmail2FA);
router.post("/2fa/totp/setup", usersController.setupTotp2FA);
router.post("/2fa/totp/confirm", usersController.confirmTotp2FA);
router.post("/2fa/disable", usersController.disable2FA);
router.get("/2fa/recovery-codes", usersController.getRecoveryCodesStatus);
router.post("/2fa/recovery-codes/generate", usersController.generateRecoveryCodes);

// Dispositivos de Confianza
router.get("/trusted-devices", usersController.getTrustedDevices);
router.delete("/trusted-devices/all", usersController.revokeAllTrustedDevices);
router.delete("/trusted-devices/:id", usersController.revokeTrustedDevice);

// Sesiones Activas
router.get("/sessions", usersController.getActiveSessions);
router.delete("/sessions/other", usersController.revokeOtherSessions);
router.delete("/sessions/:id", usersController.revokeSession);

module.exports = router;