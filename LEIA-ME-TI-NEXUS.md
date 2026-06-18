# Catálogo Sowa — Deploy usando a infra do USFORCE

App **próprio** (separado do USFORCE) de catálogo de produtos + vitrine pública + PDF.
Reusa a infra do USFORCE **sem ficar acoplado** ao runtime do Nexus.

## Princípio: não cai quando o USFORCE atualiza
- Roda como **serviço Node separado** (processo/porta próprios). Deploy do Nexus reinicia o *app do Nexus*, **não** este.
- Usa o **nexusdb** (Postgres) — que é um serviço de banco separado do app do Nexus.
- Login valida no USFORCE **só no momento do login** e emite token próprio (12h). Depois, não depende do USFORCE a cada request.
- A vitrine pública lê o banco direto → fica no ar mesmo com o app do Nexus fora.

## 1. Banco (uma vez)
Rodar `db/DEPLOY-NEXUSDB.sql` no **Console SQL do USFORCE** (banco nexus). Cria o schema isolado `catalogo` (não mexe em nada existente).

## 2. Variáveis de ambiente do serviço
Aceita o **mesmo padrão de env do nexusdb** (`DB_*`) OU uma `DATABASE_URL`:
```env
# Banco (use os MESMOS valores do core/secrets/nexusdb.env do Nexus)
DB_HOST=...
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_DATABASE=...
# DB_SSL=true            # se o Postgres exigir SSL

# Login USFORCE (já é o default; sobrescrever só se mudar)
NEXUS_API_BASE=https://api.usforce.com.br:8001
CATALOGO_JWT_SECRET=<gerar um segredo forte>

# Imagens (Dropbox) — mesmos do .env atual
DROPBOX_APP_KEY=...
DROPBOX_APP_SECRET=...
DROPBOX_REFRESH_TOKEN=...

PORT=3333
```
> O app usa `search_path=catalogo,public` automaticamente — as tabelas resolvem no schema `catalogo`.
> **Sem `DB_*`/`DATABASE_URL` → modo DEMO** (loja em memória, dados de exemplo). Bom pra testar, não pra produção.

## 3. Rodar o serviço
```bash
npm install
npm start            # ou pm2 start server.js --name catalogo / systemd unit
```
Reverse proxy (nginx/Caddy) → domínio, ex.: `catalogo.sowaagencia.com.br` ou `usforce.com.br/catalogo`. HTTPS via Let's Encrypt.

## 4. Segurança (IMPORTANTE)
- **Rotacionar** o token do GitHub (`ghp_...`) e o `DROPBOX_APP_SECRET`/`REFRESH_TOKEN` — foram trafegados em texto.
- `CATALOGO_JWT_SECRET` forte e único em produção.
- Em produção, **não** definir `CATALOGO_ADMIN_PASSWORD` (admin local é só break-glass de DEMO; login real é via USFORCE).
- GET das tabelas é público (vitrine); toda escrita exige token. (Removido o acesso aberto que o Supabase tinha.)

## Arquitetura (resumo)
| Camada | Onde | Cai com deploy do USFORCE? |
|---|---|---|
| Vitrine + PDF + admin | este serviço Node | Não |
| Dados | nexusdb, schema `catalogo` | Não (banco ≠ app) |
| Login | valida no USFORCE no 1º acesso → token próprio | Só no instante do login |
| Imagens | Dropbox | Não |
