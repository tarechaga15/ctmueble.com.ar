const express = require('express');
const router = express.Router();

const personsController = require('../controllers/persons.controller');

router.get('/me', personsController.me);
router.get('/me/', personsController.me);

router.get('/get', personsController.get);
router.get('/get/', personsController.get);

router.get('/fetch', personsController.fetch);
router.get('/fetch/', personsController.fetch);

router.get('/search-available', personsController.searchAvailable);
router.get('/search-available/', personsController.searchAvailable);

router.get('/search', personsController.searchAvailable);
router.get('/search/', personsController.searchAvailable);

router.get('/by-client/:clientId', personsController.getByClient);

router.post('/create', personsController.create);
router.post('/create/', personsController.create);

router.put('/update', personsController.update);
router.put('/update/', personsController.update);

router.post('/link', personsController.linkClient);
router.post('/link/', personsController.linkClient);

router.post('/unlink', personsController.unlinkClient);
router.post('/unlink/', personsController.unlinkClient);

module.exports = router;
