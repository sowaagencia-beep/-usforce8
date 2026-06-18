'use strict';
// Sincronização de produtos do USFORCE → banco do catálogo.
// Modelo "push/pull controlado": busca produtos no Nexus e devolve um PREVIEW
// (dry-run) por enquanto. A escrita real depende do mapa de campos (qual produto
// do USFORCE vai pra qual marca/categoria do catálogo) — a confirmar com o R7.
const express = require('express');
const { requireAuth } = require('./auth');

const router = express.Router();
const NEXUS_BASE = process.env.NEXUS_API_BASE || 'https://api.usforce.com.br:8001';

// GET /api/sync/usforce/preview — lê produtos do USFORCE (não grava nada)
router.get('/usforce/preview', requireAuth, async (req, res) => {
  try {
    const ctrl = AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined;
    const r = await fetch(`${NEXUS_BASE}/nexus/v5/produtos`, { signal: ctrl });
    if (!r.ok) return res.status(502).json({ error: `USFORCE respondeu ${r.status}` });
    const data = await r.json();
    const items = Array.isArray(data) ? data : (data.items || data.data || []);
    res.json({
      count: items.length,
      amostra: items.slice(0, 5),
      nota: 'preview (dry-run). Mapa de campos USFORCE→catálogo a definir antes de gravar.',
    });
  } catch (e) {
    res.status(502).json({ error: 'USFORCE indisponível: ' + e.message });
  }
});

module.exports = router;
