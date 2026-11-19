/**
 * DTO (Data Transfer Object) para transferir datos de usuarios.
 * Representa la estructura de datos que se envía al cliente.
 */
class UserDTO {
  /**
   * Constructor del DTO de usuario.
   * @param {Object} params - Datos del usuario
   * @param {string} params.id - ID del usuario
   * @param {string} params.mail - Email del usuario
   * @param {string} [params.name] - Nombre del usuario
   * @param {string} [params.dni] - DNI del usuario
   * @param {string} params.profile - Perfil del usuario
   * @param {string} params.laboratory - ID del laboratorio asociado
   * @param {Date} params.createdAt - Fecha de creación
   * @param {boolean} [params.isSuperAdmin] - Es superadministrador
   * @param {string} [params.labRole] - Rol interno de laboratorio (ADMIN, USER, CONSULTA)
   * @param {boolean} [params.isActive] - Usuario habilitado
   */
  constructor({
    id,
    mail,
    name,
    dni,
    profile,
    laboratory,
    createdAt,
    isSuperAdmin = false,
    labRole = null,
    isActive = true
  }) {
    this.id = id;
    this.mail = mail;
    this.name = name ?? null;
    this.dni = dni ?? null;
    this.profile = profile;
    this.laboratory = laboratory;
    this.createdAt = createdAt;
    this.isSuperAdmin = Boolean(isSuperAdmin);
    this.labRole = labRole ?? null;
    this.isActive = isActive !== false;
  }
}

module.exports = UserDTO;
