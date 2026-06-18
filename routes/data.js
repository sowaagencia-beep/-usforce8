'use strict';
// API REST genérica para as tabelas do catálogo — substitui o acesso direto ao
// Supabase. GET é público (vitrine pública); mutações exigem token (segurança real).
// Sem DATABASE_URL: cai numa loja em memória (modo DEMO).
const express = require('express');
const { getPool, hasDb } = require('../lib/pool');
const { requireAuth } = require('./auth');
const mem = require('../lib/memstore');

const router = express.Router();

const TABLES = new Set([
  'holdings', 'companies', 'brands', 'categories',
  'products', 'catalog_configs', 'entity_logos', 'category_covers',
]);
const IDENT = /^[a-z_][a-z0-9_]*$/;

function tableOk(t) { return TABLES.has(t); }
function ident(s) { if (!IDENT.test(String(s))) throw new Error('identificador inválido: ' + s); return s; }
function asRows(b) { return Array.isArray(b.rows) ? b.rows : [b.rows]; }

// GET /api/db/:table?order=col:desc&where={"slug":"x"}   (público)
router.get('/:table', async (req, res) => {
  const t = req.params.table;
  if (!tableOk(t)) return res.status(404).json({ error: 'tabela desconhecida' });
  try {
    const where = req.query.where ? JSON.parse(req.query.where) : {};
    if (!hasDb()) return res.json({ data: mem.select(t, where, req.query.order) });
    const params = [], conds = [];
    for (const [k, v] of Object.entries(where)) { params.push(v); conds.push(`${ident(k)} = $${params.length}`); }
    let sql = `SELECT * FROM ${t}`;
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    if (req.query.order) {
      const [col, dir] = String(req.query.order).split(':');
      sql += ` ORDER BY ${ident(col)} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
    }
    const r = await getPool().query(sql, params);
    res.json({ data: r.rows });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// POST /api/db/:table  body {rows, upsert?, onConflict?}   (token)
router.post('/:table', requireAuth, async (req, res) => {
  const t = req.params.table;
  if (!tableOk(t)) return res.status(404).json({ error: 'tabela desconhecida' });
  try {
    const rows = asRows(req.body);
    if (!rows.length || !rows[0]) return res.json({ data: [] });
    if (!hasDb()) return res.json({ data: req.body.upsert ? mem.upsert(t, rows, req.body.onConflict) : mem.insert(t, rows) });
    const cols = Object.keys(rows[0]).map(ident);
    const values = [], tuples = [];
    for (const row of rows) {
      const ph = cols.map((c) => { values.push(row[c] === undefined ? null : row[c]); return `$${values.length}`; });
      tuples.push('(' + ph.join(',') + ')');
    }
    let sql = `INSERT INTO ${t} (${cols.join(',')}) VALUES ${tuples.join(',')}`;
    if (req.body.upsert) {
      const conflict = (req.body.onConflict ? String(req.body.onConflict).split(',') : [cols[0]]).map((c) => ident(c.trim()));
      const updates = cols.filter((c) => !conflict.includes(c)).map((c) => `${c}=EXCLUDED.${c}`);
      sql += ` ON CONFLICT (${conflict.join(',')}) DO ${updates.length ? 'UPDATE SET ' + updates.join(',') : 'NOTHING'}`;
    }
    sql += ' RETURNING *';
    const r = await getPool().query(sql, values);
    res.json({ data: r.rows });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PATCH /api/db/:table  body {set, where}   (token)
router.patch('/:table', requireAuth, async (req, res) => {
  const t = req.params.table;
  if (!tableOk(t)) return res.status(404).json({ error: 'tabela desconhecida' });
  try {
    const set = req.body.set || {}, where = req.body.where || {};
    if (!Object.keys(set).length) return res.json({ data: [] });
    if (!hasDb()) return res.json({ data: mem.update(t, set, where) });
    const params = [], sets = [], conds = [];
    for (const [k, v] of Object.entries(set)) { params.push(v); sets.push(`${ident(k)}=$${params.length}`); }
    for (const [k, v] of Object.entries(where)) { params.push(v); conds.push(`${ident(k)}=$${params.length}`); }
    let sql = `UPDATE ${t} SET ${sets.join(',')}`;
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' RETURNING *';
    const r = await getPool().query(sql, params);
    res.json({ data: r.rows });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE /api/db/:table  body {where}  (filtro obrigatório, token)
router.delete('/:table', requireAuth, async (req, res) => {
  const t = req.params.table;
  if (!tableOk(t)) return res.status(404).json({ error: 'tabela desconhecida' });
  try {
    const where = req.body.where || {};
    if (!Object.keys(where).length) return res.status(400).json({ error: 'delete sem filtro bloqueado' });
    if (!hasDb()) return res.json({ data: mem.del(t, where) });
    const params = [], conds = [];
    for (const [k, v] of Object.entries(where)) { params.push(v); conds.push(`${ident(k)}=$${params.length}`); }
    const r = await getPool().query(`DELETE FROM ${t} WHERE ${conds.join(' AND ')} RETURNING *`, params);
    res.json({ data: r.rows });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
