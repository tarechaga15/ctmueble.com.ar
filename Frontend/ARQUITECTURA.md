### Visión general del sistema

El sistema está compuesto por **dos aplicaciones principales**:

- **Backend `gestion.ctmueble.com.ar`**: API REST sobre Node.js/Express, con arquitectura por capas (presentación, aplicación, dominio, infraestructura) y base de datos relacional vía Sequelize.
- **Frontend `oficina.ctmueble.com.ar`**: SPA en React (Vite + React Router) consumiendo la API del backend, orientada al flujo de oficina (solicitudes de ensayo, clientes, muestras, etc.).

El objetivo es gestionar el ciclo completo de un ensayo (solicitud → contrato → recepción de muestras → trabajo de laboratorio → informe) y la información relacionada (clientes, órdenes de trabajo, documentos, etc.).

---

### Principios de diseño

- **Separación de responsabilidades por capas**: presentación, aplicación, dominio e infraestructura claramente diferenciadas en el backend; en el frontend se separan páginas, componentes, servicios y contextos.
- **Modelo de Dominio Rico (DDD light)**: entidades y value objects encapsulan reglas de negocio (por ejemplo `Essay`, `WorkOrder`, `Terms`, `SampleStatus`).
- **Servicios de aplicación como orquestadores**: coordinan casos de uso usando entidades de dominio, repositorios y servicios externos (por ejemplo `EssayApplicationService`).
- **Repositorios como puentes a infraestructura**: interfaces de dominio (`IEssayRepository`, etc.) con implementaciones Sequelize en infraestructura (`EssayRepository`).
- **DTOs y mapeos**: conversión entre entidades de dominio, DTOs de aplicación y respuestas JSON de la API.
- **Inyección de dependencias / Service Factory**: uso de un contenedor e inyección configurada por JSON tanto en backend (`shared/serviceFactory`) como en frontend (`shared/di`).
- **Autenticación centralizada con JWT**: middleware `verifyJWT` en backend y `AuthService` + interceptor Axios en frontend.
- **CORS y seguridad**: configuración explícita de orígenes permitidos y control de acceso por perfil de usuario (`profile`).

---

### Backend `gestion.ctmueble.com.ar`

#### 1. Capa de presentación (`src/app.js`, `src/presentation`)

- **`src/app.js`**:
  - Configura **Express**, `cors`, `body-parser`, `cookie-parser`.
  - Carga `.env` si existe y avisa si falta `DATABASE_URL`.
  - Registra middlewares globales:
    - `transactionMiddleware`: maneja transacciones de base de datos por request.
    - `verifyJWT`: valida JWT y adjunta el usuario a `req.user`.
  - Define rutas montadas:
    - `/auth`, `/users`, `/clients`, `/bussiness`, `/persons`, `/env`, `/types`, `/samples`, `/essays`, etc.
    - En `/essays` agrega lógica especial para tokens en query al descargar documentos.
  - Expone **Swagger UI** en `/api-docs`.
  - Maneja errores 404 y 500.
  - Soporta modo servidor Express tradicional (`app.listen`) y modo serverless (exportando `app`).

- **Rutas y controladores (`src/presentation/routes`, `src/presentation/controllers`)**:
  - Cada recurso tiene:
    - **Router** Express (por ejemplo `essays.routes.js`) que define endpoints (`/get`, `/create`, `/download-document`, etc.).
    - **Controller** (por ejemplo `essays.controller.js`) que:
      - Construye un **contexto de request** (`buildContext(req)`).
      - Obtiene el servicio de aplicación adecuado vía `serviceFactory` (`getEssayService`, `getWorkOrderService`, etc.).
      - Aplica validaciones básicas de parámetros.
      - Maneja errores y códigos de estado HTTP.
      - Traduce el resultado de los servicios de aplicación a **JSON**.

- **Middlewares de presentación**:
  - `jwt.verify`: valida el token, carga el usuario y su `profile` para las reglas de negocio.
  - `requireLaboratory`: restringe ciertas rutas al perfil de laboratorio.
  - `transaction`: asegura coherencia transaccional entre operaciones de infraestructura.

#### 2. Capa de aplicación (`src/application`)

- **Servicios de aplicación** (ej.: `EssayApplicationService`):
  - Orquestan procesos de negocio: creación de ensayos, emisión de órdenes de trabajo, recepción de muestras, carga de resultados, emisión de informes, etc.
  - Reciben un **contexto** con:
    - Usuario actual (`context.user`),
    - Servicios de dominio (por ejemplo `essayDomainService`, `essayPermissionService`),
    - Repositorios (`essayRepository`, `workOrderRepository`, `sampleRepository`),
    - Servicios externos (`documentService`, `envService`, etc.).
  - Aplican:
    - Reglas por perfil (`LABORATORY`, oficina, etc.).
    - Validaciones cruzadas (cliente válido, plantillas de elementos, cantidad de muestras, etc.).
    - Lógica de auditoría mediante `EssayAuditLogApplicationService` (registro de eventos como `REQUEST_CREATED`, `SAMPLES_RECEIVED`, `REPORT_ISSUED`).
  - Devuelven **DTOs** (`EssayDTO`, `WorkOrderDTO`, `SampleDTO`) listos para serializar a JSON.

- **DTOs** (`src/application/**/dto`):
  - Representan datos de entrada/salida de casos de uso.
  - Incorporan validaciones específicas de contrato (campos requeridos, tipos, etc.).
  - Facilitan la traducción entre formato persistido, dominio y API.

#### 3. Capa de dominio (`src/domain`)

- **Entidades**:
  - `Essay`: modelo central del ensayo, con estado único (`REQUESTED`, `ACCEPTED`, `IN_WORK`, `COMPLETED`, etc.).
    - Métodos de negocio: `accept`, `reject`, `setTerms`, `createContract`, `markAsInWork`, `finish`, `generateReportConfig`, etc.
  - `WorkOrder`: orden de trabajo asociada a un ensayo, con validaciones para emisión de informe, muestras, etc.
  - `EssayClient`, `Client`, `Document`, etc.

- **Value Objects**:
  - `Terms`: agrupa días de realización, precio, días de conservación de muestras.
  - `EssayAuditEvent`, `WorkOrderAuditEvent`: códigos de auditoría.
  - `SampleStatus`: estados de una muestra.

- **Servicios de dominio**:
  - Encapsulan reglas más complejas que afectan a varias entidades (por ejemplo, permisos, validaciones de elementos a ensayar, generación de códigos de muestras).

- **Interfaces de repositorio**:
  - `IEssayRepository`, `IClientRepository`, etc.: definen los métodos que la capa de aplicación espera, independizándose de Sequelize o de la base de datos concreta.

#### 4. Capa de infraestructura (`src/infrastructure`)

- **Modelos Sequelize (`src/infrastructure/models`)**:
  - Modelos de base de datos para ensayos, clientes, usuarios, documentos, tipos, etc.
  - Definen asociaciones y columnas.

- **Repositorios (`src/infrastructure/repositories`)**:
  - Implementaciones concretas de los repositorios de dominio, por ejemplo `EssayRepository`:
    - Ejecuta consultas ORM (incluyendo joins complejos).
    - Mapea resultados a entidades de dominio (`Essay`, `EssayClient`, `EssayElements`, `Terms`).
    - Implementa generación de códigos de ensayo, actualización de snapshots de cliente, etc.

- **Migraciones (`src/infrastructure/migrations`)**:
  - Scripts de evolucion de esquema, ejecutados con Umzug (`run-migrations.js`).
  - Cambios recientes incluyen campos como `modified_at`, `closed_at`, `uncertainty`, etc., para órdenes de trabajo y ensayos.

- **Servicios de infraestructura**:
  - Generación de **documentos PDF** (`DocumentInfrastructureService` + Puppeteer + Handlebars).
  - Integración con **S3/R2** para almacenamiento de documentos.
  - **Redis** para caché y otros servicios compartidos.

- **Plantillas de documentos (`src/infrastructure/templates/essays_forms/*.html`)**:
  - Formularios normalizados (ej. `fpc151.html`, `fpc161.html`) usados para generar PDFs de solicitudes, contratos, informes.

#### 5. Capa compartida (`src/shared`)

- **`serviceFactory` y DI**:
  - Construye servicios de aplicación a partir de un **contenedor de dependencias**, usando `services.config.json`.
  - Permite:
    - Reemplazar implementaciones (por ejemplo, repositorios, servicios de documentos).
    - Inyectar contexto por request (usuario, transacción, logger, etc.).

---

### Frontend `oficina.ctmueble.com.ar`

#### 1. Entrada y ruteo (`src/main.jsx`, `src/App.jsx`)

- **`main.jsx`**:
  - Monta la aplicación React en `#root` usando `StrictMode`.
- **`App.jsx`**:
  - Envuelve toda la app en varios **providers de contexto**:
    - `ThemeProvider`: tema claro/oscuro y estilos globales.
    - `ToastProvider`: notificaciones.
    - `DataCacheProvider`: caché de datos comunes (usuario, catálogos, etc.).
    - `AuthProvider`: estado de autenticación.
    - `EssayDraftProvider`: estado del borrador de solicitud de ensayo.
  - Configura `BrowserRouter` y rutas:
    - Públicas: `/login`, `/register`.
    - Privadas (dentro de `PrivateLayout`): `/dashboard`, `/essay-request`, `/essay/:id`, `/samples`, `/samples/:id`, `/clients`, `/clients/:id`.
    - Ruta comodín que redirige a `Login`.

#### 2. Contextos de estado (`src/context`)

- **`AuthContext`**:
  - Determina si el usuario está autenticado (`isAuthenticated`).
  - Usa `AuthService` y `DataCacheContext` para:
    - `login`, `register`, `logout`.
    - Cargar/limpiar la información del usuario.
  - Reacciona a cambios en `localStorage` (evento `storage`) para mantener la sesión sincronizada entre pestañas.

- **`DataCacheContext`**:
  - Cachea datos frecuentemente usados (usuario, tipos de ensayo, etc.), evitando llamadas repetidas a la API.

- **`EssayDraftContext`**:
  - Mantiene el estado de la solicitud de ensayo en múltiples pasos (cliente, tipo de ensayo, términos, etc.), permitiendo un flujo tipo “wizard”.

- **`ThemeContext`**:
  - Maneja el tema visual de la aplicación (modo claro/oscuro, Tailwind + DaisyUI).

- **`ToastContext`**:
  - Proporciona APIs para mostrar mensajes de éxito/error informativos en la UI.

#### 3. Servicios de API (`src/services`)

- **`axios.js`**:
  - Configura una instancia Axios con:
    - `baseURL` = `env.API_URL`.
    - `withCredentials: true` para permitir cookies si se usan.
    - Interceptor que agrega automáticamente `Authorization: Bearer <token>` desde `localStorage`.

- **Servicios específicos**:
  - `AuthService`: login, register, logout, verificación de token.
  - `clientsService`, `essaysService`, `samplesService`, `documentsService`, `usersService`, etc.
  - Encapsulan las rutas del backend (`/clients`, `/essays`, `/samples`, etc.) y devuelven datos ya procesados.

#### 4. DTOs de frontend (`src/api/dtos`)

- Archivos como `clients.js`, `essays.js`, `samples.js`, etc.:
  - Adaptan las formas de los datos entre:
    - El JSON que expone el backend.
    - Los modelos que la UI espera (nombres de campos, estructuras anidadas).
  - Permiten mantener desacoplado el frontend de detalles de implementación del backend.

#### 5. Componentes y páginas (`src/components`, `src/pages`)

- **Páginas**:
  - `Login`, `Register`: flujo de autenticación.
  - `Dashboard`: vista general de ensayos, métricas o accesos rápidos.
  - `EssayRequest`: flujo multi-paso para crear una solicitud de ensayo (usa `steps/essay-request`).
  - `EssayDetail`: detalle de un ensayo, con documentos, auditorías, etc.
  - `Samples`, `WorkOrderDetail`: vistas orientadas al laboratorio.
  - `Clients`, `ClientDetail`: gestión de clientes y su detalle.

- **Componentes reutilizables**:
  - Estructura general: `Header`, `Sidebar`, `PrivateLayout`.
  - Listados y tablas: `DataGrid`, `StyledTable`, `EssayCard`, `EssayCardSkeleton`, `WorkOrderCard`, `ClientCard`.
  - Formularios y flujos: `Stepper`, componentes en `steps/essay-request` y `steps/client-creation` (`ApplicantStep`, `RepresentativeStep`, `AddressStep`, `BillingStep`, etc.).
  - Modales: `Modal`, `CreateClientModal`, `ConfigModal`, `RejectEssayModal`, `ReceiveSamplesModal`, `SelectCreateModal`, `Client` y `Contact` en `components/modals`.
  - Utilidad: `SearchBar`, `ErrorAlert`, `ProcessProgressBar`, botones (`buttons/Back`).

#### 6. DI y configuración de servicios en frontend (`src/shared/di`)

- **`services.config.json`, `serviceRegistry.js`, `serviceClusterManager.js`, `container.js`**:
  - Implementan un **mini contenedor de dependencias** en frontend.
  - Agrupan servicios por “cluster” (por ejemplo, cluster de clientes, cluster de ensayos).
  - Permiten:
    - Resolver servicios por nombre/cluster.
    - Reemplazar implementaciones para test o entornos distintos.
  - Buscan mantener los componentes relativamente desacoplados de las implementaciones concretas de servicios.

---

### Integración Frontend–Backend

- **Comunicación**:
  - El frontend apunta a `env.API_URL`, que debe coincidir con la URL del backend Express.
  - Todas las peticiones pasan por la instancia Axios configurada, incluyendo el JWT en el header `Authorization`.

- **Autenticación**:
  - El backend expone `/auth` (login, registro, etc.), genera un JWT.
  - El frontend guarda el token en `localStorage` (`access_token`).
  - `verifyJWT` protege la mayoría de las rutas `/users`, `/clients`, `/essays`, `/samples`, etc.
  - El perfil (`profile`) del usuario se usa para aplicar reglas de negocio (por ejemplo: solo `LABORATORY` puede acceder a ciertas operaciones).

- **CORS**:
  - Backend permite orígenes como `http://localhost:5173` y dominios Vercel configurados.
  - Soporta credenciales y expone cabeceras para descargas de documentos (`Content-Disposition`).

---

### Resumen

- **Backend**: arquitectura en capas con fuerte énfasis en dominio (entidades + servicios) y servicios de aplicación que orquestan repositorios, auditoría y generación de documentos.
- **Frontend**: SPA modular en React, con contextos para estado transversal, servicios para acceso a API, DTOs para adaptación de datos y una capa de DI ligera.
- **Integración**: todo el flujo de ensayos, órdenes de trabajo y documentos está expuesto vía API REST segura con JWT y consumido por el frontend a través de servicios especializados.

---

### Detalles por sección de código

Esta sección profundiza “qué hace cada cosa” según la arquitectura descripta, para que puedas localizar fácilmente la responsabilidad de cada archivo o carpeta.

---

### Backend – Detalle por capa y archivos típicos

#### `src/app.js` – Configuración del servidor HTTP

- **Responsabilidad**: arrancar Express y conectar middlewares, rutas y configuración de entorno.
- **Qué hace**:
  - Carga variables de entorno con `dotenv` (si existe `.env`) y avisa si falta `DATABASE_URL`.
  - Crea la aplicación Express (`const app = express()`).
  - Configura **CORS** con una lista de orígenes permitidos (`allowed_origins`).
  - Registra middlewares globales:
    - `cookieParser`: leer cookies entrantes.
    - `transactionMiddleware`: abrir/cerrar transacciones de BD por request.
    - `bodyParser.json` / `bodyParser.urlencoded`: parsear cuerpos de requests.
  - Registra routers por recurso:
    - `/auth`, `/users`, `/clients`, `/bussiness`, `/persons`, `/env`, `/types`, `/samples`, `/essays`, etc.
    - En `/essays` agrega una lógica especial para permitir tokens en query al descargar documentos (para descargas en nueva pestaña).
  - Publica **Swagger UI** en `/api-docs` para documentar y probar la API.
  - Define manejadores de errores 404 (recurso no encontrado) y 500 (error interno).
  - Si se ejecuta directamente (`require.main === module`), levanta el servidor con `app.listen`; si no, exporta `app` para un entorno serverless.

#### `src/presentation/routes/*.routes.js` – Definición de endpoints

- **Responsabilidad**: mapear URLs HTTP a controladores.
- **Qué hace**:
  - Crea un `router` de Express para cada recurso (ensayos, clientes, muestras, etc.).
  - Declara rutas con sus verbos:
    - Ejemplo `essays.routes.js`: `GET /get`, `GET /fetch`, `POST /create`, `PUT /:id/client`, endpoints de documentos, muestras, auditoría, etc.
  - No implementa lógica de negocio: solo dice “esta URL llama a este método del controlador”.

#### `src/presentation/controllers/*.controller.js` – Adaptadores HTTP ↔ Casos de uso

- **Responsabilidad**: traducir el request HTTP al lenguaje de la aplicación y devolver una respuesta HTTP.
- **Qué hace** (ejemplo `essays.controller.js`):
  - Usa `buildContext(req)` y `serviceFactory` para obtener servicios de aplicación (`getEssayService`, `getWorkOrderService`, etc.) ya configurados con:
    - Usuario autenticado (`req.user`),
    - Transacción activa,
    - Logger, servicios compartidos, etc.
  - Cada método del controlador:
    - Extrae parámetros desde `req.params`, `req.query`, `req.body`.
    - Valida datos mínimos (por ejemplo, que exista `id` o `essayId`).
    - Llama al método correspondiente del servicio de aplicación (`essayService.getEssay`, `essayService.createEssay`, `essayService.emitReport`, etc.).
    - Maneja errores y elige el código de estado HTTP adecuado (`200`, `400`, `404`, `500`).
  - En endpoints de descarga de documentos:
    - Recibe un objeto con la estrategia de descarga (`type: 'local' | 'r2' | 'external-url'`).
    - Configura cabeceras (`Content-Type`, `Content-Disposition`) y utiliza:
      - `res.download` para archivos locales,
      - `stream.pipe(res)` para streams,
      - Proxy HTTP (`fetch` + `Readable.fromWeb`) para URLs externas.

#### `src/application/**/services/*ApplicationService.js` – Casos de uso

- **Responsabilidad**: implementar los flujos de negocio completos usando entidades de dominio, repositorios y servicios externos.
- **Qué hace** (ejemplo `EssayApplicationService`):
  - Se construye con un objeto `{ context }` que incluye:
    - Usuario (`context.user`),
    - Repositorios (`essayRepository`, `workOrderRepository`, `sampleRepository`, etc.),
    - Servicios de dominio (`essayDomainService`, `essayPermissionService`, `sampleDomainService`, etc.),
    - Servicios externos (`documentService`, `envService`, `essayAuditLogService`, etc.).
  - Implementa métodos de alto nivel:
    - `getEssay(id)`: trae el ensayo, decide si debe incluir orden de trabajo y muestras, obtiene auditoría y devuelve un `EssayDTO` enriquecido.
    - `getAllEssays(filters)`: aplica filtros por código/estado y mapea a DTOs.
    - `createEssay(data)`:
      - Valida y resuelve la plantilla de elemento (`elementTemplateService`).
      - Obtiene y valida el cliente (`clientService`).
      - Genera código de ensayo (`essayRepository.getNextEssayCodeForDate`).
      - Construye la entidad `Essay`, la guarda y asocia el snapshot de cliente (`EssayClient`).
      - Registra eventos de auditoría (solicitud creada, asociación de cliente).
      - Genera y adjunta el documento de solicitud de ensayo (F‑PC13‑01).
    - `receiveSamples(essayId, data)`:
      - Si las muestras se rechazan: actualiza el ensayo a `CANCELLED`, añade observaciones y registra auditoría.
      - Si se aceptan:
        - Genera código de orden de trabajo, fechas y dimensiones.
        - Crea `WorkOrder` y todas las `Sample` con sus códigos (muestras y contramuestras).
        - Guarda las muestras, actualiza el estado del ensayo a `IN_WORK`.
        - Genera el documento de recepción de muestras (F‑PC16‑01) y registra auditoría de ensayo y orden.
    - `loadSampleResults(results)`: actualiza resultados de muestras, recalcula `average_value` de órdenes, valida permisos y registra eventos de auditoría.
    - `createContract(id, termsData)`: crea `Terms`, cambia el estado del ensayo, genera el contrato (F‑PC13‑02) y registra auditoría.
    - `emitReport(id)`: decide si es informe original, modificación o copia; valida la orden y las muestras; actualiza estados; registra `REPORT_ISSUED` y genera el informe (F‑PC15‑01).
  - Siempre devuelve DTOs o estructuras listas para serializar a JSON o pasar a generadores de documentos.

#### `src/domain/**` – Entidades y value objects de negocio

- **Responsabilidad**: representar el modelo del negocio y sus reglas, independientes de HTTP y de la base de datos.
- **Qué hace** (ejemplo `domain/essays/entities/Essay.js`):
  - Define los atributos del ensayo: cliente, tipo, fechas, estado, código, elementos, términos, orden de trabajo, etc.
  - Implementa la máquina de estados:
    - `accept` / `reject` solo se pueden ejecutar desde `REQUESTED`.
    - `setTerms` y `createContract` solo desde `ACCEPTED` y con términos completos.
    - `markAsInWork` solo desde `SERVICE_AGREEMENT_MADED`.
    - `finish` solo desde `IN_WORK` y fija `finishDate`.
  - Gestiona observaciones (`appendObservations`).
  - Decide el tipo de informe a emitir:
    - `determineReportEmissionType` y `generateReportConfig` usan:
      - Informes ya emitidos (originales, copias, modificaciones),
      - Último evento de auditoría,
      - Cambios en la orden después del informe,
      para decidir si corresponde ORIGINAL, MODIFICACIÓN o COPIA y generar metadata para la plantilla.
  - Expone `toPlain` para transformar la entidad en un objeto plano apto para plantillas y serialización.
- **Otras entidades y value objects**:
  - `WorkOrder`: valida que haya suficientes muestras con resultados antes de permitir emitir un informe.
  - `EssayClient`, `EssayElements`: encapsulan los detalles del solicitante y del elemento a ensayar.
  - `Terms`: asegura que los términos del servicio estén completos y consistentes.
  - `EssayAuditEvent`, `WorkOrderAuditEvent`, `SampleStatus`: modelan estados/códigos de auditoría y estado de las muestras.

#### `src/infrastructure/**` – Repositorios, modelos y servicios técnicos

- **Responsabilidad**: adaptar el dominio a la base de datos, archivo, Redis, S3/R2, etc.
- **Repositorios Sequelize** (ejemplo `infrastructure/repositories/essays/EssayRepository.js`):
  - Implementan la interfaz `IEssayRepository`.
  - Usan modelos de Sequelize (`EssayModel`, `EssayClientModel`, `Elements`, `Terms`, `Document`, etc.) y `include` para traer relaciones.
  - Convierten filas de BD en entidades de dominio usando `mapToDomain`:
    - Limpian estructuras propias de Sequelize (`dataValues`, metadata interna).
    - Componen objetos como `EssayClient`, `EssayElements`, `Terms` a partir de múltiples tablas.
  - Implementan operaciones específicas:
    - `save` / `update`: para persistir cambios de `Essay`.
    - `saveEssayClient` / `updateEssayClient`: para snapshots de cliente; marcan `last_update` al modificar.
    - `getNextEssayCodeForDate`: genera códigos únicos tipo `yymmdd + letra`.
    - `getTypes`: devuelve la lista de tipos de ensayo desde la tabla `EssayType`.
- **Modelos Sequelize (`src/infrastructure/models`)**:
  - Definen las tablas, columnas y asociaciones (uno a uno, uno a muchos, etc.).
  - Son usados exclusivamente desde los repositorios.
- **Migraciones (`src/infrastructure/migrations`)**:
  - Scripts para crear/modificar tablas y columnas (por ejemplo, `last_update`, `uncertainty`, `samples_received_at`, `closed_at`).
  - Se ejecutan con Umzug desde scripts de `package.json` (`migrate`, `migrate:up`, etc.).
- **Servicios de documentos y plantillas**:
  - Plantillas HTML (`src/infrastructure/templates/essays_forms/*.html`) + Handlebars:
    - Reciben contextos ricos (Essay, WorkOrder, muestras, metadata) y generan HTML.
  - Puppeteer:
    - Renderiza HTML a PDF.
  - Integración con S3/R2:
    - Guarda y recupera PDFs, devolviendo paths locales, streams o URLs externas a la capa de aplicación/controlador.

#### `src/shared/**` – Service factory / DI

- **Responsabilidad**: ensamblar los servicios con sus dependencias según configuración.
- **Qué hace**:
  - Lee `services.config.json` para saber qué implementación concreta corresponde a cada interfaz (repositorios, servicios de aplicación, servicios de documentos, etc.).
  - Expone helpers como `getEssayService`, `getWorkOrderService`, `getDocumentService`, etc., que:
    - Construyen el contexto (`buildContext(req)`).
    - Resuelven cada dependencia desde el contenedor (repositorios, servicios de dominio, logger, cliente Redis, etc.).
  - Permite cambiar implementaciones (por ejemplo, fakes o mocks) sin modificar controladores ni servicios de aplicación.

---

### Frontend – Detalle por carpetas y roles

#### `src/main.jsx` y `src/App.jsx` – Entrada y ruteo

- **`main.jsx`**:
  - Importa estilos globales (`index.css`).
  - Monta la aplicación con `createRoot` en el elemento `#root`.
  - Envuelve la app en `StrictMode` para tener validaciones extra en desarrollo.
- **`App.jsx`**:
  - Enlaza todos los **providers de contexto**:
    - `ThemeProvider`, `ToastProvider`, `DataCacheProvider`, `AuthProvider`, `EssayDraftProvider`.
  - Define el enrutado con `BrowserRouter` y `Routes`:
    - Rutas públicas (`/login`, `/register`).
    - Rutas protegidas envueltas por `PrivateLayout` (`/dashboard`, `/essay-request`, `/essay/:id`, `/samples`, `/samples/:id`, `/clients`, `/clients/:id`).
  - `PrivateLayout` suele:
    - Verificar si el usuario está autenticado.
    - Renderizar la estructura principal (sidebar, header, contenido).

#### `src/context/*.jsx` – Estado global y lógica transversal

- **`AuthContext`**:
  - Mantiene `isAuthenticated` y la información del `user`.
  - Usa `AuthService` para:
    - `login` y `register`: guarda token, marca autenticado y carga datos del usuario.
    - `logout`: limpia token, marca no autenticado y limpia el usuario.
  - Usa `DataCacheContext` para cachear los datos del usuario.
  - Escucha el evento `storage` del navegador para sincronizar sesión entre pestañas.
- **`DataCacheContext`**:
  - Almacena datos “globales” frecuentemente usados (usuario, catálogos de tipos de ensayo, etc.).
  - Los servicios consultan primero el caché antes de ir a la API.
- **`EssayDraftContext`**:
  - Mantiene el borrador de solicitud de ensayo durante el flujo multi‑paso:
    - Cliente seleccionado, tipo de ensayo, elementos, términos, observaciones, etc.
  - Provee funciones para avanzar/retroceder pasos y resetear el borrador.
- **`ThemeContext`**:
  - Gestiona el tema visual (claro/oscuro).
  - Suele integrarse con Tailwind/DaisyUI y puede persistir la preferencia del usuario.
- **`ToastContext`**:
  - Proporciona funciones para mostrar notificaciones (éxito, error, info) desde cualquier componente.

#### `src/services/*.js` – Acceso a la API y lógica de red

- **`axios.js`**:
  - Crea una instancia compartida de Axios:
    - `baseURL` apuntando a `env.API_URL` (el backend Express).
    - `withCredentials: true` si se usan cookies.
    - Interceptor de request que:
      - Lee `access_token` desde `localStorage`.
      - Si existe, agrega `Authorization: Bearer <token>` al header.
- **Servicios específicos**:
  - `AuthService`: login, registro, logout, comprobación de token.
  - `clientsService`, `essaysService`, `samplesService`, `documentsService`, `usersService`, etc.:
    - Encapsulan las llamadas a endpoints (`/clients`, `/essays/fetch`, `/essays/create`, `/samples`, etc.).
    - Pueden usar DTOs de `src/api/dtos` para adaptar estructuras antes de retornar a la UI.

#### `src/api/dtos/*.js` – Adaptación de datos entre API y UI

- **Responsabilidad**: convertir estructuras crudas de la API en objetos amigables para la UI (y viceversa).
- **Qué suelen hacer**:
  - Renombrar campos (`request_date` → `requestDate`, `finish_date` → `finishDate`).
  - Aplanar o reorganizar estructuras anidadas (cliente, direcciones, contactos).
  - Asegurar valores por defecto (listas vacías en lugar de `null`, etc.).
- Esto reduce acoplamiento:
  - La UI no depende directamente de la forma exacta del JSON del backend.
  - Cambios en el backend se concentran en los DTOs en lugar de en todos los componentes.

#### `src/components` y `src/pages` – UI y flujos

- **`src/pages/*.jsx` (páginas)**:
  - Son las vistas de alto nivel, normalmente asociadas a rutas.
  - Usan contextos y servicios para:
    - `Login` / `Register`: autenticar usuarios.
    - `Dashboard`: mostrar resúmenes de ensayos, órdenes de trabajo, etc.
    - `EssayRequest`: orquestar el flujo multi‑paso de crear una solicitud de ensayo usando `EssayDraftContext` y componentes de `steps/essay-request`.
    - `EssayDetail`: mostrar detalles completos de un ensayo, incluyendo documentos, auditoría, orden de trabajo, etc.
    - `Samples` / `WorkOrderDetail`: vistas para el laboratorio donde se gestionan órdenes de trabajo y muestras.
    - `Clients` / `ClientDetail`: listado y detalle de clientes.
- **`src/components` (componentes reutilizables)**:
  - **Estructura y layout**:
    - `Header`, `Sidebar`, `PrivateLayout`: definen la estructura principal, navegación y shell de la aplicación.
  - **Presentación de datos**:
    - `DataGrid`, `StyledTable`: muestran tablas de datos con estilos, ordenamiento/paginación según el caso.
    - `EssayCard`, `EssayCardSkeleton`, `WorkOrderCard`, `ClientCard`: tarjetas específicas para ensayos, órdenes y clientes.
  - **Flujos multi‑paso**:
    - `Stepper`: indica visualmente el progreso de un wizard.
    - `steps/essay-request/*`: pasos concretos del flujo de solicitud de ensayo (selección de cliente, tipo de ensayo, confirmación).
    - `steps/client-creation/*`: pasos para crear un cliente en varias pantallas (datos de solicitante, representante, dirección, facturación).
  - **Modales**:
    - `CreateClientModal`, `ConfigModal`, `RejectEssayModal`, `ReceiveSamplesModal`, `SelectCreateModal`, `modals/Client`, `modals/Contact`:
      - Se usan para acciones puntuales sin abandonar la pantalla actual (crear cliente rápido, configurar términos, rechazar ensayo, recibir muestras, etc.).
  - **Utilitarios**:
    - `SearchBar`: componente de búsqueda reutilizable con filtros y quizás debounce.
    - `ErrorAlert`: muestra mensajes de error estructurados.
    - `ProcessProgressBar`: representa el avance de procesos largos.
    - Botones específicos (`buttons/Back`, etc.) con estilos y comportamiento coherentes en toda la app.

#### `src/shared/di/*` – Inyección de dependencias en frontend

- **Responsabilidad**: resolver servicios por nombre/cluster para desacoplar la UI de las implementaciones concretas.
- **Qué hace**:
  - `services.config.json`: describe los servicios disponibles y cómo se agrupan en “clusters” (por ejemplo, cluster de clientes, cluster de ensayos).
  - `serviceRegistry`, `serviceClusterManager`, `container`:
    - Permiten hacer `container.resolve('clientsService')` sin conocer el detalle de implementación.
    - Hacen posible reemplazar servicios por mocks o versiones alternativas en test o en entornos distintos.
  - Con esto, los componentes y hooks pueden depender de interfaces lógicas en vez de depender directamente de archivos concretos.

### Visión general del sistema

El sistema está compuesto por **dos aplicaciones principales**:

- **Backend `gestion.ctmueble.com.ar`**: API REST sobre Node.js/Express, con arquitectura por capas (presentación, aplicación, dominio, infraestructura) y base de datos relacional vía Sequelize.
- **Frontend `oficina.ctmueble.com.ar`**: SPA en React (Vite + React Router) consumiendo la API del backend, orientada al flujo de oficina (solicitudes de ensayo, clientes, muestras, etc.).

El objetivo es gestionar el ciclo completo de un ensayo (solicitud → contrato → recepción de muestras → trabajo de laboratorio → informe) y la información relacionada (clientes, órdenes de trabajo, documentos, etc.).

---

### Principios de diseño

- **Separación de responsabilidades por capas**: presentación, aplicación, dominio e infraestructura claramente diferenciadas en el backend; en el frontend se separan páginas, componentes, servicios y contextos.
- **Modelo de Dominio Rico (DDD light)**: entidades y value objects encapsulan reglas de negocio (por ejemplo `Essay`, `WorkOrder`, `Terms`, `SampleStatus`).
- **Servicios de aplicación como orquestadores**: coordinan casos de uso usando entidades de dominio, repositorios y servicios externos (por ejemplo `EssayApplicationService`).
- **Repositorios como puentes a infraestructura**: interfaces de dominio (`IEssayRepository`, etc.) con implementaciones Sequelize en infraestructura (`EssayRepository`).
- **DTOs y mapeos**: conversión entre entidades de dominio, DTOs de aplicación y respuestas JSON de la API.
- **Inyección de dependencias / Service Factory**: uso de un contenedor e inyección configurada por JSON tanto en backend (`shared/serviceFactory`) como en frontend (`shared/di`).
- **Autenticación centralizada con JWT**: middleware `verifyJWT` en backend y `AuthService` + interceptor Axios en frontend.
- **CORS y seguridad**: configuración explícita de orígenes permitidos y control de acceso por perfil de usuario (`profile`).

---

### Backend `gestion.ctmueble.com.ar`

#### 1. Capa de presentación (`src/app.js`, `src/presentation`)

- **`src/app.js`**:
  - Configura **Express**, `cors`, `body-parser`, `cookie-parser`.
  - Carga `.env` si existe y avisa si falta `DATABASE_URL`.
  - Registra middlewares globales:
    - `transactionMiddleware`: maneja transacciones de base de datos por request.
    - `verifyJWT`: valida JWT y adjunta el usuario a `req.user`.
  - Define rutas montadas:
    - `/auth`, `/users`, `/clients`, `/bussiness`, `/persons`, `/env`, `/types`, `/samples`, `/essays`, etc.
    - En `/essays` agrega lógica especial para tokens en query al descargar documentos.
  - Expone **Swagger UI** en `/api-docs`.
  - Maneja errores 404 y 500.
  - Soporta modo servidor Express tradicional (`app.listen`) y modo serverless (exportando `app`).

- **Rutas y controladores (`src/presentation/routes`, `src/presentation/controllers`)**:
  - Cada recurso tiene:
    - **Router** Express (por ejemplo `essays.routes.js`) que define endpoints (`/get`, `/create`, `/download-document`, etc.).
    - **Controller** (por ejemplo `essays.controller.js`) que:
      - Construye un **contexto de request** (`buildContext(req)`).
      - Obtiene el servicio de aplicación adecuado vía `serviceFactory` (`getEssayService`, `getWorkOrderService`, etc.).
      - Aplica validaciones básicas de parámetros.
      - Maneja errores y códigos de estado HTTP.
      - Traduce el resultado de los servicios de aplicación a **JSON**.

- **Middlewares de presentación**:
  - `jwt.verify`: valida el token, carga el usuario y su `profile` para las reglas de negocio.
  - `requireLaboratory`: restringe ciertas rutas al perfil de laboratorio.
  - `transaction`: asegura coherencia transaccional entre operaciones de infraestructura.

#### 2. Capa de aplicación (`src/application`)

- **Servicios de aplicación** (ej.: `EssayApplicationService`):
  - Orquestan procesos de negocio: creación de ensayos, emisión de órdenes de trabajo, recepción de muestras, carga de resultados, emisión de informes, etc.
  - Reciben un **contexto** con:
    - Usuario actual (`context.user`),
    - Servicios de dominio (por ejemplo `essayDomainService`, `essayPermissionService`),
    - Repositorios (`essayRepository`, `workOrderRepository`, `sampleRepository`),
    - Servicios externos (`documentService`, `envService`, etc.).
  - Aplican:
    - Reglas por perfil (`LABORATORY`, oficina, etc.).
    - Validaciones cruzadas (cliente válido, plantillas de elementos, cantidad de muestras, etc.).
    - Lógica de auditoría mediante `EssayAuditLogApplicationService` (registro de eventos como `REQUEST_CREATED`, `SAMPLES_RECEIVED`, `REPORT_ISSUED`).
  - Devuelven **DTOs** (`EssayDTO`, `WorkOrderDTO`, `SampleDTO`) listos para serializar a JSON.

- **DTOs** (`src/application/**/dto`):
  - Representan datos de entrada/salida de casos de uso.
  - Incorporan validaciones específicas de contrato (campos requeridos, tipos, etc.).
  - Facilitan la traducción entre formato persistido, dominio y API.

#### 3. Capa de dominio (`src/domain`)

- **Entidades**:
  - `Essay`: modelo central del ensayo, con estado único (`REQUESTED`, `ACCEPTED`, `IN_WORK`, `COMPLETED`, etc.).
    - Métodos de negocio: `accept`, `reject`, `setTerms`, `createContract`, `markAsInWork`, `finish`, `generateReportConfig`, etc.
  - `WorkOrder`: orden de trabajo asociada a un ensayo, con validaciones para emisión de informe, muestras, etc.
  - `EssayClient`, `Client`, `Document`, etc.

- **Value Objects**:
  - `Terms`: agrupa días de realización, precio, días de conservación de muestras.
  - `EssayAuditEvent`, `WorkOrderAuditEvent`: códigos de auditoría.
  - `SampleStatus`: estados de una muestra.

- **Servicios de dominio**:
  - Encapsulan reglas más complejas que afectan a varias entidades (por ejemplo, permisos, validaciones de elementos a ensayar, generación de códigos de muestras).

- **Interfaces de repositorio**:
  - `IEssayRepository`, `IClientRepository`, etc.: definen los métodos que la capa de aplicación espera, independizándose de Sequelize o de la base de datos concreta.

#### 4. Capa de infraestructura (`src/infrastructure`)

- **Modelos Sequelize (`src/infrastructure/models`)**:
  - Modelos de base de datos para ensayos, clientes, usuarios, documentos, tipos, etc.
  - Definen asociaciones y columnas.

- **Repositorios (`src/infrastructure/repositories`)**:
  - Implementaciones concretas de los repositorios de dominio, por ejemplo `EssayRepository`:
    - Ejecuta consultas ORM (incluyendo joins complejos).
    - Mapea resultados a entidades de dominio (`Essay`, `EssayClient`, `EssayElements`, `Terms`).
    - Implementa generación de códigos de ensayo, actualización de snapshots de cliente, etc.

- **Migraciones (`src/infrastructure/migrations`)**:
  - Scripts de evolucion de esquema, ejecutados con Umzug (`run-migrations.js`).
  - Cambios recientes incluyen campos como `modified_at`, `closed_at`, `uncertainty`, etc., para órdenes de trabajo y ensayos.

- **Servicios de infraestructura**:
  - Generación de **documentos PDF** (`DocumentInfrastructureService` + Puppeteer + Handlebars).
  - Integración con **S3/R2** para almacenamiento de documentos.
  - **Redis** para caché y otros servicios compartidos.

- **Plantillas de documentos (`src/infrastructure/templates/essays_forms/*.html`)**:
  - Formularios normalizados (ej. `fpc151.html`, `fpc161.html`) usados para generar PDFs de solicitudes, contratos, informes.

#### 5. Capa compartida (`src/shared`)

- **`serviceFactory` y DI**:
  - Construye servicios de aplicación a partir de un **contenedor de dependencias**, usando `services.config.json`.
  - Permite:
    - Reemplazar implementaciones (por ejemplo, repositorios, servicios de documentos).
    - Inyectar contexto por request (usuario, transacción, logger, etc.).

---

### Frontend `oficina.ctmueble.com.ar`

#### 1. Entrada y ruteo (`src/main.jsx`, `src/App.jsx`)

- **`main.jsx`**:
  - Monta la aplicación React en `#root` usando `StrictMode`.
- **`App.jsx`**:
  - Envuelve toda la app en varios **providers de contexto**:
    - `ThemeProvider`: tema claro/oscuro y estilos globales.
    - `ToastProvider`: notificaciones.
    - `DataCacheProvider`: caché de datos comunes (usuario, catálogos, etc.).
    - `AuthProvider`: estado de autenticación.
    - `EssayDraftProvider`: estado del borrador de solicitud de ensayo.
  - Configura `BrowserRouter` y rutas:
    - Públicas: `/login`, `/register`.
    - Privadas (dentro de `PrivateLayout`): `/dashboard`, `/essay-request`, `/essay/:id`, `/samples`, `/samples/:id`, `/clients`, `/clients/:id`.
    - Ruta comodín que redirige a `Login`.

#### 2. Contextos de estado (`src/context`)

- **`AuthContext`**:
  - Determina si el usuario está autenticado (`isAuthenticated`).
  - Usa `AuthService` y `DataCacheContext` para:
    - `login`, `register`, `logout`.
    - Cargar/limpiar la información del usuario.
  - Reacciona a cambios en `localStorage` (evento `storage`) para mantener la sesión sincronizada entre pestañas.

- **`DataCacheContext`**:
  - Cachea datos frecuentemente usados (usuario, tipos de ensayo, etc.), evitando llamadas repetidas a la API.

- **`EssayDraftContext`**:
  - Mantiene el estado de la solicitud de ensayo en múltiples pasos (cliente, tipo de ensayo, términos, etc.), permitiendo un flujo tipo “wizard”.

- **`ThemeContext`**:
  - Maneja el tema visual de la aplicación (modo claro/oscuro, Tailwind + DaisyUI).

- **`ToastContext`**:
  - Proporciona APIs para mostrar mensajes de éxito/error informativos en la UI.

#### 3. Servicios de API (`src/services`)

- **`axios.js`**:
  - Configura una instancia Axios con:
    - `baseURL` = `env.API_URL`.
    - `withCredentials: true` para permitir cookies si se usan.
    - Interceptor que agrega automáticamente `Authorization: Bearer <token>` desde `localStorage`.

- **Servicios específicos**:
  - `AuthService`: login, register, logout, verificación de token.
  - `clientsService`, `essaysService`, `samplesService`, `documentsService`, `usersService`, etc.
  - Encapsulan las rutas del backend (`/clients`, `/essays`, `/samples`, etc.) y devuelven datos ya procesados.

#### 4. DTOs de frontend (`src/api/dtos`)

- Archivos como `clients.js`, `essays.js`, `samples.js`, etc.:
  - Adaptan las formas de los datos entre:
    - El JSON que expone el backend.
    - Los modelos que la UI espera (nombres de campos, estructuras anidadas).
  - Permiten mantener desacoplado el frontend de detalles de implementación del backend.

#### 5. Componentes y páginas (`src/components`, `src/pages`)

- **Páginas**:
  - `Login`, `Register`: flujo de autenticación.
  - `Dashboard`: vista general de ensayos, métricas o accesos rápidos.
  - `EssayRequest`: flujo multi-paso para crear una solicitud de ensayo (usa `steps/essay-request`).
  - `EssayDetail`: detalle de un ensayo, con documentos, auditorías, etc.
  - `Samples`, `WorkOrderDetail`: vistas orientadas al laboratorio.
  - `Clients`, `ClientDetail`: gestión de clientes y su detalle.

- **Componentes reutilizables**:
  - Estructura general: `Header`, `Sidebar`, `PrivateLayout`.
  - Listados y tablas: `DataGrid`, `StyledTable`, `EssayCard`, `EssayCardSkeleton`, `WorkOrderCard`, `ClientCard`.
  - Formularios y flujos: `Stepper`, componentes en `steps/essay-request` y `steps/client-creation` (`ApplicantStep`, `RepresentativeStep`, `AddressStep`, `BillingStep`, etc.).
  - Modales: `Modal`, `CreateClientModal`, `ConfigModal`, `RejectEssayModal`, `ReceiveSamplesModal`, `SelectCreateModal`, `Client` y `Contact` en `components/modals`.
  - Utilidad: `SearchBar`, `ErrorAlert`, `ProcessProgressBar`, botones (`buttons/Back`).

#### 6. DI y configuración de servicios en frontend (`src/shared/di`)

- **`services.config.json`, `serviceRegistry.js`, `serviceClusterManager.js`, `container.js`**:
  - Implementan un **mini contenedor de dependencias** en frontend.
  - Agrupan servicios por “cluster” (por ejemplo, cluster de clientes, cluster de ensayos).
  - Permiten:
    - Resolver servicios por nombre/cluster.
    - Reemplazar implementaciones para test o entornos distintos.
  - Buscan mantener los componentes relativamente desacoplados de las implementaciones concretas de servicios.

---

### Integración Frontend–Backend

- **Comunicación**:
  - El frontend apunta a `env.API_URL`, que debe coincidir con la URL del backend Express.
  - Todas las peticiones pasan por la instancia Axios configurada, incluyendo el JWT en el header `Authorization`.

- **Autenticación**:
  - El backend expone `/auth` (login, registro, etc.), genera un JWT.
  - El frontend guarda el token en `localStorage` (`access_token`).
  - `verifyJWT` protege la mayoría de las rutas `/users`, `/clients`, `/essays`, `/samples`, etc.
  - El perfil (`profile`) del usuario se usa para aplicar reglas de negocio (por ejemplo: solo `LABORATORY` puede acceder a ciertas operaciones).

- **CORS**:
  - Backend permite orígenes como `http://localhost:5173` y dominios Vercel configurados.
  - Soporta credenciales y expone cabeceras para descargas de documentos (`Content-Disposition`).

---

### Resumen

- **Backend**: arquitectura en capas con fuerte énfasis en dominio (entidades + servicios) y servicios de aplicación que orquestan repositorios, auditoría y generación de documentos.
- **Frontend**: SPA modular en React, con contextos para estado transversal, servicios para acceso a API, DTOs para adaptación de datos y una capa de DI ligera.
- **Integración**: todo el flujo de ensayos, órdenes de trabajo y documentos está expuesto vía API REST segura con JWT y consumido por el frontend a través de servicios especializados.

