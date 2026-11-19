# Guia de documentacion para cliente final

Este documento resume toda la documentacion del sistema en un formato ejecutivo para usuarios de negocio, responsables de laboratorio y administracion.

## 1. Objetivo del sistema

La plataforma permite gestionar de punta a punta:

- empresas y clientes,
- solicitudes de ensayo,
- recepcion de muestras,
- ordenes de trabajo,
- carga de resultados,
- emision de informes,
- seguimiento y trazabilidad.

## 2. Indice rapido de documentacion

El sistema organiza toda su documentación en **`docs/INDEX.md`** siguiendo los **Módulos I, II, III y IV** definidos en los lineamientos del proyecto, más los manuales operativos finales.

### 2.1 Módulo I y Módulo II — Análisis del Escenario, Procesos y Requerimientos

| Documento (`docs/...`) | Para que sirve | Publico recomendado |
|---|---|---|
| `01-modulo-i-pautas-y-analisis-escenario/01-ORGANIZACION_EQUIPO_Y_ESCENARIO_CTM.md` | Organización del equipo, escenario del CTM, modelo de negocio y organigrama | Dirección, equipo, analistas |
| `01-modulo-i-pautas-y-analisis-escenario/02-PROBLEMATICA_ALCANCE_Y_PROCESOS_AS_IS.md` | Procesos/eventos, problemática detectada, alcance preliminar y diagramas AS-IS | Dirección, analistas, cliente final |
| `02-modulo-ii-jerarquia-procesos-y-estructura-datos/01-OBJETIVO_ALCANCE_USUARIOS_Y_JERARQUIA_PROCESOS.md` | Objetivo, alcance real (qué incluye y qué no), roles de usuarios y cascada operativa | Líderes funcionales, seguridad, QA |
| `02-modulo-ii-jerarquia-procesos-y-estructura-datos/02-REQUERIMIENTOS_REGLAS_NEGOCIO_CASOS_USO_Y_TO_BE.md` | Requerimientos `RF`/`RNF`, reglas de negocio, flujos TO-BE, casos de uso y prioridades | Analistas, desarrollo, QA |
| `02-modulo-ii-jerarquia-procesos-y-estructura-datos/03-REQUERIMIENTOS_Y_CLASIFICACION_DATOS.md` | Estructura inicial de entidades y clasificación detallada de datos por proceso | Analistas, datos, QA |

### 2.2 Módulo III — Arquitectura, Base de Datos y Planificación

| Documento (`docs/...`) | Para que sirve | Publico recomendado |
|---|---|---|
| `03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md` | Tipo de solución web/serverless, arquitectura Vercel/Neon/R2 y selección tecnológica | Cliente final, gestión, arquitectura |
| `03-modulo-iii-arquitectura-y-planificacion/02-INFRAESTRUCTURA_NEON_POSTGRESQL.md` | Configuración SSL, pool serverless y ejecución de migraciones en Neon | Backend, DevOps |
| `03-modulo-iii-arquitectura-y-planificacion/03-DISENO_LOGICO_DEFINITIVO_BASE_DE_DATOS.md` | Referencia de las 34 tablas, relaciones, índices y diagnóstico de normalización | Equipo técnico, datos |
| `03-modulo-iii-arquitectura-y-planificacion/04-DISENO_MODULAR_NAVEGACION_MOCKUPS_Y_PLANIFICACION.md` | Diseño en 6 módulos, navegación SPA, mockups de pantallas y plan de mantenimiento | Frontend, Backend, UX, Dirección |
| `03-modulo-iii-arquitectura-y-planificacion/05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md` | Reglas transversales de seguridad, RBAC y trazabilidad de auditoría | Seguridad, responsables de sistema |
| `03-modulo-iii-arquitectura-y-planificacion/06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md` | Políticas de operación, secretos, cambios y contratos | Operaciones, tecnología, gestión |

### 2.3 Módulo IV — Implementación, Subcomponentes Técnicos, Contratos y Validación

| Documento (`docs/...`) | Para que sirve | Publico recomendado |
|---|---|---|
| `04-modulo-iv-desarrollo-implementacion-y-validacion/01-ENTORNO_REPOSITORIO_INYECCION_DEPENDENCIAS_ENV_Y_TESTS.md` | Estructura DDD, DI (`serviceFactory`/`di`), `/env`, `/types`, scripts, incidencias y tests | Backend, DevOps, QA |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/02-SEGURIDAD_AUTENTICACION_2FA_Y_SESIONES.md` | 2FA (TOTP/Email), códigos de recuperación, dispositivos confiables y sesiones activas | Backend, Frontend, Seguridad |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/03-VERIFICACION_EMAIL_Y_RECUPERACION_PASSWORD.md` | Verificación OTP/enlace, alta de clave por invitación y recuperación de contraseña | Backend, Frontend, Seguridad |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/04-INTEGRACION_REACT_COOKIES_Y_CSP.md` | Integración SPA React/Axios con cookies `HttpOnly`, CSRF y CSP | Frontend, Seguridad |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/05-GESTION_USUARIOS_LABORATORIO_ROLES_Y_PERMISOS.md` | Roles de laboratorio (`ADMIN`, `USER`, `CONSULTA`) y catálogo de permisos granulares | Backend, Frontend, Administradores |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/06-SISTEMA_ENCRIPTACION_CREDENCIALES_Y_API_KEYS.md` | Cifrado AES-256-GCM / KMS Envelope, API Keys (`system_api_keys`) y rotación | Backend, Seguridad, DevOps |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/07-INTEGRACION_ARCA_PADRON_EMPRESAS_CLIENTES_Y_PERSONAS.md` | Gestión de empresas, clientes, agenda, personas y autocompletado auxiliar opcional con ARCA (y su habilitación) | Backend, Frontend, Integración |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/08-GESTION_ENSAYOS_ORDENES_MUESTRAS_Y_EXPORTACION.md` | Máquinas de estado, códigos diarios atómicos, plantillas, carga de resultados y CSV/XLSX | Backend, Frontend, QA |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/09-GENERACION_DOCUMENTOS_PDF.md` | Generación PDF bajo demanda (`F-PC13-01`/`02`/`03`) con Handlebars, Puppeteer y R2 | Backend, Operaciones |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/10-SISTEMA_NOTIFICACIONES_POR_EMAIL.md` | Notificaciones vía Resend, alertas al laboratorio y desuscripción | Backend, Frontend, Operaciones |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/11-SISTEMA_AUDITORIA_E_INTEGRIDAD_CRIPTOGRAFICA.md` | `CanonicalJson` RFC 8785, firma RSA-SHA256, OpenTimestamps y snapshots | Seguridad, Auditoría, Backend |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md` | Contratos REST completos, headers, rate limits y códigos de error estándar | Integración, Frontend, Backend, QA |
| `04-modulo-iv-desarrollo-implementacion-y-validacion/13-MIDDLEWARES_IDEMPOTENCIA_REDIS_Y_SEGURIDAD_HTTP.md` | Pipeline Express, CORS/CSRF, idempotencia, 10 rate limiters, Redis y auditoría | Backend, Seguridad, DevOps |

### 2.4 Manuales Operativos y Documentación Consolidada

| Documento (`docs/...`) | Para que sirve | Publico recomendado |
|---|---|---|
| `05-manuales-operativos-y-guia-cliente/01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md` | Este documento ejecutivo de orientación rápida | Cliente final, Dirección |
| `05-manuales-operativos-y-guia-cliente/02-MANUAL_USUARIO_FINAL.md` | Guía práctica paso a paso de operación diaria | Usuarios finales, operadores |
| `05-manuales-operativos-y-guia-cliente/03-MANUAL_USUARIO_EXHAUSTIVO.md` | Manual extendido completo por pantallas, roles, estados y casos operativos | Capacitación, soporte |
| `INDEX.md` | Índice Maestro completo de carpetas y matriz de entregables I–IV | Todo el equipo |
| `DOCUMENTACION_CONSOLIDADA_CTM.pdf` | Único documento PDF compilado con portada e índice clicable | Entrega formal y archivo |

### 2.5 Orden sugerido de lectura

1. `05-manuales-operativos-y-guia-cliente/02-MANUAL_USUARIO_FINAL.md`
2. `03-modulo-iii-arquitectura-y-planificacion/01-STACK_TECNOLOGICO_Y_ARQUITECTURA.md`
3. `05-manuales-operativos-y-guia-cliente/01-GUIA_DOCUMENTACION_CLIENTE_FINAL.md` (este documento)
4. `03-modulo-iii-arquitectura-y-planificacion/05-SEGURIDAD_PERMISOS_Y_AUDITORIA.md`
5. `03-modulo-iii-arquitectura-y-planificacion/06-POLITICAS_OPERATIVAS_DEL_SISTEMA.md`
6. `04-modulo-iv-desarrollo-implementacion-y-validacion/12-CONTRATOS_FRONTEND_BACKEND_Y_VALIDACIONES.md` (integración técnica)

## 3. Procesos principales del negocio

| Proceso | Entrada principal | Resultado principal |
|---|---|---|
| Gestion de clientes | CUIT, razon social, direccion y contactos | Cliente disponible para operar |
| Solicitud de ensayo | Cliente, tipo de ensayo, datos de producto | Ensayo creado con estado inicial |
| Recepcion de muestras | Ensayo, cantidad de muestras, estado de recepcion | Orden de trabajo y muestras registradas |
| Ejecucion y resultados | Resultados por muestra y observaciones | Ensayo actualizado y trazable |
| Emision de informe | Ensayo completo y aprobado segun reglas | Informe generado y descargable |

## 4. Requisitos generales para operar

- Usuario habilitado en el sistema.
- Perfil adecuado (cliente o laboratorio) segun la accion.
- Token de sesion activo.
- Datos minimos por proceso (por ejemplo, CUIT valido para empresa/cliente).

## 5. Seguridad y permisos (resumen ejecutivo)

- Todas las acciones operativas requieren autenticacion.
- Algunas operaciones son exclusivas de laboratorio.
- El sistema registra eventos de auditoria sobre ensayos y ordenes de trabajo.
- Los errores se devuelven en formato estandar: `code`, `message`, `details`.

## 6. Recomendaciones para el cliente final

- Definir usuarios responsables por cada proceso (administrativo, laboratorio, supervision).
- Mantener actualizados CUIT, contactos y datos de facturacion.
- Revisar periodicamente auditorias y trazabilidad de ensayos.
- Trabajar con el manual de usuario como procedimiento oficial.

## 7. Soporte y gestion de cambios

Ante dudas o necesidad de ajustes:

1. Identificar proceso y pantalla afectada.
2. Registrar evidencia del caso (captura, CUIT, ID de ensayo u orden).
3. Reportar al equipo de soporte con prioridad e impacto.

