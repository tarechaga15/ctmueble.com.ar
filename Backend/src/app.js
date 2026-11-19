const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Cargar .env solo si existe (en Vercel las variables provienen del entorno)
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envResult = require('dotenv').config({ path: envPath });
  if (envResult.error) {
    console.warn('[APP] Error loading .env:', envResult.error.message);
  }
}
if (!process.env.DATABASE_URL && !process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  console.warn('[APP] DATABASE_URL not set. Configure it in .env or environment.');
}

// Require estático para empaquetado serverless en Vercel
require('./infrastructure/templates/HandlebarsService');
const RedisClient = require('./infrastructure/redis/RedisClient');
const sequelize = require('./infrastructure/config/db');
const requestContextMiddleware = require('./presentation/middlewares/transaction');
const verifyJWT = require('./presentation/middlewares/jwt.verify');
const { verifyCsrf, getAllowedOrigins, isOriginAllowed } = require('./presentation/middlewares/csrf');
const idempotencyMiddleware = require('./presentation/middlewares/idempotency');
const { createRateLimiter } = require('./presentation/middlewares/rateLimit');
const normalizeErrorResponse = require('./presentation/middlewares/normalizeErrorResponse');
const requireLaboratory = require('./presentation/middlewares/requireLaboratory');

// Rutas
const usersRouter = require('./presentation/routes/users.routes');
const authRouter = require('./presentation/routes/auth.routes');
const essaysRouter = require('./presentation/routes/essays.routes');
const clientsRouter = require('./presentation/routes/clients.routes');
const bussinessRouter = require('./presentation/routes/bussiness.routes');
const personsRouter = require('./presentation/routes/persons.routes');
const envRouter = require('./presentation/routes/env.routes');
const apiKeyRouter = require('./presentation/routes/apiKey.routes');
const typesRouter = require('./presentation/routes/types.routes');
const samplesRouter = require('./presentation/routes/samples.routes');
const laboratoryUsersRouter = require('./presentation/routes/laboratoryUsers.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Endurecimiento base de Express detrás de proxy (Vercel / Reverse Proxy)
app.disable('x-powered-by');
app.set('trust proxy', 1);

// 1. Trazabilidad (`X-Request-Id`) y registro estructurado sin secretos ni query strings
app.use((req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && /^[a-zA-Z0-9._-]{8,64}$/.test(incomingId)
      ? incomingId
      : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  if (process.env.NODE_ENV !== 'test') {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const safePath = String(req.originalUrl || req.url || '').split('?')[0];
      console.info(
        JSON.stringify({
          type: 'HTTP_ACCESS',
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          path: safePath,
          status: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          userId: req.user?.id || null
        })
      );
    });
  }

  next();
});

// 2. Cabeceras HTTP de seguridad estrictas para API JSON/PDF y prevención de caché compartida
app.use((req, res, next) => {
  const isSwaggerRoute = !isProd && req.path.startsWith('/api-docs');

  if (isSwaggerRoute) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    );
  }

  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  next();
});

// 3. CORS estricto con credenciales habilitadas para cookies `HttpOnly` y cabecera `X-CSRF-Token`
const corsOptions = {
  origin(origin, callback) {
    // Solicitudes server-to-server o healthchecks sin cabecera Origin
    if (!origin) {
      return callback(null, true);
    }
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'x-csrf-token',
    'Idempotency-Key',
    'idempotency-key',
    'X-Requested-With',
    'X-Request-Id',
    'X-Device-Id',
    'x-device-id',
    'X-Device-Fingerprint',
    'x-device-fingerprint'
  ],
  exposedHeaders: [
    'Content-Disposition',
    'X-CSRF-Token',
    'X-Request-Id',
    'Retry-After',
    'X-Idempotent-Replayed'
  ],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(requestContextMiddleware);
app.use(normalizeErrorResponse);

// 4. Límites explícitos de tamaño de payload (prevención de DoS de memoria)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// 5. Health & Readiness checks (sin autenticación ni consumo permanente de conexiones)
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (_req, res) => {
  let timer = null;
  try {
    const dbCheck = sequelize.query('SELECT 1');
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('DB readiness timeout')), 2000);
      if (typeof timer.unref === 'function') timer.unref();
    });
    await Promise.race([dbCheck, timeoutPromise]);
    if (timer) clearTimeout(timer);
    return res.status(200).json({
      status: 'ready',
      db: 'up',
      redis: RedisClient.isConfigured() ? 'configured' : 'disabled'
    });
  } catch (_) {
    if (timer) clearTimeout(timer);
    return res.status(503).json({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Base de datos temporalmente no disponible'
    });
  }
});

// 6. Rate limiting global base contra abuso / scraping
const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 180,
  code: 'GLOBAL_RATE_LIMIT',
  message: 'Demasiadas solicitudes desde este cliente, aguarde unos segundos.'
});
app.use(globalApiLimiter);

const documentDownloadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 60,
  code: 'DOWNLOAD_RATE_LIMIT',
  message: 'Demasiadas descargas en poco tiempo, intente nuevamente más tarde.',
  keyByUser: true
});

// 7. Rutas de autenticación (`/auth`)
app.use('/auth', authRouter);

// 7.1 Ruta pública para baja de notificaciones por correo (validada por token único)
const essaysController = require('./presentation/controllers/essays.controller');
app.get('/essays/:id/unsubscribe', essaysController.unsubscribeNotifications);
app.post('/essays/:id/unsubscribe', essaysController.unsubscribeNotifications);
app.post('/essays/notifications/unsubscribe', essaysController.unsubscribeNotifications);
app.get('/essays/notifications/unsubscribe', essaysController.unsubscribeNotifications);

// 8. Pipeline autenticado: JWT (cookie HttpOnly o Bearer en dev) -> CSRF Double-Submit -> Idempotencia aislada por usuario
const protectedPipeline = [verifyJWT, verifyCsrf, idempotencyMiddleware];

app.use('/users', ...protectedPipeline, usersRouter);
app.use(
  '/essays',
  ...protectedPipeline,
  (req, res, next) => {
    // NOTA DE SEGURIDAD: Se eliminó por completo la aceptación de `?access_token=` en query string.
    if (
      req.method === 'GET' &&
      (req.path === '/download-document' || req.path === '/download-document-by-type')
    ) {
      return documentDownloadLimiter(req, res, next);
    }
    return next();
  },
  essaysRouter
);
app.use('/clients', ...protectedPipeline, clientsRouter);
app.use('/bussiness', ...protectedPipeline, bussinessRouter);
app.use('/persons', ...protectedPipeline, personsRouter);
app.use('/env', ...protectedPipeline, envRouter);
app.use('/api-keys', ...protectedPipeline, apiKeyRouter);
app.use('/types', ...protectedPipeline, typesRouter);
app.use('/samples', ...protectedPipeline, requireLaboratory, samplesRouter);
app.use('/laboratory/users', ...protectedPipeline, requireLaboratory, laboratoryUsersRouter);

// Swagger UI deshabilitado en producción salvo habilitación explícita por entorno
if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api-docs', verifyJWT, requireLaboratory, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Manejo de 404 sin reflejar query strings arbitrarios
app.use((req, res) => {
  const safePath = String(req.path || '').slice(0, 120);
  return res.status(404).json({
    code: 'NOT_FOUND',
    message: `Recurso no encontrado: ${safePath}`
  });
});

// Manejo global de errores (incluye PayloadTooLargeError y JSON malformado)
app.use((err, req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'El tamaño de la solicitud excede el límite permitido (100 KB)'
    });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      code: 'INVALID_JSON',
      message: 'El cuerpo JSON de la solicitud es inválido'
    });
  }

  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  console.error(`[GLOBAL_ERROR] requestId=${req?.requestId || 'n/a'} status=${status}`, err?.stack || err?.message || err);

  const isTechnical =
    status >= 500 ||
    err instanceof TypeError ||
    err instanceof ReferenceError ||
    err instanceof RangeError ||
    String(err?.name || '').startsWith('Sequelize') ||
    /violates foreign key|is not defined|invalid status/i.test(String(err?.message || ''));

  const safeMessage = isTechnical
    ? 'Ocurrió un error inesperado en el servidor. Por favor, intente nuevamente más tarde.'
    : (err?.message || 'Error al procesar la solicitud');

  return res.status(status).json({
    code: err?.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
    message: safeMessage,
    error: safeMessage
  });
});

// Arranque y apagado elegante (Graceful Shutdown) cuando corre como proceso Node persistente
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`[APP] Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.info(`[APP] ${signal} recibido. Cerrando conexiones ordenadamente...`);
    server.close(async () => {
      try {
        await sequelize.close();
      } catch (_) {}
      try {
        await RedisClient.getInstance().quit();
      } catch (_) {}
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
