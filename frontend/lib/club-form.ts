export const CLUB_NAME_LIMITS = { min: 3, max: 60 } as const;

export const CLUB_WORDS_LIMITS = { min: 2, max: 5 } as const;

const NAME_CHARS = /^[\p{L} \-.]+$/u;
const ACRONYM_CHARS = /^[A-Z]{3}$/;
const ACCENT_MARKS = /\p{Mn}+/gu;

export function normalizeName(value: string) {
  return value.replace(/ +/g, " ").trim();
}

export function countCharacters(value: string) {
  return [...value].length;
}

function countWords(value: string) {
  return value.split(" ").filter((part) => /\p{L}/u.test(part)).length;
}

function nameLetters(name: string) {
  return [...name.normalize("NFD").replace(ACCENT_MARKS, "")]
    .filter((character) => /\p{L}/u.test(character))
    .map((character) => character.toUpperCase())
    .join("");
}

export function validateClubName(raw: string): string | null {
  const name = normalizeName(raw);

  if (!name) {
    return "Informe o nome do clube.";
  }

  if (/[\u0000-\u001f\u007f]/.test(raw)) {
    return "O nome não aceita caracteres de controle.";
  }

  const length = countCharacters(name);

  if (length < CLUB_NAME_LIMITS.min || length > CLUB_NAME_LIMITS.max) {
    return `O nome deve ter de ${CLUB_NAME_LIMITS.min} a ${CLUB_NAME_LIMITS.max} caracteres.`;
  }

  if (!NAME_CHARS.test(name)) {
    return "O nome aceita apenas letras, espaços, hífen e ponto.";
  }

  const words = countWords(name);

  if (words < CLUB_WORDS_LIMITS.min || words > CLUB_WORDS_LIMITS.max) {
    return `O nome deve ter de ${CLUB_WORDS_LIMITS.min} a ${CLUB_WORDS_LIMITS.max} palavras.`;
  }

  return null;
}

export function validateClubAcronym(raw: string, rawName: string): string | null {
  if (!raw) {
    return "Informe a sigla do clube.";
  }

  if (!ACRONYM_CHARS.test(raw)) {
    return "A sigla deve ter exatamente 3 letras de A a Z.";
  }

  if (raw.charAt(0) === raw.charAt(1) && raw.charAt(1) === raw.charAt(2)) {
    return "A sigla não pode ter as três letras iguais.";
  }

  const letters = nameLetters(normalizeName(rawName));

  if (!letters.startsWith(raw.charAt(0))) {
    return "A sigla deve começar pela primeira letra do nome.";
  }

  let index = 1;

  for (let position = 1; position < raw.length; position++) {
    while (index < letters.length && letters.charAt(index) !== raw.charAt(position)) {
      index++;
    }

    if (index === letters.length) {
      return "A sigla deve usar letras do nome, na ordem.";
    }

    index++;
  }

  return null;
}
