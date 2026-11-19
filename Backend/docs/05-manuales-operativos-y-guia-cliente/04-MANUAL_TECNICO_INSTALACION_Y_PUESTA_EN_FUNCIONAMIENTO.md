# Manual Técnico — Instalación y Puesta en Funcionamiento del Sistema CTM

Este manual describe la arquitectura desplegada, los requisitos previos, las variables de entorno, la inicialización de base de datos, los pasos de instalación local y despliegue en producción, la verificación operativa y las tareas de mantenimiento del sistema del **Centro Tecnológico del Mueble (CTM)**: backend **`gestion.ctmueble.com.ar`** y frontend SPA **`oficina.ctmueble.com.ar`**.

---

## Capítulo 1 — Arquitectura General y Topología de Despliegue

El sistema adopta una arquitectura web cliente/servidor desacoplada basada en API REST serverless en **Node.js / Express 5** y aplicación SPA en **React 19 + Vite**.

```mermaid
flowchart LR
    USER(["Navegador Web<br/>Cliente o Laboratorio"]) --> FE["Frontend SPA React 19 + Vite<br/>oficina.ctmueble.com.ar<br/>(Cookies HttpOnly + CSRF)"]
    FE -- "HTTPS REST + X-CSRF-Token" --> API["Backend API Express 5<br/>gestion.ctmueble.com.ar<br/>(Vercel / Serverless / Node)"]

    API --> DB[("Neon PostgreSQL 17<br/>Endpoint -pooler + SSL<br/>34 tablas · Sequelize + Umzug")]
    API --> R2["Cloudflare R2 (S3)<br/>o STORAGE_DIR local<br/>(PDFs F-PC13/15/16)"]
    API --> REDIS[("Redis TLS / RAM Fallback<br/>Rate Limit, Idempotencia<br/>y Revocación JWT")]
    API --> CRYPTO["Módulo Criptográfico<br/>AES-256-GCM / KMS Envelope<br/>RSA-SHA256 + OpenTimestamps"]
    CRYPTO -. "Pruebas .ots opcionales" .-> OTS["Calendarios OpenTimestamps"]
    API -- "API Key cifrada en BD" --> RESEND["Resend API<br/>Emails 2FA, Invitaciones<br/>y Notificaciones"]
    API -. "Auxiliar OPCIONAL<br/>(No requerido)" .-> ARCA["ARCA / AFIP WSAA<br/>ws_sr_padron_a13<br/>Autocompletado CUIT"]
```

### Componentes principales

| Componente | Tecnología / Repositorio | Responsabilidad |
| :--- | :--- | :--- |
| **Backend API (`gestion.ctmueble.com.ar`)** | Node.js ≥ 18 (`nodejs20.x`), Express `5.1.0`, Arquitectura DDD en capas (`domain`, `application`, `infrastructure`, `presentation`, `shared`). | Autenticación JWT/2FA, máquina de estados SGC, códigos diarios atómicos, generación PDF on-the-fly (`Puppeteer + Handlebars`), exportación CSV/XLSX y auditoría criptográfica. |
| **Frontend SPA (`oficina.ctmueble.com.ar`)** | React `19.2.0`, Vite `7.2.2`, Tailwind CSS `4.1.17`, React Router `7.9.5`, Axios `1.13.2`. | Portal web diferenciado para clientes (`CLIENT`) y personal interno (`LABORATORY`), manejo automático de cookies `HttpOnly` y cabecera `X-CSRF-Token`. |
| **Base de Datos** | PostgreSQL (Neon administrado en producción con endpoint `-pooler`), Sequelize `6.37.8`, `pg` `8.18.0` y Umzug `3.5.1`. | Persistencia ACID de las 34 tablas del esquema, secuencias atómicas y trazabilidad histórica (`snapshots`). |
| **Almacenamiento PDF** | Cloudflare R2 (`@aws-sdk/client-s3`) con fallback local (`STORAGE_DIR`). | Resguardo de copias emitidas cuando se habilita almacenamiento en nube o disco. |
| **Caché y Seguridad HTTP** | Redis (`ioredis`) con fallback automático en memoria RAM en desarrollo. | Idempotencia (`Idempotency-Key`), 10 limitadores de tasa (`rateLimit`) y revocación inmediata de sesiones JWT. |
| **Notificaciones y Correo** | Resend (`https://api.resend.com/emails`) configurado dinámicamente desde la tabla cifrada `system_api_keys` (`/api-keys`). | Verificación de cuentas, códigos 2FA por email, invitaciones de laboratorio y avisos de estado de ensayos. |
| **Autocompletado ARCA (Opcional)** | WSAA + `ws_sr_padron_a13` (`ArcaConnection`, `PadronService`). | **Exclusivamente auxiliar** para autocompletar razón social y domicilio por CUIT. **No es necesario activarlo** para operar el sistema. |

---

## Capítulo 2 — Requisitos Previos de Software, Infraestructura y Cuentas

### 2.1. Software en entorno local / servidor de compilación

| Requisito | Versión / Detalle recomendado | Uso |
| :--- | :--- | :--- |
| **Node.js** | ≥ `18.x` (recomendado `20.x` LTS, alineado con `serverless.yml`) | Ejecución del backend, frontend Vite, scripts CLI, migraciones, seeders y `node --test`. |
| **npm** | ≥ `9.x` | Instalación de dependencias (`npm install`) y ejecución de scripts. |
| **Git** | Actualizado | Control de versiones y clonado de ambos repositorios. |
| **PostgreSQL** | Local `15+`/`17` o cuenta **Neon PostgreSQL** | Base de datos relacional (34 tablas). |
| **Chromium / Chrome** | Incluido en `devDependencies` vía `puppeteer` para desarrollo/docs, y `@sparticuz/chromium` en serverless | Generación de PDFs de ensayos (`F-PC13/15/16`) y compilación de documentación (`build:docs-pdf`). |

> [!NOTE]
> En Windows PowerShell, si la directiva de ejecución restringe scripts `.ps1`, utilice `npm.cmd <script>` (por ejemplo `npm.cmd test`, `npm.cmd run seed`) o ejecute directamente `node ...`.

### 2.2. Cuentas y servicios cloud (para staging / producción)

- **Vercel:** Alojamiento serverless del backend (`gestion.ctmueble.com.ar` mediante `vercel.json`) y despliegue estático del frontend (`oficina.ctmueble.com.ar`).
- **Neon PostgreSQL:** Base de datos serverless con endpoint pooled (`-pooler`) y SSL habilitado.
- **Cloudflare R2 (opcional en local, recomendado en producción):** Bucket S3-compatible para resguardo persistente de PDFs cuando no hay disco escribible en serverless.
- **Redis (opcional en local, recomendado en producción):** Instancia Redis administrada (Upstash / Redis Cloud) para coordinar rate limiting, idempotencia y revocación de JWT entre invocaciones serverless.
- **Resend (cuando se requiera envío real de emails):** API Key cargada de forma segura desde la aplicación en `/api-keys` (cifrada con `MASTER_ENCRYPTION_KEY_V1` o KMS).
- **AWS KMS (opcional):** Solo si se activa Envelope Encryption (`USE_KMS_ENVELOPE=true` + `KMS_KEY_ARN`).
- **ARCA / AFIP (opcional, no requerido):** Solo si se desea habilitar el autocompletado auxiliar de datos fiscales al cargar clientes por CUIT.

---

## Capítulo 3 — Instalación Paso a Paso del Backend (`gestion.ctmueble.com.ar`)

### 3.1. Clonar e instalar dependencias

```bash
git clone <url-repositorio-gestion.ctmueble.com.ar>
cd gestion.ctmueble.com.ar
npm install
```

> [!NOTE]
> Al finalizar `npm install`, el hook `postinstall` ejecuta automáticamente `node scripts/sync-templates.js` (`npm run build:templates`) para embeber las plantillas HTML oficiales y el logo del laboratorio en `src/infrastructure/templates/embeddedTemplates.js`.

### 3.2. Estructura de directorios DDD del backend

```text
gestion.ctmueble.com.ar/
├── config/                    # Configuración auxiliar Sequelize CLI
├── docs/                      # Documentación modular, pdf-config.json y salidas PDF
├── scripts/
│   ├── sync-templates.js      # Empaquetado Base64/JS de plantillas HTML de formularios
│   └── build-docs-pdf.js      # Generador consolidado de .md y PDFs con carátula/paleta
├── src/
│   ├── app.js                 # Bootstrap Express 5, CORS, middlewares, rutas y /health
│   ├── handler.js             # Adaptador serverless-http para AWS Lambda
│   ├── domain/                # Entidades puras, Value Objects y reglas de negocio
│   ├── application/           # Servicios de aplicación, DTOs, seguridad y exportador XLSX/CSV
│   ├── infrastructure/        # Sequelize, migraciones Umzug, seeders, R2, Redis, mailing, PDF, ARCA
│   ├── presentation/          # Rutas Express, controladores y middlewares (JWT, CSRF, rate limit)
│   └── shared/                # serviceFactory.js, contenedor DI y utilidades SQL seguras
├── tests/                     # 25 suites automatizadas con node --test (94 subtests)
├── package.json
└── vercel.json                # Configuración de despliegue serverless en Vercel
```

---

## Capítulo 4 — Configuración Detallada de Variables de Entorno (`.env`)

Cree un archivo `.env` en la raíz de `gestion.ctmueble.com.ar` (en desarrollo local `src/app.js` lo carga automáticamente; en Vercel/producción se definen en el panel de Environment Variables).

### 4.1. Servidor, entorno y Swagger

| Variable | Obligatoria | Ejemplo / Default | Descripción |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3000` | Puerto HTTP en ejecución Node persistente. |
| `NODE_ENV` | Sí (prod) | `development` / `production` | Activa validaciones estrictas de secretos, cookies seguras y ocultamiento de errores. |
| `ENABLE_SWAGGER` | No | `false` | Permite habilitar `/api-docs` en producción (en no-producción está activo por defecto tras JWT + `LABORATORY`). |

### 4.2. Base de datos PostgreSQL / Neon

| Variable | Obligatoria | Ejemplo / Default | Descripción |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Sí** | `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` | Cadena de conexión PostgreSQL. En Neon productivo debe apuntar al endpoint `-pooler`. |
| `DB_SSL` | No | `true` (remoto) / `false` (localhost) | Fuerza activar o desactivar SSL explícitamente. |
| `DB_SSL_REJECT_UNAUTHORIZED` | No | `true` | Valida certificado TLS del servidor PostgreSQL. |
| `DB_POOL_MAX` | No | `2` (serverless) / `10` (local) | Tamaño máximo de conexiones en el pool Sequelize. |
| `DB_LOGGING` | No | `false` | Con `true` imprime consultas SQL en consola (solo usar en depuración local). |
| `DB_STATEMENT_TIMEOUT_MS` | No | `15000` | Timeout de sentencia en milisegundos. |
| `DB_IDLE_IN_TX_TIMEOUT_MS` | No | `10000` | Timeout para transacciones abiertas inactivas. |
| `DB_QUERY_TIMEOUT_MS` | No | `15000` | Timeout por consulta desde el driver `pg`. |
| `DB_CONNECT_TIMEOUT_MS` | No | `5000` | Timeout al abrir nueva conexión TCP/TLS. |

### 4.3. Autenticación JWT, Cookies `HttpOnly`, CSRF y CORS

| Variable | Obligatoria | Ejemplo / Default | Descripción |
| :--- | :---: | :--- | :--- |
| `JWT_ACCESS_SECRET` | **Sí (prod)** | Cadena aleatoria ≥ 32 chars | Secreto exclusivo para Access Tokens (debe diferir de `JWT_REFRESH_SECRET`). |
| `JWT_REFRESH_SECRET` | **Sí (prod)** | Cadena aleatoria ≥ 32 chars | Secreto exclusivo para Refresh Tokens. |
| `JWT_SECRET` | Solo dev/test | `SECRETO_DEV` | Fallback de desarrollo vía derivación HKDF-SHA256 si no se definen los secretos separados. |
| `JWT_EXPIRES_IN` | No | `15m` | Vigencia del Access Token. |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Vigencia del Refresh Token. |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Recomendado | `gestion.ctmueble.com.ar` / `oficina.ctmueble.com.ar` | Validación de emisor y audiencia de tokens. |
| `CORS_ORIGINS` | **Sí (prod)** | `https://oficina.ctmueble.com.ar,http://localhost:5173` | Lista separada por comas de orígenes habilitados con `credentials: true`. |
| `FRONTEND_URL` / `APP_URL` | **Sí** | `https://oficina.ctmueble.com.ar` | URL base validada para construir enlaces de verificación de email y recuperación de clave. |
| `COOKIE_SAME_SITE` | Prod cross-site | `none` (prod) / `lax` (dev) | Política `SameSite` de cookies `ctm_at`, `ctm_rt` y `ctm_csrf`. |
| `COOKIE_SECURE` | Prod | `true` | Exige HTTPS para envío de cookies (obligatorio si `SameSite=none`). |
| `COOKIE_DOMAIN` | Opcional | `.ctmueble.com.ar` | Dominio compartido entre subdominios si frontend y backend comparten raíz. |

### 4.4. Cifrado de API Keys, Firma de Snapshots y OpenTimestamps

| Variable | Obligatoria | Ejemplo / Default | Descripción |
| :--- | :---: | :--- | :--- |
| `ACTIVE_ENCRYPTION_KEY_VERSION` | No | `v1` | Versión activa de llave para cifrar API keys en `system_api_keys`. |
| `MASTER_ENCRYPTION_KEY_V1` | **Sí (prod)** | Clave hexadecimal/Base64 de 32 bytes | Llave maestra AES-256-GCM (fallback de firma HMAC/legacy: `APP_ENCRYPTION_KEY`). |
| `USE_KMS_ENVELOPE` | No | `false` | Activa cifrado Envelope vía AWS KMS (`KMS_KEY_ARN` + `AWS_REGION`). |
| `KMS_KEY_ARN` | Si `USE_KMS_ENVELOPE=true` | `arn:aws:kms:...` | ARN de la CMK en AWS KMS. |
| `SYSTEM_SIGNING_PRIVATE_KEY` | Recomendado (prod) | Clave PEM privada RSA | Clave privada para firmar `Snapshot` con `RSA-SHA256`. |
| `SYSTEM_SIGNING_PUBLIC_KEY` | Recomendado (prod) | Clave PEM pública RSA | Clave pública de verificación de snapshots firmados. |
| `SYSTEM_SIGNING_SECRET` | Fallback firmado | Secreto largo aleatorio | Secreto HMAC de respaldo cuando no se configuran llaves RSA o KMS. |
| `OTS_DISABLE_NETWORK` | No | `false` (`true` en dev offline) | Desactiva consultas a calendarios públicos OpenTimestamps. |
| `OTS_TIMEOUT_MS` | No | `5000` | Timeout de red para estampado `.ots`. |

### 4.5. Almacenamiento PDF (Cloudflare R2 o disco local) y Puppeteer

| Variable | Obligatoria | Ejemplo / Default | Descripción |
| :--- | :---: | :--- | :--- |
| `STORAGE_DIR` | Local (si no R2) | `./storage/essays_forms` | Carpeta en disco para almacenar PDFs cuando no se usa R2. |
| `R2_ACCOUNT_ID` | Prod R2 | `<account-id>` | Identificador de cuenta Cloudflare R2. |
| `R2_ACCESS_KEY_ID` | Prod R2 | `<access-key>` | Access Key S3 de Cloudflare R2. |
| `R2_SECRET_ACCESS_KEY` | Prod R2 | `<secret-key>` | Secret Key S3 de Cloudflare R2. |
| `R2_BUCKET_NAME` | Prod R2 | `ctm-documents` | Nombre del bucket R2. |
| `R2_PREFIX` | No | `essays_forms` | Prefijo de objetos dentro del bucket. |
| `R2_PUBLIC_URL` / `R2_PUBLIC_URL_BASE` | No | URL pública opcional | Base pública en caso de exponerse objetos firmados/públicos. |
| `R2_TIMEOUT_MS` | No | `10000` | Timeout de cliente S3/R2. |
| `PDF_MAX_CONCURRENCY` | No | `2` | Máximo de instancias Puppeteer simultáneas controladas por semáforo. |
| `PDF_QUEUE_TIMEOUT_MS` / `PDF_RENDER_TIMEOUT_MS` | No | Valores en ms | Límites de espera en cola y renderizado HTML→PDF. |

### 4.6. Redis (caché distribuida, rate limiting e idempotencia)

Puede configurarse mediante una URL única (`REDIS_URL`) o parámetros individuales (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASS`, `REDIS_DB`, `REDIS_TLS`, `REDIS_TLS_REJECT_UNAUTHORIZED`). Si no se configura, el sistema opera normalmente en desarrollo utilizando un store en memoria RAM con advertencia en log.

### 4.7. Mailing (Resend — configuración en runtime vía `/api-keys`)

A diferencia de las variables estáticas de infraestructura, las credenciales del proveedor de correos (**Resend**) se almacenan cifradas con **AES-256-GCM / KMS** dentro de la tabla `system_api_keys` (administradas por usuarios `LABORATORY` con rol `ADMIN` mediante el panel o `POST /api-keys` con `service: "MAILING"`, `provider: "RESEND"`, `apiKey: "re_..."` y `metadata: { fromEmail, fromName }`). Por ello **requiere tener definida `MASTER_ENCRYPTION_KEY_V1`** (o `APP_ENCRYPTION_KEY`) antes de guardar o leer la API Key.

### 4.8. ARCA / AFIP — Servicio Auxiliar Opcional de Autocompletado de Clientes

> [!IMPORTANT]
> La integración con **ARCA / AFIP (`ArcaConnection` + `PadronService` A13)** es **exclusivamente un sistema auxiliar para el autocompletado de razón social y domicilio de clientes por CUIT**. **No es necesaria su activación** para instalar ni operar el sistema: si estas variables no se configuran, el alta y edición manual de empresas y clientes funcionan normalmente sin errores ni bloqueos.

**Cómo habilitarlo (opcional):**

1. Genere una clave privada RSA (`private.key`) y solicite un certificado X.509 (`cert.crt`) en el portal de **ARCA/AFIP**.
2. Desde *Administrador de Relaciones de Clave Fiscal*, asocie el servicio **`ws_sr_padron_a13`** al computador fiscal correspondiente.
3. Configure en `.env` (o Environment Variables de Vercel):
   - `ARCA_CUIT`: CUIT titular autorizado ante ARCA (11 dígitos).
   - **En producción / Vercel (en memoria, sin archivos en disco):** `ARCA_CERT_BASE64` y `ARCA_KEY_BASE64` (contenido Base64 de `cert.crt` y `private.key` en una sola línea).
   - **En desarrollo local:** además de Base64, puede indicar las rutas `ARCA_CERT_FILE` y `ARCA_KEY_FILE`.
   - Opcionales de ajuste/homologación: `ARCA_SERVICE`, `ARCA_WSAA_URL`, `ARCA_PADRON_URL`, `ARCA_TIMEOUT_MS`.

---

## Capítulo 5 — Puesta en Marcha de la Base de Datos (Migraciones y Seedeo)

### 5.1. Ejecutar migraciones de esquema (`Umzug` + `SequelizeMeta`)

El directorio `src/infrastructure/migrations/` contiene el historial versionado (`20260217000000-*` hasta `20261117000000-*`) que crea las **34 tablas** e índices en PostgreSQL:

```bash
# Verificar estado de migraciones pendientes/aplicadas
npm run migrate:status

# Aplicar todas las migraciones pendientes
npm run migrate
# (equivalente explícito: npm run migrate:up)

# Revertir únicamente la última migración aplicada
npm run migrate:down

# Revertir todas las migraciones hasta el estado inicial
npm run migrate:undo
```

### 5.2. Seedeo de datos base (global, granular y restablecimiento de contraseñas)

El script idempotente `src/infrastructure/seeders/run-default-types-seed.js` (respaldado por `baseSeedData.js`) carga todos los datos base necesarios para operar el sistema:

| Flag / Script npm | Datos sembrados | Tablas destino |
| :--- | :--- | :--- |
| `npm run seed` | **Seedeo global completo** de todos los bloques listados abajo. | Todas las tablas base |
| `npm run seed:countries` (`--countries`) | Todos los **249 países/territorios** ISO 3166-1 alpha-2 en español. | `types_countries` |
| `npm run seed:provinces` (`--provinces`) | Todas las **24 provincias/jurisdicciones de Argentina** (`AR-A` a `AR-Z`). | `types_districts` |
| `npm run seed:essay-types` (`--essay-types`) | Tipo de ensayo **Determinación de emisión de formaldehído según IT17-01** (`id: 1`). | `types_essays` |
| `--documents` | Los **5 formularios oficiales** (`F-PC13-01`, `F-PC13-02`, `F-PC15-01`, `F-PC16-01`, `F-PC16-02`). | `types_documents` |
| `npm run seed:lab` (`--lab`) | **Datos ficticios de laboratorio** (razón social, CUIT, dirección, presidente, director, CBU, incertidumbre `0.05`). Admite `--overwrite-lab`. | `environment_variables`, `laboratories` |
| `npm run seed:users` (`--users`, `--admin`, `--client`) | Cuenta **Admin Laboratorio** (`admin.lab@ctmueble.com.ar` / `AdminLab1234!`) y cuenta **Cliente demo** (`cliente.demo@ctmueble.com.ar` / `ClienteDemo1234!`). | `users`, `persons`, `laboratory_members` / `laboratories_members` |
| `npm run seed:reset-passwords` | **Restablece las contraseñas** si los usuarios base ya existían en la base de datos. | `users` |

**Ejemplos de uso habitual:**

```bash
# 1. Inicialización completa tras migrar una base nueva
npm run seed

# 2. Seedeo granular por bloques específicos
npm run seed:countries
npm run seed:provinces
npm run seed:essay-types
npm run seed:lab
npm run seed:users

# 3. Combinación selectiva desde CLI
node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js --documents --admin --client

# 4. Restablecer contraseñas de los usuarios base ya aplicados
npm run seed:reset-passwords
```

### 5.3. Creación y reseteo de usuarios puntuales (`create-user`)

Para crear un usuario administrador o cliente específico (o restablecer su contraseña si el correo ya existe):

```bash
# Alta de usuario Administrador de Laboratorio
npm run create-user -- --mail admin@ctm.com --password MiClaveSegura12! --name "Admin CTM" --dni 30123456 --profile LABORATORY --role ADMIN

# Restablecer contraseña de un correo ya registrado
npm run create-user -- --mail admin@ctm.com --password NuevaClaveSegura12! --reset-password
```

---

## Capítulo 6 — Instalación y Configuración del Frontend (`oficina.ctmueble.com.ar`)

### 6.1. Clonar e instalar dependencias

```bash
git clone <url-repositorio-oficina.ctmueble.com.ar>
cd oficina.ctmueble.com.ar
npm install
```

### 6.2. Configurar entorno (`VITE_API_URL`)

En `src/env.js`, el cliente HTTP consume la variable `VITE_API_URL` (por defecto `http://localhost:3000` en desarrollo local). Cree un archivo `.env` en la raíz del frontend:

```bash
# Desarrollo local
VITE_API_URL=http://localhost:3000

# Producción (sin barra final para evitar dobles barras en preflight CORS)
# VITE_API_URL=https://gestion.ctmueble.com.ar
```

> [!IMPORTANT]
> Verifique que la URL definida en `VITE_API_URL` coincida con el dominio publicado del backend y que el origen exacto del frontend figure en `CORS_ORIGINS` del backend para que las cookies `HttpOnly` (`withCredentials: true`) y el header `X-CSRF-Token` funcionen correctamente.

### 6.3. Arranque en desarrollo y compilación para producción

```bash
# Servidor local de desarrollo Vite (por defecto http://localhost:5173)
npm run dev

# Verificación de linter y generación de bundle estático en dist/
npm run lint
npm run build
```

---

## Capítulo 7 — Ejecución, Verificación de Salud y Pruebas Automatizadas

### 7.1. Arranque del backend y endpoints de verificación

```bash
# Si modificó plantillas HTML en src/infrastructure/templates/essays_forms/
npm run build:templates

# Iniciar servidor Express (puerto configurado en PORT, default 3000)
npm start
```

Verifique el estado operativo del servicio:

| Endpoint | Autenticación | Propósito |
| :--- | :--- | :--- |
| `GET /health` | Pública | Sonda de vida (*liveness*): devuelve `200 OK` con `{ status: "ok", timestamp }` sin consumir conexiones de BD. |
| `GET /ready` | Pública | Sonda de preparación (*readiness*): ejecuta `SELECT 1` con timeout de 2s e informa estado de PostgreSQL (`db: "up"`) y Redis (`configured` / `disabled`). |
| `GET /api-docs` | JWT + `LABORATORY` | Documentación interactiva **Swagger UI** (habilitada cuando `NODE_ENV !== 'production'` o `ENABLE_SWAGGER=true`). |

### 7.2. Ejecución de la suite completa de pruebas (`npm test`)

El repositorio incluye **25 archivos de test** (`94` subtests) basados en el runner nativo `node --test` (con aislamiento en memoria, sin requerir conexión a PostgreSQL ni Redis):

```bash
npm test
# En PowerShell con restricciones .ps1:
npm.cmd test
# O directamente:
node --test
```

Cobertura principal verificada: autenticación/cookies/CSRF/JWT, aislamiento multi-tenant RBAC/IDOR, idempotencia por usuario y neutralización CSV Injection, permisos granulares de laboratorio, generación PDF bajo demanda, firma `CanonicalJson`/`RSA-SHA256`/OpenTimestamps y seeder base de 249 países y 24 provincias.

---

## Capítulo 8 — Despliegue en Producción (Vercel + Neon + Cloudflare R2)

### 8.1. Despliegue del Backend (`gestion.ctmueble.com.ar`)

El archivo `vercel.json` configura el runtime serverless con:
- Función principal `src/app.js` con `maxDuration: 60` segundos (necesario para renderizados complejos con `@sparticuz/chromium`) e inclusión de archivos estáticos `src/infrastructure/templates/**`.
- Cabeceras de seguridad HTTP en el edge (`HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`).

**Lista de verificación antes de pasar a producción:**

1. Configurar en Vercel la variable `NODE_ENV=production`.
2. Usar en `DATABASE_URL` el endpoint **pooled (`-pooler`)** de Neon PostgreSQL con SSL habilitado (`?sslmode=require`).
3. Definir secretos distintos y ≥ 32 caracteres en `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`.
4. Configurar `MASTER_ENCRYPTION_KEY_V1` (y opcionalmente `USE_KMS_ENVELOPE=true` + `KMS_KEY_ARN`), así como `SYSTEM_SIGNING_PRIVATE_KEY` / `SYSTEM_SIGNING_PUBLIC_KEY`.
5. Configurar `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` y `R2_BUCKET_NAME` en Cloudflare R2.
6. Configurar `REDIS_URL` para rate limiting, idempotencia y revocación distribuida de sesiones.
7. Configurar `CORS_ORIGINS=https://oficina.ctmueble.com.ar`, `FRONTEND_URL=https://oficina.ctmueble.com.ar`, `COOKIE_SAME_SITE=none` y `COOKIE_SECURE=true`.
8. Ejecutar migraciones contra Neon (`npm run migrate`) y verificar (`npm run migrate:status`) antes del primer arranque productivo.
9. Ingresar como `ADMIN` y cargar la API Key de **Resend** desde `/api-keys` (`service: "MAILING"`, `provider: "RESEND"`).
10. Verificar que `GET /health` y `GET /ready` respondan `200 OK`.

### 8.2. Despliegue del Frontend (`oficina.ctmueble.com.ar`)

1. Configurar `VITE_API_URL=https://gestion.ctmueble.com.ar` en el proyecto frontend en Vercel.
2. Ejecutar build (`npm run build`) y publicar apuntando al dominio oficial `https://oficina.ctmueble.com.ar`.
3. Comprobar que el navegador reciba las cookies `ctm_at`, `ctm_rt` y `ctm_csrf` tras `POST /auth/login` y adjunte `X-CSRF-Token` en peticiones `POST`/`PUT`/`DELETE`.

---

## Capítulo 9 — Mantenimiento Operativo, Scripts de Documentación y Troubleshooting

### 9.1. Tareas periódicas de mantenimiento

- **Sincronización de plantillas HTML:** Ante cualquier modificación en `src/infrastructure/templates/essays_forms/*.html` o `static/ctm.jpg`, ejecutar `npm run build:templates` antes de commitear o desplegar.
- **Rotación de API Keys y llaves de cifrado:** Utilizar los endpoints protegidos `/api-keys` para rotar la clave de Resend en caliente sin reiniciar servidores; actualizar `ACTIVE_ENCRYPTION_KEY_VERSION` y definir `MASTER_ENCRYPTION_KEY_V2` si se rota la llave maestra.
- **Compilación de documentación PDF:** Tras modificar cualquier `.md` en `docs/` o la estética en `docs/pdf-config.json`, ejecutar el comando siguiente para regenerar la documentación unificada y los PDFs oficiales (documentación consolidada, guía práctica de usuario y manual técnico):

```bash
npm run build:docs-pdf
```

### 9.2. Guía rápida de resolución de problemas (Troubleshooting)

| Síntoma observado | Causa probable | Solución recomendada |
| :--- | :--- | :--- |
| Error `JWT_ACCESS_SECRET y JWT_REFRESH_SECRET deben ser estrictamente distintos` | En producción ambos secretos faltan, son iguales o tienen < 32 caracteres. | Generar dos secretos aleatorios independientes de al menos 32 caracteres. |
| `403 CSRF_INVALID` o sesión perdida al recargar | Frontend y backend en distintos dominios sin `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true` o falta origen en `CORS_ORIGINS`. | Ajustar `CORS_ORIGINS` (sin barra final), `COOKIE_SAME_SITE=none` y `COOKIE_SECURE=true` bajo HTTPS. |
| Advertencia `[DB][WARN]` o agotamiento de conexiones en Neon | Se usó la URL directa de Neon en lugar de `-pooler`, o `DB_POOL_MAX` es muy alto en serverless. | Usar el hostname `-pooler.neon.tech` y mantener `DB_POOL_MAX=2` en funciones serverless. |
| `ENOENT` al renderizar PDF en Vercel | No se ejecutó `sync-templates.js` o cambió la ruta de plantillas. | Ejecutar `npm run build:templates` y verificar `includeFiles` en `vercel.json`. |
| `MAILING_NOT_CONFIGURED` al enviar 2FA o notificaciones | No se registró una clave activa en `system_api_keys` o falta `MASTER_ENCRYPTION_KEY_V1`. | Configurar `MASTER_ENCRYPTION_KEY_V1` y dar de alta la API Key de Resend vía `POST /api-keys`. |
| Error al consultar datos fiscales por CUIT (si usa ARCA) | El servicio auxiliar opcional ARCA no está configurado o expiró el certificado `ws_sr_padron_a13`. | Verificar `ARCA_CUIT` + `ARCA_CERT_BASE64`/`ARCA_KEY_BASE64`, o continuar operando mediante alta manual de empresa. |
| En Windows PowerShell falla `npm test` con error de firma `.ps1` | Política de ejecución de scripts PowerShell restringida. | Ejecutar `npm.cmd test` o `node --test`. |
