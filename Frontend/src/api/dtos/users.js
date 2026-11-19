/**
 * DTOs de usuarios. Alineados con gestion.ctmueble.com.ar/src/application/users/dto.
 *
 * GET: UserDTO — respuesta al obtener usuario (ej. perfil).
 */

/**
 * DTO para transferir datos de usuarios (GET – respuesta).
 * @typedef {Object} UserDTO
 * @property {string} id
 * @property {string} mail
 * @property {string} profile
 * @property {string} laboratory
 * @property {string|Date} createdAt
 */

/**
 * Normaliza respuesta GET de usuario.
 * @param {UserDTO} data
 * @returns {UserDTO}
 */
export function createUserDTO(data) {
  return {
    id: data.id,
    mail: data.mail,
    profile: data.profile,
    laboratory: data.laboratory,
    createdAt: data.createdAt,
  };
}
