const ApiKeyApplicationService = require('../../application/security/ApiKeyApplicationService');
const MailingService = require('../../infrastructure/mailing/MailingService');
const { handleControllerError } = require('../utils/controllerError');

const apiKeyService = new ApiKeyApplicationService();
const mailingService = new MailingService({ apiKeyService });

exports.getStatus = async (req, res) => {
  try {
    const service = req.query.service || 'MAILING';
    const status = await apiKeyService.getServiceStatus(service);
    return res.status(200).json(status);
  } catch (error) {
    return handleControllerError(res, error, 'apiKey.controller.getStatus');
  }
};

exports.saveApiKey = async (req, res) => {
  try {
    const { service, provider, name, apiKey, metadata } = req.body || {};
    const serviceName = service || 'MAILING';

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      // Si la clave no se proporciona, permitir actualizar metadatos si ya está configurado
      const current = await apiKeyService.getActiveApiKey(serviceName);
      if (current) {
        const updated = await apiKeyService.updateMetadata(serviceName, metadata);
        return res.status(200).json({
          message: 'Configuración de mailing actualizada correctamente',
          data: updated
        });
      }
      return res.status(400).json({
        code: 'INVALID_API_KEY',
        message: 'La API Key debe ser una cadena válida de al menos 8 caracteres'
      });
    }

    if (apiKey.trim().length < 8) {
      return res.status(400).json({
        code: 'INVALID_API_KEY',
        message: 'La API Key debe ser una cadena válida de al menos 8 caracteres'
      });
    }

    const saved = await apiKeyService.saveApiKey({
      service: serviceName,
      provider: provider || 'RESEND',
      name,
      apiKey: apiKey.trim(),
      metadata: metadata || {}
    });

    return res.status(201).json({
      message: 'API Key configurada y cifrada correctamente con AES-256-GCM',
      data: saved
    });
  } catch (error) {
    return handleControllerError(res, error, 'apiKey.controller.saveApiKey');
  }
};

exports.testMailing = async (req, res) => {
  try {
    const { to } = req.body || {};
    const recipient = to || req.user?.mail;

    if (!recipient) {
      return res.status(400).json({
        code: 'MISSING_RECIPIENT',
        message: 'Se requiere una dirección de correo para enviar la prueba'
      });
    }

    const result = await mailingService.sendTestEmail(recipient);
    return res.status(200).json({
      message: `Correo de prueba enviado exitosamente a ${recipient}`,
      result
    });
  } catch (error) {
    return handleControllerError(res, error, 'apiKey.controller.testMailing');
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    await apiKeyService.deleteApiKey(id);
    return res.status(200).json({ message: 'API Key desactivada correctamente' });
  } catch (error) {
    return handleControllerError(res, error, 'apiKey.controller.deleteApiKey');
  }
};
