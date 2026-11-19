/**
 * Servicio de infraestructura para generar y gestionar documentos PDF:
 * - Semáforo de concurrencia (`MAX_CONCURRENT_PDF = 2`) con timeout de cola para evitar OOM por instancias paralelas de Chromium en Vercel.
 * - Bloqueo de solicitudes externas de red (`setRequestInterception(true)`) durante el renderizado HTML->PDF (prevención SSRF / cuelgues por fuentes remotas).
 * - Contención estricta contra Path Traversal en almacenamiento local y validación de R2 obligatorio en producción Vercel.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const chromium = require('@sparticuz/chromium');

const isServerless = !!(process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL);
const puppeteer = isServerless ? require('puppeteer-core') : require('puppeteer');
const R2StorageService = require('./R2StorageService');

const MAX_CONCURRENT_PDF = Math.max(1, Number(process.env.PDF_MAX_CONCURRENCY) || 2);
const PDF_QUEUE_TIMEOUT_MS = Math.max(2000, Number(process.env.PDF_QUEUE_TIMEOUT_MS) || 15000);
const PDF_RENDER_TIMEOUT_MS = Math.max(3000, Number(process.env.PDF_RENDER_TIMEOUT_MS) || 20000);

let activePdfJobs = 0;
const pdfWaitQueue = [];

function acquirePdfSlot() {
  if (activePdfJobs < MAX_CONCURRENT_PDF) {
    activePdfJobs += 1;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const waiter = {
      resolve: () => {
        clearTimeout(timer);
        activePdfJobs += 1;
        resolve();
      }
    };
    const timer = setTimeout(() => {
      const idx = pdfWaitQueue.indexOf(waiter);
      if (idx !== -1) pdfWaitQueue.splice(idx, 1);
      const err = new Error('El motor de generación de PDF está saturado temporalmente. Intente nuevamente en unos segundos.');
      err.status = 503;
      err.code = 'PDF_ENGINE_BUSY';
      reject(err);
    }, PDF_QUEUE_TIMEOUT_MS);
    if (typeof timer.unref === 'function') timer.unref();

    pdfWaitQueue.push(waiter);
  });
}

function releasePdfSlot() {
  activePdfJobs = Math.max(0, activePdfJobs - 1);
  if (pdfWaitQueue.length > 0 && activePdfJobs < MAX_CONCURRENT_PDF) {
    const nextWaiter = pdfWaitQueue.shift();
    if (nextWaiter) nextWaiter.resolve();
  }
}

class DocumentInfrastructureService {
  constructor() {
    this.r2 = new R2StorageService();
  }

  async _launchBrowser() {
    if (isServerless) {
      return puppeteer.launch({
        args: puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
        executablePath: await chromium.executablePath(),
        headless: 'shell'
      });
    }
    return puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }

  async _renderPdfInternal(htmlContent, options = {}) {
    await acquirePdfSlot();
    let browser = null;
    try {
      browser = await this._launchBrowser();
      const page = await browser.newPage();
      page.setDefaultTimeout(PDF_RENDER_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PDF_RENDER_TIMEOUT_MS);

      // Bloquea cualquier request HTTP/HTTPS o file:// saliente desde el HTML renderizado (prevención SSRF / LFI en Chromium).
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        if (url.startsWith('data:') || url.startsWith('about:') || url.startsWith('blob:')) {
          request.continue().catch(() => {});
        } else {
          request.abort('blockedbyclient').catch(() => {});
        }
      });

      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: PDF_RENDER_TIMEOUT_MS
      });

      const pdfOptions = {
        format: options.format || 'A4',
        printBackground: options.printBackground !== false
      };
      if (options.path) {
        pdfOptions.path = options.path;
      }

      const pdfResult = await page.pdf(pdfOptions);
      return Buffer.from(pdfResult);
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
      releasePdfSlot();
    }
  }

  async generatePDFBufferFromHTML(htmlContent, options = {}) {
    return this._renderPdfInternal(htmlContent, options);
  }

  async generatePDFFromHTML(htmlContent, outputPath, options = {}) {
    await this._renderPdfInternal(htmlContent, { ...options, path: outputPath });
  }

  async ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  getDocumentFilePath(filename, baseDir) {
    if (!filename || typeof filename !== 'string') {
      const err = new Error('Nombre de archivo inválido');
      err.status = 400;
      err.code = 'INVALID_DOCUMENT_PATH';
      throw err;
    }
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, filename);
    const relative = path.relative(resolvedBase, resolvedTarget);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      const err = new Error('Ruta de documento fuera del directorio permitido');
      err.status = 400;
      err.code = 'INVALID_DOCUMENT_PATH';
      throw err;
    }
    return resolvedTarget;
  }

  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  generateFilename(identifier, extension = 'pdf') {
    const safeId = String(identifier || 'doc').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
    const safeExt = String(extension || 'pdf').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'pdf';
    const nonce = crypto.randomUUID().split('-')[0];
    return `${safeId}_${Date.now()}_${nonce}.${safeExt}`;
  }

  getStorageDirectory() {
    if (process.env.STORAGE_DIR) {
      return path.join(process.env.STORAGE_DIR, 'essays_forms');
    }
    if (isServerless) {
      return path.join(os.tmpdir(), 'ctm_storage', 'essays_forms');
    }
    return path.join(process.cwd(), 'storage', 'essays_forms');
  }

  isR2Enabled() {
    return Boolean(this.r2 && this.r2.isEnabled());
  }

  async saveDocument(htmlContent, filename) {
    if (this.isR2Enabled()) {
      const buffer = await this.generatePDFBufferFromHTML(htmlContent);
      await this.r2.upload(buffer, filename, 'application/pdf');
      const publicBase = process.env.R2_PUBLIC_URL_BASE;
      if (publicBase && publicBase.trim()) {
        return this.r2.getPublicUrl(filename);
      }
      return this.r2.getKey(filename);
    }

    if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
      const err = new Error(
        'Almacenamiento Cloudflare R2 no configurado en producción serverless. Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY y R2_BUCKET_NAME.'
      );
      err.status = 503;
      err.code = 'STORAGE_NOT_CONFIGURED';
      throw err;
    }

    const storageDir = this.getStorageDirectory();
    await this.ensureDirectoryExists(storageDir);
    const outputPath = this.getDocumentFilePath(filename, storageDir);
    await this.generatePDFFromHTML(htmlContent, outputPath);
    return path.basename(outputPath);
  }

  async getDocumentForDownload(fileKey) {
    if (typeof fileKey === 'string' && (fileKey.startsWith('http://') || fileKey.startsWith('https://'))) {
      if (fileKey.includes('r2.cloudflarestorage.com')) {
        const key = this._extractR2KeyFromS3Url(fileKey);
        if (key && this.isR2Enabled()) {
          const { stream, contentType } = await this.r2.getStream(key);
          const filename = key.split('/').pop() || 'documento.pdf';
          return { type: 'r2', stream, filename, contentType: contentType || 'application/pdf' };
        }
      }
      return { type: 'external-url', url: fileKey };
    }

    if (this.isR2Enabled()) {
      const existsInR2 = await this.r2.exists(fileKey);
      if (existsInR2) {
        const { stream, contentType } = await this.r2.getStream(fileKey);
        const filename = (fileKey.includes('/') ? fileKey.split('/').pop() : fileKey) || 'documento.pdf';
        return { type: 'r2', stream, filename, contentType: contentType || 'application/pdf' };
      }
    }

    const storageDir = this.getStorageDirectory();
    const filePath = this.getDocumentFilePath(fileKey, storageDir);
    if (!this.fileExists(filePath)) {
      const err = new Error('Archivo del documento no encontrado');
      err.status = 404;
      err.code = 'DOCUMENT_FILE_NOT_FOUND';
      throw err;
    }
    return { type: 'local', path: filePath };
  }

  _extractR2KeyFromS3Url(url) {
    try {
      const u = new URL(url);
      const segments = u.pathname.replace(/^\/+/, '').split('/');
      if (segments.length >= 2) {
        return segments.slice(1).join('/');
      }
      return segments[0] || null;
    } catch {
      return null;
    }
  }
}

module.exports = DocumentInfrastructureService;
