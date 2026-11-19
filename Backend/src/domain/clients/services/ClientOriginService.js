/**
 * Servicio de dominio para determinar el origen de un cliente.
 * Encapsula la lógica de negocio sobre cómo se determina el origen según el perfil del usuario.
 */
class ClientOriginService {
  /**
   * Determina el origen de un cliente según el perfil del usuario que lo crea.
   * @param {Object} user - Usuario que crea el cliente
   * @returns {string} Origen del cliente: 'LABORATORY' o 'CLIENT'
   */
  determineOrigin(user) {
    if (user && user.profile === 'LABORATORY') {
      return 'LABORATORY';
    }
    return 'CLIENT';
  }
}

module.exports = ClientOriginService;

