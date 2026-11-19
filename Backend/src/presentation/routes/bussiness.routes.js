const express = require('express');
const router = express.Router();

const bussinessController = require('../controllers/bussiness.controller');
const { createRateLimiter } = require('../middlewares/rateLimit');

const padronLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  code: 'PADRON_RATE_LIMIT',
  message: 'Demasiadas consultas al padrón ARCA, intente nuevamente más tarde.',
  keyByUser: true
});

router.get('/get/', bussinessController.get);
router.post('/manual/', bussinessController.createManual);
router.post('/sync/', padronLimiter, bussinessController.syncByCuit);
router.get('/padron/', padronLimiter, bussinessController.getPadron);
router.get('/addresses/', bussinessController.getAddresses);
router.post('/addresses/', bussinessController.addAddress);
router.put('/addresses/', bussinessController.updateAddress);
router.delete('/addresses/', bussinessController.deleteAddress);
router.get('/representatives/', bussinessController.getRepresentatives);
router.get('/for-essay/', bussinessController.getBusinessForEssay);

module.exports = router;
