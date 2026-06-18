# Arquitetura

## Visão geral
**Página da Sowa por fora, motor do USFORCE por dentro.**

- O usuário entra por **`sowaagencia.com.br`** (botão "Entrar") → vai pra Central de Marketing.
- A Central é um **app Node próprio** (este repositório), rodando **separado** (ex.: `app.sowaagencia.com.br`).
- Ela **reaproveita o USFORCE**: login (usuários), banco (nexusdb), WhatsApp (Evolution), e-mail (SMTP), imagens (Dropbox).
- **Desacoplado:** deploy ou queda do USFORCE **não derruba** a Central (o banco é um serviço separado do app; a Central só "encosta" no USFORCE no momento do login e na sincronização de dados).

## Camadas
- **Frontend:** React via CDN (Babel standalone, sem build). Telas em `views/` (login, admin, vitrine, catálogo PDF, editor de layout).
- **Adaptador (`usforce-rest-client.js`):** imita a API do Supabase antigo (`sb.from(...).select/insert/...`, `sb.auth...`), mas conversa com a **API REST própria**. Por isso as telas do Luiz **não precisaram ser reescritas**.
- **API (`routes/`):**
  - `auth` — valida o login no USFORCE e emite um **token próprio** (JWT).
  - `db` — CRUD das tabelas (GET público pra vitrine; escrita exige token).
  - `sync` — importa produtos do USFORCE.
- **Banco:** Postgres (**nexusdb**, schema isolado `catalogo`). Sem `DATABASE_URL`/`DB_*` → **modo demonstração** em memória (`lib/memstore.js`), com dados de exemplo.
- **Imagens:** Dropbox (`server.js` cuida do upload), pasta `/USFORCE8/produtos/{slug}/`.

## Login
Valida no USFORCE (`POST /nexus/v5/auth/login`, módulo `usuario`) e emite JWT próprio (12h). Há um **admin local** de emergência (`CATALOGO_ADMIN_*`) só pra demo/break-glass. Depois do login, a Central **não depende** do USFORCE a cada requisição.

## Histórico
Originalmente um app do **Luiz (Sowa)** em **Supabase + Render**. O Supabase grátis foi **desligado** (dados perdidos; as fotos sobreviveram no Dropbox). Foi **reconstruído** com banco e login próprios, plugado no USFORCE, mantendo o frontend/PDF do Luiz.
