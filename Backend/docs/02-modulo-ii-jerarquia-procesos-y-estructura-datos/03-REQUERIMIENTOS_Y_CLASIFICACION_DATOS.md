# Módulo II — Estructura Inicial de Datos y Clasificación por Proceso

Para transformar los procesos analizados en una estructura de información sólida previa al diseño físico (Módulo III), este documento define primero la **estructura lógica inicial de entidades, atributos y relaciones** y luego detalla la **clasificación exhaustiva de datos requeridos por cada uno de los 9 procesos del sistema**.

---

## Introducción a la Estructura de Datos y Modelo Inicial de Base de Datos

### A. Entidades Principales Identificadas

- **Seguridad y Usuarios:** `users`, `laboratories`, `laboratories_members` (`laboratory_members`), `laboratory_permissions`, `user_sessions`, `user_recovery_codes`, `user_trusted_devices`, `email_verifications`, `password_resets`, `system_api_keys`, `security_audit_logs`.
- **Catálogos y Configuración:** `types_countries`, `types_districts`, `types_documents`, `types_essays`, `environment_variables`, `daily_sequence_counters`.
- **Empresas y Clientes:** `bussiness`, `bussiness_address`, `persons`, `clients`, `clients_contacts`.
- **Ensayos y Solicitudes (`F-PC13-02`):** `essays`, `essays_elements`, `essays_terms`, `essays_client`, `essay_element_templates`, `essay_audit_logs`.
- **Órdenes de Trabajo y Muestras (`F-PC13-03`):** `work_orders`, `work_order_audit_logs`, `samples`.
- **Documentos, Informes y Evidencia (`F-PC13-01`):** `essays_documents`, `essay_document_snapshots`.

### B. Definición de Atributos Principales (Ejemplos de Núcleo)

| Entidad inicial | Atributos principales identificados |
| :--- | :--- |
| **`users`** | `id` (UUID PK), `email`, `password_hash`, `user_type`, `verified`, `two_factor_enabled`, `preferred_two_factor_method`. |
| **`bussiness`** | `cuit` (PK), `name` (razón social). |
| **`clients`** | `id` (UUID PK), `cuit` (empresa), `address`, `representative`, `contact`, `billing_cuit`, `user`, `origin`. |
| **`persons`** | `id` (UUID PK), `name`, `dni`, `mail`, `phone_number`, `country_code`, `address`, `user`. |
| **`essays`** | `id` (UUID PK), `code` (diario), `client`, `contact`, `type_essay`, `status`, `samples`, `client_notifications_enabled`. |
| **`work_orders`** | `id` (UUID PK), `essay_id`, `code` (diario), `status`, `notes`. |
| **`samples`** | `id` (UUID PK), `essay`, `work_order`, `code`, `status`, `result`, `average_value`. |

### C. Relacionamiento Lógico Entre Entidades

- Un **usuario (`users`)** puede crear múltiples **clientes (`clients`)** y **personas (`persons`)**, abrir varias **sesiones (`user_sessions`)** y generar múltiples eventos de **auditoría de seguridad**.
- Una **empresa (`bussiness`)** puede poseer una o más **direcciones (`bussiness_address`)** y figurar asociada a múltiples **clientes (`clients`)**.
- Un **cliente (`clients`)** puede registrar un **representante legal**, un **contacto principal**, múltiples **contactos adicionales (`clients_contacts`)** y solicitar muchos **ensayos (`essays`)**.
- Un **ensayo (`essays`)** congela un snapshot **cliente-ensayo (`essays_client`)**, contiene uno o muchos **elementos (`essays_elements`)**, un registro de **condiciones (`essays_terms`)**, una o más **órdenes de trabajo (`work_orders`)**, varias **muestras (`samples`)** y sus **snapshots criptográficos (`essay_document_snapshots`)**.
- Una **orden de trabajo (`work_orders`)** agrupa múltiples **muestras (`samples`)** y mantiene su historial en **`work_order_audit_logs`**.

*(El diseño lógico definitivo con tipos exactos, claves foráneas, restricciones e índices de las 34 tablas se desarrolla en el documento `docs/03-modulo-iii-arquitectura-y-planificacion/03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md`.)*

---

## Proceso 1: Gestión de Clientes

**Objetivo:** Alta, modificación y consulta de clientes (empresas, direcciones, representantes y contactos).

### 1.1. Relevamiento de datos requeridos

**Datos de entrada (para alta/modificación):**
- Datos de la empresa: CUIT, razón social.
- Datos de la dirección: calle y número, localidad, provincia, distrito (opcional), origen (CLIENT/LABORATORY/PUBLIC).
- Datos del representante legal (opcional): nombre, DNI, mail, teléfono, dirección, localidad, distrito, país, código país teléfono.
- Datos del contacto principal (opcional): mismos campos que representante.
- Contactos adicionales: lista de personas (id o datos) a vincular como contactos del cliente.
- Datos de facturación alternativa (opcional): CUIT, dirección, localidad, provincia, tributa IVA.
- Origen del cliente: CLIENT o LABORATORY.
- Usuario que realiza la carga (automático).

**Datos almacenados/generados:**
- Registro en `bussiness` (si la empresa no existía).
- Uno o más registros en `bussiness_address`.
- Registros en `persons` por cada representante/contacto nuevo.
- Registro en `clients` vinculando CUIT, dirección, representative, contact, datos de facturación y user.
- Registros en `clients_contacts` por cada contacto adicional.

**Datos de salida (consulta):**
- Cliente con empresa, dirección, representante, contacto, contactos adicionales y datos de facturación.
- Historial de ensayos asociados al cliente (consulta cruzada con `essays`).

### 1.2. Clasificación de datos – Gestión de Clientes

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| cuit | bussiness | STRING | 12 | Obligatorio | Clave primaria; formato CUIT |
| name | bussiness | STRING | 100 | Obligatorio | Razón social |
| id | bussiness_address | UUID | 36 | Obligatorio (generado) | PK, valor por defecto UUIDv4 |
| cuit | bussiness_address | STRING | 12 | Obligatorio | FK → bussiness |
| address | bussiness_address | STRING | 100 | Obligatorio | Calle y número |
| location | bussiness_address | STRING | 100 | Obligatorio | Localidad |
| province | bussiness_address | STRING | 100 | Obligatorio | Provincia |
| district | bussiness_address | CHAR | 6 | Opcional | FK → types_districts.id |
| origin | bussiness_address | ENUM | — | Obligatorio | CLIENT, LABORATORY, PUBLIC; default PUBLIC |
| user | bussiness_address | UUID | 36 | Opcional | FK → users.id |
| id | persons | UUID | 36 | Obligatorio (generado) | PK |
| name | persons | STRING | — | Obligatorio | Nombre completo |
| dni | persons | STRING | — | Obligatorio | Documento identidad |
| mail | persons | STRING | — | Opcional | Email |
| country_code | persons | CHAR | 3 | Opcional | FK → types_countries.country_code; código teléfono |
| phone | persons | STRING | — | Opcional | Teléfono |
| address | persons | STRING | — | Opcional | Dirección |
| location | persons | STRING | — | Opcional | Localidad |
| district | persons | CHAR | 6 | Opcional | FK → types_districts.id |
| country | persons | CHAR | 2 | Opcional | FK → types_countries.id |
| user_id | persons | UUID | 36 | Opcional | FK → users.id, único |
| origin | persons | ENUM | — | Opcional | CLIENT, LABORATORY, PUBLIC |
| is_third_party | persons | BOOLEAN | — | Obligatorio | Default false |
| id | clients | UUID | 36 | Obligatorio (generado) | PK |
| cuit | clients | STRING | 12 | Obligatorio | FK → bussiness.cuit |
| address | clients | UUID | 36 | Obligatorio | FK → bussiness_address.id |
| representative | clients | UUID | 36 | Opcional | FK → persons.id |
| contact | clients | UUID | 36 | Opcional | FK → persons.id |
| origin | clients | ENUM | — | Obligatorio | CLIENT, LABORATORY; default CLIENT |
| billing_cuit | clients | STRING | 12 | Opcional | CUIT facturación alternativa |
| billing_address | clients | STRING | 100 | Opcional | Dirección facturación |
| billing_location | clients | STRING | 100 | Opcional | Localidad facturación |
| billing_province | clients | STRING | 100 | Opcional | Provincia facturación |
| billing_iva | clients | BOOLEAN | — | Opcional | Tributa IVA |
| user | clients | UUID | 36 | Opcional | FK → users.id |
| client | clients_contacts | UUID | 36 | Obligatorio | PK, FK → clients.id |
| contact | clients_contacts | UUID | 36 | Obligatorio | PK, FK → persons.id |

---

## Proceso 2: Gestión de Usuarios y Roles

**Objetivo:** Administrar usuarios del sistema, laboratorios y la asignación de usuarios a laboratorios con roles (ADMIN/USER).

### 2.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Usuario: nombre, DNI (8 caracteres), mail (único), contraseña, perfil (rol lógico), laboratorio asignado (opcional).
- Laboratorio: nombre, CUIT, administrador (usuario), mail, dirección, localidad, distrito, país.
- Miembro de laboratorio: laboratorio, usuario, rol (ADMIN o USER).

**Datos almacenados/generados:**
- Registros en `users` (id, created_at automáticos).
- Registros en `laboratories`.
- Registros en `laboratories_members` (clave compuesta laboratory, user).

**Datos de salida:**
- Listado de usuarios con perfil y laboratorio.
- Listado de laboratorios con administrador y miembros.
- Listado de miembros por laboratorio con rol.

### 2.2. Clasificación de datos – Gestión de Usuarios y Roles

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| id | users | UUID | 36 | Obligatorio (generado) | PK, default UUIDv4 |
| name | users | STRING | — | Obligatorio | Nombre completo |
| dni | users | STRING | 8 | Obligatorio | DNI |
| mail | users | STRING | — | Obligatorio, único | Email |
| password | users | STRING | — | Obligatorio | Contraseña (almacenada hasheada) |
| profile | users | STRING | — | Obligatorio | Perfil/rol del sistema |
| laboratory | users | UUID | 36 | Opcional | FK → laboratories.id |
| created_at | users | DATE | — | Obligatorio (generado) | Default NOW |
| id | laboratories | UUID | 36 | Obligatorio (generado) | PK |
| name | laboratories | STRING | — | Obligatorio | Nombre del laboratorio |
| cuit | laboratories | STRING | — | Obligatorio | CUIT |
| administrator | laboratories | UUID | 36 | Obligatorio | FK → users.id |
| mail | laboratories | STRING | — | Obligatorio | Email |
| address | laboratories | STRING | — | Obligatorio | Dirección |
| location | laboratories | STRING | — | Obligatorio | Localidad |
| district | laboratories | STRING | — | Obligatorio | Distrito |
| country | laboratories | STRING | — | Obligatorio | País |
| laboratory | laboratories_members | UUID | 36 | Obligatorio | PK, FK → laboratories.id |
| user | laboratories_members | UUID | 36 | Obligatorio | PK, FK → users.id |
| role | laboratories_members | ENUM | — | Obligatorio | ADMIN, USER; default USER |

---

## Proceso 3: Solicitud de Ensayo

**Objetivo:** Registrar una nueva solicitud de ensayo: cliente, tipo de ensayo, datos del producto, plazos, precio, snapshot del cliente y datos de facturación.

### 3.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Cliente (id de `clients`) o datos para snapshot; contacto del ensayo (persona).
- Laboratorio asignado (opcional).
- Tipo de ensayo (id de `types_essays` o valor entero; default 1).
- Fechas: solicitud (default hoy), firma, fin, vencimiento (opcionales).
- Observaciones (texto libre).
- Código corto del ensayo (6 caracteres).
- Datos del producto/material: producto, fabricante, fecha, país de origen, número de lote (opcional).
- Plazos: días para realizar, días de conservación de muestras.
- Precio.
- Datos de facturación: CUIT a facturar, dirección de facturación (opcional), monto (opcional, default 0), tributa IVA (default false).
- Snapshot del cliente: se copian datos de cliente, dirección, representante, contacto y facturación alternativa a `essays_client`.

**Datos almacenados/generados:**
- Un registro en `essays` (id UUID, status REQUESTED, request_date NOW).
- Un registro en `essays_elements`.
- Un registro en `essays_terms`.
- Un registro en `essays_billing`.
- Un registro en `essays_client` (snapshot completo).
- Eventos en `essay_audit_logs` (según reglas de negocio).

**Datos de salida:**
- ID del ensayo, código, estado, fechas y datos asociados (cliente, elementos, términos, facturación).

### 3.2. Clasificación de datos – Solicitud de Ensayo

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| id | essays | UUID | 36 | Obligatorio (generado) | PK |
| client | essays | CHAR | 36 | Opcional | FK → clients.id |
| contact | essays | UUID | 36 | Opcional | FK → persons.id |
| laboratory | essays | UUID | 36 | Opcional | FK → laboratories.id |
| essay | essays | INTEGER | — | Obligatorio | Tipo de ensayo; default 1; ref. types_essays.id |
| request_date | essays | DATE | — | Obligatorio | Default NOW |
| signing_date | essays | DATE | — | Opcional | |
| finish_date | essays | DATE | — | Opcional | |
| due_date | essays | DATE | — | Opcional | |
| observations | essays | TEXT | — | Opcional | |
| status | essays | ENUM | — | Obligatorio | REQUESTED, ACCEPTED, REJECTED, SERVICE_AGREEMENT_MADED, IN_WORK, COMPLETED, CANCELLED; default REQUESTED |
| code | essays | STRING | 6 | Obligatorio | Código de seguimiento |
| result | essays | DECIMAL | 12,2 | Opcional | |
| uncertainty | essays | DECIMAL | 12,2 | Opcional | |
| essay | essays_elements | UUID | 36 | Obligatorio | PK, FK → essays.id |
| product | essays_elements | STRING | — | Obligatorio | Producto |
| manufacturer | essays_elements | STRING | — | Obligatorio | Fabricante |
| date | essays_elements | DATE | — | Obligatorio | Fecha del producto |
| country | essays_elements | CHAR | 2 | Opcional | FK → types_countries.id |
| batch_number | essays_elements | STRING | — | Opcional | Nº de lote |
| essay | essays_terms | UUID | 36 | Obligatorio | PK, FK → essays.id |
| days_to_do | essays_terms | INTEGER | — | Obligatorio | Días para realizar |
| samples_conservation_days | essays_terms | INTEGER | — | Obligatorio | Días conservación muestras |
| price | essays_terms | DECIMAL | 12,2 | Obligatorio | Precio |
| essay | essays_billing | UUID | 36 | Obligatorio | PK, FK → essays.id |
| cuit | essays_billing | STRING | 12 | Obligatorio | FK → bussiness.cuit |
| address | essays_billing | STRING | 36 | Opcional | FK → bussiness_address.id (UUID como string) |
| amount | essays_billing | DECIMAL | 12,2 | Opcional | Default 0.0 |
| pays_iva | essays_billing | BOOLEAN | — | Obligatorio | Default false |
| id | essays_client | UUID | 36 | Obligatorio (generado) | PK |
| essay | essays_client | UUID | 36 | Obligatorio, único | FK → essays.id |
| cuit | essays_client | STRING | 12 | Obligatorio | FK → bussiness.cuit |
| address | essays_client | UUID | 36 | Obligatorio | FK → bussiness_address.id |
| representative | essays_client | UUID | 36 | Opcional | FK → persons.id |
| contact | essays_client | UUID | 36 | Obligatorio | FK → persons.id |
| address_address, address_location, address_province | essays_client | STRING | 100 | Opcional | Snapshot dirección |
| representative_name, representative_dni, representative_contact | essays_client | STRING/CHAR/UUID | 100, 8, 36 | Opcional | Snapshot representante |
| contact_name, contact_dni, contact_mail, contact_phone, contact_address, contact_location, contact_district, contact_country, contact_country_code | essays_client | STRING/CHAR | según tipo | Opcional | Snapshot contacto |
| billing_cuit, billing_address, billing_location, billing_province, billing_iva | essays_client | STRING/BOOLEAN | 12, 100, 100, 100, — | Opcional | Snapshot facturación |

---

## Proceso 4: Recepción de Muestras

**Objetivo:** Registrar las muestras físicas recibidas asociadas a un ensayo (y opcionalmente a una orden de trabajo).

### 4.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Ensayo (id de `essays`).
- Por cada muestra: identificador (string 36), código de fecha (6 caracteres, opcional), correlativo (entero), si es contramuestra (boolean, default false), fecha/hora de recepción (default NOW), aceptada (boolean, default false), acondicionamiento interno (boolean, default false), observaciones (texto), dimensiones altura/ancho/espesor (decimal 12,4 opcionales). Opcionalmente: orden de trabajo a la que se asigna (UUID).

**Datos almacenados/generados:**
- Registros en `samples` (status PENDING por defecto). Si se asigna orden de trabajo, se completa `work_order`.

**Datos de salida:**
- Listado de muestras del ensayo con id, status, correlativo, received_at, work_order, etc.
- Comprobante de recepción (generado por aplicación o informe).

### 4.2. Clasificación de datos – Recepción de Muestras

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| id | samples | STRING | 36 | Obligatorio | PK; identificador de muestra |
| essay | samples | STRING | 36 | Obligatorio | FK → essays.id |
| status | samples | ENUM | — | Obligatorio | PENDING, ANALYZED, REJECTED, SAVED, RETURNED; default PENDING |
| date_code | samples | STRING | 6 | Opcional | Parte del código |
| correlative | samples | INTEGER | — | Obligatorio | Correlativo dentro del ensayo |
| countersample | samples | BOOLEAN | — | Obligatorio | Default false |
| received_at | samples | DATE | — | Obligatorio | Default NOW |
| accepted | samples | BOOLEAN | — | Opcional | Default false |
| internal_conditioning | samples | BOOLEAN | — | Opcional | Default false |
| observations | samples | TEXT | — | Opcional | |
| result | samples | DECIMAL | 12,2 | Opcional | Resultado del ensayo sobre la muestra |
| work_order | samples | UUID | 36 | Opcional | FK → work_orders.id |
| height | samples | DECIMAL | 12,4 | Opcional | Altura (mm) |
| width | samples | DECIMAL | 12,4 | Opcional | Ancho |
| thickness | samples | DECIMAL | 12,4 | Opcional | Espesor |

---

## Proceso 5: Gestión de Órdenes de Trabajo

**Objetivo:** Crear y gestionar órdenes de trabajo a partir de un ensayo; asignar muestras; actualizar estado y plazos.

### 5.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Ensayo (id de `essays`).
- Código de la orden (hasta 16 caracteres).
- Código de tracking del ensayo (opcional, 64 caracteres).
- Fecha límite de entrega del informe (opcional).
- Observaciones (texto opcional).
- Acondicionamiento interno (boolean, default false).
- Estado: WAITING_SAMPLES, ANALYZING, COMPLETED, CANCELLED (default WAITING_SAMPLES).
- Asignación de muestras: actualizar `samples.work_order` para las muestras que integran la orden.
- Usuario que realiza las acciones (para auditoría).

**Datos almacenados/generados:**
- Registro en `work_orders` (id y generated_at automáticos).
- Actualización de `samples.work_order` para las muestras asignadas.
- Registros en `work_order_audit_logs` (id, work_order_id, user_id, event_code, timestamp, metadata opcional).

**Datos de salida:**
- Orden de trabajo con código, estado, fechas, ensayo asociado y listado de muestras.
- Historial de auditoría de la orden.

### 5.2. Clasificación de datos – Gestión de Órdenes de Trabajo

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| id | work_orders | UUID | 36 | Obligatorio (generado) | PK |
| essay_id | work_orders | UUID | 36 | Obligatorio | FK → essays.id |
| code | work_orders | STRING | 16 | Obligatorio | Código de la orden |
| essay_track_code | work_orders | STRING | 64 | Opcional | |
| report_delivery_deadline | work_orders | DATEONLY | — | Opcional | Fecha límite informe |
| generated_at | work_orders | DATE | — | Obligatorio | Default NOW |
| observations | work_orders | TEXT | — | Opcional | |
| internal_aconditioning | work_orders | BOOLEAN | — | Opcional | Default false |
| status | work_orders | ENUM | — | Obligatorio | WAITING_SAMPLES, ANALYZING, COMPLETED, CANCELLED; default WAITING_SAMPLES |
| work_order | samples | UUID | 36 | Opcional | FK → work_orders.id (actualización) |
| id | work_order_audit_logs | UUID | 36 | Obligatorio (generado) | PK |
| work_order_id | work_order_audit_logs | UUID | 36 | Obligatorio | FK → work_orders.id, ON DELETE CASCADE |
| user_id | work_order_audit_logs | UUID | 36 | Obligatorio | FK → users.id |
| event_code | work_order_audit_logs | STRING | 50 | Obligatorio | Código del evento |
| timestamp | work_order_audit_logs | DATE | — | Obligatorio | Default NOW |
| metadata | work_order_audit_logs | JSON | — | Opcional | Datos adicionales del evento |

---

## Proceso 6: Ejecución de Ensayos y Resultados

**Objetivo:** Cargar resultados de los ensayos sobre las muestras; actualizar estado de muestras y del ensayo; registrar dimensiones y observaciones.

### 6.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Por muestra: resultado (decimal 12,2), estado (PENDING, ANALYZED, REJECTED, SAVED, RETURNED), observaciones, dimensiones (height, width, thickness en decimal 12,4).
- A nivel ensayo (opcional): result, uncertainty (decimal 12,2); status (ACCEPTED, IN_WORK, COMPLETED, etc.).
- Usuario que carga o valida (para auditoría).

**Datos almacenados/generados:**
- Actualización de registros en `samples` (result, status, observations, height, width, thickness).
- Actualización de registros en `essays` (result, uncertainty, status, finish_date según reglas de negocio).
- Registros en `essay_audit_logs` y/o `work_order_audit_logs` según el evento.

**Datos de salida:**
- Muestras con resultado y estado actualizado; ensayo con resultado e incertidumbre si aplica.

### 6.2. Clasificación de datos – Ejecución de Ensayos y Resultados

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| result | samples | DECIMAL | 12,2 | Opcional | Valor medido |
| status | samples | ENUM | — | Obligatorio | PENDING, ANALYZED, REJECTED, SAVED, RETURNED |
| observations | samples | TEXT | — | Opcional | |
| height, width, thickness | samples | DECIMAL | 12,4 | Opcional | Dimensiones en mm |
| result | essays | DECIMAL | 12,2 | Opcional | Resultado consolidado |
| uncertainty | essays | DECIMAL | 12,2 | Opcional | Incertidumbre |
| status | essays | ENUM | — | Obligatorio | REQUESTED, ACCEPTED, REJECTED, SERVICE_AGREEMENT_MADED, IN_WORK, COMPLETED, CANCELLED |
| finish_date | essays | DATE | — | Opcional | |
| id | essay_audit_logs | CHAR | 36 | Obligatorio (generado) | PK |
| essay | essay_audit_logs | CHAR | 36 | Obligatorio | FK → essays.id |
| user_id | essay_audit_logs | CHAR | 36 | Obligatorio | FK → users.id |
| event_code | essay_audit_logs | STRING | 50 | Obligatorio | |
| timestamp | essay_audit_logs | DATE | — | Obligatorio | Default NOW |
| metadata | essay_audit_logs | JSON | — | Opcional | |

---

## Proceso 7: Emisión de Informes y Entrega de Resultados

**Objetivo:** Generar y registrar documentos (informes, PDFs) asociados a un ensayo; indicar tipo, copia y si fue modificado.

### 7.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Ensayo (id de `essays`).
- Tipo de documento (id de `types_documents`).
- Número de copia (entero, default 0).
- Indicador de modificado (boolean, default false).
- Archivo: ruta o identificador del archivo generado (string obligatorio).
- Fecha de generación (default NOW).

**Datos almacenados/generados:**
- Registro en `essays_documents` (id generado; essay, type, copy, modificated, generated_at, file).

**Datos de salida:**
- Documento listado con tipo, copia, fecha de generación y referencia al archivo; posibilidad de descarga o envío al cliente.

### 7.2. Clasificación de datos – Emisión de Informes y Documentos

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| id | essays_documents | UUID | 36 | Obligatorio (generado) | PK |
| essay | essays_documents | UUID | 36 | Obligatorio | FK → essays.id (parte de PK compuesta en modelo) |
| type | essays_documents | INTEGER | — | Obligatorio | FK → types_documents.id |
| copy | essays_documents | INTEGER | — | Obligatorio | Default 0 |
| modificated | essays_documents | BOOLEAN | — | Obligatorio | Default false |
| generated_at | essays_documents | DATE | — | Obligatorio | Default NOW |
| file | essays_documents | STRING | — | Obligatorio | Ruta o identificador del archivo |
| id | types_documents | INTEGER | — | Obligatorio (autoincremental) | PK |
| code | types_documents | STRING | — | Obligatorio | Código interno |
| name | types_documents | STRING | — | Obligatorio | Nombre del tipo |
| filesheet | types_documents | STRING | — | Obligatorio | Plantilla/hoja |

---

## Proceso 8: Facturación

**Objetivo:** Definir y consultar los datos de facturación del ensayo (CUIT, dirección, monto, condición IVA). Los datos pueden provenir del cliente o ser alternativos.

### 8.1. Relevamiento de datos requeridos

**Datos de entrada:**
- Ensayo (ya creado).
- CUIT a facturar (debe existir en `bussiness`).
- Dirección de facturación (opcional; UUID de `bussiness_address` o dejar null).
- Monto (opcional, default 0.0).
- Tributa IVA (boolean, obligatorio, default false).

**Datos almacenados/generados:**
- Inserción o actualización en `essays_billing`. Los datos de facturación alternativa del cliente (`clients.billing_*`) se usan en pantalla o para rellenar el snapshot en `essays_client`; la facturación efectiva del ensayo está en `essays_billing`.

**Datos de salida:**
- Datos de facturación del ensayo: CUIT, dirección (si existe), monto, pays_iva; datos de la empresa y dirección desde `bussiness` y `bussiness_address`.

### 8.2. Clasificación de datos – Facturación

| Campo | Entidad/Tabla | Tipo de dato | Cantidad caracteres / precisión | Requerimiento | Observaciones |
|-------|----------------|--------------|----------------------------------|---------------|----------------|
| essay | essays_billing | UUID | 36 | Obligatorio | PK, FK → essays.id |
| cuit | essays_billing | STRING | 12 | Obligatorio | FK → bussiness.cuit |
| address | essays_billing | STRING | 36 | Opcional | FK → bussiness_address.id (UUID como string) |
| amount | essays_billing | DECIMAL | 12,2 | Opcional | Default 0.0 |
| pays_iva | essays_billing | BOOLEAN | — | Obligatorio | Default false |

---

## Proceso 9: Reportes y Consultas

**Objetivo:** Consultar información para indicadores y listados (sin escritura). Se utilizan los mismos datos ya almacenados.

### 9.1. Relevamiento de datos requeridos

**Datos de entrada (filtros/parámetros):**
- Rango de fechas (request_date, finish_date, generated_at, received_at).
- Cliente, laboratorio, tipo de ensayo, estado de ensayo, estado de orden de trabajo, estado de muestra.
- Código de ensayo o de orden de trabajo.

**Datos consultados (solo lectura):**
- Ensayos con cliente, contacto, laboratorio, tipo, fechas, estado, código, resultado.
- Elementos, términos, facturación y snapshot de cliente del ensayo.
- Órdenes de trabajo con estado y fechas.
- Muestras con estado, resultado, fechas y orden asignada.
- Documentos generados por ensayo.
- Clientes con empresa, dirección, representante y contactos.
- Usuarios y laboratorios con miembros y roles.
- Catálogos: tipos de ensayo, tipos de documento, países, distritos.

**Datos de salida:**
- Reportes agregados (cantidad de ensayos por período, por tipo, por cliente; órdenes pendientes; muestras sin resultado; etc.) y listados detallados exportables o visualizables en pantalla.

### 9.2. Clasificación de datos – Reportes y Consultas

No se persisten datos nuevos; se consultan las mismas entidades y campos ya definidos en los procesos anteriores. La clasificación de los datos consultados coincide con la de las tablas involucradas (essays, essays_elements, essays_terms, essays_billing, essays_client, work_orders, samples, essays_documents, clients, bussiness, bussiness_address, persons, users, laboratories, laboratories_members, types_essays, types_documents, types_countries, types_districts). Los filtros típicos son:

- **Tipos de dato:** DATE/DATEONLY para rangos; UUID para cliente/laboratorio/ensayo/orden; INTEGER para tipo de ensayo; ENUM/STRING para estados.
- **Requerimiento en la consulta:** todos los filtros son opcionales; la combinación define el alcance del reporte.

---

## Resumen por proceso

| Proceso | Tablas principales involucradas | Tipo de operación |
|---------|----------------------------------|-------------------|
| 1. Gestión de Clientes | bussiness, bussiness_address, persons, clients, clients_contacts | Alta, modificación, consulta |
| 2. Gestión de Usuarios y Roles | users, laboratories, laboratories_members | Alta, modificación, consulta |
| 3. Solicitud de Ensayo | essays, essays_elements, essays_terms, essays_billing, essays_client | Alta |
| 4. Recepción de Muestras | samples | Alta, actualización work_order |
| 5. Gestión de Órdenes de Trabajo | work_orders, samples, work_order_audit_logs | Alta, actualización |
| 6. Ejecución de Ensayos y Resultados | samples, essays, essay_audit_logs, work_order_audit_logs | Actualización, auditoría |
| 7. Emisión de Informes | essays_documents, types_documents | Alta, consulta |
| 8. Facturación | essays_billing, bussiness, bussiness_address | Alta/actualización, consulta |
| 9. Reportes y Consultas | Todas las anteriores (solo lectura) | Consulta |
