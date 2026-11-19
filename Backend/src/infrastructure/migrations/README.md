# Migraciones de Base de Datos

Este directorio contiene las migraciones de Sequelize para gestionar los cambios en el esquema de la base de datos.

## Instalación

Primero, instala la dependencia `umzug`:

```bash
npm install
```

## Uso

### Ejecutar migraciones pendientes

```bash
npm run migrate
# o
npm run migrate:up
```

### Revertir última migración

```bash
npm run migrate:down
```

### Revertir todas las migraciones

```bash
npm run migrate:undo
```

### Ver estado de migraciones

```bash
npm run migrate:status
```

## Seedeo de datos base (después de migrar)

```bash
npm run seed                 # Seedeo global completo (249 países, 24 provincias, formaldehído, documentos, lab ficticio, usuarios)
npm run seed:countries       # Granular: países
npm run seed:provinces       # Granular: provincias argentinas
npm run seed:essay-types     # Granular: tipo de ensayo de formaldehído
npm run seed:lab             # Granular: datos ficticios de laboratorio
npm run seed:users           # Granular: Admin de laboratorio + Cliente demo
npm run seed:reset-passwords # Restablece contraseñas si los usuarios ya existen
```

## Estructura

Las migraciones deben seguir el formato:
- `YYYYMMDDHHMMSS-nombre-descriptivo.js`
- Ejemplo: `20260221000000-create-essays-client.js`

## Migraciones disponibles

(Véase el directorio de migraciones para el listado actual.)

## Notas

- Las migraciones se ejecutan dentro de transacciones para garantizar atomicidad.
- Si una migración falla, se hace rollback automáticamente.
- Las migraciones ejecutadas se registran en la tabla `SequelizeMeta`.

