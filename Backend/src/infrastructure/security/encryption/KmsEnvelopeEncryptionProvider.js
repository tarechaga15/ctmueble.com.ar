const crypto = require('crypto');
const ISecretEncryptionProvider = require('./ISecretEncryptionProvider');

/**
 * Proveedor preparado para Envelope Encryption con Key Management Service (AWS KMS, Google Cloud KMS, Vault).
 *
 * Principio de Envelope Encryption:
 * 1. La Clave Maestra del Cliente (CMK / KEK) reside de manera protegida en KMS (HSM FIPS 140-2 Nivel 3).
 * 2. Para cifrar: se solicita a KMS una Data Encryption Key (DEK) efímera de 256 bits.
 *    KMS devuelve el texto plano de la DEK y el texto cifrado de la DEK (EncryptedDataKey).
 * 3. Se cifra el payload localmente con la DEK usando AES-256-GCM.
 * 4. La DEK en texto plano se destruye inmediatamente de la memoria.
 * 5. Se almacena el ciphertext junto con la EncryptedDataKey y el IV/tag.
 * 6. Para descifrar: se envía la EncryptedDataKey a KMS para descifrarla, y con la DEK resultante se descifra el payload localmente.
 */
class KmsEnvelopeEncryptionProvider extends ISecretEncryptionProvider {
  constructor(options = {}) {
    super();
    this.kmsClient = options.kmsClient || null;
    this.keyArn = options.keyArn || process.env.KMS_KEY_ARN;
    this.algorithm = 'AES-256-GCM-ENVELOPE';
  }

  _resolveLocalWrappingKey() {
    const raw =
      process.env.MASTER_ENCRYPTION_KEY_V1 ||
      process.env.APP_ENCRYPTION_KEY ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET;

    if (!raw) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'Configuración insegura en producción: se requiere KMS_KEY_ARN o MASTER_ENCRYPTION_KEY_V1 para Envelope Encryption.'
        );
      }
      return crypto.createHash('sha256').update('kms-mock').digest();
    }

    return crypto.createHash('sha256').update(String(raw)).digest();
  }

  /**
   * Genera una Data Encryption Key (DEK) a través de KMS o simulación local de Envelope.
   */
  async _generateDataKey(context = {}) {
    if (this.kmsClient && typeof this.kmsClient.generateDataKey === 'function') {
      const response = await this.kmsClient.generateDataKey({
        KeyId: this.keyArn,
        KeySpec: 'AES_256',
        EncryptionContext: context
      });
      return {
        plaintextKey: Buffer.from(response.Plaintext),
        encryptedKey: Buffer.from(response.CiphertextBlob).toString('base64')
      };
    }

    // Modo simulación de Envelope Encryption (para testing o entornos sin AWS configurado)
    const plaintextKey = crypto.randomBytes(32);
    // Simula el envelope cifrando la DEK con la clave maestra interna
    const mockEnvelopeKey = this._resolveLocalWrappingKey();
    const mockIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', mockEnvelopeKey, mockIv);
    let encDek = cipher.update(plaintextKey, null, 'base64');
    encDek += cipher.final('base64');
    const mockTag = cipher.getAuthTag().toString('base64');

    return {
      plaintextKey,
      encryptedKey: JSON.stringify({
        edek: encDek,
        iv: mockIv.toString('base64'),
        tag: mockTag
      })
    };
  }

  /**
   * Descifra la Data Encryption Key (DEK) a través de KMS.
   */
  async _decryptDataKey(encryptedKeyString, context = {}) {
    if (this.kmsClient && typeof this.kmsClient.decrypt === 'function') {
      const response = await this.kmsClient.decrypt({
        CiphertextBlob: Buffer.from(encryptedKeyString, 'base64'),
        EncryptionContext: context
      });
      return Buffer.from(response.Plaintext);
    }

    // Modo simulación de Envelope Encryption
    const envelope = JSON.parse(encryptedKeyString);
    const mockEnvelopeKey = this._resolveLocalWrappingKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', mockEnvelopeKey, Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    let dek = decipher.update(envelope.edek, 'base64');
    dek = Buffer.concat([dek, decipher.final()]);
    return dek;
  }

  async encrypt(plaintext, context = {}) {
    const { plaintextKey, encryptedKey } = await this._generateDataKey(context);

    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', plaintextKey, iv);

      if (context.aad) {
        cipher.setAAD(Buffer.from(String(context.aad), 'utf8'));
      }

      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');
      const tag = cipher.getAuthTag();

      return {
        ciphertext,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        keyVersion: 'kms-envelope-v1',
        algorithm: this.algorithm,
        envelope: {
          encryptedDataKey: encryptedKey,
          keyArn: this.keyArn || 'default-kms-key'
        }
      };
    } finally {
      // Destruir la DEK de la memoria inmediatamente
      plaintextKey.fill(0);
    }
  }

  async decrypt(payload, context = {}) {
    if (!payload.envelope || !payload.envelope.encryptedDataKey) {
      throw new Error('Payload no contiene metadata de Envelope Encryption');
    }

    const plaintextKey = await this._decryptDataKey(payload.envelope.encryptedDataKey, context);

    try {
      const iv = Buffer.from(payload.iv, 'base64');
      const tag = Buffer.from(payload.tag, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', plaintextKey, iv);
      decipher.setAuthTag(tag);

      if (context.aad || payload.aad) {
        decipher.setAAD(Buffer.from(String(context.aad || payload.aad), 'utf8'));
      }

      let plaintext = decipher.update(payload.ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');
      return plaintext;
    } finally {
      plaintextKey.fill(0);
    }
  }
}

module.exports = KmsEnvelopeEncryptionProvider;
