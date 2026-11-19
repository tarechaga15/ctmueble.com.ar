# Contratos frontend-backend

Este documento define el contrato de integración entre frontend (`oficina.ctmueble.com.ar`) y backend (`gestion.ctmueble.com.ar`).

## 1) Convenciones globales

### 1.1 Base URL, observabilidad y versionado

- **Base URL:** la configurada por ambiente (`dev`, `staging`, `prod`).
- **Versionado actual:** sin prefijo `/v1`; los cambios breaking deben comunicarse en release notes y, de ser necesario, versionarse por ruta.
- **Health & Readiness (públicos, sin autenticación):**
  - `GET /health` → `200 { status: "ok", timestamp }`
  - `GET /ready` → `200 { status: "ready", db: "up", redis: "configured" | "disabled" }` o `503 { code: "SERVICE_UNAVAILABLE", message }`

### 1.2 Autenticación, cookies, cabeceras y CSRF

- **Producción (`NODE_ENV=production`):** Autenticación mediante cookies `HttpOnly` (`ctm_at`, `ctm_rt`) emitidas al hacer login/registro/refresh. No se acepta `?access_token=` por query string.
- **Desarrollo (`NODE_ENV=development`):** Se aceptan cookies `HttpOnly` **y** `Authorization: Bearer <token>`.
- **Cabeceras de seguridad e integración:**
  - `X-CSRF-Token`: obligatorio en `POST`, `PUT` y `DELETE` cuando la sesión se autentica por cookie (`ctm_csrf` == `X-CSRF-Token`).
  - `Idempotency-Key` *(opcional, máx. 128 chars)*: soportada en `POST` y `PUT` autenticados para evitar duplicados (`X-Idempotent-Replayed: true` en repetición, `409 IDEMPOTENCY_IN_PROGRESS` si hay concurrencia).
  - `X-Device-Id` / `X-Device-Fingerprint` *(opcionales)*: huella del navegador para dispositivos de confianza (bypass 2FA de 7 días) y auditoría de seguridad/ensayos.
  - `X-Request-Id` *(opcional, 8–64 chars `[a-zA-Z0-9._-]`) *: identificador de correlación propagado en respuesta y logs.
- **Autorización por perfil y rol:**
  - Rutas restringidas con `requireLaboratory` exigen `profile === 'LABORATORY'`.
  - Operaciones sensibles internas aplican además `requireLabPermission('<modulo.accion>')` (ej. `essays.estados`, `essays.informes`, `muestras.recepcionar`, `ordenes.ensayar`, `ordenes.cerrar`, `configuracion.env`, `configuracion.mailing`) y/o verificación de superadmin.

### 1.3 Formato de errores (estándar)

Toda respuesta con `status >= 400` responde normalizada por `normalizeErrorResponse`:

```json
{
  "code": "BAD_REQUEST",
  "message": "Solicitud inválida",
  "details": {}
}
```

- `code`: string técnico estable.
- `message`: texto legible para UI (sanitizado ante errores internos/SQL).
- `details`: opcional, contexto adicional cuando corresponde.

### 1.4 Rate limiting

- Global: `180 req/min` por IP (`GLOBAL_RATE_LIMIT`).
- `/auth`: registro (`10/15m`), login (`15/15m`), refresh (`40/15m`), 2FA/verificación/password-reset (`20/15m`).
- Descarga de documentos: `GET /essays/download-document` y `/download-document-by-type` (`60/10m` por usuario, `DOWNLOAD_RATE_LIMIT`).
- Generación PDF en `/essays` (`25/10m` por IP, `PDF_RATE_LIMIT`) y en `/samples` (`15/5m` por usuario, `PDF_GENERATION_RATE_LIMIT`).
- Exportación `/essays/export`: `20/5m` por IP (`EXPORT_RATE_LIMIT`).
- Padrón ARCA auxiliar opcional para autocompletar clientes (`/bussiness/sync/`, `/bussiness/padron/`, `/clients/padron/:cuit`): `30/10m` por usuario (`PADRON_RATE_LIMIT`). Su activación no es obligatoria para operar manualmente.
- Error al exceder: `429` con cabecera `Retry-After` y código de rate limit.

### 1.5 Content-Type

- Requests JSON: `Content-Type: application/json` (límite de payload `100kb`).
- Descarga de documentos/exportaciones: binario `application/pdf`, `text/csv; charset=utf-8`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` o `application/octet-stream` (`.ots`) con `Content-Disposition: attachment`.

---

## 2) Contratos por módulo

### 2.1 Auth (`/auth`)

| Método | Endpoint | Auth / Seguridad | Request (params/body) | Response OK |
|---|---|---|---|---|
| `POST` | `/register` | Pública + RL | Body: `{ mail, password, data? }` | `201` `{ msg, user, csrf_token, ... }` |
| `POST` | `/login` | Pública + RL | Body: `{ mail, password, deviceId?, deviceFingerprint?, rememberMe? }` | `200` sesión o `{ requires2FA: true, method, tempToken, emailMasked }` |
| `POST` | `/logout` | CSRF cookie | Cookies o body (dev) | `200` `{ msg, user }` |
| `POST` | `/refresh_token` | CSRF cookie + RL | Cookie `ctm_rt` o body `{ refreshToken }` (dev) | `200` `{ msg, csrf_token, user, ... }` |
| `GET` | `/session` | JWT | — | `200` `{ authenticated: true, user, csrf_token }` |
| `POST` | `/2fa/verify` | Pública + RL | Body: `{ tempToken, code, isRecoveryCode?, trustDevice?, deviceId?, deviceFingerprint?, rememberMe? }` | `200` `{ msg, user, csrf_token, ... }` |
| `POST` | `/2fa/resend` | Pública + RL | Body: `{ tempToken }` | `200` `{ success: true, message }` |
| `GET` | `/mailing-status` | Pública | — | `200` `{ mailingRequired: boolean }` |
| `POST` | `/send-verification` | Pública + RL | Body: `{ mail?, name?, frontendUrl? }` | `200` `{ mailingRequired, verified, mail?, expiresAt? }` |
| `POST` | `/verify-otp` | Pública + RL | Body: `{ mail?, otpCode, newPassword? }` | `200` `{ success: true, verified: true, mail, passwordUpdated }` |
| `GET` / `POST` | `/verify-link` | Pública + RL | Query o Body: `{ token, mail?, newPassword? }` | `200` `{ success: true, verified: true, mail, passwordUpdated }` |
| `POST` | `/forgot-password` | Pública + RL | Body: `{ mail, frontendUrl? }` | `200` `{ success: true, message }` |
| `POST` | `/verify-reset-code` | Pública + RL | Body: `{ token }` o `{ mail, otpCode }` | `200` `{ valid: true, mail }` |
| `POST` | `/reset-password` | Pública + RL | Body: `{ newPassword, token }` o `{ newPassword, mail, otpCode }` | `200` `{ success: true, message }` |

### 2.2 Users (`/users`) [JWT + CSRF + Idempotency]

| Método | Endpoint | Auth / Seguridad | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/get` | JWT | — | `200` usuario autenticado |
| `GET` | `/get_data` | JWT | — | `200` datos de cliente/usuario |
| `PUT` | `/update_data` | JWT | Body: objeto perfil | `200` datos actualizados |
| `PUT` | `/switch_profile` | JWT | Body: `{ profile }` | `200` perfil actualizado |
| `GET` | `/fetch_user_laboratories` | JWT | — | `200` lista de laboratorios |
| `PUT` | `/switch_laboratory` | JWT | Body: `{ laboratory }` | `200` `{ success }` |
| `PUT` | `/change-password` | JWT | Body: `{ currentPassword, newPassword, confirmPassword }` | `200` resultado cambio |
| `GET` | `/2fa/status` | JWT | — | `200` estado y método 2FA |
| `POST` | `/2fa/email/setup` | JWT | — | `200` envío de OTP de prueba |
| `POST` | `/2fa/email/confirm` | JWT | Body: `{ otpCode }` | `200` `{ ..., recoveryCodes }` |
| `POST` | `/2fa/totp/setup` | JWT | — | `200` `{ secret, otpauthUrl, qrCodeDataUrl }` |
| `POST` | `/2fa/totp/confirm` | JWT | Body: `{ code }` | `200` `{ ..., recoveryCodes }` |
| `POST` | `/2fa/disable` | JWT | Body: `{ password }` | `200` confirmación |
| `GET` | `/2fa/recovery-codes` | JWT | — | `200` cantidad códigos disponibles |
| `POST` | `/2fa/recovery-codes/generate` | JWT | Body: `{ password }` | `200` lote de 8 códigos |
| `GET` | `/trusted-devices` | JWT | — | `200` lista dispositivos de confianza |
| `DELETE` | `/trusted-devices/all` | JWT | — | `200` `{ success: true, count }` |
| `DELETE` | `/trusted-devices/:id` | JWT | Path: `id` | `200` `{ success: true }` |
| `GET` | `/sessions` | JWT | — | `200` sesiones activas |
| `DELETE` | `/sessions/other` | JWT | — | `200` `{ success: true, count }` |
| `DELETE` | `/sessions/:id` | JWT | Path: `id` | `200` `{ success: true }` |

### 2.3 Laboratory Users (`/laboratory/users` y `/users/laboratory`) [JWT + LABORATORY + Superadmin]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/` | JWT + LAB + Superadmin | — | `200` nómina de usuarios del laboratorio |
| `POST` | `/` | JWT + LAB + Superadmin | Body: `{ nombreCompleto, dni, email, rol, telefono? }` | `201` usuario creado e invitado |
| `PUT` | `/:id` | JWT + LAB + Superadmin | Path: `id`; Body: `{ nombreCompleto?, dni?, rol?, activo? }` | `200` usuario actualizado |
| `POST` | `/:id/resetear-password` | JWT + LAB + Superadmin | Path: `id`; Body: `{ password }` | `200` confirmación |
| `POST` | `/:id/reenviar-activacion` | JWT + LAB + Superadmin | Path: `id` | `200` activación reenviada |
| `GET` | `/permissions` | JWT + LAB + Superadmin | — | `200` catálogo y matriz de permisos |
| `PUT` | `/permissions` | JWT + LAB + Superadmin | Body: `{ items }` | `200` matriz actualizada |

### 2.4 API Keys y Mailing (`/api-keys`) [JWT + LABORATORY]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/status` | JWT + LAB | Query opcional: `service` (default `MAILING`) | `200` estado público + `keyHint` |
| `POST` | `/` | JWT + LAB + `configuracion.mailing` | Body: `{ service?, provider?, name?, apiKey?, metadata? }` | `201` o `200` (solo metadata) |
| `POST` | `/test-mailing` | JWT + LAB + `configuracion.mailing` | Body: `{ to? }` | `200` confirmación envío prueba |
| `DELETE` | `/:id` | JWT + LAB + `configuracion.mailing` | Path: `id` | `200` `{ message }` |

### 2.5 Clients (`/clients`) [JWT]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/fetch` | JWT | — | `200` `Client[]` |
| `GET` | `/get` | JWT | Query: `id` | `200` `Client` |
| `GET` | `/search` | JWT | Query: `search` (alias: `term`, `name`, `cuit`) | `200` `Client[]` |
| `GET` | `/search-by-business` | JWT | Query: `search` | `200` `Client[]` |
| `GET` | `/scheduled` | JWT + LAB | — | `200` `Client[]` agendados |
| `GET` | `/scheduled/check` | JWT + LAB | Query: `clientId`/`id` o `cuit`, `contactId?` | `200` `{ scheduled, clientId, isContactLinked }` |
| `POST` | `/scheduled` | JWT + LAB (no `CONSULTA`) | Body: `{ clientId?, cuit?, contactId?, ... }` | `201` `{ success: true, client }` |
| `POST` | `/create` | JWT (no `CONSULTA`) | Body: `CreateClientDTO` | `200` `Client` |
| `POST` | `/get-or-create-for-essay` | JWT | Body: `{ id? / clientId? }` o `CreateClientDTO` | `200` `Client` |
| `PUT` | `/update` | JWT (no `CONSULTA`) | Query: `id`; Body: `UpdateClientDTO` | `200` `Client` |
| `DELETE` | `/delete` | JWT (no `CONSULTA`) | Query: `id` | `200` resultado eliminación |
| `GET` | `/padron/:cuit` | JWT + RL | Path: `cuit` | `200` autocompletado auxiliar ARCA (si habilitado) o `null` |
| `GET` | `/:clientId/contacts` / `/contacts` | JWT | Path/Query: `clientId` | `200` `Person[]` |
| `POST` | `/:clientId/contacts` / `/contacts` | JWT (no `CONSULTA`) | Path/Query: `clientId`; Body: `{ contactId }` o persona | `201` `Person[]` |
| `DELETE` | `/:clientId/contacts` / `/contacts` | JWT (no `CONSULTA`) | Path/Query: `clientId`, `contactId`/`personId` | `200` `{ success: true }` |

### 2.6 Business (`/bussiness`) [JWT]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/get/` | JWT | Query: `cuit` | `200` `Business { cuit, name, source, addresses[] }` |
| `POST` | `/manual/` | JWT | Body: `{ cuit, name }` | `200` `Business` creada manualmente (no requiere ARCA) |
| `POST` | `/sync/` | JWT + RL | Query: `cuit` | `200` `Business` autocompletada (requiere ARCA habilitado) |
| `GET` | `/padron/` | JWT + RL | Query: `cuit` | `200` datos auxiliares padrón (si ARCA está habilitado) |
| `GET` | `/addresses/` | JWT | Query: `cuit` | `200` `Address[]` |
| `POST` | `/addresses/` | JWT | Query: `cuit`; Body: `{ address, location, province, district? }` | `200` address creada |
| `PUT` | `/addresses/` | JWT | Query: `id`; Body: `{ address?, location?, province?, district? }` | `200` address actualizada |
| `DELETE` | `/addresses/` | JWT | Query: `id` | `200` `{ success: true }` |
| `GET` | `/representatives/` | JWT | Query: `cuit` | `200` representantes |
| `GET` | `/for-essay/` | JWT | Query: `cuit` | `200` empresa expandida para ensayo |

### 2.7 Persons (`/persons`) [JWT]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/me` | JWT | — | `200` `Person` del usuario autenticado |
| `GET` | `/get` | JWT | Query: `id` | `200` `Person` |
| `GET` | `/fetch` | JWT | — | `200` `Person[]` |
| `GET` | `/search-available` / `/search` | JWT | Query: `search` (alias: `term`, `q`) | `200` `Person[]` |
| `GET` | `/by-client/:clientId` | JWT | Path: `clientId` | `200` `Person[]` |
| `POST` | `/create` | JWT | Body: `CreatePersonDTO` | `200` `Person` |
| `PUT` | `/update` | JWT | Body: `{ id, data }` | `200` `Person` actualizada |
| `POST` | `/link` | JWT | Body: `{ personId, clientId }` | `200` `{ success: true }` |
| `POST` | `/unlink` | JWT | Body: `{ personId, clientId }` | `200` `{ success: true }` |

### 2.8 Essays (`/essays`)

| Método | Endpoint | Auth / Permiso | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/get` | JWT | Query: `id` | `200` `Essay` |
| `GET` | `/fetch` | JWT | Query: `code`, `status`, `dateFrom`, `dateTo`, `limit?`, `offset?` | `200` `Essay[]` |
| `GET` | `/export/count` | JWT | Query filtros | `200` `{ count }` |
| `GET` | `/export` | JWT + RL | Query: `format=csv|xlsx` + filtros | `200` archivo `.csv` o `.xlsx` |
| `POST` | `/create` | JWT + RL | Body: `CreateEssayDTO` | `200` `Essay` |
| `PUT` | `/:id/client` | JWT | Path: `id`; Body snapshot cliente | `200` `Essay` |
| `GET` | `/download-document` | JWT + RL | Query: `id` | `200` archivo PDF/stream |
| `GET` | `/download-document-by-type` | JWT + RL | Query: `essayId`, `type` (`typeCode`) | `200` archivo PDF/stream |
| `GET` | `/debug/generate-document` | JWT + LAB + RL | Query: `form`, `id` | `200` PDF preview |
| `POST` | `/procedure/actions` | JWT (no `CONSULTA`) | Query: `id`; Body: `{ action, observations?, reason? }` | `200` `Essay` o resultado reemisión |
| `POST` | `/generate-contract` | JWT + LAB + `essays.estados` + RL | Body: `SetTermsDTO` + `id` | `200` `{ id, documentId, essayId, typeCode, filename }` |
| `GET` | `/get-types` | JWT | — | `200` catálogo tipos ensayo |
| `POST` | `/samples/load` | JWT + LAB + `muestras.recepcionar` + RL | Query: `id`; Body: `LoadSamplesDTO` | `200` muestras |
| `GET` | `/samples/get` | JWT + LAB | Query: `id` | `200` muestras |
| `POST` | `/samples/load-result` | JWT + LAB + `ordenes.ensayar` | Body: `LoadSampleResultsDTO` | `200` muestras actualizadas |
| `GET` | `/audit-logs` | JWT | Query: `id` | `200` auditoría ensayo |
| `POST` | `/emit-report` | JWT + LAB + `essays.informes` + RL | Body/Query/Params: `id` | `200` `{ id, documentId, filename, url? }` |
| `GET` | `/element-templates` | JWT | — | `200` plantillas |
| `POST` | `/element-templates` | JWT | Body: `CreateEssayElementTemplateDTO` | `201` plantilla creada |
| `DELETE` | `/element-templates/:id` | JWT | Path: `id` | `200` `{ deleted }` |
| `GET` | `/:id/snapshots` / `/snapshots` | JWT | Path o Query: `id` | `200` snapshots del ensayo |
| `GET` | `/snapshots/:snapshotId/verify` | JWT | Path: `snapshotId` | `200` verificación firma, hash y OTS |
| `GET` | `/snapshots/:snapshotId/ots-proof` | JWT | Path: `snapshotId` | `200` descarga binaria `.ots` |
| `POST` | `/:id/reissue-request` / `/reissue-request` | JWT + RL | Path/Query/Body: `id`, `reason?` | `200` `{ message, essay, document, snapshot }` |
| `PUT` | `/:id/notifications` | JWT | Path: `id`; Body: `{ enabled: boolean }` | `200` `Essay` actualizado |
| `GET` / `POST` | `/:id/unsubscribe` y `/notifications/unsubscribe` | Pública (por token) | Param/Query/Body: `essayId`, `token`, `confirm?` | `200` resultado de baja |

### 2.9 Samples (`/samples`) [JWT + LABORATORY]

| Método | Endpoint | Auth / Permiso | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/fetch` | JWT + LAB | Query: `code`, `status` | `200` órdenes de trabajo |
| `GET` | `/get` | JWT + LAB | Query: `id` | `200` orden de trabajo |
| `POST` | `/receive-samples` | JWT + LAB + `muestras.recepcionar` + RL | Body: `ReceiveSamplesDTO` | `200` recepción/cancelación |
| `GET` | `/:id/samples` | JWT + LAB | Path: `id` | `200` muestras de orden |
| `POST` | `/:id/close-and-emit-report` | JWT + LAB + `ordenes.cerrar` + RL | Path: `id` | `200` `{ id, documentId, filename, url? }` |
| `GET` | `/:id/audit-logs` | JWT + LAB | Path: `id` | `200` auditoría orden |

### 2.10 Env (`/env`) [JWT + LABORATORY + `configuracion.env`]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/fetch` | JWT + LAB + `configuracion.env` | Query opcional: `mode=DATA` | `200` variables entorno |
| `GET` | `/get` | JWT + LAB + `configuracion.env` | Query: `id` | `200` variable |
| `PUT` | `/update` | JWT + LAB + `configuracion.env` | Query: `id`; Body: `{ value }` | `200` variable actualizada |
| `POST` | `/add` | JWT + LAB + `configuracion.env` | Body: `{ id, label, type, value }` | `200` variable creada |
| `DELETE` | `/delete` | JWT + LAB + `configuracion.env` | Query: `id` | `200` `true` |

### 2.11 Types (`/types`) [JWT]

| Método | Endpoint | Auth | Request (params/body) | Response OK |
|---|---|---|---|---|
| `GET` | `/essays` | JWT | — | `200` tipos ensayo |
| `POST` | `/essays` | JWT + LAB | Body: `{ name }` | `201` / `200` tipo ensayo |
| `GET` | `/countries` | JWT | — | `200` países |
| `GET` | `/districts` | JWT | — | `200` distritos |

---

## 3) Contratos de datos principales (DTOs de referencia)

| DTO | Estructura resumida |
|---|---|
| `BusinessResponse` | `{ cuit, name, source, addresses[] }` |
| `ClientResponse` | `{ id, cuit, name, representative, contact, contacts[], address, origin, user, billing }` |
| `PersonResponse` | `{ id, name, dni, address, phone: { country_code, phone }, mail, location, district, country, userId, origin, isThirdParty }` |
| `Error` | `{ code, message, details? }` |

La definición detallada de schemas y ejemplos vive en [`src/config/swagger.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/config/swagger.js).

## 4) Reglas de compatibilidad frontend-backend

- No eliminar campos de respuesta existentes sin deprecación.
- Para campos nuevos, mantenerlos opcionales inicialmente.
- Breaking changes deben anunciarse y coordinarse con frontend.
- Swagger debe actualizarse en el mismo cambio cuando se modifica contrato.

## 5) Fuente oficial

- Implementación real de rutas: [`src/presentation/routes/`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/private.js) y [`src/app.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/app.js).
- Contrato documentado y ejemplos: [`src/config/swagger.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/config/swagger.js).
- Seguridad, middlewares y permisos: [`docs/SEGURIDAD_PERMISOS_Y_AUDITORIA.md`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/docs/SEGURIDAD_PERMISOS_Y_AUDITORIA.md) y [`docs/MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/docs/MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md).
