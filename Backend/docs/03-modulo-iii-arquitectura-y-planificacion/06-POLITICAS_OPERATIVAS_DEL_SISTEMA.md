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

