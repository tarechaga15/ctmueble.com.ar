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
