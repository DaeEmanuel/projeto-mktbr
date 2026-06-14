# MKTBR Academy+

SaaS independente para cursos online com Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel e Stripe.

Domínio de produção: `mktbr.site`

## Isolamento

Este projeto foi criado fora de `BairroMarketing` em `C:\tmp\Projeto_Mktbr`.

Não reutiliza componentes, rotas, banco, tabelas, autenticação ou configurações de:

- BairroMarketing
- mdcarvalho.com
- BairroPay

## Instalação

```bash
npm install
npm run dev
```

## Variáveis obrigatórias

```bash
NEXT_PUBLIC_APP_URL=https://mktbr.site
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Supabase

Crie um projeto Supabase novo e separado. Depois execute:

```sql
-- supabase/migrations/0001_initial_schema.sql
```

Tabelas incluídas:

- `users`
- `courses`
- `modules`
- `lessons`
- `enrollments`
- `lesson_progress`
- `subscriptions`
- `payments`

Todas as tabelas públicas possuem RLS habilitado. A função de criação de perfil fica no schema privado `private`.

## Stripe

Configure no Stripe:

1. Produto de assinatura mensal.
2. Price recorrente e salve o ID em `STRIPE_PRICE_ID`.
3. Webhook para `https://mktbr.site/api/stripe/webhook`.
4. Eventos recomendados:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Vercel

Crie uma aplicação Vercel separada e conecte ao repositório GitHub separado.

Configuração:

- Framework: Next.js
- Build: `npm run build`
- Install: `npm install`
- Domínio: `mktbr.site`

## Rotas

- `/`
- `/cursos`
- `/cursos/[slug]`
- `/planos`
- `/sobre`
- `/contato`
- `/login`
- `/cadastro`
- `/dashboard`
- `/api/stripe/checkout`
- `/api/stripe/portal`
- `/api/stripe/webhook`

## Validação

```bash
npm run lint
npm run build
```
