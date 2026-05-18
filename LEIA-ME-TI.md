# USFORCE8 — Documentação para Equipe de TI

Sistema de cadastro de produtos e geração de catálogos PDF multi-marca.
**Status:** funcionando em produção em ambiente Render + Supabase (atual).
**Objetivo:** migrar para infraestrutura interna da empresa.

---

## 1. Stack Atual

| Camada | Tecnologia | Função |
|---|---|---|
| Frontend | React 18 + Babel standalone (CDN) | SPA single-file servida pelo Express |
| Backend  | Node.js 20 + Express 4 | Servidor estático + API de upload Dropbox |
| Banco    | **PostgreSQL** (Supabase managed) | Holdings, empresas, marcas, categorias, produtos, configurações de catálogo |
| Auth     | **Supabase Auth** (signInWithPassword) | Login do administrador |
| Storage  | **Dropbox API** (OAuth2 refresh token) | Imagens dos produtos |
| PDF      | jsPDF + html2canvas (client-side) | Geração de catálogos comerciais |
| Hosting  | Render.com (free tier) | Aplicação Node.js |
| Repo     | GitHub (privado) | `sowaagencia-beep/-usforce8` |

---

## 2. Estrutura do Projeto

```
/
├── server.js                     # Express + Dropbox API
├── package.json                  # express, dotenv, multer
├── USFORCE8.html                 # SPA (entry point)
├── config.js                     # URL/anon key do Supabase (público)
├── data.jsx                      # Dados iniciais e helpers
├── brand.jsx                     # Componentes compartilhados
├── views/
│   ├── login.jsx                 # Tela de login
│   ├── admin.jsx                 # Painel administrativo
│   ├── product-form.jsx          # Cadastro/edição de produtos
│   ├── showcase.jsx              # Vitrine pública (links #vitrine/slug)
│   ├── product-detail.jsx        # Detalhe público de produto
│   ├── catalog-admin.jsx         # Configuração do catálogo PDF
│   ├── catalog-preview.jsx       # Preview + exportação PDF
│   └── layout-editor.jsx         # Editor visual do layout do catálogo
├── supabase/
│   ├── schema.sql                # Schema PostgreSQL completo
│   └── seed.sql                  # Dados de exemplo (não usar em prod)
├── .env                          # Segredos (NÃO commitado)
└── .gitignore
```

---

## 3. Esquema do Banco (PostgreSQL)

Ver `supabase/schema.sql`. Tabelas:

- `holdings` — Grupos empresariais
- `companies` — Empresas (referenciam holdings)
- `brands` — Marcas (referenciam companies)
- `categories` — Categorias por entidade (`entity_slug` = company OR brand)
- `products` — Produtos (com arrays `text[]` para `shared_with` e `images`)
- `catalog_configs` — Configurações do catálogo PDF (com `layout jsonb`)
- `entity_logos` — Logotipos por entidade
- `category_covers` — Capas de categoria no catálogo PDF

**Características PostgreSQL específicas em uso:**
- `text[]` (arrays nativos) em `products.shared_with` e `products.images`
- `jsonb` em `catalog_configs.layout`
- `serial` para IDs auto-incremento
- Row Level Security ativado em todas as tabelas
- Policy `public_all` para acesso anônimo via Supabase anon key

---

## 4. Variáveis de Ambiente (`.env`)

```env
# Dropbox API (compartilhado entre Render e local)
DROPBOX_APP_KEY=71xite9416yv00i
DROPBOX_APP_SECRET=5gx3ysbphdhhu8k
DROPBOX_REFRESH_TOKEN=KaxUMfJBI6MAAAAAAAAAAZ6Jyq0lly5xHoOMffRB8qx-ecrJBPkMu2lUTZul3GY7

PORT=3333
```

**Supabase:** URL e anon key estão hardcoded em `config.js` (são públicos por design).
**Service role key** (admin): não está sendo usada — todas as queries usam anon + RLS policies "public_all".

---

## 5. Endpoints HTTP (Express)

| Método | Endpoint | Função | Auth |
|---|---|---|---|
| GET  | `/`                       | Serve `USFORCE8.html` | público |
| POST | `/api/upload`             | Upload de imagem → Dropbox, retorna URL pública | público |
| DELETE | `/api/upload`           | Remove imagem do Dropbox | público |
| GET  | `/api/upload?proxy=URL`   | Proxy de imagem Dropbox (CORS para PDF export) | público |
| GET  | `/api/upload?folder=...`  | Lista arquivos em pasta Dropbox | público |
| GET  | `/api/test`               | Diagnóstico (versão Node + flags Dropbox) | público |
| GET  | `/setup`                  | Setup OAuth Dropbox (primeira vez) | público |
| GET  | `/setup/callback`         | Callback OAuth Dropbox | público |

Todas as queries de banco de dados vão **diretamente do navegador para o Supabase** via JS SDK — não passam pelo Express.

---

## 6. Como Rodar Localmente

```bash
npm install
cp .env.example .env  # ou cria manualmente com as vars acima
npm start             # http://localhost:3333
```

Logs esperados no terminal:
```
╔══════════════════════════════════════╗
║  USFORCE8  →  http://localhost:3333  ║
║  Dropbox  ✓  Upload ativo            ║
╚══════════════════════════════════════╝
```

---

## 7. Pontos para a Migração

### A. Banco de dados
**Recomendação forte:** provisionar **PostgreSQL 14+** ao invés de MySQL. Razões:
- O código usa `text[]` (arrays nativos) — em MySQL vira `JSON`, exige conversão
- `serial` precisa virar `AUTO_INCREMENT`
- `timestamptz` precisa virar `DATETIME`
- Row Level Security (RLS) não existe em MySQL

Se obrigatório usar MySQL, é necessário:
- Reescrever o schema (arrays → JSON)
- Substituir Supabase Auth por solução custom (bcrypt + JWT)
- Reescrever todas as queries do frontend (Supabase SDK não fala MySQL)
- Construir API REST intermediária no Express

### B. Autenticação
Hoje usa **Supabase Auth**. Para migrar:
- Opção 1: continuar com Supabase Auth (gratuito) e mudar só o DB
- Opção 2: implementar JWT próprio com bcrypt + tabela `users`
- Opção 3: integrar com SSO corporativo (LDAP / Active Directory / SAML)

### C. Hospedagem
Servidor Node.js 20+ com:
- 1 GB RAM, 1 vCPU, 10 GB disco
- HTTPS (recomendado: nginx reverse proxy ou Caddy)
- Variáveis de ambiente seguras (sistema de secrets)
- Backup automático do banco

### D. Armazenamento de imagens
**Manter Dropbox** (já funciona, OAuth está configurado).
Se quiser migrar para S3 corporativo: reescrever `/api/upload` em `server.js`.

### E. Domínio
Apontar `A` record ou `CNAME` do domínio escolhido para o servidor.
HTTPS via Let's Encrypt (`certbot` no nginx) ou certificado corporativo.

---

## 8. Roteamento da Aplicação (SPA)

- `/` → tela de login (admin)
- `/#vitrine/<slug>` → vitrine pública de uma empresa/marca (sem login)
  - Exemplo: `https://catalogo.empresa.com.br/#vitrine/oceanfoods`
- Todas as outras rotas são gerenciadas client-side via React state

---

## 9. Migração de Dados

Para exportar dados do Supabase atual:
1. Acessar painel Supabase do projeto `lpwdvszmmalvhjeclwtg`
2. SQL Editor → `pg_dump` ou export por tabela
3. Importar no novo PostgreSQL

Tabelas a exportar (em ordem, por causa das foreign keys):
1. `holdings`
2. `companies`
3. `brands`
4. `categories`
5. `products`
6. `catalog_configs`
7. `entity_logos`
8. `category_covers`

---

## 10. Contato

Desenvolvido pela SOWA Agência.
Repositório: `https://github.com/sowaagencia-beep/-usforce8`

Para dúvidas técnicas, contatar o responsável pelo projeto antes de iniciar a migração.
