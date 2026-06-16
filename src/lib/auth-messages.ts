const translatedMessages: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Este e-mail ja possui cadastro.",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 8 caracteres.",
  "Signup requires a valid password": "Informe uma senha valida com pelo menos 8 caracteres.",
  "Unable to validate email address: invalid format": "Informe um e-mail valido.",
  "For security purposes, you can only request this after": "Aguarde alguns segundos antes de tentar novamente.",
  "New password should be different from the old password.": "A nova senha deve ser diferente da senha atual.",
  "Auth session missing!": "Sessao expirada. Solicite um novo link e tente novamente.",
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
