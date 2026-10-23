const BRAZIL_TIME_ZONE = "America/Sao_Paulo";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const MAX_LOYALTY_DAYS = 1095;
export const DEFAULT_LOYALTY_YEARS = 1;

type BrasiliaParts = {
  date: string;
  time: string;
};

function readBrasiliaParts(date: Date): BrasiliaParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    time: `${read("hour")}:${read("minute")}`,
  };
}

export function getDefaultLoyalty(now = new Date()) {
  return readBrasiliaParts(
    new Date(now.getTime() + DEFAULT_LOYALTY_YEARS * 365 * DAY_IN_MILLISECONDS),
  );
}

export function getLoyaltyDateLimits(now = new Date()) {
  return {
    min: readBrasiliaParts(now).date,
    max: readBrasiliaParts(
      new Date(now.getTime() + MAX_LOYALTY_DAYS * DAY_IN_MILLISECONDS),
    ).date,
  };
}

export function toLoyaltyUntil(date: string, time: string) {
  return `${date}T${time}-03:00`;
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validateLoyaltyUntil(
  date: string,
  time: string,
  now = new Date(),
) {
  if (!date || !time) {
    return "Informe a data e a hora do fim da fidelidade.";
  }

  if (!isValidDate(date) || !isValidTime(time)) {
    return "Informe uma data e uma hora válidas.";
  }

  const loyaltyUntil = new Date(toLoyaltyUntil(date, time)).getTime();

  if (loyaltyUntil <= now.getTime()) {
    return "O fim da fidelidade deve ser depois do momento da compra.";
  }

  if (loyaltyUntil > now.getTime() + MAX_LOYALTY_DAYS * DAY_IN_MILLISECONDS) {
    return "O fim da fidelidade deve ser no máximo 1.095 dias depois da compra.";
  }

  return null;
}
