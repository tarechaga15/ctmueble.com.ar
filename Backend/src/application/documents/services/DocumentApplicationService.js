/**
 * Servicio de aplicación para gestionar documentos PDF.
 * - Verifica propiedad del ensayo antes de permitir descargas (prevención de IDOR).
 * - Cachea recursos estáticos (logo CTM) en memoria con fallback embebido para Vercel Serverless.
 * - Sanitiza nombres de archivo para cabeceras HTTP `Content-Disposition`.
 * - Soporta registro liviano de metadatos y generación de PDFs On The Fly al descargar (sin almacenar en R2/disco).
 */
const fs = require('fs');
const path = require('path');
const { Types: DocumentTypeModel } = require('../../../infrastructure/models');
const Document = require('../../../domain/documents/entities/Document');

let embeddedTemplates = null;
try {
  embeddedTemplates = require('../../../infrastructure/templates/embeddedTemplates');
} catch (_) {
  embeddedTemplates = null;
}

const HEADER_IMAGE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'infrastructure',
  'templates',
  'essays_forms',
  'static',
  'ctm.jpg'
);

let cachedHeaderImageDataUrl = null;

function sanitizeDownloadFilename(name) {
  const cleaned = String(name || 'documento.pdf')
    .replace(/[\r\n"\\/<>|:*?]+/g, '_')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!cleaned) return 'documento.pdf';
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

function toPlainObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => toPlainObject(item));
  if (typeof obj.toJSON === 'function') return toPlainObject(obj.toJSON());
  if (obj.dataValues) return toPlainObject(obj.dataValues);

  const plain = {};
  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      !key.startsWith('_') &&
      key !== 'uniqno' &&
      key !== 'isNewRecord'
    ) {
      plain[key] = toPlainObject(obj[key]);
    }
  }
  return plain;
}

class DocumentApplicationService {
  constructor({ context } = {}) {
    this.context = context || {};
  }

  _getHeaderImageDataUrl() {
    if (cachedHeaderImageDataUrl !== null) {
      return cachedHeaderImageDataUrl;
    }
    try {
      if (fs.existsSync(HEADER_IMAGE_PATH)) {
        const buffer = fs.readFileSync(HEADER_IMAGE_PATH);
        cachedHeaderImageDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        return cachedHeaderImageDataUrl;
      }
    } catch (_) {}
    if (embeddedTemplates && embeddedTemplates.headerImageBase64) {
      cachedHeaderImageDataUrl = embeddedTemplates.headerImageBase64;
      return cachedHeaderImageDataUrl;
    }
    cachedHeaderImageDataUrl = '';
    return '';
  }

  async _resolveEnvData(user) {
    if (this.envService && typeof this.envService.fetchSystemData === 'function') {
      return this.envService.fetchSystemData();
    }
    return this.envService.fetch({ user, mode: 'DATA' });
  }

  async _assertEssayOwnership(essayId, user) {
    const effectiveUser = user || this.context?.user;
    if (!effectiveUser) {
      const err = new Error('Autenticación requerida para acceder al documento');
      err.status = 401;
      err.code = 'AUTH_REQUIRED';
      throw err;
    }
    if (effectiveUser.profile === 'LABORATORY') {
      return;
    }
    if (!essayId || !this.essayRepository) {
      const err = new Error('No autorizado para acceder a este documento');
      err.status = 403;
      err.code = 'DOCUMENT_FORBIDDEN';
      throw err;
    }
    const ownedEssay = await this.essayRepository.findById(essayId, effectiveUser);
    if (!ownedEssay) {
      const err = new Error('Documento no encontrado');
      err.status = 404;
      err.code = 'DOCUMENT_NOT_FOUND';
      throw err;
    }
  }

  /**
   * Registra metadatos de un documento en la BD sin generar ni almacenar PDF en disco/R2.
   * La generación de PDF se efectúa On The Fly cuando el usuario solicita la descarga.
   */
  async registerDocument({ essayId, form, user, copy = 0, modificated = false }) {
    const type = await this.getDocumentType(form);
    if (!type) {
      const err = new Error(`Tipo de documento "${form}" no encontrado`);
      err.status = 404;
      err.code = 'DOCUMENT_TYPE_NOT_FOUND';
      throw err;
    }

    const document = new Document({
      essayId,
      typeId: type.id,
      copy: copy || 0,
      modificated: Boolean(modificated),
      generatedAt: new Date(),
      file: 'on-demand'
    });

    const saved = await this.documentRepository.save(document);
    saved.typeCode = type.code;
    return saved;
  }

  /**
   * Genera el buffer PDF On The Fly para un ensayo y formulario dado, sin almacenarlo.
   */
  async generatePDFBuffer({ essayId, typeCode, user, copy = 0, modificated = false, metadata = {}, pdfOptions = {} }) {
    const type = await this.getDocumentType(typeCode);
    if (!type) {
      const err = new Error(`Tipo de documento "${typeCode}" no encontrado`);
      err.status = 404;
      err.code = 'DOCUMENT_TYPE_NOT_FOUND';
      throw err;
    }

    await this._assertEssayOwnership(essayId, user);

    let essayData;
    if (this.essayService && typeof this.essayService.getEssay === 'function') {
      essayData = await this.essayService.getEssay(essayId);
    } else if (this.getEssayService && typeof this.getEssayService === 'function') {
      essayData = await this.getEssayService().getEssay(essayId);
    } else {
      const { getEssayService } = require('../../../shared/serviceFactory');
      const svc = getEssayService(this.context);
      essayData = await svc.getEssay(essayId);
    }

    const code = String(typeCode || type.code || '').toUpperCase().trim();
    let templateData;

    if (code === 'F-PC16-01') {
      const wo = essayData.workOrder || {};
      const woPlain = typeof wo.toJSON === 'function' ? wo.toJSON() : { ...wo };
      const samplesList = (woPlain.samples && woPlain.samples.length > 0)
        ? woPlain.samples
        : (essayData.samples && essayData.samples.length > 0)
        ? essayData.samples
        : [];
      const samplesCount = Math.max(samplesList.length, Number(woPlain.samples_count) || 0) || 1;
      templateData = {
        ...woPlain,
        essay_track_code: essayData.code || woPlain.essay_track_code || '',
        generated_at: woPlain.samples_received_at || woPlain.generated_at || essayData.requestDate || new Date(),
        element_to_essay: essayData.elements?.product || '',
        samples_count: samplesCount,
        observations: woPlain.observations ?? '',
        internal_aconditioning: woPlain.internal_aconditioning === true || woPlain.internalConditioning === true,
        code: woPlain.code || woPlain.dateCode || 'OT-S/N'
      };
    } else if (code === 'F-PC13-02') {
      templateData = {
        ...toPlainObject(essayData),
        request_date: essayData.requestDate,
        terms: essayData.terms || {}
      };
    } else if (code === 'F-PC15-01') {
      templateData = {
        ...toPlainObject(essayData),
        lastReportGenerated: essayData.last_report_generated || essayData.finishDate || new Date(),
        headerTitle: 'INFORME DE ENSAYO',
        copy: copy || 0,
        modificated: Boolean(modificated),
        isCopy: Boolean(copy && copy > 0),
        isModificated: Boolean(modificated)
      };
    } else {
      // F-PC13-01 u otros
      const hasModifiedDoc = Array.isArray(essayData.documents) &&
        essayData.documents.some(
          (d) => (d?.typeDocument?.code || d?.typeCode || d?.type?.code) === 'F-PC13-01' && d?.modificated
        );
      const isMod = Boolean(modificated) || hasModifiedDoc;

      templateData = {
        ...toPlainObject(essayData),
        requestDate: essayData.requestDate,
        modificated: isMod,
        isModificated: isMod,
        copy: copy || 0,
        isCopy: Boolean(copy && copy > 0)
      };
    }

    // Resolver snapshot auditada con hash firmado y fecha cierta OTS
    let snapshotInfo = null;
    try {
      const { EssayDocumentSnapshot } = require('../../../infrastructure/models');
      const snap = await EssayDocumentSnapshot.findOne({
        where: { essay_id: essayId, document_type: code },
        order: [['version', 'DESC']]
      });
      if (snap) {
        const isSnapshotModified = Number(snap.version) > 1 || Boolean(snap.snapshot_data?.modificated);
        if (isSnapshotModified) {
          templateData.modificated = true;
          templateData.isModificated = true;
        }

        snapshotInfo = {
          id: snap.id,
          version: snap.version,
          canonicalHash: snap.canonical_hash,
          signature: snap.signature,
          signatureAlgorithm: snap.signature_algorithm,
          otsStatus: snap.ots_status,
          otsStampedAt: snap.ots_stamped_at,
          createdAt: snap.created_at
        };
      }
    } catch (_) {}

    const env = await this._resolveEnvData(user);
    const toParseData = {
      ...templateData,
      env,
      headerImageDataUrl: this._getHeaderImageDataUrl(),
      snapshot: snapshotInfo,
      canonicalHash: snapshotInfo?.canonicalHash || null,
      otsStatus: snapshotInfo?.otsStatus || null,
      otsStampedAt: snapshotInfo?.otsStampedAt || null,
      ...metadata
    };

    const htmlContent = this.handlebarsService.parseWithTemplate(type.filesheet, toParseData);
    const filename = this._buildDownloadFilename(type.code || typeCode, essayData.code, essayId);
    const buffer = await this.documentInfrastructureService.generatePDFBufferFromHTML(htmlContent, pdfOptions);

    return {
      type: 'buffer',
      buffer,
      filename,
      contentType: 'application/pdf',
      essayId,
      snapshot: snapshotInfo
    };
  }

  /**
   * Método legacy mantenido por compatibilidad.
   * Renderiza HTML y persiste en R2/disco solo si se invoca explícitamente.
   */
  async generateDocument({ essayId, data, form, user, copy = 0, modificated = false, metadata = {} }) {
    const type = await this.getDocumentType(form);
    if (!type) {
      const err = new Error('Tipo de documento no encontrado');
      err.status = 404;
      throw err;
    }

    const env = await this._resolveEnvData(user);
    const dataPlain = toPlainObject(data);
    const toParseData = {
      ...dataPlain,
      env,
      headerImageDataUrl: this._getHeaderImageDataUrl(),
      ...metadata
    };

    const htmlContent = this.handlebarsService.parseWithTemplate(type.filesheet, toParseData);

    let storedFileValue = 'on-demand';
    try {
      const filename = this.documentInfrastructureService.generateFilename(essayId);
      storedFileValue = await this.documentInfrastructureService.saveDocument(htmlContent, filename);
    } catch (_) {
      // Si falla el almacenamiento físico, se conserva 'on-demand' para descarga On The Fly
      storedFileValue = 'on-demand';
    }

    const document = new Document({
      essayId,
      typeId: type.id,
      copy: copy || 0,
      modificated: modificated || false,
      generatedAt: new Date(),
      file: storedFileValue
    });

    return this.documentRepository.save(document);
  }

  async generateDocumentPreview({ essay, form, user, metadata = {}, pdfOptions = {} }) {
    const type = await this.getDocumentType(form);
    if (!type) {
      const err = new Error('Tipo de documento no encontrado');
      err.status = 404;
      throw err;
    }

    const env = await this._resolveEnvData(user);
    const essayPlain = toPlainObject(essay);
    const essayData = {
      ...essayPlain,
      env,
      headerImageDataUrl: this._getHeaderImageDataUrl(),
      ...metadata
    };

    const htmlContent = this.handlebarsService.parseWithTemplate(type.filesheet, essayData);
    const identifier = essay.id || essay.uuid || essay.essay || essay.code || 'preview';
    const filename = sanitizeDownloadFilename(this.documentInfrastructureService.generateFilename(identifier));
    const buffer = await this.documentInfrastructureService.generatePDFBufferFromHTML(htmlContent, pdfOptions);

    return {
      filename,
      buffer,
      contentType: 'application/pdf'
    };
  }

  async downloadDocument({ id, user, typeCodeFallback = null, essayIdFallback = null }) {
    if (!id) {
      const err = new Error('ID de documento requerido');
      err.status = 400;
      throw err;
    }

    let document = await this.documentRepository.findById(id);

    // Si no se encuentra como documento por ID, verificar si id corresponde a una orden de trabajo o ensayo
    if (!document) {
      let resolvedEssayId = essayIdFallback;
      let inferredType = typeCodeFallback;

      if (this.workOrderRepository && typeof this.workOrderRepository.findById === 'function') {
        try {
          const wo = await this.workOrderRepository.findById(id);
          if (wo && wo.essayId) {
            resolvedEssayId = wo.essayId;
            inferredType = inferredType || 'F-PC16-01';
          }
        } catch (_) {}
      }

      if (!resolvedEssayId && this.essayRepository && typeof this.essayRepository.findById === 'function') {
        try {
          const essay = await this.essayRepository.findById(id, user || this.context?.user);
          if (essay) {
            resolvedEssayId = essay.id;
            inferredType = inferredType || (essay.status === 'COMPLETED' ? 'F-PC15-01' : 'F-PC13-01');
          }
        } catch (_) {}
      }

      if (resolvedEssayId) {
        await this._assertEssayOwnership(resolvedEssayId, user);
        return this.generatePDFBuffer({
          essayId: resolvedEssayId,
          typeCode: inferredType || 'F-PC13-01',
          user
        });
      }

      const err = new Error('Documento no encontrado');
      err.status = 404;
      err.code = 'DOCUMENT_NOT_FOUND';
      throw err;
    }

    await this._assertEssayOwnership(document.essayId || essayIdFallback, user);

    // Si tiene archivo almacenado físico previo (migración / legacy) y no es 'on-demand',
    // intentamos descargarlo; si falla o es 'on-demand', generamos On The Fly sin almacenar.
    if (document.file && document.file !== 'on-demand') {
      try {
        const stored = await this.documentInfrastructureService.getDocumentForDownload(document.file);
        if (stored) {
          const typeCode = document.typeCode ?? typeCodeFallback;
          const essayCode = document.essayCode ?? null;
          const codeForName = essayCode || essayIdFallback || document.essayId;
          const downloadFilename = this._buildDownloadFilename(typeCode, essayCode, codeForName);
          return { ...stored, filename: downloadFilename, essayId: document.essayId };
        }
      } catch (_) {
        // Almacenamiento previo no disponible: continuar con generación On The Fly
      }
    }

    let typeCode = document.typeCode ?? typeCodeFallback;
    if (!typeCode && document.typeId) {
      const type = await DocumentTypeModel.findByPk(document.typeId);
      if (type) typeCode = type.code;
    }
    if (!typeCode) typeCode = 'F-PC13-01';

    return this.generatePDFBuffer({
      essayId: document.essayId || essayIdFallback,
      typeCode,
      user,
      copy: document.copy,
      modificated: document.modificated
    });
  }

  _buildDownloadFilename(typeCode, essayCode, essayId) {
    const type = (typeCode && String(typeCode).trim()) || 'documento';
    const code = (essayCode && String(essayCode).trim()) || essayId || 'sin-codigo';
    return sanitizeDownloadFilename(`${type}_${code}.pdf`);
  }

  async getDocumentByEssayAndType(essayId, typeCode) {
    const type = await this.getDocumentType(typeCode);
    if (!type) return null;
    return this.documentRepository.findLatestByEssayIdAndTypeId(essayId, type.id);
  }

  async downloadDocumentByEssayAndType(essayId, typeCode, user) {
    await this._assertEssayOwnership(essayId, user);
    const document = await this.getDocumentByEssayAndType(essayId, typeCode);
    if (document) {
      return this.downloadDocument({
        id: document.id,
        user,
        typeCodeFallback: typeCode,
        essayIdFallback: essayId
      });
    }

    // Si aún no hay registro en essays_documents, generamos directamente On The Fly
    return this.generatePDFBuffer({
      essayId,
      typeCode,
      user
    });
  }

  async getDocumentType(code) {
    if (!code) return null;
    return DocumentTypeModel.findOne({ where: { code } });
  }
}

DocumentApplicationService.sanitizeDownloadFilename = sanitizeDownloadFilename;

module.exports = DocumentApplicationService;
