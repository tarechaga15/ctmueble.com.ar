# Módulo III — Diseño Modular, Navegación Funcional, Mockups y Planificación

> **Correspondencia con lineamientos (`Módulo III.pdf`):** Cubre **Diseño modular del sistema**, **Jerarquía de módulos**, **Navegación funcional del sistema**, **Diseño de interfaz (mockups)**, **Plan de implementación**, **Plan de mantenimiento inicial** y **Revisión integral previa al desarrollo**.

---

## 1. Diseño Modular del Sistema

La plataforma `gestion.ctmueble.com.ar` se divide en **6 módulos funcionales y arquitectónicos** desacoplados, cada uno con objetivos, operaciones, tablas propias y perfiles de usuario claramente delimitados:

| Módulo | Objetivo | Operaciones que realiza | Tablas involucradas (de las 34) | Usuarios que lo utilizan |
| :--- | :--- | :--- | :--- | :--- |
| **1. Módulo Usuarios, Sesiones y Seguridad** | Gestionar identidades, autenticación segura, 2FA, permisos granulares, recuperación de clave, API keys y auditoría de seguridad. | Registro, login, refresh/logout, verificación OTP/link, forgot/reset password, setup/uso 2FA, revocar sesiones/dispositivos, ABM miembros de laboratorio y permisos, CRUD API keys. | `users`, `laboratories`, `laboratories_members`/`laboratory_members`, `laboratory_permissions`, `user_sessions`, `user_recovery_codes`, `user_trusted_devices`, `email_verifications`, `password_resets`, `system_api_keys`, `security_audit_logs`. | Todos los perfiles (`CLIENT` en su cuenta; `ADMIN` en administración de laboratorio y API keys). |
| **2. Módulo Empresas, Clientes, Personas y Autocompletado Opcional ARCA** | Mantener el padrón comercial unificado con carga manual autónoma y agenda compartida del laboratorio (más autocompletado auxiliar opcional con ARCA A13 si está habilitado). | Alta/edición manual de empresa y domicilios, consulta auxiliar opcional en WSAA/Padrón A13 (sin requerir activación), ABM personas, ABM clientes y contactos adicionales, agenda compartida de laboratorio. | `bussiness`, `bussiness_address`, `persons`, `clients`, `clients_contacts`. | `CLIENT` (solo sus clientes/personas) y `LABORATORY` (`ADMIN` / `USER` con permisos `clientes.*`, `CONSULTA` lectura). |
| **3. Módulo Ensayos y Plantillas (`F-PC13-02`)** | Gestionar el ciclo comercial-técnico de solicitudes de ensayo, términos, presupuestos y plantillas reutilizables. | Crear ensayo (`F-PC13-02`), calcular código diario atómico, guardar snapshot de cliente, actualizar cliente del ensayo, presupuestos (`essays_terms`), aceptar/rechazar/cancelar, acciones dinámicas y plantillas. | `essays`, `essays_elements`, `essays_terms`, `essays_billing`, `essays_client`, `essay_element_templates`, `essay_audit_logs`, `daily_sequence_counters`. | `CLIENT` (solicitar, aceptar/rechazar, cancelar propios) y `LABORATORY` (`ensayos.*`). |
| **4. Módulo Recepción, Órdenes de Trabajo y Muestras (`F-PC13-03`)** | Controlar el ingreso físico de probetas al laboratorio, emisión de OT y carga de resultados analíticos. | Recepción unificada de muestras, generación de OT con código diario, consulta de pendientes, transición de estados de OT, carga de mediciones y cálculo automático de `average_value`. | `work_orders`, `work_order_audit_logs`, `samples`, `daily_sequence_counters`. | Exclusivo `LABORATORY` (`ADMIN` y `USER` con `muestras.recibir`, `muestras.resultados`, `ordenes.*`; `CONSULTA` lectura). |
| **5. Módulo Documentos PDF, Notificaciones, Exportación e Integridad (`F-PC13-01`)** | Generar PDFs oficiales, emitir informes certificados, exportar planillas, notificar por email y garantizar integridad probatoria. | Emitir informe `ORIGINAL` / `MODIFICATION`, generar PDFs `F-PC13-01`/`02`/`03` vía Handlebars+Puppeteer+R2, exportar CSV/XLSX, enviar/desuscribir emails Resend, firmar snapshots RSA-SHA256 + OpenTimestamps. | `essays_documents`, `essay_document_snapshots`, más lectura consolidada sobre `essays`, `essays_client`, `samples`, `work_orders`. | `CLIENT` (descarga PDFs propios y preferencias de email) y `LABORATORY` (`informes.*`, `essays.export`, verificación). |
| **6. Módulo Configuración y Catálogos** | Proveer catálogos base normalizados y parametrización institucional/analítica en caliente sin redespliegue. | Listar países, distritos (incluyendo `numeric_id`), documentos y tipos de ensayo; consultar/editar variables `/env` (`UNCERTAINTY`, autoridades, CBU, etc.) protegiendo `hardcoded`. | `types_countries`, `types_districts`, `types_documents`, `types_essays`, `environment_variables`. | Consulta pública/autenticada para catálogos; `ADMIN` / `configuracion.env` para modificar variables `/env`. |

---

## 2. Jerarquía de Módulos (Dependencias de Construcción y Operación)

```mermaid
flowchart TD
    M6["6. Configuración y Catálogos (/types, /env)"]
    M1["1. Usuarios, Autenticación, Sesiones y Permisos"]
    M2["2. Empresas, Personas y Clientes (+ Autocompletado Opcional ARCA A13)"]
    M3["3. Solicitudes de Ensayo (F-PC13-02) y Presupuestos"]
    M4["4. Recepción de Muestras, Órdenes de Trabajo (F-PC13-03) y Resultados"]
    M5["5. Emisión de Informes (F-PC13-01), PDFs, Exportación CSV/XLSX y Snapshots RSA/OTS"]

    M6 --> M1 --> M2 --> M3 --> M4 --> M5
```

> **Criterio de ordenamiento:** Esta jerarquía dicta directamente el orden secuencial de desarrollo del Módulo IV: ningún módulo superior puede operar ni probarse sin los módulos base de los que depende. *(Nota: El autocompletado mediante ARCA en el Módulo 2 es un complemento auxiliar opcional y no bloquea ni es requisito para los módulos 3, 4 y 5; se habilita configurando `ARCA_CUIT` y certificado/clave `ARCA_*`.)*

---

## 3. Navegación Funcional del Sistema

El acceso al frontend SPA se adapta dinámicamente según el perfil autenticado (`CLIENT` vs `LABORATORY`) y los permisos efectivos del usuario:

```mermaid
flowchart TD
    AUTH["Login / Verificación Email / Recuperación Clave"]
    MFA{"Desafío 2FA<br/>(si aplica)"}
    MENU["Menú Principal SPA"]

    AUTH --> MFA --> MENU

    subgraph PC["Perfil CLIENT"]
        C1["Mis Ensayos<br/>• Nueva Solicitud F-PC13-02<br/>• Aceptar / Rechazar<br/>• Descargar PDFs"]
        C2["Mis Empresas y Clientes<br/>• Alta / Autocompl. ARCA opcional<br/>• Representantes y Contactos"]
        C3["Plantillas Guardadas"]
        C4["Mi Cuenta y Seguridad<br/>• 2FA / Sesiones Activas"]
    end

    subgraph PL["Perfil LABORATORY"]
        L1["Tablero de Ensayos (Filtros + XLSX)<br/>• Detalle / Presupuesto / Emitir"]
        L2["Recepción y Órdenes de Trabajo<br/>• Recibir Muestras / OT F-PC13-03<br/>• Cargar Resultados por Muestra"]
        L3["Clientes y Agenda Compartida<br/>• Alta Manual / Autocompl. ARCA opcional"]
        L4["Catálogos y Plantillas de Elementos"]
        L5["Administración (Solo ADMIN / Permiso)<br/>• Usuarios Lab, Roles y Permisos<br/>• Variables /env y API Keys"]
        L6["Mi Cuenta, 2FA y Sesiones Activas"]
    end

    MENU --> C1
    MENU --> C2
    MENU --> C3
    MENU --> C4
    MENU --> L1
    MENU --> L2
    MENU --> L3
    MENU --> L4
    MENU --> L5
    MENU --> L6
```

### 3.1. Rutas Básicas y Control de Acceso en Navegación

| Ruta funcional SPA / API asociada | Permiso / Rol requerido | Submenús y acciones visibles |
| :--- | :--- | :--- |
| `/login`, `/register`, `/verify-email`, `/forgot-password` | Público | Inicio de sesión, ingreso OTP, recuperación de clave. |
| `/dashboard` | Autenticado (`CLIENT` / `LABORATORY`) | Resumen de estado de solicitudes pendientes o asignadas. |
| `/clients` y `/clients/scheduled` | `CLIENT` (propios) / `LABORATORY` (`clientes.ver`, `clientes.agendar`) | Alta manual, autocompletado auxiliar opcional de datos por CUIT (si ARCA está activo), edición, contactos y agenda compartida. |
| `/essays` y `/essays/:id` | `CLIENT` (propios) / `LABORATORY` (`ensayos.ver`) | Listado filtrable por fecha Argentina, creación `F-PC13-02`, presupuesto, acciones dinámicas, descarga PDF, exportación CSV/XLSX (`essays.export`). |
| `/work-orders` y `/samples` | Exclusivo `LABORATORY` (`ordenes.*`, `muestras.*`) | Recepción unificada (`F-PC13-03`), listado de pendientes, carga de resultados y promedios. |
| `/essays/:id/report` y `/snapshots/verify` | `LABORATORY` (`informes.emitir`) / Verificador | Emisión `F-PC13-01` (`ORIGINAL`/`MODIFICATION`), descarga PDF y verificación RSA/OTS. |
| `/admin/users`, `/admin/env`, `/admin/api-keys` | `LABORATORY` (`ADMIN` o permiso `usuarios.*`, `configuracion.env`) | ABM usuarios internos, matriz de permisos, variables institucionales y API keys. |
| `/account/security` | Autenticado (`CLIENT` / `LABORATORY`) | Configuración 2FA TOTP/Email, códigos de recuperación, dispositivos confiables y cierre de sesiones. |

---

## 4. Diseño de Interfaz — Mockups Estructurados de Pantallas

Los bocetos siguientes especifican los **campos principales**, **botones de acción**, **tablas** y **navegación básica** implementados entre frontend y contratos API:

### Pantalla 1: Login, Verificación 2FA y Recuperación de Contraseña

```mermaid
flowchart TB
    subgraph P1["Pantalla 1 · Centro Tecnológico del Mueble — Acceso al Sistema"]
        subgraph P1F["Paso 1: Credenciales"]
            P1C1["Campo: Correo electrónico (usuario@empresa.com.ar)"]
            P1C2["Campo: Contraseña (masked)"]
            P1C3["Checkbox: [x] Recordar sesión (rememberMe)"]
            P1B1(["Botón: Iniciar Sesión"])
            P1L1["Enlaces: ¿Olvidaste tu contraseña? · Registrarse"]
            P1C1 --- P1C2 --- P1C3 --- P1B1 --- P1L1
        end
        subgraph P1M["Paso 2: Desafío 2FA (si aplica)"]
            P1M1["Selector método: TOTP App / Email OTP / Recovery Code"]
            P1M2["Campo: Código de 6 dígitos · [x] Confiar dispositivo"]
            P1MB1(["Botón: Verificar e Ingresar"])
            P1MB2(["Botón: Reenviar código OTP"])
            P1M1 --- P1M2 --- P1MB1 --- P1MB2
        end
        P1F --> P1M
    end
```

### Pantalla 2: Gestión de Clientes y Autocompletado Auxiliar Opcional por CUIT

```mermaid
flowchart TB
    subgraph P2["Pantalla 2 · Módulo Clientes & Agenda Compartida"]
        P2NAV["Barra: < Volver al Menú"]
        subgraph P2EMP["Alta de Empresa (Manual u Opcional ARCA A13)"]
            P2E1["Campo: CUIT (30-12345678-9) · Botones: [+ Alta Manual] | [Autocompletar ARCA (opcional)]"]
            P2E2["Campos: Razón Social · Provincia · Dirección · Distrito"]
            P2E1 --- P2E2
        end
        subgraph P2PER["Personas y Facturación"]
            P2P1["Representante Legal: Nombre | DNI | Email | Teléfono | País"]
            P2P2["Contacto Principal: Nombre | DNI | Email | Teléfono | País"]
            P2P3["Facturación Alternativa (opc.): CUIT | Domicilio | [x] Tributa IVA"]
            P2PB(["Botón: Guardar Cliente"])
            P2P1 --- P2P2 --- P2P3 --- P2PB
        end
        P2TAB["Tabla Clientes Agendados del Laboratorio:<br/>CUIT | Razón Social | Origen (LABORATORY) | Agendado | Acciones (Ver/Edit)"]
        P2NAV --> P2EMP --> P2PER --> P2TAB
    end
```

### Pantalla 3: Solicitud de Servicio de Ensayo (`F-PC13-02`)

```mermaid
flowchart TB
    subgraph P3["Pantalla 3 · Nueva Solicitud de Ensayo (F-PC13-02)"]
        P3NAV["Barra: < Mis Ensayos"]
        subgraph P3CAB["Datos Generales de la Solicitud"]
            P3F1["Selector Cliente (o Mi Perfil isSelf) · Selector Contacto Responsable"]
            P3F2["Selector Tipo de Ensayo · Muestras Estimadas · [x] Notificaciones por email"]
            P3F1 --- P3F2
        end
        subgraph P3IT["Elementos / Productos del Ensayo"]
            P3IB["Acciones: [Cargar desde Plantilla] · [+ Ítem]"]
            P3ITAB["Tabla Ítems: Producto (Tablero MDF) | Material | Espesor | Medida nominal | Lote | [Quitar]"]
            P3IB --- P3ITAB
        end
        P3ACT(["Botón: Guardar Solicitud (Idempotency-Key automática)"])
        P3CAN(["Botón: Cancelar"])
        P3NAV --> P3CAB --> P3IT --> P3ACT
        P3IT --> P3CAN
    end
```

### Pantalla 4: Tablero Principal de Ensayos, Filtros y Exportación

```mermaid
flowchart TB
    subgraph P4["Pantalla 4 · Tablero Principal de Ensayos"]
        P4MEN["Menú Superior: Ensayos | Órdenes | Clientes | Config · Usuario: [Lab ADMIN]"]
        subgraph P4FLT["Filtros (Hora Argentina)"]
            P4F1["Campos: Desde (YYYY-MM-DD) | Hasta (YYYY-MM-DD) | Estado | Cliente/CUIT"]
            P4F2(["Botones: [Filtrar] · [Export CSV] · [Export XLSX]"])
            P4F1 --- P4F2
        end
        P4TAB["Tabla de Ensayos:<br/>Código (20261117A) | Fecha | Cliente | Estado (WAITING_FOR_SAMPLES / COMPLETED) | Acciones (Ver / PDF / F01)"]
        P4PAG["Paginación: < Anterior · Página 1 de 5 · Siguiente >"]
        P4MEN --> P4FLT --> P4TAB --> P4PAG
    end
```

### Pantalla 5: Recepción de Muestras, Orden de Trabajo (`F-PC13-03`) y Resultados

```mermaid
flowchart TB
    subgraph P5["Pantalla 5 · Orden de Trabajo F-PC13-03 (OT-20261117A)"]
        P5NAV["Barra: < Tablero Ensayos · Estado Ensayo: IN_ANALYSIS · Estado OT: IN_PROGRESS"]
        subgraph P5REC["Recepción Física y PDF"]
            P5R1["Campos: N° muestras recibidas aptas · Fecha recepción"]
            P5R2(["Botón: Descargar PDF Orden de Trabajo F-PC13-03"])
            P5R1 --- P5R2
        end
        P5TAB["Tabla Muestras y Resultados Analíticos:<br/>Código M. (M-01..M-03) | Estado (COMPLETED/RECEIVED) | Lecturas (mg/L) | Promedio | Observación"]
        P5B1(["Botón: Guardar Resultados y Recalcular Promedios"])
        P5B2(["Botón: Marcar OT Completada"])
        P5NAV --> P5REC --> P5TAB --> P5B1
        P5TAB --> P5B2
    end
```

### Pantalla 6: Emisión de Informe (`F-PC13-01`) y Verificación Criptográfica

```mermaid
flowchart TB
    subgraph P6["Pantalla 6 · Emisión y Verificación de Informe Oficial F-PC13-01"]
        P6NAV["Barra: < Detalle Ensayo · Validación: [OK] >= 2 muestras · Clasificación: E1 / E2"]
        subgraph P6EM["Configuración de Emisión"]
            P6E1["Selector: (o) ORIGINAL  |  ( ) MODIFICATION (campo Motivo)"]
            P6E2(["Botón: Emitir Informe F-PC13-01 + Sellar Snapshot RSA & OpenTimestamps"])
            P6E1 --- P6E2
        end
        P6TAB["Tabla Historial de Snapshots e Integridad:<br/>Versión (v1) | Tipo | Hash SHA-256 | Firma RSA (Válida) | Estado OTS (Pendiente/Anclado)"]
        P6B1(["Botón: Descargar Informe PDF F-PC13-01"])
        P6B2(["Botón: Verificar Integridad Documento"])
        P6NAV --> P6EM --> P6TAB --> P6B1
        P6TAB --> P6B2
    end
```

### Pantalla 7: Administración de Usuarios de Laboratorio y Permisos

```mermaid
flowchart TB
    subgraph P7["Pantalla 7 · Gestión de Equipo de Laboratorio, Roles y Permisos"]
        P7NAV["Barra: < Panel Admin"]
        P7INV(["Botón: + Invitar Usuario de Laboratorio"])
        P7TAB["Tabla Nómina de Laboratorio:<br/>Nombre | Email | Rol (ADMIN / USER / CONSULTA) | Activo | Acciones (Permisos / Edit / Desact / Reenv)"]
        subgraph P7MAT["Matriz de Permisos Granulares (Usuario seleccionado)"]
            P7M1["Checkboxes: [x] ensayos.ver · [x] muestras.recibir · [x] muestras.resultados<br/>[x] ordenes.ver · [ ] informes.emitir · [ ] configuracion.env"]
            P7MB(["Botón: Guardar Permisos y Rol"])
            P7M1 --- P7MB
        end
        P7NAV --> P7INV --> P7TAB --> P7MAT
    end
```

---

## 5. Plan de Implementación (Cronograma por Etapas)

| Etapa / Ventana | Módulos y Entregables Técnicos | Dependencias cubiertas |
| :--- | :--- | :--- |
| **Semana 1 — Base de Datos, Infraestructura y Auth** | Configuración Neon PostgreSQL + Sequelize + migraciones base (`20260217`), catálogos `/types`, variables `/env`, registro, login, JWT y cookies `HttpOnly`/CSRF. | Módulo 6 y Módulo 1 |
| **Semana 2 — Seguridad Avanzada, Clientes y Autocompletado Opcional** | Verificación email, reseteo de clave, 2FA (TOTP/Email), sesiones/dispositivos confiables, roles de laboratorio + permisos granulares, alta manual de empresas/personas/agenda compartida y soporte auxiliar opcional ARCA A13 (no requerido para operar). | Módulo 1 y Módulo 2 |
| **Semana 3 — Núcleo Operativo de Ensayos, OT y Muestras** | Solicitudes `F-PC13-02`, generación atómica de códigos diarios (`daily_sequence_counters`), snapshot `essays_client`, plantillas, términos/presupuestos, recepción de muestras y Órdenes de Trabajo `F-PC13-03` + carga de resultados. | Módulo 3 y Módulo 4 |
| **Semana 4 — PDFs, Reportes, Integridad Criptográfica y QA** | Emisión `F-PC13-01`, Handlebars + Puppeteer + R2, notificaciones Resend, exportación CSV/XLSX segura, `CanonicalJson` + RSA-SHA256 + OpenTimestamps, API Keys AES-256-GCM, auditoría de seguridad y suite de 90 tests. | Módulo 5 y Hardening Integral |

---

## 6. Plan de Mantenimiento Inicial

| Eje de mantenimiento | Procedimiento operativo |
| :--- | :--- |
| **Copias de seguridad (Backups)** | Respaldos automáticos gestionados por Neon PostgreSQL (Point-in-Time Recovery / snapshots diarios), respaldo redundante de documentos PDF emitidos en Cloudflare R2 y exportación periódica de snapshots/auditorías. |
| **Actualización y gobierno de usuarios** | Revisión periódica de cuentas de laboratorio activas en `/laboratory/users`, desactivación inmediata de personal saliente (revocando sesiones activas) y principio de mínimo privilegio por permiso granular. |
| **Limpieza de datos y tokens expirados** | Depuración o expiración programada de OTPs vencidos (`email_verifications`, `password_resets`), sesiones revocadas antiguas (`user_sessions`) y rotación controlada de claves maestras (`MASTER_ENCRYPTION_KEY_V*`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). |
| **Mejoras futuras controladas** | Cualquier evolución de esquema debe implementarse únicamente mediante nueva migración Umzug (`npm run migrate:up`), manteniendo retrocompatibilidad con `essays_client` y `essay_document_snapshots`, e incluyendo nuevas pruebas en `tests/`. |
| **Documentación técnica viva** | Mantener sincronizados los contratos de `/docs`, `README.md`, `docs/INDEX.md` y regenerar el documento maestro mediante `npm run build:docs-pdf` tras cambios estructurales. |

---

## 7. Revisión Integral Previa al Desarrollo — Checklist (Módulo III)

| Punto de verificación (`Módulo III.pdf`) | Resultado de la verificación | Estado |
| :--- | :--- | :--- |
| **¿La base de datos está correcta?** | Sí: 34 tablas definidas en `03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md` con PKs, FKs, índices y diagnóstico de normalización/desnormalización controlada. | **Verificado** |
| **¿Los módulos están claros?** | Sí: 6 módulos funcionales delimitados con tablas, operaciones, jerarquía y permisos asignados. | **Verificado** |
| **¿La arquitectura es viable?** | Sí: stack serverless desacoplado (Vercel + Neon + R2 + Redis) validado para costos, concurrencia y seguridad. | **Verificado** |
| **¿Las tecnologías son posibles?** | Sí: todas las librerías (`express`, `sequelize`, `puppeteer-core`, `node-forge`, `exceljs`, `ioredis`, `@aws-sdk/client-s3`) están instaladas en `package.json` y probadas. | **Verificado** |
| **¿El desarrollo tiene orden lógico?** | Sí: secuenciado desde Configuración/Seguridad → Clientes (+ autocompletado opcional ARCA) → Ensayos/OT → Informes/PDF/Integridad. | **Verificado** |
| **¿Todos entienden qué construir?** | Sí: mockups, rutas de navegación, contratos API y reglas de negocio dejan especificación unívoca para pasar al Módulo IV. | **Verificado** |
