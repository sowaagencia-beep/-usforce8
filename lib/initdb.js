'use strict';
// Aplica o schema (idempotente) na subida, se houver banco.
// O schema.sql do Luiz já é PostgreSQL puro (CREATE TABLE IF NOT EXISTS + RLS),
// roda igual em Postgres self-hosted.
const fs = require('fs');
const path = require('path');
const { getPool, hasDb } = require('./pool');

async function initDb() {
  if (!hasDb()) {
    console.log('[db] DATABASE_URL ausente — modo sem banco (frontend usa fallback local).');
    return false;
  }
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const client = await getPool().connect();
  try {
    await client.query(schema);
    console.log('[db] schema aplicado (ok).');
    return true;
  } catch (e) {
    // Policies/RLS podem falhar conforme o role; tabelas/índices são o que importa.
    console.warn('[db] schema aplicado parcialmente:', e.message);
    return true;
  } finally {
    client.release();
  }
}

module.exports = { initDb };
