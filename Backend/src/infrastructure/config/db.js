const { AsyncLocalStorage, AsyncResource } = require('async_hooks');
const { Sequelize } = require('sequelize');
const pg = require('pg');

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (_) {}
}

// Adaptador CLS nativo basado en AsyncLocalStorage (reemplaza cls-hooked obsoleto)
const als = new AsyncLocalStorage();
const clsNamespace = {
  run(fn) {
    const parentStore = als.getStore();
    const childStore = parentStore ? new Map(parentStore) : new Map();
    return als.run(childStore, () => fn(childStore));
  },
  get(key) {
    const store = als.getStore();
    return store ? store.get(key) : undefined;
  },
  set(key, value) {
    const store = als.getStore();
    if (store) {
      store.set(key, value);
    }
    return value;
  },
  bind(fn) {
    return AsyncResource.bind(fn);
  }
};

Sequelize.useCLS(clsNamespace);

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isProd = process.env.NODE_ENV === 'production';

const rawDbUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'test' ? 'postgres://test:test@127.0.0.1:5432/ctm_test' : '');

if (!rawDbUrl) {
  throw new Error('DATABASE_URL es obligatorio. Configúrelo con la cadena de conexión de Neon (-pooler).');
}

let dbHost = '';
try {
  dbHost = new URL(rawDbUrl).hostname.toLowerCase();
} catch (_) {
  dbHost = '';
}

if ((isServerless || isProd) && dbHost.includes('neon.tech') && !dbHost.includes('-pooler')) {
  console.warn(
    "[DB][WARN] DATABASE_URL apunta a Neon sin '-pooler'. En Vercel Functions utilice el endpoint pooled (-pooler) con PgBouncer."
  );
}

const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(dbHost);
const disableSsl = process.env.DB_SSL === 'false' || (isLocalHost && process.env.DB_SSL !== 'true');

const sslConfig = disableSsl
  ? false
  : {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };

const poolMax = Number(process.env.DB_POOL_MAX) || (isServerless ? 2 : 10);

const sequelize = new Sequelize(rawDbUrl, {
  dialect: 'postgres',
  dialectModule: pg,
  pool: {
    max: poolMax,
    min: 0,
    idle: isServerless ? 3000 : 10000,
    acquire: 10000,
    evict: 1000
  },
  dialectOptions: {
    ssl: sslConfig,
    application_name: 'ctm-gestion-api',
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS) || 15000,
    idle_in_transaction_session_timeout: Number(process.env.DB_IDLE_IN_TX_TIMEOUT_MS) || 10000,
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS) || 15000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 5000
  },
  retry: {
    max: 2,
    match: [/SequelizeConnectionAcquireTimeoutError/, /Connection terminated unexpectedly/, /ECONNRESET/]
  },
  logging: process.env.DB_LOGGING === 'true' ? console.log : false
});

/**
 * Ejecuta una unidad de trabajo dentro de una transacción gestionada de Sequelize.
 * Si ya existe una transacción activa en el contexto asíncrono actual (CLS),
 * reutiliza la misma conexión/transacción para evitar deadlocks de pool en serverless.
 */
async function withTransaction(workFn, options = {}) {
  if (
    (process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT)) &&
    process.env.ENABLE_TEST_DB_TX !== 'true'
  ) {
    return workFn(null);
  }
  const existingTx = clsNamespace.get('transaction');
  if (existingTx && !existingTx.finished) {
    return workFn(existingTx);
  }
  return sequelize.transaction(options, async (tx) => workFn(tx));
}

sequelize.withTransaction = withTransaction;
sequelize.clsNamespace = clsNamespace;

module.exports = sequelize;
