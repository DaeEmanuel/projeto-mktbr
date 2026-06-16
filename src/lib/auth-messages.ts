const translatedMessages: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Este e-mail ja possui cadastro.",
  "User not found": "Usuario nao encontrado.",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "Token has expired or is invalid": "O link expirou ou e invalido. Solicite um novo link.",
  "Invalid Refresh Token": "Sessao expirada. Entre novamente.",
  "Refresh Token Not Found": "Sessao expirada. Entre novamente.",
  "Invalid email or password": "E-mail ou senha incorretos.",
  "Anonymous sign-ins are disabled": "Cadastro anonimo desativado.",
  "Signup is disabled": "Cadastro temporariamente indisponivel.",
  "Email signups are disabled": "Cadastro por e-mail temporariamente indisponivel.",
  "Password is too weak": "A senha e muito fraca. Use uma senha mais segura.",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 8 caracteres.",
  "Password should be at least 8 characters": "A senha deve ter pelo menos 8 caracteres.",
  "Signup requires a valid password": "Informe uma senha valida com pelo menos 8 caracteres.",
  "Unable to validate email address: invalid format": "Informe um e-mail valido.",
  "Unable to validate email address": "Informe um e-mail valido.",
  "Only an email address or phone number should be provided on signup": "Informe apenas e-mail ou telefone no cadastro.",
  "For security purposes, you can only request this after": "Aguarde alguns segundos antes de tentar novamente.",
  "New password should be different from the old password.": "A nova senha deve ser diferente da senha atual.",
  "Auth session missing!": "Sessao expirada. Solicite um novo link e tente novamente.",
  "Email link is invalid or has expired": "O link do e-mail expirou ou e invalido. Solicite um novo link.",
  "A user with this email address has already been registered": "Este e-mail ja possui cadastro.",
  "Database error saving new user": "Nao foi possivel criar sua conta agora. Tente novamente em instantes.",
  "Error sending confirmation email": "Nao foi possivel enviar o e-mail de confirmacao. Tente novamente.",
  "Error sending recovery email": "Nao foi possivel enviar o e-mail de recuperacao. Tente novamente.",
};

export function translateAuthMessage(message: string) {
  const normalized = message.trim();
  const exactMatch = translatedMessages[normalized];

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = Object.entries(translatedMessages).find(([key]) =>
    normalized.toLowerCase().includes(key.toLowerCase()),
  );

  return partialMatch?.[1] || "Nao foi possivel concluir a solicitacao. Tente novamente.";
}
