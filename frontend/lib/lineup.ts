import type { Formation, Player, Position } from "@/lib/types";

export type FormationConfig = {
  value: Formation;
  defense: number;
  midfield: number;
  attack: number;
  description: string;
};

export const FORMATIONS: FormationConfig[] = [
  {
    value: "3-1",
    defense: 3,
    midfield: 0,
    attack: 1,
    description: "Defesa 3, ataque 1",
  },
  {
    value: "2-2",
    defense: 2,
    midfield: 0,
    attack: 2,
    description: "Defesa 2, ataque 2",
  },
  {
    value: "2-1-1",
    defense: 2,
    midfield: 1,
    attack: 1,
    description: "Defesa 2, meia 1, ataque 1",
  },
  {
    value: "1-2-1",
    defense: 1,
    midfield: 2,
    attack: 1,
    description: "Defesa 1, meia 2, ataque 1",
  },
];

export const DEFAULT_FORMATION: Formation = "2-1-1";

export type LineupAssignments = Record<string, string>;

export type LineupSlot = {
  key: string;
  label: string;
  hint: string;
  positions: Position[];
};

export const positionAvatarStyles: Record<Position, string> = {
  GOL: "bg-avatar-cyan text-avatar-cyan-foreground",
  ZAG: "bg-avatar-violet text-avatar-violet-foreground",
  LAT: "bg-warning-soft text-warning-soft-foreground",
  MEI: "bg-avatar-pink text-avatar-pink-foreground",
  ATA: "bg-primary-soft text-primary",
};

export function getFormationConfig(formation: Formation): FormationConfig {
  return FORMATIONS.find((config) => config.value === formation) ?? FORMATIONS[2];
}

export function buildLineupSlots(formation: Formation): LineupSlot[] {
  const config = getFormationConfig(formation);

  return [
    { key: "goal", label: "Goleiro", hint: "GOL", positions: ["GOL"] },
    ...Array.from({ length: config.defense }, (_, index) => ({
      key: `defense-${index}`,
      label: "Defesa",
      hint: "ZAG ou LAT",
      positions: ["ZAG", "LAT"] as Position[],
    })),
    ...Array.from({ length: config.midfield }, (_, index) => ({
      key: `midfield-${index}`,
      label: "Meio",
      hint: "MEI",
      positions: ["MEI"] as Position[],
    })),
    ...Array.from({ length: config.attack }, (_, index) => ({
      key: `attack-${index}`,
      label: "Ataque",
      hint: "ATA",
      positions: ["ATA"] as Position[],
    })),
  ];
}

export function fillLineupAssignments(
  slots: LineupSlot[],
  selectedPlayers: Player[],
): LineupAssignments {
  const assignments: LineupAssignments = {};
  const placed = new Set<number>();

  for (const slot of slots) {
    const player = selectedPlayers.find(
      (candidate) =>
        !placed.has(candidate.id) && slot.positions.includes(candidate.position),
    );

    assignments[slot.key] = player ? String(player.id) : "";

    if (player) placed.add(player.id);
  }

  return assignments;
}

export function selectedPlayerIds(assignments: LineupAssignments): Set<number> {
  return new Set(
    Object.values(assignments)
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0),
  );
}

export function isLineupComplete(
  slots: LineupSlot[],
  assignments: LineupAssignments,
): boolean {
  return slots.every((slot) => Boolean(assignments[slot.key]));
}

export type LineupAttributeUse = {
  label: string;
  value: number;
};

const attackAttributeByPosition: Partial<
  Record<Position, { label: string; field: "shooting" | "passing" | "dribbling" }>
> = {
  ZAG: { label: "Drible", field: "dribbling" },
  LAT: { label: "Drible", field: "dribbling" },
  MEI: { label: "Passe", field: "passing" },
  ATA: { label: "Finalização", field: "shooting" },
};

export function getPlayerAttributeUses(
  player: Player,
  lineIndex: number | null,
): LineupAttributeUse[] {
  if (player.position === "GOL") {
    return [{ label: "Defesa", value: player.defending }];
  }

  if (lineIndex === null) {
    return [];
  }

  const uses: LineupAttributeUse[] = [];

  if (lineIndex >= 1) {
    const attack = attackAttributeByPosition[player.position];

    if (attack) {
      uses.push({ label: attack.label, value: player[attack.field] });
    }
  }

  if (lineIndex <= 1) {
    uses.push({ label: "Defesa", value: player.defending });
  }

  return uses;
}
