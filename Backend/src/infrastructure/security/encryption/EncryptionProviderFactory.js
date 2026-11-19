const AesGcmEncryptionProvider = require('./AesGcmEncryptionProvider');
const KmsEnvelopeEncryptionProvider = require('./KmsEnvelopeEncryptionProvider');

let currentProvider = null;

class EncryptionProviderFactory {
  /**
   * Obtiene el proveedor de cifrado configurado en el sistema.
   * Por defecto usa AES-256-GCM con claves versionadas en variables de entorno.
   * Si USE_KMS_ENVELOPE es true, utiliza Envelope Encryption.
   */
  static getProvider() {
    if (!currentProvider) {
      if (process.env.USE_KMS_ENVELOPE === 'true') {
        currentProvider = new KmsEnvelopeEncryptionProvider();
      } else {
        currentProvider = new AesGcmEncryptionProvider();
      }
    }
    return currentProvider;
  }

  /**
   * Permite inyectar un proveedor personalizado (ej. para pruebas o KMS mock).
   */
  static setProvider(provider) {
    currentProvider = provider;
  }

  static reset() {
    currentProvider = null;
  }
}

module.exports = EncryptionProviderFactory;
