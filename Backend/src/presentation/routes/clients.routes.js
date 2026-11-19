const express = require('express');
const router = express.Router();

const clientsController = require('../controllers/clients.controller');
const requireLaboratory = require('../middlewares/requireLaboratory');
const { createRateLimiter } = require('../middlewares/rateLimit');

const padronLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  code: 'PADRON_RATE_LIMIT',
  message: 'Demasiadas consultas al padrón ARCA, intente nuevamente más tarde.',
  keyByUser: true
});

router.get('/fetch', clientsController.fetch);
router.get('/get', clientsController.get);
router.get('/search', clientsController.search);
router.get('/search-by-business', clientsController.searchByBusiness);
router.get('/scheduled', requireLaboratory, clientsController.getScheduled);
router.get('/scheduled/check', requireLaboratory, clientsController.isScheduled);
router.post('/create', clientsController.create);
router.post('/get-or-create-for-essay', clientsController.getOrCreateForEssay);
router.post('/scheduled', requireLaboratory, clientsController.addScheduled);
router.put('/update', clientsController.update);
router.delete('/delete', clientsController.delete);
router.get('/padron/:cuit', padronLimiter, clientsController.getPadron);

router.get('/:clientId/contacts', clientsController.getContacts);
router.get('/:clientId/contacts/', clientsController.getContacts);
router.post('/:clientId/contacts', clientsController.addContact);
router.post('/:clientId/contacts/', clientsController.addContact);
router.delete('/:clientId/contacts', clientsController.removeContact);
router.delete('/:clientId/contacts/', clientsController.removeContact);

router.get('/contacts', clientsController.getContacts);
router.get('/contacts/', clientsController.getContacts);
router.post('/contacts', clientsController.addContact);
router.post('/contacts/', clientsController.addContact);
router.delete('/contacts', clientsController.removeContact);
router.delete('/contacts/', clientsController.removeContact);

module.exports = router;
