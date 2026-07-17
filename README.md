# Dashboard Coopmetro

Dashboard de faturamento SPOT/SDD com login, histórico e cadastro de usuários coordenado pelo Supabase.

## Publicar sem CLI

1. No GitHub, crie um repositório privado.
2. Use **Add file > Upload files** e envie todo o conteúdo deste pacote, mantendo as pastas.
3. No Netlify, escolha **Add new project > Import an existing project > GitHub**.
4. Selecione o repositório. O `netlify.toml` já define a raiz pública e a pasta das Functions.
5. Em **Project configuration > Environment variables**, cadastre:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Faça um novo deploy.

## Preparar o Supabase

1. Execute `supabase-setup.sql` no SQL Editor.
2. Em **Authentication > Users**, crie `edinanmag@gmail.com` com a senha definida pelo administrador e confirme o e-mail.
3. Execute novamente o último bloco do SQL para promover essa conta a `coordenador`.

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no `config.js`, no HTML ou no repositório. Ela deve existir somente nas variáveis protegidas do Netlify.
