const express = require('express');
const router = express.Router();

const essaysController = require('../controllers/essays.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');
const requireLabPermission = require('../middlewares/requireLabPermission');
const { createRateLimiter } = require('../middlewares/rateLimit');

const pdfGenerationLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 25,
  code: 'PDF_RATE_LIMIT',
  message: 'Demasiadas generaciones de documentos PDF en poco tiempo, intente nuevamente en unos minutos.'
});

const exportLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  code: 'EXPORT_RATE_LIMIT',
  message: 'Demasiadas exportaciones solicitadas, intente nuevamente más tarde.'
});

router.get('/get', essaysController.get);
router.get('/fetch', essaysController.fetch);
router.get('/export/count', essaysController.exportCount);
router.get('/export', exportLimiter, essaysController.export);
router.post('/create', pdfGenerationLimiter, essaysController.create);
router.put('/:id/client', essaysController.updateEssayClient);
router.get('/download-document', essaysController.downloadDocument);
router.get('/download-document-by-type', essaysController.downloadDocumentByType);
router.get('/debug/generate-document', requireLaboratory, pdfGenerationLimiter, essaysController.debugGenerateDocument);
router.post('/procedure/actions', essaysController.procedureActions);
router.post('/generate-contract', requireLaboratory, requireLabPermission('essays.estados'), pdfGenerationLimiter, essaysController.generateContract);
router.get('/get-types', essaysController.getTypes);
router.post('/samples/load', requireLaboratory, requireLabPermission('muestras.recepcionar'), pdfGenerationLimiter, essaysController.loadSamples);
router.get('/samples/get', requireLaboratory, essaysController.getSamples);
router.post('/samples/load-result', requireLaboratory, requireLabPermission('ordenes.ensayar'), essaysController.loadSampleResult);
router.get('/audit-logs', essaysController.getAuditLogs);
router.post('/emit-report', requireLaboratory, requireLabPermission('essays.informes'), pdfGenerationLimiter, essaysController.emitReport);
router.get('/element-templates', essaysController.getElementTemplates);
router.post('/element-templates', essaysController.createElementTemplate);
router.delete('/element-templates/:id', essaysController.deleteElementTemplate);

// Snapshots de auditoría con hash firmado y fecha cierta OpenTimestamps (OTS)
router.get('/:id/snapshots', essaysController.getSnapshots);
router.get('/snapshots', essaysController.getSnapshots);
router.get('/snapshots/:snapshotId/verify', essaysController.verifySnapshot);
router.get('/snapshots/:snapshotId/ots-proof', essaysController.downloadSnapshotOtsProof);
router.post('/:id/reissue-request', pdfGenerationLimiter, essaysController.reissueRequestDocument);
router.post('/reissue-request', pdfGenerationLimiter, essaysController.reissueRequestDocument);

// Notificaciones
router.put('/:id/notifications', essaysController.updateNotifications);
router.post('/:id/unsubscribe', essaysController.unsubscribeNotifications);
router.get('/:id/unsubscribe', essaysController.unsubscribeNotifications);

module.exports = router;
