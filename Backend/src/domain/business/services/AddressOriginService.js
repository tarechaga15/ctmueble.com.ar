/**
 * Servicio de dominio para determinar el origen de una dirección de empresa.
 * Encapsula la lógica de negocio sobre cómo se determina el origen según el perfil del usuario.
 */
class AddressOriginService {
  /**
   * Determina el origen de una dirección según el perfil del usuario.
   * @param {Object} user - Usuario que crea la dirección
   * @param {string} providedOrigin - Origen proporcionado (opcional)
   * @returns {string} Origen de la dirección: 'CLIENT', 'LABORATORY' o 'PUBLIC'
   */
  determineOrigin(user, providedOrigin = null) {
    if (providedOrigin) {
      return providedOrigin;
    }

    if (user.profile === 'CLIENT') {
      return 'CLIENT';
    } else if (user.profile === 'LABORATORY') {
      return 'LABORATORY';
    }
    return 'PUBLIC';
  }
}

module.exports = AddressOriginService;

