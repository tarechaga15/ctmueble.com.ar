const {
  getEssayService,
  getWorkOrderService,
  getElementTemplateService,
  buildContext
} = require('../../shared/serviceFactory');
const CreateEssayDTO = require('../../application/essays/dto/CreateEssayDTO');
const SetTermsDTO = require('../../application/essays/dto/SetTermsDTO');
const LoadSamplesDTO = require('../../application/essays/dto/LoadSamplesDTO');
const LoadSampleResultsDTO = require('../../application/essays/dto/LoadSampleResultsDTO');
const CreateEssayElementTemplateDTO = require('../../application/essays/dto/CreateEssayElementTemplateDTO');
const DocumentApplicationService = require('../../application/documents/services/DocumentApplicationService');
const { sendSecurityError } = require('../middlewares/securityResponse');
const { Readable } = require('stream');

function createEssayService(req) {
  return getEssayService(buildContext(req));
}

function createWorkOrderService(req) {
  return getWorkOrderService(buildContext(req));
}

function createElementTemplateService(req) {
  return getElementTemplateService(buildContext(req));
}

function safeDispositionFilename(name, fallback = 'documento.pdf') {
  return DocumentApplicationService.sanitizeDownloadFilename(name || fallback);
}

function isTechnicalOrDatabaseError(error) {
  if (!error) return false;
  if (
    error instanceof TypeError ||
    error instanceof ReferenceError ||
    error instanceof RangeError ||
    error instanceof SyntaxError ||
    error instanceof URIError
  ) {
    return true;
  }
  const name = String(error.name || '');
  if (
    name.startsWith('Sequelize') ||
    name.includes('Database') ||
    name.includes('Connection') ||
    name.includes('Postgres') ||
    name.includes('Timeout')
  ) {
    return true;
  }
  const msg = String(error.message || '');
  if (
    /violates foreign key|violates unique|violates not-null|relation .* does not exist|syntax error at or near|cannot read propert|is not defined|invalid status code|sql: /i.test(
      msg
    )
  ) {
    return true;
  }
  return false;
}

function resolveHttpStatus(error, defaultStatus = 500) {
  const numericDefault = Number.isInteger(defaultStatus) && defaultStatus >= 400 && defaultStatus <= 599 ? defaultStatus : 500;
  if (error && Number.isInteger(error.status) && error.status >= 400 && error.status < 600) {
    return error.status;
  }
  if (isTechnicalOrDatabaseError(error)) {
    return 500;
  }
  const msg = String(error?.message || '').toLowerCase();
  if (msg.includes('no autorizado') || msg.includes('solo el laboratorio') || msg.includes('token de desuscripción inválido')) return 403;
  if (msg.includes('no encontrado') || msg.includes('no existe')) return 404;
  if (
    msg.includes('requerido') ||
    msg.includes('inválido') ||
    msg.includes('no válido') ||
    msg.includes('solo se puede') ||
    msg.includes('debe ')
  ) {
    return 400;
  }
  return numericDefault;
}

function handleControllerError(res, error, defaultStatusOrLabel = 500) {
  const contextLabel = typeof defaultStatusOrLabel === 'string' ? defaultStatusOrLabel : 'EssaysController';
  const numericDefault =
    Number.isInteger(defaultStatusOrLabel) && defaultStatusOrLabel >= 400 && defaultStatusOrLabel <= 599
      ? defaultStatusOrLabel
      : 500;

  const status = resolveHttpStatus(error, numericDefault);
  const isTechnical = isTechnicalOrDatabaseError(error);

  if (status >= 500 || isTechnical) {
    console.error(`[${contextLabel}]`, error?.stack || error?.message || error);
  }

  const safeMessage =
    status >= 500 || isTechnical
      ? 'Ocurrió un error inesperado al procesar la solicitud. Por favor, intente nuevamente más tarde.'
      : error?.message || 'Error al procesar la solicitud';

  const defaultCode = status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR';
  const code = error?.code && !isTechnical ? error.code : defaultCode;

  return res.status(status).json({
    code,
    error: safeMessage,
    message: safeMessage
  });
}

function assertAllowedExternalStorageUrl(rawUrl) {
  const configuredR2 = process.env.R2_PUBLIC_URL;
  if (!configuredR2) {
    const err = new Error('Almacenamiento externo R2_PUBLIC_URL no configurado');
    err.status = 502;
    throw err;
  }
  let parsedTarget;
  let parsedAllowed;
  try {
    parsedTarget = new URL(rawUrl);
    parsedAllowed = new URL(configuredR2);
  } catch {
    const err = new Error('URL de documento inválida');
    err.status = 400;
    throw err;
  }
  if (parsedTarget.protocol !== 'https:' || parsedTarget.origin !== parsedAllowed.origin) {
    const err = new Error('Origen de almacenamiento externo no permitido');
    err.status = 403;
    err.code = 'STORAGE_ORIGIN_FORBIDDEN';
    throw err;
  }
  return parsedTarget.toString();
}

async function sendDocumentResult(req, res, result) {
  if (!result) {
    return res.status(404).json({ error: 'Documento no encontrado' });
  }

  const filename = safeDispositionFilename(result.filename, 'documento.pdf');

  try {
    const SecurityAuditService = require('../../application/security/SecurityAuditService');
    SecurityAuditService.recordFromRequest(req, {
      action: 'DOCUMENT_DOWNLOAD',
      resource: 'documents',
      resourceId: result.essayId || req.query?.id || null,
      outcome: 'SUCCESS',
      metadata: { filename }
    }).catch(() => {});
  } catch (_) {}

  if (result.type === 'buffer' || result.buffer) {
    res.setHeader('Content-Type', result.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(result.buffer);
  }

  if (result.type === 'local') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.download(result.path, filename);
  }

  if (result.type === 'r2') {
    res.setHeader('Content-Type', result.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    result.stream.pipe(res);
    return;
  }

  if (result.type === 'external-url') {
    const safeUrl = assertAllowedExternalStorageUrl(result.url);
    const proxyRes = await fetch(safeUrl, {
      redirect: 'error',
      signal: AbortSignal.timeout(10000)
    });
    if (!proxyRes.ok || !proxyRes.body) {
      return res.status(502).json({ error: 'Error al obtener el documento del almacenamiento' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    Readable.fromWeb(proxyRes.body).pipe(res);
    return;
  }

  return res.status(500).json({ error: 'Tipo de descarga no soportado' });
}

function essayFiltersFromQuery(query = {}) {
  const pick = (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : null);
  const dateFrom = pick(query.dateFrom ?? query.date_from);
  const dateTo = pick(query.dateTo ?? query.date_to);
  const limitRaw = query.limit != null ? parseInt(query.limit, 10) : null;
  const offsetRaw = query.offset != null ? parseInt(query.offset, 10) : null;
  return {
    code: pick(query.code),
    status: pick(query.status),
    dateFrom: dateFrom ? dateFrom.slice(0, 10) : null,
    dateTo: dateTo ? dateTo.slice(0, 10) : null,
    ...(Number.isInteger(limitRaw) && limitRaw > 0 ? { limit: Math.min(limitRaw, 500) } : {}),
    ...(Number.isInteger(offsetRaw) && offsetRaw >= 0 ? { offset: offsetRaw } : {})
  };
}

function sendEssayFilterError(res, error) {
  if (error.code === 'INVALID_DATE' || error.code === 'INVALID_DATE_RANGE') {
    res.status(400).json({ code: error.code, error: error.message });
    return true;
  }
  return false;
}

exports.get = async (req, res) => {
  try {
    const essayService = createEssayService(req);
    const essay = await essayService.getEssay(req.query.id);
    return res.json(essay);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.updateEssayClient = async (req, res) => {
  try {
    const essayId = req.params.id;
    if (!essayId) {
      return res.status(400).json({ error: 'ID del ensayo requerido' });
    }
    const essayService = createEssayService(req);
    const essay = await essayService.updateEssayClient(essayId, req.body);
    return res.json(essay);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.fetch = async (req, res) => {
  try {
    const essayService = createEssayService(req);
    const filters = essayFiltersFromQuery(req.query);
    const essays = await essayService.getAllEssays(filters);
    return res.json(essays);
  } catch (error) {
    if (sendEssayFilterError(res, error)) return;
    return handleControllerError(res, error);
  }
};

exports.exportCount = async (req, res) => {
  try {
    const essayService = createEssayService(req);
    const filters = essayFiltersFromQuery(req.query);
    const count = await essayService.countEssays(filters);
    return res.json({ count });
  } catch (error) {
    if (sendEssayFilterError(res, error)) return;
    return handleControllerError(res, error);
  }
};

exports.export = async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (format !== 'csv' && format !== 'xlsx') {
      return res.status(400).json({ error: 'El parámetro format debe ser csv o xlsx' });
    }
    const essayService = createEssayService(req);
    const filters = essayFiltersFromQuery(req.query);
    const { body, contentType, filename } = await essayService.buildEssayExport(filters, format);
    const safeName = String(filename || `solicitudes.${format}`).replace(/[^a-zA-Z0-9._-]+/g, '_');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    return res.send(body);
  } catch (error) {
    if (sendEssayFilterError(res, error)) return;
    return handleControllerError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const createEssayDTO = new CreateEssayDTO(req.body);
    createEssayDTO.validate();

    const essayService = createEssayService(req);
    const essay = await essayService.createEssay(createEssayDTO.toPlainObject());
    return res.json(essay);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const essayService = createEssayService(req);
    const result = await essayService.downloadDocument(req.query.id, req.user);
    return await sendDocumentResult(req, res, result);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.downloadDocumentByType = async (req, res) => {
  try {
    const essayId = req.query.essayId;
    const type = req.query.type || req.query.typeCode;
    if (!essayId || !type) {
      return res.status(400).json({ error: 'Parámetros essayId y type son requeridos' });
    }
    const essayService = createEssayService(req);
    const result = await essayService.downloadDocumentByType(essayId, type, req.user);
    return await sendDocumentResult(req, res, result);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.debugGenerateDocument = async (req, res) => {
  try {
    const form = req.query.form || req.query.code;
    const id = req.query.id;

    if (!form) {
      return res.status(400).json({ error: 'Parámetro "form" requerido (ej: F-PC13-01)' });
    }
    if (!id) {
      return res.status(400).json({ error: 'Parámetro "id" de ensayo requerido' });
    }

    const context = buildContext(req);
    const essayService = getEssayService(context);
    const documentService = require('../../shared/serviceFactory').getDocumentService(context);

    const essay = await essayService.getEssay(id);
    const preview = await documentService.generateDocumentPreview({
      essay,
      form,
      user: context.user
    });

    res.setHeader('Content-Type', preview.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeDispositionFilename(preview.filename)}"`);
    return res.send(preview.buffer);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.procedureActions = async (req, res) => {
  try {
    if (req.user?.profile === 'LABORATORY' && req.user?.labRole === 'CONSULTA') {
      return sendSecurityError(
        res,
        req,
        403,
        'LAB_PERMISSION_DENIED',
        'El rol Consulta no tiene permisos para ejecutar acciones de estado'
      );
    }
    const essayService = createEssayService(req);
    let essay;
    const action = req.body && req.body.action;
    if (action === 'ACCEPT') {
      essay = await essayService.acceptEssay(req.query.id);
    } else if (action === 'REJECT') {
      essay = await essayService.rejectEssay(req.query.id, req.body.observations);
    } else if (action === 'CANCEL') {
      const reason = req.body.observations || req.body.reason || null;
      essay = await essayService.cancelEssay(req.query.id, reason);
    } else if (action === 'REISSUE_REQUEST' || action === 'REISSUE_FPC1301') {
      const reason = req.body.observations || req.body.reason || null;
      const result = await essayService.reissueEssayRequest(req.query.id, reason);
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }
    return res.json(essay);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.generateContract = async (req, res) => {
  try {
    const setTermsDTO = new SetTermsDTO(req.body);
    setTermsDTO.validate();

    const essayService = createEssayService(req);
    const id = req.body.id || req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'ID del ensayo requerido' });
    }
    const contract = await essayService.createContract(id, setTermsDTO.toPlainObject());
    return res.json(contract);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getTypes = async (req, res) => {
  try {
    const essayService = createEssayService(req);
    const types = await essayService.getTypes();
    return res.json(types);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.loadSamples = async (req, res) => {
  try {
    const loadSamplesDTO = new LoadSamplesDTO(req.body);
    loadSamplesDTO.validate();

    const workOrderService = createWorkOrderService(req);
    const samples = await workOrderService.loadSamples(req.query.id, loadSamplesDTO.toPlainObject());
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getSamples = async (req, res) => {
  try {
    const workOrderService = createWorkOrderService(req);
    const samples = await workOrderService.getSamples(req.query.id);
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.loadSampleResult = async (req, res) => {
  try {
    const loadSampleResultsDTO = new LoadSampleResultsDTO(req.body);
    loadSampleResultsDTO.validate();

    const workOrderService = createWorkOrderService(req);
    const samples = await workOrderService.loadSampleResults({
      workOrderId: loadSampleResultsDTO.getWorkOrderId(),
      samples: loadSampleResultsDTO.getSamplesArray()
    });
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.emitWorkOrder = async (req, res) => {
  try {
    const essayId = req.body?.essayId || req.query.essayId;
    if (!essayId) {
      return res.status(400).json({ error: 'essayId es requerido' });
    }
    const workOrderService = createWorkOrderService(req);
    const workOrder = await workOrderService.emitWorkOrder(essayId);
    return res.json(workOrder);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.receiveSamples = async (req, res) => {
  try {
    const workOrderId = req.params.id || req.params.workOrderId;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de ensayo / orden de trabajo es requerido' });
    }
    const loadSamplesDTO = new LoadSamplesDTO(req.body);
    loadSamplesDTO.validate();
    const workOrderService = createWorkOrderService(req);
    const samples = await workOrderService.receiveSamples(workOrderId, loadSamplesDTO.toPlainObject());
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getSamplesByWorkOrder = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo es requerido' });
    }
    const workOrderService = createWorkOrderService(req);
    const samples = await workOrderService.getSamplesByWorkOrder(workOrderId);
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.closeWorkOrderAndEmitReport = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo es requerido' });
    }
    const workOrderService = createWorkOrderService(req);
    const report = await workOrderService.closeWorkOrderAndEmitReport(workOrderId);
    const payload = {
      id: report.id,
      documentId: report.documentId || report.id,
      filename: safeDispositionFilename(
        report.filename || (report.typeCode && report.essayCode ? `${report.typeCode}_${report.essayCode}.pdf` : 'informe.pdf')
      )
    };
    if (report.url) payload.url = report.url;
    return res.json(payload);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.emitReport = async (req, res) => {
  try {
    const id = req.body?.id || req.query.id || req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID de ensayo requerido' });
    }

    const essayService = createEssayService(req);
    const report = await essayService.emitReport(id);
    const payload = {
      id: report.id,
      documentId: report.documentId || report.id,
      filename: safeDispositionFilename(
        report.filename || (report.typeCode && report.essayCode ? `${report.typeCode}_${report.essayCode}.pdf` : 'informe.pdf')
      )
    };
    if (report.url) payload.url = report.url;
    return res.json(payload);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({ error: 'ID de ensayo requerido' });
    }
    const essayService = createEssayService(req);
    const auditLogs = await essayService.getAuditLogs(req.query.id);
    return res.json(auditLogs);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getWorkOrderAuditLogs = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo requerido' });
    }
    const workOrderService = createWorkOrderService(req);
    const auditLogs = await workOrderService.getWorkOrderAuditLogs(workOrderId);
    return res.json(auditLogs);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getElementTemplates = async (req, res) => {
  try {
    const elementTemplateService = createElementTemplateService(req);
    const templates = await elementTemplateService.getElementTemplates();
    return res.json(templates);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.createElementTemplate = async (req, res) => {
  try {
    const createDTO = new CreateEssayElementTemplateDTO(req.body);
    createDTO.validate();
    const elementTemplateService = createElementTemplateService(req);
    const template = await elementTemplateService.createElementTemplate(createDTO.toPlainObject());
    return res.status(201).json(template);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.deleteElementTemplate = async (req, res) => {
  try {
    const elementTemplateService = createElementTemplateService(req);
    const result = await elementTemplateService.deleteElementTemplate(req.params.id);
    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body || {};
    if (enabled === undefined) {
      return res.status(400).json({
        code: 'MISSING_ENABLED_FIELD',
        message: 'El campo enabled es requerido',
        error: 'El campo enabled es requerido'
      });
    }
    const essayService = createEssayService(req);
    const updated = await essayService.updateNotifications(id, enabled, req.user);
    return res.status(200).json(updated);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.updateNotifications');
  }
};

exports.unsubscribeNotifications = async (req, res) => {
  try {
    const essayId = req.params.id || req.query.essayId || req.body?.essayId;
    const token = req.query.token || req.body?.token;

    if (!essayId || !token) {
      return res.status(400).json({
        code: 'INVALID_UNSUBSCRIBE_PARAMS',
        message: 'Se requiere id del ensayo y token de desuscripción',
        error: 'Se requiere id del ensayo y token de desuscripción'
      });
    }

    if (String(req.method || '').toUpperCase() === 'GET' && req.query?.confirm !== 'true') {
      return res.status(200).json({
        requiresConfirmation: true,
        essayId,
        message: 'Confirme la baja mediante POST o parámetro confirm=true.'
      });
    }

    const essayService = createEssayService(req);
    const result = await essayService.unsubscribeByToken(essayId, token);
    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.unsubscribeNotifications');
  }
};

exports.getSnapshots = async (req, res) => {
  try {
    const essayId = req.params.id || req.query.id;
    if (!essayId) {
      return res.status(400).json({ error: 'ID de ensayo requerido' });
    }
    const essayService = createEssayService(req);
    const snapshots = await essayService.getEssaySnapshots(essayId);
    return res.status(200).json(snapshots);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.getSnapshots');
  }
};

exports.verifySnapshot = async (req, res) => {
  try {
    const snapshotId = req.params.snapshotId || req.query.snapshotId;
    if (!snapshotId) {
      return res.status(400).json({ error: 'ID de snapshot requerido' });
    }
    const essayService = createEssayService(req);
    const verification = await essayService.verifyEssaySnapshot(snapshotId);
    return res.status(200).json(verification);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.verifySnapshot');
  }
};

exports.downloadSnapshotOtsProof = async (req, res) => {
  try {
    const snapshotId = req.params.snapshotId || req.query.snapshotId;
    if (!snapshotId) {
      return res.status(400).json({ error: 'ID de snapshot requerido' });
    }
    const essayService = createEssayService(req);
    const proofFile = await essayService.getSnapshotOtsProof(snapshotId);
    res.setHeader('Content-Type', proofFile.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${proofFile.filename}"`);
    return res.send(proofFile.buffer);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.downloadSnapshotOtsProof');
  }
};

exports.reissueRequestDocument = async (req, res) => {
  try {
    const essayId = req.params.id || req.query.id || req.body?.id || req.body?.essayId;
    if (!essayId) {
      return res.status(400).json({ error: 'ID de ensayo requerido' });
    }
    const reason = req.body?.reason || req.body?.observations || req.query?.reason || null;
    const essayService = createEssayService(req);
    const result = await essayService.reissueEssayRequest(essayId, reason);
    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error, 'essays.controller.reissueRequestDocument');
  }
};
