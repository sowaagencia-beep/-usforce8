'use strict';
// Pool Postgres. Aceita:
//   • DATABASE_URL (connection string), OU
//   • DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE (mesmo padrão do nexusdb do USFORCE).
// Sem nenhum dos dois → "modo sem banco" (DEMO: loja em memória).
// search_path = catalogo,public → tabelas do catálogo ficam isoladas no schema `catalogo`.
const { Pool } = require('pg');

function buildConfig() {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const needsSsl = /sslmode=require|render\.com|supabase|neon|amazonaws/.test(url);
    return { connectionString: url, ssl: needsSsl ? { rejectUnauthorized: false } : false };
  }
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: /^true$/i.test(process.env.DB_SSL || '') ? { rejectUnauthorized: false } : false,
    };
  }
  return null;
}

let pool = null;
const cfg = buildConfig();
if (cfg) {
  pool = new Pool({ ...cfg, max: 5, idleTimeoutMillis: 30000, options: '-c search_path=catalogo,public' });
  pool.on('error', (e) => console.error('[db] pool error:', e.message));
}

module.exports = {
  getPool: () => pool,
  hasDb: () => !!pool,
};
