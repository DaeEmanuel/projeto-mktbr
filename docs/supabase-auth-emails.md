# Supabase Auth - E-mails MKTBR Academia

Estes templates removem os textos padrao em ingles do Supabase e aplicam a identidade da MKTBR Academia.

No Supabase hospedado, os e-mails sao configurados em:

```text
Authentication > Emails > Templates
```

Tambem podem ser atualizados pela Supabase Management API em:

```text
PATCH https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth
```

Referencia oficial usada: https://supabase.com/docs/guides/auth/auth-email-templates

## Identidade visual

Todos os templates em `supabase/templates` usam:

- Logomarca textual no topo: icone verde com letra M e nome MKTBR Academia.
- Verde MKTBR: `#00c853`.
- Azul escuro: `#061421`.
- Link oficial: `https://www.mktbr.site`.
- Botao principal com `{{ .ConfirmationURL }}`.

## Confirmacao de cadastro

Template:

```text
supabase/templates/confirmation.html
```

Assunto:

```text
Confirme seu cadastro na MKTBR Academia
```

Conteudo aplicado:

```text
Olá!

Obrigado por criar sua conta na MKTBR Academia.

Para ativar seu acesso à plataforma, clique no botão abaixo:

[Confirmar meu cadastro]

Após a confirmação, você poderá acessar seus cursos, materiais e recursos exclusivos.

Se você não solicitou este cadastro, ignore esta mensagem.

Atenciosamente,

Equipe MKTBR Academia
https://www.mktbr.site
```

## Recuperacao de senha

Template:

```text
supabase/templates/recovery.html
```

Assunto:

```text
Redefinição de senha - MKTBR Academia
```

Conteudo aplicado:

```text
Olá!

Recebemos uma solicitação para redefinir sua senha.

Clique no botão abaixo para criar uma nova senha:

[Redefinir minha senha]

Se você não solicitou esta alteração, ignore este e-mail.

Atenciosamente,

Equipe MKTBR Academia
https://www.mktbr.site
```

## Convite

Template:

```text
supabase/templates/invite.html
```

Assunto:

```text
Você foi convidado para a MKTBR Academia
```

## Remetente

Configure em:

```text
Authentication > Emails > SMTP Settings
```

Valores recomendados:

```text
Sender name: MKTBR Academia
Sender email: contato@mktbr.site
```

O e-mail remetente precisa estar verificado no provedor SMTP configurado.

## URLs obrigatorias

Configure em:

```text
Authentication > URL Configuration
```

Site URL:

```text
https://www.mktbr.site
```

Redirect URLs:

```text
https://www.mktbr.site/auth/callback
https://mktbr.site/auth/callback
https://www.mktbr.site/redefinir-senha
https://mktbr.site/redefinir-senha
```

## Confirmacao obrigatoria de e-mail

Configure em:

```text
Authentication > Providers > Email
```

Ativar:

```text
Confirm email: ON
Secure email change: ON
Confirm email change: ON
```

## Campos da Management API

Use estes campos se for aplicar por API:

```json
{
  "mailer_subjects_confirmation": "Confirme seu cadastro na MKTBR Academia",
  "mailer_templates_confirmation_content": "conteudo de supabase/templates/confirmation.html",
  "mailer_subjects_recovery": "Redefinição de senha - MKTBR Academia",
  "mailer_templates_recovery_content": "conteudo de supabase/templates/recovery.html",
  "mailer_subjects_invite": "Você foi convidado para a MKTBR Academia",
  "mailer_templates_invite_content": "conteudo de supabase/templates/invite.html"
}
```
