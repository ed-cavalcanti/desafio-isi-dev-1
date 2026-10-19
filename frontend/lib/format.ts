import type { PlayerCondition, Position } from "@/lib/types";

const coinFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCoins(value: number) {
  return coinFormatter.format(value);
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
  MEI: "Meia",
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
