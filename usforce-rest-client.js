// usforce-rest-client.js
// Cliente "drop-in" que imita a API do Supabase (sb.from(...).select/insert/
// upsert/update/delete/eq + sb.auth.signInWithPassword/signOut) mas conversa
// com a API REST própria do catálogo (Express + Postgres). Assim as telas do
// Luiz continuam funcionando SEM reescrita.
(function () {
  function makeClient(base) {
    base = base || '/api';

    function token() { try { return localStorage.getItem('catalogo_token') || ''; } catch { return ''; } }
    function headers(json) {
      const h = {};
      if (json) h['Content-Type'] = 'application/json';
      const t = token(); if (t) h['Authorization'] = 'Bearer ' + t;
      return h;
    }
    function wrap(r, j) {
      return r.ok ? { data: j.data || [], error: null }
                  : { data: null, error: { message: (j && j.error) || ('HTTP ' + r.status) } };
    }

    function from(table) {
      const q = { where: {}, order: null, op: null, rows: null, set: null, onConflict: null };

      async function run() {
        try {
          if (q.op === 'select') {
            const p = new URLSearchParams();
            if (q.order) p.set('order', q.order);
            if (Object.keys(q.where).length) p.set('where', JSON.stringify(q.where));
            const r = await fetch(`${base}/db/${table}?` + p.toString());
            return wrap(r, await r.json());
          }
          if (q.op === 'insert' || q.op === 'upsert') {
            const r = await fetch(`${base}/db/${table}`, {
              method: 'POST', headers: headers(true),
              body: JSON.stringify({ rows: q.rows, upsert: q.op === 'upsert', onConflict: q.onConflict }),
            });
            return wrap(r, await r.json());
          }
          if (q.op === 'update') {
            const r = await fetch(`${base}/db/${table}`, {
              method: 'PATCH', headers: headers(true),
              body: JSON.stringify({ set: q.set, where: q.where }),
            });
            return wrap(r, await r.json());
          }
          if (q.op === 'delete') {
            const r = await fetch(`${base}/db/${table}`, {
              method: 'DELETE', headers: headers(true),
              body: JSON.stringify({ where: q.where }),
            });
            return wrap(r, await r.json());
          }
          return { data: [], error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      }

      const builder = {
        select() { q.op = q.op || 'select'; return builder; },
        order(col, opts) { q.order = col + ':' + (opts && opts.ascending === false ? 'desc' : 'asc'); return builder; },
        insert(rows) { q.op = 'insert'; q.rows = rows; return builder; },
        upsert(rows, opts) { q.op = 'upsert'; q.rows = rows; q.onConflict = opts && opts.onConflict; return builder; },
        update(set) { q.op = 'update'; q.set = set; return builder; },
        delete() { q.op = 'delete'; return builder; },
        eq(col, val) { q.where[col] = val; return builder; },
        then(resolve, reject) { return run().then(resolve, reject); },
      };
      return builder;
    }

    const auth = {
      async signInWithPassword({ email, password }) {
        try {
          const r = await fetch(`${base}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const j = await r.json();
          if (!r.ok) return { data: null, error: { message: j.error || 'Falha no login' } };
          try {
            localStorage.setItem('catalogo_token', j.token);
            localStorage.setItem('catalogo_user', JSON.stringify(j.user || {}));
          } catch {}
          return { data: { user: j.user }, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      async signOut() {
        try { localStorage.removeItem('catalogo_token'); localStorage.removeItem('catalogo_user'); } catch {}
        return { error: null };
      },
      async getSession() {
        try { const t = localStorage.getItem('catalogo_token'); return { data: { session: t ? { access_token: t } : null } }; }
        catch { return { data: { session: null } }; }
      },
    };

    // Realtime do Supabase — stub "faz nada" (sem live-sync; basta recarregar a página).
    function channel() {
      const ch = { on() { return ch; }, subscribe() { return ch; }, unsubscribe() { return Promise.resolve(); } };
      return ch;
    }
    function removeChannel() { return Promise.resolve(); }

    return { from, auth, channel, removeChannel };
  }

  window.makeUsforceClient = makeClient;
})();
