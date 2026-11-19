/**
 * Servicio de almacenamiento en Cloudflare R2 (API S3 compatible) con timeouts explícitos.
 */
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const R2_TIMEOUT_MS = Math.max(3000, Number(process.env.R2_TIMEOUT_MS) || 15000);

class R2StorageService {
  constructor(config = {}) {
    const accountId = config.accountId || process.env.R2_ACCOUNT_ID;
    const accessKeyId = config.accessKeyId || process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = config.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = config.bucketName || process.env.R2_BUCKET_NAME;

    this.accountId = accountId;
    this.bucketName = bucketName;
    this.prefix = (config.prefix || process.env.R2_PREFIX || 'essays_forms').replace(/\/$/, '');
    this.enabled = !!(accountId && accessKeyId && secretAccessKey && bucketName);

    if (!this.enabled) {
      this.client = null;
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      maxAttempts: 2,
      forcePathStyle: true
    });
  }

  isEnabled() {
    return this.enabled;
  }

  getKey(filename) {
    const cleanName = String(filename || '')
      .replace(/^\/+/, '')
      .replace(/\.\.+/g, '_');
    return this.prefix ? `${this.prefix}/${cleanName}` : cleanName;
  }

  async upload(buffer, filename, contentType = 'application/pdf') {
    if (!this.enabled || !this.client) {
      throw new Error('R2 no está configurado. Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY y R2_BUCKET_NAME.');
    }

    const key = this.getKey(filename);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType
      }),
      { abortSignal: AbortSignal.timeout(R2_TIMEOUT_MS) }
    );
    return key;
  }

  async getStream(key) {
    if (!this.enabled || !this.client) {
      throw new Error('R2 no está configurado.');
    }

    const resolvedKey = key.includes('/') ? key : this.getKey(key);
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: resolvedKey
      }),
      { abortSignal: AbortSignal.timeout(R2_TIMEOUT_MS) }
    );

    if (!response.Body) {
      throw new Error('Objeto no encontrado en R2');
    }

    return {
      stream: response.Body,
      contentType: response.ContentType || 'application/pdf'
    };
  }

  async exists(key) {
    if (!this.enabled || !this.client) return false;

    const resolvedKey = key.includes('/') ? key : this.getKey(key);
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: resolvedKey
        }),
        { abortSignal: AbortSignal.timeout(Math.min(R2_TIMEOUT_MS, 5000)) }
      );
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(filename) {
    const key = this.getKey(filename);
    const baseFromEnv = process.env.R2_PUBLIC_URL_BASE || process.env.R2_PUBLIC_URL;
    const baseDefault =
      this.accountId && this.bucketName
        ? `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}`
        : '';
    const base = (baseFromEnv || baseDefault || '').replace(/\/$/, '');
    if (!base) {
      return key;
    }
    return `${base}/${key}`;
  }

  async getPresignedDownloadUrl(key, expiresIn = 900, responseContentDisposition = null) {
    if (!this.enabled || !this.client) {
      throw new Error('R2 no está configurado.');
    }
    const resolvedKey = key.includes('/') ? key : this.getKey(key);
    const filename = (resolvedKey.split('/').pop() || 'documento.pdf').replace(/["\r\n\\]/g, '_');
    const disposition = responseContentDisposition || `attachment; filename="${filename}"`;
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: resolvedKey,
      ResponseContentDisposition: disposition
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}

module.exports = R2StorageService;
