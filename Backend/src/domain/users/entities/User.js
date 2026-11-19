/**
 * Entidad de dominio que representa un usuario del sistema.
 * Un usuario puede tener diferentes perfiles y estar asociado a un laboratorio.
 */
class User {
  /**
   * Constructor de la entidad User.
   * @param {Object} params - Parámetros del usuario
   * @param {string} params.id - Identificador único del usuario
   * @param {string} params.mail - Email del usuario
   * @param {string} params.profile - Perfil del usuario (CLIENT, LABORATORY, etc.)
   * @param {string} params.laboratory - ID del laboratorio asociado (si aplica)
   * @param {Date} params.createdAt - Fecha de creación del usuario
   * @param {string} [params.name] - Nombre (opcional, para Neon/registro)
   * @param {string} [params.dni] - DNI (opcional)
   * @param {string} [params.passwordHash] - Hash de contraseña (solo uso interno en auth, no exponer)
   */
  constructor({
    id,
    mail,
    profile,
    laboratory,
    createdAt,
    name = null,
    dni = null,
    passwordHash = null,
    twoFactorEnabled = false,
    twoFactorMethod = 'NONE',
    twoFactorSecret = null,
    twoFactorTempSecret = null,
    twoFactorConfirmedAt = null,
    isActive = true
  }) {
    this.id = id;
    this.mail = mail;
    this.profile = profile;
    this.laboratory = laboratory;
    this.createdAt = createdAt;
    this.name = name;
    this.dni = dni;
    this.passwordHash = passwordHash;
    this.twoFactorEnabled = Boolean(twoFactorEnabled);
    this.twoFactorMethod = twoFactorMethod || 'NONE';
    this.twoFactorSecret = twoFactorSecret;
    this.twoFactorTempSecret = twoFactorTempSecret;
    this.twoFactorConfirmedAt = twoFactorConfirmedAt;
    this.isActive = isActive !== false;
  }

  /**
   * Cambia el perfil del usuario.
   * @param {string} profile - Nuevo perfil
   */
  switchProfile(profile) {
    this.profile = profile;
  }

  /**
   * Cambia el laboratorio asociado al usuario.
   * @param {string} laboratory - ID del nuevo laboratorio
   */
  switchLaboratory(laboratory) {
    this.laboratory = laboratory;
  }

  /**
   * Verifica si el usuario es un cliente.
   * @returns {boolean} True si el perfil es CLIENT
   */
  isClient() {
    return this.profile === 'CLIENT';
  }

  /**
   * Verifica si el usuario es un laboratorio.
   * @returns {boolean} True si el perfil es LABORATORY
   */
  isLaboratory() {
    return this.profile === 'LABORATORY';
  }
}

module.exports = User;

