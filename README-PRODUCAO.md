# Loja Premium Real — versão Supabase/Vercel

Esta versão está preparada para publicar com **Vercel + Supabase**.

## 1. Criar Supabase

1. Acesse Supabase e crie um projeto.
2. Vá em **Project Settings > Database**.
3. Copie a connection string PostgreSQL.
4. Coloque em `DATABASE_URL` e `DIRECT_URL`.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:SENHA@db.PROJECT_REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:SENHA@db.PROJECT_REF.supabase.co:5432/postgres"
```

## 2. Criar Storage

No Supabase, vá em **Storage** e crie um bucket chamado:

```text
loja-premium
```

Deixe público para imagens, vídeos e comprovativos aparecerem no painel.

Depois vá em **Project Settings > API** e copie:

```env
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET="loja-premium"
```

## 3. Rodar local com Supabase

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## 4. Publicar na Vercel

1. Suba o projeto no GitHub.
2. Na Vercel, importe o repositório.
3. Coloque as variáveis de ambiente:

```env
DATABASE_URL=...
DIRECT_URL=...
JWT_SECRET=...
NOTIFY_EMAIL="borgesedil488@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="teu-email@gmail.com"
SMTP_PASS="tua-app-password-do-gmail"
SMTP_FROM="Loja Premium <teu-email@gmail.com>"
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET="loja-premium"
```

4. Deploy.

## 5. Criar admin em produção

Depois do deploy, rode localmente apontando para a mesma `DATABASE_URL` da Supabase:

```bash
npm run seed
```

Admin padrão:

```text
Usuário: borgesedil488@gmail.com
Senha: B@rgesedil101419
```

Troque a senha depois que entrar.
