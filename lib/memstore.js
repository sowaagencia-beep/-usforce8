'use strict';
// Loja EM MEMÓRIA — só usada no modo DEMO (sem DATABASE_URL). Dados de exemplo
// pra mostrar o catálogo funcionando; escritas valem só na sessão (somem ao reiniciar).
// Em produção (com nexusdb), nada disto roda.

const tables = {
  holdings: [], companies: [], brands: [], categories: [],
  products: [], catalog_configs: [], entity_logos: [], category_covers: [],
};
let seeded = false;

function seed() {
  if (seeded) return; seeded = true;
  const img = (t) => `https://placehold.co/800x600/1E5BC6/E8EEF7?text=${encodeURIComponent(t)}`;
  tables.holdings = [
    { id: 'group9', name: 'Group 9' },
    { id: 'opolski', name: 'Opolski Participações' },
  ];
  tables.companies = [
    { slug: 'av09', name: 'AV09', tagline: 'Comércio Exterior', accent: '#1E5BC6', holding_id: 'group9' },
    { slug: 'sulfoods', name: 'Sulfoods', tagline: 'Indústria de Alimentos', accent: '#B23A3A', holding_id: 'opolski' },
  ];
  tables.brands = [
    { slug: 'ninefish', name: 'Ninefish', tagline: 'Pescados Premium', accent: '#1E5BC6', company_slug: 'av09' },
  ];
  tables.categories = [
    { id: 1, entity_slug: 'ninefish', name: 'Frescos' },
    { id: 2, entity_slug: 'ninefish', name: 'Congelados' },
    { id: 3, entity_slug: 'ninefish', name: 'Defumados' },
  ];
  tables.products = [
    { id: 'PRD-1', company_slug: 'ninefish', category: 'Frescos', name: 'Salmão Fresco Premium', code: 'USF-1', short: 'Filé selecionado, captura responsável.', long: 'Filé de salmão fresco selecionado, sem espinhas, gordura nobre marmorizada.', units_per_box: 6, origin: 'Chile', active: true, shared_with: [], images: [img('Salmao')], created_at: '2026-04-28' },
    { id: 'PRD-2', company_slug: 'ninefish', category: 'Congelados', name: 'Atum Yellowfin Saku', code: 'USF-2', short: 'Bloco premium para sashimi.', long: 'Bloco de atum yellowfin congelado a bordo, padrão exportação.', units_per_box: 12, origin: 'Brasil', active: true, shared_with: [], images: [img('Atum')], created_at: '2026-05-01' },
    { id: 'PRD-3', company_slug: 'ninefish', category: 'Defumados', name: 'Salmão Defumado a Frio', code: 'USF-3', short: 'Defumação artesanal lenta.', long: 'Defumação a frio com madeira nobre, fatiado fino, embalagem a vácuo.', units_per_box: 24, origin: 'Noruega', active: true, shared_with: [], images: [img('Defumado')], created_at: '2026-04-12' },
  ];
}

function match(row, where) {
  return Object.entries(where || {}).every(([k, v]) => String(row[k]) === String(v));
}

function select(t, where, order) {
  seed();
  let rows = tables[t].filter((r) => match(r, where));
  if (order) {
    const [c, d] = String(order).split(':');
    rows = [...rows].sort((a, b) => ((a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (d === 'desc' ? -1 : 1)));
  }
  return rows;
}
function insert(t, rows) {
  seed(); rows = Array.isArray(rows) ? rows : [rows];
  rows.forEach((r) => tables[t].push({ ...r })); return rows;
}
function upsert(t, rows, onConflict) {
  seed(); rows = Array.isArray(rows) ? rows : [rows];
  const keys = (onConflict ? String(onConflict).split(',') : ['id']).map((s) => s.trim());
  rows.forEach((r) => {
    const i = tables[t].findIndex((x) => keys.every((k) => String(x[k]) === String(r[k])));
    if (i >= 0) tables[t][i] = { ...tables[t][i], ...r }; else tables[t].push({ ...r });
  });
  return rows;
}
function update(t, set, where) {
  seed(); const hit = tables[t].filter((r) => match(r, where));
  hit.forEach((r) => Object.assign(r, set)); return hit;
}
function del(t, where) {
  seed(); const keep = [], gone = [];
  tables[t].forEach((r) => (match(r, where) ? gone : keep).push(r));
  tables[t] = keep; return gone;
}

module.exports = { select, insert, upsert, update, del };
