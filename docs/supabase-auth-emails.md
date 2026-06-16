# Supabase Auth - E-mails MKTBR Academia

Configure estes itens no painel Supabase do projeto MKTBR Academia.

## Confirmacao de e-mail obrigatoria

Em Authentication > Providers > Email:

- Enable Email Confirmations: ativado
- Secure email change: ativado
- Confirm email change: ativado

## Remetente

Em Authentication > SMTP Settings:

- Sender name: MKTBR Academia
- Sender email: usar um e-mail verificado do dominio mktbr.site

## URLs

Em Authentication > URL Configuration:

- Site URL: https://mktbr.site
- Redirect URLs:
  - https://mktbr.site/auth/callback
  - https://www.mktbr.site/auth/callback
  - https://mktbr.site/redefinir-senha
  - https://www.mktbr.site/redefinir-senha

## Template - Confirmar cadastro

Assunto:

```text
Confirme seu cadastro na MKTBR Academia
```

Corpo sugerido:

```html
<h2>Bem-vindo a MKTBR Academia</h2>
<p>Confirme seu e-mail para acessar seus cursos, assinatura e dashboard do aluno.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar meu e-mail</a></p>
<p>Se voce nao criou esta conta, ignore esta mensagem.</p>
```

## Template - Recuperar senha

Assunto:

```text
Recupere sua senha da MKTBR Academia
```

Corpo sugerido:

```html
<h2>Recuperacao de senha</h2>
<p>Recebemos uma solicitacao para alterar sua senha na MKTBR Academia.</p>
<p><a href="{{ .ConfirmationURL }}">Criar nova senha</a></p>
<p>Se voce nao solicitou esta alteracao, ignore esta mensagem.</p>
```
