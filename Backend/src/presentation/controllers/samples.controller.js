const { getSampleService, buildContext } = require('../../shared/serviceFactory');
const ReceiveSamplesDTO = require('../../application/essays/dto/ReceiveSamplesDTO');
const { handleControllerError } = require('../utils/controllerError');

function createSampleService(req) {
  return getSampleService(buildContext(req));
}

exports.fetch = async (req, res) => {
  try {
    const sampleService = createSampleService(req);
    const codeParam = req.query.code;
    const statusParam = req.query.status;
    const filters = {
      code: codeParam != null && String(codeParam).trim() !== '' ? String(codeParam).trim() : null,
      status: statusParam != null && String(statusParam).trim() !== '' ? String(statusParam).trim() : null
    };
    const workOrders = await sampleService.getAllWorkOrders(filters);
    const plain = Array.isArray(workOrders)
      ? workOrders.map((wo) => (wo && typeof wo.toJSON === 'function' ? wo.toJSON() : wo))
      : [];
    return res.json(plain);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.fetch');
  }
};

exports.get = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'ID de orden de trabajo requerido' });
    }
    const sampleService = createSampleService(req);
    const workOrder = await sampleService.getWorkOrder(id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
    }
    return res.json(workOrder);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.get');
  }
};

exports.receiveSamples = async (req, res) => {
  try {
    const dto = new ReceiveSamplesDTO(req.body);
    dto.validate();
    const sampleService = createSampleService(req);
    const result = await sampleService.receiveSamples(dto.essayId, dto.toPlainObject());
    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.receiveSamples');
  }
};

exports.getSamples = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo es requerido' });
    }
    const sampleService = createSampleService(req);
    const samples = await sampleService.getSamplesByWorkOrder(workOrderId);
    return res.json(samples);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.getSamples');
  }
};

exports.closeAndEmitReport = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo es requerido' });
    }
    const sampleService = createSampleService(req);
    const report = await sampleService.closeWorkOrderAndEmitReport(workOrderId);
    const payload = {
      id: report.id,
      documentId: report.documentId || report.id,
      filename: report.filename || (report.typeCode && report.essayCode ? `${report.typeCode}_${report.essayCode}.pdf` : 'informe.pdf')
    };
    if (report.url) payload.url = report.url;
    return res.json(payload);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.closeAndEmitReport');
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    if (!workOrderId) {
      return res.status(400).json({ error: 'ID de orden de trabajo requerido' });
    }
    const sampleService = createSampleService(req);
    const auditLogs = await sampleService.getWorkOrderAuditLogs(workOrderId);
    return res.json(auditLogs);
  } catch (error) {
    return handleControllerError(res, error, 'samples.controller.getAuditLogs');
  }
};
