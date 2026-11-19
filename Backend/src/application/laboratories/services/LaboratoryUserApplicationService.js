'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, LabMembers, LaboratoryPermission, EmailVerification } = require('../../../infrastructure/models');
const MailingService = require('../../../infrastructure/mailing/MailingService');
const { CATALOGO_PERMISOS, ROLES } = require('../../../shared/permissionsCatalog');

const ROLE_DISPLAY_TO_DB = {
  Admin: 'ADMIN',
  Usuario: 'USER',
  Consulta: 'CONSULTA',
  ADMIN: 'ADMIN',
  USER: 'USER',
  CONSULTA: 'CONSULTA'
};

const ROLE_DB_TO_DISPLAY = {
  ADMIN: 'Admin',
  USER: 'Usuario',
  CONSULTA: 'Consulta'
};

class LaboratoryUserApplicationService {
  constructor(options = {}) {
    this.userModel = options.userModel || User;
    this.labMembersModel = options.labMembersModel || LabMembers;
    this.labPermissionModel = options.labPermissionModel || LaboratoryPermission;
    this.emailVerificationModel = options.emailVerificationModel || EmailVerification;
    this.mailingService = options.mailingService || new MailingService();
  }

  _hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }

  /**
   * Lista todos los usuarios miembros del laboratorio con sus roles y estados.
   */
  async listUsers() {
    // 1. Obtener todos los miembros del laboratorio
    const members = await this.labMembersModel.findAll();
    const memberMap = new Map();
    for (const m of members) {
      memberMap.set(String(m.user), m.role);
    }

    // 2. Obtener usuarios con perfil LABORATORY o que estén en members
    const allLabUsers = await this.userModel.findAll({
      where: { profile: 'LABORATORY' },
      order: [['name', 'ASC'], ['mail', 'ASC']]
    });

    const result = [];
    for (const u of allLabUsers) {
      const dbRole = memberMap.get(String(u.id)) || (u.mail === 'tarechaga15@gmail.com' || u.mail === 'dev@ctmueble.com.ar' ? 'ADMIN' : 'USER');
      const displayRole = ROLE_DB_TO_DISPLAY[dbRole] || 'Usuario';
      const isSuperAdmin = dbRole === 'ADMIN' || u.mail === 'tarechaga15@gmail.com' || u.mail === 'dev@ctmueble.com.ar';

      result.push({
        id: u.id,
        username: (u.mail || '').split('@')[0],
        nombreCompleto: u.name || u.mail || 'Usuario',
        email: u.mail || null,
        dni: u.dni || '',
        telefono: null,
        rol: displayRole,
        activo: u.is_active !== false,
        debeCambiarPassword: false,
        bloqueadoHasta: null,
        isSuperAdmin
      });
    }

    return result;
  }

  /**
   * Crea un nuevo usuario interno del laboratorio y le envía el correo de activación.
   */
  async createUser({ nombreCompleto, dni, email, rol, telefono, frontendUrl }) {
    const cleanMail = String(email || '').trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      const err = new Error('Correo electrónico inválido');
      err.status = 400;
      throw err;
    }

    const cleanName = String(nombreCompleto || '').trim();
    if (!cleanName) {
      const err = new Error('El nombre completo es requerido');
      err.status = 400;
      throw err;
    }

    const cleanDni = String(dni || '').trim();
    const roleNormalized = ROLE_DISPLAY_TO_DB[rol] || 'USER';

    // 1. Verificar si el usuario ya existe
    let user = await this.userModel.findOne({ where: { mail: cleanMail } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const tempRandomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempRandomPassword, salt);

      user = await this.userModel.create({
        name: cleanName,
        dni: cleanDni,
        mail: cleanMail,
        password: hashedPassword,
        profile: 'LABORATORY',
        is_active: true
      });
    } else {
      // Si ya existía, asegurarse de que tiene acceso a LABORATORY y está activo
      await user.update({
        profile: 'LABORATORY',
        is_active: true,
        ...(cleanName ? { name: cleanName } : {}),
        ...(cleanDni ? { dni: cleanDni } : {})
      });
    }

    // 2. Vincular como miembro del laboratorio con el rol asignado
    const existingMember = await this.labMembersModel.findOne({ where: { user: user.id } });
    if (existingMember) {
      await existingMember.update({ role: roleNormalized });
    } else {
      await this.labMembersModel.create({
        user: user.id,
        role: roleNormalized
      });
    }

    // 3. Generar token criptográfico y código OTP para activación
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const otpHash = this._hash(otpCode);
    const tokenHash = this._hash(verificationToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas

    // Invalidar tokens previos
    await this.emailVerificationModel.destroy({
      where: {
        mail: cleanMail,
        verified_at: null
      }
    });

    // Guardar registro de verificación
    await this.emailVerificationModel.create({
      user_id: user.id,
      mail: cleanMail,
      otp_code_hash: otpHash,
      token_hash: tokenHash,
      expires_at: expiresAt,
      attempts: 0
    });

    // 4. Enviar correo de activación mediante MailingService
    let mailingSent = false;
    let mailingError = null;

    try {
      const isConfigured = await this.mailingService.isConfigured();
      if (isConfigured) {
        await this.mailingService.sendLaboratoryInvitation({
          to: cleanMail,
          name: cleanName,
          role: roleNormalized,
          otpCode,
          verificationToken,
          frontendUrl
        });
        mailingSent = true;
      }
    } catch (err) {
      console.warn('[LaboratoryUserApplicationService] No se pudo enviar el correo de activación:', err.message);
      mailingError = err.message;
    }

    return {
      id: user.id,
      username: cleanMail.split('@')[0],
      nombreCompleto: user.name,
      email: user.mail,
      rol: ROLE_DB_TO_DISPLAY[roleNormalized] || 'Usuario',
      activo: true,
      isNewUser,
      mailingSent,
      mailingError
    };
  }

  /**
   * Modifica nombre, DNI, rol y estado activo de un usuario de laboratorio.
   */
  async updateUser(userId, { nombreCompleto, dni, rol, activo }) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    const updates = {};
    if (nombreCompleto) updates.name = String(nombreCompleto).trim();
    if (dni !== undefined) updates.dni = String(dni || '').trim();
    if (activo !== undefined) updates.is_active = Boolean(activo);

    if (Object.keys(updates).length > 0) {
      await user.update(updates);
    }

    if (rol) {
      const roleNormalized = ROLE_DISPLAY_TO_DB[rol] || 'USER';
      const member = await this.labMembersModel.findOne({ where: { user: userId } });
      if (member) {
        await member.update({ role: roleNormalized });
      } else {
        await this.labMembersModel.create({ user: userId, role: roleNormalized });
      }
    }

    // Al desactivar un usuario de laboratorio, revocar inmediatamente sesiones y dispositivos de confianza
    if (activo === false) {
      try {
        const UserSessionService = require('../../../infrastructure/auth/services/UserSessionService');
        await UserSessionService.getInstance().revokeOtherSessions(userId, null);
      } catch (_) {}
      try {
        const TrustedDeviceService = require('../../../infrastructure/auth/services/TrustedDeviceService');
        await TrustedDeviceService.getInstance().revokeAllDevices(userId);
      } catch (_) {}
    }

    return { success: true };
  }

  /**
   * Resetea la contraseña de un usuario a una contraseña temporal.
   */
  async resetPassword(userId, newPassword) {
    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 64) {
      const err = new Error('La contraseña debe tener entre 12 y 64 caracteres');
      err.status = 400;
      err.code = 'WEAK_PASSWORD';
      throw err;
    }

    const user = await this.userModel.findByPk(userId);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });

    // Revocar sesiones y dispositivos de confianza tras reseteo administrativo de contraseña
    try {
      const UserSessionService = require('../../../infrastructure/auth/services/UserSessionService');
      await UserSessionService.getInstance().revokeOtherSessions(userId, null);
    } catch (_) {}
    try {
      const TrustedDeviceService = require('../../../infrastructure/auth/services/TrustedDeviceService');
      await TrustedDeviceService.getInstance().revokeAllDevices(userId);
    } catch (_) {}

    return { success: true };
  }

  /**
   * Reenvía el correo de activación con un nuevo código/token.
   */
  async resendActivation(userId, frontendUrl) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    const member = await this.labMembersModel.findOne({ where: { user: userId } });
    const role = member?.role || 'USER';

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const otpHash = this._hash(otpCode);
    const tokenHash = this._hash(verificationToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await this.emailVerificationModel.destroy({
      where: {
        mail: user.mail,
        verified_at: null
      }
    });

    await this.emailVerificationModel.create({
      user_id: user.id,
      mail: user.mail,
      otp_code_hash: otpHash,
      token_hash: tokenHash,
      expires_at: expiresAt,
      attempts: 0
    });

    let mailingSent = false;
    try {
      if (await this.mailingService.isConfigured()) {
        await this.mailingService.sendLaboratoryInvitation({
          to: user.mail,
          name: user.name,
          role,
          otpCode,
          verificationToken,
          frontendUrl
        });
        mailingSent = true;
      }
    } catch (err) {
      console.warn('[LaboratoryUserApplicationService] Error al reenviar invitación:', err.message);
    }

    return { success: true, mailingSent };
  }

  /**
   * Obtiene la matriz de permisos por rol junto al catálogo de acciones.
   */
  async getPermissionsMatrix() {
    const dbPermissions = await this.labPermissionModel.findAll();
    const matrix = [];

    // Mapeo existente en DB
    const permMap = new Map();
    for (const p of dbPermissions) {
      permMap.set(`${p.rol}:${p.accion}`, p.permitido);
    }

    // Asegurar valores para Usuario y Consulta
    for (const item of CATALOGO_PERMISOS) {
      for (const rol of ['Usuario', 'Consulta']) {
        const key = `${rol}:${item.clave}`;
        const defaultVal = rol === 'Usuario' ? item.usuario : item.consulta;
        const permitido = permMap.has(key) ? permMap.get(key) : defaultVal;
        matrix.push({ rol, accion: item.clave, permitido });
      }
    }

    return {
      catalogo: CATALOGO_PERMISOS,
      matriz: matrix
    };
  }

  /**
   * Guarda o actualiza los permisos de la matriz.
   */
  async updatePermissionsMatrix(items) {
    if (!Array.isArray(items)) {
      const err = new Error('Formato de permisos inválido');
      err.status = 400;
      throw err;
    }

    for (const item of items) {
      if (!item.rol || !item.accion) continue;
      const existing = await this.labPermissionModel.findOne({
        where: { rol: item.rol, accion: item.accion }
      });

      if (existing) {
        await existing.update({ permitido: Boolean(item.permitido) });
      } else {
        await this.labPermissionModel.create({
          rol: item.rol,
          accion: item.accion,
          permitido: Boolean(item.permitido)
        });
      }
    }

    try {
      const { invalidatePermissionsCache } = require('../../../presentation/middlewares/requireLabPermission');
      invalidatePermissionsCache();
    } catch (_) {}

    return { success: true };
  }
}

module.exports = LaboratoryUserApplicationService;
