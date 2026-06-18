# Segurança

- **Login:** pelos usuários do **USFORCE** — não há cadastro de senha à parte. Após validar, a Central emite um token próprio (JWT).
- **Acesso aos dados:** ver a vitrine = **público**; criar/editar = **só com token**. (Foi removido o acesso aberto que o Supabase antigo tinha, onde qualquer um com a chave lia e alterava tudo.)
- **Segredos (`.env`):** ficam em `.env`, que **NÃO** é versionado (está no `.gitignore`). **Nunca commitar `.env`.**
- **Rotacionar:** o token do GitHub e os do Dropbox que circularam em texto **devem ser trocados** assim que possível.
- **Repositório:** hoje está **público** — avaliar deixar **privado** (não há segredo no código, mas é exposição do projeto).
- **Admin local (`CATALOGO_ADMIN_*`):** é só break-glass/demo. Em produção, **não** definir senha local — o login real é via USFORCE.
- **Banco em produção:** schema isolado `catalogo` no nexusdb (não colide com tabelas existentes). A TI cuida de backup.
