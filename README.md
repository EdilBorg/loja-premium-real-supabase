# Loja Premium Real

Plataforma de venda de produtos digitais com pagamento manual, comprovativo, aprovação admin e liberação de acesso.

## Rodar local

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Abra: http://localhost:3000

## Admin inicial

Email/usuário: `borgesedil488@gmail.com`
Senha: `B@rgesedil101419`

## Email de alerta

O sistema já tenta avisar `borgesedil488@gmail.com` quando houver pedido/comprovativo. Para envio real, configure SMTP no `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="senha-de-app-do-gmail"
SMTP_FROM="Loja Premium <seu-email@gmail.com>"
NOTIFY_EMAIL="borgesedil488@gmail.com"
```

Sem SMTP configurado, o alerta aparece no terminal durante o desenvolvimento.
