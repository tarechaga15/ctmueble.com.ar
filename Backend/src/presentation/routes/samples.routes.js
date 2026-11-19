const express = require('express');
const router = express.Router();
const samplesController = require('../controllers/samples.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');
const requireLabPermission = require('../middlewares/requireLabPermission');
const { createRateLimiter } = require('../middlewares/rateLimit');

const pdfGenerationLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 15,
  code: 'PDF_GENERATION_RATE_LIMIT',
  message: 'Demasiadas emisiones de PDF en poco tiempo, aguarde unos instantes.',
  keyByUser: true
});

router.use(requireLaboratory);

router.get('/fetch', samplesController.fetch);
router.get('/get', samplesController.get);
router.post('/receive-samples', requireLabPermission('muestras.recepcionar'), pdfGenerationLimiter, samplesController.receiveSamples);
router.get('/:id/samples', samplesController.getSamples);
router.post('/:id/close-and-emit-report', requireLabPermission('ordenes.cerrar'), pdfGenerationLimiter, samplesController.closeAndEmitReport);
router.get('/:id/audit-logs', samplesController.getAuditLogs);

module.exports = router;
