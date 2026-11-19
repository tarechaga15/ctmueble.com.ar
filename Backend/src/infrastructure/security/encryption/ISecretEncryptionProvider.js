/**
 * Interfaz base para proveedores de cifrado de secretos y credenciales.
 * Diseñada para permitir el intercambio transparente entre cifrado simétrico local (AES-256-GCM)
 * y Envelope Encryption con Key Management Service (AWS KMS / Cloud KMS).
 */
class ISecretEncryptionProvider {
  /**
   * Cifra un texto plano.
   * @param {string} plaintext - Texto o clave a cifrar
   * @param {Object} [context] - Contexto adicional o Encryption Context (AAD para autenticación)
   * @returns {Promise<{ ciphertext: string, iv: string, tag: string, keyVersion: string, algorithm: string, envelope?: Object }>}
   */
  async encrypt(_plaintext, _context = {}) {
    throw new Error('encrypt() must be implemented by encryption provider');
  }

  /**
   * Descifra un texto cifrado.
   * @param {Object} payload - Objeto con ciphertext, iv, tag, keyVersion, envelope
   * @param {Object} [context] - Contexto de descifrado (AAD)
   * @returns {Promise<string>} Texto plano descifrado
   */
  async decrypt(_payload, _context = {}) {
    throw new Error('decrypt() must be implemented by encryption provider');
  }
}

module.exports = ISecretEncryptionProvider;
