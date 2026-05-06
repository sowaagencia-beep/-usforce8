// netlify/functions/upload.js
// Recebe: JSON { fileName, mimeType, data (base64), slug }
// Retorna: { url, path }

'use strict';

const path = require('path');

// ── Cache de token Dropbox ────────────────────────────────────────────────────
let _token  = null;
let _expiry = 0;

async function getToken() {
  if (_token && Date.now() < _expiry - 60_000) return _token;

  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = process.env;
  if (!DROPBOX_REFRESH_TOKEN) throw new Error('DROPBOX_REFRESH_TOKEN não configurado nas variáveis de ambiente do Netlify');

  const res  = await fetch('https://api.dropbox.com/oauth2/token', {
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
  if (data.error) throw new Error(data.error_description || data.error);

  _token  = data.access_token;
  _expiry = Date.now() + data.expires_in * 1000;
  return _token;
}

// ── Handler principal ─────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { fileName = 'image.jpg', mimeType = 'image/jpeg', data, slug = 'geral' } = JSON.parse(event.body || '{}');

    if (!data) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Campo "data" (base64) obrigatório' }) };

    const buffer  = Buffer.from(data, 'base64');
    const ext     = path.extname(fileName).toLowerCase() || '.jpg';
    const name    = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
    const safeSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const dbxPath = `/USFORCE8/produtos/${safeSlug}/${name}`;

    const token = await getToken();

    // 1. Upload do arquivo
    const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method:  'POST',
      headers: {
        Authorization:    `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({ path: dbxPath, mode: 'add', autorename: true, mute: true }),
        'Content-Type':   'application/octet-stream',
      },
      body: buffer,
    });

    const uploaded = await uploadRes.json();
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

    const linkData = await linkRes.json();
    let sharedUrl  = linkData.url;

    if (linkData.error_summary?.includes('shared_link_already_exists')) {
      const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ path: uploaded.path_lower }),
      });
      const list = await listRes.json();
      sharedUrl   = list.links?.[0]?.url;
    } else if (linkData.error_summary) {
      throw new Error(linkData.error_summary);
    }

    if (!sharedUrl) throw new Error('URL do Dropbox não obtida');

    const directUrl = sharedUrl
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: directUrl, path: uploaded.path_lower }),
    };

  } catch (err) {
    console.error('[upload]', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
