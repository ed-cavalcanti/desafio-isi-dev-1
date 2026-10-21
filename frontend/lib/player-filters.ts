import { formatCondition, formatPosition } from "@/lib/format";
import type { PlayerCondition, Position } from "@/lib/types";

export const ALL = "all";

export const SEARCH_MIN_LENGTH = 2;

export type FilterOption = { value: string; label: string };

export type PlayersFilterValues = {
  search: string;
  position: Position | typeof ALL;
  condition: PlayerCondition | typeof ALL;
  clubId: string;
  ageRange: string;
  valueRange: string;
};

export const initialPlayersFilters: PlayersFilterValues = {
  search: "",
  position: ALL,
  condition: ALL,
  clubId: ALL,
  ageRange: ALL,
  valueRange: ALL,
};

export const positionOptions: FilterOption[] = (
  ["GOL", "ZAG", "LAT", "MEI", "ATA"] as Position[]
).map((position) => ({ value: position, label: formatPosition(position) }));

export const conditionOptions: FilterOption[] = (
  ["APTO", "MAL_CONDICIONADO", "DOENTE"] as PlayerCondition[]
).map((condition) => ({
  value: condition,
  label: formatCondition(condition),
}));

export const ageOptions: FilterOption[] = [
  { value: "16-21", label: "16 a 21 anos" },
  { value: "22-25", label: "22 a 25 anos" },
  { value: "26-30", label: "26 a 30 anos" },
  { value: "31-35", label: "31 a 35 anos" },
  { value: "36-45", label: "36 a 45 anos" },
];

export const valueOptions: FilterOption[] = [
  { value: "0-50", label: "Até 50,00" },
  { value: "50-100", label: "50,00 a 100,00" },
  { value: "100-200", label: "100,00 a 200,00" },
  { value: "200-550", label: "Acima de 200,00" },
];

export function getFilterOptionLabel(
  options: FilterOption[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label;
}
