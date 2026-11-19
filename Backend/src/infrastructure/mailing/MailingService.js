const axios = require('axios');
const ApiKeyApplicationService = require('../../application/security/ApiKeyApplicationService');
const { resolveSafeFrontendUrl } = require('../../presentation/middlewares/csrf');

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Servicio de Mailing con soporte para Resend y extensible a otros proveedores.
 * Consume de manera transparente la API Key cifrada en AES-256-GCM.
 */
class MailingService {
  constructor(options = {}) {
    this.apiKeyService = options.apiKeyService || new ApiKeyApplicationService();
    this.resendEndpoint = 'https://api.resend.com/emails';
  }

  /**
   * Verifica si el mailing está habilitado y configurado en el sistema.
   * @returns {Promise<boolean>}
   */
  async isConfigured() {
    const config = await this.apiKeyService.getActiveApiKey('MAILING');
    return Boolean(config && config.apiKey);
  }

  /**
   * Envía un correo utilizando el proveedor configurado (Resend).
   *
   * @param {Object} params
   * @param {string} params.to - Destinatario
   * @param {string} params.subject - Asunto
   * @param {string} params.html - Contenido HTML
   * @param {string} [params.text] - Contenido texto plano alternativo
   */
  async sendMail({ to, subject, html, text }) {
    const config = await this.apiKeyService.getActiveApiKey('MAILING');
    if (!config || !config.apiKey) {
      const err = new Error('El servicio de correo no está configurado');
      err.code = 'MAILING_NOT_CONFIGURED';
      throw err;
    }

    const fromEmail = config.metadata?.fromEmail || 'onboarding@resend.dev';
    const fromName = config.metadata?.fromName || 'CTM Oficina Virtual';
    const fromHeader = `${fromName} <${fromEmail}>`;

    if (config.provider === 'RESEND') {
      try {
        const response = await axios.post(
          this.resendEndpoint,
          {
            from: fromHeader,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text: text || undefined
          },
          {
            headers: {
              Authorization: `Bearer ${config.apiKey.trim()}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        return {
          success: true,
          provider: 'RESEND',
          messageId: response.data?.id
        };
      } catch (err) {
        const resendError = err.response?.data?.message || err.message;
        console.error('[MailingService] Error de envío en Resend:', resendError);
        const error = new Error(`Error en el proveedor de correos: ${resendError}`);
        error.code = 'MAILING_PROVIDER_ERROR';
        error.details = err.response?.data;
        throw error;
      }
    }

    throw new Error(`Proveedor de correos no soportado: ${config.provider}`);
  }

  /**
   * Envía el correo de verificación con el código OTP y el enlace de validación directa.
   *
   * @param {Object} params
   * @param {string} params.to - Correo del usuario registrado
   * @param {string} [params.name] - Nombre del usuario
   * @param {string} params.otpCode - Código OTP de 6 dígitos
   * @param {string} params.verificationToken - Token para el enlace de verificación
   * @param {string} [params.frontendUrl] - URL base de la app frontend
   */
  async sendVerificationEmail({ to, name, otpCode, verificationToken, frontendUrl }) {
    const cleanBaseUrl = resolveSafeFrontendUrl(frontendUrl);
    const directLink = `${cleanBaseUrl}/verify-email?token=${encodeURIComponent(verificationToken)}&mail=${encodeURIComponent(to)}`;
    const safeName = escapeHtml(name);
    const safeOtp = escapeHtml(otpCode);
    const safeLink = escapeHtml(directLink);

    const subject = 'Verificá tu correo electrónico · CTM Oficina Virtual';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Verificación de correo - CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.8; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px; }
    .otp-box { background-color: #fafaf5; border: 2px dashed #c72a33; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; tracking-wider; font-weight: 700; color: #888888; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #c72a33; margin: 0; }
    .button-container { text-align: center; margin: 32px 0 20px 0; }
    .button { display: inline-block; background-color: #c72a33; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(199, 42, 51, 0.3); }
    .footer { background-color: #fafaf5; border-top: 1px solid #e5e5dc; padding: 20px 24px; text-align: center; font-size: 11px; color: #888888; }
    .link-alt { font-size: 12px; word-break: break-all; color: #666666; margin-top: 20px; background-color: #f5f5ee; padding: 12px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Centro Tecnológico del Mueble</h1>
      <p>Oficina Virtual · Validación de Cuenta</p>
    </div>
    <div class="content">
      <div class="greeting">¡Hola${safeName ? ` ${safeName}` : ''}!</div>
      <p class="text">
        Gracias por registrarte en la Oficina Virtual del CTM. Para activar tu cuenta y comenzar a gestionar ensayos, ingresá el siguiente código de verificación de 6 dígitos:
      </p>

      <div class="otp-box">
        <div class="otp-label">Código de verificación</div>
        <div class="otp-code">${safeOtp}</div>
      </div>

      <p class="text" style="text-align: center; margin-bottom: 8px;">
        O si preferís, podés validar tu cuenta directamente con un solo clic:
      </p>

      <div class="button-container">
        <a href="${safeLink}" class="button" target="_blank">Verificar mi cuenta ahora</a>
      </div>

      <p class="text" style="font-size: 12px; color: #888888; text-align: center; margin-top: 24px;">
        * Este código y enlace son válidos por 15 minutos. Si no solicitaste este registro, podés desestimar este mensaje.
      </p>

      <div class="link-alt">
        ¿El botón no funciona? Copiá y pegá este enlace en tu navegador:<br>
        <a href="${safeLink}" style="color: #c72a33;">${safeLink}</a>
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} CTMueble · Centro de Investigación, Diseño e Innovación del Mueble
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Tu código de verificación para CTM Oficina Virtual es: ${otpCode}. También podés verificar tu cuenta directamente ingresando a: ${directLink}`
    });
  }

  /**
   * Envía un correo de autenticación en dos pasos (2FA) con el código OTP de 6 dígitos.
   */
  async sendTwoFactorOtpEmail({ to, name, otpCode }) {
    const safeName = escapeHtml(name);
    const safeOtp = escapeHtml(otpCode);
    const subject = `${otpCode} es tu código de seguridad · CTM Oficina Virtual`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Código de seguridad 2FA - CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 540px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 20px; }
    .otp-box { background-color: #fafaf5; border: 2px dashed #c72a33; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #888888; margin-bottom: 6px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #c72a33; margin: 0; }
    .footer { background-color: #fafaf5; border-top: 1px solid #e5e5dc; padding: 18px 24px; text-align: center; font-size: 11px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Centro Tecnológico del Mueble</h1>
      <p>Autenticación en Dos Pasos (2FA)</p>
    </div>
    <div class="content">
      <div class="greeting">¡Hola${safeName ? ` ${safeName}` : ''}!</div>
      <p class="text">
        Se ha solicitado un código de verificación de seguridad para acceder a tu cuenta en la Oficina Virtual de CTM.
      </p>

      <div class="otp-box">
        <div class="otp-label">Código de seguridad de 6 dígitos</div>
        <div class="otp-code">${safeOtp}</div>
      </div>

      <p class="text" style="font-size: 12px; color: #777777; margin-top: 20px;">
        * Este código expira en 10 minutos. Nunca compartas este código con ninguna persona. Si no realizaste esta solicitud, te recomendamos cambiar tu contraseña de inmediato.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} CTMueble · Sistema de Gestión y Oficina Virtual
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Tu código de seguridad 2FA para CTM Oficina Virtual es: ${otpCode}. Expira en 10 minutos.`
    });
  }

  /**
   * Envía un correo de prueba para verificar credenciales de mailing.
   */
  async sendTestEmail(toEmail) {
    const subject = 'Correo de prueba de configuración · CTM Oficina Virtual';
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #c72a33;">¡Configuración de Mailing Exitosa!</h2>
        <p>Este correo confirma que el proveedor Resend ha sido configurado correctamente en el sistema CTM Oficina Virtual.</p>
        <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-AR')}</p>
        <p style="font-size: 12px; color: #777;">Las API Keys se encuentran resguardadas bajo cifrado autenticado AES-256-GCM.</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      text: 'Este es un correo de prueba confirmando la configuración de mailing en CTM Oficina Virtual.'
    });
  }

  /**
   * Envía correo de invitación para activar cuenta interna del laboratorio.
   */
  async sendLaboratoryInvitation({ to, name, role, otpCode, verificationToken, frontendUrl }) {
    const cleanBaseUrl = resolveSafeFrontendUrl(frontendUrl);
    const directLink = `${cleanBaseUrl}/verify-email?token=${encodeURIComponent(verificationToken)}&mail=${encodeURIComponent(to)}&invitation=true`;

    const roleName = String(role || 'Usuario').toUpperCase();
    const roleLabel = roleName === 'ADMIN' ? 'Administrador' : roleName === 'CONSULTA' ? 'Consulta' : 'Técnico / Operativo';
    const roleDesc =
      roleName === 'ADMIN'
        ? 'Acceso total e irrestricto al sistema del laboratorio'
        : roleName === 'CONSULTA'
        ? 'Visualización de ensayos, informes y clientes'
        : 'Gestión de ensayos, recepción de muestras y órdenes de trabajo';

    const safeName = escapeHtml(name);
    const safeRoleLabel = escapeHtml(roleLabel);
    const safeRoleDesc = escapeHtml(roleDesc);
    const safeOtp = escapeHtml(otpCode);
    const safeLink = escapeHtml(directLink);

    const subject = `Activá tu cuenta de laboratorio (${roleLabel}) · CTM Oficina Virtual`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Invitación a Laboratorio CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.8; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 20px; }
    .role-badge { display: inline-block; background-color: #fbebee; color: #c72a33; border: 1px solid #f2c6ca; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; margin: 8px 0 16px 0; }
    .otp-box { background-color: #fafaf5; border: 2px dashed #c72a33; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #888888; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #c72a33; margin: 0; }
    .button-container { text-align: center; margin: 28px 0 20px 0; }
    .button { display: inline-block; background-color: #c72a33; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(199, 42, 51, 0.3); }
    .footer { background-color: #fafaf5; border-top: 1px solid #e5e5dc; padding: 20px 24px; text-align: center; font-size: 11px; color: #888888; }
    .link-alt { font-size: 12px; word-break: break-all; color: #666666; margin-top: 20px; background-color: #f5f5ee; padding: 12px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Centro Tecnológico del Mueble</h1>
      <p>Oficina Virtual · Equipo de Laboratorio</p>
    </div>
    <div class="content">
      <div class="greeting">¡Hola${safeName ? ` ${safeName}` : ''}!</div>
      <p class="text">
        El superadministrador te ha dado de alta como usuario interno del laboratorio CTM. Tu cuenta ya se encuentra configurada en el modo laboratorio con el siguiente rol:
      </p>

      <div style="text-align: center;">
        <span class="role-badge">Rol: ${safeRoleLabel}</span>
        <div style="font-size: 12px; color: #666; margin-bottom: 16px;">${safeRoleDesc}</div>
      </div>

      <p class="text" style="text-align: center; margin-bottom: 8px;">
        Hacé clic en el siguiente botón para activar tu cuenta, definir tu contraseña e ingresar al sistema:
      </p>

      <div class="button-container">
        <a href="${safeLink}" class="button" target="_blank">Activar mi cuenta de laboratorio</a>
      </div>

      <div class="otp-box">
        <div class="otp-label">O ingresá con este código OTP</div>
        <div class="otp-code">${safeOtp}</div>
      </div>

      <p class="text" style="font-size: 12px; color: #888888; text-align: center; margin-top: 24px;">
        * Este enlace de activación es válido por 48 horas. Una vez activado, tendrás acceso inmediato a las funciones de laboratorio.
      </p>

      <div class="link-alt">
        ¿No podés hacer clic en el botón? Copiá y pegá este enlace en tu navegador:<br>
        <a href="${safeLink}" style="color: #c72a33;">${safeLink}</a>
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} CTMueble · Centro de Investigación, Diseño e Innovación del Mueble
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Has sido dado de alta como usuario del laboratorio CTM con el rol ${roleLabel}. Para activar tu cuenta, ingresá al siguiente enlace: ${directLink} o usá el código: ${otpCode}`
    });
  }

  /**
   * Envía notificación por correo al cliente ante un cambio de estado en la solicitud de ensayo.
   */
  async sendEssayStatusNotification({
    to,
    name,
    essayCode,
    essayId,
    status,
    statusTitle,
    statusDescription,
    observations,
    unsubscribeToken,
    frontendUrl
  }) {
    const cleanBaseUrl = resolveSafeFrontendUrl(frontendUrl);
    const viewUrl = `${cleanBaseUrl}/essay/${encodeURIComponent(essayId)}`;
    const unsubscribeUrl = `${cleanBaseUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken || '')}&essayId=${encodeURIComponent(essayId)}`;

    const safeName = escapeHtml(name);
    const safeEssayCode = escapeHtml(essayCode);
    const safeStatusTitle = escapeHtml(statusTitle);
    const safeStatusDescription = escapeHtml(statusDescription);
    const safeObservations = escapeHtml(observations);
    const safeViewUrl = escapeHtml(viewUrl);
    const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

    const subject = `Actualización de solicitud #${essayCode}: ${statusTitle} · CTM`;

    const statusBadgeColors = {
      REQUESTED: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
      ACCEPTED: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
      SERVICE_AGREEMENT_MADED: { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
      IN_WORK: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
      COMPLETED: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
      REJECTED: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
      CANCELLED: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
    };
    const colors = statusBadgeColors[status] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Actualización de Ensayo - CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .status-box { background-color: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .status-title { font-size: 15px; font-weight: 700; color: ${colors.text}; margin: 0 0 6px 0; }
    .status-desc { font-size: 13px; line-height: 1.5; color: ${colors.text}; margin: 0; opacity: 0.95; }
    .details-box { background-color: #fafaf5; border: 1px solid #e5e5dc; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; }
    .detail-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .detail-label { color: #666666; font-weight: 500; }
    .detail-value { color: #111111; font-weight: 600; }
    .button-container { text-align: center; margin: 28px 0 16px 0; }
    .button { display: inline-block; background-color: #c72a33; color: #ffffff !important; padding: 12px 26px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(199, 42, 51, 0.3); }
    .auth-notice { font-size: 11px; line-height: 1.5; color: #666666; background-color: #f7f7ee; border-left: 3px solid #c72a33; padding: 10px 14px; border-radius: 4px; margin-top: 26px; }
    .unsubscribe-box { text-align: center; margin-top: 18px; font-size: 11px; color: #888888; }
    .unsubscribe-link { color: #c72a33; text-decoration: underline; }
    .footer { background-color: #fafaf5; border-top: 1px solid #e5e5dc; padding: 18px 24px; text-align: center; font-size: 11px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Centro Tecnológico del Mueble</h1>
      <p>Oficina Virtual · Seguimiento de Solicitud de Ensayo</p>
    </div>
    <div class="content">
      <div class="greeting">¡Hola${safeName ? ` ${safeName}` : ''}!</div>
      <p style="font-size: 14px; line-height: 1.5; color: #444; margin: 0 0 14px 0;">
        Te informamos que hubo una actualización en el estado de tu solicitud de ensayo <strong>#${safeEssayCode}</strong>:
      </p>

      <div class="status-box">
        <div class="status-title">${safeStatusTitle}</div>
        <div class="status-desc">${safeStatusDescription}</div>
        ${safeObservations ? `<div style="margin-top: 8px; font-size: 12px; font-style: italic; color: ${colors.text}; border-top: 1px dashed ${colors.border}; padding-top: 6px;">Observaciones: ${safeObservations}</div>` : ''}
      </div>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">N° de Solicitud:</span>
          <span class="detail-value">#${safeEssayCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de actualización:</span>
          <span class="detail-value">${new Date().toLocaleDateString('es-AR')}</span>
        </div>
      </div>

      <div class="button-container">
        <a href="${safeViewUrl}" class="button" target="_blank">Ver solicitud en la Oficina Virtual</a>
      </div>

      <div class="auth-notice">
        ℹ️ <strong>Aviso de suscripción:</strong> Recibís este correo porque autorizaste la recepción de notificaciones sobre el estado de tu solicitud al momento de realizarla en la Oficina Virtual del CTM.
      </div>

      <div class="unsubscribe-box">
        Si no deseás seguir recibiendo notificaciones por correo sobre esta solicitud, podés
        <a href="${safeUnsubscribeUrl}" class="unsubscribe-link" target="_blank">darte de baja aquí</a>
        o desactivarlas directamente desde el detalle de la solicitud en la plataforma.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} CTMueble · Centro de Investigación, Diseño e Innovación del Mueble
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Actualización de solicitud #${essayCode} en CTM Oficina Virtual:\n${statusTitle}\n${statusDescription}\n\nPodés ver la solicitud aquí: ${viewUrl}\n\nRecibís este correo porque así lo autorizaste al solicitar el ensayo. Para darte de baja de estas notificaciones: ${unsubscribeUrl}`
    });
  }

  /**
   * Envía notificación por correo al laboratorio cuando entra una nueva solicitud de ensayo.
   */
  async sendNewRequestLabNotification({
    to,
    essayCode,
    essayId,
    clientName,
    applicantName,
    product,
    manufacturer,
    requestDate,
    observations,
    frontendUrl
  }) {
    const cleanBaseUrl = resolveSafeFrontendUrl(frontendUrl);
    const viewUrl = `${cleanBaseUrl}/essay/${encodeURIComponent(essayId)}`;
    const formattedDate = requestDate
      ? new Date(requestDate).toLocaleDateString('es-AR')
      : new Date().toLocaleDateString('es-AR');

    const safeEssayCode = escapeHtml(essayCode);
    const safeClientName = escapeHtml(clientName);
    const safeApplicantName = escapeHtml(applicantName);
    const safeProduct = escapeHtml(product);
    const safeManufacturer = escapeHtml(manufacturer);
    const safeFormattedDate = escapeHtml(formattedDate);
    const safeObservations = escapeHtml(observations);
    const safeViewUrl = escapeHtml(viewUrl);

    const subject = `Nueva solicitud de ensayo recibida #${essayCode} · CTM Laboratorio`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nueva Solicitud - Laboratorio CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 16px; margin-bottom: 16px; }
    .details-box { background-color: #fafaf5; border: 1px solid #e5e5dc; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eeeeea; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666666; font-weight: 500; }
    .detail-value { color: #111111; font-weight: 600; text-align: right; }
    .button-container { text-align: center; margin: 28px 0 16px 0; }
    .button { display: inline-block; background-color: #c72a33; color: #ffffff !important; padding: 12px 26px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(199, 42, 51, 0.3); }
    .footer { background-color: #fafaf5; border-top: 1px solid #e5e5dc; padding: 18px 24px; text-align: center; font-size: 11px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Centro Tecnológico del Mueble</h1>
      <p>Notificación Interna · Gestión de Laboratorio</p>
    </div>
    <div class="content">
      <div class="badge">Nueva Solicitud Pendiente</div>
      <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #111;">Se ha recibido una nueva solicitud de ensayo</h2>
      <p style="font-size: 13px; line-height: 1.5; color: #555; margin: 0 0 16px 0;">
        Un cliente ha ingresado una nueva solicitud de ensayo en la plataforma. Se encuentra pendiente de revisión técnica y aceptación.
      </p>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Código:</span>
          <span class="detail-value">#${safeEssayCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Empresa / Titular:</span>
          <span class="detail-value">${safeClientName || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Solicitante:</span>
          <span class="detail-value">${safeApplicantName || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Elemento / Producto:</span>
          <span class="detail-value">${safeProduct ? `${safeProduct}${safeManufacturer ? ` (${safeManufacturer})` : ''}` : '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de solicitud:</span>
          <span class="detail-value">${safeFormattedDate}</span>
        </div>
        ${safeObservations ? `
        <div class="detail-row">
          <span class="detail-label">Observaciones:</span>
          <span class="detail-value">${safeObservations}</span>
        </div>` : ''}
      </div>

      <div class="button-container">
        <a href="${safeViewUrl}" class="button" target="_blank">Revisar Solicitud en el Sistema</a>
      </div>
    </div>
    <div class="footer">
      Este correo es una notificación automática del sistema CTM Oficina Virtual configurada para el laboratorio.
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Nueva solicitud de ensayo recibida #${essayCode}.\nCliente: ${clientName || '—'}\nSolicitante: ${applicantName || '—'}\nElemento: ${product || '—'}\nFecha: ${formattedDate}\n\nIngresá al sistema para gestionarla: ${viewUrl}`
    });
  }

  /**
   * Envía el correo de restablecimiento de contraseña con código OTP y enlace directo.
   */
  async sendPasswordResetEmail({ to, name, otpCode, resetToken, frontendUrl }) {
    const cleanBaseUrl = resolveSafeFrontendUrl(frontendUrl);
    const directLink = `${cleanBaseUrl}/reset-password?token=${encodeURIComponent(resetToken)}&mail=${encodeURIComponent(to)}`;

    const safeName = escapeHtml(name);
    const safeOtp = escapeHtml(otpCode);
    const safeLink = escapeHtml(directLink);

    const subject = 'Restablecé tu contraseña · CTM Oficina Virtual';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Restablecimiento de contraseña - CTM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7ee; color: #333333; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5dc; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #1b080a 0%, #3d1419 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.8; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px; }
    .otp-box { background-color: #fafaf5; border: 2px dashed #c72a33; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #888888; margin-bottom: 8px; }
    .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1b080a; font-family: monospace; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #c72a33; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(199, 42, 51, 0.25); }
    .footer { background-color: #fafaf5; padding: 20px 32px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
    .link-fallback { font-size: 12px; color: #888888; word-break: break-all; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CTM · Oficina Virtual</h1>
      <p>Centro Tecnológico de la Madera y el Mueble</p>
    </div>
    <div class="content">
      <div class="greeting">Hola${safeName ? ` ${safeName}` : ''},</div>
      <div class="text">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Podés usar el siguiente código de verificación o hacer clic en el botón de abajo:
      </div>
      <div class="otp-box">
        <div class="otp-label">Código de verificación</div>
        <div class="otp-code">${safeOtp}</div>
      </div>
      <div class="button-container">
        <a href="${safeLink}" class="button" target="_blank">Restablecer Contraseña</a>
      </div>
      <div class="text">
        Este código y enlace expirarán en <strong>15 minutos</strong>. Si no solicitaste el cambio de contraseña, podés ignorar este correo de forma segura.
      </div>
      <div class="link-fallback">
        Si el botón no funciona, copiá y pegá el siguiente enlace en tu navegador:<br>
        ${safeLink}
      </div>
    </div>
    <div class="footer">
      Este correo fue enviado automáticamente por CTM Oficina Virtual. Por favor, no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `Hola${name ? ` ${name}` : ''},\n\nRecibimos una solicitud para restablecer tu contraseña en CTM Oficina Virtual.\nTu código de verificación es: ${otpCode}\nO ingresá al siguiente enlace: ${directLink}\n\nEl código expira en 15 minutos. Si no solicitaste este cambio, ignorá este correo.`
    });
  }
}

MailingService.escapeHtml = escapeHtml;
module.exports = MailingService;
