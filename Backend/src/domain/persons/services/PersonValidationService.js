/**
 * Servicio de dominio para validar reglas de negocio relacionadas con personas.
 * Encapsula las validaciones específicas según el perfil del usuario.
 */
class PersonValidationService {
  async validateUserCanSeePerson(user, person) {
    if (user.profile === 'CLIENT' && person.userId !== user.id) {
      throw new Error('No tienes permisos para ver esta persona');
    }
    return true;
  }
  /**
   * Valida si un usuario CLIENT puede crear una persona.
   * Los usuarios CLIENT solo pueden tener una persona asociada.
   * @param {Object} user - Usuario que intenta crear la persona
   * @param {Function} findExistingPerson - Función para buscar persona existente
   * @returns {Promise<boolean>} True si puede crear, false si ya existe
   * @throws {Error} Si la persona ya existe para usuarios CLIENT
   */
  async validateClientCanCreatePerson(user, findExistingPerson) {
    if (user.profile === 'CLIENT') {
      const existingPerson = await findExistingPerson(user.id);
      // existingPerson puede ser un registro que debe ser verificado: userId igual, isThirdParty === false, origin==='CLIENT'
      if (Array.isArray(existingPerson)) {
        const alreadyExists = existingPerson.some(
          p =>
            p.userId === user.id &&
            (p.isThirdParty === false || p.isThirdParty === undefined) &&
            (p.origin === 'CLIENT')
        );
        if (alreadyExists) {
          throw new Error('Persona ya existe para este usuario');
        }
      } else if (existingPerson) {
        if (
          existingPerson.userId === user.id &&
          (existingPerson.isThirdParty === false || existingPerson.isThirdParty === undefined) &&
          (existingPerson.origin === 'CLIENT')
        ) {
          throw new Error('Persona ya existe para este usuario');
        }
      }
      return true;
    }
    return true;
  }

  /**
   * Determina si se debe asignar automáticamente el userId a la persona.
   * Solo usuarios CLIENT tienen esta restricción.
   * @param {Object} user - Usuario que crea la persona
   * @param {boolean} isThirdParty - True si la persona es de un tercero
   * @returns {boolean} True si se debe asignar el userId
   */
  shouldAssignUserId(user, isThirdParty) {
    if (isThirdParty) {
      return false;
    }
    return user.profile === 'CLIENT';
  }
}

module.exports = PersonValidationService;
