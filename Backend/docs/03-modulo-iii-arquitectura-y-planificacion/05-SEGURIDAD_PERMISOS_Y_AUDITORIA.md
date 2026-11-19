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

