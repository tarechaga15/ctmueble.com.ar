const express = require('express');
const router = express.Router();

const typesController = require('../controllers/types.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');

router.get('/essays', typesController.getEssayTypes);
router.post('/essays', requireLaboratory, typesController.createEssayType);
router.get('/countries', typesController.getCountries);
router.get('/districts', typesController.getDistricts);

module.exports = router;
