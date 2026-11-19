# Análisis Funcional del Sistema de Gestión de Ensayos y Laboratorio — `ctmueble.com.ar`

> Análisis Funcional del Sistema de Gestión de Ensayos y Laboratorio.

- **Sistema:** Plataforma Web de Gestión de Ensayos y Laboratorio (`gestion.ctmueble.com.ar`)
- **Versión:** v1.2.0
- **Fecha de emisión:** 19 de noviembre de 2026
- **Docente:** Leo Gómez
- **Autores:** Aréchaga Tomás, Mansilla Jael

---

## Índice General

- **Módulo I: Pautas Generales, Organización y Análisis del Escenario** (`docs/01-modulo-i-pautas-y-analisis-escenario/`)
  - **1.1. Módulo I — Organización del Equipo, Escenario, Modelo de Negocio y Organigrama (CTM)** (`docs/01-modulo-i-pautas-y-analisis-escenario/01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md`)
    - 1.1.1 1. Organización de Actividades del Proyecto (Entregable 1)
    - 1.1.2 2. Descripción del Escenario y Posibles Desarrollos de Software (Entregable 2)
    - 1.1.3 3. Modelo de Negocio del Escenario (Entregable 3)
    - 1.1.4 4. Organigrama de la Organización (Entregable 4)
  - **1.2. Módulo I — Procedimientos, Eventos, Problemática, Alcance y Diagramas AS-IS** (`docs/01-modulo-i-pautas-y-analisis-escenario/02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md`)
    - 1.2.1 1. Procedimientos (Procesos) y Eventos de la Organización (Entregable 5)
    - 1.2.2 2. Documento de Problemática a Solucionar con Software (Entregable 6)
    - 1.2.3 3. Documento de Alcance Preliminar del Sistema (Entregable 7)
    - 1.2.4 4. Diagramas de Flujo de los Procesos Actuales Sin Sistema — AS-IS (Entregable 8)
- **Módulo II: Jerarquía de Procesos y Estructura de Datos** (`docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/`)
  - **2.1. Módulo II — Objetivo, Alcance Real, Usuarios y Jerarquía de Procesos** (`docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md`)
    - 2.1.1 1. Organización de Actividades del Módulo II y Validación del Módulo I
    - 2.1.2 2. Objetivo del Sistema
    - 2.1.3 3. Alcance Real del Sistema
    - 2.1.4 4. Identificación de Usuarios y Roles del Sistema
    - 2.1.5 5. Jerarquía de Procesos del Sistema y Cascada Operativa
  - **2.2. Módulo II — Requerimientos Funcionales/No Funcionales, Reglas de Negocio, Diagramas TO-BE y Casos de Uso** (`docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md`)
    - 2.2.1 1. Requerimientos Funcionales (RF01 – RF36)
    - 2.2.2 2. Requerimientos No Funcionales (RNF01 – RNF18)
    - 2.2.3 3. Reglas de Negocio (RN01 – RN22)
    - 2.2.4 4. Procesos Futuros Informatizados — Diagramas de Flujo TO-BE
    - 2.2.5 5. Casos de Uso Principales (CU01 – CU12)
    - 2.2.6 6. Priorización Funcional
    - 2.2.7 7. Validación del Análisis — Checklist de Cierre (Módulo II)
  - **2.3. Módulo II — Estructura Inicial de Datos y Clasificación por Proceso** (`docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md`)
    - 2.3.1 Introducción a la Estructura de Datos y Modelo Inicial de Base de Datos
    - 2.3.2 Proceso 1: Gestión de Clientes
    - 2.3.3 Proceso 2: Gestión de Usuarios y Roles
    - 2.3.4 Proceso 3: Solicitud de Ensayo
    - 2.3.5 Proceso 4: Recepción de Muestras
    - 2.3.6 Proceso 5: Gestión de Órdenes de Trabajo
    - 2.3.7 Proceso 6: Ejecución de Ensayos y Resultados
    - 2.3.8 Proceso 7: Emisión de Informes y Entrega de Resultados
    - 2.3.9 Proceso 8: Facturación
    - 2.3.10 Proceso 9: Reportes y Consultas
    - 2.3.11 Resumen por proceso
- **Módulo III: Arquitectura y Planificación de Implementación** (`docs/03-modulo-iii-arquitectura-y-planificacion/`)
  - **3.1. Módulo III — Tipo de Solución, Arquitectura y Selección Tecnológica Justificada** (`docs/03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md`)
    - 3.1.1 0. Organización de Actividades del Módulo III y Validación de Módulos I–II
    - 3.1.2 0.1. Definición y Justificación del Tipo de Solución Informática
    - 3.1.3 0.2. Arquitectura Técnica del Sistema (Dónde Vive, Datos, Acceso e Instalación)
    - 3.1.4 0.3. Selección Tecnológica Justificada
    - 3.1.5 1) Resumen ejecutivo
    - 3.1.6 2) Componentes principales
    - 3.1.7 2.1 Runtime y despliegue
    - 3.1.8 2.2 Base de datos
    - 3.1.9 2.3 Almacenamiento de objetos
    - 3.1.10 3) Stack de aplicacion (backend)
    - 3.1.11 4) Flujo tecnico simplificado
    - 3.1.12 5) Variables de entorno clave (referencia)
    - 3.1.13 6) Consideraciones operativas
    - 3.1.14 7) Ambientes recomendados
  - **3.2. Infraestructura y Configuración de Base de Datos PostgreSQL (Neon)** (`docs/03-modulo-iii-arquitectura-y-planificacion/02-INFRAESTRUCTURA_NEON_POSTGRESQL.md`)
    - 3.2.1 1. Creación y Configuración del Proyecto en Neon
    - 3.2.2 2. Configuración del Archivo .env
    - 3.2.3 3. Ejecución de Migraciones de Esquema (umzug + SequelizeMeta)
    - 3.2.4 4. Seedeo de Datos Base (Global, Granular y Restablecimiento de Claves)
    - 3.2.5 5. Verificación de Conexión
    - 3.2.6 Recursos Oficiales
  - **3.3. Descripción de la base de datos (gestion.ctmueble.com.ar)** (`docs/03-modulo-iii-arquitectura-y-planificacion/03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md`)
    - 3.3.1 Índice de tablas
    - 3.3.2 1. Catálogos y tipos (geo y documentos)
    - 3.3.3 2. Configuración y usuarios
    - 3.3.4 3. Clientes y empresas
    - 3.3.5 4. Ensayos (solicitudes y datos asociados)
    - 3.3.6 5. Órdenes de trabajo y muestras
    - 3.3.7 6. Documentos de ensayos
    - 3.3.8 7. Seguridad, sesiones, verificaciones y credenciales
    - 3.3.9 8. Diagrama de relaciones (resumen)
    - 3.3.10 9. Total de tablas
    - 3.3.11 10. Diagnóstico de Redundancias, Coherencia y Normalización (Módulo III.pdf)
    - 3.3.12 11. Comandos de Migraciones y Seedeo de Datos Base
  - **3.4. Módulo III — Diseño Modular, Navegación Funcional, Mockups y Planificación** (`docs/03-modulo-iii-arquitectura-y-planificacion/04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md`)
    - 3.4.1 1. Diseño Modular del Sistema
    - 3.4.2 2. Jerarquía de Módulos (Dependencias de Construcción y Operación)
    - 3.4.3 3. Navegación Funcional del Sistema
    - 3.4.4 4. Diseño de Interfaz — Mockups Estructurados de Pantallas
    - 3.4.5 5. Plan de Implementación (Cronograma por Etapas)
    - 3.4.6 6. Plan de Mantenimiento Inicial
    - 3.4.7 7. Revisión Integral Previa al Desarrollo — Checklist (Módulo III)
  - **3.5. Seguridad, permisos y auditoria** (`docs/03-modulo-iii-arquitectura-y-planificacion/05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md`)
    - 3.5.1 1) Modelo de seguridad actual
    - 3.5.2 2) Requisitos para acceder a un recurso
    - 3.5.3 2.1 Requisitos generales
    - 3.5.4 2.2 Matriz de acceso por modulo
    - 3.5.5 2.3 Requisitos por tipo de operacion sensible
    - 3.5.6 3) Sistema de permisos implementado
    - 3.5.7 3.1 Capa HTTP (Express)
    - 3.5.8 3.2 Capa aplicacion/servicio
    - 3.5.9 3.3 Capa repositorio/datos
    - 3.5.10 4) Auditoria: como se registra y que cubre
    - 3.5.11 4.1 Auditoria de ensayos
    - 3.5.12 4.2 Auditoria de ordenes de trabajo
    - 3.5.13 4.3 Trazabilidad temporal
    - 3.5.14 5) Falencias detectadas y refuerzos aplicados
    - 3.5.15 5.1 Refuerzos aplicados en este cambio
    - 3.5.16 5.2 Riesgos a reforzar (pendientes recomendados)
    - 3.5.17 6) Checklist rapido de cumplimiento operativo
  - **3.6. Politicas operativas del sistema** (`docs/03-modulo-iii-arquitectura-y-planificacion/06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md`)
    - 3.6.1 1) Objetivo y alcance
    - 3.6.2 2) Ambientes y configuracion base
    - 3.6.3 3) Politica de secretos y credenciales
    - 3.6.4 3.1 Secretos incluidos
    - 3.6.5 3.2 Rotacion de secretos
    - 3.6.6 3.3 Politica de expiracion y versionado
    - 3.6.7 4) Politica de actualizaciones del sistema
    - 3.6.8 4.1 Tipos de cambio
    - 3.6.9 4.2 Flujo operativo de actualizacion
    - 3.6.10 4.3 Ventanas y congelamiento
    - 3.6.11 5) Politica de contratos
    - 3.6.12 5.1 Contratos de API
    - 3.6.13 5.2 Contratos de datos (base de datos)
    - 3.6.14 5.3 Contratos de documentos y reportes
    - 3.6.15 6) Politica de migraciones
    - 3.6.16 6.1 Reglas de diseno
    - 3.6.17 6.2 Ejecucion de migraciones
    - 3.6.18 6.3 Cambios de riesgo alto
    - 3.6.19 7) Politica de despliegue y rollback
    - 3.6.20 7.1 Criterios de despliegue seguro
    - 3.6.21 7.2 Rollback
    - 3.6.22 8) Politica de auditoria operativa
    - 3.6.23 9) Politica de seguridad en operacion diaria
    - 3.6.24 10) Checklist operativo previo a liberar
    - 3.6.25 11) Control de cambios del documento
- **Módulo IV: Desarrollo, Implementación y Validación del Sistema** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/`)
  - **4.1. Módulo IV — Entorno, Arquitectura de Implementación, Inyección de Dependencias, Scripts, Incidencias y Tests** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md`)
    - 4.1.1 0. Organización de Actividades, Entorno y Desarrollo Incremental (Módulo IV.pdf)
    - 4.1.2 1. Inyección de Dependencias (serviceFactory y src/shared/di/)
    - 4.1.3 2. Variables de Entorno Dinámicas (EnvApplicationService y /env)
    - 4.1.4 3. Catálogos y Tipos del Sistema (TypesApplicationService y /types)
    - 4.1.5 4. Scripts CLI, Migraciones, Seeders y Empaquetado
    - 4.1.6 5. Suite de Pruebas Automatizadas (tests/)
    - 4.1.7 6. Registro de Incidencias Detectadas y Resueltas Durante el Desarrollo (Módulo IV.pdf)
    - 4.1.8 7. Demostración Funcional Interna y Validación Integral
  - **4.2. Documentación de Seguridad, Autenticación, 2FA y Gestión de Sesiones** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md`)
    - 4.2.1 1. Resumen Ejecutivo y Objetivos
    - 4.2.2 2. Modelado de Base de Datos y Migraciones
    - 4.2.3 3. Seguridad y Doble Factor de Autenticación (2FA)
    - 4.2.4 4. Códigos de Recuperación de Emergencia
    - 4.2.5 5. Dispositivos de Confianza (Bypass 2FA por 7 Días)
    - 4.2.6 6. Sesiones Activas y Política de Persistencia
    - 4.2.7 7. Estrategia de Renovación Silenciosa (Refresh Tokens)
    - 4.2.8 8. Matriz de Endpoints y Contratos de API
    - 4.2.9 9. Archivos Principales del Proyecto
  - **4.3. Verificación de Correo Electrónico y Recuperación de Contraseña** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md`)
    - 4.3.1 1. Arquitectura General y Flujos
    - 4.3.2 2. Verificación de Correo Electrónico (EmailVerificationService)
    - 4.3.3 3. Recuperación de Contraseña (PasswordResetService)
    - 4.3.4 4. Endpoints y Modo de Uso (/auth)
  - **4.4. Guía de Integración Frontend React (oficina.ctmueble.com.ar) — Cookies HttpOnly, CSRF y CSP** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/04-INTEGRACION_REACT_COOKIES_Y_CSP.md`)
    - 4.4.1 1. Resumen del Modelo Dual de Sesiones
    - 4.4.2 2. Variables de Entorno Recomendadas en el Backend (Vercel)
    - 4.4.3 3. Cliente HTTP en React (Axios / Fetch)
    - 4.4.4 4. Cabeceras CSP y Seguridad HTTP para el proyecto Vercel del Frontend (oficina.ctmueble.com.ar)
  - **4.5. Documentación de Gestión de Usuarios de Laboratorio, Roles y Matriz de Permisos** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md`)
    - 4.5.1 1. Resumen Ejecutivo y Objetivos
    - 4.5.2 2. Modelado de Base de Datos y Migraciones
    - 4.5.3 3. Catálogo de Permisos y Matriz por Rol
    - 4.5.4 4. Backend: Servicios, Controladores y Mailing
    - 4.5.5 5. Frontend: Interfaz, Componentes y UX
    - 4.5.6 6. Verificación y Calidad
  - **4.6. Sistema de Cifrado de Credenciales y Gestión Segura de API Keys** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md`)
    - 4.6.1 1. Objetivos y Principios de Diseño
    - 4.6.2 2. Arquitectura Criptográfica
    - 4.6.3 3. Envelope Encryption (KMS Ready)
    - 4.6.4 4. Modelo de Datos (system_api_keys)
    - 4.6.5 5. Guía de Configuración y Variables de Entorno
    - 4.6.6 6. Procedimiento de Rotación de Claves (Zero-Downtime)
    - 4.6.7 7. Uso en Código (Ejemplos para Desarrolladores)
    - 4.6.8 8. Gestión desde la Interfaz Gráfica
  - **4.7. Gestión de Empresas, Clientes, Personas y Autocompletado Auxiliar con ARCA (Opcional)** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md`)
    - 4.7.1 1. Servicio Auxiliar de Autocompletado con ARCA / AFIP (Opcional)
    - 4.7.2 2. Gestión de Empresas y Direcciones (BusinessApplicationService)
    - 4.7.3 3. Gestión de Clientes, Agenda y Personas
    - 4.7.4 4. Endpoints y Uso de API
  - **4.8. Gestión de Ensayos, Órdenes de Trabajo, Muestras y Exportación** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md`)
    - 4.8.1 1. Máquina de Estados del Ensayo y Acciones de Procedimiento
    - 4.8.2 2. Creación de Solicitud, Códigos Atómicos y Snapshot de Cliente
    - 4.8.3 3. Plantillas Reutilizables de Elementos (EssayElementTemplateApplicationService)
    - 4.8.4 4. Órdenes de Trabajo y Recepción de Muestras
    - 4.8.5 5. Carga de Resultados, Clasificación y Emisión de Informes
    - 4.8.6 6. Exportación a Planillas CSV y Excel (essaySpreadsheetExport.js)
  - **4.9. Arquitectura y Funcionamiento de la Generación de Documentos PDF** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/09-GENERACION_DOCUMENTOS_PDF.md`)
    - 4.9.1 1. Visión General y Filosofía de Diseño
    - 4.9.2 2. Catálogo de Formularios y Plantillas
    - 4.9.3 3. Motor Handlebars, Compilación y Caché
    - 4.9.4 4. Helpers Registrados de Handlebars
    - 4.9.5 5. Estructura de Datos (Payloads) por Formulario
    - 4.9.6 6. Endpoints de Descarga y Resolución de Documentos
    - 4.9.7 7. Seguridad y Concurrencia
    - 4.9.8 8. Guía de Modificación de Plantillas para Desarrolladores
  - **4.10. Sistema de Notificaciones por Correo Electrónico** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md`)
    - 4.10.1 1. Resumen Ejecutivo y Objetivos
    - 4.10.2 2. Arquitectura del Sistema
    - 4.10.3 3. Modelo de Datos y Migraciones
    - 4.10.4 4. Mensajes y Estados Notificados al Solicitante
    - 4.10.5 5. Notificación de Nuevas Solicitudes al Laboratorio
    - 4.10.6 6. Mecanismo de Desuscripción (Opt-Out)
    - 4.10.7 7. Políticas de Seguridad y Concurrencia Transaccional
    - 4.10.8 8. Endpoints API
  - **4.11. Sistema de Auditoría, Integridad Criptográfica y Fecha Cierta (OpenTimestamps)** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md`)
    - 4.11.1 1. Motivación y Contexto
    - 4.11.2 2. Arquitectura General
    - 4.11.3 3. Componentes Criptográficos e Integridad
    - 4.11.4 4. Certificación de Fecha Cierta con OpenTimestamps (OTS)
    - 4.11.5 5. Auditoría de Operaciones con Huella de Dispositivo
    - 4.11.6 6. Ciclo de Vida: Re-emisiones y Modificaciones
    - 4.11.7 7. Experiencia de Usuario y Segmentación de Perfiles
    - 4.11.8 8. Resumen de Modelos y Rutas de API
  - **4.12. Contratos frontend-backend** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md`)
    - 4.12.1 1) Convenciones globales
    - 4.12.2 2) Contratos por módulo
    - 4.12.3 3) Contratos de datos principales (DTOs de referencia)
    - 4.12.4 4) Reglas de compatibilidad frontend-backend
    - 4.12.5 5) Fuente oficial
  - **4.13. Pipeline HTTP, Middlewares, Idempotencia, Redis y Auditoría de Seguridad** (`docs/04-modulo-iv-desarrollo-implementacion-y-validacion/13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md`)
    - 4.13.1 1. Arquitectura del Pipeline HTTP (src/app.js)
    - 4.13.2 2. Protección CSRF y Lista Blanca de Orígenes (csrf.js)
    - 4.13.3 3. Middleware de Idempotencia (idempotency.js)
    - 4.13.4 4. Rate Limiting Distribuido (rateLimit.js)
    - 4.13.5 5. Cliente Redis Resiliente (RedisClient.js) y Revocación de Sesiones
    - 4.13.6 6. Transacciones SQL y Contexto de Request (transaction.js y db.js)
    - 4.13.7 7. Normalización de Errores y Auditoría de Seguridad

---

# Módulo I — Pautas Generales, Organización y Análisis del Escenario

> Equipo de trabajo, escenario CTM, modelo de negocio, organigrama, procesos, problemática, alcance y diagramas AS-IS.

<!-- Fuente: docs/01-modulo-i-pautas-y-analisis-escenario/01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md -->

# Módulo I — Organización del Equipo, Escenario, Modelo de Negocio y Organigrama (CTM)

> **Correspondencia con lineamientos (**`Módulo I.pdf`**):** Cubre los entregables **1 (Organización del equipo)**, **2 (Descripción del escenario y posibles desarrollos de software)**, **3 (Descripción del modelo de negocio)** y **4 (Organigrama de la organización)**.

---

## 1. Organización de Actividades del Proyecto (Entregable 1)

Para el relevamiento, análisis, diseño y construcción de la plataforma `gestion.ctmueble.com.ar`, el equipo organizó su trabajo bajo una estructura de roles definida, canales claros de comunicación y un flujo incremental basado en los Módulos I a IV.

### 1.1. Integrantes y Roles del Equipo de Trabajo


| Rol en el proyecto                                 | Responsabilidades principales                                                                                                                                                                       | Módulos liderados       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Líder Técnico / Arquitectura Backend**           | Diseño de Clean Architecture/DDD (`domain`, `application`, `infrastructure`, `presentation`), inyección de dependencias (`serviceFactory` y `di`), seguridad JWT/Cookies/2FA y revisión de código.  | Módulos I, III y IV     |
| **Responsable de Base de Datos e Infraestructura** | Modelado relacional PostgreSQL (34 tablas en Neon), migraciones Umzug, índices, transacciones ACID, almacenamiento en Cloudflare R2, caché Redis y despliegue en Vercel.                            | Módulos II, III y IV    |
| **Responsable de Análisis Funcional y Dominio**    | Relevamiento del negocio del CTM, reglas de negocio de ensayos (`F-PC13-01`, `F-PC13-02`, `F-PC13-03`), máquinas de estado, casos de uso y documentación funcional.                                 | Módulos I y II          |
| **Responsable de Frontend, Integración y UX**      | Contratos REST API con SPA React, manejo de cookies `HttpOnly` + CSRF (`X-CSRF-Token`), flujos de formularios, tablas y descarga de documentos PDF/XLSX.                                            | Módulos III y IV        |
| **Responsable de QA, Seguridad y Documentación**   | Suite de pruebas automatizadas (`node --test`), auditoría de vulnerabilidades (RBAC, IDOR, CSRF, CSV Injection, cifrado AES-256-GCM, OpenTimestamps), manuales de usuario y compilación documental. | Módulos I, II, III y IV |




### 1.2. Forma de Comunicación del Equipo

- **Comunicación sincrónica (reuniones rápidas / toma de decisiones):** Videollamadas y canales de mensajería directa para destrabar incidencias de integración, revisiones de contratos HTTP o aprobaciones de esquema SQL.
- **Comunicación asincrónica y trazable:**
  - *Issues* y *Pull Requests* en GitHub para cambios técnicos, migraciones y revisiones de seguridad.
  - Documentación técnica y funcional versionada en el directorio `/docs` dentro del mismo repositorio para evitar desincronización entre código y documentos.



### 1.3. Herramientas de Trabajo


| Categoría                           | Herramienta                                                                     | Uso en el proyecto                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Control de versiones y código**   | Git + GitHub                                                                    | Repositorio fuente (`gestion.ctmueble.com.ar` para el BE y `oficina.ctmueble.com.ar` para el FE), ramas por funcionalidad/remediación y commits trazables. |
| **Gestión de tareas y seguimiento** | Tablero Kanban (Trello / GitHub Projects)                                       | Seguimiento de entregas por módulo, priorización funcional (Alta / Media / Baja) y registro de incidencias.                                                |
| **Documentación colaborativa**      | Markdown (`/docs`), Google Drive y Puppeteer                                    | Redacción estructurada en `.md`, diagramación y compilación en PDF consolidado con índice.                                                                 |
| **Desarrollo y API Testing**        | Visual Studio Code, Node.js, Swagger UI (`/api-docs`), Postman / Thunder Client | Implementación de capas, pruebas manuales de endpoints con cookies CSRF y validación contra esquemas OpenAPI.                                              |
| **Infraestructura Cloud**           | Vercel, Neon PostgreSQL, Cloudflare R2, Redis, Resend, ARCA / Padrón A13 (opcional) | Entorno de ejecución serverless, base de datos administrada, almacenamiento de objetos, envío de correos y sistema auxiliar opcional de autocompletado de datos de clientes. |




### 1.4. Cronograma de Actividades (Ejecución por Fases)


| Fase / Módulo                                               | Horizonte de trabajo                                                                   | Hitos y entregables clave                                                                                                                                                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Módulo I — Análisis del escenario y problemática**        | Inicio del proyecto (Fase de relevamiento)                                             | Organización del equipo, relevamiento operativo del CTM, modelo de negocio, organigrama, lista de procesos/eventos, problemática, alcance y diagramas AS-IS.                                                       |
| **Módulo II — Jerarquía de procesos y estructura de datos** | Análisis funcional profundo                                                            | Objetivo y alcance definitivo, roles de usuarios, jerarquía de procesos y cascada operativa, requerimientos (`RF`/`RNF`), reglas de negocio, flujos TO-BE, casos de uso y modelo inicial de datos.                 |
| **Módulo III — Arquitectura y planificación**               | Diseño técnico e ingeniería                                                            | Stack tecnológico justificado (Vercel/Neon/R2/Node), diseño lógico definitivo (34 tablas normalizadas), diseño modular, navegación/mockups, seguridad/permisos y plan de implementación.                           |
| **Módulo IV — Desarrollo, implementación y validación**     | Ciclo iterativo (`Febrero 2026 – Noviembre 2026`, migraciones `20260217` a `20261117`) | Construcción física de BD en Neon, desarrollo incremental en 4 etapas (Auth/Base → Clientes y autocompletado opcional ARCA → Ensayos/OT/Muestras → PDFs/Auditoría/2FA/Hardening), 90 tests unitarios/seguridad/contratos y manuales finales. |




### 1.5. Reuniones de Seguimiento del Proyecto

1. **Reunión de planificación por módulo (al inicio de cada etapa):** Validación de entregables previos (regla estricta de que ningún módulo contradiga lo aprobado en el anterior) y asignación de responsables.
2. **Revisión semanal de avance técnico e incidencias:** Verificación de migraciones PostgreSQL ejecutadas con Umzug, cobertura de endpoints en `CONTRATOS_FRONTEND_BACKEND.md`, y ejecución completa de `npm test`.
3. **Demo y validación funcional interna previa al cierre:** Prueba integral punta a punta del flujo completo (Alta manual de cliente o autocompletado opcional con ARCA → Solicitud `F-PC13-02` → Presupuesto → Recepción y `F-PC13-03` → Resultados → Emisión `F-PC13-01` + Snapshot RSA/OTS).



### 1.6. Metodología de Trabajo

Se adoptó una **metodología iterativa e incremental dividida por módulos funcionales y capas arquitectónicas (DDD + Clean Architecture)**:

- Ninguna funcionalidad pasa a código sin haber validado su jerarquía de procesos, reglas de negocio y modelo de datos.
- El desarrollo de software sigue orden de dependencias reales: primero **Seguridad y Usuarios**, luego **Empresas, Clientes y Personas (con soporte auxiliar opcional de autocompletado vía ARCA sin ser necesario activarlo)**, después el núcleo **Ensayos, Órdenes de Trabajo y Muestras**, y finalmente **Documentos PDF bajo demanda, Notificaciones, Exportación XLSX/CSV e Integridad Criptográfica**.

---



## 2. Descripción del Escenario y Posibles Desarrollos de Software (Entregable 2)

### 2.1. Nombre de la Organización y Rubro

- **Organización:** **Centro Tecnológico del Mueble (CTM)** (`ctmueble.com.ar`).
- **Misión / Objeto principal:** **El Centro Tecnológico del Mueble Cañada de Gómez (CTM)**
es una iniciativa público-privada de la ciudad de Cañada de Gómez y la región, zona sur de la provincia de Santa Fe, donde se concentra uno de los clusters del mueble más importantes de Argentina.  
El CTM surge por la necesidad de profesionalizar las industrias del sector, casi en su totalidad conformado por pymes, frente a un escenario que requiere, cada vez más, de mayor competitividad y capacidad de respuesta a un mercado que crece en complejidad y dinamismo. En este marco, la promoción e implementación de actividades relacionadas con la Investigación, el Desarrollo y la Innovación se vuelven de vital importancia y tienen el objeto de asegurar el desarrollo sostenido de este conglomerado de unidades productivas.
Su creación es promovida por la Cámara de la Industria Maderera y Afines de Cañada de Gómez (CIMA), el Centro Económico de Cañada de Gómez, la Fundación para el Desarrollo de Cañada de Gómez (FUDECA) y la Municipalidad de Cañada de Gómez.



### 2.2. Actividades que Realiza

El Laboratorio CTM tiene como misión brindar servicios de análisis sobre tableros derivados de la madera destinados al fortalecimiento de la calidad en la industria maderera, aportando valor agregado a los productos comercializados en el territorio nacional, así como también aquellos que sean exportados.

Toda esta operatoria se rige por un **Sistema de Gestión de Calidad (SGC)** documentado en procedimientos e instrucciones técnicas (`PC13`, `PC15`, `PC16`, `PC18`, `IT16-01`, `IT17-01`). En ese marco, lo que la plataforma `gestion.ctmueble.com.ar` abarca es específicamente la **sistematización de los procedimientos del Sistema de Gestión de Calidad vinculados al vínculo con el cliente y al análisis de laboratorio**:

1. **Asistencia y automatización de procesos del Sistema de Gestión de Calidad (SGC):** Digitaliza y controla de punta a punta las etapas exigidas por los procedimientos `PC13`, `PC15`, `PC16` y `PC18` (solicitudes de ensayo, revisión de capacidad/ofertas, recepción y acondicionamiento de muestras, órdenes de trabajo, carga y cálculo analítico, emisión y rectificación de informes y custodia auditable de registros).
2. **Gestión de la Relación con el Cliente (CRM):** Permite administrar de forma centralizada la cartera de empresas solicitantes, sus domicilios, representantes legales y contactos, el historial comercial y contractual de cada cliente, el seguimiento de presupuestos/términos y las comunicaciones automáticas de avance, articulando la relación con el cliente dentro del propio flujo de calidad.

### 2.3. Partes que intervienen



#### **1. Director del laboratorio / Director Técnico**

- **Revisión y aprobación de solicitudes/ofertas:** Evalúa si el laboratorio cuenta con la capacidad y los recursos para realizar el ensayo solicitado. Si no es posible, se encarga de informarlo por escrito al cliente. Genera el código de solicitud.
- **Gestión de riesgos:** Realiza el análisis de riesgos de imparcialidad en la matriz correspondiente y toma las acciones derivadas de dicho resultado.
- **Aprobación de informes:** Es la persona responsable de aprobar los informes de ensayo emitidos. Asimismo, firma las copias solicitadas por el cliente.



#### **2. Responsable de Calidad**

- **Gestión de solicitudes:** Realiza la revisión previa del formulario de solicitud de ensayo para deducir datos como el peticionario, tipo de servicio y elementos a ensayar.
- **Recepción y control de muestras:** Recibe las muestras enviadas por el cliente, verifica su tipo, cantidad y estado, y registra cualquier anomalía en el formulario correspondiente.
- **Gestión del proceso de laboratorio:** Genera el número de orden de trabajo e identifica las muestras y contramuestras con la codificación requerida. Cuando corresponde a ensayos específicos (como emisión de formaldehído), sella los bordes de las muestras según la instrucción técnica.
- **Custodia de registros:** Es el responsable del archivo y retención permanente u 8 años de los registros y formularios del sistema de gestión.



#### **3. Responsable Técnico**

- **Elaboración de documentos:** Es el responsable de elaborar y actualizar las distintas versiones de los procedimientos del Sistema de Gestión de Calidad (como PC13, PC15 y PC16).



#### **4. Laboratorista**

- **Participación operativa:** Participa en la ejecución general de las actividades dentro del alcance de los procedimientos de revisión de solicitudes, emisión de informes y manipulación de muestras.
- **Recepción y acondicionamiento de muestras (en versiones anteriores/genéricas):** Realiza la recepción de las muestras, control de estado y cantidad, la codificación, así como el sellado de bordes para ensayos de tableros de madera cuando le sea asignado o en procedimientos previos.



#### **5. Cliente**

- **Solicitud de servicios:** Realiza la petición inicial de ensayos a través de cualquier medio de comunicación (personalmente, teléfono, correo electrónico, WhatsApp, etc.).
- **Formulario de solicitud:** Completa el *Formulario de solicitud de ensayo* (F-PC13-01) con la información requerida y lo envía formalmente al laboratorio.
- **Envío de muestras:** Remite al laboratorio los ítems de ensayo y contramuestras según las instrucciones establecidas (IT16-01).
- **Gestión de desviaciones y acuerdos:** Recibe notificaciones y acuerda acciones con el laboratorio en caso de limitaciones de recursos, desviaciones o modificaciones en las especificaciones del contrato.
- **Recepción y solicitud de informes/muestras:** Recibe el informe de ensayo final (en formato impreso o electrónico PDF) y confirma su recepción; asimismo, puede solicitar la devolución de muestras o copias adicionales del informe.

> Estos roles son descritos en los documentos de los Procedimientos de 13, 16 y 18 del Sistema de Gestión de Calidad. De momento el laboratoria cuenta con unicamente dos personas trabajando en el, que son el Director del laboratorio y el responsable de calidad, que cumplen tambien el rol de laboratorista.



### 2.4. Cómo Trabajaban Antes del Sistema y Qué Información Manejaban

Previo a la implementación de `gestion.ctmueble.com.ar`, el flujo administrativo y técnico dependía de:

- **Planillas de cálculo aisladas (Excel) y procesadores de texto (Word):** Para redactar solicitudes `F-PC13-01`, órdenes `F-PC16-01` e informes `F-PC15-01`.
- **Registros manuales o cuadernos de ingreso:** Para anotar códigos correlativos diarios de ensayos y órdenes, estado de recepción de muestras y mediciones crudas en banco de prueba.
- **Envio manual de notificaciones:** Cada acto relacionado a la aceptación y/o rechazo de la solicitud de ensayo, formalización de contrato y la emisión del informe requeria de comunicarse manualmente con los clientes.

La información crítica manejada incluye:

- Datos fiscales de empresas (CUIT, razón social, domicilios por distrito/provincia, datos alternativos de facturación e IVA).
- Datos personales de representantes legales y contactos técnicos (nombre, DNI, correo, teléfono, código de país).
- Especificaciones de producto y normas a ensayar (denominación del producto, material base, tamaño nominal, lote, tipo de ensayo).
- Evidencias operativas (códigos diarios únicos, estados de muestras, mediciones analíticas por duplicado o serie, promedios, observaciones y trazabilidad de cada cambio).



### 2.5. Problemas Detectados y Procesos Candidatos a Informatizarse

El relevamiento evidenció que el laboratorio operaba bajo procedimientos de calidad documentados en papel/Word, sin un software que los sistematizara ni que unificara el seguimiento comercial con sus clientes. Por ello, los procesos candidatos a informatizarse responden directamente a la **asistencia y automatización del Sistema de Gestión de Calidad (SGC)** y a la **gestión integral de la relación con el cliente (CRM)**:

| Problema detectado en la operatoria manual                                                                       | Proceso que debía informatizarse                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Errores o colisiones al asignar numeración correlativa diaria de solicitudes y órdenes de trabajo del SGC.       | **Generación atómica de códigos diarios de trazabilidad** secuenciales por fecha Argentina (`daily_sequence_counters`).                                                     |
| Carga repetitiva de empresas, domicilios y contactos sin un historial unificado de relación con cada cliente.    | **Módulo CRM de Empresas, Clientes y Personas** con agenda compartida, historial de vínculos, carga manual autónoma y soporte auxiliar opcional de autocompletado desde Padrón A13 de ARCA/AFIP (sin ser necesaria su activación). |
| Pérdida de trazabilidad digital sobre quién presupuestó, quién aceptó condiciones y cuándo ingresó cada muestra. | **Asistencia y automatización del flujo SGC** mediante máquina de estados estricta y **log de auditoría inmutable** de ensayos y órdenes.                                   |
| Demoras en el armado manual de formularios SGC y riesgo de alteración posterior de informes emitidos.            | **Generación automática on-the-fly de PDFs del SGC (**`F-PC13-01`**,** `F-PC13-02`**,** `F-PC16-01`**,** `F-PC15-01`**)** + **snapshots firmados con RSA-SHA256 y OpenTimestamps**. |
| Falta de avisos oportunos en la relación con el cliente y el personal técnico ante cambios de etapa.             | **Notificaciones CRM automáticas por email (Resend)** vinculadas a hitos del SGC, con control granular de preferencias y desuscripción.                                      |
| Imposibilidad de consolidar estadísticas operativas del SGC y cartera de clientes en Excel de forma rápida.      | **Motor de exportación estructurada a CSV y XLSX** con múltiples hojas (resumen, métricas por estado y muestras).                                                           |




### 2.6. Posibles Sistemas de Software a Desarrollar

Del relevamiento inicial surgieron tres alternativas de desarrollo:

1. *Sistema local de escritorio para carga interna:* Descartado porque impediría la interacción remota en la relación con el cliente (CRM), haciendo imposible que los solicitantes carguen autogestionadamente sus solicitudes `F-PC13-01`, acepten presupuestos en línea o descarguen sus informes desde cualquier ubicación.
2. *Portal informativo estático con formularios por correo:* Insuficiente porque no resuelve la asistencia y automatización interna de los procedimientos del SGC (órdenes de trabajo, trazabilidad de muestras, cálculos de laboratorio ni auditoría).
3. **Plataforma Web de Sistematización del SGC y CRM Cliente/Laboratorio (**`oficina.ctmueble.com.ar` **— Solución Elegida):** Sistema web centralizado que **sistematiza los procedimientos del Sistema de Gestión de Calidad vinculados al vínculo con el cliente (CRM) y al análisis de laboratorio**. Asiste y automatiza los procesos normativos del SGC (`PC13`, `PC15`, `PC16`, `PC18`) y centraliza la relación con el cliente mediante perfiles diferenciados (`CLIENT` y `LABORATORY`), backend API REST serverless, base de datos relacional PostgreSQL, almacenamiento seguro en la nube y soporte auxiliar opcional de autocompletado de datos de clientes vía Padrón A13 de ARCA (no requerido para operar; habilitable mediante `ARCA_CUIT` y certificado/clave `ARCA_*`).

---



## 3. Modelo de Negocio del Escenario (Entregable 3)



### 3.1. Generación de Ingresos y Propuesta de Valor

- El CTM genera ingresos prestando **servicios técnicos arancelados de ensayo de laboratorio y emisión de informes técnicos** respaldados por su Sistema de Gestión de Calidad para la industria del mueble y afines.
- La propuesta de valor de la plataforma radica en la **sistematización conjunta de los procedimientos del SGC y la relación con el cliente (CRM)**:
  - **Eje de relación con el cliente (CRM):** centraliza la ficha integral de cada empresa, sus representantes legales, contactos técnicos, solicitudes históricas, presupuestos y comunicaciones automáticas en un portal compartido cliente/laboratorio.
  - **Eje de asistencia y automatización del SGC y análisis de laboratorio:** guía y automatiza cada acuerdo contractual y operativo conforme a los procedimientos `PC13`, `PC15`, `PC16` y `PC18`: el cliente solicita un ensayo (`F-PC13-01`), el laboratorio fija **costo estimado, plazo de ejecución y fecha de pago** (`F-PC13-02`), el cliente acepta formalmente dichos términos mediante contrato y, tras ejecutarse el análisis sobre las muestras ingresadas (`F-PC16-01`, instrucciones `IT16-01` e `IT17-01`), se emite automáticamente el informe oficial (`F-PC15-01`) con trazabilidad e integridad verificable.



### 3.2. Servicios Ofrecidos y Clientes / Usuarios

- **Servicios principales:** Ensayos normalizados catalogados dinámicamente (`types_essays`), por ejemplo análisis de emisión/contenido de formaldehído, evaluación de productos específicos y emisión de certificados/informes rectificables cuando corresponda.
- **Clientes / Usuarios externos (**`CLIENT`**):** Fábricas de muebles, productores de tableros, importadores, distribuidores y personas físicas/jurídicas que requieren certificar o validar lotes de material. Pueden autogestionar solicitudes propias o ser cargados y agendados por el laboratorio.
- **Usuarios internos (**`LABORATORY`**):** Personal de Dirección, Administración, Recepción, Laboratorio Técnico y Consulta del CTM.



### 3.3. Roles / Partes Intervinientes, Tareas, Información y Documentación Usada


| Parte interviniente / Rol                          | Tareas principales                                                                                                                                                                | Información que utiliza                                                                                                                                      | Documentos / Formularios asociados                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **1. Director del Laboratorio / Director Técnico** | Revisar capacidad y recursos ante solicitudes, aprobar ofertas y generar código de solicitud, analizar riesgos de imparcialidad, aprobar y firmar informes, administrar sistema.  | Solicitudes recibidas, matriz de imparcialidad, capacidad operativa, parámetros `/env` (`CUIT`, `UNCERTAINTY`, CBU), permisos (`ADMIN`) y reportes CSV/XLSX. | Formularios `F-PC13-01` / `F-PC13-02`, matriz de riesgos, informes `F-PC15-01`, variables `/env`.        |
| **2. Responsable de Calidad**                      | Revisar previamente el formulario de solicitud, recibir y controlar muestras y anomalías, generar OT, codificar y sellar muestras/contramuestras, archivar y custodiar registros. | Datos de peticionario, tipo de servicio, elementos, estado/cantidad de probetas, código diario de OT (`F-PC16-01`), logs de auditoría y archivo histórico.   | Solicitud `F-PC13-01`, Orden de Trabajo `F-PC16-01`, instrucción `IT16-01`, archivo (permanente/8 años). |
| **3. Responsable Técnico**                         | Elaborar, revisar y actualizar las versiones de los procedimientos documentados del Sistema de Gestión de Calidad.                                                                | Normativa aplicable, métodos de ensayo, flujos del laboratorio e instrucciones técnicas vigentes.                                                            | Procedimientos SGC (`PC13`, `PC15`, `PC16`, `PC18`) y sus revisiones.                                    |
| **4. Laboratorista**                               | Ejecutar operativamente las actividades de ensayo, manipular y acondicionar muestras, sellar bordes cuando aplique, cargar lecturas y asistir en emisión de informes.             | Órdenes de trabajo asignadas, código de muestra, instrucciones técnicas (`IT16-01`), lecturas crudas, promedios y observaciones analíticas.                  | Orden de Trabajo `F-PC16-01`, planillas de ensayo, datos en sistema (`USER`).                            |
| **5. Cliente (**`CLIENT` **— externo)**            | Realizar petición inicial, completar y enviar solicitud, remitir muestras y contramuestras, acordar desviaciones/términos y recibir/solicitar copias del informe o devolución.    | CUIT, razón social, domicilio, contactos, especificaciones del producto/tablero, presupuestos, notificaciones y PDFs emitidos.                               | Solicitud `F-PC13-01`, contrato/términos `F-PC13-02`, guía `IT16-01`, Informe `F-PC15-01`.               |


---



## 4. Organigrama de la Organización (Entregable 4)

A continuación se representa el organigrama institucional y operativo del CTM basado en las **partes que intervienen** en el Sistema de Gestión de Calidad (Procedimientos `PC13`, `PC15`, `PC16` y `PC18`) y en la plataforma `gestion.ctmueble.com.ar`:

```mermaid
flowchart TD
    PRES["PRESIDENCIA DE FU.DE.CA<br/>(Autoridad Institucional · PRESIDENT)"]
    DIR["1. DIRECTOR DEL LABORATORIO / DIRECTOR TÉCNICO<br/>(LAB_DIRECTOR · Rol ADMIN)<br/>• Revisión de capacidad y ofertas<br/>• Generación de código de solicitud<br/>• Matriz de riesgos de imparcialidad<br/>• Aprobación y firma de informes<br/>• Gobierno del sistema y permisos /env"]
    CAL["2. RESPONSABLE DE CALIDAD<br/>• Revisión previa de solicitud F-PC13-01<br/>• Recepción/control de muestras y anomalías<br/>• Emisión OT F-PC16-01 y codificación<br/>• Custodia de registros permanente u 8 años"]
    TEC["3. RESPONSABLE TÉCNICO<br/>(Documentación SGC)<br/>• Elaboración y actualización de<br/>procedimientos SGC: PC13, PC15, PC16, PC18"]
    CLI["5. CLIENTE EXTERNO<br/>(Perfil CLIENT)<br/>• Petición inicial y solicitud F-PC13-01<br/>• Aceptación oferta/desviaciones F-PC13-02<br/>• Envío muestras IT16-01 y recepción F-PC15-01"]
    LAB["4. LABORATORISTA (Ejecución Operativa · Rol USER)<br/>Nota: Actualmente desempeñado en conjunto por el Director<br/>y el Responsable de Calidad (dotación de 2 personas)<br/>• Ejecución general de ensayos PC13/PC15/PC16<br/>• Recepción, acondicionamiento, codificación y sellado IT16-01<br/>• Medición técnica y carga de resultados/promedios en OT"]

    PRES --> DIR
    DIR --> CAL
    DIR --> TEC
    DIR -. "Relación contractual y envío de informes" .- CLI
    DIR -. "Asume tareas operativas" .-> LAB
    CAL -. "Asume tareas operativas" .-> LAB
    CAL --> LAB
```



### 4.1. Jerarquías, Responsabilidades y Relación entre Partes Intervinientes

- **Estructura jerárquica e integración actual:**
  - En la cúspide institucional se encuentra la **Presidencia de FU.DE.CA (**`PRESIDENT`**)**, que delega la conducción operativa, técnica y administrativa del laboratorio en el **1. Director del Laboratorio / Director Técnico (**`LAB_DIRECTOR`**)**.
  - Bajo esta conducción se articulan el **2. Responsable de Calidad** (encargado del control documental previo, recepción de muestras, emisión de OT y custodia de registros) y el **3. Responsable Técnico** (encargado de elaborar y actualizar los procedimientos `PC13`, `PC15`, `PC16` y `PC18`).
  - En el nivel operativo se ubica el rol de **4. Laboratorista**. *Nota organizativa vigente:* actualmente el laboratorio opera con una dotación de **dos personas** —el **Director del Laboratorio** y el **Responsable de Calidad**—, quienes asumen conjuntamente las tareas operativas del **Laboratorista**.
- **Relación operativa transversal con el Cliente (**`5. Cliente`**):**
  1. El **Cliente** inicia la petición y completa la solicitud `F-PC13-01`; el **Responsable de Calidad** realiza la revisión previa de datos y el **Director del Laboratorio** evalúa capacidad/imparcialidad, genera el código de solicitud y aprueba la oferta/contrato (`F-PC13-02`).
  2. El **Cliente** confirma términos/desviaciones y remite las probetas y contramuestras conforme a `IT16-01`.
  3. El **Responsable de Calidad** (y **Laboratorista**) recibe y controla físicamente las muestras, genera la Orden de Trabajo `F-PC16-01`, codifica y sella bordes según corresponda, y registra los resultados analíticos.
  4. El **Director del Laboratorio** aprueba y firma el Informe Final `F-PC15-01` (resguardado con snapshot criptográfico RSA-SHA256 + OpenTimestamps), el **Responsable de Calidad** lo custodia conforme a los plazos de retención (8 años / permanente) y el **Cliente** recibe el informe en formato PDF o impreso.

---

<!-- Fuente: docs/01-modulo-i-pautas-y-analisis-escenario/02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md -->

# Módulo I — Procedimientos, Eventos, Problemática, Alcance y Diagramas AS-IS

> **Correspondencia con lineamientos (**`Módulo I.pdf`**):** Cubre los entregables **5 (Lista de procesos y eventos)**, **6 (Documento de problemática)**, **7 (Documento de alcance del sistema)** y **8 (Diagramas de flujo de los procesos actuales AS-IS)**.

---

## 1. Procedimientos (Procesos) y Eventos de la Organización (Entregable 5)

Del análisis operativo del **Centro Tecnológico del Mueble (CTM)** se identifican los procedimientos regulares y los eventos externos/internos que los disparan.

### 1.1. Lista de Procesos de la Organización


| Código  | Proceso organizacional                                         | Sector responsable                 | Descripción sintética                                                                                                                                   |
| ------- | -------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P01** | **Registro y autenticación de usuarios**                       | Administración / Solicitante       | Alta de cuenta de cliente o invitación a miembro de laboratorio, verificación de email y control de acceso seguro.                                      |
| **P02** | **Gestión y agendado de clientes**                             | Administración / Solicitante       | Registro de empresa (CUIT, razón social), carga manual directa o autocompletado auxiliar opcional desde Padrón A13 de ARCA/AFIP (si se habilita), domicilios, representante legal y contactos. |
| **P03** | **Solicitud de servicio de ensayo (**`F-PC13-02`**)**          | Solicitante / Recepción            | Creación del pedido de ensayo indicando empresa, contacto, tipo de ensayo, muestras estimadas y elementos/productos a analizar.                         |
| **P04** | **Presupuestación y acuerdo de condiciones**                   | Administración / Solicitante       | Revisión del pedido (`VERIFYING`), asignación de costo, plazo y vencimiento (`PENDING_ACCEPTANCE`) y aceptación/rechazo por el cliente.                 |
| **P05** | **Recepción de muestras y Orden de Trabajo (**`F-PC13-03`**)** | Recepción / Laboratorio            | Verificación física de las probetas recibidas, asignación de códigos internos y apertura de la Orden de Trabajo.                                        |
| **P06** | **Ejecución de ensayos y carga de resultados**                 | Técnicos de Laboratorio            | Medición técnica sobre cada muestra, cálculo de promedio analítico y registro de observaciones/resultados.                                              |
| **P07** | **Emisión y rectificación de informes (**`F-PC13-01`**)**      | Dirección Técnica / Calidad        | Validación mínima de muestras analizadas, clasificación técnica (`E1`/`E2`), emisión del informe PDF y sellado de integridad.                           |
| **P08** | **Notificación y seguimiento documental**                      | Sistema / Atención al Cliente      | Aviso al solicitante en cambios de estado, recordatorios, descarga de formularios y consulta histórica.                                                 |
| **P09** | **Auditoría, reportes y exportación operativa**                | Dirección / Auditoría (`CONSULTA`) | Control de cambios en ensayos/órdenes, eventos de seguridad y exportación consolidada en formatos CSV y XLSX.                                           |




### 1.2. Catálogo de Eventos Disparadores


| Evento identificado                                                                    | Proceso que dispara | Actor que lo origina                 |
| -------------------------------------------------------------------------------------- | ------------------- | ------------------------------------ |
| Un cliente nuevo desea operar con el laboratorio o es invitado por personal interno.   | **P01**, **P02**    | Solicitante externo o Administración |
| Se ingresa o actualiza un CUIT empresarial (carga manual o autocompletado opcional). | **P02**             | Usuario autorizado / Sistema auxiliar ARCA (si está activo) |
| Llega una necesidad de certificar o ensayar un lote de tableros o muebles.             | **P03**             | Cliente / Operador de laboratorio    |
| Se detecta un pedido en evaluación técnica listo para cotizar.                         | **P04**             | Administración / Jefatura técnica    |
| El solicitante acepta el presupuesto y plazos, o rechaza / vence la oferta.            | **P04**             | Cliente (`CLIENT`)                   |
| Ingresa físicamente un paquete o lote de probetas al laboratorio del CTM.              | **P05**             | Transporte / Cliente / Recepción     |
| El técnico finaliza las mediciones analíticas de las muestras de una Orden de Trabajo. | **P06**             | Técnico Ensayista                    |
| Todas las muestras necesarias quedan cargadas y listas para certificación.             | **P07**             | Jefatura / Técnico autorizado        |
| Se detecta una fe de erratas o aclaración técnica sobre un informe ya emitido.         | **P07**             | Dirección Técnica (`MODIFICATION`)   |
| Se requiere rendición mensual o control administrativo de ensayos por rango de fechas. | **P09**             | Administración / Dirección           |


---



## 2. Documento de Problemática a Solucionar con Software (Entregable 6)



### 2.1. Cómo Trabajaban Actualmente (Situación Sin Sistema Integrado)

La operación diaria previa dependía de herramientas desconectadas para ejecutar manualmente tanto los **procedimientos del Sistema de Gestión de Calidad (SGC)** (`PC13`, `PC15`, `PC16`, `PC18`) como el **vínculo con los clientes (CRM)**: planillas Excel para llevar registros de pedidos y resultados, plantillas Word editadas manualmente para generar los formularios oficiales (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`), correo electrónico convencional para recibir solicitudes, enviar presupuestos y hacer seguimiento de clientes, y carpetas compartidas en red local para guardar los PDFs generados.

### 2.2. Detalle de Problemas Detectados

- **Tareas realizadas manualmente:**
  - Tipeo manual de razón social, CUIT y domicilio en cada nueva solicitud o informe.
  - Numeración a mano de códigos de ensayo y órdenes de trabajo según el día del calendario.
  - Cálculo manual de promedios y reclasificación (`E1`/`E2`) antes de volcarlos al documento Word.
  - Redacción repetitiva de correos electrónicos avisando al cliente si su muestra llegó o si su informe está listo.
- **Información que se pierde o fragmenta:**
  - Falta de un historial unificado de contactos adicionales, representantes legales y cambios de domicilio de un cliente a lo largo del tiempo (carencia de una vista CRM consolidada por cliente).
  - Ausencia de vínculo directo entre la versión de los datos del cliente al momento de solicitar el ensayo y modificaciones posteriores de su empresa (riesgo de alterar documentos históricos retrospectivamente).
  - Pérdida de trazabilidad sobre qué usuario interno aprobó un presupuesto, modificó una muestra o reemitió un informe conforme al SGC.
- **Errores frecuentes que se cometen:**
  - Códigos diarios duplicados o salteados cuando dos operadores generan actas el mismo día.
  - Inconsistencias y demoras al transcribir manualmente razón social, CUIT o distritos de las empresas solicitantes.
  - Errores de tipeo en resultados numéricos o emisión prematura de un informe sin completar el mínimo de muestras analizadas.
  - Desactualización accidental de la plantilla oficial del formulario institucional.
- **Tareas que llevan mucho tiempo:**
  - Búsqueda de antecedentes de un mismo cliente o lote ensayado meses atrás entre decenas de carpetas locales.
  - Maquetado y exportación manual a PDF de formularios con encabezado legal, firmas, notas al pie y tabla de elementos.
  - Compilación manual de estadísticas trimestrales o anuales de ensayos completados, cancelados o en curso.
- **Controles e informes que no pueden realizarse:**
  - No se puede garantizar granularmente qué empleado de laboratorio tiene permiso para crear clientes, cargar resultados, emitir informes o cambiar variables institucionales (`UNCERTAINTY`, autoridades, CBU).
  - No es posible detectar criptográficamente si un informe PDF o un registro de resultados fue alterado después de su emisión.
  - No se pueden obtener exportaciones inmediatas filtradas por fecha (zona horaria Argentina), cliente o estado.
- **Qué sucedería si la organización creciera:**
  - Con un aumento en la demanda de fábricas de muebles y exportadores, la gestión manual colapsaría por cuellos de botella en recepción y transcripción, multiplicarían las colisiones de códigos diarios, crecerían las demoras de respuesta comercial en la atención al cliente y se volvería inviable cumplir auditorías de calidad e integridad documental del SGC.
- **Por qué es necesario un sistema informático:**
  - Es indispensable contar con una plataforma web única que **sistematice los procedimientos del Sistema de Gestión de Calidad (SGC) vinculados a la relación con el cliente (CRM) y al análisis de laboratorio**: centralizando la base de datos relacional en un servidor administrado para asistir y automatizar reglas de negocio y máquinas de estado del SGC (`PC13`, `PC15`, `PC16`, `PC18`), llevar el vínculo comercial y técnico integral con cada cliente (CRM), generar códigos diarios de manera atómica sin colisiones, emitir documentos PDF estandarizados bajo demanda con respaldo criptográfico, ofrecer trazabilidad total por usuario y fecha, y disponer opcionalmente de un servicio auxiliar de autocompletado de datos de clientes.

---



## 3. Documento de Alcance Preliminar del Sistema (Entregable 7)

El alcance del sistema abarca la **sistematización de los procedimientos del Sistema de Gestión de Calidad (SGC)** del Laboratorio CTM vinculados al **vínculo con el cliente** y al **análisis de laboratorio**. En términos operativos, la plataforma cumple una doble función integrada:

1. **Asistencia y automatización de procesos del Sistema de Gestión de Calidad (SGC):** Digitaliza, guía y automatiza los flujos normativos (`PC13`, `PC15`, `PC16`, `PC18`), desde el registro de solicitudes y revisión de capacidad hasta la recepción de muestras, ejecución analítica en laboratorio, emisión de informes oficiales y custodia inmutable de registros.
2. **Gestión de la Relación con el Cliente (CRM):** Centraliza la agenda compartida de empresas solicitantes, sus domicilios, representantes legales y contactos, el historial completo de interacciones/ensayos por cliente, el ciclo de presupuestación y acuerdos contractuales, las notificaciones automáticas de estado y el acceso autogestionado al portal de resultados.



### 3.1. Qué Permite Realizar el Sistema

- **Gestionar la relación con el cliente (CRM):** Centralizar fichas de empresas, domicilios, representantes legales y contactos vinculados; consultar el historial completo de solicitudes, contratos y ensayos por cliente; administrar acuerdos comerciales/presupuestos y automatizar notificaciones de seguimiento de extremo a extremo.
- **Asistir y automatizar procesos del SGC y análisis de laboratorio:** Ejecutar con validaciones automáticas y trazabilidad cada etapa de los procedimientos de calidad (`PC13`, `PC15`, `PC16`, `PC18`), asegurando codificación atómica, control de estado de muestras, cálculos analíticos de laboratorio y resguardo documental auditable.
- **Registrar:** Usuarios (`CLIENT` y miembros `LABORATORY`), empresas/clientes/personas (con carga manual autónoma sin depender de servicios externos, o mediante autocompletado auxiliar opcional de Padrón A13 de ARCA si se habilita), solicitudes de ensayo (`F-PC13-02`) con elementos y plantillas reutilizables, recepciones de muestras, órdenes de trabajo (`F-PC13-03`) y resultados analíticos.
- **Modificar:** Perfiles propios y datos de usuarios de laboratorio, fichas de clientes/contactos, condiciones comerciales/términos del ensayo, cliente asociado a un ensayo, parámetros institucionales (`/env`) y reemisión controlada de informes (`MODIFICATION`).
- **Eliminar / Desactivar (baja lógica o revocación):** Eliminación controlada de elementos/variables no protegidas (`hardcoded = false`), cancelación/rechazo trazado de ensayos, desvinculación de contactos, revocación de sesiones activas, dispositivos de confianza y API keys.
- **Buscar y Consultar:** Búsqueda filtrada de ensayos por estado, cliente y rango de fechas (Argentina), agenda compartida de clientes del laboratorio (CRM), búsqueda segura de personas/empresas, consulta de catálogos (`/types`) y detalle de órdenes/muestras.
- **Generar informes y documentos:** Emisión automática bajo demanda (*on-the-fly*) de PDFs oficiales del SGC (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`) y generación de reportes tabulares descargables en **CSV** y **XLSX**.
- **Controlar:** Autenticación con cookies `HttpOnly`, verificación de email, 2FA (TOTP/Email), CSRF, idempotencia, rate limiting, permisos granulares de laboratorio, máquina de estados obligatoria del SGC y verificación criptográfica de integridad (`RSA-SHA256` + OpenTimestamps).



### 3.2. Módulos del Sistema a Desarrollar

1. **Módulo de Seguridad, Usuarios, Sesiones y Permisos:** Registro, login, cookies/CSRF, verificación de email, recuperación de clave, 2FA, sesiones activas, gestión de equipo de laboratorio con roles/permisos y API keys cifradas.
2. **Módulo CRM de Empresas, Clientes, Personas y Autocompletado Auxiliar ARCA (Opcional):** Gestión integral de la relación con el cliente mediante carga manual completa de empresas, domicilios, contactos y agenda compartida del laboratorio, trazabilidad de historial por empresa y servicio auxiliar opcional de autocompletado vía Padrón A13 de ARCA (no necesario activarlo; habilitable mediante `ARCA_CUIT` y certificado/clave `ARCA_*`).
3. **Módulo SGC de Solicitudes, Presupuestos y Plantillas (**`F-PC13-02`**):** Sistematización de solicitudes y acuerdos contractuales con el cliente: creación/cancelación de ensayos, snapshots de cliente, plantillas de elementos y productos, presupuestación y aceptación de términos.
4. **Módulo SGC de Recepción, Órdenes de Trabajo y Análisis de Laboratorio (**`F-PC13-03`**):** Asistencia y automatización de la fase técnica: códigos diarios atómicos, recepción de probetas, transición de OT y carga de mediciones/promedios de laboratorio.
5. **Módulo SGC de Documentos PDF, Notificaciones CRM, Exportación y Auditoría (**`F-PC13-01`**):** Renderizado Handlebars/Puppeteer + R2 de informes oficiales, emails transaccionales Resend para seguimiento al cliente, exportador CSV/XLSX, snapshots firmados y auditoría de seguridad.
6. **Módulo de Configuración Dinámica y Catálogos del SGC:** Variables institucionales/analíticas (`/env`), catálogos geográficos y tipos de ensayo (`/types`).

---



## 4. Diagramas de Flujo de los Procesos Actuales Sin Sistema — AS-IS (Entregable 8)

> Cada diagrama representa la operatoria **manual previa al sistema**, identificando explícitamente **Inicio**, **Actividades**, **Decisiones** y **Documentos**.



### 4.1. Diagrama AS-IS 1 — Alta y Registro Manual de Cliente

```mermaid
flowchart TD
    I1(["INICIO"]) --> A1["Actividad: Cliente solicita ensayo por correo o teléfono"]
    A1 --> A2["Actividad: Administrativo solicita CUIT, domicilio y contacto por email"]
    A2 --> D1{"¿El cliente envió toda la<br/>documentación fiscal?"}
    D1 -- "NO" --> A3["Actividad: Reclamar datos faltantes por teléfono/mail"]
    A3 --> D1
    D1 -- "SÍ" --> A4["Actividad: Ingresar manualmente al portal web de AFIP/ARCA para verificar CUIT"]
    A4 --> DOC1[/"Documento: Ficha manual en planilla Excel 'Clientes_CTM.xlsx'"/]
    DOC1 --> A5["Actividad: Transcribir razón social, dirección, representante y contacto"]
    A5 --> F1(["FIN"])
```



### 4.2. Diagrama AS-IS 2 — Solicitud de Ensayo y Presupuestación Manual (`F-PC13-02`)

```mermaid
flowchart TD
    I2(["INICIO"]) --> DOC2A[/"Documento: Planilla Word 'F-PC13-02' completada manualmente por cliente o recepción"/]
    DOC2A --> A21["Actividad: Asignar manualmente código correlativo del día mirando el cuaderno/Excel"]
    A21 --> D21{"¿Hay dudas si otro compañero<br/>ya usó ese número hoy?"}
    D21 -- "SÍ" --> A22["Actividad: Consultar verbalmente al equipo para evitar código duplicado"]
    A22 --> D21
    D21 -- "NO" --> A23["Actividad: Calcular costo y plazo estimado en planilla de costos"]
    A23 --> DOC2B[/"Documento: Presupuesto enviado por correo electrónico al cliente"/]
    DOC2B --> D22{"¿El cliente acepta presupuesto<br/>y condiciones por mail?"}
    D22 -- "NO" --> A24["Actividad: Archivar carpeta como rechazada/sin respuesta"]
    A24 --> F2(["FIN"])
    D22 -- "SÍ" --> A25["Actividad: Imprimir/guardar PDF manual y avisar a Laboratorio para esperar muestras"]
    A25 --> F2
```



### 4.3. Diagrama AS-IS 3 — Recepción de Muestras y Orden de Trabajo Manual (`F-PC13-03`)

```mermaid
flowchart TD
    I3(["INICIO"]) --> A31["Actividad: Recibir paquete físico de probetas en el laboratorio"]
    A31 --> A32["Actividad: Buscar por correo o carpeta a qué solicitud F-PC13-02 corresponde"]
    A32 --> D31{"¿Llegan todas las muestras<br/>en condiciones aptas?"}
    D31 -- "NO" --> A33["Actividad: Registrar observación en papel y llamar al solicitante"]
    A33 --> D31
    D31 -- "SÍ" --> A34["Actividad: Etiquetar físicamente con marcador/cinta e inventar código interno de OT"]
    A34 --> DOC3[/"Documento: Redactar manualmente Orden de Trabajo 'F-PC13-03' en Word/papel"/]
    DOC3 --> A35["Actividad: Entregar copia física al técnico ensayista en mesa de trabajo"]
    A35 --> F3(["FIN"])
```



### 4.4. Diagrama AS-IS 4 — Medición y Emisión Manual de Informe (`F-PC13-01`)

```mermaid
flowchart TD
    I4(["INICIO"]) --> A41["Actividad: Técnico realiza ensayo físico/químico sobre cada muestra"]
    A41 --> DOC4A[/"Documento: Planilla borrador en papel o Excel con lecturas crudas"/]
    DOC4A --> A42["Actividad: Calcular promedios manualmente y verificar clasificación E1 / E2"]
    A42 --> D41{"¿Están completas al menos 2 muestras<br/>con resultados válidos?"}
    D41 -- "NO" --> A43["Actividad: Reensayar muestra faltante o esperar nueva probeta"]
    A43 --> D41
    D41 -- "SÍ" --> A44["Actividad: Copiar y pegar datos del cliente y promedios en Word 'F-PC13-01'"]
    A44 --> DOC4B[/"Documento: Archivo Word/PDF exportado localmente sin firma criptográfica ni hash"/]
    DOC4B --> A45["Actividad: Enviar informe manualmente por correo electrónico al cliente"]
    A45 --> F4(["FIN"])
```

---

# Módulo II — Jerarquía de Procesos y Estructura de Datos

> Objetivo, alcance real, usuarios/roles, cascada operativa, requerimientos RF/RNF, reglas de negocio, diagramas TO-BE, casos de uso y clasificación de datos.

<!-- Fuente: docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md -->

# Módulo II — Objetivo, Alcance Real, Usuarios y Jerarquía de Procesos

> **Correspondencia con lineamientos (**`Módulo II.pdf`**):** Cubre **Organización de actividades del Módulo II**, **Validación del Módulo I**, **Objetivo del sistema**, **Alcance real del sistema**, **Identificación de usuarios y roles**, **Jerarquía de procesos (base, operativos y de control)** y **Cascada operativa de procesos**.

---

## 1. Organización de Actividades del Módulo II y Validación del Módulo I

### 1.1. Responsables y Revisión del Módulo II


| Responsabilidad funcional                   | Alcance asignado                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsables de documentación funcional** | Especificación numerada de Requerimientos Funcionales (`RF01`–`RF36`), No Funcionales (`RNF01`–`RNF18`) y Reglas de Negocio (`RN01`–`RN22`).                  |
| **Responsables de procesos**                | Definición de jerarquía de procesos (base, operativos y de control), dependencias obligatorias y cascada operativa.                                           |
| **Responsables de estructura de datos**     | Identificación de entidades iniciales, atributos principales, relaciones y clasificación de datos por proceso (`03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md`). |
| **Responsables de diagramación**            | Elaboración de diagramas de flujo TO-BE y casos de uso principales (`CU01`–`CU12`).                                                                           |
| **Cronograma y revisión grupal**            | Revisión cruzada entre análisis funcional y base técnica antes de congelar el análisis funcional hacia el Módulo III.                                         |




### 1.2. Validación de Consistencia con el Módulo I

Antes de avanzar al diseño detallado, se verificó la alineación estricta con el Módulo I:

- La **problemática detectada** (colisiones de códigos, carga manual en Word/Excel, falta de trazabilidad e integridad documental) coincide directamente con los objetivos funcionales definidos.
- Los **procesos P01–P09 y eventos disparadores** del Módulo I quedan respetados y encadenados en la jerarquía de procesos.
- Ningún requerimiento ni caso de uso del Módulo II contradice el alcance aprobado ni los formularios institucionales (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`).

---



## 2. Objetivo del Sistema

El sistema `gestion.ctmueble.com.ar` tiene como objetivo transformar la operatoria integral del laboratorio de ensayos del **Centro Tecnológico del Mueble (CTM)** mediante una plataforma web unificada que:

- **Problema que resuelve:** Elimina la gestión manual fragmentada (Excel, Word, correos sueltos y numeración manual) que generaba duplicaciones, demoras, pérdida de contexto y ausencia de garantías de integridad documental.
- **Tareas que mejora:** Facilita el alta de clientes (con carga manual directa o mediante un sistema auxiliar opcional de autocompletado vía ARCA/AFIP cuya activación no es necesaria), la solicitud de ensayos (`F-PC13-02`), la asignación atómica de códigos diarios, el control de órdenes de trabajo (`F-PC13-03`), la carga de mediciones y la generación on-the-fly de informes (`F-PC13-01`).
- **Controles que permite:** Garantiza autenticación con cookies `HttpOnly`, 2FA, control de acceso basado en roles y permisos granulares (`RBAC`), transiciones válidas de estado, prevención de duplicados por idempotencia, y detección de alteraciones (*tampering*) mediante snapshots firmados con `RSA-SHA256` y OpenTimestamps.
- **Información que ordena:** Centraliza clientes, empresas, domicilios, contactos, solicitudes, términos contractuales, muestras, órdenes de trabajo, plantillas reutilizables, parámetros del sistema (`/env`) y logs de auditoría en PostgreSQL (34 tablas).
- **Beneficios que genera:** Reduce tiempos de respuesta comercial y técnica, evita colisiones de numeración bajo concurrencia, brinda trazabilidad completa por usuario/dispositivo/fecha y eleva el respaldo probatorio de los certificados e informes emitidos.

---



## 3. Alcance Real del Sistema

Considerando los recursos disponibles, el equipo de desarrollo y la criticidad operativa del CTM, se delimitó exactamente qué abarca el sistema y qué queda fuera de alcance:

### 3.1. El Sistema Permitirá

- **Registrar:** Usuarios (`CLIENT` y miembros `LABORATORY`), empresas (carga manual autónoma o con autocompletado auxiliar opcional de datos desde Padrón A13 de ARCA, sin requerir su activación), domicilios, personas, clientes, contactos, solicitudes de ensayo (`F-PC13-02`), plantillas de elementos, recepciones/órdenes de trabajo (`F-PC13-03`), muestras, resultados numéricos y variables dinámicas.
- **Modificar:** Perfil de usuario y preferencias 2FA, contraseña (vía verificación/reseteo), roles y permisos de miembros del laboratorio, datos de clientes/personas, cliente asociado a un ensayo, términos de servicio/presupuesto, parámetros `/env` y reemisión de informes (`MODIFICATION`).
- **Eliminar / Revocar:** Eliminación de variables operativas no protegidas (`hardcoded = false`), plantillas y elementos editables; revocación de sesiones activas, dispositivos de confianza y API keys; cancelación o rechazo auditado de solicitudes de ensayo.
- **Buscar y Consultar:** Consulta filtrada de ensayos por estado, cliente y rango horario de Argentina, agenda compartida de clientes de laboratorio, búsqueda segura de personas y autocompletado auxiliar de datos de empresas desde ARCA (si se encuentra habilitado con `ARCA_CUIT` y certificado/clave `ARCA_`*), consulta de órdenes de trabajo, muestras, historial de auditoría y catálogos `/types`.
- **Generar reportes y documentos:** Renderizado PDF bajo demanda (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`), snapshots criptográficos verificables (`RSA-SHA256` + `.ots`) y exportación de datos tabulares en **CSV** y **XLSX**.
- **Controlar y Gestionar:** Flujo estricto de estados de ensayo, orden y muestra; notificaciones por correo electrónico con desuscripción; rate limiting distribuido; idempotencia en mutaciones críticas; y trazabilidad inmutable de seguridad.



### 3.2. El Sistema NO Incluirá (Exclusiones de Alcance)

- **Emisión de comprobantes electrónicos fiscales AFIP (WSFEv1 / Factura Electrónica) ni validación impositiva obligatoria:** La integración con ARCA (WSAA + Padrón A13) cumple únicamente el rol de **sistema auxiliar opcional para autocompletar datos básicos de clientes/empresas** a partir del CUIT (razón social y domicilio); **no es necesaria su activación** para operar la plataforma ni emite facturas electrónicas.
- **Gestión de inventario físico de reactivos, compras a proveedores ni liquidación de sueldos:** Quedan fuera del dominio de ensayos técnicos y certificación.
- **Integración directa automática vía hardware/PLC con máquinas de ensayo:** La carga de mediciones en laboratorio es asistida mediante formularios digitales con cálculo y validación de promedios, no por telemetría industrial directa.
- **Modificación retroactiva de informes emitidos sin versión nueva:** Por integridad normativa, todo ajuste posterior a la emisión exige una nueva versión (`MODIFICATION`) y un nuevo snapshot firmado, nunca sobrescritura silenciosa.
- **Modificación del esquema y versionado de los formularios del Sistema de Gestión de Calidad**

---



## 4. Identificación de Usuarios y Roles del Sistema

El sistema implementa segregación estricta de perfiles (`users.user_type`: `CLIENT` vs `LABORATORY`) y roles internos de laboratorio (`roles`: `ADMIN`, `USER`, `CONSULTA`) combinados con permisos granulares (`laboratory_permissions`).


| Rol / Perfil                   | Función principal                                                      | Operaciones permitidas                                                                                                                                                                                                                                                                                                                                                      | Información que consulta                                                                                                                                                          | Nivel de acceso                                                              |
| ------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `LABORATORY` **—** `ADMIN`     | Dirección técnica, administración del sistema y gobierno de seguridad. | Todas las operaciones de gestión operativa + crear/editar/activar/desactivar usuarios de laboratorio, asignar roles y permisos, gestionar API Keys (`/api-keys`), editar variables institucionales (`/env`) y emitir/modificar informes.                                                                                                                                    | Toda la información del laboratorio: usuarios, permisos, auditorías de seguridad (`security_audit_logs`), ensayos de todos los clientes, órdenes, snapshots y métricas.           | **Total (Administración y Operación Completa)**                              |
| `LABORATORY` **—** `USER`      | Operadores administrativos, recepción y técnicos ensayistas.           | Operar según permisos granulares asignados: alta/edición/agenda de clientes y personas (con autocompletado auxiliar opcional de ARCA si está habilitado), gestión de ensayos (`essays.`*), recepción de muestras (`muestras.recibir`), gestión de órdenes (`ordenes.*`), carga de resultados (`muestras.resultados`), emisión PDF y exportación CSV/XLSX (`essays.export`). | Clientes propios/agendados, ensayos asignados o generales del laboratorio, órdenes de trabajo, muestras, plantillas y documentos PDF.                                             | **Medio / Operativo (Carga, Recepción, Ejecución y Emisión según permisos)** |
| `LABORATORY` **—** `CONSULTA`  | Supervisión, control de calidad y auditoría interna de solo lectura.   | Únicamente operaciones de consulta y lectura habilitadas (visualizar ensayos, órdenes de trabajo, muestras, documentos y exportar/leer reportes si se le otorga permiso de lectura). Bloqueado por RBAC para mutaciones críticas.                                                                                                                                           | Listados de ensayos, historial de auditoría (`essay_audit_logs`, `work_order_audit_logs`), detalles de clientes y órdenes sin capacidad de alteración.                            | **Solo Lectura (Auditoría / Supervisión)**                                   |
| `CLIENT` **(Cliente Externo)** | Solicitante de servicios de ensayo (empresa o particular autenticado). | Registrar y verificar su cuenta, gestionar 2FA/sesiones, crear sus propios perfiles de cliente/empresa/personas, crear y cancelar sus solicitudes de ensayo (`F-PC13-02`), aceptar/rechazar presupuestos, actualizar preferencias de notificación y descargar sus PDFs (`F-PC13-02` / `F-PC13-01`).                                                                         | Exclusivamente sus propias empresas/clientes, personas creadas por su usuario, sus propios ensayos y resultados finales permitidos (aislamiento estricto multi-tenant anti-IDOR). | **Restringido al Propio Tenant (**`req.user.id`**)**                         |


---



## 5. Jerarquía de Procesos del Sistema y Cascada Operativa

En `gestion.ctmueble.com.ar`, las operaciones no pueden ejecutarse en orden arbitrario: existen dependencias estrictas validadas por las capas de Aplicación y Dominio.

### 5.1. Clasificación Jerárquica de Procesos



#### A. Procesos Base (Indispensables para comenzar a operar)

1. **PB-01:** Carga de catálogos de sistema (`types_countries`, `types_districts`, `types_documents`, `types_essays`) y variables institucionales (`/env`).
2. **PB-02:** Registro o alta de usuario (`CLIENT` o invitación `LABORATORY`) con verificación de correo electrónico y habilitación de perfil/permisos.
3. **PB-03:** Registro de empresa (`bussiness`) mediante alta manual (por defecto, sin requerir ARCA) o asistida con el servicio auxiliar opcional de autocompletado del Padrón A13 de ARCA (habilitable mediante `ARCA_CUIT` y certificado/clave `ARCA_`*), domicilio normalizado (`bussiness_address`) y personas (`persons` representante y contactos).
4. **PB-04:** Alta y vinculación del **Cliente** (`clients` + `clients_contacts`) y opcionalmente creación de plantillas de elementos de ensayo (`essay_element_templates`).



#### B. Procesos Operativos (Dependen de los procesos base)

1. **PO-01:** Creación de solicitud de ensayo `F-PC13-02` (`essays` + `essays_elements` + snapshot `essays_client`), con código diario atómico. *Regla: no puede crearse un ensayo sin cliente válido y al menos un elemento.*
2. **PO-02:** Revisión y carga de presupuesto/condiciones (`essays_terms`), cambiando estado a `PENDING_ACCEPTANCE` y notificando por email al cliente.
3. **PO-03:** Respuesta del cliente (**Aceptación** o Rechazo de condiciones → estado `WAITING_FOR_SAMPLES`). *Regla: no pueden recibirse muestras si el ensayo no fue aceptado.*
4. **PO-04:** Recepción unificada de muestras y generación de Orden de Trabajo `F-PC13-03` (`work_orders` + `samples`). *Regla: requiere ensayo aceptado y código diario atómico.*
5. **PO-05:** Ejecución técnica y carga de resultados por muestra (`Sample.setResult`, cálculo de `average_value`). *Regla: no puede emitirse informe si hay menos de 2 muestras con resultados.*
6. **PO-06:** Emisión (o rectificación `MODIFICATION`) de Informe de Resultados `F-PC13-01`, generando snapshot criptográfico firmado (`essay_document_snapshots`) y notificación de informe listo.



#### C. Procesos de Control (Se apoyan en los datos generados y protegen la integridad)

1. **PC-01:** Generación bajo demanda y almacenamiento seguro (local / Cloudflare R2) de documentos PDF oficiales (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`).
2. **PC-02:** Exportación operativa y gerencial de ensayos/métricas/muestras a formatos **CSV / XLSX**.
3. **PC-03:** Verificación pública/interna de integridad criptográfica de informes (`RSA-SHA256` + comprobante binario OpenTimestamps `.ots`).
4. **PC-04:** Trazabilidad completa mediante auditorías de negocio (`essay_audit_logs`, `work_order_audit_logs`) y auditoría de seguridad append-only (`security_audit_logs`) + gestión de sesiones/2FA.

---



### 5.2. Diagrama de Cascada Operativa de Procesos

```mermaid
flowchart TD
    subgraph SGB["A. Procesos Base (Indispensables)"]
        PB1["PB-01: Catálogos (/types) y Variables Institucionales (/env)"]
        PB2["PB-02: Alta de Usuario + Verificación Email + Rol y Permisos"]
        PB3["PB-03 / PB-04: Alta de Empresa (Manual o Autocompletado Opcional ARCA A13)<br/>+ Personas + Cliente habilitado"]
        PB1 --> PB2 --> PB3
    end

    subgraph SGO["B. Procesos Operativos (Dependen de Base)"]
        PO1["PO-01: Solicitud de Ensayo F-PC13-02<br/>Estado: CREATED · Snapshot Cliente · Código Diario"]
        PO2["PO-02: Evaluación Técnica (VERIFYING) y<br/>Fijación de Presupuesto/Plazo (PENDING_ACCEPTANCE)"]
        PO3["PO-03: Respuesta del Cliente<br/>Aceptado (WAITING_FOR_SAMPLES) vs Rechazado / Expirado / Cancelado"]
        PO4["PO-04: Recepción de Muestras +<br/>Generación Orden de Trabajo F-PC13-03 (IN_ANALYSIS)"]
        PO5["PO-05: Medición en Laboratorio +<br/>Carga de Resultados y Promedio por Muestra (RESULTS_LOADED)"]
        PO6["PO-06: Emisión Informe F-PC13-01<br/>COMPLETED · Mín. 2 muestras · Snapshot RSA-SHA256 + OTS"]
        PO1 --> PO2 --> PO3 --> PO4 --> PO5 --> PO6
    end

    subgraph SGC["C. Procesos de Control y Evidencia"]
        PC1["PC-01: Descarga de PDFs On-The-Fly y resguardo en R2"]
        PC2["PC-02: Reportes Consolidados CSV / XLSX"]
        PC3["PC-03 / PC-04: Verificación de Integridad + Auditoría de Seguridad y Trazabilidad"]
    end

    PB3 --> PO1
    PO6 --> PC1
    PO6 --> PC2
    PO6 --> PC3
```

---

<!-- Fuente: docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md -->

# Módulo II — Requerimientos Funcionales/No Funcionales, Reglas de Negocio, Diagramas TO-BE y Casos de Uso

> **Correspondencia con lineamientos (`Módulo II.pdf`):** Cubre **Requerimientos funcionales numerados**, **Requerimientos no funcionales**, **Reglas de negocio**, **Procesos futuros informatizados (diagramas de flujo TO-BE)**, **Casos de uso principales**, **Priorización funcional** y **Validación del análisis — Módulo II**.

---

## 1. Requerimientos Funcionales (`RF01` – `RF36`)

### 1.1. Seguridad, Usuarios, Autenticación y Sesiones
- **`RF01` Registrar y verificar usuario cliente:** El sistema debe permitir el registro de nuevos usuarios `CLIENT` con email único, contraseña segura, verificación mediante OTP/enlace temporal y rechazo anti-enumeración ante emails ya existentes.
- **`RF02` Autenticar usuarios y gestionar sesión por cookies `HttpOnly`:** El sistema debe autenticar credenciales, emitir Access/Refresh tokens en cookies `HttpOnly` (`ctm_at`, `ctm_rt`) junto con cookie CSRF (`ctm_csrf`) y permitir renovación y cierre de sesión con revocación inmediata.
- **`RF03` Gestionar doble factor de autenticación (2FA):** El usuario debe poder habilitar/deshabilitar 2FA mediante TOTP (app autenticadora con QR) o OTP por Email, generar/usar códigos de recuperación y administrar dispositivos de confianza (`trusted devices`).
- **`RF04` Recuperar contraseña:** El usuario debe poder solicitar restablecimiento de clave mediante OTP de 6 dígitos o enlace seguro, revocando automáticamente sesiones y dispositivos confiables al cambiarla.
- **`RF05` Administrar usuarios de laboratorio y permisos granulares:** Un administrador (`ADMIN`) debe poder invitar usuarios `LABORATORY`, definir su rol (`ADMIN`, `USER`, `CONSULTA`), personalizar su matriz de permisos granulares, activar/desactivar cuentas y reenviar invitaciones.
- **`RF06` Administrar API Keys del sistema:** El laboratorio con privilegios debe poder crear, consultar estado y revocar credenciales cifradas (`system_api_keys`) mediante AES-256-GCM / KMS Envelope.

### 1.2. Empresas, Clientes, Personas y Autocompletado Auxiliar Opcional (ARCA/AFIP)
- **`RF07` Autocompletar opcionalmente datos de clientes vía Padrón A13 de ARCA/AFIP:** Cuando la integración auxiliar está habilitada mediante `ARCA_CUIT` y certificados X.509 (`ARCA_CERT_*` / `ARCA_KEY_*`), el sistema debe autenticarse vía WSAA (`LoginCms`) y consultar razón social y domicilios de un CUIT para prellenar datos del cliente. Su activación **no es obligatoria** para el funcionamiento de la plataforma.
- **`RF08` Registrar y actualizar empresas (con autonomía manual):** Permitir el alta manual completa (`createBusinessManually`) en todo momento sin depender de ARCA, y la sincronización opcional desde padrón (`syncBusinessByCuit`) cuando el servicio auxiliar se encuentre activo, normalizando localidades y distritos (`types_districts`).
- **`RF09` Gestionar personas (representantes y contactos):** Permitir crear, editar y buscar personas con validación de formato de email, teléfono, código de país y DNI/CUIT único.
- **`RF10` Gestionar clientes y contactos adicionales:** Permitir crear, consultar, modificar y listar clientes asociando empresa, domicilio, representante legal, contacto principal, datos opcionales de facturación e IVA y contactos adicionales.
- **`RF11` Agendar clientes compartidos de laboratorio:** El personal de laboratorio debe poder agendar clientes (incluso originados desde un snapshot `essays_client`) y verificar si un cliente/CUIT ya se encuentra agendado para todo el equipo del laboratorio.

### 1.3. Solicitudes de Ensayo (`F-PC13-02`), Términos y Plantillas
- **`RF12` Crear solicitud de ensayo (`F-PC13-02`):** Permitir al cliente o al laboratorio iniciar un ensayo especificando cliente, contacto, tipo de ensayo, muestras estimadas, elementos con características técnicas y preferencias de notificación.
- **`RF13` Generar código correlativo diario atómico:** El sistema debe asignar automáticamente códigos diarios únicos por fecha Argentina tanto para ensayos como para órdenes de trabajo, evitando colisiones concurrentes.
- **`RF14` Guardar snapshot de cliente en el ensayo:** Al crear un ensayo se debe congelar en `essays_client` los datos vigentes de la empresa, domicilio, representante y contacto, permitiendo actualizar explícitamente ese vínculo mediante `PUT /essays/:id/client`.
- **`RF15` Administrar plantillas de elementos:** Usuarios autorizados deben poder guardar, listar y reutilizar plantillas estándar de productos/elementos para acelerar futuras solicitudes.
- **`RF16` Gestionar ciclo de vida y acciones del ensayo:** El sistema debe calcular dinámicamente las acciones permitidas según rol y estado (`/essays/procedure/actions`) y ejecutar transiciones válidas (revisión, fijación de presupuesto/términos, aceptación, rechazo, cancelación, expiración).
- **`RF17` Filtrar y consultar ensayos:** Permitir listar y buscar ensayos con filtros por fecha desde/hasta (zona `America/Argentina/Buenos_Aires`), estado, cliente y origen.

### 1.4. Recepción de Muestras, Órdenes de Trabajo (`F-PC13-03`) y Resultados
- **`RF18` Registrar recepción de muestras y crear Orden de Trabajo:** El laboratorio debe poder registrar el ingreso físico de muestras, crear la OT (`work_orders`) vinculada al ensayo y actualizar el estado de las muestras.
- **`RF19` Gestionar estado de Orden de Trabajo:** Permitir al laboratorio consultar órdenes pendientes/en curso, detallar muestras asociadas y actualizar estados válidos de la orden (`WorkOrderStatus`).
- **`RF20` Cargar resultados analíticos por muestra:** El laboratorio debe poder ingresar mediciones numéricas individuales por muestra, calcular/almacenar el `average_value` y registrar observaciones técnicas.

### 1.5. Informes (`F-PC13-01`), PDFs, Exportación, Notificaciones y Auditoría
- **`RF21` Emitir informe oficial (`F-PC13-01`) y emitir modificación (`MODIFICATION`):** Una vez cumplidos los requisitos analíticos (mínimo 2 muestras con resultado), el laboratorio debe poder emitir el informe original o generar una modificación fundamentada con clasificación técnica (`E1`/`E2`).
- **`RF22` Generar documentos PDF bajo demanda:** Permitir visualizar y descargar PDFs oficiales de Solicitud (`F-PC13-02`), Orden de Trabajo (`F-PC13-03`) e Informe de Resultados (`F-PC13-01`), almacenándolos o sirviéndolos desde almacenamiento local/R2.
- **`RF23` Capturar snapshot criptográfico y sellado temporal (OTS):** Al emitir o modificar un informe `F-PC13-01`, el sistema debe persistir un snapshot JSON canónico firmado con RSA-SHA256 y enviar su hash a calendarios OpenTimestamps.
- **`RF24` Verificar integridad de documentos emitidos:** Permitir validar que un informe/snapshot no haya sido alterado comparando firma RSA y estado de comprobante `.ots`.
- **`RF25` Exportar reportes en CSV y XLSX:** El laboratorio debe poder exportar listados filtrados de ensayos en formato `.csv` y `.xlsx` (libro de 3 hojas con resumen, métricas por estado y muestras).
- **`RF26` Enviar notificaciones por email y gestionar desuscripción:** Notificar automáticamente al cliente ante cambios de estado relevantes y alertar al laboratorio ante nuevas solicitudes, respetando el token público/seguro de desuscripción.
- **`RF27` Registrar auditoría de negocio y seguridad:** Todo cambio en ensayos (`essay_audit_logs`), órdenes (`work_order_audit_logs`) y eventos críticos de autenticación/permisos (`security_audit_logs`) debe quedar registrado con usuario, dispositivo e integridad.

### 1.6. Configuración y Catálogos
- **`RF28` Gestionar variables dinámicas (`/env`):** El laboratorio autorizado debe poder consultar, crear, editar variables institucionales/analíticas (`TEXT`, `NUMBER`, `DECIMAL`, `TIMESTAMP`) y eliminar solo variables no protegidas (`hardcoded = false`).
- **`RF29` Consultar catálogos del sistema (`/types`):** Exponer catálogos de países, distritos, tipos de documento y tipos de ensayo con opción de filtrar solo los habilitados.

*(Nota: Las capacidades `RF30`–`RF36` de soporte operativo incluyen verificación de salud `/health` y `/ready`, manejo idempotente de reintentos vía `Idempotency-Key`, bloqueo anti-fuerza bruta por Rate Limiter, aislamiento de perfil vía `switchProfile`, validación masiva de DTOs, desuscripción directa por enlace firmado y auditoría pública/interna de snapshots.)*

---

## 2. Requerimientos No Funcionales (`RNF01` – `RNF18`)

| Código | Categoría | Descripción del requerimiento |
| :--- | :--- | :--- |
| **`RNF01`** | **Seguridad de acceso** | Las contraseñas deben almacenarse exclusivamente con `bcrypt` (coste 12). En producción solo se aceptan cookies `HttpOnly` + `SameSite` + CSRF (`X-CSRF-Token`). |
| **`RNF02`** | **Prevención CSRF / CORS** | Mutaciones protegidas por validación Double-Submit CSRF (`ctm_csrf` vs `X-CSRF-Token`) y lista blanca estricta de orígenes (`CORS_ORIGINS`), con bloqueo de *Open Redirect*. |
| **`RNF03`** | **Aislamiento Multi-Tenant y Anti-IDOR** | Todo recurso perteneciente a un cliente valida propiedad (`req.user.id`) en repositorios y servicios; las pruebas de seguridad deben verificar bloqueo ante accesos cruzados. |
| **`RNF04`** | **Protección criptográfica de datos sensibles** | Las credenciales y secretos externos (`system_api_keys`) deben cifrarse con AES-256-GCM y opcionalmente AWS KMS Envelope, con soporte de rotación por versión. |
| **`RNF05`** | **Integridad e inmutabilidad probatoria** | Los informes `F-PC13-01` deben sellarse mediante `CanonicalJson` (RFC 8785), firma asimétrica RSA-SHA256 y OpenTimestamps; los logs `security_audit_logs` encadenan `record_hash` y firma. |
| **`RNF06`** | **Control de concurrencia y atomicidad** | Todas las mutaciones complejas se ejecutan dentro de transacciones ACID PostgreSQL (`withTransaction`), usando `daily_sequence_counters` / `pg_advisory_xact_lock` para códigos únicos. |
| **`RNF07`** | **Idempotencia ante reintentos** | Endpoints críticos soportan `Idempotency-Key` en Redis/RAM por usuario, devolviendo `409 IDEMPOTENCY_IN_PROGRESS` ante concurrencia simultánea y evitando cachear errores `4xx`/`5xx`. |
| **`RNF08`** | **Tolerancia a abuso y disponibilidad** | 10 limitadores de tasa específicos (`auth`, `login`, `passwordReset`, `emailVerification`, `twoFactor`, `padron` —para autocompletado opcional ARCA—, `pdfDownload`, `export`, etc.) protegidos detrás de Redis con fallback en memoria. |
| **`RNF09`** | **Rendimiento en generación PDF** | Motor Puppeteer/Chromium acotado mediante semáforo (`PDF_MAX_CONCURRENCY`, default 2) y timeouts de cola/render para prevenir OOM en entornos serverless. |
| **`RNF10`** | **Seguridad en renderizado y exportaciones** | Bloqueo de red saliente en Chromium durante renderizado HTML→PDF (anti-SSRF/LFI), escape de HTML (`escapeHtml`) y neutralización de fórmulas en CSV/XLSX (anti-CSV Injection). |
| **`RNF11`** | **Consistencia horaria** | Todas las fechas de filtrado operativo y códigos diarios utilizan la zona oficial `America/Argentina/Buenos_Aires` con cálculo mediante `luxon`. |
| **`RNF12`** | **Escalabilidad Serverless y DB Administrada** | Despliegue compatible con funciones serverless Vercel / AWS Lambda (`src/handler.js`) sobre Neon PostgreSQL con SSL y `serverless-http`. |
| **`RNF13`** | **Mantenibilidad y Arquitectura Limpia** | Código estructurado en capas DDD (`domain`, `application`, `infrastructure`, `presentation`, `shared`) con validación de dependencias en `ServiceRegistry`. |
| **`RNF14`** | **Trazabilidad y observabilidad** | Cada petición asigna `X-Request-Id`, registra acceso `HTTP_ACCESS` sanitizado y expone `/health` y `/ready` para monitoreo. |
| **`RNF15`** | **Estandarización de respuestas de error** | Todos los errores se normalizan a `{ code, message, details? }` ocultando trazas técnicas internas en producción. |
| **`RNF16`** | **Evolución controlada de base de datos** | Esquema versionado 100% mediante migraciones ordenadas en `umzug` (`npm run migrate:up`). |
| **`RNF17`** | **Cobertura de pruebas automatizadas** | Mantenimiento de suite nativa `node --test` cubriendo seguridad, contratos HTTP, validaciones DTO/dominio y criptografía. |
| **`RNF18`** | **Resiliencia ante fallos externos** | Respaldo en memoria cuando Redis no está configurado, fallback PostgreSQL en revocación JWT, operación autónoma sin depender de ARCA y cacheado de Tickets ARCA (TA) en dos niveles cuando está habilitado. |

---

## 3. Reglas de Negocio (`RN01` – `RN22`)

1. **`RN01` Código único diario:** Todo ensayo y orden de trabajo recibe un código correlativo único por fecha Argentina (`daily_sequence_counters` + sufijo alfabético `sequenceNumberToLetters`).
2. **`RN02` Prohibición de ensayo sin cliente ni elementos:** No puede registrarse una solicitud `F-PC13-02` sin especificar un cliente válido existente (o `isSelf`) y al menos un elemento de ensayo.
3. **`RN03` Validación fiscal de CUIT / DNI:** Todo CUIT ingresado en empresas o clientes debe cumplir el algoritmo verificador argentino de módulo 11; cuando un usuario opera `isSelf` con DNI, se convierte mediante `dniToValidCuit`.
4. **`RN04` Inmutabilidad histórica del cliente en el ensayo:** Al crear un ensayo se guarda un snapshot en `essays_client`. Cambios posteriores en la tabla maestra `clients` no alteran automáticamente los documentos emitidos de ensayos antiguos, salvo actualización explícita `PUT /essays/:id/client`.
5. **`RN05` Presupuesto obligatorio antes de aceptar:** El cliente solo puede aceptar o rechazar un ensayo cuando el laboratorio haya fijado condiciones comerciales (`essays_terms`) y el ensayo se encuentre en estado `PENDING_ACCEPTANCE`.
6. **`RN06` Prohibición de recibir muestras sin aceptación:** No se pueden registrar muestras recibidas ni generar una Orden de Trabajo si el ensayo no pasó previamente por la aceptación de condiciones (`WAITING_FOR_SAMPLES`).
7. **`RN07` Mínimo de muestras para emitir informe (`F-PC13-01`):** Para emitir el informe final de resultados se requiere un mínimo de **2 muestras con resultados analíticos cargados** (`emitReport` valida este umbral).
8. **`RN08` Cálculo automático de promedio analítico:** Al cargar las mediciones de cada muestra (`loadSampleResults`), el sistema computa automáticamente el `average_value` y lo persiste junto al estado resultante de la muestra.
9. **`RN09` Rectificación formal exclusiva (`MODIFICATION`):** Un informe ya emitido (`COMPLETED`) no se reescribe silenciosamente; cualquier corrección emite una versión `MODIFICATION` registrando el motivo y generando un nuevo snapshot versionado.
10. **`RN10` Protección de variables institucionales (`hardcoded`):** Las variables críticas en `/env` (`CUIT`, `SOCIAL_NAME`, `PRESIDENT`, `LAB_DIRECTOR`, `BANK_CBU`, etc.) pueden actualizarse por usuarios con permiso `configuracion.env`, pero nunca eliminarse (`400 ENV_HARDCODED`).
11. **`RN11` Rol y permisos granulares en laboratorio:** Un miembro de laboratorio con estado inactivo (`active = false`) queda bloqueado inmediatamente; un usuario `CONSULTA` solo accede a lecturas permitidas y las operaciones sensibles exigen el permiso explícito en `laboratory_permissions`.
12. **`RN12` Prohibición de auto-eliminación o escalada en laboratorio:** Ningún usuario puede auto-asignarse rol `LABORATORY` vía endpoints de cliente (`switchProfile` restringido) ni deshabilitar controles de seguridad propios sin autenticación vigente.
13. **`RN13` Agenda de clientes compartida en el laboratorio:** Todos los usuarios activos del laboratorio comparten la visibilidad de la agenda de clientes agendados (`/clients/scheduled`), incluyendo clientes agendados desde `essays_client`.
14. **`RN14` Vigencia de códigos OTP y enlaces de seguridad:** Los códigos OTP de verificación de email y recuperación de contraseña expiran a los **15 minutos** y bloquean tras **5 intentos fallidos** (`email_verifications` / `password_resets`).
15. **`RN15` Política de contraseñas de invitación:** La contraseña definida por un miembro invitado del laboratorio al activar su cuenta debe tener entre **12 y 64 caracteres**.
16. **`RN16` Revocación automática al restablecer contraseña:** Al completar un cambio/reseteo de contraseña exitoso se revocan automáticamente todas las sesiones activas y dispositivos de confianza del usuario.
17. **`RN17` Límite de concurrencia de PDF y aislamiento de red:** Durante la generación de HTML→PDF en Chromium se bloquean solicitudes externas de red; nunca pueden ejecutarse más de `PDF_MAX_CONCURRENCY` renderizados simultáneos.
18. **`RN18` Llamadas auxiliares ARCA fuera de transacción DB (cuando está habilitado):** Si se activa el autocompletado opcional con ARCA (`ARCA_CUIT` + certificados X.509), las consultas SOAP hacia WSAA y Padrón A13 se ejecutan **antes** de abrir transacciones PostgreSQL; si no está activado, el flujo manual opera de inmediato sin llamadas externas.
19. **`RN19` Mapeo de distrito al autocompletar desde ARCA:** Toda dirección devuelta por el autocompletado auxiliar del Padrón A13 normaliza su código numérico de provincia contra `types_districts.numeric_id`.
20. **`RN20` Preferencias de notificación del cliente:** El cliente puede deshabilitar alertas por email sin perder acceso a consultar el estado dentro de la plataforma; la desuscripción por link verifica firma/token válido.
21. **`RN21` Solo respuestas exitosas en caché de idempotencia:** Si una operación con `Idempotency-Key` falla (`4xx` o `5xx`), la clave no queda cacheada como éxito y permite reintento limpio.
22. **`RN22` Tamaño máximo de payload:** Toda petición JSON estándar está acotada a 100 KB para proteger la estabilidad del servidor.

---

## 4. Procesos Futuros Informatizados — Diagramas de Flujo TO-BE

> Cada diagrama muestra el flujo **informatizado con el sistema actual**, indicando **Inicio**, **Actividades**, **Validaciones automáticas**, **Decisiones**, **Documentos/Evidencias** y **Fin**.

### 4.1. Diagrama TO-BE 1 — Alta de Cliente (Manual o con Autocompletado Auxiliar Opcional de ARCA)

```mermaid
flowchart TD
    I1(["INICIO"]) --> A1["Actividad: Usuario autorizado ingresa CUIT del cliente en módulo Clientes/Empresas"]
    A1 --> V1["Validación Sistema: Formato CUIT válido (módulo 11) + Auth/CSRF<br/>(+ padronLimiter si usa ARCA)"]
    V1 --> D1{"¿Empresa existe en 'bussiness'<br/>o se opta por alta manual?"}
    D1 -- "NO y ARCA activo (opcional)" --> A2["Actividad Auxiliar: ArcaConnection (TA Redis/RAM)<br/>+ PadronService getPersona (fuera de tx SQL)"]
    A2 --> D2{"¿ARCA devolvió razón<br/>social y domicilio?"}
    D2 -- "NO" --> A3["Actividad: Carga manual autónoma con validación DTO"]
    D2 -- "SÍ" --> A4["Actividad: Autocompletar datos y mapear district numeric_id"]
    A3 --> TX["Actividad: Transacción SQL crea/vincula 'persons' y 'clients'"]
    A4 --> TX
    D1 -- "SÍ / Carga Manual directa" --> TX
    TX --> DOC1[/"Registro: Ficha de Cliente unificada y disponible en Agenda Compartida"/]
    DOC1 --> F1(["FIN"])
```

### 4.2. Diagrama TO-BE 2 — Solicitud de Ensayo, Presupuesto y Aceptación (`F-PC13-02`)

```mermaid
flowchart TD
    I2(["INICIO"]) --> A21["Actividad: Cliente o Laboratorio completa Solicitud F-PC13-02 + Elementos"]
    A21 --> V21["Validación Sistema: CreateEssayDTO + Propiedad tenant + Idempotency-Key"]
    V21 --> A22["Actividad: Transacción asigna código diario atómico (daily_sequence_counters)"]
    A22 --> DOC2A[/"Documento: Persiste 'essays' (CREATED), snapshot 'essays_client' y 'essay_audit_logs'"/]
    DOC2A --> A23["Actividad: Notificación automática por email (Resend) al Laboratorio"]
    A23 --> A24["Actividad: Laboratorio revisa solicitud (VERIFYING) y carga presupuesto/plazo (essays_terms)"]
    A24 --> DOC2B[/"Documento: Estado cambia a PENDING_ACCEPTANCE · Email al Cliente"/]
    DOC2B --> D21{"¿El Cliente acepta los términos<br/>antes del vencimiento?"}
    D21 -- "NO (Rechaza/Cancela/Expira)" --> E21["Estado final: REJECTED / CANCELED / EXPIRED"]
    E21 --> F2(["FIN"])
    D21 -- "SÍ" --> A25["Actividad: Estado cambia a WAITING_FOR_SAMPLES · Ficha F-PC13-02 descargable en PDF"]
    A25 --> F2
```

### 4.3. Diagrama TO-BE 3 — Recepción de Muestras, Orden de Trabajo (`F-PC13-03`) y Resultados

```mermaid
flowchart TD
    I3(["INICIO"]) --> A31["Actividad: Laboratorio recibe probetas físicas y abre formulario receiveSamples"]
    A31 --> V31["Validación Sistema: Permiso 'muestras.recibir' + Estado WAITING_FOR_SAMPLES + DTO"]
    V31 --> A32["Actividad: Transacción crea Orden de Trabajo (código diario atómico) + registros 'samples'"]
    A32 --> DOC3A[/"Documento: PDF F-PC13-03 bajo demanda + registro en work_order_audit_logs"/]
    DOC3A --> A33["Actividad: Técnico ejecuta ensayos e ingresa lecturas en loadSampleResults"]
    A33 --> V32["Validación Sistema: Permiso 'muestras.resultados' + Lecturas numéricas válidas"]
    V32 --> A34["Actividad: Sample.setResult calcula automáticamente 'average_value' y observaciones"]
    A34 --> DOC3B[/"Documento: Orden de Trabajo y Muestras actualizadas con estado analítico"/]
    DOC3B --> F3(["FIN"])
```

### 4.4. Diagrama TO-BE 4 — Emisión de Informe (`F-PC13-01`) con Snapshot RSA-SHA256 y OTS

```mermaid
flowchart TD
    I4(["INICIO"]) --> A41["Actividad: Usuario autorizado solicita emitir Informe Oficial F-PC13-01 (emitReport)"]
    A41 --> V41["Validación Sistema: Permisos laboratorio + Regla mínimo 2 muestras con resultados"]
    V41 --> D41{"¿Cumple mínimo de muestras<br/>y estado válido?"}
    D41 -- "NO" --> E41["Error estandarizado 400 · Se bloquea emisión hasta completar análisis"]
    E41 --> F4(["FIN"])
    D41 -- "SÍ" --> A42["Actividad: Transacción determina tipo ORIGINAL vs MODIFICATION y clasificación E1 / E2"]
    A42 --> A43["Actividad: SnapshotApplicationService serializa CanonicalJson (RFC 8785)"]
    A43 --> DOC4[/"Documento: Firma RSA-SHA256 + comprobante OpenTimestamps (.ots) -> essay_document_snapshots"/]
    DOC4 --> A44["Actividad: Renderiza PDF oficial F-PC13-01 vía Handlebars + Chromium (sin red) -> R2"]
    A44 --> A45["Actividad: Email Resend notifica al cliente que su Informe F-PC13-01 está disponible"]
    A45 --> F4
```

---

## 5. Casos de Uso Principales (`CU01` – `CU12`)

| ID | Caso de uso | Actor | Objetivo | Datos necesarios | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CU01`** | Registrar e ingresar al sistema | Cliente (`CLIENT`) o Usuario Lab | Acceder autenticado a la plataforma de forma segura. | Email, password, código OTP verificación (alta), código TOTP/Email si tiene 2FA activo, metadata dispositivo. | Usuario verificado, cookies `HttpOnly` + `ctm_csrf` emitidas y sesión registrada en `user_sessions`. |
| **`CU02`** | Invitar y habilitar operador interno | Administrador Lab (`ADMIN`) | Incorporar personal técnico o administrativo asignándole rol y permisos. | Email, nombre, código rol (`ADMIN`/`USER`/`CONSULTA`) y array de permisos granulares. | Miembro creado en laboratorio, email de invitación enviado y cuenta lista tras definir contraseña (12–64 caracteres). |
| **`CU03`** | Alta de empresa y cliente (manual o autocompletado opcional ARCA) | Cliente o Operador Lab | Dar de alta una firma y su red de contactos con carga manual autónoma o autocompletado auxiliar si ARCA está habilitado. | CUIT (11 dígitos), razón social/domicilio (cargados manualmente o prellenados desde ARCA), representante legal, contacto, facturación opcional. | Empresa registrada en `bussiness` y `bussiness_address`, personas y cliente persistidos sin depender de activación externa. |
| **`CU04`** | Agendar cliente compartido del laboratorio | Operador Lab (`USER`/`ADMIN`) | Incorporar a la agenda común un cliente o solicitante nacido de un ensayo. | `clientId` (de `clients` o `essays_client`) o `cuit` de empresa. | Cliente visible en `/clients/scheduled` para todo el equipo de laboratorio. |
| **`CU05`** | Solicitar servicio de ensayo (`F-PC13-02`) | Cliente o Operador Lab | Formalizar un pedido técnico sobre tableros o muebles. | `clientId`, `contactId`, tipo de ensayo, muestras estimadas, array de elementos (material, medidas, espesor, norma), notificaciones. | Ensayo creado en `CREATED`, código diario único asignado, snapshot `essays_client` guardado y alerta enviada al laboratorio. |
| **`CU06`** | Presupuestar y aceptar condiciones de ensayo | Operador Lab + Cliente | Acordar costo, plazo de entrega y vencimiento antes de ensayar. | `essayId`, costo estimado, plazo de ejecución, fecha de vencimiento/pago (`essays_terms`), decisión aceptar/rechazar. | Estado transiciona `VERIFYING` → `PENDING_ACCEPTANCE` → `WAITING_FOR_SAMPLES` (o `REJECTED`) con auditoría completa. |
| **`CU07`** | Recibir muestras y abrir Orden de Trabajo (`F-PC13-03`) | Recepción / Lab | Ingresar probetas físicas y generar orden interna de análisis. | `essayId`, cantidad/identificación de muestras recibidas, condición física de recepción, observaciones. | Muestras registradas, `work_orders` creada con código diario único, estado actualizado y PDF `F-PC13-03` disponible. |
| **`CU08`** | Cargar resultados de laboratorio | Técnico Ensayista (`USER`) | Registrar mediciones obtenidas por cada muestra y calcular promedios. | `workOrderId`, array de muestras con valores medidos individuales y observaciones analíticas. | Muestras actualizadas con lecturas y `average_value` calculado, listas para evaluación final. |
| **`CU09`** | Emitir o modificar informe oficial (`F-PC13-01`) | Lab autorizado / `ADMIN` | Generar el informe técnico certificado `ORIGINAL` o `MODIFICATION`. | `essayId`, observaciones finales, motivo (si es modificación). Mínimo 2 muestras cargadas. | Ensayo en `COMPLETED`, clasificación `E1`/`E2` aplicada, snapshot firmado RSA-SHA256 + OTS guardado y cliente notificado. |
| **`CU10`** | Descargar PDF y verificar integridad criptográfica | Cliente o Lab / Auditor | Obtener formularios oficiales en PDF y comprobar que no fueron adulterados. | `essayId` (o `workOrderId`), tipo de documento (`F-PC13-01`, `F-PC13-02`, `F-PC13-03`), hash/snapshot. | PDF generado bajo demanda desde HTML+Handlebars y verificación positiva contra firma RSA y `.ots`. |
| **`CU11`** | Exportar reportes en CSV / XLSX | Lab (`essays.export`) | Consolidar gestión operativa y métricas por rango de fechas para gerencia. | `dateFrom`, `dateTo`, `status`, `clientId`, formato (`csv` / `xlsx`). | Descarga segura de reporte (sin CSV Injection) en formato CSV o libro Excel de 3 hojas. |
| **`CU12`** | Configurar variables `/env` y seguridad de cuenta | `ADMIN` / Usuario | Ajustar parámetros institucionales o gestionar 2FA/sesiones/API Keys. | Clave/valor `/env`, token TOTP, ID de sesión/dispositivo a revocar o nombre de API Key. | Parámetro actualizado (caché invalidada), sesión/dispositivo revocado o API Key cifrada AES-256-GCM emitida. |

---

## 6. Priorización Funcional

| Prioridad | Criterio | Funcionalidades incluidas |
| :--- | :--- | :--- |
| **Alta Prioridad (Necesarias para operar)** | Indispensables para habilitar el circuito comercial, operativo y seguro de punta a punta. | Autenticación y verificación de email (`RF01`–`RF02`), roles de laboratorio (`RF05`), alta manual autónoma de empresas y clientes (`RF08`–`RF10`), creación y presupuesto de ensayos `F-PC13-02` (`RF12`–`RF14`, `RF16`), código diario atómico (`RF13`), recepción de muestras y OT `F-PC13-03` (`RF18`–`RF19`), carga de resultados (`RF20`), emisión `F-PC13-01` (`RF21`), generación PDF (`RF22`), transacciones y catálogos (`RF28`–`RF29`). |
| **Media Prioridad (Importantes para eficiencia, seguridad avanzada y trazabilidad)** | Elevan control interno, seguridad corporativa, calidad documental y velocidad operativa. | 2FA TOTP/Email y dispositivos confiables (`RF03`), recuperación de clave (`RF04`), autocompletado auxiliar opcional de datos de clientes vía ARCA (`RF07`, no necesario activarlo), agenda compartida de clientes (`RF11`), plantillas de elementos (`RF15`), filtrado avanzado por fecha Argentina (`RF17`), notificaciones por email + desuscripción (`RF26`), exportación CSV/XLSX (`RF25`), snapshots firmados RSA-SHA256 + OpenTimestamps (`RF23`–`RF24`), auditoría completa (`RF27`). |
| **Baja Prioridad (Mejoras de plataforma y automatización externa)** | Extienden capacidades de observabilidad, integraciones B2B y tolerancia avanzada. | Gestión de `system_api_keys` cifradas (`RF06`), endpoints de probes `/health` y `/ready`, caché Redis multi-nivel para Tickets ARCA e idempotencia extendida para clientes externos. |

---

## 7. Validación del Análisis — Checklist de Cierre (Módulo II)

| Pregunta de control (`Módulo II.pdf`) | Verificación realizada | Estado |
| :--- | :--- | :--- |
| **¿El sistema resuelve problemas reales?** | Sí: erradica colisiones de códigos diarios, carga fragmentada de clientes, pérdida de trazabilidad entre solicitud/muestra/informe y falta de evidencia de integridad en PDFs. | **Aprobado** |
| **¿Los procesos tienen orden lógico?** | Sí: jerarquía en procesos base (`PB`), operativos (`PO`) y de control (`PC`), con máquinas de estado estrictas en `EssayStatus`, `WorkOrderStatus` y `SampleStatus`. | **Aprobado** |
| **¿Existen dependencias claras?** | Sí: cascada operativa formalizada (Usuario/Permisos → Empresa/Cliente → Ensayo F-PC13-02 → Aceptación → Recepción/OT F-PC13-03 → Resultados → Informe F-PC13-01 → Reportes/Snapshots). | **Aprobado** |
| **¿Los datos necesarios están identificados?** | Sí: todas las entidades iniciales y atributos se relevan en detalle en `03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md` para los 9 procesos. | **Aprobado** |
| **¿El alcance es posible?** | Sí: delimitado con precisión incluyendo exclusiones claras (sin facturación AFIP WSFEv1 ni telemetría PLC directa). | **Aprobado** |
| **¿Se puede continuar al diseño (Módulo III)?** | Sí: la base funcional, reglas de negocio y casos de uso permiten diseñar sin ambigüedades la arquitectura, base de datos física normalizada y mockups. | **Aprobado** |

---

<!-- Fuente: docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md -->

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

---

# Módulo III — Arquitectura y Planificación de Implementación

> Tipo de solución web/serverless, Neon PostgreSQL, diseño lógico definitivo (34 tablas y normalización), módulos, navegación, mockups, seguridad, políticas y mantenimiento.

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md -->

# Módulo III — Tipo de Solución, Arquitectura y Selección Tecnológica Justificada

Este documento define y justifica el tipo de solución informática, su arquitectura cliente/servidor web y el stack tecnológico adoptado en producción para **`gestion.ctmueble.com.ar`**.

## 0. Organización de Actividades del Módulo III y Validación de Módulos I–II

- **Responsabilidades técnicas:** Base de datos (modelado lógico definitivo de 34 tablas e índices), arquitectura backend (Clean Architecture/DDD + Serverless), diseño de interfaz y navegación (mockups y matriz de permisos), documentación técnica y gobierno del repositorio GitHub.
- **Validación previa:** Se revisaron y congelaron los entregables de los Módulos I y II (alcance aprobado, `RF01`–`RF36`, `RNF01`–`RNF18`, jerarquía de procesos `PB`/`PO`/`PC` y entidades iniciales), confirmando que ninguna decisión de diseño técnico contradice el análisis funcional.

## 0.1. Definición y Justificación del Tipo de Solución Informática

- **Tipo de solución elegida:** **Sistema Web Cliente/Servidor con acceso remoto y arquitectura cloud serverless**.
- **Justificación según los criterios de ingeniería (`Módulo III.pdf`):**
  - **Tipo de organización:** El CTM interactúa tanto con su equipo técnico interno en laboratorio como con fábricas de muebles, madereras e importadores ubicados en distintas provincias; un sistema web elimina barreras geográficas.
  - **Cantidad de usuarios:** Permite escalar simultáneamente múltiples usuarios `CLIENT` externos y miembros internos `LABORATORY` (`ADMIN`, `USER`, `CONSULTA`) sin instalaciones locales por puesto.
  - **Recursos disponibles:** Al apoyarse en plataformas administradas (Vercel Serverless + Neon PostgreSQL + Cloudflare R2 + Redis), el CTM evita costos fijos de mantenimiento de servidores físicos propios.
  - **Facilidad de uso:** Acceso universal desde cualquier navegador moderno mediante interfaz React responsiva, con descarga directa de PDFs y planillas XLSX/CSV.
  - **Mantenimiento futuro:** Cualquier despliegue de correcciones o mejoras impacta de inmediato en todos los usuarios mediante despliegues automatizados, migraciones versionadas Umzug y configuración dinámica en caliente (`/env`).

## 0.2. Arquitectura Técnica del Sistema (Dónde Vive, Datos, Acceso e Instalación)

```mermaid
flowchart TD
    USR["USUARIOS FINALES<br/>(Clientes Externos · Técnicos Lab · Admins · Auditores)<br/>Acceso remoto HTTPS mediante Navegador Web (SPA React / Vite / Axios)"]
    API["CAPA DE APLICACIÓN / API REST<br/>(Vercel Serverless · Node.js + Express 5)<br/>• Middlewares HTTP: CORS, CSRF, Rate Limit, Idempotency, Auth JWT/2FA<br/>• Arquitectura DDD: Presentation → Application → Domain → Infrastructure<br/>• Motor Documental: Handlebars + Puppeteer/@sparticuz/chromium"]

    subgraph INF["Infraestructura y Servicios Conectados"]
        DB[("BASE DE DATOS<br/>Neon PostgreSQL<br/>• 34 tablas ACID<br/>• Snapshots RSA+OTS<br/>• Logs append-only")]
        R2[("OBJECT STORAGE<br/>Cloudflare R2<br/>• PDFs oficiales<br/>• Almacenamiento desacoplado")]
        EXT["SERVICIOS EXTERNOS<br/>• ARCA A13 (opcional*)<br/>• Redis (caché/sesión)<br/>• Resend (Emails)<br/>• OpenTimestamps (BTC)"]
    end

    USR -- "HTTPS + Cookies HttpOnly + X-CSRF-Token" --> API
    API -- "SSL/TLS (Pool pg)" --> DB
    API -- "S3 API (AWS SDK)" --> R2
    API -- "TLS/TCP + SOAP" --> EXT
```

> \* **Autocompletado auxiliar con ARCA (opcional):** La conexión con ARCA/AFIP (WSAA + Padrón A13) es únicamente un servicio auxiliar para autocompletar datos de clientes/empresas y **no necesita estar activada** para operar el sistema. Para habilitarla en el futuro, deben cargarse las variables `ARCA_CUIT` y los certificados X.509 (`ARCA_CERT_BASE64`/`ARCA_KEY_BASE64` en producción o `ARCA_CERT_FILE`/`ARCA_KEY_FILE` en local) autorizando el servicio `ws_sr_padron_a13` en ARCA.

- **Dónde estará el sistema:** Frontend SPA y Backend API desplegados en infraestructura cloud de Vercel (`src/app.js` / `src/handler.js`).
- **Dónde estarán los datos:** Datos relacionales y auditorías en PostgreSQL administrado en **Neon**; archivos PDF binarios en **Cloudflare R2** (o `STORAGE_DIR` en local); caché efímera y tokens de revocación/idempotencia en **Redis**.
- **Cómo accederán los usuarios:** A través de navegador web moderno bajo HTTPS, con autenticación protegida por cookies `HttpOnly` (`ctm_at`, `ctm_rt`) y cabecera `X-CSRF-Token`.
- **Qué necesita instalarse:** En el usuario final, **nada** (solo navegador web actualizado y lector PDF estándar). En entorno de desarrollo/administración CLI: Node.js, dependencias `npm` y variables `.env`.

## 0.3. Selección Tecnológica Justificada

| Componente | Tecnología elegida | Justificación (motivo, conocimiento, facilidad y compatibilidad) |
| :--- | :--- | :--- |
| **Lenguaje y Runtime** | **JavaScript (Node.js)** | Unifica el lenguaje entre frontend (React) y backend (Express 5), reduce fricción de desarrollo para el equipo y ofrece amplio ecosistema criptográfico y PDF (`crypto`, `puppeteer`, `exceljs`). |
| **Framework API** | **Express 5 + Swagger UI** | Sintaxis madura, integración directa de middlewares de seguridad, fácil compatibilidad con Vercel y `serverless-http` (`AWS Lambda`), y auto-documentación OpenAPI. |
| **Base de Datos** | **PostgreSQL (Neon)** | Motor relacional robusto con transacciones ACID estrictas, `UUID`, `JSONB`, bloqueos consultivos (`pg_advisory_xact_lock`), SSL nativo y compatibilidad total con Sequelize 6 + Umzug. |
| **Herramientas complementarias** | **GitHub, VSCode, Trello, Puppeteer, Handlebars, ExcelJS, Redis, R2, node-forge, Resend** | Conocimiento previo del equipo en flujo Git/VSCode; plantillas Handlebars embebidas sin dependencias de I/O frágiles en serverless; `node-forge` para firma PKCS#7 cuando se habilita el autocompletado auxiliar opcional de ARCA; `exceljs` para reportes sin riesgo de CSV Injection. |

## 1) Resumen ejecutivo

La solucion corre en una arquitectura cloud desacoplada:

- **Aplicacion/API:** Vercel
- **Base de datos transaccional:** Neon (PostgreSQL)
- **Almacenamiento de archivos/documentos:** Cloudflare R2

## 2) Componentes principales

## 2.1 Runtime y despliegue

- **Plataforma:** Vercel
- **Tipo de despliegue:** backend Node.js (API) desplegado en infraestructura serverless/managed de Vercel.
- **Responsabilidades:**
  - exponer endpoints HTTP de negocio,
  - aplicar autenticacion/autorizacion,
  - ejecutar validaciones, reglas de negocio y contratos API.

## 2.2 Base de datos

- **Proveedor:** Neon
- **Motor:** PostgreSQL administrado
- **Responsabilidades:**
  - persistencia transaccional del sistema,
  - integridad de datos relacionales,
  - soporte de migraciones y evolucion de esquema.

## 2.3 Almacenamiento de objetos

- **Proveedor:** Cloudflare R2
- **Uso:** almacenamiento de documentos generados y archivos asociados (ej. informes en PDF).
- **Responsabilidades:**
  - guardar objetos binarios,
  - servir descargas de documentos,
  - desacoplar almacenamiento de archivos de la base de datos.

## 3) Stack de aplicacion (backend)

- **Lenguaje:** JavaScript (Node.js)
- **Framework HTTP:** Express
- **ORM/DB Access:** Sequelize (con PostgreSQL)
- **Autenticacion:** JWT
- **Documentacion API:** Swagger UI / OpenAPI
- **Migraciones:** scripts de migracion versionados en el repositorio

## 4) Flujo tecnico simplificado

1. Frontend/cliente invoca endpoint en API desplegada en Vercel.
2. API valida token y permisos.
3. API lee/escribe datos de negocio en Neon.
4. Si hay documentos, API genera/recupera archivo en Cloudflare R2.
5. API responde payload JSON o archivo segun el endpoint.

## 5) Variables de entorno clave (referencia)

> Nota: los nombres exactos deben mantenerse segun configuracion vigente del proyecto.

- Conexion DB: `DATABASE_URL` (Neon/PostgreSQL)
- JWT: `JWT_SECRET`
- R2:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
- Otros: variables de integraciones externas (si aplica).

## 6) Consideraciones operativas

- **Escalabilidad:** Vercel y Neon permiten escalar por demanda.
- **Seguridad:** secretos gestionados por ambiente, nunca en repositorio.
- **Disponibilidad:** separar compute (Vercel), datos (Neon) y storage (R2) reduce acoplamiento.
- **Mantenibilidad:** migraciones controladas y contratos API documentados en Swagger.

## 7) Ambientes recomendados

- **Dev:** pruebas locales/integracion.
- **Staging:** validacion pre-productiva.
- **Prod:** operacion final con controles de cambios.

Cada ambiente debe tener:

- variables de entorno propias,
- credenciales separadas,
- recursos de datos/storage aislados o segmentados.

---

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/02-INFRAESTRUCTURA_NEON_POSTGRESQL.md -->

# Infraestructura y Configuración de Base de Datos PostgreSQL (Neon)

Este proyecto utiliza **PostgreSQL** administrado en [Neon](https://neon.tech) mediante la variable de entorno `DATABASE_URL` (tanto para ejecución de la API como para migraciones y scripts de seedeo).

---

## 1. Creación y Configuración del Proyecto en Neon

1. Iniciar sesión o registrarse en [neon.tech](https://neon.tech).
2. En la [Consola de Neon](https://console.neon.tech/app/projects), crear un proyecto nuevo o seleccionar el proyecto existente.
3. Hacer clic en **Connect** y copiar la cadena de conexión:
   ```text
   postgresql://USUARIO:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **Conexión Pooled vs Directa:**
   - Para **tráfico normal de la aplicación / Vercel Serverless**, Neon recomienda utilizar el endpoint con `-pooler` (PgBouncer habilitado) para optimizar el pool de conexiones (`DB_POOL_MAX`).
   - Para **migraciones y tareas administrativas pesadas**, utilizar preferentemente la conexión **directa** (sin `-pooler`) o asegurar `sslmode=require`.

---

## 2. Configuración del Archivo `.env`

Definir en el archivo `.env` en la raíz del repositorio (o en las Environment Variables de Vercel):

```env
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST/NOMBRE_BD?sslmode=require
```

> **Seguridad:** Nunca versionar credenciales reales de `.env` en Git (el archivo debe permanecer excluido en `.gitignore`).

Opcionalmente, para inspeccionar consultas SQL en desarrollo local:

```env
DB_LOGGING=true
```

---

## 3. Ejecución de Migraciones de Esquema (`umzug` + `SequelizeMeta`)

El esquema completo (34 tablas) se gestiona mediante migraciones transaccionales ordenadas en [`src/infrastructure/migrations/`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/migrations/run-migrations.js):

```bash
# Ejecutar todas las migraciones pendientes
npm run migrate
# o explícitamente:
npm run migrate:up

# Consultar estado de migraciones aplicadas y pendientes
npm run migrate:status

# Revertir la última migración aplicada
npm run migrate:down

# Revertir todas las migraciones (precaución en entornos con datos)
npm run migrate:undo
```

En una **base de datos Neon vacía**, la migración inicial (`20260217000000-create-full-schema-postgres.js`) crea la estructura base completa y las migraciones sucesivas (`20260219000000` hasta `20261117120000`) incorporan de forma idempotente las tablas, columnas, llaves foráneas e índices adicionales.

---

## 4. Seedeo de Datos Base (Global, Granular y Restablecimiento de Claves)

Una vez aplicadas las migraciones, el sistema permite poblar los catálogos completos y datos ficticios iniciales de laboratorio/usuarios desde [`run-default-types-seed.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/seeders/run-default-types-seed.js):

### 4.1. Seedeo global
```bash
npm run seed
```
Ejecuta de forma idempotente todos los bloques iniciales:
- **249 países** ISO 3166-1 alpha-2 en español (`types_countries`).
- **24 jurisdicciones/provincias** de Argentina (`types_districts`, `AR-A` a `AR-Z`).
- **Tipo de ensayo de formaldehído** (`id: 1` según `IT17-01`) en `types_essays` y los **5 tipos de documentos** (`types_documents`).
- **Datos ficticios de laboratorio** en `environment_variables` y `laboratories`.
- **Cuentas iniciales:** Admin de Laboratorio (`admin.lab@ctmueble.com.ar` / `AdminLab1234!`, perfil `LABORATORY`, rol `ADMIN`) y Cliente demo (`cliente.demo@ctmueble.com.ar` / `ClienteDemo1234!`, perfil `CLIENT`).

### 4.2. Seedeo granular y restablecimiento de contraseñas
```bash
npm run seed:countries       # Solo los 249 países
npm run seed:provinces       # Solo las 24 provincias argentinas
npm run seed:essay-types     # Solo el tipo de ensayo de formaldehído
npm run seed:lab             # Solo variables y registro ficticio de laboratorio
npm run seed:users           # Solo cuenta Admin de Laboratorio y cuenta Cliente

# Combinación granular adicional por flags:
node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js --documents --admin
node -r dotenv/config src/infrastructure/seeders/run-default-types-seed.js --lab --overwrite-lab

# Si los usuarios ya fueron aplicados y se desea restablecer sus contraseñas:
npm run seed:reset-passwords

# Crear o restablecer contraseña de un usuario puntual:
npm run create-user -- --mail admin.lab@ctmueble.com.ar --password NuevaClaveSegura12! --reset-password
```

---

## 5. Verificación de Conexión

Iniciar el servidor backend y verificar conexión a PostgreSQL y estado `/ready`:

```bash
npm start
```

## Recursos Oficiales

- [Guía de Neon + Sequelize](https://neon.tech/docs/guides/sequelize)
- [Opciones de conexión y Connection Pooling en Neon](https://neon.tech/docs/connect/connection-pooling)

---

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md -->

# Descripción de la base de datos (gestion.ctmueble.com.ar)

Documento generado a partir de los modelos Sequelize. Incluye todas las tablas, columnas, tipos, restricciones y relaciones.

---

## Índice de tablas

| Tabla | Descripción |
|-------|-------------|
| `types_countries` | Catálogo de países |
| `types_districts` | Catálogo de distritos (depende de país) |
| `types_documents` | Tipos de documentos (informes, contratos, etc.) |
| `types_essays` | Tipos de ensayo |
| `environment_variables` | Variables de entorno/configuración |
| `daily_sequence_counters` | Contadores atómicos diarios para códigos de ensayos y órdenes de trabajo |
| `users` | Usuarios del sistema (con 2FA y estado activo) |
| `user_sessions` | Sesiones activas y revocadas vinculadas a JWT (`sid`) |
| `user_recovery_codes` | Códigos de recuperación de emergencia 2FA (SHA-256) |
| `user_trusted_devices` | Dispositivos de confianza para bypass temporal de 2FA |
| `email_verifications` | Verificaciones de correo e invitaciones (OTP + token SHA-256) |
| `password_resets` | Solicitudes de restablecimiento de contraseña (OTP + token SHA-256) |
| `laboratories` | Laboratorios |
| `laboratories_members` / `laboratory_members` | Relación usuario–laboratorio (miembros y rol `ADMIN`/`USER`/`CONSULTA`) |
| `laboratory_permissions` | Matriz configurable de permisos granulares por rol de laboratorio |
| `system_api_keys` | Credenciales externas cifradas con AES-256-GCM (ej. Resend mailing) |
| `security_audit_logs` | Bitácora inmutable (append-only) de eventos de seguridad con firma criptográfica |
| `bussiness` | Empresas por CUIT (razón social) |
| `bussiness_address` | Direcciones de empresas |
| `persons` | Personas físicas (representantes, contactos) |
| `clients` | Clientes (empresa + dirección + representante/contacto) |
| `clients_contacts` | Contactos adicionales de un cliente (N–N cliente–persona) |
| `essays` | Solicitudes/ensayos |
| `essays_elements` | Datos del producto/material del ensayo |
| `essays_terms` | Plazos y precio del ensayo |
| `essays_billing` | Datos de facturación del ensayo (tabla histórica de esquema inicial) |
| `essays_client` | Snapshot del cliente al crear el ensayo |
| `essay_element_templates` | Plantillas de elementos de ensayo por usuario/origen |
| `essay_audit_logs` | Auditoría de cambios en ensayos (con huella de dispositivo y firma) |
| `essay_document_snapshots` | Snapshots inmutables RFC 8785 firmadas y selladas con OpenTimestamps |
| `work_orders` | Órdenes de trabajo |
| `work_order_audit_logs` | Auditoría de cambios en órdenes de trabajo (con huella de dispositivo y firma) |
| `samples` | Muestras (por ensayo y opcionalmente por orden de trabajo) |
| `essays_documents` | Documentos asociados a ensayos (metadatos para generación On The Fly) |

---

## 1. Catálogos y tipos (geo y documentos)

### 1.1. `types_countries`

Catálogo de países.

| Columna       | Tipo        | Nulo | Default | PK | FK | Descripción        |
|---------------|-------------|------|---------|----|----|--------------------|
| `id`          | CHAR(2)     | NO   | —       | SÍ | —  | Código país (ISO)  |
| `name`        | STRING      | NO   | —       | —  | —  | Nombre del país    |
| `country_code`| CHAR(3)     | SÍ   | —       | —  | —  | Código telefónico  |

Índice único: `country_code`.

---

### 1.2. `types_districts`

Distritos/localidades (geo).

| Columna   | Tipo    | Nulo | Default | PK | FK                    | Descripción   |
|-----------|---------|------|---------|----|-----------------------|---------------|
| `id`      | CHAR(6)  | NO   | —       | SÍ | —                     | Código distrito|
| `country` | CHAR(2)  | SÍ   | —       | —  | → `types_countries.id`| País          |
| `name`    | STRING  | NO   | —       | —  | —                     | Nombre        |
| `numeric_id` | INTEGER | SÍ | —     | —  | —                     | Código numérico de provincia (AFIP) |

---

### 1.3. `types_documents`

Tipos de documento (informe, contrato, etc.).

| Columna    | Tipo    | Nulo | Default | PK | FK | Descripción      |
|------------|---------|------|---------|----|----|------------------|
| `id`       | INTEGER | NO   | auto    | SÍ | —  | Identificador    |
| `code`     | STRING  | NO   | —       | —  | —  | Código interno   |
| `name`     | STRING  | NO   | —       | —  | —  | Nombre           |
| `filesheet`| STRING  | NO   | —       | —  | —  | Plantilla/hoja   |

---

### 1.4. `types_essays`

Tipos de ensayo.

| Columna | Tipo    | Nulo | Default | PK | FK | Descripción   |
|---------|---------|------|---------|----|----|----------------|
| `id`    | INTEGER | NO   | auto    | SÍ | —  | Identificador  |
| `name`  | STRING  | NO   | —       | —  | —  | Nombre del tipo|

**Relación:** `essays.essay` (INTEGER) referencia lógicamente a `types_essays.id` (sin FK explícita en el modelo).

---

## 2. Configuración y usuarios

### 2.1. `environment_variables`

Variables de configuración (clave–valor tipado).

| Columna         | Tipo    | Nulo | Default | PK | FK | Descripción      |
|-----------------|---------|------|---------|----|----|------------------|
| `id`            | STRING  | NO   | —       | SÍ | —  | Clave            |
| `label`         | STRING  | NO   | —       | —  | —  | Etiqueta         |
| `type`          | ENUM    | NO   | —       | —  | —  | TEXT, NUMBER, DECIMAL, TIMESTAMP |
| `value_text`    | STRING  | SÍ   | —       | —  | —  | Valor si TEXT    |
| `value_number`  | INTEGER | SÍ   | —       | —  | —  | Valor si NUMBER  |
| `value_decimal` | DECIMAL(12,2) | SÍ | —   | —  | —  | Valor si DECIMAL |
| `value_timestamp`| DATE   | SÍ   | —       | —  | —  | Valor si TIMESTAMP|
| `hardcoded`     | BOOLEAN | NO   | false   | —  | —  | No editable      |

---

### 2.2. `users`

Usuarios del sistema.

| Columna       | Tipo     | Nulo | Default   | PK | FK                      | Descripción   |
|---------------|----------|------|-----------|----|-------------------------|---------------|
| `id`          | UUID     | NO   | UUIDv4    | SÍ | —                       | Identificador |
| `name`        | STRING   | NO   | —         | —  | —                       | Nombre        |
| `dni`         | STRING(8)| NO   | —         | —  | —                       | DNI           |
| `mail`        | STRING   | NO   | —         | —  | —                       | Email (único) |
| `password`    | STRING   | NO   | —         | —  | —                       | Contraseña    |
| `profile`     | STRING   | NO   | —         | —  | —                       | Perfil/rol    |
| `laboratory`  | UUID     | SÍ   | —         | —  | → `laboratories.id`     | Laboratorio   |
| `is_active`   | BOOLEAN  | NO   | true      | —  | —                       | Cuenta activa / suspendida |
| `two_factor_enabled` | BOOLEAN | NO | false | —  | —                       | 2FA habilitado |
| `two_factor_method`  | VARCHAR(20) | NO | 'NONE' | — | —                   | `NONE`, `TOTP`, `EMAIL` |
| `two_factor_secret`  | TEXT | SÍ | —        | —  | —                       | Secreto Base32 TOTP (excluido por defaultScope) |
| `two_factor_temp_secret` | TEXT | SÍ | —   | —  | —                       | Secreto temporal durante vinculación TOTP |
| `two_factor_confirmed_at` | DATE | SÍ | —   | —  | —                       | Fecha de confirmación 2FA |
| `created_at`  | DATE     | NO   | NOW       | —  | —                       | Alta          |

Índice único: `mail`.

---

### 2.3. `laboratories`

Laboratorios.

| Columna        | Tipo   | Nulo | Default | PK | FK                  | Descripción    |
|----------------|--------|------|---------|----|---------------------|----------------|
| `id`           | UUID   | NO   | UUIDv4  | SÍ | —                   | Identificador  |
| `name`         | STRING | NO   | —       | —  | —                   | Nombre         |
| `cuit`         | STRING | NO   | —       | —  | —                   | CUIT           |
| `administrator`| UUID   | NO   | —       | —  | → `users.id`        | Administrador  |
| `mail`         | STRING | NO   | —       | —  | —                   | Email          |
| `address`      | STRING | NO   | —       | —  | —                   | Dirección      |
| `location`     | STRING | NO   | —       | —  | —                   | Localidad      |
| `district`     | STRING | NO   | —       | —  | —                   | Distrito       |
| `country`      | STRING | NO   | —       | —  | —                   | País           |

---

### 2.4. `laboratories_members` / `laboratory_members`

Usuarios miembros de un laboratorio con su rol interno.

> **Nota de esquema:** La migración inicial creó `laboratories_members` (`laboratory`, `user`, `role` con valores `ADMIN`, `USER`, `CONSULTA`), mientras que el modelo Sequelize vigente (`src/infrastructure/models/laboratories/members.js`) mapea sobre `laboratory_members` con `user` como clave primaria y `role`.

| Columna     | Tipo   | Nulo | Default | PK | FK                  | Descripción   |
|-------------|--------|------|---------|----|---------------------|---------------|
| `user`      | UUID   | NO   | —       | SÍ | → `users.id`        | Usuario       |
| `role`      | ENUM   | NO   | 'USER'  | —  | —                   | `ADMIN`, `USER`, `CONSULTA` |

---

### 2.5. `laboratory_permissions`

Matriz configurable de permisos granulares por rol interno de laboratorio.

| Columna      | Tipo         | Nulo | Default | PK | FK | Descripción |
|--------------|--------------|------|---------|----|----|-------------|
| `id`         | UUID         | NO   | UUIDv4  | SÍ | —  | Identificador |
| `rol`        | VARCHAR(50)  | NO   | —       | —  | —  | `Usuario` o `Consulta` |
| `accion`     | VARCHAR(100) | NO   | —       | —  | —  | Clave de acción (ej. `essays.crear`) |
| `permitido`  | BOOLEAN      | NO   | false   | —  | —  | Permiso habilitado |
| `created_at` | DATE         | NO   | NOW     | —  | —  | Fecha de creación |
| `updated_at` | DATE         | NO   | NOW     | —  | —  | Última modificación |

Índice único: (`rol`, `accion`).

---

### 2.6. `daily_sequence_counters`

Contadores atómicos diarios para la generación libre de colisiones de códigos de ensayos (`YYMMDD<L>`) y órdenes de trabajo.

| Columna      | Tipo        | Nulo | Default | PK | FK | Descripción |
|--------------|-------------|------|---------|----|----|-------------|
| `scope`      | VARCHAR(32) | NO   | —       | SÍ | —  | Ámbito (`'essay'` o `'work_order'`) |
| `date_key`   | VARCHAR(16) | NO   | —       | SÍ | —  | Fecha en formato `YYMMDD` |
| `last_value` | INTEGER     | NO   | 0       | —  | —  | Último correlativo asignado en el día |

Clave primaria compuesta: (`scope`, `date_key`).

---

## 3. Clientes y empresas

### 3.1. `bussiness`

Empresas identificadas por CUIT.

| Columna | Tipo        | Nulo | Default | PK | FK | Descripción   |
|---------|-------------|------|---------|----|----|---------------|
| `cuit`  | STRING(12)  | NO   | —       | SÍ | —  | CUIT (PK)     |
| `name`  | STRING(100) | NO   | —       | —  | —  | Razón social  |

---

### 3.2. `bussiness_address`

Direcciones de empresas.

| Columna   | Tipo        | Nulo | Default | PK | FK                     | Descripción   |
|-----------|-------------|------|---------|----|------------------------|---------------|
| `id`      | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `cuit`    | STRING(12)  | NO   | —       | —  | → `bussiness.cuit`     | Empresa       |
| `address` | STRING(100) | NO   | —       | —  | —                      | Calle/número  |
| `location`| STRING(100) | NO   | —       | —  | —                      | Localidad     |
| `province`| STRING(100) | NO   | —       | —  | —                      | Provincia     |
| `district`| CHAR(6)     | SÍ   | —       | —  | → `types_districts.id` | Distrito      |
| `origin`  | ENUM        | NO   | 'PUBLIC'| —  | —                      | CLIENT, LABORATORY, PUBLIC |
| `user`    | UUID        | SÍ   | —       | —  | → `users.id`           | Usuario alta  |

---

### 3.3. `persons`

Personas físicas (representantes, contactos, terceros).

| Columna       | Tipo   | Nulo | Default | PK | FK                        | Descripción        |
|---------------|--------|------|---------|----|---------------------------|--------------------|
| `id`          | UUID   | NO   | UUIDv4  | SÍ | —                         | Identificador      |
| `name`        | STRING | NO   | —       | —  | —                         | Nombre             |
| `dni`         | STRING | NO   | —       | —  | —                         | DNI                |
| `mail`        | STRING | SÍ   | —       | —  | —                         | Email              |
| `country_code`| CHAR(3)| SÍ   | —       | —  | → `types_countries.country_code` | Código teléfono |
| `phone`       | STRING | SÍ   | —       | —  | —                         | Teléfono           |
| `address`     | STRING | SÍ   | —       | —  | —                         | Dirección          |
| `location`    | STRING | SÍ   | —       | —  | —                         | Localidad          |
| `district`    | CHAR(6)| SÍ   | —       | —  | → `types_districts.id`    | Distrito           |
| `country`     | CHAR(2)| SÍ   | —       | —  | → `types_countries.id`    | País (código ISO)  |
| `user_id`     | UUID   | SÍ   | —       | —  | → `users.id` (unique)     | Usuario vinculado  |
| `origin`      | ENUM   | SÍ   | —       | —  | —                         | CLIENT, LABORATORY, PUBLIC |
| `is_third_party`| BOOLEAN| NO  | false   | —  | —                         | Es tercero         |

---

### 3.4. `clients`

Cliente: empresa + dirección + representante/contacto.

| Columna          | Tipo        | Nulo | Default  | PK | FK                     | Descripción              |
|------------------|-------------|------|----------|----|------------------------|--------------------------|
| `id`             | UUID        | NO   | UUIDv4   | SÍ | —                      | Identificador            |
| `cuit`           | STRING(12)  | NO   | —        | —  | (hist. `bussiness.cuit`) | Empresa                |
| `name`           | STRING(100) | SÍ   | —        | —  | —                      | Razón social / Nombre    |
| `address`        | UUID        | SÍ   | —        | —  | (hist. `bussiness_address.id`) | Dirección (opcional) |
| `address_address`| STRING(100) | SÍ   | —        | —  | —                      | Calle/número embebido    |
| `address_location`| STRING(100)| SÍ   | —        | —  | —                      | Localidad embebida       |
| `address_province`| STRING(100)| SÍ   | —        | —  | —                      | Provincia embebida       |
| `address_district`| CHAR(6)    | SÍ   | —        | —  | → `types_districts.id` | Distrito embebido        |
| `representative` | UUID        | SÍ   | —        | —  | → `persons.id`         | Representante legal      |
| `contact`        | UUID        | SÍ   | —        | —  | → `persons.id`         | Contacto adicional       |
| `origin`         | ENUM        | NO   | 'CLIENT' | —  | —                      | CLIENT, LABORATORY       |
| `billing_cuit`   | STRING(12)  | SÍ   | —        | —  | —                      | CUIT facturación alternativo |
| `billing_address`| STRING(100) | SÍ   | —        | —  | —                      | Dirección facturación    |
| `billing_location`| STRING(100)| SÍ   | —        | —  | —                      | Localidad facturación    |
| `billing_province`| STRING(100)| SÍ   | —        | —  | —                      | Provincia facturación    |
| `billing_iva`    | BOOLEAN     | SÍ   | —        | —  | —                      | Tributa IVA              |
| `user`           | UUID        | SÍ   | —        | —  | → `users.id`            | Usuario que cargó        |

---

### 3.5. `clients_contacts`

Contactos adicionales del cliente (N–N cliente–persona).

| Columna   | Tipo | Nulo | Default | PK | FK                | Descripción   |
|-----------|------|------|---------|----|-------------------|---------------|
| `client`  | UUID | NO   | —       | SÍ | → `clients.id`    | Cliente       |
| `contact` | UUID | NO   | —       | SÍ | → `persons.id`    | Persona       |

Clave primaria compuesta: (`client`, `contact`). Restricción única: (`client`, `contact`).

---

## 4. Ensayos (solicitudes y datos asociados)

### 4.1. `essays`

Solicitudes de ensayo / expedientes.

| Columna         | Tipo     | Nulo | Default    | PK | FK                  | Descripción   |
|-----------------|----------|------|------------|----|---------------------|---------------|
| `id`            | UUID     | NO   | UUIDv4     | SÍ | —                   | Identificador |
| `client`        | CHAR(36) | SÍ   | —          | —  | → `clients.id`      | Cliente (histórico) |
| `contact`       | UUID     | SÍ   | —          | —  | → `persons.id`      | Contacto (histórico) |
| `laboratory`    | UUID     | SÍ   | —          | —  | → `laboratories.id` | Laboratorio   |
| `essay`         | INTEGER  | NO   | 1          | —  | (→ types_essays.id) | Tipo de ensayo|
| `request_date`  | DATE     | NO   | NOW        | —  | —                   | Fecha solicitud |
| `signing_date`  | DATE     | SÍ   | —          | —  | —                   | Firma         |
| `finish_date`   | DATE     | SÍ   | —          | —  | —                   | Fin           |
| `due_date`      | DATE     | SÍ   | —          | —  | —                   | Vencimiento   |
| `observations`  | TEXT     | SÍ   | —          | —  | —                   | Observaciones |
| `status`        | ENUM     | NO   | 'REQUESTED'| —  | —                   | Ver abajo     |
| `code`          | STRING(16)| NO  | —          | —  | —                   | Código corto (`YYMMDD<L>`) |
| `last_update`   | DATE     | SÍ   | —          | —  | —                   | Última actualización por auditoría |
| `last_report_generated` | DATE | SÍ | —       | —  | —                   | Fecha del último informe emitido |
| `result`        | DECIMAL(12,2)| SÍ | —          | —  | —                   | Resultado     |
| `uncertainty`   | DECIMAL(12,2)| SÍ | —          | —  | —                   | Incertidumbre |
| `client_notifications_enabled` | BOOLEAN | NO | true | — | —                 | Consentimiento notificaciones email |
| `notification_token` | UUID | NO   | UUIDv4     | —  | —                   | Token único para baja 1-clic |

**status:** REQUESTED, ACCEPTED, REJECTED, SERVICE_AGREEMENT_MADED, IN_WORK, COMPLETED, CANCELLED.

---

### 4.2. `essays_elements`

Datos del producto/material del ensayo (1–1 con essay).

| Columna        | Tipo   | Nulo | Default | PK | FK                     | Descripción   |
|----------------|--------|------|---------|----|------------------------|---------------|
| `essay`        | UUID   | NO   | —       | SÍ | → `essays.id`          | Ensayo        |
| `product`      | STRING | NO   | —       | —  | —                      | Producto      |
| `manufacturer` | STRING | NO   | —       | —  | —                      | Fabricante    |
| `date`         | DATE   | NO   | —       | —  | —                      | Fecha         |
| `country`      | CHAR(2)| SÍ   | —       | —  | → `types_countries.id` | País origen   |
| `batch_number` | STRING | SÍ   | —       | —  | —                      | Nº de lote    |

---

### 4.3. `essays_terms`

Plazos y precio del ensayo (1–1 con essay).

| Columna                   | Tipo         | Nulo | Default | PK | FK            | Descripción        |
|---------------------------|--------------|------|---------|----|---------------|--------------------|
| `essay`                   | UUID         | NO   | —       | SÍ | → `essays.id` | Ensayo             |
| `days_to_do`              | INTEGER      | NO   | —       | —  | —             | Días para realizar |
| `samples_conservation_days`| INTEGER     | NO   | —       | —  | —             | Días conservación  |
| `price`                   | DECIMAL(12,2)| NO   | —       | —  | —             | Precio             |

---

### 4.4. `essays_billing`

Datos de facturación del ensayo (1–1 con essay).

| Columna  | Tipo         | Nulo | Default | PK | FK                     | Descripción   |
|----------|--------------|------|---------|----|------------------------|---------------|
| `essay`  | UUID         | NO   | —       | SÍ | → `essays.id`          | Ensayo        |
| `cuit`   | STRING(12)   | NO   | —       | —  | → `bussiness.cuit`     | Empresa facturar |
| `address`| STRING(36)   | SÍ   | —       | —  | → `bussiness_address.id`| Dirección facturación |
| `amount` | DECIMAL(12,2)| SÍ   | 0.0     | —  | —                      | Monto          |
| `pays_iva`| BOOLEAN      | NO   | false   | —  | —                      | Tributa IVA   |

---

### 4.5. `essays_client`

Snapshot del cliente al momento de crear el ensayo (1–1 con essay). Permite detectar cambios y decidir si actualizar.

| Columna               | Tipo        | Nulo | Default | PK | FK                     | Descripción   |
|-----------------------|-------------|------|---------|----|------------------------|---------------|
| `id`                  | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `essay`               | UUID        | NO   | —       | —  | → `essays.id` (unique) | Ensayo        |
| `cuit`                | STRING(12)  | NO   | —       | —  | (hist. `bussiness.cuit`) | Empresa     |
| `name`                | STRING(100) | SÍ   | —       | —  | —                      | Snapshot nombre / razón social |
| `address`             | UUID        | SÍ   | —       | —  | (hist. `bussiness_address.id`) | Dirección |
| `representative`      | UUID        | SÍ   | —       | —  | → `persons.id`         | Representante|
| `contact`             | UUID        | NO   | —       | —  | → `persons.id`         | Contacto      |
| `address_address`     | STRING(100) | SÍ   | —       | —  | —                      | Snapshot dirección |
| `address_location`    | STRING(100) | SÍ   | —       | —  | —                      | Snapshot localidad |
| `address_province`    | STRING(100) | SÍ   | —       | —  | —                      | Snapshot provincia |
| `representative_name` | STRING(100) | SÍ   | —       | —  | —                      | Snapshot nombre rep. |
| `representative_dni`  | STRING(8)   | SÍ   | —       | —  | —                      | Snapshot DNI rep. |
| `representative_contact`| UUID       | SÍ   | —       | —  | —                      | ID contacto rep. |
| `contact_name`        | STRING      | SÍ   | —       | —  | —                      | Snapshot nombre contacto |
| `contact_dni`         | STRING      | SÍ   | —       | —  | —                      | Snapshot DNI contacto |
| `contact_mail`        | STRING      | SÍ   | —       | —  | —                      | Snapshot email |
| `contact_country_code`| CHAR(3)     | SÍ   | —       | —  | —                      | Snapshot código país |
| `contact_phone`       | STRING      | SÍ   | —       | —  | —                      | Snapshot teléfono |
| `contact_address`     | STRING      | SÍ   | —       | —  | —                      | Snapshot dirección |
| `contact_location`    | STRING      | SÍ   | —       | —  | —                      | Snapshot localidad |
| `contact_district`    | CHAR(6)     | SÍ   | —       | —  | —                      | Snapshot distrito |
| `contact_country`     | CHAR(2)     | SÍ   | —       | —  | —                      | Snapshot país |
| `billing_cuit`        | STRING(12)  | SÍ   | —       | —  | —                      | Facturación alternativa |
| `billing_address`     | STRING(100) | SÍ   | —       | —  | —                      | Idem           |
| `billing_location`    | STRING(100) | SÍ   | —       | —  | —                      | Idem           |
| `billing_province`    | STRING(100) | SÍ   | —       | —  | —                      | Idem           |
| `billing_iva`         | BOOLEAN     | SÍ   | —       | —  | —                      | Idem           |
| `address_raw_*` / `representative_raw_*` / `contact_raw_*` / `bussiness_raw_name` | VARIOS | SÍ | — | — | — | Columnas de datos crudos en origen (migración `20260220000001`) |

---

### 4.6. `essay_element_templates`

Plantillas de elementos de ensayo (producto/fabricante/país) por usuario u origen.

| Columna    | Tipo        | Nulo | Default  | PK | FK                     | Descripción   |
|------------|-------------|------|----------|----|------------------------|---------------|
| `id`       | UUID        | NO   | UUIDv4   | SÍ | —                      | Identificador |
| `user_id`  | UUID        | SÍ   | —        | —  | → `users.id`           | Usuario       |
| `origin`   | ENUM        | NO   | 'CLIENT' | —  | —                      | CLIENT, LABORATORY |
| `product`  | STRING      | NO   | —        | —  | —                      | Producto      |
| `manufacturer`| STRING    | NO   | —        | —  | —                      | Fabricante    |
| `country`  | CHAR(2)     | SÍ   | —        | —  | → `types_countries.id` | País          |

---

### 4.7. `essay_audit_logs`

Registro de eventos sobre ensayos con trazabilidad de dispositivo e integridad criptográfica.

| Columna              | Tipo        | Nulo | Default | PK | FK            | Descripción   |
|----------------------|-------------|------|---------|----|---------------|---------------|
| `id`                 | CHAR(36)    | NO   | UUIDv4  | SÍ | —             | Identificador |
| `essay`              | CHAR(36)    | NO   | —       | —  | → `essays.id` | Ensayo        |
| `user_id`            | CHAR(36)    | NO   | —       | —  | → `users.id`  | Usuario       |
| `event_code`         | STRING(50)  | NO   | —       | —  | —             | Código evento |
| `timestamp`          | DATE        | NO   | NOW     | —  | —             | Fecha/hora    |
| `ip_address`         | STRING(64)  | SÍ   | —       | —  | —             | IP de origen  |
| `user_agent`         | STRING(512) | SÍ   | —       | —  | —             | User-Agent    |
| `client_name`        | STRING(120) | SÍ   | —       | —  | —             | Navegador/SO  |
| `device_id`          | STRING(100) | SÍ   | —       | —  | —             | ID dispositivo|
| `device_fingerprint` | STRING(128) | SÍ   | —       | —  | —             | Huella digital|
| `session_id`         | STRING(64)  | SÍ   | —       | —  | —             | `sid` de sesión|
| `record_hash`        | STRING(64)  | SÍ   | —       | —  | —             | Hash SHA-256 canónico |
| `signature`          | TEXT        | SÍ   | —       | —  | —             | Firma digital |
| `previous_hash`      | STRING(64)  | SÍ   | —       | —  | —             | Encadenamiento al registro previo |
| `metadata`           | JSON        | SÍ   | —       | —  | —             | Datos extra   |

Índices: `essay`, `user_id`, `timestamp`, `event_code`.

---

## 5. Órdenes de trabajo y muestras

### 5.1. `work_orders`

Órdenes de trabajo generadas a partir de un ensayo.

| Columna                    | Tipo          | Nulo | Default           | PK | FK            | Descripción   |
|----------------------------|---------------|------|-------------------|----|---------------|---------------|
| `id`                       | UUID          | NO   | UUIDv4            | SÍ | —             | Identificador |
| `essay_id`                 | UUID          | NO   | —                 | —  | → `essays.id` | Ensayo        |
| `code`                     | STRING(16)    | NO   | —                 | —  | —             | Código orden  |
| `essay_track_code`         | STRING(64)    | SÍ   | —                 | —  | —             | Código tracking|
| `report_delivery_deadline` | DATEONLY      | SÍ   | —                 | —  | —             | Fecha límite informe |
| `samples_received_at`      | DATE          | SÍ   | —                 | —  | —             | Fecha recepción muestras |
| `sample_dimensions`        | STRING(255)   | SÍ   | —                 | —  | —             | Dimensiones legibles |
| `sample_width`             | DECIMAL(12,4) | SÍ   | —                 | —  | —             | Ancho         |
| `sample_height`            | DECIMAL(12,4) | SÍ   | —                 | —  | —             | Largo/Alto    |
| `sample_thickness`         | DECIMAL(12,4) | SÍ   | —                 | —  | —             | Espesor       |
| `generated_at`             | DATE          | NO   | NOW               | —  | —             | Fecha generación |
| `observations`             | TEXT          | SÍ   | —                 | —  | —             | Observaciones |
| `internal_aconditioning`   | BOOLEAN       | SÍ   | false             | —  | —             | Acondicionamiento |
| `uncertainty`              | STRING(64)    | SÍ   | —                 | —  | —             | Incertidumbre |
| `average_value`            | DECIMAL(12,4) | SÍ   | —                 | —  | —             | Promedio calculado |
| `status`                   | ENUM          | NO   | 'WAITING_SAMPLES' | —  | —             | Ver abajo     |
| `closed_at`                | DATE          | SÍ   | —                 | —  | —             | Fecha de cierre |
| `last_update`              | DATE          | SÍ   | —                 | —  | —             | Última actualización |

**status:** WAITING_SAMPLES, ANALYZING, COMPLETED, CANCELLED.

---

### 5.2. `work_order_audit_logs`

Registro de eventos sobre órdenes de trabajo con trazabilidad de dispositivo e integridad criptográfica.

| Columna              | Tipo        | Nulo | Default | PK | FK                | Descripción   |
|----------------------|-------------|------|---------|----|-------------------|---------------|
| `id`                 | UUID        | NO   | UUIDv4  | SÍ | —                 | Identificador |
| `work_order_id`      | UUID        | NO   | —       | —  | → `work_orders.id` (ON DELETE CASCADE) | Orden   |
| `user_id`            | UUID        | NO   | —       | —  | → `users.id`      | Usuario       |
| `event_code`         | STRING(50)  | NO   | —       | —  | —                 | Código evento |
| `timestamp`          | DATE        | NO   | NOW     | —  | —                 | Fecha/hora    |
| `ip_address`         | STRING(64)  | SÍ   | —       | —  | —                 | IP de origen  |
| `user_agent`         | STRING(512) | SÍ   | —       | —  | —                 | User-Agent    |
| `client_name`        | STRING(120) | SÍ   | —       | —  | —                 | Navegador/SO  |
| `device_id`          | STRING(100) | SÍ   | —       | —  | —                 | ID dispositivo|
| `device_fingerprint` | STRING(128) | SÍ   | —       | —  | —                 | Huella digital|
| `session_id`         | STRING(64)  | SÍ   | —       | —  | —                 | `sid` de sesión|
| `record_hash`        | STRING(64)  | SÍ   | —       | —  | —                 | Hash SHA-256 canónico |
| `signature`          | TEXT        | SÍ   | —       | —  | —                 | Firma digital |
| `previous_hash`      | STRING(64)  | SÍ   | —       | —  | —                 | Encadenamiento |
| `metadata`           | JSON        | SÍ   | —       | —  | —                 | Datos extra   |

Índices: `work_order_id`, `user_id`, `timestamp`.

---

### 5.3. `samples`

Muestras asociadas a un ensayo y opcionalmente a una orden de trabajo.

| Columna                | Tipo         | Nulo | Default  | PK | FK                  | Descripción   |
|------------------------|--------------|------|----------|----|---------------------|---------------|
| `id`                   | STRING(36)   | NO   | —        | SÍ | —                   | Identificador |
| `essay`                | STRING(36)   | NO   | —        | —  | → `essays.id`       | Ensayo        |
| `status`               | ENUM         | NO   | 'PENDING'| —  | —                   | Ver abajo     |
| `date_code`            | STRING(7)    | SÍ   | —        | —  | —                   | Código base (`YYMMDD<L>`) |
| `correlative`          | INTEGER      | NO   | —        | —  | —                   | Correlativo   |
| `countersample`        | BOOLEAN      | NO   | false    | —  | —                   | Es contramuestra |
| `received_at`          | DATE         | NO   | NOW      | —  | —                   | Fecha recepción |
| `accepted`             | BOOLEAN      | SÍ   | false    | —  | —                   | Aceptada       |
| `internal_conditioning`| BOOLEAN      | SÍ   | false    | —  | —                   | Acondicionamiento |
| `observations`         | TEXT         | SÍ   | —        | —  | —                   | Observaciones |
| `result`               | DECIMAL(12,2)| SÍ   | —        | —  | —                   | Resultado     |
| `work_order`           | UUID         | SÍ   | —        | —  | → `work_orders.id`  | Orden de trabajo |
| `height`               | DECIMAL(12,4)| SÍ   | —        | —  | —                   | Alto (mm)      |
| `width`                | DECIMAL(12,4)| SÍ   | —        | —  | —                   | Ancho          |
| `thickness`            | DECIMAL(12,4)| SÍ   | —        | —  | —                   | Espesor        |

**status:** PENDING, ANALYZED, REJECTED, SAVED, RETURNED.

---

## 6. Documentos de ensayos

### 6.1. `essays_documents`

Documentos (informes, PDFs) asociados a ensayos.

| Columna      | Tipo    | Nulo | Default | PK | FK                  | Descripción   |
|--------------|---------|------|---------|----|---------------------|---------------|
| `id`         | UUID    | NO   | UUIDv4  | SÍ | —                   | Identificador |
| `essay`      | UUID    | NO   | —       | SÍ | → `essays.id`       | Ensayo        |
| `type`       | INTEGER | NO   | —       | —  | → `types_documents.id`| Tipo documento |
| `copy`       | INTEGER | NO   | 0       | —  | —                   | Número de copia |
| `modificated`| BOOLEAN | NO   | false   | —  | —                   | Modificado    |
| `generated_at`| DATE   | NO   | NOW     | —  | —                   | Fecha generación |
| `file`      | STRING  | NO   | —       | —  | —                   | Ruta/archivo  |

Clave primaria compuesta en el modelo: (`id`, `essay`). En la práctica se usa `id` como PK y `essay` como FK.

---

### 6.2. `essay_document_snapshots`

Snapshots inmutables de documentos oficiales firmadas criptográficamente (RFC 8785) y certificadas con OpenTimestamps (OTS).

| Columna               | Tipo         | Nulo | Default        | PK | FK            | Descripción |
|-----------------------|--------------|------|----------------|----|---------------|-------------|
| `id`                  | UUID         | NO   | UUIDv4         | SÍ | —             | Identificador |
| `essay_id`            | UUID         | NO   | —              | —  | → `essays.id` | Ensayo |
| `document_type`       | STRING(32)   | NO   | —              | —  | —             | `F-PC13-01`, `F-PC13-02`, etc. |
| `version`             | INTEGER      | NO   | 1              | —  | —             | Versión secuencial por ensayo/tipo |
| `event_code`          | STRING(64)   | NO   | —              | —  | —             | Evento disparador |
| `snapshot_data`       | JSONB        | NO   | —              | —  | —             | Payload canónico estructurado |
| `canonical_hash`      | STRING(64)   | NO   | —              | —  | —             | Hash SHA-256 canónico (RFC 8785) |
| `signature`           | TEXT         | NO   | —              | —  | —             | Firma digital RSA / HMAC |
| `signature_algorithm` | STRING(32)   | NO   | 'HMAC-SHA256'  | —  | —             | Algoritmo de firma |
| `ots_status`          | STRING(24)   | NO   | 'PENDING'      | —  | —             | `PENDING`, `STAMPED`, `FAILED`, `SKIPPED` |
| `ots_proof`           | TEXT         | SÍ   | —              | —  | —             | Comprobante binario `.ots` en Base64 |
| `ots_calendar_url`    | STRING(255)  | SÍ   | —              | —  | —             | URL del calendario OpenTimestamps |
| `ots_stamped_at`      | DATE         | SÍ   | —              | —  | —             | Fecha cierta certificada |
| `ots_error`           | TEXT         | SÍ   | —              | —  | —             | Error de sellado (si falló) |
| `user_id`             | UUID         | SÍ   | —              | —  | → `users.id`  | Usuario autor |
| `session_id`          | STRING(64)   | SÍ   | —              | —  | —             | `sid` de sesión |
| `device_id`           | STRING(100)  | SÍ   | —              | —  | —             | ID de dispositivo |
| `device_fingerprint`  | STRING(128)  | SÍ   | —              | —  | —             | Huella del dispositivo |
| `client_name`         | STRING(120)  | SÍ   | —              | —  | —             | Navegador/SO legible |
| `ip_address`          | STRING(64)   | SÍ   | —              | —  | —             | IP de origen |
| `user_agent`          | STRING(512)  | SÍ   | —              | —  | —             | User-Agent |
| `created_at`          | DATE         | NO   | NOW            | —  | —             | Fecha de captura |

Índice único: (`essay_id`, `document_type`, `version`). Otros índices: `canonical_hash`, `ots_status`, `created_at`.

---

## 7. Seguridad, sesiones, verificaciones y credenciales

### 7.1. `user_sessions`

Sesiones activas vinculadas a los JWT (`sid`).

| Columna          | Tipo        | Nulo | Default | PK | FK                         | Descripción |
|------------------|-------------|------|---------|----|----------------------------|-------------|
| `id`             | UUID        | NO   | UUIDv4  | SÍ | —                          | `sid` de sesión |
| `user_id`        | UUID        | NO   | —       | —  | → `users.id` (CASCADE)     | Usuario |
| `ip_address`     | STRING(45)  | SÍ   | —       | —  | —                          | Dirección IP |
| `user_agent`     | TEXT        | SÍ   | —       | —  | —                          | User-Agent |
| `client_name`    | STRING(100) | SÍ   | —       | —  | —                          | Navegador y SO |
| `is_revoked`     | BOOLEAN     | NO   | false   | —  | —                          | Revocada manualmente |
| `created_at`     | DATE        | NO   | NOW     | —  | —                          | Inicio de sesión |
| `last_active_at` | DATE        | NO   | NOW     | —  | —                          | Última actividad |
| `expires_at`     | DATE        | NO   | —       | —  | —                          | Expiración (24h o 30d) |

---

### 7.2. `user_recovery_codes`

Códigos de recuperación de emergencia para 2FA (almacenados como hash SHA-256).

| Columna      | Tipo        | Nulo | Default | PK | FK                     | Descripción |
|--------------|-------------|------|---------|----|------------------------|-------------|
| `id`         | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `user_id`    | UUID        | NO   | —       | —  | → `users.id` (CASCADE) | Usuario |
| `code_hash`  | STRING(128) | NO   | —       | —  | —                      | Hash SHA-256 del código |
| `used`       | BOOLEAN     | NO   | false   | —  | —                      | Ya canjeado |
| `used_at`    | DATE        | SÍ   | —       | —  | —                      | Fecha de canje |
| `created_at` | DATE        | NO   | NOW     | —  | —                      | Fecha de generación |

---

### 7.3. `user_trusted_devices`

Dispositivos de confianza autorizados para omitir el desafío 2FA por 7 días.

| Columna              | Tipo        | Nulo | Default | PK | FK                     | Descripción |
|----------------------|-------------|------|---------|----|------------------------|-------------|
| `id`                 | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `user_id`            | UUID        | NO   | —       | —  | → `users.id` (CASCADE) | Usuario |
| `device_id`          | STRING(100) | NO   | —       | —  | —                      | ID persistente del cliente |
| `device_fingerprint` | STRING(128) | NO   | —       | —  | —                      | Huella SHA-256 del navegador |
| `device_name`        | STRING(100) | SÍ   | —       | —  | —                      | Nombre legible del equipo |
| `ip_address`         | STRING(45)  | SÍ   | —       | —  | —                      | IP registrada |
| `trusted_until`      | DATE        | NO   | —       | —  | —                      | Vigencia de confianza |
| `is_revoked`         | BOOLEAN     | NO   | false   | —  | —                      | Revocado |
| `last_used_at`       | DATE        | NO   | NOW     | —  | —                      | Último uso |
| `created_at`         | DATE        | NO   | NOW     | —  | —                      | Alta |

---

### 7.4. `email_verifications`

Registros efímeros para verificación de email, activación por invitación y OTPs de 2FA por correo.

| Columna         | Tipo        | Nulo | Default | PK | FK                     | Descripción |
|-----------------|-------------|------|---------|----|------------------------|-------------|
| `id`            | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `user_id`       | UUID        | SÍ   | —       | —  | → `users.id` (CASCADE) | Usuario (opcional) |
| `mail`          | STRING      | NO   | —       | —  | —                      | Correo destino |
| `otp_code_hash` | STRING(128) | NO   | —       | —  | —                      | Hash SHA-256 del OTP |
| `token_hash`    | STRING(128) | NO   | —       | —  | —                      | Hash SHA-256 del token (o prefijo `2fa_otp_`) |
| `expires_at`    | DATE        | NO   | —       | —  | —                      | Expiración |
| `verified_at`   | DATE        | SÍ   | —       | —  | —                      | Fecha de validación |
| `attempts`      | INTEGER     | NO   | 0       | —  | —                      | Intentos fallidos |
| `created_at`    | DATE        | NO   | NOW     | —  | —                      | Alta |

---

### 7.5. `password_resets`

Solicitudes temporales de restablecimiento de contraseña.

| Columna         | Tipo        | Nulo | Default | PK | FK                     | Descripción |
|-----------------|-------------|------|---------|----|------------------------|-------------|
| `id`            | UUID        | NO   | UUIDv4  | SÍ | —                      | Identificador |
| `user_id`       | UUID        | NO   | —       | —  | → `users.id` (CASCADE) | Usuario |
| `mail`          | STRING      | NO   | —       | —  | —                      | Correo destino |
| `otp_code_hash` | STRING(128) | NO   | —       | —  | —                      | Hash SHA-256 del OTP |
| `token_hash`    | STRING(128) | NO   | —       | —  | —                      | Hash SHA-256 del token de enlace |
| `expires_at`    | DATE        | NO   | —       | —  | —                      | Expiración (15 min) |
| `used_at`       | DATE        | SÍ   | —       | —  | —                      | Fecha de consumo |
| `attempts`      | INTEGER     | NO   | 0       | —  | —                      | Intentos fallidos |
| `created_at`    | DATE        | NO   | NOW     | —  | —                      | Alta |

---

### 7.6. `system_api_keys`

Credenciales de servicios externos cifradas con AES-256-GCM (o KMS Envelope Encryption).

| Columna        | Tipo        | Nulo | Default       | PK | FK | Descripción |
|----------------|-------------|------|---------------|----|----|-------------|
| `id`           | UUID        | NO   | UUIDv4        | SÍ | —  | Identificador |
| `service`      | STRING(50)  | NO   | —             | —  | —  | `MAILING`, `AFIP`, etc. |
| `provider`     | STRING(50)  | NO   | —             | —  | —  | `RESEND`, etc. |
| `name`         | STRING(100) | NO   | —             | —  | —  | Nombre descriptivo |
| `encrypted_key`| TEXT        | NO   | —             | —  | —  | Ciphertext en Base64 |
| `iv`           | STRING(64)  | NO   | —             | —  | —  | Vector de inicialización (Base64) |
| `tag`          | STRING(64)  | NO   | —             | —  | —  | Auth Tag GCM (Base64) |
| `key_version`  | STRING(20)  | NO   | 'v1'          | —  | —  | Versión de clave maestra |
| `algorithm`    | STRING(30)  | NO   | 'AES-256-GCM' | —  | —  | Algoritmo AEAD |
| `key_hint`     | STRING(30)  | SÍ   | —             | —  | —  | Máscara segura (ej. `re_...1234`) |
| `metadata`     | JSONB       | SÍ   | `{}`          | —  | —  | Configuración asociada (`fromEmail`, `notifyNewRequests`, etc.) |
| `envelope`     | JSONB       | SÍ   | —             | —  | —  | Metadata de Envelope Encryption (KMS) |
| `is_active`    | BOOLEAN     | NO   | true          | —  | —  | Clave activa |
| `created_at`   | DATE        | NO   | NOW           | —  | —  | Alta |
| `updated_at`   | DATE        | NO   | NOW           | —  | —  | Última modificación |

---

### 7.7. `security_audit_logs`

Bitácora inmutable (append-only, protegida en PostgreSQL por trigger `trg_security_audit_logs_immutable`) de eventos de seguridad.

| Columna              | Tipo        | Nulo | Default   | PK | FK | Descripción |
|----------------------|-------------|------|-----------|----|----|-------------|
| `id`                 | UUID        | NO   | UUIDv4    | SÍ | —  | Identificador |
| `request_id`         | STRING(64)  | SÍ   | —         | —  | —  | `X-Request-Id` de correlación |
| `user_id`            | UUID        | SÍ   | —         | —  | —  | Actor (si está autenticado) |
| `session_id`         | STRING(64)  | SÍ   | —         | —  | —  | `sid` de sesión |
| `action`             | STRING(80)  | NO   | —         | —  | —  | Acción auditada (`AUTH_LOGIN`, `ACCESS_FORBIDDEN`, etc.) |
| `resource`           | STRING(80)  | NO   | —         | —  | —  | Recurso afectado |
| `resource_id`        | STRING(128) | SÍ   | —         | —  | —  | ID del recurso |
| `outcome`            | STRING(24)  | NO   | 'SUCCESS' | —  | —  | `SUCCESS`, `FAILURE`, `DENIED` |
| `ip_address`         | STRING(64)  | SÍ   | —         | —  | —  | IP de origen |
| `user_agent`         | STRING(512) | SÍ   | —         | —  | —  | User-Agent |
| `client_name`        | STRING(120) | SÍ   | —         | —  | —  | Navegador/SO |
| `device_id`          | STRING(100) | SÍ   | —         | —  | —  | ID de dispositivo |
| `device_fingerprint` | STRING(128) | SÍ   | —         | —  | —  | Huella digital |
| `record_hash`        | STRING(64)  | SÍ   | —         | —  | —  | Hash SHA-256 canónico del registro |
| `signature`          | TEXT        | SÍ   | —         | —  | —  | Firma criptográfica del registro |
| `previous_hash`      | STRING(64)  | SÍ   | —         | —  | —  | Hash del registro previo |
| `metadata`           | JSONB       | SÍ   | —         | —  | —  | Contexto extra (secretos redactados) |
| `created_at`         | DATE        | NO   | NOW       | —  | —  | Fecha/hora del evento |

---

## 8. Diagrama de relaciones (resumen)

```mermaid
flowchart LR
    subgraph CAT["Catálogos y Config"]
        TC["types_countries"]
        TD["types_districts"]
        TDOC["types_documents"]
        TE["types_essays"]
        ENV["environment_variables<br/>daily_sequence_counters"]
        TD -->|country| TC
    end

    subgraph USR["Usuarios, Laboratorio y Seguridad"]
        U["users"]
        LAB["laboratories"]
        LM["laboratories_members /<br/>laboratory_members"]
        LP["laboratory_permissions"]
        SEC["user_sessions · user_recovery_codes<br/>user_trusted_devices · email_verifications<br/>password_resets"]
        SYS["system_api_keys · security_audit_logs"]
        LAB -->|administrator| U
        U -->|laboratory| LAB
        LM -->|user / laboratory| U
        LM --> LAB
        LP -->|member| LM
        SEC -->|user_id| U
    end

    subgraph CLI["Empresas, Clientes y Personas"]
        B["bussiness"]
        BA["bussiness_address"]
        P["persons"]
        C["clients"]
        CC["clients_contacts"]
        BA -->|cuit / user / district| B
        BA --> TD
        P -->|user_id / country / district| U
        P --> TC
        P --> TD
        C -->|cuit / address / user| B
        C --> BA
        C -->|representative / contact| P
        CC -->|client / contact| C
        CC --> P
    end

    subgraph ENS["Ensayos, Órdenes, Muestras y Documentos"]
        E["essays"]
        EE["essays_elements ·<br/>essay_element_templates"]
        ET["essays_terms · essays_billing"]
        EC["essays_client (snapshot)"]
        WO["work_orders"]
        S["samples"]
        ED["essays_documents"]
        EDS["essay_document_snapshots"]
        AL["essay_audit_logs ·<br/>work_order_audit_logs"]

        E -->|client / contact / lab / type| C
        E --> P
        E --> LAB
        E --> TE
        EE -->|essay / country / user| E
        ET -->|essay| E
        EC -->|essay / cuit / rep / contact| E
        WO -->|essay_id| E
        S -->|essay / work_order| E
        S --> WO
        ED -->|essay / type| E
        ED --> TDOC
        EDS -->|essay_id / user_id| E
        EDS --> U
        AL -->|essay / work_order / user| E
        AL --> WO
        AL --> U
    end
```

---

## 9. Total de tablas

**34 tablas** en total:

- Catálogos: `types_countries`, `types_districts`, `types_documents`, `types_essays`
- Config y secuencias: `environment_variables`, `daily_sequence_counters`
- Usuarios y labs: `users`, `laboratories`, `laboratories_members` / `laboratory_members`, `laboratory_permissions`
- Seguridad y sesiones: `user_sessions`, `user_recovery_codes`, `user_trusted_devices`, `email_verifications`, `password_resets`, `system_api_keys`, `security_audit_logs`
- Clientes: `bussiness`, `bussiness_address`, `persons`, `clients`, `clients_contacts`
- Ensayos: `essays`, `essays_elements`, `essays_terms`, `essays_billing`, `essays_client`, `essay_element_templates`, `essay_audit_logs`
- Órdenes y muestras: `work_orders`, `work_order_audit_logs`, `samples`
- Documentos y snapshots: `essays_documents`, `essay_document_snapshots`

---

## 10. Diagnóstico de Redundancias, Coherencia y Normalización (`Módulo III.pdf`)

Previo a la implementación de migraciones físicas en PostgreSQL, se realizó una auditoría estructural de normalización y coherencia relacional sobre las 34 tablas del esquema:

### 10.1. Cumplimiento de Formas Normales (1FN, 2FN y 3FN)
- **Primera Forma Normal (1FN):** Todos los atributos almacenan valores atómicos en columnas tipadas. Los arreglos repetitivos se separaron en tablas hijas relacionales (`essays_elements` para ítems solicitados, `samples` para unidades físicas recibidas, `clients_contacts` para múltiples contactos adicionales y `laboratory_permissions` para permisos por miembro). En casos puntuales de mediciones seriadas analíticas variables (`samples.result` en `JSONB`) o metadata de auditoría (`security_audit_logs.metadata`), se utiliza `JSONB` estructurado y validado por DTO/dominio.
- **Segunda Forma Normal (2FN):** Todas las entidades con claves compuestas (`laboratories_members`, `clients_contacts`, `daily_sequence_counters`) dependen funcionalmente de la totalidad de su clave primaria (por ejemplo, `daily_sequence_counters` almacena `last_value` dependiente de `(scope, date_key)`).
- **Tercera Forma Normal (3FN):** Se eliminaron dependencias transitivas separando catálogos reutilizables (`types_countries`, `types_districts`, `types_documents`, `types_essays`) y normalizando los datos maestros de empresas (`bussiness`) y domicilios (`bussiness_address`) de los perfiles comerciales (`clients`) y personas (`persons`).

### 10.2. Redundancias Detectadas y Decisiones de Diseño Controlado

| Hallazgo analizado | Decisión técnica adoptada | Justificación de negocio / integridad |
| :--- | :--- | :--- |
| **`essays_client` duplica campos de `clients`, `bussiness`, `bussiness_address` y `persons`** | **Desnormalización histórica controlada (Snapshot)** | Regla de negocio `RN04`: si un cliente cambia razón social, domicilio o representante meses después de emitir un informe oficial, los ensayos antiguos **no deben alterarse retrospectivamente**. `essays_client` congela el estado vigente al momento de la solicitud. |
| **`essay_document_snapshots` almacena `payload_json` completo además de tablas normalizadas** | **Desnormalización probatoria para firma RSA/OTS** | Para garantizar verificación criptográfica determinista (`CanonicalJson` RFC 8785 + `RSA-SHA256` + OpenTimestamps) a lo largo del tiempo independientemente de futuras migraciones de columnas, el snapshot guarda el payload exacto firmado. |
| **`essays_billing` vs columnas `billing_*` en `clients`** | **Consolidación y depuración** | Las tablas de configuración comercial heredaron `billing_*` directamente en `clients` / `essays_client` para simplificar facturación alternativa opcional sin generar filas vacías innecesarias. |
| **Dualidad nominal `laboratories_members` / `laboratory_members`** | **Compatibilidad de modelo y migración controlada** | La migración inicial creó `laboratories_members` y el modelo operativo `members.js` referencia `laboratory_members`; documentado para mantener coherencia en migraciones posteriores. |
| **Prevención de campos derivados inconsistentes en muestras** | **Cálculo centralizado en dominio** | `samples.average_value` se recalcula automáticamente dentro de la entidad `Sample.setResult(...)` en transacción al recibir `samples.result`, evitando discrepancias entre valores individuales y promedio. |

---

## 11. Comandos de Migraciones y Seedeo de Datos Base

El esquema físico completo (34 tablas en PostgreSQL) se crea y evoluciona mediante Umzug (`SequelizeMeta`) y se inicializa de forma global o granular con los siguientes comandos en español:

### 11.1. Migraciones
- `npm run migrate` (o `npm run migrate:up`): ejecuta todas las migraciones pendientes.
- `npm run migrate:status`: muestra el estado actual de migraciones aplicadas y pendientes.
- `npm run migrate:down`: revierte la última migración aplicada.
- `npm run migrate:undo`: revierte todas las migraciones ejecutadas.

### 11.2. Seedeo global, granular y restablecimiento de contraseñas
- `npm run seed`: ejecuta el seedeo completo (249 países ISO 3166-1 alpha-2 en `types_countries`, 24 provincias/jurisdicciones argentinas en `types_districts`, tipo de ensayo de formaldehído según IT17-01 en `types_essays`, 5 documentos en `types_documents`, datos ficticios de laboratorio en `environment_variables` y `laboratories`, cuenta Admin de Laboratorio y cuenta de Cliente demo).
- Seedeo granular por módulo:
  - `npm run seed:countries` (`--countries`): solo países.
  - `npm run seed:provinces` (`--provinces`): solo provincias argentinas.
  - `npm run seed:essay-types` (`--essay-types`): solo tipo de ensayo de formaldehído.
  - `npm run seed:lab` (`--lab` / opcional `--overwrite-lab`): solo datos ficticios de laboratorio.
  - `npm run seed:users` (`--users`, o `--admin` / `--client`): solo cuentas de usuario.
- Restablecimiento de contraseñas si los usuarios ya están creados:
  - `npm run seed:reset-passwords`: actualiza el hash bcrypt de las cuentas base existentes sin duplicar registros.
  - `npm run create-user -- --mail <email> --password <clave> --reset-password`: crea o restablece la contraseña de un usuario específico.

---

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md -->

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

---

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md -->

# Seguridad, permisos y auditoria

Este documento describe como se protege la API, que permisos se aplican por recurso, cuales son los requisitos de acceso y como funciona la auditoria de acciones.

## 1) Modelo de seguridad actual

### 1.1 Autenticacion

- La API usa JWT en header `Authorization: Bearer <token>`.
- Middleware principal: `src/presentation/middlewares/jwt.verify.js`.
- Validaciones actuales:
  - Rechaza requests sin token (`401`).
  - Rechaza formato de header invalido (`401`).
  - Verifica firma JWT (`JWT_SECRET`).
  - Rechaza payloads sin `id` de usuario (`403`).
  - Rechaza tokens validos de usuarios inexistentes (`403`).
- Si el token es valido, inyecta usuario en `req.user` y `req.context.user`.

### 1.2 Autorizacion por perfil

- Middleware de autorizacion por rol: `src/presentation/middlewares/requireLaboratory.js`.
- Regla:
  - Solo usuarios con `profile === 'LABORATORY'` acceden a recursos protegidos por este middleware.
- Respuesta por denegacion:
  - `403` con mensaje funcional.

## 2) Requisitos para acceder a un recurso

## 2.1 Requisitos generales

Para cualquier endpoint privado:

1. Enviar token JWT valido.
2. Usuario asociado al token debe existir.
3. Cumplir reglas adicionales del endpoint (rol, ownership o estado de negocio).

## 2.2 Matriz de acceso por modulo

- `/auth/*`
  - `login/register/logout/refresh_token`: publico.
  - `neon/ensure-user`: requiere JWT.
- `/users/*`: requiere JWT.
- `/clients/*`: requiere JWT.
  - `/clients/scheduled*`: requiere JWT + `LABORATORY`.
- `/bussiness/*`: requiere JWT.
- `/persons/*`: requiere JWT.
- `/env/*`: requiere JWT.
- `/types/*`: requiere JWT.
- `/essays/*`: requiere JWT.
  - Algunas reglas de negocio restringen operaciones al laboratorio (validado en servicios).
  - `/essays/debug/generate-document`: requiere JWT + `LABORATORY`.
- `/samples/*`: requiere JWT + `LABORATORY`.
- `/api-docs`: requiere JWT + `LABORATORY`.

## 2.3 Requisitos por tipo de operacion sensible

- Descarga de documentos:
  - Requiere JWT.
  - El servicio de documentos aplica control por usuario/perfil al resolver el archivo.
- Operaciones de laboratorio (muestras/ordenes):
  - Requieren `LABORATORY` por middleware y validaciones de servicio.
- Operaciones multi-tenant por usuario cliente:
  - Se filtran por `user.id` y/origen en repositorios (ej. direcciones/clientes en contexto CLIENT).

## 3) Sistema de permisos implementado

## 3.1 Capa HTTP (Express)

- El primer control se aplica en `app.js` usando middlewares por prefijo de ruta.
- Se minimiza exposicion publica: solo `auth` se expone sin JWT.

## 3.2 Capa aplicacion/servicio

- Servicios agregan controles por perfil en reglas de negocio.
- Ejemplos:
  - Acceso a ordenes de trabajo y muestras restringido a laboratorio.
  - Filtros de visibilidad para clientes segun usuario autenticado.

## 3.3 Capa repositorio/datos

- Algunos repositorios filtran por origen y usuario (`CLIENT`, `LABORATORY`, `PUBLIC`) para limitar lectura/escritura al ambito permitido.

## 4) Auditoria: como se registra y que cubre

## 4.1 Auditoria de ensayos

- Servicio: `EssayAuditLogApplicationService`.
- Tabla: `essay_audit_logs`.
- Datos registrados:
  - `essayId`, `userId`, `userName`, `eventCode`, `timestamp`, `metadata`.
- Uso:
  - Eventos de ciclo de vida del ensayo.
  - Consulta por ensayo via endpoint de auditoria.

## 4.2 Auditoria de ordenes de trabajo

- Servicio: `EssayAuditLogApplicationService.logWorkOrderEvent(...)`.
- Tabla: `work_order_audit_logs`.
- Datos registrados:
  - `workOrderId`, `userId`, `userName`, `eventCode`, `timestamp`, `metadata`.
- Uso:
  - Recepcion de muestras, carga de resultados, cierre/emision y eventos operativos de orden.

## 4.3 Trazabilidad temporal

- Al registrar eventos, se actualiza `last_update` de ensayo/orden cuando corresponde.
- Esto permite identificar actividad reciente por entidad.

## 5) Falencias detectadas y refuerzos aplicados

## 5.1 Refuerzos aplicados en este cambio

- Se reforzo `jwt.verify`:
  - Validacion estricta de formato `Bearer`.
  - Manejo explicito de payload JWT sin `id` (evita requests colgadas).
- Se endurecio endpoint de debug:
  - `/essays/debug/generate-document` ahora solo `LABORATORY`.
- Se incorporo rate limiting en endpoints sensibles:
  - `POST /auth/login`
  - `POST /auth/refresh_token`
  - `GET /essays/download-document`
  - `GET /essays/download-document-by-type`
- Se estandarizo respuesta de seguridad:
  - Formato comun `{ code, message }` para errores de auth/autz y limites.
- Se agrego auditoria de denegaciones:
  - Log estructurado para respuestas 401/403/429 en middlewares y auth.

## 5.2 Riesgos a reforzar (pendientes recomendados)

1. Rotacion y expiracion de secretos/tokens:
   - Definir politica operativa de rotacion de `JWT_SECRET` y TTL.
2. Control de privilegios por accion en endpoints mixtos:
   - Revisar endpoints de `essays` para separar mejor acciones de cliente vs laboratorio donde aplique.
3. Persistencia de eventos de seguridad:
   - Actualmente los denegados se registran en logs; recomendado centralizarlos en tabla/event pipeline SIEM.

## 6) Checklist rapido de cumplimiento operativo

- JWT obligatorio en recursos privados.
- Rol laboratorio aplicado en recursos operativos y documentacion Swagger.
- Auditoria habilitada en ensayos y ordenes de trabajo.
- Endpoint de debug restringido.
- Validacion de token endurecida.

---

<!-- Fuente: docs/03-modulo-iii-arquitectura-y-planificacion/06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md -->

# Politicas operativas del sistema

Este documento define politicas operativas para mantener continuidad, seguridad y calidad en `gestion.ctmueble.com.ar`.

## 1) Objetivo y alcance

- Estandarizar como operar, actualizar y evolucionar el sistema.
- Cubrir componentes de API, autenticacion, base de datos, migraciones y contratos de integracion.
- Aplicable a ambientes de desarrollo, staging y produccion.

## 2) Ambientes y configuracion base

- **Desarrollo local:** uso de variables locales y ejecucion por `start`.
- **Staging:** replica funcional de produccion para validacion previa.
- **Produccion:** ambiente final, con cambios controlados por PR y despliegue auditado.

Reglas:

- Ningun secreto debe hardcodearse en codigo fuente.
- Cada ambiente debe tener variables separadas.
- El principio es "same code, different config".

## 3) Politica de secretos y credenciales

## 3.1 Secretos incluidos

- `JWT_SECRET`
- `DATABASE_URL`
- credenciales de almacenamiento/documentos
- claves de servicios externos (Neon, certificados ARCA/AFIP solo si se habilita el autocompletado opcional de clientes, etc.)

## 3.2 Rotacion de secretos

Frecuencia minima recomendada:

- **Criticos (JWT, DB, storage):** cada 90 dias.
- **Integraciones externas:** cada 90 a 180 dias segun proveedor.
- **Rotacion extraordinaria:** inmediata ante incidente o sospecha.

Procedimiento de rotacion:

1. Crear secreto nuevo en vault/proveedor.
2. Configurarlo en staging y validar.
3. Desplegar a produccion en ventana controlada.
4. Validar login, lectura/escritura DB y descargas de documentos.
5. Revocar secreto anterior.
6. Registrar evento en bitacora operativa.

Controles:

- Nunca compartir secretos por chat/email.
- Nunca subir `.env` al repositorio.
- Limitar acceso por rol a secretos de produccion.

## 3.3 Politica de expiracion y versionado

- Mantener fecha de emision/rotacion por secreto.
- Mantener un identificador de version del secreto (interno).
- Permitir solape corto durante rotacion para evitar corte de servicio.

## 4) Politica de actualizaciones del sistema

## 4.1 Tipos de cambio

- **Hotfix:** correccion urgente de produccion.
- **Cambio normal:** mejoras funcionales o tecnicas no urgentes.
- **Cambio mayor:** cambios con impacto de contrato/API o datos.

## 4.2 Flujo operativo de actualizacion

1. Definir alcance y riesgo del cambio.
2. Implementar en rama corta (`feat/*`, `fix/*`, `chore/*`).
3. Abrir PR con resumen tecnico y plan de prueba.
4. Validar en staging (funcional + seguridad + migraciones si aplica).
5. Aprobar y desplegar en ventana definida.
6. Monitorear KPIs tecnicos (errores 5xx, latencia, auth failures).
7. Confirmar cierre de cambio.

## 4.3 Ventanas y congelamiento

- Evitar despliegues fuera de horario operativo del equipo.
- Definir periodos de congelamiento para fechas criticas del negocio.
- Cambios mayores requieren ventana y plan de rollback explicito.

## 5) Politica de contratos

## 5.1 Contratos de API

Reglas:

- El contrato publicado en Swagger es fuente oficial.
- Mantener compatibilidad hacia atras siempre que sea posible.
- Si una respuesta cambia estructura, debe considerarse cambio mayor.

Buenas practicas:

- Versionar endpoints cuando haya breaking changes.
- No eliminar campos de respuesta sin periodo de deprecacion.
- Estandarizar errores en formato `{ code, message }`.

## 5.2 Contratos de datos (base de datos)

- Tablas y columnas productivas son contratos de persistencia.
- Cambios destructivos requieren estrategia de transicion.
- Migrations deben ser idempotentes y revertibles cuando sea viable.

Regla de compatibilidad:

- Primero desplegar codigo compatible con esquema viejo + nuevo.
- Luego migrar datos/esquema.
- Por ultimo remover legado en iteracion posterior.

## 5.3 Contratos de documentos y reportes

- Plantillas y tipos documentales usados por clientes/laboratorio se tratan como contrato funcional.
- Cambios de formato visible deben validarse con negocio antes de publicar.

## 6) Politica de migraciones

## 6.1 Reglas de diseno

- Una migracion por cambio cohesivo.
- Sin logica de negocio compleja dentro de migraciones.
- Evitar bloqueos largos de tablas en horario productivo.
- Incluir validaciones previas cuando se agregan constraints.

## 6.2 Ejecucion de migraciones

Scripts disponibles:

- `npm run migrate`
- `npm run migrate:up`
- `npm run migrate:down`
- `npm run migrate:undo`

Procedimiento:

1. Backup o punto de recuperacion de DB.
2. Ejecutar en staging y validar.
3. Ejecutar en produccion en ventana controlada.
4. Verificar integridad y consultas criticas.

## 6.3 Cambios de riesgo alto

Incluyen:

- renombrado/eliminacion de columnas
- cambios de tipo no compatibles
- constraints nuevas sobre datos historicos

Requieren:

- plan de backfill
- plan de rollback
- validacion con dataset representativo en staging

## 7) Politica de despliegue y rollback

## 7.1 Criterios de despliegue seguro

- PR aprobado.
- Swagger actualizado cuando cambia API.
- Migraciones revisadas si hay cambio de esquema.
- Checklist de seguridad completado.

## 7.2 Rollback

Debe existir antes de desplegar:

- version previa identificada
- paso de rollback de aplicacion
- paso de rollback de migracion (o mitigacion si no es reversible)
- criterio de corte (cuando abortar despliegue)

## 8) Politica de auditoria operativa

- Registrar en bitacora:
  - fecha/hora
  - responsable
  - cambio aplicado
  - ambiente afectado
  - resultado y observaciones
- Registrar incidentes y postmortem en caso de falla.

## 9) Politica de seguridad en operacion diaria

- Minimo privilegio para accesos de infraestructura.
- Revisión periodica de usuarios con acceso administrativo.
- Monitoreo de eventos 401/403/429 y errores 5xx.
- Revisión mensual de dependencias y riesgos conocidos.

## 10) Checklist operativo previo a liberar

- [ ] Cambios revisados y aprobados.
- [ ] Impacto en API evaluado y documentado.
- [ ] Migraciones validadas en staging.
- [ ] Secretos y variables verificados por ambiente.
- [ ] Plan de rollback definido.
- [ ] Monitoreo post-deploy acordado.

## 11) Control de cambios del documento

- Version: 1.0
- Estado: Activo
- Ultima actualizacion: 2026-04-28
- Responsable: Equipo de desarrollo/operaciones

---

# Módulo IV — Desarrollo, Implementación y Validación del Sistema

> Entorno DDD, desarrollo incremental, incidencias, seguridad 2FA/cookies/CSRF, permisos, cifrado KMS, ARCA, ensayos/OT/muestras, PDF, emails, integridad RSA/OTS, contratos HTTP, middlewares y tests.

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md -->

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

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md -->

# Documentación de Seguridad, Autenticación, 2FA y Gestión de Sesiones

> **Centro Tecnológico del Mueble (CTM) - Oficina Virtual & Gestión**  
> **Fecha de actualización:** 12 de Noviembre de 2026  
> **Ámbito:** Backend (`gestion.ctmueble.com.ar`) y Frontend (`oficina.ctmueble.com.ar`)  
> **Estado:** Implementado, verificado y en producción

---

## 1. Resumen Ejecutivo y Objetivos

Esta documentación detalla la arquitectura, modelos de datos, flujos de seguridad y contratos de API implementados para la gestión integral de cuentas de usuario, doble factor de autenticación (2FA), dispositivos de confianza, códigos de recuperación de emergencia y administración de sesiones activas.

### Principales capacidades implementadas:
1. **Panel Centralizado de Configuración de Cuenta:** Accesible desde el menú de usuario del encabezado (removido del menú lateral para preservar la jerarquía visual).
2. **Seguridad y Autenticación Multifactor (2FA):**
   * Compatibilidad dual: **Google Authenticator / TOTP** (RFC 6238) y **OTP por Correo Electrónico**.
   * Gestión de activación, confirmación mediante código de prueba y desactivación protegida con validación de contraseña actual.
3. **Códigos de Recuperación de Emergencia (Códigos de Confianza):**
   * Lote de 8 códigos de respaldo generados en formato alfanumérico agrupado (`XXXX-XXXX`).
   * Almacenamiento con hash criptográfico unidireccional (SHA-256).
   * Uso único estricto (invalidación inmediata tras el primer canje exitoso).
   * Interfaz de entrega con descarga en archivo `.txt` y copia en un clic.
   * Flujo de acceso alternativo en el inicio de sesión si se extravía el dispositivo 2FA.
4. **Dispositivos de Confianza (Bypass de 2FA por 7 días):**
   * Identificación determinística del equipo mediante **fingerprinting no invasivo** en el cliente.
   * Validación automática en el login: si el dispositivo está reconocido y dentro del periodo de 7 días, se omite el desafío de 2FA.
   * Sección de visualización, auditoría y revocación de equipos en el panel de cuenta.
   * Revocación automática preventiva al cambiar contraseña o deshabilitar 2FA.
5. **Auditoría y Gestión de Sesiones Activas:**
   * Registro en base de datos (`user_sessions`) vinculado a la familia de tokens JWT (`sid`).
   * Detección de cliente, sistema operativo, dirección IP y última actividad.
   * Posibilidad de revocar sesiones remotas individuales o todas las demás sesiones en bloque.
   * Revocación atómica al cerrar sesión (`logout`).
6. **Persistencia de Sesión («No cerrar sesión» / Remember Me):**
   * Si está activo: Cookies persistentes por **30 días** y expiración de sesión en DB a 30 días.
   * Si está inactivo: **Session Cookies** (sin `maxAge`), eliminadas automáticamente por el navegador al cerrarse.
7. **Renovación Silenciosa e Ininterrumpida de Tokens (Proactive & Reactive Refresh):**
   * **Proactiva:** Temporizador de fondo que renueva el access token cada 9 minutos mientras el usuario navega la aplicación.
   * **Reactiva:** Interceptor 401 en Axios con cola de serialización (`failedQueue`) e instancia desacoplada (`rawAxios`) para reintentar peticiones transparentemente y sin errores visuales.

---

## 2. Modelado de Base de Datos y Migraciones

Se ejecutaron dos migraciones estructuradas mediante Umzug / Sequelize sobre PostgreSQL (Neon):

### Migración 1: `20261112000000-add-user-2fa-and-sessions.js`
1. **Campos incorporados a la tabla `users`:**
   * `two_factor_enabled` (`BOOLEAN`, default `false`).
   * `two_factor_method` (`VARCHAR(20)`, default `'NONE'`; valores: `'NONE'`, `'TOTP'`, `'EMAIL'`).
   * `two_factor_secret` (`TEXT`, nullable): Secreto Base32 para TOTP (protegido en scopes Sequelize `withTwoFactorSecret`).
   * `two_factor_temp_secret` (`TEXT`, nullable): Secreto provisorio durante el proceso de vinculación.
   * `two_factor_confirmed_at` (`TIMESTAMP WITH TIME ZONE`, nullable).
2. **Creación de la tabla `user_sessions`:**
   * `id` (`VARCHAR(64)` PRIMARY KEY): Identificador de familia de sesión (`sid` del JWT).
   * `user_id` (`UUID` NOT NULL, FK -> `users.id` ON DELETE CASCADE).
   * `ip_address` (`VARCHAR(45)`): Dirección IPv4 o IPv6 del cliente.
   * `user_agent` (`TEXT`): User-Agent crudo de la conexión.
   * `client_name` (`VARCHAR(100)`): Nombre legible generado por el parser (ej: `Chrome en Windows 10`).
   * `is_revoked` (`BOOLEAN`, default `false`).
   * `created_at` (`TIMESTAMP WITH TIME ZONE`).
   * `last_active_at` (`TIMESTAMP WITH TIME ZONE`).
   * `expires_at` (`TIMESTAMP WITH TIME ZONE`).
   * *Índices:* `idx_user_sessions_user_id`, `idx_user_sessions_lookup (user_id, is_revoked, expires_at)`.

### Migración 2: `20261112010000-add-recovery-codes-and-trusted-devices.js`
1. **Creación de la tabla `user_recovery_codes`:**
   * `id` (`UUID` PRIMARY KEY, default `gen_random_uuid()`).
   * `user_id` (`UUID` NOT NULL, FK -> `users.id` ON DELETE CASCADE).
   * `code_hash` (`VARCHAR(64)` NOT NULL): Hash SHA-256 del código alfanumérico.
   * `used` (`BOOLEAN`, default `false`).
   * `used_at` (`TIMESTAMP WITH TIME ZONE`, nullable).
   * `created_at` (`TIMESTAMP WITH TIME ZONE`).
   * *Índices:* `idx_user_recovery_codes_user_unused (user_id, used)`.
2. **Creación de la tabla `user_trusted_devices`:**
   * `id` (`UUID` PRIMARY KEY, default `gen_random_uuid()`).
   * `user_id` (`UUID` NOT NULL, FK -> `users.id` ON DELETE CASCADE).
   * `device_id` (`VARCHAR(64)` NOT NULL): Identificador único de hardware/cliente.
   * `device_name` (`VARCHAR(100)`): Nombre legible del dispositivo.
   * `device_fingerprint` (`VARCHAR(64)` NOT NULL): Hash SHA-256 de los componentes del navegador.
   * `ip_address` (`VARCHAR(45)`).
   * `trusted_until` (`TIMESTAMP WITH TIME ZONE` NOT NULL): Fecha de expiración de la confianza (7 días).
   * `last_used_at` (`TIMESTAMP WITH TIME ZONE`).
   * `created_at` (`TIMESTAMP WITH TIME ZONE`).
   * *Índices:* `idx_user_trusted_devices_lookup (user_id, device_id, trusted_until)`.

---

## 3. Seguridad y Doble Factor de Autenticación (2FA)

### 3.1 Flujo de Configuración TOTP (Google Authenticator)
1. **Solicitud de Setup (`POST /users/2fa/totp/setup`):**
   * El servicio genera un secreto criptográfico Base32 de 20 bytes (`otplib`).
   * Se almacena temporalmente en `user.two_factor_temp_secret`.
   * Se genera una URL `otpauth://totp/CTM%20Oficina%20Virtual:<mail>?secret=...&issuer=CTM` y su respectivo código QR en formato Data URL.
2. **Confirmación y Activación (`POST /users/2fa/totp/confirm`):**
   * El usuario envía el código de 6 dígitos mostrado en su app autenticadora.
   * Se valida con tolerancia temporal contra el secreto temporal.
   * Si es válido, se promueve el secreto a `two_factor_secret`, se limpia `temp_secret` y se marca `two_factor_enabled = true`.
   * Se genera automáticamente un lote de 8 códigos de recuperación de emergencia y se devuelven en la respuesta.

### 3.2 Flujo de Configuración OTP por Correo
1. **Solicitud de Setup (`POST /users/2fa/email/setup`):**
   * Se genera un código numérico aleatorio de 6 dígitos con expiración de 10 minutos en memoria/Redis (`MailingService`).
   * Se despacha un correo HTML normalizado institucional con el código.
2. **Confirmación y Activación (`POST /users/2fa/email/confirm`):**
   * Se valida el código recibido por correo.
   * Si coincide, se marca `two_factor_method = 'EMAIL'` y `two_factor_enabled = true`.
   * Se genera automáticamente el lote de 8 códigos de recuperación de emergencia.

### 3.3 Desactivación Protegida (`POST /users/2fa/disable`)
* Requiere obligatoriamente que el usuario ingrese su contraseña actual.
* Si la contraseña es válida:
  * Se establece `two_factor_enabled = false` y `two_factor_method = 'NONE'`.
  * Se eliminan los secretos TOTP.
  * Se revocan todos los dispositivos de confianza del usuario.
  * Se invalidan los códigos de recuperación restantes.

---

## 4. Códigos de Recuperación de Emergencia

### 4.1 Generación y Almacenamiento Seguro
* Cada código consiste en 8 caracteres hexadecimales/alfanuméricos agrupados (`XXXX-XXXX`).
* El backend nunca almacena los códigos en texto plano. Se calcula el hash SHA-256 de la versión normalizada:
  $$\text{Hash} = \text{SHA256}(\text{normalize}(\text{código}))$$
* La única oportunidad en que el usuario ve los códigos en claro es en el modal inmediato tras su generación.

### 4.2 Entrega al Usuario (Frontend)
* **Modal de visualización inmediata:** Grilla en dos columnas con fuentes monoespaciadas y contraste visual elevado.
* **Copia al portapapeles:** Copia los 8 códigos con un solo clic.
* **Descarga en archivo `.txt`:** Genera un archivo estándar descargable `CTM-codigos-recuperacion-<usuario>.txt` con saltos de línea `\r\n` compatibles con Windows y Unix.

### 4.3 Uso en Inicio de Sesión
* Ante el desafío de 2FA en el login, el usuario puede seleccionar *"¿Perdiste tu método 2FA? Usar un código de recuperación"*.
* Al enviar el código (`isRecoveryCode: true`), el backend verifica la existencia del hash con `used: false`.
* Si es válido, se marca `used: true`, `used_at = NOW()` y se emite la sesión de forma inmediata.

---

## 5. Dispositivos de Confianza (Bypass 2FA por 7 Días)

### 5.1 Estrategia de Fingerprinting de Cliente (`deviceFingerprint.js`)
Para identificar el equipo sin emplear permisos invasivos ni afectar la privacidad del usuario, se combinan atributos estables del entorno de ejecución:
1. `ctm_device_id`: Identificador persistente en `localStorage`.
2. `navigator.userAgent`: Cadena del navegador y motor.
3. `navigator.language` e idiomas preferidos.
4. `navigator.platform` y concurrencia de hardware (`hardwareConcurrency`).
5. `screen.width`, `screen.height`, `screen.colorDepth`.
6. Zona horaria del sistema (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
7. **Canvas 2D Hash:** Renderizado en memoria de un texto y figuras con sombras para capturar variaciones en rasterización GPU/font-rendering.

Todos estos componentes se concatenan y se hashean mediante la API Web Crypto (`crypto.subtle.digest('SHA-256')`).

### 5.2 Lógica de Verificación y Vigencia
* **En el Login:**
  * Si el usuario tiene 2FA activo, el backend consulta `user_trusted_devices` buscando coincidencias del `userId` y `device_id`.
  * Se verifica que `device_fingerprint` coincida y que `trusted_until > NOW()`.
  * Si es válido, **se omite el 2FA** y se inicia la sesión directamente.
* **Activación:** Durante el desafío de 2FA, la casilla `[x] Confiar en este dispositivo por 7 días` envía `trustDevice: true`. El backend registra o actualiza el equipo con:
  $$\text{trusted\_until} = \text{NOW}() + 7 \text{ días}$$
* **Revocación:** El usuario puede listar sus dispositivos de confianza y revocar el acceso a cualquiera de ellos (o a todos) desde la pestaña *Seguridad y Autenticación*.

---

## 6. Sesiones Activas y Política de Persistencia

### 6.1 Identificación y Seguimiento de Sesiones
* Cada login emite un par de tokens JWT que comparten un identificador de sesión único (`sid`, UUID v4).
* El middleware `verifyJWT` ejecuta un método ligero de amortiguación en memoria (`touchSession`) para actualizar `last_active_at` en base de datos cada 5 minutos de actividad real.
* La ruta `GET /users/sessions` lista todas las sesiones activas, marcando con la etiqueta *"Esta sesión actual"* aquella que coincide con el `sid` de la petición.

### 6.2 Revocación Total en Logout
* Al invocar `POST /auth/logout`, se decodifica el token de acceso o refresco (incluso si estuviese recién expirado) para extraer el `sid`.
* Se invoca `UserSessionService.getInstance().revokeSessionBySid(sid)`, marcando en base de datos `is_revoked = true`.
* Esto garantiza que, al volver a iniciar sesión, las sesiones cerradas **nunca vuelvan a mostrarse como activas**.

### 6.3 Opción «No cerrar sesión» (Remember Me)
Controla el ciclo de vida de las cookies HttpOnly emitidas:
* **Marcado (`rememberMe: true`):**
  * La cookie `ctm_rt` (refresh token) y `ctm_csrf` se configuran con `maxAge = 30 días`.
  * El registro en `user_sessions` tiene `expires_at = NOW() + 30 días`.
  * La sesión sobrevive al cierre y reapertura del navegador.
* **Desmarcado (`rememberMe: false`):**
  * Las cookies se emiten como **Session Cookies** (sin `maxAge` ni `expires`).
  * El navegador las destruye automáticamente al cerrarse.
  * La sesión en base de datos se limita a 24 horas.

---

## 7. Estrategia de Renovación Silenciosa (Refresh Tokens)

Para evitar interrupciones de uso o cierres intempestivos de sesión cuando expira el token de acceso (TTL de 15 minutos), se implementó un sistema de dos niveles:

```mermaid
flowchart TD
    ACT["Usuario activo en App"]

    subgraph N1["Nivel 1: Proactivo"]
        P1["Cada 9 min (antes de expirar 15 min):<br/>AuthService.refreshTokens()"]
        P2["Usa instancia rawAxios<br/>(sin interceptores circulares ni Bearer vencido)"]
        P3["Actualiza cookies<br/>ctm_at / ctm_rt / ctm_csrf"]
        P1 --> P2
        P1 --> P3
    end

    subgraph N2["Nivel 2: Reactivo"]
        R1["Si ocurre 401 en cualquier llamada:<br/>Interceptor en axios.js captura 401"]
        R2["Encola peticiones concurrentes (failedQueue)<br/>y reintenta originalRequest con cabecera nueva"]
        R1 --> R2
    end

    ACT --> P1
    ACT --> R1
```

1. **Nivel Proactivo ([AuthContext.jsx](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/context/AuthContext.jsx)):**
   * Mientras el usuario permanece en la plataforma, un temporizador en segundo plano renueva los tokens cada 9 minutos. El usuario nunca llega a experimentar un vencimiento de token en pleno trabajo.
2. **Nivel Reactivo ([axios.js](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/services/axios.js)):**
   * Si el usuario suspende su equipo o deja la pestaña inactiva por más de 15 minutos, la primera petición que recibe un 401 activa el interceptor.
   * Se utiliza una instancia desacoplada (`rawAxios`) que envía el refresh token sin inyectar cabeceras obsoletas.
   * Las peticiones en paralelo se detienen en la cola `failedQueue`.
   * Al completarse la renovación, se actualizan las cabeceras `Authorization: Bearer <newAccessToken>` de la petición original y de todas las encoladas, re-ejecutándolas de forma transparente.

---

## 8. Matriz de Endpoints y Contratos de API

| Método | Endpoint | Middleware / Seguridad | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Rate Limit, CSRF | Inicia sesión, valida huella de dispositivo y procesa `rememberMe`. |
| `POST` | `/auth/2fa/verify` | Rate Limit, CSRF | Completa login 2FA (código TOTP, email o recovery code). |
| `POST` | `/auth/2fa/resend` | Rate Limit | Reenvía código OTP por correo durante login 2FA. |
| `POST` | `/auth/refresh_token` | Rate Limit, CSRF | Renueva tokens access y refresh rotativos. |
| `POST` | `/auth/logout` | CSRF | Revoca la sesión en DB (`is_revoked = true`) y limpia cookies. |
| `GET` | `/auth/session` | `verifyJWT` | Valida validez de la sesión autenticada. |
| `POST` | `/users/change-password` | `verifyJWT`, CSRF | Modifica contraseña y revoca sesiones remotas. |
| `GET` | `/users/2fa/status` | `verifyJWT` | Consulta estado de 2FA y método activo. |
| `POST` | `/users/2fa/totp/setup` | `verifyJWT`, CSRF | Genera clave Base32 y QR para vincular Authenticator. |
| `POST` | `/users/2fa/totp/confirm`| `verifyJWT`, CSRF | Valida primer código TOTP y entrega códigos de recuperación. |
| `POST` | `/users/2fa/email/setup` | `verifyJWT`, CSRF | Envía código de prueba para activar OTP por mail. |
| `POST` | `/users/2fa/email/confirm`| `verifyJWT`, CSRF| Valida código de prueba y activa 2FA por mail. |
| `POST` | `/users/2fa/disable` | `verifyJWT`, CSRF | Desactiva 2FA previa validación de contraseña actual. |
| `GET` | `/users/2fa/recovery-codes` | `verifyJWT` | Consulta cantidad de códigos de emergencia disponibles. |
| `POST` | `/users/2fa/recovery-codes/generate` | `verifyJWT`, CSRF | Genera 8 nuevos códigos (invalida anteriores) con contraseña. |
| `GET` | `/users/trusted-devices` | `verifyJWT` | Lista dispositivos de confianza reconocidos. |
| `DELETE`| `/users/trusted-devices/:id`| `verifyJWT`, CSRF | Revoca la confianza de un dispositivo individual. |
| `DELETE`| `/users/trusted-devices/all`| `verifyJWT`, CSRF | Revoca todos los dispositivos de confianza. |
| `GET` | `/users/sessions` | `verifyJWT` | Lista sesiones activas del usuario. |
| `DELETE`| `/users/sessions/:id` | `verifyJWT`, CSRF | Revoca una sesión activa remota específica. |
| `DELETE`| `/users/sessions/other` | `verifyJWT`, CSRF | Revoca todas las demás sesiones remotas excepto la actual. |

---

## 9. Archivos Principales del Proyecto

### Backend (`gestion.ctmueble.com.ar`):
* `src/infrastructure/database/migrations/20261112000000-add-user-2fa-and-sessions.js`
* `src/infrastructure/database/migrations/20261112010000-add-recovery-codes-and-trusted-devices.js`
* `src/infrastructure/models/users/user_session.js`
* `src/infrastructure/models/users/user_recovery_code.js`
* `src/infrastructure/models/users/user_trusted_device.js`
* `src/infrastructure/auth/services/UserSessionService.js`
* `src/infrastructure/auth/services/RecoveryCodeService.js`
* `src/infrastructure/auth/services/TrustedDeviceService.js`
* `src/application/security/TwoFactorAuthService.js`
* `src/application/auth/services/AuthApplicationService.js`
* `src/application/users/services/UserAccountApplicationService.js`
* `src/presentation/controllers/auth.controller.js`
* `src/presentation/controllers/users.controller.js`
* `src/presentation/utils/authCookies.js`
* `tests/user_account_and_2fa.test.js`

### Frontend (`oficina.ctmueble.com.ar`):
* `src/pages/AccountSettings.jsx`: Vista completa con pestañas de *Seguridad y Autenticación* y *Sesiones Activas*.
* `src/pages/Login.jsx`: Flujo de inicio de sesión con Remember Me, 2FA, Trust Device y Recovery Codes.
* `src/services/AuthService.jsx`: Métodos de login, 2FA, refresh y logout con credenciales completas.
* `src/services/usersService.js`: Clientes de API para 2FA, dispositivos, códigos de emergencia y sesiones.
* `src/services/axios.js`: Instancia `rawAxios`, cola de reintentos y manejo de renovación transparente.
* `src/context/AuthContext.jsx`: Estado de autenticación y temporizador proactivo de fondo.
* `src/lib/deviceFingerprint.js`: Motor de huella digital criptográfica en navegador.
* `src/components/Header.jsx`: Enlace a Configuración de Cuenta y cierre de sesión.
* `src/components/Sidebar.jsx`: Navegación limpia de opciones no administrativas.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md -->

# Verificación de Correo Electrónico y Recuperación de Contraseña

Este documento detalla la arquitectura, las medidas de seguridad, el modelado de datos y los contratos de API de los subsistemas de **verificación de correo electrónico** (registro e invitaciones de laboratorio) y **restablecimiento de contraseña** implementados en `gestion.ctmueble.com.ar`.

---

## 1. Arquitectura General y Flujos

Ambos subsistemas comparten principios criptográficos comunes: generación de secretos de alta entropía en memoria, almacenamiento exclusivo de hashes **SHA-256**, comparación en tiempo constante (`crypto.timingSafeEqual`), expiración corta (**15 minutos**) y limitación de intentos (**5 intentos**).

```mermaid
flowchart TD
    subgraph EmailVerif["Verificación de Correo e Invitaciones"]
        V_Req["POST /auth/send-verification<br/>o Alta de Usuario Lab"] --> V_Chk{"¿Mailing<br/>configurado?"}
        V_Chk -- "No" --> V_Bypass["Bypass elegante<br/>mailingRequired: false, verified: true"]
        V_Chk -- "Sí" --> V_Gen["Generar OTP 6 dígitos<br/>+ Token hex 32 bytes"]
        V_Gen --> V_Hash["Guardar SHA-256 en<br/>email_verifications (TTL 15 min)"]
        V_Hash --> V_Mail["Enviar email vía Resend<br/>(MailingService)"]
        V_Mail --> V_Val["POST /auth/verify-otp<br/>o GET/POST /auth/verify-link"]
        V_Val --> V_Pwd{"¿Incluye<br/>newPassword?"}
        V_Pwd -- "Sí (invitación)" --> V_SetPwd["Validar 12-64 chars<br/>y guardar hash bcrypt(12)"]
        V_Pwd -- "No" --> V_Done["Marcar verified_at = NOW()"]
        V_SetPwd --> V_Done
    end

    subgraph PassReset["Recuperación de Contraseña"]
        R_Req["POST /auth/forgot-password"] --> R_User{"¿Usuario<br/>existe?"}
        R_User -- "No" --> R_GenResp["Respuesta genérica 200<br/>(Anti-enumeración)"]
        R_User -- "Sí" --> R_Gen["Generar OTP 6 dígitos<br/>+ resetToken 32 bytes"]
        R_Gen --> R_Hash["Guardar SHA-256 en<br/>password_resets (TTL 15 min)"]
        R_Hash --> R_Mail["Enviar email vía Resend"]
        R_Mail --> R_GenResp
        R_Mail --> R_Check["POST /auth/verify-reset-code<br/>(Pre-validación sin consumo)"]
        R_Mail --> R_Reset["POST /auth/reset-password"]
        R_Reset --> R_Save["Validar 12-64 chars, bcrypt(12)<br/>y marcar used_at = NOW()"]
        R_Save --> R_Revoke["Revocar todas las sesiones<br/>y dispositivos de confianza"]
    end
```

---

## 2. Verificación de Correo Electrónico (`EmailVerificationService`)

Implementado en [`src/application/security/EmailVerificationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/security/EmailVerificationService.js) y respaldado por el modelo Sequelize [`EmailVerification`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/models/security/email_verification.js) sobre la tabla `email_verifications`.

### 2.1. Funcionamiento Dual (OTP + Enlace Mágico)
Al invocar `initiateVerification({ mail, name, userId, frontendUrl })`:
1. **Validación de configuración de correo:** Se consulta `this.mailingService.isConfigured()`. Si no hay una API Key activa de `MAILING`, el servicio **no bloquea el flujo** (ideal para desarrollo local sin credenciales Resend) y devuelve `{ mailingRequired: false, verified: true }`.
2. **Generación de credenciales efímeras:**
   - **Código OTP de 6 dígitos:** `crypto.randomInt(100000, 1000000).toString()`.
   - **Token de enlace mágico:** `crypto.randomBytes(32).toString('hex')` (64 caracteres hexadecimales).
3. **Almacenamiento seguro:** Solo se persisten los hashes `SHA-256` (`otp_code_hash` y `token_hash`), con expiración de **15 minutos** (`expirationMinutes = 15`) y `attempts = 0`.
4. **Invalidación previa y aislamiento de 2FA:** Antes de insertar un nuevo registro, se eliminan las verificaciones pendientes (`verified_at: null`) del mismo correo, filtrando explícitamente `token_hash NOT LIKE '2fa_otp_%'` para no interferir con los códigos OTP de doble factor de autenticación que reutilizan la tabla con ese prefijo.
5. **Despacho de correo:** `MailingService.sendVerificationEmail(...)` envía la plantilla HTML institucional validando previamente `frontendUrl` con `resolveSafeFrontendUrl` para prevenir inyección de dominios externos.

### 2.2. Validación de OTP, Enlace y Activación de Invitaciones
- **`verifyOtp({ mail, otpCode, newPassword = null })`:**
  - Limpia caracteres no numéricos y exige exactamente 6 dígitos (`INVALID_OTP_FORMAT`).
  - Recupera el registro pendiente más reciente del correo (excluyendo prefijo `2fa_otp_%`).
  - Valida existencia (`NO_PENDING_VERIFICATION`), vigencia (`OTP_EXPIRED`) y límite de 5 intentos (`MAX_ATTEMPTS_EXCEEDED`).
  - Incrementa `attempts` en base de datos **antes** de comparar con `crypto.timingSafeEqual` (si falla devuelve `INVALID_OTP_CODE` indicando los intentos restantes).
- **`verifyLinkToken(token, mail, { newPassword = null } = {})`:**
  - Hashea el `token` recibido con `SHA-256` y busca coincidencia exacta con `verified_at: null` (y `mail` opcional).
  - Si no existe o ya se usó responde `INVALID_OR_USED_TOKEN`; si expiró responde `TOKEN_EXPIRED`.
- **Contraseña inicial en invitaciones (`_applyInvitationPasswordIfProvided`):**
  - Cuando un usuario interno del laboratorio recibe una invitación y activa su cuenta enviando `newPassword`, el servicio exige entre **12 y 64 caracteres** (`WEAK_PASSWORD`), genera el hash con `bcryptjs` (cost `12`) y actualiza la contraseña en `users` antes de marcar `verified_at = new Date()`.

---

## 3. Recuperación de Contraseña (`PasswordResetService`)

Implementado en [`src/application/security/PasswordResetService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/security/PasswordResetService.js) y respaldado por el modelo [`PasswordReset`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/models/security/password_reset.js) sobre la tabla `password_resets` (con FK `ON DELETE CASCADE` hacia `users.id` agregada en [`20261117120000-audit-remediation-fks-and-indexes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/migrations/20261117120000-audit-remediation-fks-and-indexes.js)).

### 3.1. Flujo y Controles de Seguridad
1. **Solicitud de restablecimiento (`requestPasswordReset({ mail, frontendUrl })`):**
   - Si el servicio de mailing no está configurado, rechaza con HTTP `503` (`MAILING_NOT_CONFIGURED`).
   - Valida el formato básico de email (`INVALID_EMAIL`, HTTP `400`).
   - **Anti-enumeración de cuentas:** Si el correo no pertenece a ningún usuario registrado, devuelve igualmente HTTP `200` con el mensaje genérico `"Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña."`.
   - Si el usuario existe, invalida solicitudes previas sin usar (`used_at: null`), genera un OTP de 6 dígitos y un `resetToken` de 32 bytes hex, almacena sus hashes `SHA-256` con TTL de **15 minutos**, y despacha el correo mediante `MailingService.sendPasswordResetEmail`.
2. **Pre-validación sin consumo (`verifyResetCode({ mail, otpCode, token })`):**
   - Permite que el frontend valide un código o enlace antes de mostrar el formulario de nueva contraseña, sin marcar `used_at`.
   - Exige `token` o el par (`mail`, `otpCode`) (`MISSING_RESET_CREDENTIALS`), verifica vigencia (`RESET_CODE_EXPIRED`), máximo de 5 intentos (`TOO_MANY_ATTEMPTS`, HTTP `429`), e incrementa `attempts` ante cualquier código/token incorrecto (`INVALID_RESET_CODE`).
3. **Restablecimiento y revocación global (`resetPassword({ mail, otpCode, token, newPassword })`):**
   - Valida que `newPassword` sea un string de entre **12 y 64 caracteres** (`WEAK_PASSWORD`, HTTP `400`).
   - Valida la credencial de reseteo y actualiza el password del usuario con `bcrypt` (cost `12`), marcando `used_at = new Date()`.
   - **Revocación automática post-reset:** Invoca `UserSessionService.getInstance().revokeOtherSessions(record.user_id, null)` y `TrustedDeviceService.getInstance().revokeAllDevices(record.user_id)` para invalidar de inmediato todas las sesiones activas y todos los dispositivos de confianza del usuario.
   - Tanto la solicitud (`AUTH_PASSWORD_RESET_REQUESTED`) como el cierre exitoso (`AUTH_PASSWORD_RESET_COMPLETED`) se registran en `security_audit_logs` con el correo enmascarado.

---

## 4. Endpoints y Modo de Uso (`/auth`)

Todas las rutas se montan bajo el prefijo `/auth` en [`src/presentation/routes/auth.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/auth.routes.js). Con excepción de `GET /auth/mailing-status`, todas están protegidas por `authVerificationLimiter` (**20 solicitudes cada 15 minutos por IP**).

| Método | Endpoint | Parámetros / Body | Respuesta OK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/auth/mailing-status` | — | `200` `{ "mailingRequired": boolean }` | Indica si el servicio de correo está activo y se requiere verificar email. |
| `POST` | `/auth/send-verification` | Body: `{ mail?, name?, frontendUrl? }` | `200` `{ mailingRequired, verified, mail?, expiresAt? }` | Envía OTP + enlace mágico de verificación. Si no se envía `mail`, toma `req.user?.mail`. |
| `POST` | `/auth/verify-otp` | Body: `{ mail?, otpCode, newPassword? }` | `200` `{ success: true, verified: true, mail, passwordUpdated }` | Valida OTP de 6 dígitos (y fija contraseña si es invitación). |
| `GET` | `/auth/verify-link` | Query: `token`, `mail?`, `newPassword?` | `200` `{ success: true, verified: true, mail, passwordUpdated }` | Verifica cuenta mediante enlace directo por query string. |
| `POST` | `/auth/verify-link` | Body: `{ token, mail?, newPassword? }` | `200` `{ success: true, verified: true, mail, passwordUpdated }` | Verifica cuenta mediante token en body (recomendado al enviar `newPassword`). |
| `POST` | `/auth/forgot-password` | Body: `{ mail, frontendUrl? }` | `200` `{ success: true, message }` | Inicia recuperación de contraseña sin revelar existencia de la cuenta. |
| `POST` | `/auth/verify-reset-code` | Body: `{ token }` o `{ mail, otpCode }` | `200` `{ valid: true, mail }` | Verifica validez del OTP o token sin consumirlo. |
| `POST` | `/auth/reset-password` | Body: `{ newPassword, token }` o `{ newPassword, mail, otpCode }` | `200` `{ success: true, message }` | Establece nueva contraseña, consume el token/OTP y revoca sesiones y dispositivos. |

### 4.1. Ejemplos de Payload

**Activar invitación o verificar correo por enlace (`POST /auth/verify-link`):**
```json
{
  "token": "9f8c...64-hex-chars",
  "mail": "tecnico@ctmueble.com.ar",
  "newPassword": "MiPasswordSegura2026!"
}
```

**Restablecer contraseña con OTP (`POST /auth/reset-password`):**
```json
{
  "mail": "usuario@empresa.com",
  "otpCode": "482915",
  "newPassword": "NuevaPasswordSegura2026!"
}
```

### 4.2. Códigos de Error Frecuentes

| Código | HTTP | Causa |
| :--- | :---: | :--- |
| `INVALID_OTP_FORMAT` | `400` | El código OTP no tiene exactamente 6 dígitos numéricos. |
| `NO_PENDING_VERIFICATION` | `400` | No existe verificación pendiente o ya fue utilizada. |
| `OTP_EXPIRED` / `TOKEN_EXPIRED` | `400` | Pasaron más de 15 minutos desde la emisión. |
| `MAX_ATTEMPTS_EXCEEDED` | `400` | Se alcanzaron los 5 intentos fallidos de verificación de email. |
| `INVALID_OTP_CODE` | `400` | OTP incorrecto (decrementa intentos restantes). |
| `INVALID_OR_USED_TOKEN` | `400` | El token del enlace mágico no existe o ya fue verificado. |
| `WEAK_PASSWORD` | `400` | La contraseña tiene menos de 12 o más de 64 caracteres. |
| `MISSING_RESET_CREDENTIALS` | `400` | Faltan `token` o el par `mail` + `otpCode`. |
| `INVALID_RESET_CODE` | `400` | Código o enlace de restablecimiento inexistente, usado o incorrecto. |
| `RESET_CODE_EXPIRED` | `400` | El código o enlace de reseteo superó los 15 minutos de vigencia. |
| `TOO_MANY_ATTEMPTS` | `429` | Se alcanzaron 5 intentos fallidos sobre el código de restablecimiento. |
| `MAILING_NOT_CONFIGURED` | `503` | No hay proveedor de correo configurado en `system_api_keys`. |
| `AUTH_VERIFY_RATE_LIMIT` | `429` | Se superó el límite de 20 peticiones cada 15 minutos por IP. |

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/04-INTEGRACION_REACT_COOKIES_Y_CSP.md -->

# Guía de Integración Frontend React (`oficina.ctmueble.com.ar`) — Cookies `HttpOnly`, CSRF y CSP

Esta guía detalla los ajustes requeridos en la SPA React (`https://oficina.ctmueble.com.ar`) para consumir el backend (`https://gestion.ctmueble.com.ar`) bajo el esquema endurecido de sesiones en producción, manteniendo retrocompatibilidad con `Authorization: Bearer` en entorno local (`NODE_ENV=development`).

---

## 1. Resumen del Modelo Dual de Sesiones

| Característica | Producción (`NODE_ENV=production`) | Desarrollo (`NODE_ENV=development`) |
|---|---|---|
| Transporte del Access Token | Cookie `ctm_at` (`HttpOnly; Secure; Path=/; Max-Age=900`) | Cookie `ctm_at` **y** `Authorization: Bearer` aceptado |
| Transporte del Refresh Token | Cookie `ctm_rt` (`HttpOnly; Secure; Path=/auth; Max-Age=604800`) | Cookie `ctm_rt` **y** `refresh_token` en JSON / body |
| Tokens crudos en JSON (`/auth/login`, `/auth/refresh_token`) | **Omitidos** (solo `user` y `csrf_token`) | Incluidos (`access_token`, `refresh_token`, `csrf_token`) |
| Protección CSRF en `POST` / `PUT` / `DELETE` | Obligatoria (`ctm_csrf` cookie == `X-CSRF-Token` header + `Origin`) | Exigida solo si autentica por cookie; omitida con `Authorization: Bearer` |
| Query param `?access_token=` | **Eliminado** en todos los entornos | **Eliminado** en todos los entornos |

---

## 2. Variables de Entorno Recomendadas en el Backend (Vercel)

Configurar en el panel de **Vercel -> Settings -> Environment Variables** de `gestion.ctmueble.com.ar`:

```env
NODE_ENV=production
JWT_ACCESS_SECRET=<secreto-aleatorio-64-hex-distinto-1>
JWT_REFRESH_SECRET=<secreto-aleatorio-64-hex-distinto-2>
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=.ctmueble.com.ar
CORS_ORIGINS=https://oficina.ctmueble.com.ar
```

> **Nota sobre Previews en Vercel (`*.vercel.app`):** Si un preview del frontend (`https://oficina-preview.vercel.app`) consume un backend en otro dominio público (`*.vercel.app`), configurar `COOKIE_SAME_SITE=none` (sin `COOKIE_DOMAIN`) en el entorno `Preview` de Vercel y listar el origen del preview en `CORS_ORIGINS`.

---

## 3. Cliente HTTP en React (Axios / Fetch)

### 3.1. Eliminar almacenamiento de tokens en `localStorage` / `sessionStorage`

Eliminar cualquier lectura o escritura de `localStorage.getItem('access_token')` o `localStorage.getItem('refresh_token')`. El navegador enviará automáticamente `ctm_at` y `ctm_rt` cuando se incluya `credentials: 'include'` (`withCredentials: true` en Axios).

### 3.2. Ejemplo listo para producción con Axios (incluye CSRF + Refresh automático)

```ts
import axios from 'axios';

let inMemoryCsrfToken: string | null = null;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCsrfToken(token?: string | null) {
  if (token) inMemoryCsrfToken = token;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gestion.ctmueble.com.ar',
  withCredentials: true, // Imprescindible para enviar/recibir ctm_at, ctm_rt y ctm_csrf
});

// Adjuntar X-CSRF-Token en mutaciones
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = inMemoryCsrfToken || readCookie('ctm_csrf');
    if (csrf) {
      config.headers['X-CSRF-Token'] = csrf;
    }
  }
  return config;
});

// Capturar X-CSRF-Token actualizado y renovar sesión ante 401 TOKEN_EXPIRED
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => {
    const headerCsrf = response.headers['x-csrf-token'];
    const bodyCsrf = response.data?.csrf_token;
    if (headerCsrf || bodyCsrf) {
      setCsrfToken(headerCsrf || bodyCsrf);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 401 &&
      (code === 'TOKEN_EXPIRED' || code === 'TOKEN_REQUIRED') &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/refresh_token')
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh_token', {})
          .then((res) => {
            setCsrfToken(res.headers['x-csrf-token'] || res.data?.csrf_token);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return api(original);
    }

    return Promise.reject(error);
  }
);
```

### 3.3. Arranque de sesión al cargar la SPA (`GET /auth/session`)

Al iniciar la aplicación React (`App.tsx` / `AuthProvider`), invocar:

```ts
const { data } = await api.get('/auth/session');
// data => { authenticated: true, user: { id, mail, profile, laboratory }, csrf_token: '...' }
```

### 3.4. Descarga de Documentos PDF (sin `?access_token=`)

Reemplazar cualquier `window.open(\`\${API_URL}/essays/download-document?id=...\${token}\`)` por:
- Con cookies `SameSite=Lax` + `COOKIE_DOMAIN=.ctmueble.com.ar`, una navegación directa o `<a href="https://gestion.ctmueble.com.ar/essays/download-document?documentId=..." target="_blank" rel="noopener noreferrer">` envía automáticamente la cookie `ctm_at`.
- Alternativamente (compatible también con Previews `SameSite=None`), descargar como `Blob`:

```ts
export async function downloadEssayPdf(documentId: string, fallbackName = 'documento.pdf') {
  const res = await api.get('/essays/download-document', {
    params: { documentId },
    responseType: 'blob',
  });
  const blobUrl = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
```

---

## 4. Cabeceras CSP y Seguridad HTTP para el proyecto Vercel del Frontend (`oficina.ctmueble.com.ar`)

Agregar en el `vercel.json` del repositorio de la SPA React (`oficina.ctmueble.com.ar`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.r2.dev; connect-src 'self' https://gestion.ctmueble.com.ar; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), camera=(), microphone=(), payment=()"
        }
      ]
    }
  ]
}
```

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md -->

# Documentación de Gestión de Usuarios de Laboratorio, Roles y Matriz de Permisos

> **Centro Tecnológico del Mueble (CTM) - Oficina Virtual & Gestión**  
> **Fecha:** 13 de Noviembre de 2026  
> **Ámbito:** Backend (`gestion.ctmueble.com.ar`) y Frontend (`oficina.ctmueble.com.ar`)  
> **Estado:** Implementado, verificado y en producción

---

## 1. Resumen Ejecutivo y Objetivos

En esta sesión se incorporó la sección **"Usuarios"** dentro de la Configuración del Sistema (`/config`) en la Oficina Virtual, orientada a la gestión de los integrantes internos del laboratorio del CTM.

### Requerimientos cumplimentados:
1. **Control de Acceso Exclusivo para Superadmin:**  
   La sección y su pestaña correspondiente son visibles y operables **únicamente por el superadministrador** del laboratorio. Si un usuario con rol operativo o de consulta accede a la configuración, la pestaña no se muestra y cualquier intento de interacción vía API es rechazado con código HTTP 403 (`SUPERADMIN_REQUIRED`).
2. **Esquema Funcional y Visual de Contalogics:**  
   Se replicó íntegramente el diseño, estructura de datos y experiencia de usuario implementada en Contalogics (`Contalogic/rework/fe`), adaptándolo al diseño institucional del CTM:
   - Tabla de usuarios con buscador predictivo por nombre, usuario (`@mail`), correo electrónico y DNI.
   - Badges visuales de roles y estados (`Admin [Acceso total]`, `Usuario [Operativo]`, `Consulta [Solo lectura]`, `Activo`, `Inactivo`).
   - Modales para alta de usuario, edición de datos/rol/estado, reseteo de contraseña temporal y matriz granular de permisos por rol.
3. **Flujo de Activación e Invitación por Correo Electrónico:**  
   A diferencia del modelo convencional de contraseña inmediata, al crear un nuevo integrante interno:
   - La cuenta se registra automáticamente en estado activo dentro del **modo laboratorio** (`profile = 'LABORATORY'`).
   - Se despacha un correo electrónico institucional a la casilla del usuario con un **enlace criptográfico de activación** (válido por 48 horas) y un **código OTP de 6 dígitos**.
   - El usuario activa su cuenta con un solo clic y puede comenzar a operar de inmediato en la plataforma.

---

## 2. Modelado de Base de Datos y Migraciones

Se consolidaron los esquemas relacionales sobre PostgreSQL (Neon) mediante Sequelize:

### 2.1. Tabla `laboratory_members`
Gestiona la membresía interna del personal del laboratorio y sus roles:
* `user` (`UUID`, Primary Key, FK `users(id)`).
* `role` (`ENUM('ADMIN', 'USER', 'CONSULTA')`, Default: `'USER'`).

### 2.2. Tabla `laboratory_permissions`
Almacena de forma persistente la matriz de permisos por rol:
* `id` (`UUID`, Primary Key, Default: `gen_random_uuid()`).
* `rol` (`VARCHAR(50)`, not null): Rol al que aplica (`Usuario` o `Consulta`).
* `accion` (`VARCHAR(100)`, not null): Clave única de la operación/módulo (e.g. `essays.crear`, `muestras.recepcionar`).
* `permitido` (`BOOLEAN`, not null, Default: `false`).
* `created_at` y `updated_at` (`TIMESTAMP WITH TIME ZONE`).
* **Índice único:** `idx_lab_perm_rol_accion` sobre las columnas `(rol, accion)`.

### 2.3. Tabla `users`
* Se agregó la columna `is_active` (`BOOLEAN`, Default: `true`) para permitir habilitar o suspender cuentas de personal interno sin destruir sus registros históricos.

### 2.4. Archivo de Migración
Se creó la migración oficial de Sequelize:
* [`src/infrastructure/migrations/20261112020000-laboratory-members-permissions-and-active.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/migrations/20261112020000-laboratory-members-permissions-and-active.js)

---

## 3. Catálogo de Permisos y Matriz por Rol

Se formalizó el catálogo de operaciones del laboratorio en [`src/shared/permissionsCatalog.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/permissionsCatalog.js), organizado en 4 módulos operativos:

| Módulo | Clave de Acción | Descripción | Rol Usuario (Defecto) | Rol Consulta (Defecto) | Rol Admin |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Ensayos y Solicitudes** | `essays.ver` | Ver ensayos y solicitudes del laboratorio | Permitido | Permitido | Total |
| | `essays.crear` | Crear y registrar solicitudes de ensayo | Permitido | Denegado | Total |
| | `essays.editar` | Modificar datos de ensayos y cargar resultados | Permitido | Denegado | Total |
| | `essays.estados` | Avanzar estados y procedimientos del ensayo | Permitido | Denegado | Total |
| | `essays.informes` | Generar y descargar informes de ensayos | Permitido | Permitido | Total |
| | `essays.anular` | Cancelar o anular solicitudes de ensayo | Denegado | Denegado | Total |
| **Muestras y Órdenes** | `muestras.ver` | Ver listado y detalle de muestras físicas | Permitido | Permitido | Total |
| | `muestras.recepcionar`| Recepcionar, rotular y asignar muestras físicas | Permitido | Denegado | Total |
| | `ordenes.editar` | Crear y editar órdenes de trabajo | Permitido | Denegado | Total |
| | `ordenes.ensayar` | Cargar dimensiones, mediciones y ensayos mecánicos | Permitido | Denegado | Total |
| | `ordenes.cerrar` | Cerrar y finalizar órdenes de trabajo | Permitido | Denegado | Total |
| **Clientes y Empresas** | `clientes.ver` | Ver clientes y empresas representadas | Permitido | Permitido | Total |
| | `clientes.crear` | Dar de alta nuevos clientes y empresas | Permitido | Denegado | Total |
| | `clientes.editar` | Editar datos fiscales y contactos comerciales | Permitido | Denegado | Total |
| **Configuración** | `configuracion.env` | Ver y modificar variables de entorno | Denegado | Denegado | Total |
| | `configuracion.mailing`| Administrar credenciales y pruebas de correo | Denegado | Denegado | Total |
| | `configuracion.usuarios`| Administrar usuarios internos y permisos | Denegado | Denegado | Total |

> **Regla de Negocio:** El rol **Admin** siempre cuenta con acceso irrestricto a todas las funcionalidades del laboratorio. La matriz de permisos configura el comportamiento específico para los roles **Usuario** y **Consulta**.

---

## 4. Backend: Servicios, Controladores y Mailing

### 4.1. Servicio de Aplicación (`LaboratoryUserApplicationService.js`)
Ubicación: [`src/application/laboratories/services/LaboratoryUserApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/laboratories/services/LaboratoryUserApplicationService.js)

* **`listUsers()`**: Obtiene la nómina de usuarios con perfil `LABORATORY`, vinculando su membresía en `laboratory_members` para determinar su rol (`Admin`, `Usuario` o `Consulta`) y calcular el flag `isSuperAdmin`.
* **`createUser({ nombreCompleto, dni, email, rol, telefono, frontendUrl })`**:
  - Si el usuario no existe: genera una contraseña aleatoria cifrada con bcrypt, crea el usuario con `profile = 'LABORATORY'` y estado activo.
  - Si ya existe: actualiza su perfil a `LABORATORY` para garantizar su acceso interno.
  - Vincula o actualiza el rol en `laboratory_members`.
  - Genera token SHA-256 y OTP de 6 dígitos en `email_verifications`.
  - Despacha el correo electrónico de invitación mediante el `MailingService`.
* **`updateUser(userId, { nombreCompleto, dni, rol, activo })`**: Modifica datos personales, estado de activación y rol interno.
* **`resetPassword(userId, newPassword)`**: Permite asignar una contraseña provisoria al integrante.
* **`resendActivation(userId, frontendUrl)`**: Regenera tokens de verificación no expirados y reenvía el correo de invitación.
* **`getPermissionsMatrix()`** y **`updatePermissionsMatrix(items)`**: Consulta y actualización transaccional de los permisos configurables.

### 4.2. Control de Autorización y Rutas
Ubicación:
* Controlador: [`src/presentation/controllers/laboratoryUsers.controller.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/controllers/laboratoryUsers.controller.js)
* Rutas: [`src/presentation/routes/laboratoryUsers.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/laboratoryUsers.routes.js)

Se implementó el verificador `checkIsSuperAdmin(req)` que valida si el usuario cuenta con rol `ADMIN` en `laboratory_members` o coincide con los correos de administración designados (`tarechaga15@gmail.com`, `dev@ctmueble.com.ar`).

Endpoints expuestos bajo `/laboratory/users` (y `/users/laboratory`):
* `GET /`: Lista de usuarios del laboratorio.
* `POST /`: Alta de usuario interno y despacho de correo.
* `PUT /:id`: Actualización de datos y rol.
* `POST /:id/resetear-password`: Establecer contraseña provisoria.
* `POST /:id/reenviar-activacion`: Reenvío de correo de activación.
* `GET /permissions`: Catálogo y matriz de permisos actual.
* `PUT /permissions`: Guardado de matriz de permisos por rol.

### 4.3. Plantilla de Correo de Invitación (`MailingService.js`)
Ubicación: [`src/infrastructure/mailing/MailingService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/mailing/MailingService.js)

Se agregó el método `sendLaboratoryInvitation` que genera un correo HTML responsive con los colores institucionales del CTM (Borgoña `#3d1419`, Rojo `#c72a33` y Crema `#fafaf5`):
- Notificación formal: *"El superadministrador te ha dado de alta como usuario interno del laboratorio CTM con el rol de {Rol}."*
- Botón destacado de activación directa: `${frontendUrl}/verify-email?token={token}&mail={email}&invitation=true`.
- Código OTP numérico alternativo.
- Indicación de validez por 48 horas.

---

## 5. Frontend: Interfaz, Componentes y UX

### 5.1. Control de Visibilidad en `Config.jsx`
Ubicación: [`src/pages/Config.jsx`](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/pages/Config.jsx)

* Se evalúa `isSuperAdmin` a partir de los datos provistos por el contexto de autenticación (`useAuth()`).
* La pestaña **"Usuarios"** se renderiza condicionalmente en la barra de navegación superior únicamente si `isSuperAdmin === true`.
* Si un usuario no autorizado intenta fijar la pestaña en `"users"`, el componente vuelve por defecto a `"env"`.

### 5.2. Componente Principal (`LaboratoryUsersTab.jsx`)
Ubicación: [`src/components/config/LaboratoryUsersTab.jsx`](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/components/config/LaboratoryUsersTab.jsx)

* **Encabezado y Acciones Rápidas:**
  - Botón *"Matriz de permisos por rol"* (con icono `SlidersHorizontal`).
  - Botón *"Nuevo usuario"* (con icono `Plus`).
* **Filtro de Búsqueda:** Campo de texto con icono de lupa que filtra en tiempo real por coincidencia insensible a mayúsculas.
* **Tabla de Usuarios:**
  - Columnas: Nombre, Usuario, Correo (`mailto:`), DNI, Rol y Permisos (Badges distintivos), Estado (`Activo` / `Inactivo`) y Acciones.
  - Botones de acción por fila: Reenviar invitación por correo (`Send`), Editar usuario (`Pencil`) y Resetear contraseña (`KeyRound`).
* **Modal "Nuevo usuario":**
  - Campos: Nombre completo, DNI y Correo electrónico.
  - Selector interactivo de tarjetas para el Rol (`Admin`, `Usuario`, `Consulta`) con resumen de alcance.
  - Alerta explicativa sobre la activación automática vía correo electrónico.
  - Estado de carga interactivo (`Creando y enviando correo...`).
* **Modal "Editar usuario":** Modificación de nombre, DNI, rol y checkbox para activar o suspender el usuario.
* **Modal "Resetear contraseña":** Ingreso de contraseña temporal (mínimo 6 caracteres).
* **Modal "Matriz de permisos por rol":** Visualización en tabla agrupada por categorías con checkboxes bidireccionales para `Usuario` y `Consulta`, y guardado asíncrono con feedback mediante Toast.

### 5.3. Servicio Frontend (`laboratoryUsersService.js`)
Ubicación: [`src/services/laboratoryUsersService.js`](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/services/laboratoryUsersService.js)
Encapsula todas las llamadas HTTP hacia la API de usuarios y permisos del laboratorio mediante la instancia compartida de Axios.

### 5.4. Activación de Cuenta (`VerifyEmail.jsx`)
Ubicación: [`src/pages/VerifyEmail.jsx`](file:///c:/Users/Tomas/Desktop/CTM/oficina.ctmueble.com.ar/src/pages/VerifyEmail.jsx)
Reconoce el parámetro de consulta `?invitation=true` en los enlaces de correo, mostrando el título *"¡Cuenta de laboratorio activada!"* y un mensaje indicando que el usuario ya puede ingresar a la plataforma y operar con sus permisos asignados.

---

## 6. Verificación y Calidad

1. **Pruebas Automatizadas de Backend:**
   - Se creó la suite [`tests/laboratory/laboratoryUsers.test.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/tests/laboratory/laboratoryUsers.test.js), que valida el formateo de usuarios, el alta de integrantes en modo `LABORATORY`, la emisión de tokens y la persistencia de la matriz de permisos.
   - Resultado: **46 tests ejecutados y pasando exitosamente** (`pass 46, fail 0`).
2. **Compilación de Producción Frontend:**
   - Se ejecutó `npm run build` en `oficina.ctmueble.com.ar` con Vite v7.2.2.
   - Resultado: Compilación limpia sin errores sintácticos ni advertencias de importación.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md -->

# Sistema de Cifrado de Credenciales y Gestión Segura de API Keys

Este documento detalla la arquitectura, el funcionamiento interno y la guía de configuración del subsistema de cifrado de secretos y API Keys de la plataforma **CTM Oficina Virtual**.

---

## 1. Objetivos y Principios de Diseño

El sistema está diseñado para cumplir con los estándares modernos de seguridad de la información (OWASP, NIST SP 800-38D):

1. **Confidencialidad en Reposo**: Ninguna clave de API (Resend, AFIP, pasarelas de pago, etc.) se almacena en texto plano en la base de datos.
2. **Cifrado Autenticado (AEAD)**: Se garantiza no solo el secreto de los datos, sino también su integridad y autenticidad, detectando cualquier intento de manipulación o corrupción del texto cifrado.
3. **Independencia y Multi-propósito**: El subsistema es agnóstico del servicio o proveedor. Puede utilizarse para `MAILING`, `AFIP`, `PAYMENTS`, `STORAGE` o cualquier integración futura.
4. **No Exposición de Secretos**: Los endpoints públicos y de administración nunca devuelven la clave en texto plano; únicamente exponen un *hint* enmascarado seguro (ej. `re_...8f2a`).
5. **Preparado para Envelope Encryption y KMS**: Arquitectura desacoplada que permite operar con claves maestras locales versionadas en variables de entorno o migrar transparentemente a **AWS KMS** o **Google Cloud KMS**.

---

## 2. Arquitectura Criptográfica

El subsistema se encuentra ubicado en `src/infrastructure/security/encryption/` y se compone de tres elementos principales:

```
src/infrastructure/security/encryption/
├── ISecretEncryptionProvider.js        # Contrato de interfaz
├── AesGcmEncryptionProvider.js         # Proveedor AES-256-GCM con claves versionadas
├── KmsEnvelopeEncryptionProvider.js    # Proveedor Envelope Encryption (KMS ready)
└── EncryptionProviderFactory.js        # Fábrica de selección de proveedor
```

### 2.1. Algoritmo: AES-256-GCM

- **Cifrador**: `aes-256-gcm` (Galois/Counter Mode con clave de 256 bits).
- **Vector de Inicialización (IV)**: 12 bytes (96 bits) criptográficamente aleatorios (`crypto.randomBytes(12)`) generados en cada operación. **Nunca se reutiliza un IV**.
- **Etiqueta de Autenticación (Auth Tag)**: 16 bytes (128 bits) generada por el algoritmo para verificar la integridad del ciphertext.
- **AAD (Additional Authenticated Data)**: Se utiliza el identificador del servicio y proveedor (`${service}:${provider}`) como datos autenticados adicionales. Esto previene ataques de transplante criptográfico (una clave cifrada para mailing no puede ser reutilizada fraudulentamente en otro módulo).

### 2.2. Versionado de Claves Maestras

Para permitir la rotación de claves sin caída de servicio ni migración forzada inmediata de registros existentes:
- Cada registro almacena la versión de la clave con la que fue cifrado (`key_version`, ej: `'v1'`).
- El descifrador selecciona dinámicamente la clave correspondiente a esa versión desde las variables de entorno.
- Los nuevos registros se cifran siempre con la versión activa (`ACTIVE_ENCRYPTION_KEY_VERSION`).

---

## 3. Envelope Encryption (KMS Ready)

La clase `KmsEnvelopeEncryptionProvider` implementa el patrón **Envelope Encryption**:

```mermaid
flowchart TD
    KMS["AWS KMS / Cloud KMS<br/>(Clave Maestra CMK en HSM)"]
    DEK["DEK en Texto Plano<br/>(Efímera en RAM)"]
    EDEK["DEK Cifrada (EDEK)<br/>(Almacenada en DB junto al Ciphertext)"]
    ENC["2. Cifra el Secreto con AES-256-GCM<br/>3. Destruye la DEK de memoria"]
    DB[("Registro en 'system_api_keys'")]

    KMS -- "1. GenerateDataKey()" --> DEK
    KMS -- "1. GenerateDataKey()" --> EDEK
    DEK --> ENC
    ENC --> DB
    EDEK --> DB
```

### Ventajas de Envelope Encryption:
- La clave maestra (CMK) nunca sale del Hardware Security Module (HSM) de KMS.
- Se reduce el impacto de latencia de red de KMS, ya que el cifrado de datos pesados se realiza localmente con la DEK efímera.
- Auditoría estricta de accesos mediante AWS CloudTrail.

---

## 4. Modelo de Datos (`system_api_keys`)

La tabla `system_api_keys` almacena los secretos cifrados de forma independiente:

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador único del registro |
| `service` | `VARCHAR(50)` | Propósito del secreto (`MAILING`, `AFIP`, etc.) |
| `provider` | `VARCHAR(50)` | Nombre del proveedor (`RESEND`, `SENDGRID`, etc.) |
| `name` | `VARCHAR(100)` | Nombre descriptivo asignado |
| `encrypted_key` | `TEXT` | Texto cifrado en Base64 |
| `iv` | `VARCHAR(64)` | Vector de inicialización (Base64) |
| `tag` | `VARCHAR(64)` | Etiqueta de autenticación de 128 bits (Base64) |
| `key_version` | `VARCHAR(20)` | Versión de la clave maestra (`v1`, `v2`, etc.) |
| `algorithm` | `VARCHAR(30)` | Algoritmo empleado (`AES-256-GCM`) |
| `key_hint` | `VARCHAR(30)` | Enmascaramiento seguro para UI (ej: `re_...8f2a`) |
| `metadata` | `JSONB` | Configuración asociada (`fromEmail`, `fromName`, etc.) |
| `envelope` | `JSONB` | Metadata de Envelope Encryption (EDEK, Key ARN) |
| `is_active` | `BOOLEAN` | Si la clave se encuentra activa |
| `created_at` | `TIMESTAMP` | Fecha de creación |
| `updated_at` | `TIMESTAMP` | Fecha de última modificación |

---

## 5. Guía de Configuración y Variables de Entorno

### 5.1. Variables de Entorno Disponibles

Configurar en el archivo `.env` del backend (`gestion.ctmueble.com.ar`):

```bash
# ==============================================================================
# SEGURIDAD Y CIFRADO DE CREDENCIALES (AES-256-GCM)
# ==============================================================================

# Versión activa para nuevos cifrados (por defecto: v1)
ACTIVE_ENCRYPTION_KEY_VERSION=v1

# Clave maestra de 256 bits para la versión v1 (Hexadecimal de 64 caracteres)
MASTER_ENCRYPTION_KEY_V1=a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0

# Clave maestra de la versión v2 (cuando se realice una rotación)
# MASTER_ENCRYPTION_KEY_V2=...

# ==============================================================================
# ENVELOPE ENCRYPTION CON AWS KMS (OPCIONAL / ENTORNO PRODUCTIVO)
# ==============================================================================
USE_KMS_ENVELOPE=false
# KMS_KEY_ARN=arn:aws:kms:us-east-1:123456789012:key/xxxx-xxxx-xxxx
# AWS_REGION=us-east-1
```

> [!NOTE]
> En entornos locales o de desarrollo, si no se especifica `MASTER_ENCRYPTION_KEY_V1`, el sistema genera de forma segura una clave derivada determinística mediante `crypto.scryptSync` utilizando `JWT_SECRET`, garantizando que el sistema siempre funcione sin errores de configuración inicial.

### 5.2. Cómo Generar una Clave Maestra de 256 Bits Segura

Para generar una clave criptográficamente segura de 64 caracteres hexadecimales (256 bits), ejecutar en la consola:

**Con OpenSSL:**
```bash
openssl rand -hex 32
```

**Con Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado y asignarlo a `MASTER_ENCRYPTION_KEY_V1` en el entorno.

---

## 6. Procedimiento de Rotación de Claves (Zero-Downtime)

Para rotar la clave maestra sin interrumpir el funcionamiento ni invalidar claves existentes:

1. **Generar la nueva clave**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Agregar la nueva clave al entorno sin borrar la anterior**:
   ```bash
   MASTER_ENCRYPTION_KEY_V1=<clave_anterior>
   MASTER_ENCRYPTION_KEY_V2=<nueva_clave_generada>
   ```
3. **Actualizar la versión activa**:
   ```bash
   ACTIVE_ENCRYPTION_KEY_VERSION=v2
   ```
4. **Comportamiento**:
   - Los registros existentes cifrados con `v1` seguirán descifrándose correctamente utilizando `MASTER_ENCRYPTION_KEY_V1`.
   - Cualquier nueva clave o actualización se cifrará inmediatamente utilizando la clave de `v2`.

---

## 7. Uso en Código (Ejemplos para Desarrolladores)

### 7.1. Guardar una API Key (Cifrado Automático)

```javascript
const ApiKeyApplicationService = require('../application/security/ApiKeyApplicationService');
const apiKeyService = new ApiKeyApplicationService();

// Guarda la clave cifrada con AES-256-GCM y desactiva claves anteriores del mismo servicio
const result = await apiKeyService.saveApiKey({
  service: 'MAILING',
  provider: 'RESEND',
  name: 'Resend Producción',
  apiKey: 're_12345678_abcdef9876',
  metadata: {
    fromEmail: 'onboarding@resend.dev',
    fromName: 'CTM Oficina Virtual'
  }
});

console.log(result.keyHint); // "re_...9876" (la clave en texto plano nunca se retorna)
```

### 7.2. Consumir la API Key Descifrada (Uso Interno)

```javascript
const config = await apiKeyService.getActiveApiKey('MAILING');

if (config) {
  // `config.apiKey` contiene la clave en texto plano descifrada en memoria
  console.log(`Proveedor activo: ${config.provider}`);
  // Usar en cliente HTTP (ej. Axios con Resend)
  const client = axios.create({
    headers: { Authorization: `Bearer ${config.apiKey}` }
  });
}
```

### 7.3. Consultar Estado Público para la Interfaz

```javascript
// Retorna estado sin exponer secretos
const status = await apiKeyService.getServiceStatus('MAILING');
/*
{
  isConfigured: true,
  service: 'MAILING',
  provider: 'RESEND',
  name: 'Resend Producción',
  keyHint: 're_...9876',
  algorithm: 'AES-256-GCM',
  metadata: { fromEmail: 'onboarding@resend.dev', fromName: 'CTM Oficina Virtual' },
  updatedAt: '2026-11-11T12:00:00.000Z'
}
*/
```

---

## 8. Gestión desde la Interfaz Gráfica

Los usuarios con perfil `LABORATORY` pueden administrar la configuración de correo y credenciales directamente desde la Oficina Virtual:

1. Ingresar con perfil Laboratorio a **Configuración** (`/config`).
2. Seleccionar la pestaña **"Envío de correos"**.
3. Ingresar la API Key provista por el proveedor (ej. Resend) y el remitente.
4. Al hacer clic en **Guardar configuración**, la clave viaja protegida por HTTPS y se cifra inmediatamente en el backend antes de persistir.
5. Utilizar el botón **"Enviar correo de prueba"** para validar la entrega de correos en tiempo real.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md -->

# Gestión de Empresas, Clientes, Personas y Autocompletado Auxiliar con ARCA (Opcional)

Este documento explica la gestión multi-tenant de **Empresas (`bussiness`)**, **Direcciones (`bussiness_address`)**, **Clientes (`clients`, `clients_contacts`)** y **Personas (`persons`)**, junto con el funcionamiento interno y la habilitación de la integración **auxiliar y opcional** con **ARCA/AFIP** (WSAA y Padrón A13) destinada exclusivamente al **autocompletado de datos de clientes/empresas** a partir de su CUIT.

> **Carácter opcional:** La activación de la integración con ARCA **no es necesaria** para utilizar la plataforma. El alta y la gestión completa de empresas, direcciones, contactos y clientes funcionan de forma totalmente autónoma mediante carga manual (`POST /bussiness/manual/`, `POST /clients/create`). Cuando las credenciales `ARCA_*` no están configuradas, el sistema omite el autocompletado externo sin afectar el circuito de ensayos.

---

## 1. Servicio Auxiliar de Autocompletado con ARCA / AFIP (Opcional)

La integración auxiliar se ubica en `src/infrastructure/arca/services/` y se compone de dos clases principales: `ArcaConnection` (autenticación WSAA y gestión de Tickets de Acceso) y `PadronService` (consulta de datos de contribuyentes al Padrón A13 para autocompletar razón social y domicilios). En [`src/shared/serviceFactory.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/serviceFactory.js), `getPadronService()` inicializa el servicio bajo demanda y devuelve `null` si no se encuentra habilitado, permitiendo operar normalmente sin ARCA.

```mermaid
flowchart LR
    API["Endpoint /bussiness o /clients"] --> BizSvc["BusinessApplicationService<br/>(Fuera de tx SQL)"]
    BizSvc --> Padron["PadronService<br/>(ws_sr_padron_a13)"]
    Padron --> Conn["ArcaConnection"]
    Conn --> Cache{"¿TA válido en<br/>Redis o Memoria?"}
    Cache -- "Sí (>60s restantes)" --> Padron
    Cache -- "No" --> Sign["Firmado PKCS#7 (node-forge)<br/>con Cert + Key"]
    Sign --> WSAA["ARCA WSAA<br/>LoginCms (SOAP)"]
    WSAA --> StoreTA["Guardar TA en Redis<br/>(afip:ta:cuit:service) + RAM"]
    StoreTA --> Padron
    Padron --> A13["ARCA Padrón A13<br/>getPersona (SOAP)"]
    A13 --> Norm["Normalizar domicilios y<br/>distritos (types_districts)"]
```

### 1.1. Autenticación WSAA y Caché de Tickets de Acceso (`ArcaConnection`)
Implementada en [`src/infrastructure/arca/services/ArcaConnection.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/arca/services/ArcaConnection.js):

- **Carga segura de credenciales:**
  - En producción / Vercel (o cuando están definidas), utiliza `ARCA_CERT_BASE64` y `ARCA_KEY_BASE64` decodificadas en memoria UTF-8 sin escribir archivos en disco.
  - En desarrollo local (`NODE_ENV !== 'production'` y sin `VERCEL`), permite leer archivos físicos mediante `ARCA_CERT_FILE` y `ARCA_KEY_FILE`. En producción nunca busca claves empaquetadas en el repositorio.
- **Generación y firma de TRA (`generateTA`):**
  - Construye el XML `loginTicketRequest` v1.0 con `uniqueId`, `generationTime` (`now - 60s`), `expirationTime` (`now + 12h`) y el servicio (`ARCA_SERVICE`, validado contra `/^[a-zA-Z0-9_.-]{1,64}$/`).
  - Firma el TRA en formato **CMS / PKCS#7** en memoria usando `node-forge` (algoritmo `SHA-256`, atributos autenticados `contentType`, `messageDigest` y `signingTime`) y lo envía por SOAP a `ARCA_WSAA_URL`.
- **Caché de dos niveles (`getTA`):**
  - AFIP/ARCA rechaza solicitudes repetidas de login dentro de la vigencia de un Ticket de Acceso (error `coe.alreadyAuthenticated`). En entornos serverless como Vercel, múltiples invocaciones comparten el mismo TA mediante:
    1. **Nivel 1 (Redis):** Clave `afip:ta:{cuit}:{service}` con TTL calculado hasta `expirationTime - 60s` (acotado entre `60s` y `11h`).
    2. **Nivel 2 (Memoria local):** `localTaCache` por instancia como respaldo ante ausencia o caída temporal de Redis.
  - Aplica un margen de seguridad de **60 segundos** antes del vencimiento para renovar el TA proactivamente.
- **Parseo XML seguro (`parseTA`):** Usa `fast-xml-parser` con `processEntities: false` para mitigar ataques XXE (*XML External Entity*).

### 1.2. Consulta al Padrón A13 (`PadronService`)
Implementada en [`src/infrastructure/arca/services/PadronService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/arca/services/PadronService.js):

- **Validación y sanitización:** Limpia el CUIT a dígitos y exige exactamente 11 dígitos (`/^\d{11}$/`, caso contrario lanza `400 INVALID_CUIT`). Escapa `token` y `sign` con `escapeXml` para evitar inyección XML/SOAP.
- **Consulta `getPersona`:** Invoca `ARCA_PADRON_URL` con timeout configurable (`ARCA_TIMEOUT_MS`, por defecto `8000` ms) y límite de respuesta de 2 MB.
- **Mapeo de resultados:**
  - Determina `type`: `'LEGAL'` si `tipoPersona === 'JURIDICA'`, o `'PHYSICAL'` en caso contrario.
  - Extrae `razonSocial` (o `nombre apellido`) y mapea cada `domicilio` a `{ address, location, province: domicilio.idProvincia, origin: 'PUBLIC' }`.
  - Devuelve `null` si el contribuyente no existe o si ARCA responde HTTP 500 por CUIT inexistente.

### 1.3. Variables de Entorno de ARCA (Solo si se Habilita el Autocompletado)

| Variable | Necesaria para operar | Valor por defecto / Formato | Uso |
| :--- | :---: | :--- | :--- |
| `ARCA_CUIT` | Solo si se habilita ARCA | 11 dígitos (ej. `30673878896`) | CUIT del titular que realiza consultas de autocompletado ante AFIP/ARCA. |
| `ARCA_CERT_BASE64` | Solo si se habilita en prod/Vercel | Certificado X.509 PEM en Base64 | Certificado público para firmar TRA en memoria (sin archivos en disco). |
| `ARCA_KEY_BASE64` | Solo si se habilita en prod/Vercel | Clave privada RSA PEM en Base64 | Clave privada para firmar CMS en memoria. |
| `ARCA_CERT_FILE` | Alternativa local | Ruta a `.crt` | Alternativa en archivo local cuando no se usa `ARCA_CERT_BASE64`. |
| `ARCA_KEY_FILE` | Alternativa local | Ruta a `.key` | Alternativa en archivo local cuando no se usa `ARCA_KEY_BASE64`. |
| `ARCA_SERVICE` | No (default fijo) | `ws_sr_padron_a13` | Nombre del web service WSAA a autenticar para consulta de padrón. |
| `ARCA_WSAA_URL` | No (default prod) | `https://wsaa.afip.gov.ar/ws/services/LoginCms` | Endpoint SOAP de autenticación WSAA. |
| `ARCA_PADRON_URL` | No (default prod) | `https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA13` | Endpoint SOAP del Padrón A13. |
| `ARCA_TIMEOUT_MS` | No | `8000` | Timeout en milisegundos para llamadas SOAP a ARCA. |

### 1.4. Cómo Habilitar el Autocompletado Auxiliar con ARCA (Opcional)

Si el laboratorio desea activar el autocompletado automático de razón social y domicilio de clientes por CUIT (recordando que **no es obligatorio activarlo** para operar el sistema), debe realizar los siguientes pasos:

1. **Generar clave privada y certificado digital ante ARCA/AFIP:**
   - Generar una clave privada RSA (`private.key`) y solicitud CSR con OpenSSL.
   - Ingresar con Clave Fiscal en el portal de ARCA → *Administrador de Relaciones de Clave Fiscal* / *WSASS* → crear un nuevo alias/computador fiscal y subir el CSR para descargar el certificado emitido (`cert.crt`).
2. **Autorizar el servicio de Padrón A13 (`ws_sr_padron_a13`):**
   - Desde *Administrador de Relaciones de Clave Fiscal* en ARCA, delegar el web service **`ws_sr_padron_a13`** (Consulta a Padrón Alcance 13) al computador fiscal asociado al certificado creado.
3. **Configurar las credenciales en el entorno:**
   - **En desarrollo local (`NODE_ENV !== 'production'`):** guardar `cert.crt` y `private.key` localmente y definir en `.env`:
     ```env
     ARCA_CUIT=30XXXXXXXXX
     ARCA_CERT_FILE=./certs/arca/cert.crt
     ARCA_KEY_FILE=./certs/arca/private.key
     ```
   - **En producción / Vercel (serverless sin almacenamiento local persistente):** convertir ambos archivos a Base64 de una sola línea:
     ```bash
     base64 -w0 certs/arca/cert.crt
     base64 -w0 certs/arca/private.key
     ```
     *(o en PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("certs/arca/cert.crt"))`)*
     y cargar en las variables de entorno del despliegue:
     ```env
     ARCA_CUIT=30XXXXXXXXX
     ARCA_CERT_BASE64=<contenido_base64_cert>
     ARCA_KEY_BASE64=<contenido_base64_key>
     ```
4. **Verificar funcionamiento:** una vez configuradas las variables, las rutas auxiliares `/bussiness/padron/`, `/clients/padron/:cuit` y `/bussiness/sync/` devolverán datos autocompletados desde ARCA; si se dejan sin configurar, la plataforma sigue operando normalmente mediante el alta manual (`POST /bussiness/manual/` y `POST /clients/create`).

---

## 2. Gestión de Empresas y Direcciones (`BusinessApplicationService`)

Implementada en [`src/application/business/services/BusinessApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/business/services/BusinessApplicationService.js) y [`src/domain/business/services/AddressOriginService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/business/services/AddressOriginService.js).

- **Desacoplamiento transaccional:** Cuando el autocompletado auxiliar ARCA se encuentra habilitado, `getBusiness`, `getBusinessForEssay` y `syncBusinessByCuit` realizan las llamadas SOAP **estrictamente fuera** de `withTransaction(...)` para evitar retener conexiones del pool de Neon mientras esperan respuesta externa. Si `padronService` no está activo o el contribuyente no figura, la carga manual sigue plenamente disponible.
- **Validación de Persona Jurídica al autocompletar:** Al importar datos desde el padrón en `getBusiness`, `getBusinessForEssay` o `syncBusinessByCuit`, si `padron.type !== 'LEGAL'` se rechaza con HTTP `400`.
- **Creación manual (flujo principal autónomo) vs Autocompletado opcional (`MANUAL` vs `PADRON`):**
  - `createBusinessManually({ cuit, name })`: permite dar de alta cualquier empresa directamente sin requerir ni consultar ARCA (devuelve `409` si el CUIT ya existe). Es el flujo autónomo base cuando ARCA no está activado.
  - `syncBusinessByCuit(cuit, user)`: utilidad opcional de autocompletado que actualiza razón social y agrega direcciones `PUBLIC` desde el padrón cuando la integración ARCA está habilitada.
- **Normalización geográfica (`normalizeAddresses`):** Mapea el código numérico de provincia retornado al autocompletar (`address.province`) contra `types_districts.numeric_id` para obtener el código ISO (`AR-B`, `AR-S`, etc.). Cuando el distrito corresponde a `AR-C`, asigna automáticamente `location = 'Capital Federal'`.
- **Visibilidad y origen de direcciones (`AddressOriginService` y `BusinessRepository.findAddresses`):**
  - `PUBLIC`: direcciones autocompletadas desde el padrón auxiliar ARCA, visibles para todos los usuarios.
  - `LABORATORY`: direcciones cargadas por personal del laboratorio, visibles solo para usuarios con `profile === 'LABORATORY'`.
  - `CLIENT`: direcciones cargadas por un cliente específico, visibles únicamente para su creador (`user === user.id`).
- **Contexto expandido para ensayos (`getBusinessForEssay`):** Devuelve en una única llamada empresa, `source`, `addresses` visibles, `clients` asociados y `representatives` deduplicados por `id`.

---

## 3. Gestión de Clientes, Agenda y Personas

### 3.1. Aislamiento Multi-Tenant y Clientes (`ClientApplicationService`)
Implementado en [`src/application/clients/services/ClientApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/clients/services/ClientApplicationService.js) y [`src/domain/clients/services/ClientOriginService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/clients/services/ClientOriginService.js):

- **Separación por origen (`origin`):**
  - Un usuario `CLIENT` crea clientes con `origin = 'CLIENT'` y `user = user.id`. Solo puede consultar, modificar, eliminar o gestionar contactos de sus propios clientes (`client.userId === user.id && client.origin === 'CLIENT'`); ante cualquier intento sobre registros ajenos recibe `404 CLIENT_NOT_FOUND` (anti-enumeración IDOR).
  - El perfil `LABORATORY` opera sobre clientes con `origin = 'LABORATORY'`. En `getAllClients` y `getScheduledClients`, deduplica resultados por `cuit || id`, y únicamente permite eliminar clientes con `origin === 'LABORATORY'` (`403 CLIENT_FORBIDDEN` si intenta borrar un cliente propio de un usuario `CLIENT`).
  - Los usuarios internos con rol `CONSULTA` tienen bloqueadas las operaciones de escritura (`create`, `update`, `delete`, `addScheduled`, `addContact`, `removeContact`) con HTTP `403 LAB_PERMISSION_DENIED`.
- **Agenda de Clientes del Laboratorio (`/clients/scheduled*`):**
  - `getScheduledClients()`: lista la agenda de clientes del laboratorio (`origin = 'LABORATORY'`).
  - `addScheduledClient(params)`: agenda un cliente a partir de un `clientId` (de `clients` o de un snapshot `essays_client`), un `cuit` o un `updateData`. Si ya existe un cliente `LABORATORY` para ese CUIT, vincula el contacto indicado y actualiza los campos informados; si no existe, crea el registro `LABORATORY`, asigna automáticamente `representativeId = primaryContactId` cuando el CUIT comienza con `30`, `33` o `34` y no se envió representante, y vincula el contacto en `clients_contacts`.
  - `isClientScheduled({ clientId, cuit, contactId })`: verifica si un cliente/CUIT ya está agendado en el laboratorio y si un `contactId` específico figura vinculado en `clients_contacts`, devolviendo `{ scheduled, clientId, isContactLinked }`.
- **Contactos múltiples (`clients_contacts`):**
  - `getContactsByClient`, `addContactToClient` (acepta `contactId` existente o un objeto de persona nueva que crea con `isThirdParty: true`), y `removeContactFromClient`.

### 3.2. Gestión de Personas (`PersonApplicationService`)
Implementada en [`src/application/persons/services/PersonApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/persons/services/PersonApplicationService.js), [`src/domain/persons/services/PersonValidationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/persons/services/PersonValidationService.js) y [`src/infrastructure/repositories/persons/PersonRepository.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/repositories/persons/PersonRepository.js):

- **Perfil propio vs Terceros:**
  - `PersonValidationService` impide que un usuario `CLIENT` cree más de una persona principal propia (`isThirdParty: false, origin: 'CLIENT'`).
  - Las personas creadas como representantes o contactos adicionales llevan `isThirdParty: true` y `userId: null` (`shouldAssignUserId`).
  - `GET /persons/me` devuelve la persona principal asociada al usuario autenticado (`user_id = user.id, is_third_party = false`).
- **Control de acceso anti-PII (`_assertUserCanAccessPerson`):** Un usuario `CLIENT` únicamente puede acceder a su propia persona o a personas vinculadas como `representative`, `contact` o en `clients_contacts` de clientes propios (`PersonRepository.isPersonAccessibleByUser`).
- **Sincronización con `users`:** Al modificar `name` o `dni` de una persona que tiene `userId` vinculado (`updatePerson`), el servicio actualiza también `name` y `dni` en el registro `users`.
- **Búsqueda parametrizada segura (`searchAvailable`):** Escapa comodines SQL (`\`, `%`, `_`) mediante [`escapeLike`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/shared/sqlLike.js) para consultas `ILIKE` sobre `name`, `dni` y `mail`, aplica el filtro multi-tenant, puede excluir contactos ya vinculados a un `clientId` y limita el resultado a 50 filas (máximo 100).

---

## 4. Endpoints y Uso de API

Todos los endpoints requieren autenticación (`verifyJWT` + CSRF si usa cookie + `Idempotency-Key` opcional en `POST`/`PUT`). Los endpoints marcados con `padronLimiter` aplican un límite de **30 solicitudes cada 10 minutos por usuario** (`429 PADRON_RATE_LIMIT`).

### 4.1. Empresas (`/bussiness`)
Definidos en [`src/presentation/routes/bussiness.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/bussiness.routes.js):

| Método | Ruta | Permiso / Límite | Parámetros / Body | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/bussiness/get/` | JWT | Query: `cuit` | `BusinessDTO` (busca en BD; si ARCA está habilitado, intenta autocompletar). |
| `POST` | `/bussiness/manual/` | JWT | Body: `{ cuit, name }` | `BusinessDTO` creada manualmente (`409` si existe; no requiere ARCA). |
| `POST` | `/bussiness/sync/` | JWT + `padronLimiter` | Query: `cuit` | `BusinessDTO` autocompletada opcionalmente desde Padrón A13 (si ARCA está activo). |
| `GET` | `/bussiness/padron/` | JWT + `padronLimiter` | Query: `cuit` | Datos auxiliares de autocompletado (`{ name, cuit, type, addresses }`, requiere ARCA activo). |
| `GET` | `/bussiness/addresses/` | JWT | Query: `cuit` | `Address[]` visibles para el usuario. |
| `POST` | `/bussiness/addresses/` | JWT | Query: `cuit`; Body: `{ address, location, province, district? }` | Dirección creada con `origin` según perfil. |
| `PUT` | `/bussiness/addresses/` | JWT | Query: `id`; Body: `{ address?, location?, province?, district? }` | Dirección actualizada. |
| `DELETE` | `/bussiness/addresses/` | JWT | Query: `id` | `{ success: boolean }`. |
| `GET` | `/bussiness/representatives/` | JWT | Query: `cuit` | Representantes deduplicados asociados al CUIT. |
| `GET` | `/bussiness/for-essay/` | JWT | Query: `cuit` | `{ cuit, name, source, addresses, representatives, clients }`. |

### 4.2. Clientes (`/clients`)
Definidos en [`src/presentation/routes/clients.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/clients.routes.js):

| Método | Ruta | Permiso / Límite | Parámetros / Body | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/clients/fetch` | JWT | — | `ClientDTO[]` del usuario o agenda del laboratorio. |
| `GET` | `/clients/get` | JWT | Query: `id` | `ClientDTO`. |
| `GET` | `/clients/search` | JWT | Query: `search` (alias `term`, `name`, `cuit`) | `ClientDTO[]` filtrados en memoria por nombre/CUIT. |
| `GET` | `/clients/search-by-business` | JWT | Query: `search` | Alias de búsqueda por empresa/CUIT. |
| `GET` | `/clients/scheduled` | JWT + `LABORATORY` | — | `ClientDTO[]` agendados en el laboratorio. |
| `GET` | `/clients/scheduled/check` | JWT + `LABORATORY` | Query: `clientId` (o `id`) / `cuit`, `contactId?` | `{ scheduled, clientId, isContactLinked }`. |
| `POST` | `/clients/scheduled` | JWT + `LABORATORY` (no `CONSULTA`) | Body: `{ clientId?, cuit?, contactId?, ...updateData }` | `201` `{ success: true, client }`. |
| `POST` | `/clients/create` | JWT (no `CONSULTA`) | Body: `CreateClientDTO` | `ClientDTO` creado. |
| `POST` | `/clients/get-or-create-for-essay` | JWT | Body: `{ id? / clientId? }` o `CreateClientDTO` | `ClientDTO` existente o recién creado. |
| `PUT` | `/clients/update` | JWT (no `CONSULTA`) | Query: `id`; Body: `UpdateClientDTO` | `ClientDTO` actualizado. |
| `DELETE` | `/clients/delete` | JWT (no `CONSULTA`) | Query: `id` | `true`. |
| `GET` | `/clients/padron/:cuit` | JWT + `padronLimiter` | Path: `cuit` | Autocompletado auxiliar opcional de Padrón A13 (si ARCA está habilitado) o `null`. |
| `GET` | `/clients/:clientId/contacts` (y `/clients/contacts`) | JWT | Path/Query: `clientId` | `PersonDTO[]` vinculados al cliente. |
| `POST` | `/clients/:clientId/contacts` (y `/clients/contacts`) | JWT (no `CONSULTA`) | Path/Query: `clientId`; Body: `{ contactId }` o datos de persona | `201` `PersonDTO[]` actualizada. |
| `DELETE` | `/clients/:clientId/contacts` (y `/clients/contacts`) | JWT (no `CONSULTA`) | Path/Query: `clientId`, `contactId` (o `personId`) | `{ success: true }`. |

### 4.3. Personas (`/persons`)
Definidos en [`src/presentation/routes/persons.routes.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/routes/persons.routes.js) (todas las rutas aceptan barra final `/` opcional):

| Método | Ruta | Permiso | Parámetros / Body | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/persons/me` | JWT | — | `PersonDTO` del perfil principal del usuario. |
| `GET` | `/persons/get` | JWT | Query: `id` | `PersonDTO`. |
| `GET` | `/persons/fetch` | JWT | — | `PersonDTO[]` accesibles (máx. 200). |
| `GET` | `/persons/search-available` (y `/persons/search`) | JWT | Query: `search` (alias `term`, `q`) | `PersonDTO[]` accesibles coincidentes (máx. 50). |
| `GET` | `/persons/by-client/:clientId` | JWT | Path: `clientId` | `PersonDTO[]` vinculados al cliente. |
| `POST` | `/persons/create` | JWT | Body: `CreatePersonDTO` | `PersonDTO` creada. |
| `PUT` | `/persons/update` | JWT | Body: `{ id, data: UpdatePersonDTO }` | `PersonDTO` actualizada (y sincronizada con `users`). |
| `POST` | `/persons/link` | JWT | Body: `{ personId, clientId }` | `{ success: true }`. |
| `POST` | `/persons/unlink` | JWT | Body: `{ personId, clientId }` | `{ success: true }`. |

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md -->

# Gestión de Ensayos, Órdenes de Trabajo, Muestras y Exportación

Este documento detalla el funcionamiento técnico, las reglas de negocio, la máquina de estados, el cálculo analítico, las plantillas de elementos y la exportación a planillas CSV/XLSX implementadas en `src/application/essays/` y `src/domain/essays/`.

---

## 1. Máquina de Estados del Ensayo y Acciones de Procedimiento

El ciclo de vida completo de un ensayo se modela mediante el Value Object [`EssayStatus`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/essays/value-objects/EssayStatus.js) y la entidad [`Essay`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/essays/entities/Essay.js).

```mermaid
stateDiagram-v2
    [*] --> REQUESTED: POST /essays/create (F-PC13-01)
    REQUESTED --> ACCEPTED: ACTION ACCEPT (Lab)
    REQUESTED --> REJECTED: ACTION REJECT (Lab)
    REQUESTED --> CANCELLED: ACTION CANCEL (Cliente o Lab)
    ACCEPTED --> SERVICE_AGREEMENT_MADED: POST /essays/generate-contract (F-PC13-02)
    ACCEPTED --> CANCELLED: ACTION CANCEL (Cliente o Lab)
    SERVICE_AGREEMENT_MADED --> IN_WORK: POST /samples/receive-samples (accepted=true, F-PC16-01)
    SERVICE_AGREEMENT_MADED --> CANCELLED: Muestras rechazadas (accepted=false) o ACTION CANCEL
    IN_WORK --> COMPLETED: POST /essays/emit-report o /samples/close-and-emit-report (F-PC15-01)
    IN_WORK --> CANCELLED: ACTION CANCEL (Solo Lab)
    COMPLETED --> COMPLETED: Re-emisión de informe modificado (modificated=true)
```

### 1.1. Acciones en `POST /essays/procedure/actions?id=<essayId>`
Implementadas en [`essays.controller.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/controllers/essays.controller.js) y [`EssayApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/essays/services/EssayApplicationService.js). El rol interno `CONSULTA` tiene bloqueada cualquier acción en este endpoint (`403 LAB_PERMISSION_DENIED`).

| Acción (`body.action`) | Perfil permitido | Estado requerido | Efecto y auditoría |
| :--- | :--- | :--- | :--- |
| `ACCEPT` | `LABORATORY` | `REQUESTED` | Cambia a `ACCEPTED`, registra `REQUEST_APPROVED` y notifica por correo al cliente. |
| `REJECT` | `LABORATORY` | `REQUESTED` | Adjunta `observations`, cambia a `REJECTED`, registra `REQUEST_REJECTED` y notifica al cliente. |
| `CANCEL` | `CLIENT` (antes de `IN_WORK`) o `LABORATORY` | Distinto de `COMPLETED`, `CANCELLED`, `REJECTED` | Adjunta `observations`/`reason`, cambia a `CANCELLED`, registra `ESSAY_CANCELLED` (`reason: 'manual_cancel'`) y notifica al cliente. Si un cliente intenta cancelar en `IN_WORK`, responde `403 CANCEL_FORBIDDEN`. |
| `REISSUE_REQUEST` / `REISSUE_FPC1301` | Propietario o `LABORATORY` | Distinto de `CANCELLED`, `REJECTED` | Registra nueva emisión de `F-PC13-01` con `modificated: true`, audita `REQUEST_MODIFIED` y captura una nueva snapshot firmada con sello OpenTimestamps. |

---

## 2. Creación de Solicitud, Códigos Atómicos y Snapshot de Cliente

### 2.1. Flujo de `POST /essays/create`
1. **Validación de entrada (`CreateEssayDTO`):** Exige `client` (o `isSelf: true`), `essay` (ID de `types_essays`), `elements.template` / `templateId` / `id` y `elements.date` (opcionalmente `elements.batch_number`, `observations`, `client_notifications_enabled`).
2. **Resolución de plantilla de elemento:** Obtiene `product`, `manufacturer` y `country` desde `EssayElementTemplateApplicationService.getElementTemplate`.
3. **Auto-resolución de cliente particular (`isSelf` / `CLIENT`):**
   - Si el usuario tiene perfil `CLIENT` e indica `isSelf: true` (o omite `client`), busca su perfil personal (`GET /persons/me`) y un cliente propio coincidente por DNI, contacto o nombre.
   - Si no tiene ninguno, crea un `Client` automáticamente convirtiendo su DNI en un CUIT válido mediante `dniToValidCuit(dni)` (probando prefijos `20`, `27`, `23`, `24` con dígito verificador módulo 11).
   - Además, por seguridad, si el usuario es `CLIENT`, elimina cualquier `billing.amount` enviado en el payload (`shouldRemoveBillingAmount`).
4. **Generación atómica de código corto (`getNextEssayCodeForDate`):**
   - Implementada en [`EssayRepository.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/repositories/essays/EssayRepository.js).
   - Utiliza la tabla `daily_sequence_counters` (`scope = 'essay'`, `date_key = 'YYMMDD'`) mediante `INSERT ... ON CONFLICT (scope, date_key) DO UPDATE SET last_value = last_value + 1 RETURNING last_value` para garantizar atomicidad bajo concurrencia.
   - Convierte la secuencia numérica a letras (`1 -> A`, ..., `26 -> Z`, `27 -> AA`) mediante `sequenceNumberToLetters`, produciendo códigos como `261117A`, verifica que no exista colisión en `essays.code` y sincroniza el contador si es necesario. Si `daily_sequence_counters` no existiera, recurre a `pg_advisory_xact_lock`.
   - Para filtros por fecha (`dateFrom`/`dateTo`) en listados (`/essays/fetch`, `/essays/export*`), `EssayRepository` interpreta las fechas en la zona horaria `America/Argentina/Buenos_Aires`.
5. **Snapshot inmutable del cliente (`essays_client`) y post-commit:**
   - Dentro de `withTransaction`, persiste `essays`, `essays_elements`, `essays_client` (copia exacta de razón social, CUIT, domicilio, representante, contacto y facturación alternativa) y eventos `ESSAY_CLIENT_UPDATED` + `REQUEST_CREATED`.
   - Fuera de la transacción SQL: registra metadatos del documento `F-PC13-01` (`file = 'on-demand'`), captura la snapshot criptográfica con OTS (`SnapshotApplicationService`), y dispara notificaciones al laboratorio y al solicitante.

### 2.2. Actualización del Snapshot (`PUT /essays/:id/client`)
- Permite actualizar los datos congelados en `essays_client` mediante `EssayClient.fromClient(payload)`.
- Un usuario `CLIENT` solo puede modificarlos mientras `essay.status === 'REQUESTED'` (luego recibe `403 ESSAY_CLIENT_LOCKED`); además, se preserva su contacto original. El laboratorio puede actualizarlos en etapas posteriores y toda edición queda auditada con `ESSAY_CLIENT_UPDATED`.

### 2.3. Contrato de Servicio (`POST /essays/generate-contract`)
- Protegido por `requireLaboratory`, `requireLabPermission('essays.estados')` y `pdfGenerationLimiter`.
- Valida `SetTermsDTO`: `days_to_do > 0`, `price >= 0` y `samples_conservation_days > 0`.
- Requiere que el ensayo esté en `ACCEPTED`. Persiste `essays_terms`, cambia el estado a `SERVICE_AGREEMENT_MADED`, audita `CONTRACT_CREATED`, registra los metadatos de `F-PC13-02`, toma snapshot criptográfica con OTS y notifica al cliente.

---

## 3. Plantillas Reutilizables de Elementos (`EssayElementTemplateApplicationService`)

Implementadas en [`src/application/essays/services/EssayElementTemplateApplicationService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/essays/services/EssayElementTemplateApplicationService.js) sobre la tabla `essay_element_templates` (`product`, `manufacturer`, `country`, `origin`, `user_id`):

- **Aislamiento por perfil:**
  - Perfil `CLIENT`: cada usuario gestiona sus propias plantillas privadas (`origin = 'CLIENT'`, `user_id = user.id`).
  - Perfil `LABORATORY`: las plantillas pertenecen al ámbito compartido del laboratorio (`origin = 'LABORATORY'`, `user_id = null`), visibles y utilizables por todos los integrantes internos.
- **Endpoints:**
  - `GET /essays/element-templates`: lista las plantillas disponibles para el usuario/perfil actual.
  - `POST /essays/element-templates`: valida `CreateEssayElementTemplateDTO` (`product` y `manufacturer` obligatorios, `country` opcional) y devuelve `201` con la plantilla creada.
  - `DELETE /essays/element-templates/:id`: elimina una plantilla verificando pertenencia al usuario/perfil.

---

## 4. Órdenes de Trabajo y Recepción de Muestras

### 4.1. Estados de Orden de Trabajo y Muestras
- **Orden de Trabajo ([`WorkOrderStatus`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/essays/value-objects/WorkOrderStatus.js)):** `WAITING_SAMPLES`, `ANALYZING`, `COMPLETED`, `CANCELLED`.
- **Muestra ([`SampleStatus`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/essays/value-objects/SampleStatus.js)):** `PENDING`, `ANALYZED`, `REJECTED`, `SAVED`, `RETURNED` (el Value Object incluye también `RECEIVED`).

### 4.2. Recepción Unificada (`POST /samples/receive-samples` y `POST /essays/samples/load`)
Ambos endpoints requieren perfil `LABORATORY`, permiso `muestras.recepcionar` y `pdfGenerationLimiter`. Delegan en `EssayApplicationService.receiveSamples(essayId, data)`:

1. **Validación de estado y límites:** Exige que el ensayo esté en `SERVICE_AGREEMENT_MADED`. `ReceiveSamplesDTO` acota `samples_count` y `countersamples_count` a un máximo de **100 unidades por tipo** (y el servicio verifica total `<= 200`, exigiendo al menos 1 unidad cuando `accepted === true`).
2. **Caso de rechazo de muestras (`accepted: false`):**
   - Adjunta observaciones al ensayo, transiciona el estado a `CANCELLED`, audita `ESSAY_CANCELLED` (`reason: 'samples_not_accepted'`), notifica al cliente y responde `{ cancelled: true, essay }`.
3. **Caso de aceptación (`accepted: true`):**
   - Lee la variable de entorno de sistema `UNCERTAINTY` desde `EnvApplicationService` (sin abrir transacción aún).
   - Genera atómicamente el código de la orden en [`WorkOrderRepository.getNextWorkOrderCodeForDate`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/repositories/essays/WorkOrderRepository.js) usando `daily_sequence_counters` (`scope = 'work_order'`, `date_key = 'YYMMDD'`), obteniendo formato `YYMMDD` + letra (ej. `261117A`).
   - Calcula `report_delivery_deadline = generatedAt + essay.terms.daysToDo` días.
   - Redondea dimensiones (`height`, `width`, `thickness` o `large`) a 1 decimal y genera `sample_dimensions` (`"alto × ancho × espesor cm"`).
   - Crea la `WorkOrder` con `status = 'ANALYZING'`.
   - Genera los códigos individuales de cada probeta y contramuestra con [`SampleService.generateSampleCode`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/domain/essays/services/SampleService.js):
     - Muestra normal: `YY-MMDD[L]-CC` (ej. `26-1117A-01`).
     - Contramuestra (`countersample: true`): sufijo `C` (ej. `26-1117A-01C`).
   - Cambia el ensayo a `IN_WORK`, registra eventos `SAMPLES_RECEIVED` en `essay_audit_logs` y `work_order_audit_logs`, registra metadatos de `F-PC16-01` y notifica al cliente.

> **Nota de optimización de consultas:** `GET /samples/fetch` (`getAllWorkOrders`) carga las órdenes de trabajo y sus ensayos relacionados en **2 consultas SQL** usando `essayRepository.findByIds(...)` para evitar el problema N+1.

---

## 5. Carga de Resultados, Clasificación y Emisión de Informes

### 5.1. Carga de Resultados (`POST /essays/samples/load-result`)
Protegido por `requireLaboratory` y `requireLabPermission('ordenes.ensayar')`. Valida `LoadSampleResultsDTO` (máximo **200 muestras por lote**, valores numéricos finitos vía `Number.isFinite` o `null`):
1. Verifica que todas las muestras enviadas pertenezcan a la `workOrderId` indicada (`400 SAMPLE_MISMATCH`).
2. Actualiza cada muestra mediante `Sample.setResult(numericResult)`, lo cual asigna `status = 'ANALYZED'` cuando el resultado no es nulo.
3. Recalcula el promedio aritmético (`average_value`, redondeado a 4 decimales con `.toFixed(4)`) entre las muestras que tienen resultado cargado y actualiza `last_update` tanto en `work_orders` como en `essays`.
4. Audita `RESULTS_LOADED` en `essay_audit_logs` y `work_order_audit_logs`.

### 5.2. Emisión de Informe Final (`POST /essays/emit-report` y `POST /samples/:id/close-and-emit-report`)
Protegidos por `requireLaboratory`, `pdfGenerationLimiter` y los permisos `essays.informes` / `ordenes.cerrar` respectivamente:
1. **Validación mínima de probetas:** `WorkOrder.validateSamplesForReport()` y `EssayDomainService.validateCanEmitReport()` exigen **al menos 2 muestras con resultado numérico cargado** (`400 INSUFFICIENT_SAMPLE_RESULTS`).
2. **Emisión original vs Modificación (`Essay.generateReportConfig`):**
   - Si no existe un `F-PC15-01` previo, emite el **informe original**, cierra la orden (`status = 'COMPLETED'`, `closed_at = emittedAt`), finaliza el ensayo (`status = 'COMPLETED'`, `finishDate`, `lastReportGenerated`) y copia `average_value` e `uncertainty` al ensayo.
   - Si ya existe un informe previo, emite automáticamente una **modificación numerada** (`modificated: true`, encabezado `MODIFICACIÓN Nº X AL INFORME DE ENSAYO Nº ...`) y actualiza `lastReportGenerated` y `lastUpdate`.
3. **Auditoría y notificación:** Registra `REPORT_ISSUED` con `resultsSnapshot` en `metadata`, registra metadatos de `F-PC15-01` y notifica al cliente cuando es la emisión original (`COMPLETED`).
4. **Clasificación normativa (Formaldehído):** Al serializar en `EssayApplicationService.mapToDTO` y en la exportación (`enrichEssaysForExport`), para ensayos finalizados/emitidos con resultado numérico:
   - `result <= 3.5` → clasificación **`E1`**.
   - `3.5 < result <= 8.0` → clasificación **`E2`**.

---

## 6. Exportación a Planillas CSV y Excel (`essaySpreadsheetExport.js`)

Implementada en [`src/application/essays/export/essaySpreadsheetExport.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/essays/export/essaySpreadsheetExport.js) y expuesta en `GET /essays/export/count` y `GET /essays/export` (con `exportLimiter`: **20 solicitudes cada 5 minutos**).

### 6.1. Filtros y Límite de Filas
Acepta los mismos parámetros query que `GET /essays/fetch`: `code`, `status`, `dateFrom` (o `date_from`), `dateTo` (o `date_to`). En exportación consulta hasta un tope de **1.000 ensayos** (`limit: 1000`), y en `GET /essays/fetch` acota `limit` a un máximo de **500**.

### 6.2. Protección contra Formula / CSV Injection
Todas las celdas pasan por `sanitizeFormulaValue(val)`:
- Si un texto (ignorando espacios/tabs/saltos iniciales) comienza con `=`, `+`, `-`, `@`, `\t` o `\r`, se prefija automáticamente con una comilla simple (`'`), neutralizando ejecución de fórmulas en Microsoft Excel, LibreOffice Calc y Google Sheets.
- Los números negativos puros (`/^-[0-9]+([.,][0-9]+)?$/`), números nativos y booleanos no se alteran.

### 6.3. Estructura de Formatos Soportados
- **Formato `csv` (`GET /essays/export?format=csv`):**
  - Descarga `solicitudes-ensayo-YYYY-MM-DD.csv` (`Content-Type: text/csv; charset=utf-8`) con **BOM UTF-8 (`\uFEFF`)** y separadores de línea `CRLF` (`\r\n`).
  - Exporta la tabla de **Solicitudes** (34 columnas: datos del ensayo, producto, términos, resultado/clasificación, cliente/contacto, facturación y datos de OT cuando corresponda).
- **Formato `xlsx` (`GET /essays/export?format=xlsx`):**
  - Genera un libro con **ExcelJS** (`solicitudes-ensayo-YYYY-MM-DD.xlsx`) compuesto por 3 hojas con primera fila congelada (`ySplit: 1`), encabezados en negrita y ajuste automático de ancho de columna (tope 52 caracteres):
    1. **`Solicitudes`**: las 34 columnas completas de cada ensayo.
    2. **`Ordenes de trabajo`**: 11 columnas con el detalle de las OT visibles.
    3. **`Clientes`**: 6 columnas (`cuit`, `razon_social`, `representante`, `contacto_nombre`, `contacto_mail`, `contacto_telefono`) deduplicadas por combinación `cuit|name|id`.
- **Regla de visibilidad en exportación:** Los datos de la orden de trabajo (`ot_*` y hoja `Ordenes de trabajo`) solo se incluyen cuando el usuario tiene perfil `LABORATORY` o cuando el ensayo ya alcanzó estado `COMPLETED`.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/09-GENERACION_DOCUMENTOS_PDF.md -->

# Arquitectura y Funcionamiento de la Generación de Documentos PDF

Este documento detalla la arquitectura, el ciclo de vida, el motor de plantillas Handlebars, los helpers registrados, la estructura de datos inyectada y la operativa técnica del sistema de generación y descarga de documentos PDF (formularios normalizados del Laboratorio CTM).

---

## 1. Visión General y Filosofía de Diseño

El sistema opera bajo un modelo de **generación *On The Fly* (bajo demanda) sin almacenamiento persistente**:

* **Flujos de negocio rápidos y desacoplados:** Los procesos operativos (`receiveSamples`, `createEssay`, `agreeToTerms`, `emitReport`) completan sus transacciones en base de datos registrando únicamente los metadatos documentales correspondientes en milisegundos (`file = 'on-demand'`).
* **Generación en memoria al descargar:** Cuando el usuario hace clic en **"Descargar"** en la aplicación, el servidor compila la plantilla Handlebars con los datos en vivo del ensayo, genera el PDF en memoria mediante Chromium headless y lo transmite directamente al navegador como adjunto binario (`Content-Type: application/pdf`).
* **Sin almacenamiento intermedio:** Los documentos no se guardan en disco local ni en almacenamiento externo (R2), evitando saturación de almacenamiento y asegurando que cada descarga refleje siempre los datos más actualizados del ensayo.

---

## 2. Catálogo de Formularios y Plantillas

Cada tipo de documento está respaldado por una plantilla HTML Handlebars y registrado en la tabla `types_documents`:

| Código Formulario | Nombre del Documento | Plantilla HTML Base | Evento de Negocio Asociado |
|---|---|---|---|
| **F-PC13-01** | Solicitud de ensayo | `src/infrastructure/templates/essays_forms/fpc131.html` | Creación de la solicitud de ensayo (`POST /essays/create`) |
| **F-PC13-02** | Contrato de servicio / Acuerdo | `src/infrastructure/templates/essays_forms/fpc132.html` | Aceptación de términos y condiciones (`POST /essays/generate-contract`) |
| **F-PC16-01** | Registro de recepción de muestras | `src/infrastructure/templates/essays_forms/fpc161.html` | Recepción y aceptación de muestras en laboratorio (`POST /samples/receive-samples`) |
| **F-PC15-01** | Informe final de ensayo | `src/infrastructure/templates/essays_forms/fpc151.html` | Emisión final, copias o modificaciones de informe (`POST /essays/emit-report` o `/:id/close-and-emit-report`) |

---

## 3. Motor Handlebars, Compilación y Caché

El renderizado HTML se gestiona a través de la clase `HandlebarsService` (`src/infrastructure/templates/HandlebarsService.js`).

### 3.1. Caché en Memoria (`compiledTemplatesCache`)
Compilar una plantilla con `Handlebars.compile(templateString)` es una operación intensiva en CPU. Para maximizar el rendimiento:
* Las plantillas compiladas se almacenan en un `Map` en memoria (`compiledTemplatesCache`).
* La primera descarga de un formulario compila la plantilla; las siguientes solicitudes reutilizan directamente la función compilada desde memoria, tardando menos de 1 milisegundo en generar el HTML final.

### 3.2. Estrategia de Carga de Plantillas (Doble Capa)
```mermaid
flowchart TD
    Q{"¿Existe el archivo .html<br/>físico en disco?"}
    YES["Lectura en vivo (fs)<br/>Desarrollo local y bundle físico serverless"]
    NO["Lectura en memoria (embeddedTemplates.js)<br/>Fallback nativo en memoria"]

    Q -- "SÍ" --> YES
    Q -- "NO" --> NO
```

1. **Lectura física prioritaria (`fs.existsSync`):** En desarrollo local, `HandlebarsService` lee directamente los archivos `.html` de `src/infrastructure/templates/essays_forms/`. Los cambios guardados se reflejan inmediatamente.
2. **Fallback en memoria (`embeddedTemplates.js`):** En entornos serverless donde no se empaquetan archivos estáticos, se recurre al diccionario JS en memoria, garantizando disponibilidad sin errores `ENOENT`.
3. **Sincronización:** El script `scripts/sync-templates.js` (vinculado a `npm run build:templates` y al hook `postinstall`) mantiene sincronizados los archivos `.html` con el módulo embebido en cada despliegue.

---

## 4. Helpers Registrados de Handlebars

Handlebars cuenta con una serie de helpers personalizados registrados globalmente para soportar lógica condicional, formateo de fechas en español, conversión de números y teléfonos:

### 4.1. Helpers Lógicos y Comparadores
Permiten evaluar condiciones complejas y subexpresiones anidadas:

| Helper | Descripción | Ejemplo de Uso en Plantilla |
|---|---|---|
| `and` | Retorna `true` si todos los argumentos son verdaderos. | `{{#if (and billing.cuit (ne billing.cuit client.cuit))}}` |
| `or` | Retorna `true` si al menos un argumento es verdadero. | `{{#if (or terms.price terms.days_to_do)}}` |
| `eq` | Igualdad estricta (`===`). | `{{#if (eq status "COMPLETED")}}` |
| `ne` | Desigualdad estricta (`!==`). | `{{#if (ne billing.cuit client.cuit)}}` |
| `gt` | Mayor que (`>`). | `{{#if (gt copy 0)}}` |
| `gte` | Mayor o igual (`>=`). | `{{#if (gte samples_count 10)}}` |
| `lt` | Menor que (`<`). | `{{#if (lt copy 2)}}` |
| `lte` | Menor o igual (`<=`). | `{{#if (lte price 0)}}` |
| `not` | Negación lógica (`!`). | `{{#if (not internal_aconditioning)}}` |

### 4.2. Helpers de Fechas y Tiempo
Formatean fechas de forma consistente en castellano:

* **`formatDate date format`:**
  * Parámetros: `date` (Date o string ISO) y `format` (patrón de salida).
  * Patrones soportados:
    * `'dd/MM/YYYY'` o `'dd/mm/yyyy'`: Ej. `13/11/2026`.
    * `'yyyy-mm-dd'`: Formato ISO plano (`2026-11-13`).
    * `'dd'`: Día de dos dígitos (`13`).
    * `'MM'`: Mes numérico de dos dígitos (`11`).
    * `'YYYY'` / `'yyyy'`: Año de cuatro dígitos (`2026`).
  * *Ejemplo:* `{{formatDate requestDate "dd/MM/YYYY"}}`
* **`monthName date`:**
  * Retorna el nombre completo del mes en mayúsculas en español (`ENERO`, `FEBRERO`, ..., `NOVIEMBRE`, `DICIEMBRE`).
  * *Ejemplo:* `{{monthName request_date}}`
* **`dateParts date`:**
  * Retorna un objeto `{ day, month, year }` con valores de dos y cuatro dígitos.

### 4.3. Helpers de Formato Numérico y Texto
* **`numeroATexto numero`:**
  * Convierte valores numéricos a palabras en castellano en mayúsculas (usando la biblioteca `written-number`).
  * *Ejemplo:* Si `terms.days_to_do` es `15`, `{{numeroATexto terms.days_to_do}}` produce `"QUINCE"`.
* **`formatearNumero numero`:**
  * Formatea números monetarios o de grandes cantidades con separadores de miles según la configuración regional argentina (`es-AR`).
  * *Ejemplo:* Si `terms.price` es `150000`, `{{formatearNumero terms.price}}` produce `"150.000"`.

### 4.4. Helper de Teléfonos
* **`formatPhoneNumber country_code number`:**
  * Normaliza y formatea teléfonos fijos o móviles:
    * Si tiene 10 dígitos: `+54 11 1234-5678`.
    * Si tiene 8 dígitos: `+54 1234-5678`.
  * *Ejemplo:* `{{formatPhoneNumber client.contact.country_code client.contact.phone}}`

---

## 5. Estructura de Datos (Payloads) por Formulario

Al invocar `DocumentApplicationService.generatePDFBuffer`, se construye un objeto de contexto que combina variables globales del laboratorio con la información específica de cada formulario.

### 5.1. Datos Globales Comunes (Todos los Formularios)
Todas las plantillas reciben de forma automática:
* **`headerImageDataUrl` (string):** Data URI en Base64 de la imagen institucional del Laboratorio CTM (`data:image/jpeg;base64,...`). Se inyecta en el tag `<img src="{{headerImageDataUrl}}">` sin requerir peticiones de red externas.
* **`env` (object):** Variables institucionales y de negocio activas:
  ```json
  {
    "SOCIAL_NAME": "Fundación para el Desarrollo de Cañada de Gómez (FU.DE.CA.)",
    "CUIT": "30-68194488-8",
    "LOCAL_ADDRESS": "Parque Industrial I, Lote N°9...",
    "LOCATION": "Cañada de Gómez",
    "PROVINCE": "Santa Fe",
    "PRESIDENT": "Nombre del Presidente",
    "PRESIDENT_DNI": "20.123.456",
    "LAB_DIRECTOR": "Director del Laboratorio",
    "LAB_PHONE": "+54 3471 123456",
    "LAB_MAIL": "info@ctmueble.com.ar",
    "BANK": "Banco Nación",
    "BANK_CC": "12345678/90",
    "BANK_CBU": "0110123400012345678901"
  }
  ```

---

### 5.2. Payload de F-PC13-01 (Solicitud de Ensayo)
Plantilla: `src/infrastructure/templates/essays_forms/fpc131.html`

Representa la solicitud inicial presentada por el comitente.

```json
{
  "code": "20261113A",
  "requestDate": "2026-11-13T10:00:00Z",
  "client": {
    "name": "Maderera San José S.A.",
    "cuit": "30-71234567-8",
    "contact": {
      "name": "Carlos González",
      "address": "Av. Libertador 1500",
      "location": "Rosario",
      "district": { "name": "Santa Fe" },
      "country_code": "54",
      "phone": "3411234567",
      "mail": "carlos@madererasanjose.com"
    }
  },
  "billing": {
    "cuit": "30-71234567-8",
    "address": "Av. Libertador 1500",
    "location": "Rosario",
    "district": "Santa Fe",
    "iva": "RESPONSABLE_INSCRIPTO"
  },
  "type": {
    "name": "Determinación de la emisión de formaldehído según IT17-01"
  },
  "elements": {
    "product": "Tableros de partículas de madera (MDF)",
    "manufacturer": "Fábrica Norte",
    "date": "2026-11-10",
    "batch_number": "L-2026-B1",
    "country": { "name": "Argentina" }
  },
  "observations": "Muestras embaladas en film termocontraíble según instrucciones.",
  "env": { "..." : "..." },
  "headerImageDataUrl": "data:image/jpeg;base64,..."
}
```

---

### 5.3. Payload de F-PC13-02 (Contrato de Servicio)
Plantilla: `src/infrastructure/templates/essays_forms/fpc132.html`

Representa el acuerdo legal entre FU.DE.CA. y el cliente:

```json
{
  "code": "20261113A",
  "request_date": "2026-11-13T10:00:00Z",
  "client": {
    "name": "Maderera San José S.A.",
    "cuit": "30-71234567-8",
    "address": {
      "address": "Av. Libertador 1500",
      "location": "Rosario"
    },
    "representative": {
      "name": "Carlos González",
      "dni": "28.987.654"
    }
  },
  "type": {
    "name": "Determinación de la emisión de formaldehído según IT17-01"
  },
  "terms": {
    "price": 185000,
    "days_to_do": 15,
    "samples_conservation_days": 30
  },
  "env": { "..." : "..." },
  "headerImageDataUrl": "data:image/jpeg;base64,..."
}
```

---

### 5.4. Payload de F-PC16-01 (Registro de Recepción de Muestras)
Plantilla: `src/infrastructure/templates/essays_forms/fpc161.html`

Representa la constancia de recepción física de probetas en el laboratorio:

```json
{
  "code": "OT-20261113-01",
  "essay_track_code": "20261113A",
  "generated_at": "2026-11-13T11:00:00Z",
  "element_to_essay": "Tableros de partículas de madera (MDF)",
  "samples_count": 6,
  "observations": "Muestras recibidas en perfecto estado, rotuladas correlativamente.",
  "internal_aconditioning": true,
  "sample_dimensions": "20 x 20 x 1.5 cm",
  "env": { "..." : "..." },
  "headerImageDataUrl": "data:image/jpeg;base64,..."
}
```

---

### 5.5. Payload de F-PC15-01 (Informe Final de Ensayo)
Plantilla: `src/infrastructure/templates/essays_forms/fpc151.html`

Representa el informe técnico emitido por el laboratorio con los resultados analíticos:

```json
{
  "code": "20261113A",
  "headerTitle": "INFORME DE ENSAYO",
  "lastReportGenerated": "2026-11-20T16:00:00Z",
  "finishDate": "2026-11-20",
  "client": {
    "name": "Maderera San José S.A.",
    "cuit": "30-71234567-8",
    "address": { "address": "Av. Libertador 1500", "location": "Rosario", "province": "Santa Fe" },
    "contact": { "name": "Carlos González", "mail": "carlos@madererasanjose.com", "phone": "3411234567" }
  },
  "elements": {
    "product": "Tableros de partículas de madera (MDF)",
    "manufacturer": "Fábrica Norte",
    "batch_number": "L-2026-B1",
    "country": { "name": "Argentina" }
  },
  "type": {
    "name": "Determinación de la emisión de formaldehído según IT17-01"
  },
  "workOrder": {
    "code": "OT-20261113-01",
    "samples_received_at": "2026-11-13T11:00:00Z",
    "sample_dimensions": "20 x 20 x 1.5 cm",
    "internal_aconditioning": true,
    "average_value": "0.12",
    "uncertainty": "0.02",
    "samples": [
      { "code": "20261113-01-01", "result": "0.11" },
      { "code": "20261113-01-02", "result": "0.13" },
      { "code": "20261113-01-03", "result": "0.12" }
    ]
  },
  "copy": 0,
  "modificated": false,
  "isCopy": false,
  "isModificated": false,
  "env": { "..." : "..." },
  "headerImageDataUrl": "data:image/jpeg;base64,..."
}
```

---

## 6. Endpoints de Descarga y Resolución de Documentos

### 6.1. Descarga por Tipo de Documento
* **Endpoint:** `GET /essays/download-document-by-type`
* **Parámetros Query:**
  * `essayId` (UUID): Identificador del ensayo.
  * `type` (string): Código del formulario deseado (`F-PC13-01`, `F-PC13-02`, `F-PC16-01`, `F-PC15-01`).
* **Funcionamiento:** Valida permisos y genera el documento On The Fly a partir del estado actual del ensayo.

### 6.2. Descarga por ID
* **Endpoint:** `GET /essays/download-document`
* **Parámetros Query:**
  * `id` (UUID): Identificador del documento, de la orden de trabajo o del ensayo.
* **Resolución inteligente:**
  1. Si `id` pertenece a un registro en `essays_documents`, recupera sus metadatos (copia, modificación, tipo) y genera el PDF On The Fly.
  2. Si `id` coincide con el identificador de una orden de trabajo, genera automáticamente el comprobante de recepción `F-PC16-01`.
  3. Si `id` coincide con el identificador de un ensayo, genera el informe `F-PC15-01` (si está finalizado) o la solicitud `F-PC13-01`.

---

## 7. Seguridad y Concurrencia

* **Prevención de IDOR (Insecure Direct Object Reference):** `_assertEssayOwnership` valida en cada descarga que el usuario pertenezca al perfil `LABORATORY` o sea el titular legítimo del ensayo. Cualquier petición no autorizada recibe `404 DOCUMENT_NOT_FOUND` para evitar enumeración.
* **Aislamiento SSRF en Chromium:** Durante la generación del PDF se habilita `setRequestInterception(true)`, bloqueando cualquier llamada externa HTTP/HTTPS o accesos locales `file://` dentro de las plantillas. Solo se autorizan esquemas de datos seguros (`data:`, `about:`, `blob:`).
* **Control de concurrencia y memoria:** Se implementa un semáforo de ejecución (`PDF_MAX_CONCURRENCY`) con cola de espera y timeout para evitar sobreconsumo de memoria RAM en entornos concurrentes.
* **Rate Limiting:** Los endpoints de descarga están protegidos por el middleware `pdfGenerationLimiter` contra solicitudes masivas repetitivas.

---

## 8. Guía de Modificación de Plantillas para Desarrolladores

Para editar cualquiera de las plantillas:

1. Modifica directamente el archivo `.html` en `src/infrastructure/templates/essays_forms/`:
   * **F-PC13-01:** `fpc131.html`
   * **F-PC13-02:** `fpc132.html`
   * **F-PC15-01:** `fpc151.html`
   * **F-PC16-01:** `fpc161.html`
2. Puedes emplear cualquiera de los helpers detallados en la Sección 4 (`formatDate`, `numeroATexto`, `formatearNumero`, `formatPhoneNumber`, `and`, `or`, `eq`, etc.).
3. *(Opcional)* Ejecuta en la terminal para sincronizar el módulo embebido localmente:
   ```bash
   npm run build:templates
   ```
4. Guarda y sube los cambios mediante git (`git commit` y `git push`). El proceso de despliegue en Vercel sincronizará automáticamente las plantillas.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md -->

# Sistema de Notificaciones por Correo Electrónico

## 1. Resumen Ejecutivo y Objetivos

El sistema de notificaciones por correo electrónico de **CTM Gestión** tiene como propósito mantener informados tanto a los clientes solicitantes como al equipo técnico del laboratorio sobre el ciclo de vida y los cambios de estado de las solicitudes de ensayo.

### Objetivos Clave
1. **Notificación en tiempo real al solicitante:** Cada cambio en el estado de una solicitud (`REQUESTED`, `ACCEPTED`, `REJECTED`, `SERVICE_AGREEMENT_MADED`, `IN_WORK`, `COMPLETED`, `CANCELLED`) envía automáticamente un correo con el mismo título y mensaje explicativo que se visualiza en la interfaz de usuario (`ClientEssayStatusBanner`).
2. **Consentimiento explícito y control de privacidad:** En el formulario de creación de la solicitud, el cliente cuenta con un selector de activación de notificaciones (habilitado por defecto). Además, cada correo enviado aclara expresamente que se recibe por autorización del solicitante e incluye un enlace directo con token único para darse de baja sin requerir inicio de sesión.
3. **Gestión desde el sistema y auditoría completa:** Tanto el solicitante como el personal del laboratorio pueden activar o desactivar las notificaciones directamente desde el detalle de la solicitud en la plataforma. Toda modificación queda registrada de forma inmutable en el historial (`essay_audit_logs`).
4. **Alerta de nueva solicitud para el laboratorio:** Posibilidad de configurar desde los ajustes del laboratorio si se desean recibir correos de aviso ante cada nueva solicitud ingresada, personalizando la casilla de destino.
5. **Seguridad y sanitización de errores:** Ningún fallo interno, consulta SQL ni excepción de infraestructura es expuesta al cliente. El envío de correos se ejecuta de forma desacoplada y fuera de las transacciones de base de datos para garantizar la integridad transaccional.

---

## 2. Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Frontend["Frontend (oficina.ctmueble.com.ar)"]
        UI_Req[Modal Nueva Solicitud<br>Checkbox Habilitado]
        UI_Detail[Detalle de Solicitud<br>Toggle Notificaciones]
        UI_Config[Configuración Laboratorio<br>MailingConfigTab]
        UI_Unsub[Página Pública<br>Unsubscribe /token]
    end

    subgraph Backend["Backend (gestion.ctmueble.com.ar)"]
        Ctrl_Essay[Essays Controller<br>updateNotifications / unsubscribe]
        Ctrl_ApiKey[ApiKey Controller<br>updateMetadata]
        AppSvc_Essay[EssayApplicationService<br>_notifyClientStatusChange<br>_notifyLaboratoryNewRequest]
        MailingSvc[MailingService<br>Resend API Client]
        AuditSvc[EssayAuditLogService]
        Repo_Essay[(PostgreSQL - Neon DB<br>essays & essay_audit_logs)]
    end

    subgraph External["Servicios Externos / Destinatarios"]
        Resend[Resend API<br>Proveedor de Correo]
        ClientEmail[Bandeja Solicitante]
        LabEmail[Bandeja Laboratorio]
    end

    UI_Req -->|POST /essays| Ctrl_Essay
    UI_Detail -->|PUT /essays/:id/notifications| Ctrl_Essay
    UI_Unsub -->|GET/POST /essays/:id/unsubscribe| Ctrl_Essay
    UI_Config -->|POST /api-keys| Ctrl_ApiKey

    Ctrl_Essay --> AppSvc_Essay
    AppSvc_Essay --> Repo_Essay
    AppSvc_Essay --> AuditSvc
    AuditSvc --> Repo_Essay

    AppSvc_Essay -.->|Post-commit Async| MailingSvc
    MailingSvc --> Resend
    Resend --> ClientEmail
    Resend --> LabEmail
```

---

## 3. Modelo de Datos y Migraciones

### 3.1. Campos agregados a la tabla `essays`
Migración: `src/infrastructure/migrations/20261113000000-add-essay-client-notifications.js`

| Columna | Tipo | Nulo | Valor por defecto | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `client_notifications_enabled` | `BOOLEAN` | NO | `true` | Indica si el solicitante recibe notificaciones para este ensayo. |
| `notification_token` | `UUID` | SI | `gen_random_uuid()` | Token único para desuscripción con 1 clic desde el correo. |

- **Índice:** `idx_essays_notification_token` sobre `notification_token` para búsquedas eficientes en la ruta pública de desuscripción.

### 3.2. Eventos de Auditoría (`essay_audit_logs`)
Valores incorporados en `EssayAuditEvent`:
- `NOTIFICATIONS_ENABLED`: Registrado cuando un usuario (cliente o personal de laboratorio) activa las alertas por correo.
- `NOTIFICATIONS_DISABLED`: Registrado cuando se desactivan las alertas, ya sea desde el sistema o mediante el enlace de desuscripción del correo (`source: 'UNSUBSCRIBE_LINK'`).

---

## 4. Mensajes y Estados Notificados al Solicitante

El correo electrónico replica exactamente los textos informativos presentados en el banner superior (`ClientEssayStatusBanner`) de la plataforma:

| Estado (`status`) | Título en el Correo | Descripción en el Correo |
| :--- | :--- | :--- |
| `REQUESTED` | Esperando respuesta del laboratorio acerca de tu solicitud | Tu solicitud de ensayo fue enviada exitosamente. El equipo del laboratorio está revisando la viabilidad técnica para aceptarla. |
| `ACCEPTED` | La solicitud fue aceptada | El laboratorio aceptó tu solicitud. En este momento se están formalizando los términos del contrato de servicio. |
| `REJECTED` | La solicitud fue rechazada | El laboratorio no pudo aceptar esta solicitud. Motivo indicado: *[observaciones]* (o mensaje estándar si no se especificaron). |
| `SERVICE_AGREEMENT_MADED` | Esperando recepción de muestras | El acuerdo de servicio está definido. El laboratorio aguarda la llegada de las muestras y contramuestras físicas para dar inicio a los análisis. |
| `IN_WORK` | El laboratorio está analizando las muestras | Las muestras fueron recibidas de conformidad. El equipo técnico del laboratorio se encuentra ejecutando los ensayos correspondientes. |
| `COMPLETED` | Informe emitido | El ensayo ha finalizado exitosamente. El informe formal técnico ya está emitido y listo para su consulta y descarga. |
| `CANCELLED` | El ensayo fue cancelado | El ensayo fue cancelado. Motivo: *[observaciones]* |

---

## 5. Notificación de Nuevas Solicitudes al Laboratorio

Desde la pestaña de configuración del laboratorio (**Configuración > Credenciales > Mailing**):
- El administrador puede tildar **"Notificar al laboratorio cuando entre una nueva solicitud de ensayo"**.
- Se puede definir un correo de notificación específico (o utilizar por defecto el configurado en la entidad del laboratorio).
- El correo incluye:
  - Código del ensayo (`#YYMMDDX`).
  - Nombre de la empresa solicitante.
  - Nombre del contacto solicitante.
  - Producto y fabricante a ensayar.
  - Fecha de ingreso y observaciones.
  - Botón directo para abrir y gestionar la solicitud en la plataforma.

---

## 6. Mecanismo de Desuscripción (Opt-Out)

Cada correo enviado al cliente incluye al pie un bloque legal y funcional de desuscripción:
> *"Recibís este correo porque autorizaste las notificaciones sobre el estado de esta solicitud. Si ya no deseás recibir actualizaciones por correo electrónico para esta solicitud, podés [darte de baja aquí]."*

### Flujo de Desuscripción:
1. El usuario hace clic en el enlace `https://oficina.ctmueble.com.ar/unsubscribe?essayId=...&token=...`.
2. La vista `Unsubscribe.jsx` muestra un estado de carga y consume el endpoint público `POST /essays/:id/unsubscribe?token=...`.
3. El backend verifica la concordancia del token UUID con el ensayo correspondiente.
4. Se conmuta `client_notifications_enabled = false` y se registra el evento `NOTIFICATIONS_DISABLED` con metadatos `{ source: 'UNSUBSCRIBE_LINK' }`.
5. Si el usuario vuelve a hacer clic, la operación es **idempotente** e informa cordialmente que ya se encontraba desuscripto.
6. El solicitante o el laboratorio pueden reactivar las alertas en cualquier momento desde el botón en la cabecera del detalle del ensayo.

---

## 7. Políticas de Seguridad y Concurrencia Transaccional

### 7.1. Aislamiento Post-Commit
Para evitar la excepción de Sequelize `commit has been called on this transaction, you can no longer use it`:
- Toda notificación asincrónica (`_notifyClientStatusChange`, `_notifyLaboratoryNewRequest`) se invoca **estrictamente después** de que la transacción de base de datos haya ejecutado su `commit` exitoso.
- Las consultas de lectura de datos requeridas para generar los correos utilizan una instancia limpia de `EssayRepository` con `transaction: null`.

### 7.2. Sanitización Estricta de Errores
- La función utilitaria `handleControllerError` y el helper `isTechnicalOrDatabaseError` interceptan errores de base de datos (Postgres/Sequelize), fallos de sintaxis, `ReferenceError` y códigos HTTP 5xx.
- La respuesta HTTP enviada al cliente siempre devuelve mensajes genéricos y seguros (`"Ocurrió un error inesperado al procesar la solicitud. Por favor, intente nuevamente más tarde."`), garantizando que ninguna traza de base de datos, nombre de tabla o excepción interna sea expuesta en toasts o pantallas del cliente.
- El frontend filtra igualmente cualquier cadena técnica residual mediante la función `getCleanErrorMessage`.

---

## 8. Endpoints API

### 8.1. Actualizar Preferencia de Notificaciones
- **Ruta:** `PUT /essays/:id/notifications`
- **Seguridad:** Requiere autenticación JWT + CSRF Token + Idempotency-Key.
- **Body:**
  ```json
  {
    "enabled": false
  }
  ```
- **Respuesta (200 OK):** Objeto DTO del ensayo actualizado conteniendo `client_notifications_enabled: false`.

### 8.2. Desuscripción Pública por Token
- **Rutas:** `GET /essays/:id/unsubscribe`, `POST /essays/:id/unsubscribe` (o `.../notifications/unsubscribe`)
- **Seguridad:** Pública (validada mediante el parámetro de consulta o cuerpo `token`).
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Te has dado de baja correctamente de las notificaciones de esta solicitud",
    "essayCode": "260314A"
  }
  ```

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md -->

# Sistema de Auditoría, Integridad Criptográfica y Fecha Cierta (OpenTimestamps)

Este documento detalla la arquitectura, el diseño técnico y los flujos operativos del sistema de **auditoría inmutable, verificación de integridad y certificación de fecha cierta** implementado para la plataforma de gestión de ensayos del CTM (**gestion.ctmueble.com.ar** y **oficina.ctmueble.com.ar**).

---

## 1. Motivación y Contexto

Debido a que la documentación oficial (`F-PC13-01` Solicitud, `F-PC13-02` Contrato, `F-PC15-01` Informe, `F-PC16-01` Hoja de Ruta) se genera dinámicamente **On The Fly** en formato PDF sin almacenar archivos estáticos en almacenamiento de objetos (R2/S3) o disco, surgió la necesidad crítica de:

1. **Garantizar la inmutabilidad de los datos históricos**: Proteger el estado de la solicitud, contrato e informe tal como fueron emitidos en cada momento.
2. **Detección de manipulación de Base de Datos (*Tampering Detection*)**: Comprobar criptográficamente que los registros en la base de datos PostgreSQL no hayan sido modificados de forma arbitraria o malintencionada por accesos directos de administradores de BD.
3. **Fecha cierta legal con OpenTimestamps (OTS)**: Anclar el hash criptográfico del documento en calendarios públicos y en la blockchain de Bitcoin para demostrar que el documento existía en un estado exacto en un momento temporal determinado.
4. **Auditoría de operaciones con huella de dispositivo**: Vincular cada evento del ciclo de vida del ensayo con el usuario, sesión, navegador, sistema operativo y dirección IP de origen, con encadenamiento criptográfico de registros.
5. **Gestión controlada de modificaciones y re-emisiones**: Permitir la reemisión manual de documentos modificados, marcándolos inequívocamente (`modificated: true`) y capturando una nueva snapshot versionada.
6. **Experiencia de usuario accesible y segmentada**: Ofrecer a los clientes una verificación comprensible sobre la autenticidad del documento sin tecnicismos abrumadores, reservando la evidencia técnica avanzada (hashes, firmas RSA, pools OTS e IPs) al personal del laboratorio.

---

## 2. Arquitectura General

```mermaid
flowchart TD
    subgraph Frontend["Frontend (oficina.ctmueble.com.ar)"]
        UI_Doc["Pestaña Documentación"]
        UI_Hist["Pestaña Historial"]
        Btn_Validar["Botón 'Validar'"]
        Btn_Detalle["Botón 'Detalles'"]
        Modal_Val["SnapshotVerificationModal<br/>(Autenticidad y Validez)"]
        Modal_Hist["AuditLogDetailModal<br/>(Información de la Acción)"]
    end

    subgraph Backend["Backend (gestion.ctmueble.com.ar)"]
        Ctrl_Doc["Documents & Essays Controllers"]
        App_Snap["SnapshotApplicationService"]
        App_Audit["EssayAuditLogApplicationService"]
        Crypto["SnapshotCryptoService (RFC 8785 + RSA-SHA256)"]
        OTS["OpenTimestampsService (Pools Públicos Bitcoin)"]
    end

    subgraph DB["Base de Datos PostgreSQL"]
        T_Docs[("essays_documents")]
        T_Snap[("essay_document_snapshots")]
        T_Audit[("essay_audit_logs")]
    end

    subgraph External["Red Externa"]
        OTS_Pools["Calendarios OpenTimestamps<br/>(a.pool.opentimestamps.org, etc.)"]
    end

    UI_Doc -->|Descargar PDF On The Fly| Ctrl_Doc
    UI_Doc -->|Click Validar| Btn_Validar --> Modal_Val
    UI_Hist -->|Click Fila o Botón| Btn_Detalle --> Modal_Hist

    Modal_Val -->|GET /snapshots/:id/verify| App_Snap
    Modal_Hist -->|Lee auditLogs del Ensayo| App_Audit

    App_Snap --> Crypto
    App_Snap --> OTS
    App_Snap --> T_Snap

    App_Audit --> Crypto
    App_Audit --> T_Audit

    OTS -->|Digest Submission| OTS_Pools
```

---

## 3. Componentes Criptográficos e Integridad

### 3.1. Serialización Canónica (RFC 8785 / JCS)
Para que un hash SHA-256 sea determinista e idéntico sin importar el orden en que los motores de JavaScript o PostgreSQL devuelvan las claves de un objeto JSON, se implementó `CanonicalJson.stringify()` siguiendo el estándar **RFC 8785 (JSON Canonicalization Scheme - JCS)**:
- Ordenamiento lexicográfico estricto de claves por código Unicode UTF-16.
- Tratamiento canónico de números y normalización de fechas a ISO 8601 UTC.
- Eliminación de espacios en blanco y caracteres de formateo.

### 3.2. Firmado y Verificación Asimétrica (RSA-SHA256)
En `SnapshotCryptoService.js`:
- **Cálculo de Hash**: Se genera `canonicalHash = SHA256(canonicalPayload)`.
- **Firma Digital**: Se firma el hash canónico mediante la clave privada del sistema (o HMAC como respaldo si no hay par de claves configurado).
- **Verificación contra Manipulación (Tampering)**:
  1. Se reconstruye el payload canónico a partir de los datos actuales almacenados en `snapshot_data`.
  2. Se recalcula el hash SHA-256.
  3. Se compara el hash recalculado contra `canonical_hash`. Si no coinciden, se detecta alteración inmediata en los datos.
  4. Se verifica la firma criptográfica con la clave pública del sistema. Si los datos fueron editados en la base de datos, la firma queda invalidada.

---

## 4. Certificación de Fecha Cierta con OpenTimestamps (OTS)

En `OpenTimestampsService.js`:

### 4.1. Protocolo de Sellado
1. Al capturarse la snapshot o registrarse el evento, el hash canónico SHA-256 (32 bytes binarios) se envía mediante petición HTTP POST `application/x-www-form-urlencoded` o binaria al endpoint `/digest` de los calendarios distribuidos de OpenTimestamps:
   - `https://a.pool.opentimestamps.org/digest`
   - `https://b.pool.opentimestamps.org/digest`
   - `https://ots.btc.catallaxy.com/digest`
2. El calendario responde con las operaciones criptográficas del árbol de Merkle parcial del calendario.
3. El servicio ensambla el archivo de prueba `.ots` agregando la cabecera mágica oficial del estándar OpenTimestamps:
   `\x00OpenTimestamps\x00\x00Proof\x00\xbf\x89e\xa8\xdb$/`
4. El comprobante binario resultante se persiste en base64 en la columna `ots_proof` de la tabla `essay_document_snapshots`.

### 4.2. Descarga y Verificación Independiente
Los usuarios pueden descargar el archivo `.ots` y validarlo de forma completamente independiente de este software utilizando el cliente oficial de OpenTimestamps:
```bash
ots verify F-PC13-01_v1.ots
```
Lo que demuestra fehacientemente ante cualquier auditor, perito o tribunal que el documento existía en esa fecha exacta y no ha sido alterado.

---

## 5. Auditoría de Operaciones con Huella de Dispositivo

En `deviceInfo.js` y `EssayAuditLogRepository.js`:

Cada acción realizada en un ensayo registra:
- **Usuario**: ID (`userId`), nombre (`userName`) y perfil.
- **Evento**: Código estandarizado (`REQUEST_CREATED`, `REQUEST_MODIFIED`, `CONTRACT_CREATED`, `SAMPLES_RECEIVED`, `RESULTS_LOADED`, `REPORT_ISSUED`, `ESSAY_CLIENT_UPDATED`, etc.).
- **Dispositivo**: Nombre amigable del cliente obtenido de las cabeceras (ej. *"Google Chrome en Windows"*).
- **Red y Sesión**: Dirección IP del cliente, `session_id`, `device_id` y cadena completa de `user_agent`.
- **Integridad del Registro**:
  - `record_hash`: Hash SHA-256 canónico del contenido del registro.
  - `signature`: Firma digital RSA del registro.
  - `previous_hash`: Enlace al hash del registro anterior, formando una cadena verificable (*blockchain-like hash chain*).
- **Metadatos específicos**: Objeto JSON con los motivos de cambios, parámetros o diferencias.

---

## 6. Ciclo de Vida: Re-emisiones y Modificaciones

Para cumplir con las normas de gestión de calidad del laboratorio:
1. **Emisión Original**:
   - `F-PC13-01` se genera al crear la solicitud (`modificated: false`, `copy: 0`, snapshot `v1`).
   - `F-PC15-01` se genera al emitir el primer informe (`modificated: false`, `copy: 0`).
2. **Modificación de Solicitud**:
   - Los datos pueden modificarse en la ficha del ensayo.
   - La nueva versión **no se emite de forma automática**, sino manual desde la pestaña **"Documentación"** mediante el botón **"Re-emitir solicitud (F-PC13-01)"**.
   - Al re-emitir, se registra el motivo de la modificación, se marca el documento con `modificated: true`, se actualiza el PDF generado On The Fly y se toma una nueva snapshot inmutable (`v2`, `v3`, etc.) anclada con OpenTimestamps.
3. **Modificación de Informe**:
   - Si se modifican valores de muestras después de emitido el informe, el sistema detecta la discrepancia.
   - Desde la pestaña **"Resultados"**, el laboratorio re-emite el informe con el motivo del cambio.
   - Toda emisión posterior a la original queda permanentemente categorizada como `MODIFICATION` (`modificated: true`).

---

## 7. Experiencia de Usuario y Segmentación de Perfiles

Se rediseñó la interfaz para evitar jerga excesivamente técnica para clientes y mantener el rigor técnico para el laboratorio:

| Sección | Vista de Clientes | Vista de Laboratorio |
| :--- | :--- | :--- |
| **Tabla de Documentos** | Columna con botón **"Descargar"** y botón **"Validar"**. | Misma tabla, con botón **"Re-emitir solicitud"** habilitado. |
| **Modal de Validación** | - **"Documento auténtico y verificado"**<br/>- *"Contenido: Original y sin alteraciones"*<br/>- *"Firma digital del laboratorio: Válida y confirmada"*<br/>- *"Fecha y hora oficial (Fecha Cierta): Certificada"* con fecha y hora legible. | Misma información amigable, más sección desplegable:<br/>- Hash Canónico SHA-256<br/>- Algoritmo de firma<br/>- Servidor de calendario OTS<br/>- Botón **"Descargar comprobante (.ots)"**. |
| **Modal de Historial** | - Nombre de la acción y fecha legible.<br/>- Responsable y dispositivo.<br/>- Detalles amigables de la operación.<br/>- Confirmación de registro inalterable. | Misma información, más sección técnica desplegable:<br/>- Dirección IP y ID de Sesión<br/>- User Agent completo<br/>- Hash SHA-256 y Firma RSA del registro<br/>- Metadatos JSON completos. |

---

## 8. Resumen de Modelos y Rutas de API

### Modelos de Base de Datos
- **`essay_document_snapshots`**:
  `id`, `essay_id`, `document_type`, `version`, `event_code`, `snapshot_data` (JSONB), `canonical_hash`, `signature`, `signature_algorithm`, `ots_status`, `ots_proof`, `ots_calendar_url`, `ots_stamped_at`, `ots_error`, `user_id`, `session_id`, `device_id`, `client_name`, `ip_address`, `user_agent`, `created_at`.
- **`essay_audit_logs`**:
  `id`, `essay`, `user_id`, `event_code`, `timestamp`, `metadata` (JSONB), `client_name`, `ip_address`, `user_agent`, `session_id`, `device_id`, `record_hash`, `signature`, `previous_hash`.

### Endpoints Clave
- `GET /api/essays/:id/snapshots`: Lista las snapshots del ensayo con hashes y sellos.
- `GET /api/essays/snapshots/:snapshotId/verify`: Ejecuta la verificación en tiempo real de firma, integridad DB y OTS.
- `GET /api/essays/snapshots/:snapshotId/ots-proof`: Descarga directa del archivo binario `.ots`.
- `POST /api/essays/:id/reissue-request`: Reemisión manual de la solicitud con motivo, `modificated: true` y nueva snapshot.
- `GET /api/essays/audit-logs`: Obtiene la bitácora completa con datos de dispositivo y evidencia criptográfica.

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md -->

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

---

<!-- Fuente: docs/04-modulo-iv-desarrollo-implementacion-y-validacion/13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md -->

# Pipeline HTTP, Middlewares, Idempotencia, Redis y Auditoría de Seguridad

Este documento describe en detalle el funcionamiento del pipeline HTTP de Express en [`src/app.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/app.js), los middlewares de seguridad y resiliencia, la integración con Redis, el manejo de transacciones SQL en Neon y el subsistema de auditoría de seguridad.

---

## 1. Arquitectura del Pipeline HTTP (`src/app.js`)

Cada petición entrante atraviesa una secuencia estricta de capas antes de llegar a los controladores:

```mermaid
flowchart TD
    Req["HTTP Request"] --> Proxy["trust proxy = 1 / disable x-powered-by"]
    Proxy --> ReqId["1. Trazabilidad X-Request-Id + Log HTTP_ACCESS"]
    ReqId --> SecHdr["2. Cabeceras HTTP de Seguridad<br/>(HSTS, nosniff, DENY, no-store, CSP en dev)"]
    SecHdr --> CORS["3. CORS estricto (credentials: true)"]
    CORS --> Parse["cookieParser + requestContextMiddleware + normalizeErrorResponse"]
    Parse --> BodyLim["4. Límite de Payload (100kb JSON/urlencoded)"]
    BodyLim --> Probes{"5. /health o /ready"}
    Probes -- "Sí" --> ProbeResp["Respuesta directa (sin auth)"]
    Probes -- "No" --> GlobalRL["6. globalApiLimiter (180 req/min por IP)"]
    GlobalRL --> PublicRoutes{"7. /auth/* o<br/>/essays/*/unsubscribe"}
    PublicRoutes -- "Sí" --> PublicCtrl["Limitadores específicos / Auth / Baja"]
    PublicRoutes -- "No" --> Pipe["8. protectedPipeline:<br/>verifyJWT -> verifyCsrf -> idempotencyMiddleware"]
    Pipe --> LabCheck{"¿Ruta /samples,<br/>/laboratory/users o /api-docs?"}
    LabCheck -- "Sí" --> ReqLab["requireLaboratory (+ requireLabPermission)"]
    LabCheck -- "No" --> Router["Router de recurso + Controlador"]
    ReqLab --> Router
    Router --> ErrHandler["404 NOT_FOUND / Global Error Handler (413, 400, 500)"]
```

### 1.1. Trazabilidad, Observabilidad y Límites Base
- **Trazabilidad (`X-Request-Id`):** Valida el header entrante `x-request-id` contra `/^[a-zA-Z0-9._-]{8,64}$/` o genera un `crypto.randomUUID()`. Emite `X-Request-Id` en la respuesta y registra un JSON estructurado `HTTP_ACCESS` al finalizar la respuesta (omitiendo query strings para no filtrar tokens ni PII en logs).
- **Cabeceras de seguridad:** `Strict-Transport-Security` (2 años, `includeSubDomains`, `preload`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictiva y `Cache-Control: private, no-store, max-age=0`. En rutas `/api-docs` fuera de producción aplica una Content Security Policy (CSP) específica para Swagger UI.
- **Límite de tamaño de payload:** `express.json({ limit: '100kb' })` y `express.urlencoded({ extended: false, limit: '100kb' })`. Las solicitudes que superen 100 KB reciben `413 PAYLOAD_TOO_LARGE`, y un JSON malformado recibe `400 INVALID_JSON`.
- **Health y Readiness checks:**
  - `GET /health`: responde `200 { status: 'ok', timestamp }` sin tocar base de datos.
  - `GET /ready`: ejecuta `SELECT 1` contra PostgreSQL con un timeout máximo de `2000ms` e informa estado de DB y Redis (`200 { status: 'ready', db: 'up', redis: 'configured'|'disabled' }`, o `503 SERVICE_UNAVAILABLE` si falla o vence el timeout).
- **Graceful Shutdown:** Cuando corre como servidor persistente (`require.main === module`), captura `SIGTERM` y `SIGINT` para cerrar ordenadamente el servidor HTTP, el pool de Sequelize y la conexión de Redis (con un timeout límite de 10 segundos).

---

## 2. Protección CSRF y Lista Blanca de Orígenes (`csrf.js`)

Implementada en [`src/presentation/middlewares/csrf.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/csrf.js):

### 2.1. Lista Blanca de Orígenes (`isOriginAllowed` y `getAllowedOrigins`)
Permite exclusivamente:
- Orígenes base: `https://oficina.ctmueble.com.ar` (y en no-producción `http://localhost:3000`, `http://localhost:5173`, `http://localhost:*`, `http://127.0.0.1:*`).
- Orígenes adicionales declarados en `CORS_ORIGINS` (separados por coma).
- Subdominios HTTPS institucionales (`ctmueble.com.ar` y `*.ctmueble.com.ar`).
- Previews HTTPS propios del proyecto en Vercel (`/^(?:[a-z0-9-]+-)?(?:oficina|gestion|tarechaga15)[a-z0-9-]*\.vercel\.app$/i`).

### 2.2. Validación Double-Submit Cookie
- **`verifyCsrf`:** Se ejecuta después de `verifyJWT` en todas las rutas protegidas.
  - Permite métodos seguros (`GET`, `HEAD`, `OPTIONS`).
  - Solo exige validación CSRF cuando `req.authSource === 'cookie'` (en desarrollo local usando `Authorization: Bearer` omite el chequeo para facilitar pruebas con Swagger/curl).
  - Si existe cabecera `Origin`, valida con `isOriginAllowed(origin)` (si falla devuelve `403 CSRF_ORIGIN_FORBIDDEN`).
  - Compara la cookie `ctm_csrf` contra el header `X-CSRF-Token` en tiempo constante mediante `crypto.timingSafeEqual` (si no coinciden o faltan devuelve `403 CSRF_TOKEN_INVALID`).
- **`verifyAuthCookieCsrf`:** Protege `POST /auth/logout` y `POST /auth/refresh_token` cuando la autenticación proviene de cookies `ctm_rt`/`ctm_at` (en desarrollo permite omitirlo si se envía `refreshToken` o `token` explícitamente en el body sin cookies).
- **Protección contra Host/URL Injection (`resolveSafeFrontendUrl`):** Valida cualquier `frontendUrl` enviada en flujos de correo (verificación, invitación o reseteo de contraseña) contra `isOriginAllowed`. Si la URL pertenece a un dominio externo no autorizado, vuelve al fallback seguro (`FRONTEND_URL` / `APP_URL` / `https://oficina.ctmueble.com.ar`).

---

## 3. Middleware de Idempotencia (`idempotency.js`)

Implementado en [`src/presentation/middlewares/idempotency.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/idempotency.js) e integrado en `protectedPipeline`.

### 3.1. Funcionamiento y Aislamiento Multi-Tenant
1. Se aplica únicamente a peticiones `POST` y `PUT` que incluyan la cabecera `Idempotency-Key`.
2. Valida longitud máxima de **128 caracteres** (`400 INVALID_IDEMPOTENCY_KEY` si la supera).
3. Construye una clave aislada por actor, método, ruta sin query string, hash del body y clave cliente:
   ```text
   ctm:idem:<u:userId | ip:addr>:<METHOD>:<cleanUrl>:<sha256(body)[0..16]>:<Idempotency-Key>
   ```
   Esto impide colisiones o filtraciones de respuestas cacheadas entre distintos usuarios o payloads diferentes.

### 3.2. Control de Concurrencia y Caché
- **Bloqueo en vuelo (`IN_PROGRESS`):** Al iniciar la petición, adquiere un lock atómico de **60 segundos** (`redis.setNxPx` cuando Redis está configurado, o `memoryStore` local). Si llega una petición concurrente idéntica mientras la primera sigue procesándose, responde `409 IDEMPOTENCY_IN_PROGRESS`.
- **Reproducción de respuestas exitosas (`COMPLETED`):**
  - Intercepta `res.json` y cachea **únicamente respuestas `2xx`** (TTL **24 horas** en Redis; **15 minutos** y tope de **2.000 entradas** en memoria).
  - Ante reintentos posteriores con la misma clave, devuelve directamente el payload cacheado con su código original y la cabecera `X-Idempotent-Replayed: true`.
- **Limpieza ante fallos:** Si la operación responde `4xx`/`5xx` o el cliente cierra la conexión antes de responder (`res.once('close')`), elimina la entrada `IN_PROGRESS` para permitir reintentos legítimos.

---

## 4. Rate Limiting Distribuido (`rateLimit.js`)

Implementado en [`src/presentation/middlewares/rateLimit.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/rateLimit.js).

- **Resolución segura de IP (`resolveClientIp`):**
  - En Vercel (`process.env.VERCEL`), prioriza `x-vercel-forwarded-for` (inyectado por el edge de Vercel, resistente a spoofing).
  - En Express tradicional, utiliza `req.ip` respetando `trust proxy = 1`.
- **Agrupación de buckets:** Por IP (`ip:<addr>`) o por usuario autenticado (`usr:<userId>`) cuando se configura `keyByUser: true`.
- **Backend dual (Redis + Memoria):** Cuando Redis está habilitado (fuera de tests), usa la operación atómica `RedisClient.incrWithWindow` (`MULTI INCR + PTTL + PEXPIRE`). Si Redis no está configurado o falla, degrada de forma transparente a un `Map` en memoria acotado a **10.000 buckets** con limpieza periódica.
- **Respuesta al exceder:** Devuelve HTTP `429` con cabecera `Retry-After` (en segundos) y el formato estándar `{ code, message }`, registrando además el evento `RATE_LIMIT_EXCEEDED` en `security_audit_logs`.

### 4.1. Catálogo de Limitadores Configurados

| Código (`code`) | Ventana | Máximo | Clave | Endpoints protegidos |
| :--- | :---: | :---: | :--- | :--- |
| `GLOBAL_RATE_LIMIT` | 1 min | 180 | IP | Toda la API (`src/app.js`) |
| `AUTH_REGISTER_RATE_LIMIT` | 15 min | 10 | IP | `POST /auth/register` |
| `AUTH_RATE_LIMIT` | 15 min | 15 | IP | `POST /auth/login` |
| `AUTH_REFRESH_RATE_LIMIT` | 15 min | 40 | IP | `POST /auth/refresh_token` |
| `AUTH_VERIFY_RATE_LIMIT` | 15 min | 20 | IP | `/auth/2fa/*`, `/auth/send-verification`, `/auth/verify-*`, `/auth/*-password` |
| `DOWNLOAD_RATE_LIMIT` | 10 min | 60 | Usuario | `GET /essays/download-document`, `GET /essays/download-document-by-type` |
| `PDF_RATE_LIMIT` | 10 min | 25 | IP | `/essays/create`, `debug/generate-document`, `generate-contract`, `samples/load`, `emit-report`, `reissue-request` |
| `EXPORT_RATE_LIMIT` | 5 min | 20 | IP | `GET /essays/export` |
| `PDF_GENERATION_RATE_LIMIT` | 5 min | 15 | Usuario | `POST /samples/receive-samples`, `POST /samples/:id/close-and-emit-report` |
| `PADRON_RATE_LIMIT` | 10 min | 30 | Usuario | Autocompletado auxiliar opcional ARCA (`POST /bussiness/sync/`, `GET /bussiness/padron/`, `GET /clients/padron/:cuit`) |

---

## 5. Cliente Redis Resiliente (`RedisClient.js`) y Revocación de Sesiones

### 5.1. `RedisClient` (`src/infrastructure/redis/RedisClient.js`)
Cliente singleton construido sobre `ioredis` diseñado para entornos serverless y locales:
- **Configuración:** Se activa si existe `REDIS_URL` o `REDIS_HOST` (`REDIS_PORT` default `6379`, `REDIS_PASS`, `REDIS_DB` default `0`, `REDIS_TLS='true'`, `REDIS_TLS_REJECT_UNAUTHORIZED`).
- **Estrategia *Fail-Fast*:** Opera con `lazyConnect: true`, `connectTimeout: 2500ms`, `commandTimeout: 2000ms`, `maxRetriesPerRequest: 1`, `enableOfflineQueue: false` y máximo 3 reintentos. Todos los métodos (`get`, `set`, `setNxPx`, `del`, `incrWithWindow`, etc.) capturan errores y devuelven `null`/`0` para evitar que una caída de Redis bloquee la API.

### 5.2. `SessionRevocationService` (`src/infrastructure/auth/services/SessionRevocationService.js`)
Gestiona listas de revocación y detección de reuso de tokens combinando memoria local (máx. 10.000 entradas) y Redis:
- **`revokeToken(jti, ttl)`** (`auth:rev:jti:<jti>`) y **`revokeSession(sid, ttl)`** (`auth:rev:sid:<sid>`): revocación inmediata en logout, cierre remoto o cambio de contraseña.
- **`consumeRefreshToken(jti, sid, ttl)`** (`auth:used:rt:<jti>`): garantiza uso único de cada refresh token; si detecta reuso (`count > 1` o existencia previa), revoca automáticamente toda la familia de sesión `sid`.
- **`incrementAttempt(key, ttl)`:** Contador de intentos fallidos para desafíos 2FA (`auth:2fa:att:<jti>` en `AuthApplicationService`, límite 5 intentos).
- **Fallback en PostgreSQL (`verifyJWT`):** En [`jwt.verify.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/jwt.verify.js), cuando Redis no está configurado, consulta `user_sessions` en PostgreSQL para asegurar que una sesión revocada no siga aceptándose en instancias serverless frías.

---

## 6. Transacciones SQL y Contexto de Request (`transaction.js` y `db.js`)

- **`requestContextMiddleware` ([`src/presentation/middlewares/transaction.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/transaction.js)):** Inicializa `req.transaction = null` y `req.context` sin abrir transacciones SQL globales ni mantener conexiones abiertas antes de autenticar. Limpia `req.context` en eventos `finish` y `close`.
- **`sequelize.withTransaction(workFn)` ([`src/infrastructure/config/db.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/config/db.js)):**
  - Emplea un adaptador CLS basado en `AsyncLocalStorage` (`Sequelize.useCLS`). Si ya existe una transacción activa no finalizada en el contexto asíncrono, la reutiliza para evitar deadlocks en pools serverless reducidos (`DB_POOL_MAX` = 2 en serverless, 10 en servidor tradicional).
  - Aplica timeouts defensivos en Postgres (`statement_timeout`: 15s, `idle_in_transaction_session_timeout`: 10s, `query_timeout`: 15s, `connectionTimeoutMillis`: 5s) y recomienda usar el endpoint `-pooler` de Neon en producción/serverless.
  - Todas las operaciones lentas externas (autocompletado auxiliar ARCA SOAP si está activo, Puppeteer, Cloudflare R2, OpenTimestamps, envío de emails con Resend) se ejecutan estrictamente **fuera** de `withTransaction`.

---

## 7. Normalización de Errores y Auditoría de Seguridad

### 7.1. Normalización y Sanitización (`normalizeErrorResponse.js`, `controllerError.js`, `securityResponse.js`)
- [`normalizeErrorResponse.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/normalizeErrorResponse.js): Intercepta `res.json` para cualquier respuesta con `statusCode >= 400`, asegurando el formato uniforme `{ code, message, details? }`.
- [`controllerError.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/utils/controllerError.js): `handleControllerError` mapea errores de negocio y DTOs a códigos 4xx apropiados e intercepta excepciones técnicas (`TypeError`, `ReferenceError`, errores `Sequelize*`, violaciones SQL) devolviendo HTTP `500` con mensaje genérico seguro sin exponer trazas ni nombres de tablas.
- [`securityResponse.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/presentation/middlewares/securityResponse.js): `sendSecurityError` responde `{ code, message }` y ante cualquier código `401`, `403` o `429` registra automáticamente un evento `AUTH_DENIED`, `ACCESS_FORBIDDEN` o `RATE_LIMIT_EXCEEDED` en `SecurityAuditService`.

### 7.2. Auditoría de Seguridad Append-Only (`SecurityAuditService.js`)
Implementada en [`src/application/security/SecurityAuditService.js`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/application/security/SecurityAuditService.js) sobre la tabla `security_audit_logs` (protegida a nivel de PostgreSQL por el trigger `trg_security_audit_logs_immutable` que impide `UPDATE` y `DELETE`):

1. **Redacción automática de secretos (`redact`):** Recorre recursivamente los metadatos (hasta profundidad 4, arrays truncados a 25 elementos, strings a 512 chars) reemplazando por `'[REDACTED]'` cualquier propiedad que coincida con `/password|pass|secret|token|cookie|authorization|registerkey|csrf|privatekey|cert|apikey|api_key|otp|tempToken|signature|twoFactorSecret/i`.
2. **Captura de huella de dispositivo:** Mediante [`extractDeviceInfo`](file:///c:/Users/Tomas/Desktop/CTM/gestion.ctmueble.com.ar/src/infrastructure/auth/utils/deviceInfo.js) recopila `ipAddress`, `userAgent`, `clientName`, `deviceId`, `deviceFingerprint` y `sessionId`.
3. **Integridad criptográfica:** Calcula `record_hash` canónico (`SnapshotCryptoService.hashCanonical`) y `signature` antes de insertar.
4. **Aislamiento de transacciones (`transaction: null`):** Persiste siempre fuera de transacciones de negocio para que los eventos de auditoría (incluidos fallos 401/403 o rollbacks) nunca se pierdan. Si la base de datos falla, degrada a un log JSON `SECURITY_AUDIT_FALLBACK`.

---
