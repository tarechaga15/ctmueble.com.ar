# Índice Maestro de Documentación — Sistema `gestion.ctmueble.com.ar` (CTM)

Este índice centraliza y organiza toda la documentación técnica, funcional y operativa del **Centro Tecnológico del Mueble (CTM)** clasificada estrictamente en carpetas de acuerdo con los requerimientos, entregables y orden metodológico de los **Módulos I, II, III y IV**, más los **Manuales Operativos para Usuario y Cliente Final**.

> **Compilación en documento único y manuales PDF:** Los documentos técnicos y funcionales correspondientes a los **Módulos I a IV** (`01-modulo-i...` a `04-modulo-iv...`) se unifican automáticamente en [DOCUMENTACION_CONSOLIDADA_CTM.md](./DOCUMENTACION_CONSOLIDADA_CTM.md) y se exportan en PDF con carátula, dos logos, paleta institucional e índice clicable en [DOCUMENTACION_CONSOLIDADA_CTM.pdf](./DOCUMENTACION_CONSOLIDADA_CTM.pdf). Los manuales de usuario y el manual técnico (`05-manuales-operativos-y-guia-cliente/`) quedan excluidos de la compilación consolidada y se exportan por separado en sus propios PDFs independientes ([MANUAL_USUARIO_GUIA_PRACTICA_CTM.pdf](./MANUAL_USUARIO_GUIA_PRACTICA_CTM.pdf) y [MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO_CTM.pdf](./MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO_CTM.pdf)) mediante el script:
>
> ```bash
> npm run build:docs-pdf
> ```

---

## Estructura General de Carpetas en `docs/`

```text
docs/
├── INDEX.md                                                    (Este índice maestro)
├── pdf-config.json                                               (Configuración editable de carátula, logos, encabezados y paleta PDF)
├── assets/                                                       (Logos institucionales usados en carátulas y encabezados PDF)
├── DOCUMENTACION_CONSOLIDADA_CTM.md                              (Salida generada: unificación completa en Markdown de Módulos I–IV)
├── DOCUMENTACION_CONSOLIDADA_CTM.pdf                             (Salida generada: PDF único consolidado Módulos I–IV con índice clicable)
├── MANUAL_USUARIO_GUIA_PRACTICA_CTM.pdf                          (Salida generada: PDF independiente de Guía Práctica de Usuario)
├── MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO_CTM.pdf (Salida generada: PDF independiente de Manual Técnico)
├── 01-modulo-i-pautas-y-analisis-escenario/
│   ├── 01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md
│   └── 02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md
├── 02-modulo-ii-jerarquia-procesos-y-estructura-datos/
│   ├── 01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md
│   ├── 02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md
│   └── 03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md
├── 03-modulo-iii-arquitectura-y-planificacion/
│   ├── 01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md
│   ├── 02-INFRAESTRUCTURA_NEON_POSTGRESQL.md
│   ├── 03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md
│   ├── 04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md
│   ├── 05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md
│   └── 06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md
├── 04-modulo-iv-desarrollo-implementacion-y-validacion/
│   ├── 01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md
│   ├── 02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md
│   ├── 03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md
│   ├── 04-INTEGRACION_REACT_COOKIES_Y_CSP.md
│   ├── 05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md
│   ├── 06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md
│   ├── 07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md
│   ├── 08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md
│   ├── 09-GENERACION_DOCUMENTOS_PDF.md
│   ├── 10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md
│   ├── 11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md
│   ├── 12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md
│   └── 13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md
└── 05-manuales-operativos-y-guia-cliente/
    ├── 01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md
    ├── 02-MANUAL_USUARIO_FINAL.md
    ├── 03-MANUAL_USUARIO_EXHAUSTIVO.md
    ├── 04-MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO.md
    └── anexos/
        ├── MANUAL_USUARIO_EXHAUSTIVO.html
        ├── MANUAL_USUARIO_GUIA_PRACTICA.html
        └── REQUERIMIENTOS_Y_CLASIFICACION_DATOS.txt
```

---

## Catálogo Detallado por Módulo

### Módulo I — Pautas Generales, Organización y Análisis del Escenario
*Carpeta:* `docs/01-modulo-i-pautas-y-analisis-escenario/`

| Orden | Documento | Entregables cubiertos (`Módulo I.pdf`) |
| :---: | :--- | :--- |
| **1.1** | [01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md](./01-modulo-i-pautas-y-analisis-escenario/01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md) | 1. Organización del equipo, comunicación, herramientas, cronograma, reuniones y metodología; 2. Descripción del escenario CTM; 3. Modelo de negocio y formularios (`F-PC13-02`, `F-PC13-03`, `F-PC13-01`); 4. Organigrama jerárquico y relación entre sectores. |
| **1.2** | [02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md](./01-modulo-i-pautas-y-analisis-escenario/02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md) | 5. Lista de procesos (`P01`–`P09`) y eventos disparadores; 6. Documento de problemática sin sistema; 7. Alcance preliminar (acciones y módulos); 8. Diagramas de flujo actuales sin sistema (**AS-IS**). |

---

### Módulo II — Jerarquía de Procesos y Estructura de Datos
*Carpeta:* `docs/02-modulo-ii-jerarquia-procesos-y-estructura-datos/`

| Orden | Documento | Entregables cubiertos (`Módulo II.pdf`) |
| :---: | :--- | :--- |
| **2.1** | [01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md](./02-modulo-ii-jerarquia-procesos-y-estructura-datos/01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md) | Organización del Módulo II y validación del Módulo I; Objetivo del sistema; Alcance real (inclusiones y exclusiones); Roles de usuarios (`ADMIN`, `USER`, `CONSULTA`, `CLIENT`); Jerarquía de procesos (Base, Operativos y Control) y Cascada operativa. |
| **2.2** | [02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md](./02-modulo-ii-jerarquia-procesos-y-estructura-datos/02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md) | Requerimientos funcionales (`RF01`–`RF36`); No funcionales (`RNF01`–`RNF18`); Reglas de negocio (`RN01`–`RN22`); Diagramas de flujo futuros (**TO-BE**); Casos de uso principales (`CU01`–`CU12`); Priorización funcional y checklist de validación. |
| **2.3** | [03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md](./02-modulo-ii-jerarquia-procesos-y-estructura-datos/03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md) | Introducción a estructura de datos, entidades principales, atributos, relaciones y relevamiento/clasificación de campos en los 9 procesos operativos. |

---

### Módulo III — Arquitectura y Planificación de Implementación
*Carpeta:* `docs/03-modulo-iii-arquitectura-y-planificacion/`

| Orden | Documento | Entregables cubiertos (`Módulo III.pdf`) |
| :---: | :--- | :--- |
| **3.1** | [01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md](./03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md) | Organización del Módulo III y validación Módulos I–II; Tipo de solución web/serverless justificada; Diagrama de arquitectura (Vercel, Neon, R2, Redis); Selección tecnológica justificada y variables clave. |
| **3.2** | [02-INFRAESTRUCTURA_NEON_POSTGRESQL.md](./03-modulo-iii-arquitectura-y-planificacion/02-INFRAESTRUCTURA_NEON_POSTGRESQL.md) | Configuración de base de datos administrada Neon PostgreSQL, SSL, pool serverless y flujo de migraciones. |
| **3.3** | [03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md](./03-modulo-iii-arquitectura-y-planificacion/03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md) | Diseño lógico definitivo de las **34 tablas** (PK, FK, tipos, índices, diagramas relacionales) y **Diagnóstico de redundancias, coherencia y normalización (1FN/2FN/3FN + snapshots controlados)**. |
| **3.4** | [04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md](./03-modulo-iii-arquitectura-y-planificacion/04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md) | Diseño en 6 módulos (objetivo, operaciones, tablas y usuarios); Jerarquía de módulos; Navegación funcional; 7 Mockups de pantallas; Plan de implementación; Plan de mantenimiento inicial y Revisión integral previa al desarrollo. |
| **3.5** | [05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md](./03-modulo-iii-arquitectura-y-planificacion/05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md) | Definición transversal de seguridad, perfiles, control de acceso y trazabilidad de auditoría. |
| **3.6** | [06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md](./03-modulo-iii-arquitectura-y-planificacion/06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md) | Políticas de operación continua, cambios de contrato, rotación de secretos y gobierno de migraciones. |

---

### Módulo IV — Desarrollo, Implementación y Validación del Sistema
*Carpeta:* `docs/04-modulo-iv-desarrollo-implementacion-y-validacion/`

| Orden | Documento | Entregables cubiertos (`Módulo IV.pdf`) |
| :---: | :--- | :--- |
| **4.1** | [01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md) | Organización del Módulo IV, entorno, estructura Clean Architecture/DDD en GitHub, desarrollo incremental (Etapas 1–4), `serviceFactory` + `di/`, `/env`, `/types`, scripts CLI (migraciones + seedeo global/granular), **Registro de incidencias**, **Demostración funcional interna** y cobertura de los **25 archivos de test (94 subtests)**. |
| **4.2** | [02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md) | Implementación de login, refresh, 2FA (TOTP/Email), códigos de recuperación, dispositivos de confianza y sesiones activas. |
| **4.3** | [03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md) | Flujos reales de `EmailVerificationService` y `PasswordResetService`, SHA-256, timing-safe, alta de contraseña por invitación y revocación post-reseteo. |
| **4.4** | [04-INTEGRACION_REACT_COOKIES_Y_CSP.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/04-INTEGRACION_REACT_COOKIES_Y_CSP.md) | Integración frontend/backend mediante cookies `HttpOnly` (`ctm_at`, `ctm_rt`, `ctm_csrf`), Axios y política CSP. |
| **4.5** | [05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md) | Implementación de CRUD ABM de usuarios de laboratorio, roles (`ADMIN`, `USER`, `CONSULTA`), `permissionsCatalog` y `requireLabPermission`. |
| **4.6** | [06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md) | Implementación de cifrado AES-256-GCM / AWS KMS Envelope para `system_api_keys` y endpoints `/api-keys`. |
| **4.7** | [07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md) | ABM de empresas/clientes/personas, agenda compartida y servicio auxiliar opcional WSAA/Padrón A13 ARCA para autocompletado de clientes (sin requerir activación + pasos para habilitarlo). |
| **4.8** | [08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md) | Operación central: jerarquía de estados, códigos diarios atómicos, snapshots `essays_client`, plantillas, recepción/OT `F-PC13-03`, carga de resultados, emisión `F-PC13-01` y exportación CSV/XLSX. |
| **4.9** | [09-GENERACION_DOCUMENTOS_PDF.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/09-GENERACION_DOCUMENTOS_PDF.md) | Renderizado HTML→PDF on-the-fly (`F-PC13-01`/`02`/`03`), semáforo Chromium, bloqueo de red anti-SSRF y almacenamiento en R2. |
| **4.10** | [10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md) | Envío transaccional con Resend, alertas al laboratorio y mecanismo seguro de desuscripción. |
| **4.11** | [11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md) | Integridad probatoria con `CanonicalJson` (RFC 8785), firma RSA-SHA256, OpenTimestamps (`.ots`) y verificación de snapshots. |
| **4.12** | [12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md) | Especificación completa de endpoints REST (`/auth`, `/users`, `/laboratory/users`, `/api-keys`, `/clients`, `/bussiness`, `/persons`, `/essays`, `/samples`, `/env`, `/types`), DTOs y códigos de error. |
| **4.13** | [13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md](./04-modulo-iv-desarrollo-implementacion-y-validacion/13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md) | Pipeline HTTP (`src/app.js`), CORS/CSRF, idempotencia, 10 rate limiters, cliente Redis, revocación JWT, transacciones SQL, normalización de errores y `SecurityAuditService`. |

---

### Manuales Operativos y Guía de Cliente Final
*Carpeta:* `docs/05-manuales-operativos-y-guia-cliente/`

| Orden | Documento | Propósito |
| :---: | :--- | :--- |
| **5.1** | [01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md](./05-manuales-operativos-y-guia-cliente/01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md) | Resumen ejecutivo para dirección, responsables de laboratorio y administración. |
| **5.2** | [02-MANUAL_USUARIO_FINAL.md](./05-manuales-operativos-y-guia-cliente/02-MANUAL_USUARIO_FINAL.md) | Guía práctica paso a paso en 15 capítulos para operar la plataforma (exportada también a `MANUAL_USUARIO_GUIA_PRACTICA_CTM.pdf`). |
| **5.3** | [03-MANUAL_USUARIO_EXHAUSTIVO.md](./05-manuales-operativos-y-guia-cliente/03-MANUAL_USUARIO_EXHAUSTIVO.md) | Manual integral detallado por pantallas, roles, estados y procedimientos operativos. |
| **5.4** | [04-MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO.md](./05-manuales-operativos-y-guia-cliente/04-MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO.md) | Manual técnico de arquitectura, requisitos, variables `.env`, migraciones, seeders, despliegue en Vercel/Neon/R2 y troubleshooting (exportado también a `MANUAL_TECNICO_INSTALACION_Y_PUESTA_EN_FUNCIONAMIENTO_CTM.pdf`). |
| **Anexos** | [`anexos/`](./05-manuales-operativos-y-guia-cliente/anexos/) | Versiones HTML interactivas de los manuales (`MANUAL_USUARIO_EXHAUSTIVO.html`, `MANUAL_USUARIO_GUIA_PRACTICA.html`) y respaldo tabular TXT. |

---

### Documentación Técnica Auxiliar Fuera de `docs/`
- [src/infrastructure/migrations/README.md](../src/infrastructure/migrations/README.md) — Comandos Umzug de migración y despliegue sobre Neon PostgreSQL.
- [src/shared/di/CLUSTERS_USAGE.md](../src/shared/di/CLUSTERS_USAGE.md) — Guía de uso de clusters en el contenedor declarativo de inyección de dependencias.
- [README.md](../README.md) — Guía rápida de arranque, variables `.env`, scripts y resumen general del proyecto.
