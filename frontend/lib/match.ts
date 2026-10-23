import type { DuelAttribute, MatchOutcome } from "@/lib/types";

export const ALL_CLUBS = "all";

const resultLabels: Record<MatchOutcome, string> = {
  MANDANTE: "Vitória do mandante",
  VISITANTE: "Vitória do visitante",
  EMPATE: "Empate",
};

export function formatMatchResult(result: MatchOutcome) {
  return resultLabels[result] ?? result;
}

const attributeLabels: Record<DuelAttribute, string> = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
};

export function formatDuelAttribute(attribute: DuelAttribute) {
  return attributeLabels[attribute] ?? attribute;
}

export function formatMatchScore(homeGoals: number, awayGoals: number) {
  return `${homeGoals} × ${awayGoals}`;
}
