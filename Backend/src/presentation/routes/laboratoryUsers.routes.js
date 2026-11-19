'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/laboratoryUsers.controller');

router.get('/', controller.listUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.post('/:id/resetear-password', controller.resetPassword);
router.post('/:id/reenviar-activacion', controller.resendActivation);
router.get('/permissions', controller.getPermissionsMatrix);
router.put('/permissions', controller.updatePermissionsMatrix);

module.exports = router;
