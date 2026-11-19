## Visión general

`gestion.ctmueble.com.ar` es el **backend** del sistema de gestión de ensayos del CTM (Centro Tecnológico del Mueble).  
Expone una **API REST en Node.js/Express** para:

- **Gestionar ensayos** (solicitud → contrato → recepción de muestras → trabajo de laboratorio → informe).
- **Administrar clientes, contactos y direcciones**.
- **Emitir y almacenar documentos PDF normalizados** (F‑PC13‑01, F‑PC13‑02, F‑PC16‑01, F‑PC16‑02, F‑PC15‑01, etc.).
- **Registrar auditoría** de eventos importantes (creación de ensayo, recepción de muestras, emisión de informes, etc.).

La base de datos es **PostgreSQL** (Neon en producción) y el acceso se hace con **Sequelize**.

---

## Arquitectura del sistema (backend)

El backend sigue una arquitectura por capas, inspirada en DDD light:

- **Capa de presentación (`src/app.js`, `src/presentation`)**
  - Configura Express, middlewares globales, CORS, Swagger.
  - Define routers por recurso (`/auth`, `/users`, `/clients`, `/essays`, `/samples`, `/documents`, `/types`, etc.).
  - Controladores adaptan HTTP ↔ casos de uso (servicios de aplicación).

- **Capa de aplicación (`src/application`)**
  - **Servicios de aplicación** (`*ApplicationService.js`) orquestan casos de uso:
    - Crear/actualizar ensayos.
    - Emitir órdenes de trabajo y recibir muestras.
    - Emitir contratos e informes.
    - Consultar y descargar documentos.
  - Devuelven DTOs listos para serializar a JSON.

- **Capa de dominio (`src/domain`)**
  - **Entidades**: `Essay`, `WorkOrder`, `EssayClient`, `Document`, etc.
  - **Value objects**: `Terms`, `SampleStatus`, `EssayAuditEvent`, etc.
  - Encapsulan reglas de negocio y máquinas de estado (por ejemplo, estados del ensayo).

- **Capa de infraestructura (`src/infrastructure`)**
  - **Modelos Sequelize** (`models`) para todas las tablas.
  - **Repositorios** (`repositories`) que implementan las interfaces de dominio.
  - **Migraciones** (`migrations`) y scripts Umzug (`run-migrations.js`).
  - **Servicios técnicos**:
    - Generación de PDFs (Puppeteer + Handlebars + plantillas HTML en `templates/essays_forms`).
    - Almacenamiento de documentos en disco o en Cloudflare R2.
    - Integración auxiliar opcional con AFIP/ARCA para autocompletado de datos de clientes (no necesaria para operar).

- **Capa compartida (`src/shared`)**
  - `serviceFactory` y contenedor de dependencias (`services.config.json`).
  - Construye servicios de aplicación inyectando repositorios, servicios de dominio, etc.

Para una descripción más exhaustiva de todo el sistema (backend + frontend) podés ver `ARQUITECTURA.md` en el proyecto `oficina.ctmueble.com.ar`.

---

## Requisitos previos

- **Node.js** ≥ 18
- **npm** o **yarn**
- **PostgreSQL** (o cuenta en Neon, como ya está configurado)
- (Opcional) Cuenta en **Cloudflare R2** para almacenamiento de PDFs

---

## Configuración de entorno

El backend usa un archivo `.env` en la raíz del proyecto.  
Variables principales:

- **Base de datos**
  - `DATABASE_URL` – cadena de conexión a PostgreSQL (Neon u otro proveedor).
  - `DB_LOGGING` – `true`/`false` para mostrar queries de Sequelize.

- **Servidor**
  - `PORT` – puerto HTTP (por defecto `3000` si no se configura).
  - `NODE_ENV` – `development` / `production`.

- **JWT / autenticación**
  - `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` – secretos obligatorios y distintos en producción para Access y Refresh Tokens (`JWT_SECRET` queda solo como fallback derivado vía HKDF-SHA256 en desarrollo/test).
  - `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` – TTL de tokens (por defecto `15m` y `7d`; la cookie persistente usa fallback `30d`).
  - `JWT_ISSUER` / `JWT_AUDIENCE` – emisor y audiencia esperados en verificación JWT.

- **Cookies, CSRF y CORS**
  - `COOKIE_SAME_SITE`, `COOKIE_DOMAIN`, `COOKIE_SECURE` – política de cookies `HttpOnly` (`ctm_at`, `ctm_rt`) y cookie CSRF (`ctm_csrf`).
  - `CORS_ORIGINS` / `FRONTEND_URL` / `APP_URL` – orígenes autorizados para peticiones con credenciales y URL base para enlaces de verificación/recuperación.

- **Redis (opcional en local, recomendado en producción)**
  - `REDIS_URL` o `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASS`, `REDIS_DB`, `REDIS_TLS` – usado para cache de idempotencia, rate limiting distribuido, revocación inmediata de sesiones y cache TA de ARCA (si se habilita el autocompletado opcional, con fallback en memoria).

- **Cifrado de API Keys (KMS / AES-256-GCM)**
  - `ACTIVE_ENCRYPTION_KEY_VERSION` (por defecto `v1`), `MASTER_ENCRYPTION_KEY_V1` y, opcionalmente en AWS KMS, `USE_KMS_ENVELOPE`, `KMS_KEY_ARN`, `AWS_REGION`.

- **Almacenamiento de documentos**
  - `STORAGE_DIR` – ruta local donde se guardan PDFs si no se usa R2 (por ejemplo `./storage/essays_forms`).

- **Cloudflare R2 (opcional)**
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PREFIX` – prefijo opcional dentro del bucket (por defecto `essays_forms`).

- **ARCA/AFIP — Sistema auxiliar opcional de autocompletado de clientes (NO necesario activarlo)**
  - Se utiliza **únicamente** para autocompletar razón social y domicilio al cargar clientes por CUIT; el sistema funciona por completo de forma manual sin configurar estas variables:
    - `ARCA_CUIT` – CUIT titular autorizado ante ARCA.
    - `ARCA_CERT_BASE64` y `ARCA_KEY_BASE64` (en Vercel/producción) o `ARCA_CERT_FILE` y `ARCA_KEY_FILE` (en desarrollo local).

Ejemplo mínimo de `.env` para desarrollo local:

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=SECRETO_DEV
DATABASE_URL=postgresql://user:pass@localhost:5432/ctmueble
DB_LOGGING=true
STORAGE_DIR=./storage/essays_forms
```

---

## Instalación y puesta en marcha (desarrollo)

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repo>
   cd gestion.ctmueble.com.ar
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar `.env`**

   - Copiar el ejemplo anterior y ajustar `DATABASE_URL` a tu Postgres local o Neon.
   - Configurar `JWT_SECRET` y `STORAGE_DIR`.

4. **Ejecutar migraciones de base de datos**

   Las migraciones se gestionan con Umzug (`SequelizeMeta`) mediante [`src/infrastructure/migrations/run-migrations.js`](src/infrastructure/migrations/run-migrations.js):

   ```bash
   # Ejecutar todas las migraciones pendientes
   npm run migrate
   # (equivalente explícito: npm run migrate:up)

   # Ver estado de migraciones (aplicadas y pendientes)
   npm run migrate:status

   # Revertir la última migración aplicada
   npm run migrate:down

   # Revertir todas las migraciones ejecutadas
   npm run migrate:undo
   ```

5. **Seedeo de datos base (global, granular y restablecimiento de contraseñas)**

   El script idempotente [`src/infrastructure/seeders/run-default-types-seed.js`](src/infrastructure/seeders/run-default-types-seed.js) (apoyado en [`baseSeedData.js`](src/infrastructure/seeders/baseSeedData.js)) permite inicializar todos los datos base del sistema de forma **global** o **granular**:

   | Bloque / Flag | Contenido que siembra | Tabla(s) destino |
   | :--- | :--- | :--- |
   | `--countries` | Todos los **249 países/territorios** ISO 3166-1 alpha-2 en español | `types_countries` |
   | `--provinces` | Todas las **24 provincias/jurisdicciones de Argentina** (`AR-A` a `AR-Z`) | `types_districts` |
   | `--essay-types` | Tipo de ensayo **Determinación de la emisión formaldehído según IT17-01** (`id: 1`) | `types_essays` |
   | `--documents` | Los 5 formularios oficiales (`F-PC13-01`, `F-PC13-02`, `F-PC15-01`, `F-PC16-01`, `F-PC16-02`) | `types_documents` |
   | `--lab` | Datos de **laboratorio ficticios** (razón social, CUIT, dirección, autoridades, CBU, incertidumbre `0.05`) | `environment_variables`, `laboratories` |
   | `--users` (`--admin` / `--client`) | Cuenta **Admin de Laboratorio** (`admin.lab@ctmueble.com.ar` / `AdminLab1234!`) y **Cliente demo** (`cliente.demo@ctmueble.com.ar` / `ClienteDemo1234!`) | `users`, `persons`, `laboratory_members` / `laboratories_members` |

   **Comandos disponibles:**

   ```bash
   # Seedeo global completo (ejecuta todos los bloques anteriores de forma idempotente)
   npm run seed

   # Seedeo granular por bloque específico
   npm run seed:countries        # Solo los 249 países
   npm run seed:provinces        # Solo las 24 provincias argentinas
   npm run seed:essay-types      # Solo el tipo de ensayo de formaldehído (IT17-01)
   npm run seed:lab              # Solo datos ficticios de laboratorio (agregar --overwrite-lab para sobrescribir existentes)
   npm run seed:users            # Solo cuenta Admin de Laboratorio y cuenta Cliente

   # Ejemplos granulares combinables por CLI
   node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js --documents --admin
   node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js --client

   # Restablecer contraseñas si los usuarios base ya estaban aplicados en la BD
   npm run seed:reset-passwords
   # (equivalente con personalización opcional: --admin-mail ... --admin-password ... --client-mail ... --client-password ...)

   # Crear un usuario puntual o restablecer la contraseña de un correo ya existente
   npm run create-user -- --mail admin@ctm.com --password MiClaveSegura12! --name "Admin CTM" --dni 30123456 --profile LABORATORY --role ADMIN
   npm run create-user -- --mail admin@ctm.com --password NuevaClaveSegura12! --reset-password
   ```

6. **Levantar el servidor en desarrollo**

   ```bash
   npm run dev   # o el script equivalente definido en package.json
   ```

   El backend quedará expuesto típicamente en `http://localhost:3000`.

7. **Probar la API (Swagger)**

   Abrí en el navegador:

   ```text
   http://localhost:3000/api-docs
   ```

   Desde ahí podés explorar y probar los endpoints disponibles.

---

## Flujo funcional principal

- **Autenticación**
  - El usuario se registra, verifica su email, inicia sesión (con soporte de **2FA TOTP/Email**, dispositivos confiables y recuperación de contraseña) o renueva sesión vía `/auth`.
  - El backend emite cookies `HttpOnly` (`ctm_at`, `ctm_rt`) junto con la cookie `ctm_csrf` (requerida en header `X-CSRF-Token` en mutaciones); en entornos de desarrollo (`NODE_ENV !== 'production'`) también se acepta `Authorization: Bearer <token>`.

- **Gestión de ensayos**
  - Creación de un ensayo con:
    - Cliente (empresa, dirección, representante, contacto).
    - Tipo de ensayo (`types_essays`).
    - Términos (precio, tiempos, conservación de muestras).
    - Elemento a ensayar (producto, fabricante, país de origen).
  - Flujo general:
    1. **Solicitud** → se genera F‑PC13‑01.
    2. **Contrato** → F‑PC13‑02.
    3. **Recepción de muestras** → F‑PC16‑01.
    4. **Orden de trabajo** → F‑PC16‑02.
        5. **Informe de ensayo** → F‑PC15‑01.

- **Documentos**
  - Se generan a partir de plantillas HTML en `src/infrastructure/templates/essays_forms`.
  - Se renderizan a PDF con Puppeteer.
  - Se guardan localmente (`STORAGE_DIR`) o en Cloudflare R2 según configuración.

---

## Despliegue

El proyecto está pensado para correr:

- En **Vercel / serverless**, usando:
  - `@neondatabase/serverless` para la conexión a PostgreSQL (Neon).
  - Credenciales opcionales de ARCA en memoria (`ARCA_CERT_BASE64` / `ARCA_KEY_BASE64`) solo si se habilita el autocompletado auxiliar de clientes.
- En un **servidor tradicional**, usando:
  - `pg` como driver de PostgreSQL.
  - Almacenamiento local de PDFs y, opcionalmente, certificados ARCA en archivo local.

Puntos a revisar para despliegue:

- Variables de entorno (`DATABASE_URL`, `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, credenciales de R2, y opcionalmente `ARCA_*` si se desea autocompletado).
- Permisos de escritura en `STORAGE_DIR` (si se usa almacenamiento local).
- Orígenes permitidos de CORS para el frontend (`oficina.ctmueble.com.ar`, `localhost:5173`, etc.).

---

## Almacenamiento de documentos (Cloudflare R2)

Los PDF generados pueden guardarse en **Cloudflare R2**. Si no configurás R2, se usan archivos locales en `STORAGE_DIR` (por defecto `./storage/essays_forms`).

Variables de entorno para R2:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- opcional `R2_PREFIX` (por defecto `essays_forms`).

---

## Autocompletado auxiliar de clientes con ARCA/AFIP (Opcional)

La integración con **ARCA/AFIP (`ArcaConnection` + `PadronService` A13)** es **exclusivamente un servicio auxiliar para el autocompletado de datos de clientes/empresas** (razón social y domicilio a partir del CUIT). **No es necesaria su activación** para operar el sistema: si no se configuran estas variables, el alta y edición manual de clientes/empresas funciona con normalidad.

### Cómo habilitarlo

1. **En ARCA/AFIP:** generar un certificado X.509 (`cert.crt`) a partir de una clave privada RSA (`private.key`) y delegar el servicio **`ws_sr_padron_a13`** al computador fiscal correspondiente desde el *Administrador de Relaciones de Clave Fiscal*.
2. **En producción / Vercel (en memoria, sin archivos en disco):** configurar en Environment Variables:
   - `ARCA_CUIT` – CUIT autorizado ante ARCA (11 dígitos).
   - `ARCA_CERT_BASE64` – contenido de `cert.crt` codificado en Base64.
   - `ARCA_KEY_BASE64` – contenido de `private.key` codificado en Base64.
3. **En desarrollo local:** además de Base64, podés usar archivos físicos en `certs/arca/` configurando `ARCA_CUIT`, `ARCA_CERT_FILE` y `ARCA_KEY_FILE`.

Para generar Base64 de una sola línea:

- **bash**:
  - `base64 -w0 certs/arca/cert.crt`
  - `base64 -w0 certs/arca/private.key`
- **PowerShell**:
  - `[Convert]::ToBase64String([IO.File]::ReadAllBytes("certs/arca/cert.crt"))`

---

## Documentación del sistema

Toda la documentación está clasificada por módulos en **`docs/`** siguiendo el orden metodológico de los **Módulos I, II, III y IV** más los **Manuales Operativos**:

- **Índice Maestro:** [docs/INDEX.md](docs/INDEX.md)
- **Guía Ejecutiva para Cliente Final:** [docs/05-manuales-operativos-y-guia-cliente/01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md](docs/05-manuales-operativos-y-guia-cliente/01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md)
- **Documentación Unificada en Markdown y PDF (con portada e índice clicable):**
  - Generación mediante CLI: `npm run build:docs-pdf` (`scripts/build-docs-pdf.js`)
  - Salidas generadas: `docs/DOCUMENTACION_CONSOLIDADA_CTM.md` y `docs/DOCUMENTACION_CONSOLIDADA_CTM.pdf`

### Estructura modular en `docs/`
1. **[docs/01-modulo-i-pautas-y-analisis-escenario/](docs/01-modulo-i-pautas-y-analisis-escenario/01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md)** — Organización del equipo, escenario CTM, modelo de negocio, organigrama, procesos/eventos, problemática, alcance y diagramas AS-IS.
2. **[docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/](docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md)** — Objetivo, alcance real, roles, jerarquía y cascada operativa, requerimientos `RF`/`RNF`, reglas de negocio, flujos TO-BE, casos de uso, prioridades y clasificación de datos.
3. **[docs/03-modulo-iii-arquitectura-y-planificacion/](docs/03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md)** — Tipo de solución y arquitectura web/serverless, Neon PostgreSQL, diseño lógico definitivo (34 tablas + diagnóstico de normalización), diseño en 6 módulos, navegación, mockups, seguridad/auditoría, políticas y plan de mantenimiento.
4. **[docs/04-modulo-iv-desarrollo-implementacion-y-validacion/](docs/04-modulo-iv-desarrollo-implementacion-y-validacion/01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md)** — Entorno DDD, inyección de dependencias (`serviceFactory`/`di`), desarrollo incremental, registro de incidencias, 2FA/sesiones, verificación/reseteo, cookies/CSP, roles/permisos de laboratorio, cifrado AES-256-GCM/KMS, clientes y autocompletado auxiliar opcional con ARCA, ensayos/OT/muestras/CSV-XLSX, PDFs on-the-fly, emails Resend, integridad RSA+OTS, contratos HTTP, middlewares/Redis y 90 tests.
5. **[docs/05-manuales-operativos-y-guia-cliente/](docs/05-manuales-operativos-y-guia-cliente/02-MANUAL_USUARIO_FINAL.md)** — Guía ejecutiva, manual paso a paso, manual exhaustivo y anexos HTML/TXT.

### Documentación técnica auxiliar fuera de `docs/`
- [src/infrastructure/migrations/README.md](src/infrastructure/migrations/README.md) – Comandos Umzug de migraciones y ejecución en CI/Neon.
- [src/shared/di/CLUSTERS_USAGE.md](src/shared/di/CLUSTERS_USAGE.md) – Uso del registro modular y clusters en la inyección de dependencias.
