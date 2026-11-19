# Módulo IV — Entorno, Arquitectura de Implementación, Inyección de Dependencias, Scripts, Incidencias y Tests

Este documento consolida la fase de construcción y validación técnica del sistema (**Módulo IV**), cubriendo la organización de implementación, la estructura DDD/Clean Architecture del repositorio, el cableado de dependencias (`serviceFactory` y `di`), la gestión de variables dinámicas (`/env`), los catálogos (`/types`), los scripts CLI de migración y seedeo, el registro de incidencias y la demostración/suite de pruebas automatizadas (`94` subtests).

---

## 0. Organización de Actividades, Entorno y Desarrollo Incremental (`Módulo IV.pdf`)

### 0.1. Organización de Actividades del Módulo IV y Validación Previa
- **Roles asignados en la etapa de desarrollo:**
  - Responsables de desarrollo por módulos (Seguridad/Auth, Clientes y autocompletado opcional ARCA, Ensayos/OT/Muestras, Documentos/PDF/Exportación).
  - Responsable de base de datos física y migraciones (`umzug` + Neon PostgreSQL).
  - Responsable de testing interno y auditoría de seguridad (`tests/`).
  - Responsable de documentación técnica, repositorio GitHub e integración final.
- **Validación de módulos anteriores:** Antes de cada implementación se contrastaron las especificaciones de los Módulos I–III (`RF01`–`RF36`, `RN01`–`RN22`, jerarquía de procesos, modelo de 34 tablas, navegación y matriz de permisos), asegurando coherencia estricta sin programación improvisada.

### 0.2. Preparación del Entorno de Trabajo y Estructura del Repositorio

- **Lenguaje / Runtime / Framework:** JavaScript sobre Node.js + Express 5 (`package.json` v1.2.0).
- **Motor de Base de Datos:** PostgreSQL (Neon administrado en producción) vía Sequelize 6 + `pg` + `pg-hstore`.
- **Editor y Repositorio:** Visual Studio Code + Git/GitHub con control estricto de ramas y commits descriptivos por módulo o remediación.

```text
gestion.ctmueble.com.ar/
├── src/
│   ├── domain/            # Entidades puras, Value Objects (estados/eventos) y servicios de dominio
│   ├── application/       # Casos de uso, DTOs, servicios de aplicación y exportador CSV/XLSX
│   ├── infrastructure/    # Modelos Sequelize, repositorios, ARCA (auxiliar opcional), R2, Redis, mailing, PDF, migraciones
│   ├── presentation/      # Rutas Express, controladores HTTP, middlewares (CSRF, idempotency, rateLimit, JWT)
│   ├── shared/            # serviceFactory.js, contenedor DI (di/), sqlLike.js
│   ├── app.js             # Bootstrap Express y montaje de pipeline HTTP
│   └── handler.js         # Adaptador serverless AWS Lambda / Vercel
├── scripts/               # Automatización CLI (sync-templates.js, build-docs-pdf.js)
├── tests/                 # Suite nativa node --test (seguridad, contratos, unit, validación, crypto)
└── docs/                  # Documentación organizada por Módulos I–IV, Manuales e Índice Maestro
```

### 0.3. Orden Lógico de Desarrollo y Enfoque Incremental (Etapas 1 a 4)

El sistema fue construido respetando la jerarquía de dependencias del Módulo III:
1. **Seguridad y usuarios** → 2. **Clientes, Empresas y Personas (+ autocompletado opcional ARCA)** → 3. **Ensayos (`F-PC13-02`)** → 4. **Recepción, Órdenes de Trabajo (`F-PC13-03`) y Muestras** → 5. **Informes (`F-PC13-01`), PDFs, Exportación e Integridad Criptográfica** → 6. **Configuración (`/env`) y Catálogos (`/types`)**.

| Etapa incremental | Entregables funcionales implementados |
| :--- | :--- |
| **Etapa 1 — Base de Datos Física, Auth y Estructura Base** | Creación física de tablas e integridad referencial vía Umzug (`20260217`), seeders de catálogos/usuario inicial, registro/login JWT + cookies `HttpOnly`/CSRF, verificación de email, reseteo de password, 2FA y gestión de equipo de laboratorio con permisos granulares. |
| **Etapa 2 — CRUD / ABM Principales y Autocompletado Opcional ARCA** | Clientes, personas (representantes y contactos), servicio auxiliar opcional WSAA + Padrón A13 de ARCA para autocompletar clientes (sin requerir activación; habilitable con `ARCA_CUIT` y certificado/clave), normalización de domicilios/distritos, agenda compartida de laboratorio y API keys cifradas con AES-256-GCM / KMS Envelope. |
| **Etapa 3 — Operación Central Funcionando** | Solicitudes de ensayo `F-PC13-02`, generación atómica de códigos diarios (`daily_sequence_counters`), snapshot `essays_client`, presupuestos `essays_terms`, plantillas de elementos, recepción unificada de muestras, Órdenes de Trabajo `F-PC13-03` y carga de resultados con promedio automático. |
| **Etapa 4 — Informes, Reportes, Integridad y Hardening** | Emisión `F-PC13-01` (`ORIGINAL`/`MODIFICATION`), PDFs on-the-fly Handlebars+Chromium+R2, exportación CSV/XLSX anti-injection, notificaciones Resend, snapshots `CanonicalJson` + RSA-SHA256 + OpenTimestamps, rate limiting, idempotencia y auditoría integral `20261117`. |

---

## 1. Inyección de Dependencias (`serviceFactory` y `src/shared/di/`)

El proyecto cuenta con dos mecanismos complementarios en `src/shared/`:

### 1.1. Fábrica Explícita por Request (`src/shared/serviceFactory.js`)
Es el mecanismo utilizado directamente por todos los controladores HTTP de `src/presentation/controllers/`:
- **`buildContext(req)`:** Construye el contexto por petición `{ user: req.user, auth: req.auth, transaction: req.transaction, request: req, req, response: req.res, sql, logger, execute }`.
- **Singletons compartidos:** Reutiliza instancias sin estado por módulo (`DocumentInfrastructureService`, `HandlebarsService`, `EssayService` de dominio, `SampleService`, `ClientOriginService`, `PersonValidationService`, `AddressOriginService`, `PadronService` inicializado lazy mediante `getPadronService()`, y los repositorios de catálogos/clientes/usuarios/plantillas).
- **Fábricas por caso de uso:** `getEssayService(ctx)`, `getSampleService(ctx)` / `getWorkOrderService(ctx)`, `getDocumentService(ctx)`, `getBusinessService(ctx)`, `getClientService(ctx)`, `getPersonService(ctx)`, `getUserService(ctx)`, `getUserAccountService(ctx)`, `getAuthService()`, `getEnvService(ctx)`, `getTypesService()`, `getEssayAuditLogService(ctx)`, `getElementTemplateService(ctx)` y `getSnapshotService(ctx)`.
- **Repositorios transaccionales:** `EssayRepository`, `WorkOrderRepository`, `SampleRepository`, `DocumentRepository`, `BusinessRepository`, `EssayAuditLogRepository` y `WorkOrderAuditLogRepository` se instancian con `{ transaction: ctx.transaction }` y exponen `setTransaction(tx)` para enlazarse dinámicamente a `withTransaction` en la capa de aplicación.

### 1.2. Contenedor Declarativo y Clusters (`src/shared/di/`)
Compuesto por [`container.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/container.js), [`serviceRegistry.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/serviceRegistry.js), [`serviceClusterManager.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/serviceClusterManager.js), [`services.config.json`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/services.config.json) e [`index.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/index.js):
- **`ServiceRegistry`:** Lee el grafo declarativo de `services.config.json` (`services`, `repositories`, `domainServices`, `domainEntities`, `infrastructureServices`, `clusters`).
- **Reglas arquitectónicas validadas en runtime:**
  - `Infrastructure` → solo puede depender de `Infrastructure`.
  - `Domain` → puede depender de `Domain` e `Infrastructure`.
  - `Application` → puede depender de `Application`, `Domain` e `Infrastructure`.
- **Resolución de parámetros de factory (`resolveFactoryParam`):** Soporta `env:VAR||default`, `context:path`, `service:Key:type`, `repository:Repo` y `entity:Entity`, además de lazy loading y resolución de clusters (documentado en [`src/shared/di/CLUSTERS_USAGE.md`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/di/CLUSTERS_USAGE.md)).

---

## 2. Variables de Entorno Dinámicas (`EnvApplicationService` y `/env`)

Implementado en [`src/application/env/services/EnvApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/env/services/EnvApplicationService.js), [`env.controller.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/controllers/env.controller.js) y [`env.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/env.routes.js).

A diferencia de las variables de infraestructura en `.env` (Vercel/Node), la tabla `environment_variables` almacena parámetros institucionales y analíticos del laboratorio editables en caliente:

### 2.1. Tipos de Dato, Caché y Variables Base
- **Tipos soportados:** `TEXT` (`value_text`), `NUMBER` (`value_number`), `DECIMAL` (`value_decimal`) y `TIMESTAMP` (`value_timestamp`).
- **Caché interna de 60 segundos (`ENV_CACHE_TTL_MS = 60000`):**
  - Los métodos internos `fetchSystemData()` y `getSystemValue(id)` leen desde la caché en memoria para alimentar rápidamente las plantillas PDF (`HandlebarsService` / `DocumentApplicationService`) y el cálculo de incertidumbre en órdenes de trabajo (`UNCERTAINTY`) sin consultar la BD en cada descarga.
  - Cualquier operación `add`, `update` o `delete` invoca `invalidateEnvCache()` de forma automática.
- **Protección `hardcoded`:** Las variables institucionales críticas (`SOCIAL_NAME`, `CUIT`, `LOCAL_ADDRESS`, `LOCATION`, `PROVINCE`, `PRESIDENT`, `PRESIDENT_DNI`, `BANK`, `BANK_CC`, `BANK_CBU`, `LAB_DIRECTOR`) tienen `hardcoded = true`; pueden actualizarse, pero cualquier intento de eliminación devuelve `400 ENV_HARDCODED`. Las variables operativas (`UNCERTAINTY`, `LAB_PHONE`, `LAB_MAIL`) tienen `hardcoded = false`.

### 2.2. Endpoints y Auditoría (`/env`)
Todas las rutas requieren `verifyJWT` + `requireLaboratory` + `requireLabPermission('configuracion.env')`. Las mutaciones registran eventos `ENV_ADD`, `ENV_UPDATE` y `ENV_DELETE` en `security_audit_logs`.

| Método | Ruta | Parámetros / Body | Respuesta OK |
| :--- | :--- | :--- | :--- |
| `GET` | `/env/fetch` | Query opcional: `mode=DATA` | Lista `{ id, label, type, value, hardcoded }[]` (o mapa `{ id: value }` si `mode=DATA`). |
| `GET` | `/env/get` | Query: `id` | `{ id, label, type, value, hardcoded }` (`404 ENV_NOT_FOUND` si no existe). |
| `POST` | `/env/add` | Body: `{ id, label, type, value }` | Registro creado. |
| `PUT` | `/env/update` | Query: `id`; Body: `{ value }` | Registro actualizado. |
| `DELETE` | `/env/delete` | Query: `id` | `true` (`400 ENV_HARDCODED` si está protegida). |

---

## 3. Catálogos y Tipos del Sistema (`TypesApplicationService` y `/types`)

Implementado en [`src/application/types/services/TypesApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/types/services/TypesApplicationService.js), [`types.controller.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/controllers/types.controller.js) y [`types.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/types.routes.js).

| Método | Ruta | Auth | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/types/essays` | JWT | Lista todos los tipos de ensayo (`types_essays`: `{ id, name }`). |
| `POST` | `/types/essays` | JWT + `LABORATORY` | Da de alta un nuevo tipo de ensayo por `name` (`201` si es nuevo, `200` si ya existía). |
| `GET` | `/types/countries` | JWT | Lista el catálogo de países (`types_countries`: `{ id, name, country_code }`). |
| `GET` | `/types/districts` | JWT | Lista el catálogo de distritos/provincias (`types_districts`: `{ id, country, name, numeric_id }`). |

---

## 4. Scripts CLI, Migraciones, Seeders y Empaquetado

Definidos en [`package.json`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/package.json), [`scripts/sync-templates.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/scripts/sync-templates.js), [`src/infrastructure/migrations/`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/migrations/run-migrations.js) y [`src/infrastructure/seeders/`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/seeders/run-create-user.js).

### 4.1. Comandos de Migraciones (Umzug + `SequelizeMeta`)
El script [`run-migrations.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/migrations/run-migrations.js) descubre archivos con patrón `YYYYMMDDHHMMSS-*.js`, valida `up`/`down` y ejecuta en transacciones sobre PostgreSQL:
```bash
npm run migrate          # Ejecuta todas las migraciones pendientes (up)
npm run migrate:up       # Equivalente explícito a up
npm run migrate:down     # Revierte la última migración ejecutada
npm run migrate:undo     # Revierte todas las migraciones ejecutadas (to: 0)
npm run migrate:status   # Lista estado de migraciones aplicadas y pendientes
```

### 4.2. Seeders Base (Global, Granular y Restablecimiento de Contraseñas)
- **Seedeo global y granular ([`run-default-types-seed.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/seeders/run-default-types-seed.js) + [`baseSeedData.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/seeders/baseSeedData.js)):**
  ```bash
  npm run seed                 # Global: países, provincias, formaldehído, documentos, lab ficticio y usuarios base
  npm run seed:countries       # Granular: todos los 249 países ISO 3166-1 alpha-2 en español
  npm run seed:provinces       # Granular: las 24 jurisdicciones/provincias argentinas (AR-A a AR-Z)
  npm run seed:essay-types     # Granular: tipo de ensayo formaldehído IT17-01 (id: 1)
  npm run seed:lab             # Granular: datos ficticios en environment_variables y laboratories
  npm run seed:users           # Granular: cuenta Admin Laboratorio + cuenta Cliente demo
  npm run seed:reset-passwords # Restablece contraseñas si los usuarios ya existían en BD
  ```
  También admite flags combinables (`--documents`, `--admin`, `--client`, `--overwrite-lab`, `--admin-mail`, `--admin-password`, `--client-mail`, `--client-password`).
- **Alta o reseteo de usuario puntual ([`run-create-user.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/seeders/run-create-user.js)):**
  ```bash
  npm run create-user -- --mail admin@ctm.com --password MiClaveSegura12! --name "Admin CTM" --dni 30123456 --profile LABORATORY --role ADMIN
  npm run create-user -- --mail admin@ctm.com --password NuevaClaveSegura12! --reset-password
  ```
  Valida DNI de 8 caracteres y perfil (`CLIENT` o `LABORATORY`), verifica unicidad de email (o restablece contraseña si se pasa `--reset-password`), hashea con bcrypt cost 12, crea/asegura el registro en `persons` y vincula la membresía de laboratorio.

### 4.3. Empaquetado de Plantillas y Adaptadores Serverless
- **Sincronización de plantillas HTML (`npm run build:templates` / `postinstall`):** [`scripts/sync-templates.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/scripts/sync-templates.js) lee `fpc131.html`, `fpc132.html`, `fpc151.html`, `fpc161.html` y `static/ctm.jpg` (en Base64) y genera `src/infrastructure/templates/embeddedTemplates.js` para evitar errores `ENOENT` en funciones serverless sin sistema de archivos completo.
- **Vercel ([`vercel.json`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/vercel.json)):** Expone `src/app.js` con `maxDuration: 60`, incluye `src/infrastructure/templates/**` en el bundle y refuerza cabeceras de seguridad HTTP en el edge.
- **AWS Lambda / Serverless Framework ([`serverless.yml`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/serverless.yml) y [`src/handler.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/handler.js)):** Envuelve Express con `serverless-http` habilitando respuestas binarias `['application/pdf', 'image/*']` sobre `nodejs20.x` (1024 MB RAM, timeout 30s).

---

## 5. Suite de Pruebas Automatizadas (`tests/`)

El proyecto emplea el **test runner nativo de Node.js** (`node --test` vía `npm test`), sin dependencias externas de testing ni necesidad de conexión a PostgreSQL o Redis para las pruebas unitarias y de seguridad (ejecutadas con mocks en memoria y `NODE_TEST_CONTEXT`).

```bash
npm test
```

| Grupo / Archivo | Cobertura principal |
| :--- | :--- |
| **`tests/security/auth-cookies-csrf-jwt.security.test.js`** | Emisión de cookies `HttpOnly`, validación `Double-Submit` CSRF, verificación JWT `access`/`refresh` y revocación de sesión. |
| **`tests/security/rbac-idor-tenant.security.test.js`** | Prevención de escalada de privilegios (`switchProfile`), aislamiento multi-tenant en clientes/personas/ensayos y defensa anti-IDOR. |
| **`tests/security/idempotency-export-templates.security.test.js`** | Aislamiento por usuario en `Idempotency-Key` (bloqueo `409`, sin caché de errores `4xx/5xx`), neutralización de CSV Injection y plantillas por origen. |
| **`tests/security/delta-audit-20261117.security.test.js`** | Remediación integral de seguridad: orígenes seguros, `escapeHtml`, 2FA, reseteo de password, permisos granulares de laboratorio y cifrado AES-256-GCM. |
| **`tests/contracts/authorization.contract.test.js`** | Contratos de `requireLaboratory` y errores estandarizados `401`/`403`. |
| **`tests/contracts/error-response.contract.test.js`** | Formato uniforme `{ code, message, details? }` en `normalizeErrorResponse`. |
| **`tests/contracts/rate-limit.contract.test.js`** | Ventanas, conteo, cabecera `Retry-After` y respuesta `429` del rate limiter. |
| **`tests/contracts/scheduled-clients.contract.test.js`** | Agenda de clientes del laboratorio (`addScheduledClient`, `isClientScheduled`) incluyendo resolución desde `essays_client`. |
| **`tests/laboratory/laboratoryUsers.test.js`** | Alta de usuarios internos de laboratorio, roles (`ADMIN`, `USER`, `CONSULTA`), matriz de permisos y tokens de activación. |
| **`tests/unit/documents-on-the-fly.unit.test.js`** | Compilación Handlebars con `embeddedTemplates.js`, renderizado y seguridad en generación PDF bajo demanda. |
| **`tests/unit/essay_client_persistence.test.js`** | Serialización y persistencia segura de `EssayClient` (representantes y snapshots). |
| **`tests/unit/essay_create_contract.test.js`** | Creación de contrato `F-PC13-02` y retorno de metadata sin errores de referencia. |
| **`tests/unit/essay_notifications.test.js`** | Preferencia `clientNotificationsEnabled`, envío de alertas y desuscripción por token. |
| **`tests/validation/business-application-service.validation.test.js`** | Validaciones de CUIT, alta manual, sincronización con padrón y normalización de direcciones. |
| **`tests/validation/domain.validation.test.js`** | Reglas de entidades de dominio (`Person`, `Client`, etc.). |
| **`tests/validation/dto.validation.test.js`** | Validaciones de entrada de los DTOs (`CreateClientDTO`, etc.). |
| **`tests/CanonicalJson.test.js`** | Determinismo de serialización JSON canónica (RFC 8785 / JCS). |
| **`tests/SnapshotCryptoService.test.js`** | Hash SHA-256 canónico, firma y detección de manipulación (*tampering*). |
| **`tests/SnapshotApplicationService.test.js`** | Versionado secuencial de snapshots y verificación de integridad. |
| **`tests/OpenTimestampsService.test.js`** | Encabezado binario mágico oficial y construcción/parseo de pruebas `.ots`. |
| **`tests/SecurityAuditIntegrity.test.js`** | Extracción de dispositivo, redacción de secretos y firmado criptográfico en `SecurityAuditService`. |
| **`tests/DeviceInfo.test.js`** | Extracción unificada de IP, User-Agent, `deviceId`, `deviceFingerprint` y `sessionId`. |
| **`tests/passwordResetService.test.js`** | Flujo completo de `PasswordResetService` (OTP, enlace, expiración, límite de intentos y revocación). |
| **`tests/user_account_and_2fa.test.js`** | Parser de clientes (`parseClientName`), setup/verificación TOTP, códigos de recuperación y dispositivos de confianza. |
| **`tests/unit/base-seeder.unit.test.js`** | Catálogo de 249 países y 24 provincias, formaldehído IT17-01, datos ficticios lab, flags globales/granulares y reset de contraseñas. |

---

## 6. Registro de Incidencias Detectadas y Resueltas Durante el Desarrollo (`Módulo IV.pdf`)

Durante la construcción y las auditorías continuas de seguridad y contratos se detectaron y resolvieron incidencias clave antes de su pase a producción:

| Problema encontrado | Fecha / Referencia | Módulo afectado | Responsable | Solución aplicada |
| :--- | :--- | :--- | :--- | :--- |
| Riesgo de colisión concurrente al asignar códigos correlativos diarios de ensayos y órdenes de trabajo. | 2026-11 (`20261112000000`) | Ensayos y Órdenes de Trabajo | Arquitectura / DB | Creación de tabla atómica `daily_sequence_counters` con clave `(scope, date_key)` y respaldo `pg_advisory_xact_lock` + sufijo `sequenceNumberToLetters`. |
| Clientes originados desde snapshots `essays_client` con ID no UUID fallaban al consultar o agendar en agenda compartida. | 2026-11 | Clientes y Agenda de Laboratorio | Backend / QA | Respaldo de búsqueda por CUIT en `isClientScheduled` / `addScheduledClient` y verificación compartida entre miembros activos del laboratorio (`scheduled-clients.contract.test.js`). |
| Llamadas SOAP hacia WSAA / Padrón A13 de ARCA (cuando el autocompletado auxiliar está habilitado) dentro de transacciones SQL bloqueaban conexiones PostgreSQL ante latencias externas. | 2026-11 | Empresas y Autocompletado Opcional ARCA | Arquitectura Backend | Ejecución de consultas auxiliares ARCA fuera de `withTransaction`, caché TA en dos niveles y autonomía del alta manual cuando ARCA no está activo. |
| Posibilidad de *CSV Injection* al abrir reportes `.csv` o `.xlsx` en Excel con celdas iniciando en `=`, `+`, `-`, `@`. | 2026-11 | Exportación de Reportes | Seguridad / Backend | Incorporación de `sanitizeFormulaValue` en `essaySpreadsheetExport.js` y validado en `idempotency-export-templates.security.test.js`. |
| Cacheo de respuestas fallidas `4xx`/`5xx` o colisión de claves `Idempotency-Key` entre distintos usuarios. | 2026-11 | Middlewares HTTP | Seguridad / Infra | Aislamiento estricto de clave por `userId` en `idempotency.js`, bloqueo `409 IDEMPOTENCY_IN_PROGRESS` y almacenamiento exclusivo de respuestas `2xx`. |
| Hallazgos integrales de hardening: validación de orígenes CSRF/redirect, escape HTML en templates/correos, 2FA, reseteo de password y permisos granulares de laboratorio. | 2026-11-17 (`delta-audit-20261117`) | Seguridad, Auth, Lab y PDFs | Seguridad / Equipo completo | Remediación integral cubriendo `isOriginAllowed`, `resolveSafeFrontendUrl`, `escapeHtml`, `laboratory_permissions`, AES-256-GCM y pruebas dedicadas en `delta-audit-20261117.security.test.js`. |
| Error de referencia en retorno de metadata al crear contrato `F-PC13-02` y validaciones de preferencias de notificación. | 2026-11 | Ensayos y Notificaciones | Backend / QA | Corrección de contratos verificada con `essay_create_contract.test.js` y `essay_notifications.test.js`. |

---

## 7. Demostración Funcional Interna y Validación Integral

Antes del cierre de versión (`v1.2.0`), el equipo validó íntegramente el funcionamiento del sistema mediante verificación automatizada y revisión funcional cruzada:

- **Flujo completo principal verificado:** Registro/verificación de email y login con cookies `HttpOnly` + CSRF (`2FA` opcional) → Alta manual de empresa/cliente (o mediante autocompletado auxiliar opcional ARCA A13 si está habilitado) → Creación de solicitud `F-PC13-02` con código diario atómico → Presupuesto `essays_terms` y aceptación del cliente → Recepción de muestras y generación de Orden de Trabajo `F-PC13-03` → Carga de mediciones analíticas y promedio → Emisión de Informe Oficial `F-PC13-01` (con mínimo de 2 muestras) + snapshot firmado `RSA-SHA256` / OpenTimestamps + exportación CSV/XLSX.
- **Módulos conectados verificados:** Integración consistente entre capas `presentation` → `application` → `domain` → `infrastructure` (PostgreSQL/Neon, Redis/fallback RAM, R2/storage local, Resend y Chromium/Puppeteer aislado de red externa).
- **Datos de prueba y estabilidad:** La ejecución completa de `node --test` (`npm test`) aprueba los **94 de 94 subtests** en **25 archivos de prueba** (`0` fallos, `0` omitidos), cubriendo seguridad, contratos HTTP, validaciones DTO/dominio, criptografía, seedeo y generación PDF bajo demanda.
