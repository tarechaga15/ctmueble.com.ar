const envController = require('../controllers/env.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');
const requireLabPermission = require('../middlewares/requireLabPermission');
const express = require('express');
const router = express.Router();

router.use(requireLaboratory);
router.use(requireLabPermission('configuracion.env'));

router.get('/fetch', envController.fetch);
router.get('/get', envController.get);
router.put('/update', envController.update);
router.post('/add', envController.add);
router.delete('/delete', envController.delete);

module.exports = router;
