import type { PlayerCondition, Position } from "@/lib/types";

const coinFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCoins(value: number) {
  return coinFormatter.format(value);
}

export function formatSignedCoins(value: number) {
  return value > 0 ? `+${formatCoins(value)}` : formatCoins(value);
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

const conditionLabels: Record<PlayerCondition, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

export function formatCondition(condition: PlayerCondition) {
  return conditionLabels[condition] ?? condition;
}

const positionLabels: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

export function formatPosition(position: Position) {
  return positionLabels[position] ?? position;
}

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return (first + last).toUpperCase();
}

export function getClubInitials(name: string) {
  return name.trim().slice(0, 3).toUpperCase();
}

export function getLastName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return words.length > 0 ? words[words.length - 1] : "";
}

