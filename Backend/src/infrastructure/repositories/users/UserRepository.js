/**
 * Implementación del repositorio de usuarios usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio User.
 */
const IUserRepository = require('../../../domain/users/repositories/IUserRepository');
const User = require('../../../domain/users/entities/User');
const { User: UserModel, LabMembers, Laboratory } = require('../../models');
const EncryptionProviderFactory = require('../../security/encryption/EncryptionProviderFactory');

const TOTP_ENC_PREFIX = 'enc:v1:';

class UserRepository extends IUserRepository {
  async _encryptTotpSecret(plainSecret, userId) {
    if (!plainSecret || typeof plainSecret !== 'string') return plainSecret;
    if (plainSecret.startsWith(TOTP_ENC_PREFIX)) return plainSecret;
    const provider = EncryptionProviderFactory.getProvider();
    const context = { aad: `user-totp:${userId}` };
    const encrypted =
      typeof provider.encryptSync === 'function'
        ? provider.encryptSync(plainSecret, context)
        : await provider.encrypt(plainSecret, context);
    return `${TOTP_ENC_PREFIX}${JSON.stringify(encrypted)}`;
  }

  _decryptTotpSecretSync(storedValue, userId) {
    if (!storedValue || typeof storedValue !== 'string') return storedValue;
    if (!storedValue.startsWith(TOTP_ENC_PREFIX)) return storedValue;
    try {
      const payload = JSON.parse(storedValue.slice(TOTP_ENC_PREFIX.length));
      const provider = EncryptionProviderFactory.getProvider();
      if (typeof provider.decryptSync === 'function') {
        return provider.decryptSync(payload, { aad: `user-totp:${userId}` });
      }
      return storedValue;
    } catch (err) {
      console.error('[UserRepository] Error al descifrar secreto 2FA:', err.message);
      return null;
    }
  }

  async _decryptTotpSecretAsync(storedValue, userId) {
    if (!storedValue || typeof storedValue !== 'string' || !storedValue.startsWith(TOTP_ENC_PREFIX)) {
      return storedValue;
    }
    try {
      const payload = JSON.parse(storedValue.slice(TOTP_ENC_PREFIX.length));
      const provider = EncryptionProviderFactory.getProvider();
      return await provider.decrypt(payload, { aad: `user-totp:${userId}` });
    } catch (err) {
      console.error('[UserRepository] Error al descifrar secreto 2FA:', err.message);
      return null;
    }
  }

  async findById(id) {
    const userData = await UserModel.findOne({ where: { id } });
    return userData ? this.mapToDomain(userData) : null;
  }

  /**
   * Busca un usuario por su email incluyendo el hash de contraseña y datos de 2FA.
   */
  async findByMail(mail) {
    const normalized = String(mail || '').trim().toLowerCase();
    const userData = await UserModel.scope('withPassword').findOne({ where: { mail: normalized } });
    if (!userData) return null;
    const domainUser = this.mapToDomain(userData);
    if (domainUser.twoFactorSecret && String(domainUser.twoFactorSecret).startsWith(TOTP_ENC_PREFIX)) {
      domainUser.twoFactorSecret = await this._decryptTotpSecretAsync(domainUser.twoFactorSecret, domainUser.id);
    }
    if (domainUser.twoFactorTempSecret && String(domainUser.twoFactorTempSecret).startsWith(TOTP_ENC_PREFIX)) {
      domainUser.twoFactorTempSecret = await this._decryptTotpSecretAsync(domainUser.twoFactorTempSecret, domainUser.id);
    }
    return domainUser;
  }

  /**
   * Busca un usuario por su ID incluyendo contraseña y secretos para verificación de seguridad.
   */
  async findByIdWithSecrets(id) {
    const userData = await UserModel.scope('withPassword').findOne({ where: { id } });
    if (!userData) return null;
    const domainUser = this.mapToDomain(userData);
    if (domainUser.twoFactorSecret && String(domainUser.twoFactorSecret).startsWith(TOTP_ENC_PREFIX)) {
      domainUser.twoFactorSecret = await this._decryptTotpSecretAsync(domainUser.twoFactorSecret, domainUser.id);
    }
    if (domainUser.twoFactorTempSecret && String(domainUser.twoFactorTempSecret).startsWith(TOTP_ENC_PREFIX)) {
      domainUser.twoFactorTempSecret = await this._decryptTotpSecretAsync(domainUser.twoFactorTempSecret, domainUser.id);
    }
    return domainUser;
  }

  async updatePassword(userId, newPasswordHash) {
    await UserModel.update({ password: newPasswordHash }, { where: { id: userId } });
  }

  async updateTwoFactor(userId, { twoFactorEnabled, twoFactorMethod, twoFactorSecret, twoFactorTempSecret, twoFactorConfirmedAt }) {
    const fields = {};
    if (twoFactorEnabled !== undefined) fields.two_factor_enabled = Boolean(twoFactorEnabled);
    if (twoFactorMethod !== undefined) fields.two_factor_method = twoFactorMethod;
    if (twoFactorSecret !== undefined) {
      fields.two_factor_secret = twoFactorSecret ? await this._encryptTotpSecret(twoFactorSecret, userId) : null;
    }
    if (twoFactorTempSecret !== undefined) {
      fields.two_factor_temp_secret = twoFactorTempSecret ? await this._encryptTotpSecret(twoFactorTempSecret, userId) : null;
    }
    if (twoFactorConfirmedAt !== undefined) fields.two_factor_confirmed_at = twoFactorConfirmedAt;

    await UserModel.update(fields, { where: { id: userId } });
  }

  async save(user, options = {}) {
    const payload = {
      mail: String(user.mail || '').trim().toLowerCase(),
      profile: user.profile || 'CLIENT',
      laboratory: user.laboratory ?? null,
      name: user.name != null ? user.name : (user.mail || ''),
      dni: user.dni != null ? user.dni : '',
      password: user.passwordHash != null ? user.passwordHash : '',
      is_active: user.isActive !== false
    };
    if (user.id) payload.id = user.id;
    const userData = await UserModel.create(payload, options);
    user.id = userData.id;
    return user;
  }

  async update(user) {
    const updates = {
      profile: user.profile,
      laboratory: user.laboratory ?? null
    };
    if (user.name != null) updates.name = user.name;
    if (user.dni != null) updates.dni = user.dni;
    if (user.isActive !== undefined) updates.is_active = Boolean(user.isActive);
    await UserModel.update(updates, { where: { id: user.id } });
    return user;
  }

  async delete(id) {
    await UserModel.destroy({ where: { id } });
  }

  async findUserLaboratories(userId) {
    const memberships = await LabMembers.findAll({
      where: { user: userId }
    });

    return memberships.map((m) => ({
      laboratory: 'ctm-lab',
      role: m.role,
      lab: { id: 'ctm-lab', name: 'Centro Tecnológico del Mueble' }
    }));
  }

  async isMemberOfLaboratory(userId, laboratoryId) {
    if (!userId) return false;
    const count = await LabMembers.count({
      where: { user: userId }
    });
    return count > 0;
  }

  mapToDomain(userData) {
    return new User({
      id: userData.id,
      mail: userData.mail,
      profile: userData.profile,
      laboratory: userData.laboratory ?? null,
      createdAt: userData.created_at,
      name: userData.name ?? null,
      dni: userData.dni ?? null,
      passwordHash: userData.password ?? null,
      twoFactorEnabled: userData.two_factor_enabled ?? false,
      twoFactorMethod: userData.two_factor_method || 'NONE',
      twoFactorSecret: this._decryptTotpSecretSync(userData.two_factor_secret ?? null, userData.id),
      twoFactorTempSecret: this._decryptTotpSecretSync(userData.two_factor_temp_secret ?? null, userData.id),
      twoFactorConfirmedAt: userData.two_factor_confirmed_at ?? null,
      isActive: userData.is_active !== false
    });
  }
}

module.exports = UserRepository;
