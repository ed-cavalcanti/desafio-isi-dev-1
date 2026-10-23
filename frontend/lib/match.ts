import { getFormationConfig } from "@/lib/lineup";
import type {
  DuelAttribute,
  Duelist,
  Formation,
  Match,
  MatchDuel,
  MatchOutcome,
  PlayerCondition,
  Position,
} from "@/lib/types";

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

const shortAttributeLabels: Record<DuelAttribute, string> = {
  shooting: "Fin",
  passing: "Pas",
  dribbling: "Dri",
  defending: "Def",
};

export function formatDuelAttributeShort(attribute: DuelAttribute) {
  return shortAttributeLabels[attribute] ?? attribute;
}

export function formatMatchScore(homeGoals: number, awayGoals: number) {
  return `${homeGoals} × ${awayGoals}`;
}

export function formatLineLabel(line: number | null) {
  return line === null ? "Goleiro" : `${line}º de linha`;
}

export type DuelSide = "home" | "away";

export type DuelRole = {
  side: DuelSide;
  line: number | null;
};

export type DuelRoles = {
  attacker: DuelRole;
  defender: DuelRole;
};

const DUEL_ROLES: Record<number, DuelRoles> = {
  1: {
    attacker: { side: "home", line: 4 },
    defender: { side: "away", line: null },
  },
  2: {
    attacker: { side: "home", line: 3 },
    defender: { side: "away", line: 1 },
  },
  3: {
    attacker: { side: "home", line: 2 },
    defender: { side: "away", line: 2 },
  },
  4: {
    attacker: { side: "away", line: 4 },
    defender: { side: "home", line: null },
  },
  5: {
    attacker: { side: "away", line: 3 },
    defender: { side: "home", line: 1 },
  },
  6: {
    attacker: { side: "away", line: 2 },
    defender: { side: "home", line: 2 },
  },
};

export function getDuelRoles(order: number): DuelRoles | null {
  return DUEL_ROLES[order] ?? null;
}

export type StarterRow = "goal" | "defense" | "midfield" | "attack";

export type MatchStarterUse = {
  attribute: DuelAttribute;
  value: number;
};

export type MatchStarter = {
  playerId: number;
  name: string;
  position: Position;
  condition: PlayerCondition;
  line: number | null;
  uses: MatchStarterUse[];
  scored: boolean;
};

export type MatchStarters = {
  home: MatchStarter[];
  away: MatchStarter[];
};

export type MatchDuelGroup = {
  side: DuelSide;
  clubId: number;
  clubName: string;
  goals: number;
  duels: MatchDuel[];
};

function createStarter(duelist: Duelist, line: number | null): MatchStarter {
  return {
    playerId: duelist.player_id,
    name: duelist.name,
    position: duelist.position,
    condition: duelist.condition,
    line,
    uses: [],
    scored: false,
  };
}

function sortUses(uses: MatchStarterUse[]) {
  return [...uses].sort(
    (first, second) =>
      Number(first.attribute === "defending") -
      Number(second.attribute === "defending"),
  );
}

function sortStarters(starters: MatchStarter[]) {
  return [...starters].sort((first, second) => {
    if (first.line === null) return -1;
    if (second.line === null) return 1;
    return first.line - second.line;
  });
}

export function buildMatchStarters(match: Match): MatchStarters {
  const homeStarters = new Map<number, MatchStarter>();
  const awayStarters = new Map<number, MatchStarter>();
  const startersBySide = { home: homeStarters, away: awayStarters };

  const register = (duelist: Duelist, role: DuelRole) => {
    const starters = startersBySide[role.side];
    const starter =
      starters.get(duelist.player_id) ?? createStarter(duelist, role.line);

    starter.uses.push({ attribute: duelist.attribute, value: duelist.value });
    starters.set(duelist.player_id, starter);

    return starter;
  };

  for (const duel of match.duels) {
    const roles = getDuelRoles(duel.order);
    if (!roles) continue;

    const attacker = register(duel.attacker, roles.attacker);
    register(duel.defender, roles.defender);

    if (duel.goal) attacker.scored = true;
  }

  const finish = (starters: Map<number, MatchStarter>) =>
    sortStarters(Array.from(starters.values())).map((starter) => ({
      ...starter,
      uses: sortUses(starter.uses),
    }));

  return {
    home: finish(homeStarters),
    away: finish(awayStarters),
  };
}

export function getStarterRow(
  starter: MatchStarter,
  formation: Formation,
): StarterRow {
  if (starter.line === null) return "goal";

  const config = getFormationConfig(formation);

  if (starter.line <= config.defense) return "defense";
  if (starter.line <= config.defense + config.midfield) return "midfield";

  return "attack";
}

export function groupMatchDuels(match: Match): MatchDuelGroup[] {
  const duels = [...match.duels].sort(
    (first, second) => first.order - second.order,
  );

  return [
    {
      side: "home",
      clubId: match.home_club_id,
      clubName: match.home_club_name,
      goals: match.home_goals,
      duels: duels.filter((duel) => duel.order <= 3),
    },
    {
      side: "away",
      clubId: match.away_club_id,
      clubName: match.away_club_name,
      goals: match.away_goals,
      duels: duels.filter((duel) => duel.order > 3),
    },
  ];
}
