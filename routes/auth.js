'use strict';
// Autenticação do catálogo.
// Estratégia "não cai quando o USFORCE atualizar":
//   1) tenta validar o usuário no USFORCE (Nexus) — segurança real, mesmos usuários;
//   2) se o USFORCE estiver fora OU houver admin local configurado, usa fallback local;
//   3) em ambos os casos emite um TOKEN PRÓPRIO (JWT). Depois do login, o catálogo
//      NÃO depende mais do USFORCE a cada request.
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET      = process.env.CATALOGO_JWT_SECRET || 'dev-secret-trocar-em-prod';
const NEXUS_BASE  = process.env.NEXUS_API_BASE || 'https://api.usforce.com.br:8001';
// CONFIRMADO: USFORCE módulo `usuario` → POST /nexus/v5/auth/login {email, password} (bcrypt + JWT).
const NEXUS_LOGIN = process.env.NEXUS_LOGIN_PATH || '/nexus/v5/auth/login';
const ADMIN_EMAIL = (process.env.CATALOGO_ADMIN_EMAIL || '').toLowerCase().trim();
const ADMIN_PASS  = process.env.CATALOGO_ADMIN_PASSWORD || '';

async function validarNoUsforce(email, password) {
  try {
    const ctrl = AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined;
    const r = await fetch(`${NEXUS_BASE}${NEXUS_LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: ctrl,
    });
    if (!r.ok) return { ok: false, reachable: true };
    const u = await r.json().catch(() => ({}));
    return { ok: true, reachable: true, nome: u.nome || u.name || email };
  } catch {
    return { ok: false, reachable: false }; // USFORCE fora do ar
  }
}

router.post('/login', async (req, res) => {
  const email = (req.body?.email || '').toLowerCase().trim();
  const password = req.body?.password || '';
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios' });

  // 1) USFORCE
  const via = await validarNoUsforce(email, password);
  let nome = via.nome || email;
  let fonte = 'usforce';

  // 2) fallback admin local (USFORCE fora, ou admin configurado)
  if (!via.ok) {
    const okLocal = ADMIN_EMAIL && email === ADMIN_EMAIL && password === ADMIN_PASS && ADMIN_PASS.length >= 6;
    if (!okLocal) {
      if (!via.reachable) return res.status(502).json({ error: 'USFORCE indisponível e sem admin local — tente de novo' });
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }
    fonte = 'local';
  }

  const token = jwt.sign({ sub: email, nome, fonte }, SECRET, { expiresIn: '12h' });
  res.json({ token, user: { email, nome }, fonte });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!tok) return res.status(401).json({ error: 'não autenticado' });
  try { req.user = jwt.verify(tok, SECRET); next(); }
  catch { return res.status(401).json({ error: 'sessão expirada' }); }
}

module.exports = router;
module.exports.requireAuth = requireAuth;
