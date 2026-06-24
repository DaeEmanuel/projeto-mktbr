# MKTBR Site

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
- `books`
- `book_sales`
- `writer_payouts`
- `social_profiles`
- `generated_posts`
- `generated_images`
- `profile_analysis`
- `content_calendar`
- `scheduled_posts`

Todas as tabelas públicas possuem RLS habilitado. A função de criação de perfil fica no schema privado `private`.

## Marketplace de livros

Todo escritor pode cadastrar livros em `/dashboard/escritor`.

Regra financeira:

- Cada venda usa Stripe em modo pagamento unico.
- A venda bruta fica registrada em `book_sales.sale_amount_cents`.
- A comissao fixa da plataforma fica registrada em `book_sales.platform_commission_cents`.
- O valor liquido do escritor fica registrado em `book_sales.writer_net_cents`.
- A comissao da plataforma e sempre `R$ 5,00` por venda.
- O repasse pendente ao escritor fica em `writer_payouts`.

Exemplos:

- Livro de R$ 19,90: MKTBR R$ 5,00, escritor R$ 14,90.
- Livro de R$ 29,90: MKTBR R$ 5,00, escritor R$ 24,90.
- Livro de R$ 49,90: MKTBR R$ 5,00, escritor R$ 44,90.

Painéis:

- Escritor: `/dashboard/escritor`
- Administrador: `/dashboard/admin`
- Marketplace público: `/livros`

## MKTBR Social IA

Modulo de IA para criacao de conteudo em redes sociais.

Rotas:

- `/social-ia`
- `/social-ia/dashboard`
- `/social-ia/gerador-posts`
- `/social-ia/gerador-imagens`
- `/social-ia/bio-profissional`
- `/social-ia/analise-perfil`
- `/social-ia/calendario`
- `/social-ia/agendamentos`

Limites do plano gratuito:

- 3 posts/mes
- 1 analise/mes
- 2 imagens/mes

Planos pagos:

- Pro: `https://buy.stripe.com/8x214o7X24yNajRgVh9EI02`
- Premium: `https://buy.stripe.com/bJe9AU916c1f3Vt34r9EI03`

Estrutura preparada para integracoes futuras com Instagram, Facebook, LinkedIn,
Pinterest e Google Business.

## Stripe

Configure no Stripe:

1. Produto de assinatura mensal.
2. Price recorrente e salve o ID em `STRIPE_PRICE_ID`.
3. Webhook para `https://mktbr.site/api/stripe/webhook`.
4. Eventos recomendados:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

O evento `checkout.session.completed` tambem registra vendas de livros quando
`metadata.product = book`.

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
