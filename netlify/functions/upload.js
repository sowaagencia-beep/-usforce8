// netlify/functions/upload.js
'use strict';

const path  = require('path');
const https = require('https');

// ── HTTP helper usando módulo nativo (sem dependência de fetch) ───────────────
function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   options.method || 'GET',
      headers:  options.headers || {},
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        json:   () => JSON.parse(Buffer.concat(chunks).toString()),
      }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Cache de token Dropbox ────────────────────────────────────────────────────
let _token  = null;
let _expiry = 0;

async function getToken() {
  if (_token && Date.now() < _expiry - 60_000) return _token;

  const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = process.env;
  if (!DROPBOX_REFRESH_TOKEN) throw new Error('DROPBOX_REFRESH_TOKEN não configurado no Netlify');

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: DROPBOX_REFRESH_TOKEN,
    client_id:     DROPBOX_APP_KEY,
    client_secret: DROPBOX_APP_SECRET,
  }).toString();

  const res  = await request('https://api.dropbox.com/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);

  const data = res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  _token  = data.access_token;
  _expiry = Date.now() + data.expires_in * 1000;
  return _token;
}

async function dropboxPost(url, token, bodyObj) {
  const body = JSON.stringify(bodyObj);
  const res  = await request(url, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
  return res.json();
}

async function dropboxUpload(token, dbxPath, buffer) {
  const arg = JSON.stringify({ path: dbxPath, mode: 'add', autorename: true, mute: true });
  const res = await request('https://content.dropboxapi.com/2/files/upload', {
    method:  'POST',
    headers: {
      Authorization:     `Bearer ${token}`,
      'Dropbox-API-Arg': arg,
      'Content-Type':    'application/octet-stream',
      'Content-Length':  buffer.length,
    },
  }, buffer);
  return res.json();
}

async function dropboxDelete(token, dbxPath) {
  return dropboxPost('https://api.dropboxapi.com/2/files/delete_v2', token, { path: dbxPath });
}

async function dropboxList(token, folderPath) {
  return dropboxPost('https://api.dropboxapi.com/2/files/list_folder', token, { path: folderPath, recursive: true });
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  // ── DELETE: remove arquivo único do Dropbox ─────────────────────────────────
  if (event.httpMethod === 'DELETE') {
    try {
      const { path: dbxPath } = JSON.parse(event.body || '{}');
      if (!dbxPath || !dbxPath.startsWith('/USFORCE8/')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Path inválido' }) };
      }
      const token = await getToken();
      const result = await dropboxDelete(token, dbxPath);
      if (result.error_summary && !result.error_summary.includes('not_found')) {
        throw new Error(result.error_summary);
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      console.error('[delete]', err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── GET: lista arquivos numa pasta (para cleanup) ────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const folder = (event.queryStringParameters?.folder || '').trim();
      if (!folder || !folder.startsWith('/USFORCE8/')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'folder inválida' }) };
      }
      const token = await getToken();
      const data  = await dropboxList(token, folder);
      if (data.error_summary) {
        if (data.error_summary.includes('not_found')) return { statusCode: 200, headers, body: JSON.stringify({ files: [] }) };
        throw new Error(data.error_summary);
      }
      const files = (data.entries || [])
        .filter(e => e['.tag'] === 'file')
        .map(e => ({ path: e.path_lower, name: e.name, size: e.size }));
      return { statusCode: 200, headers, body: JSON.stringify({ files }) };
    } catch (err) {
      console.error('[list]', err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { fileName = 'image.jpg', data, slug = 'geral' } = JSON.parse(event.body || '{}');
    if (!data) return { statusCode: 400, headers, body: JSON.stringify({ error: '"data" obrigatório' }) };

    const buffer   = Buffer.from(data, 'base64');
    const ext      = path.extname(fileName).toLowerCase() || '.jpg';
    const name     = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
    const safeSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const dbxPath  = `/USFORCE8/produtos/${safeSlug}/${name}`;

    const token    = await getToken();
    const uploaded = await dropboxUpload(token, dbxPath, buffer);
    if (uploaded.error_summary) throw new Error(uploaded.error_summary);

    // Cria link público
    let linkData = await dropboxPost(
      'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
      token,
      { path: uploaded.path_lower, settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' } }
    );

    let sharedUrl = linkData.url;

    if (linkData.error_summary?.includes('shared_link_already_exists')) {
      const list = await dropboxPost('https://api.dropboxapi.com/2/sharing/list_shared_links', token, { path: uploaded.path_lower });
      sharedUrl   = list.links?.[0]?.url;
    } else if (linkData.error_summary) {
      throw new Error(linkData.error_summary);
    }

    if (!sharedUrl) throw new Error('URL Dropbox não obtida');

    const directUrl = sharedUrl
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '');

    return { statusCode: 200, headers, body: JSON.stringify({ url: directUrl, path: uploaded.path_lower }) };

  } catch (err) {
    console.error('[upload]', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
