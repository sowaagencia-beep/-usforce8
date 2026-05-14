// USFORCE8 — Servidor local + Integração Dropbox
// Produção: usa Netlify Functions (netlify/functions/upload.js)
// Local: npm start  →  http://localhost:3333
'use strict';

require('dotenv').config();

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3333;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

// Serve USFORCE8.html na raiz
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'USFORCE8.html')));

// ── Gerenciamento de token Dropbox ────────────────────────────────────────────

let _cachedToken  = null;
let _tokenExpiry  = 0;

async function getAccessToken() {
  if (_cachedToken && Date.now() < _tokenExpiry - 60_000) return _cachedToken;

  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = process.env;

  if (!DROPBOX_REFRESH_TOKEN) {
    throw new Error('Dropbox ainda não configurado. Acesse http://localhost:' + PORT + '/setup');
  }

  const res = await fetch('https://api.dropbox.com/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
      client_id:     DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Dropbox: ${data.error_description || data.error}`);

  _cachedToken = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  return _cachedToken;
}

// Helper: lê resposta como texto antes de parsear (mostra erro real do Dropbox)
async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Dropbox retornou: ${text.substring(0, 300)}`);
  }
}

// ── POST /api/upload ──────────────────────────────────────────────────────────
// Body JSON: { fileName, mimeType, data (base64), slug }
// Response:  { url, path }

app.post('/api/upload', async (req, res) => {
  console.log('[upload] body keys:', req.body ? Object.keys(req.body) : 'NO BODY');
  try {
    const body = req.body || {};
    const { fileName = 'image.jpg', mimeType = 'image/jpeg', data, slug = 'geral' } = body;

    console.log('[upload] fileName:', fileName, '| slug:', slug, '| data length:', data?.length);

    if (!data) return res.status(400).json({ error: 'Campo "data" (base64) obrigatório' });

    const buffer   = Buffer.from(data, 'base64');
    const ext      = path.extname(fileName).toLowerCase() || '.jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
    const safeSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const dbxPath  = `/USFORCE8/produtos/${safeSlug}/${filename}`;

    const token = await getAccessToken();

    // 1. Upload do arquivo
    const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method:  'POST',
      headers: {
        Authorization:     `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({ path: dbxPath, mode: 'add', autorename: true, mute: true }),
        'Content-Type':    'application/octet-stream',
      },
      body: buffer,
    });

    const uploaded = await readJson(uploadRes);
    console.log('[upload] Dropbox upload result:', JSON.stringify(uploaded).substring(0, 200));
    if (uploaded.error_summary) throw new Error(uploaded.error_summary);

    // 2. Cria link público
    const linkRes  = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        path:     uploaded.path_lower,
        settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' },
      }),
    });

    const linkData = await readJson(linkRes);
    let sharedUrl;

    if (linkData.error_summary?.includes('shared_link_already_exists')) {
      const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ path: uploaded.path_lower }),
      });
      const list = await readJson(listRes);
      sharedUrl   = list.links?.[0]?.url;
    } else if (linkData.error_summary) {
      throw new Error(linkData.error_summary);
    } else {
      sharedUrl = linkData.url;
    }

    if (!sharedUrl) throw new Error('URL do Dropbox não obtida');

    const directUrl = sharedUrl
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '');

    res.json({ url: directUrl, path: uploaded.path_lower });

  } catch (err) {
    console.error('[UPLOAD ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/upload ────────────────────────────────────────────────────────

app.delete('/api/upload', async (req, res) => {
  try {
    const { path: dbxPath } = req.body;
    if (!dbxPath || !dbxPath.startsWith('/USFORCE8/')) {
      return res.status(400).json({ error: 'Caminho inválido ou não permitido' });
    }
    const token = await getAccessToken();
    await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path: dbxPath }),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/upload?folder=... — lista arquivos para cleanup ─────────────────

app.get('/api/upload', async (req, res) => {
  try {
    const folder = (req.query.folder || '').trim();
    if (!folder || !folder.startsWith('/USFORCE8/')) {
      return res.status(400).json({ error: 'folder inválida' });
    }
    const token = await getAccessToken();
    const r = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path: folder, recursive: true }),
    });
    const data = await readJson(r);
    if (data.error_summary) {
      if (data.error_summary.includes('not_found')) return res.json({ files: [] });
      throw new Error(data.error_summary);
    }
    const files = (data.entries || [])
      .filter(e => e['.tag'] === 'file')
      .map(e => ({ path: e.path_lower, name: e.name, size: e.size }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/test — diagnóstico rápido ───────────────────────────────────────

app.get('/api/test', (_req, res) => {
  res.json({
    ok:      true,
    hasKey:  !!process.env.DROPBOX_APP_KEY,
    hasSecret: !!process.env.DROPBOX_APP_SECRET,
    hasToken:  !!process.env.DROPBOX_REFRESH_TOKEN,
    node:    process.version,
  });
});

// ── GET /api/dropbox/status ───────────────────────────────────────────────────

app.get('/api/dropbox/status', (_req, res) => {
  res.json({
    configured: !!process.env.DROPBOX_REFRESH_TOKEN,
    hasKey:     !!process.env.DROPBOX_APP_KEY,
  });
});

// ── Setup OAuth (uma única vez) ───────────────────────────────────────────────

const SETUP_CSS = `
  body { font-family: 'Inter', system-ui, sans-serif; background: #0F1B3D; color: #fff; margin: 0; padding: 48px; }
  h1   { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 8px; }
  p    { color: rgba(255,255,255,0.6); margin: 6px 0; font-size: 14px; }
  code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  .btn { display: inline-block; margin-top: 24px; padding: 14px 28px; background: #0061FE; color: #fff;
         font-weight: 700; text-decoration: none; font-size: 14px;
         clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); }
  .ok  { color: #4ade80; font-weight: 700; }
  .err { color: #f87171; font-weight: 700; }
  ul   { color: rgba(255,255,255,0.7); font-size: 13px; line-height: 2; padding-left: 20px; }
`;

app.get('/setup', (_req, res) => {
  const key      = process.env.DROPBOX_APP_KEY;
  const hasToken = !!process.env.DROPBOX_REFRESH_TOKEN;

  if (!key || key === 'cole_aqui_seu_app_key') {
    return res.send(`
      <html><head><style>${SETUP_CSS}</style></head><body>
        <h1>USFORCE8 · Setup Dropbox</h1>
        <p class="err">⚠ DROPBOX_APP_KEY não encontrado no arquivo .env</p>
        <ul>
          <li>Acesse <strong>https://www.dropbox.com/developers/apps</strong></li>
          <li>Create app → Scoped access → Full Dropbox → nome: <strong>USFORCE8</strong></li>
          <li>Aba <strong>Settings</strong> → copie App key e App secret</li>
          <li>Aba <strong>Settings</strong> → Redirect URIs → adicione: <code>http://localhost:${PORT}/setup/callback</code></li>
          <li>Aba <strong>Permissions</strong> → habilite: <code>files.content.write</code>, <code>files.content.read</code>, <code>sharing.write</code></li>
          <li>Cole no arquivo <code>.env</code> e reinicie o servidor</li>
        </ul>
      </body></html>
    `);
  }

  const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
  authUrl.searchParams.set('client_id',         key);
  authUrl.searchParams.set('response_type',     'code');
  authUrl.searchParams.set('token_access_type', 'offline');
  authUrl.searchParams.set('redirect_uri',      `http://localhost:${PORT}/setup/callback`);

  res.send(`
    <html><head><style>${SETUP_CSS}</style></head><body>
      <h1>USFORCE8 · Setup Dropbox</h1>
      ${hasToken ? '<p class="ok">✓ Dropbox já conectado. Upload ativo.</p>' : '<p>Autorize o USFORCE8 a acessar seu Dropbox:</p>'}
      <p>Imagens salvas em: <code>Dropbox / USFORCE8 / produtos / {slug} /</code></p>
      <a class="btn" href="${authUrl}">${hasToken ? 'Reconectar' : 'Conectar com Dropbox'}</a>
      ${hasToken ? '<p style="margin-top:20px"><a href="/" style="color:#60a5fa">← Voltar ao USFORCE8</a></p>' : ''}
    </body></html>
  `);
});

app.get('/setup/callback', async (req, res) => {
  const { code, error: oauthError } = req.query;
  if (oauthError) {
    return res.send(`<html><head><style>${SETUP_CSS}</style></head><body>
      <h1>Cancelado</h1><p class="err">${oauthError}</p>
      <a href="/setup" style="color:#60a5fa">← Tentar novamente</a>
    </body></html>`);
  }

  try {
    const tokenRes = await fetch('https://api.dropbox.com/oauth2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code, grant_type: 'authorization_code',
        client_id:     process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
        redirect_uri:  `http://localhost:${PORT}/setup/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    const envPath = path.join(__dirname, '.env');
    let envText   = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envText.includes('DROPBOX_REFRESH_TOKEN=')) {
      envText = envText.replace(/DROPBOX_REFRESH_TOKEN=.*/m, `DROPBOX_REFRESH_TOKEN=${tokenData.refresh_token}`);
    } else {
      envText += `\nDROPBOX_REFRESH_TOKEN=${tokenData.refresh_token}`;
    }
    fs.writeFileSync(envPath, envText.trimEnd() + '\n', 'utf8');

    process.env.DROPBOX_REFRESH_TOKEN = tokenData.refresh_token;
    _cachedToken = tokenData.access_token;
    _tokenExpiry = Date.now() + tokenData.expires_in * 1000;

    res.send(`
      <html><head><style>${SETUP_CSS}</style></head><body>
        <h1 class="ok">✓ Dropbox conectado!</h1>
        <p>Refresh token salvo no <code>.env</code></p>
        <p>Conta: <code>${tokenData.account_id}</code></p>
        <a class="btn" href="/">← Abrir USFORCE8</a>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send(`<html><head><style>${SETUP_CSS}</style></head><body>
      <h1>Erro</h1><p class="err">${err.message}</p>
      <a href="/setup" style="color:#60a5fa">← Tentar novamente</a>
    </body></html>`);
  }
});

// ── Error handler global — garante que erros do Express virem como JSON ──────
app.use((err, req, res, _next) => {
  console.error('[EXPRESS ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const hasToken = !!process.env.DROPBOX_REFRESH_TOKEN;
  console.log('\n  ╔══════════════════════════════════════╗');
  console.log(`  ║  USFORCE8  →  http://localhost:${PORT}   ║`);
  console.log('  ╠══════════════════════════════════════╣');
  console.log(hasToken
    ? '  ║  Dropbox  ✓  Upload ativo            ║'
    : `  ║  Setup  →  http://localhost:${PORT}/setup ║`);
  console.log('  ╚══════════════════════════════════════╝\n');
});
