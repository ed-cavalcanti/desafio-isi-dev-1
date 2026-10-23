export const AGE_LIMITS = { min: 16, max: 45 } as const;

export const AGILITY_LIMITS = { min: 1, max: 100 } as const;

export const AGILITY_MAX_FOR_35_PLUS = 85;

export function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validatePlayerName(raw: string): string | null {
  const name = normalizeName(raw);

  if (!name) {
    return "Informe o nome do jogador.";
  }

  if (/[\u0000-\u001f\u007f]/.test(raw)) {
    return "O nome não aceita caracteres de controle.";
  }

  if ([...name].length < 3 || [...name].length > 100) {
    return "O nome deve ter de 3 a 100 caracteres.";
  }

  if (/\p{Nd}/u.test(name)) {
    return "O nome não aceita dígitos.";
  }

  if (name.split(" ").filter((part) => /\p{L}/u.test(part)).length < 2) {
    return "O nome deve ter pelo menos duas palavras.";
  }

  return null;
}

export function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
