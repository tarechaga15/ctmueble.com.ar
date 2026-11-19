const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');
const requireLabPermission = require('../middlewares/requireLabPermission');

// Rutas protegidas exclusivamente para perfil LABORATORY con permiso de mailing
router.use(requireLaboratory);

router.get('/status', apiKeyController.getStatus);
router.post('/', requireLabPermission('configuracion.mailing'), apiKeyController.saveApiKey);
router.post('/test-mailing', requireLabPermission('configuracion.mailing'), apiKeyController.testMailing);
router.delete('/:id', requireLabPermission('configuracion.mailing'), apiKeyController.deleteApiKey);

module.exports = router;
