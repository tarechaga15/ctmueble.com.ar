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
