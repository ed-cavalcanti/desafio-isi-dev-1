export type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA";

export type PlayerCondition = "APTO" | "MAL_CONDICIONADO" | "DOENTE";

export type Player = {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: PlayerCondition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
};

export type Club = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
};

export type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1";

export type Lineup = {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
};

export type MatchOutcome = "MANDANTE" | "VISITANTE" | "EMPATE";

export type MatchSummary = {
  id: number;
  home_club_id: number;
  home_club_name: string;
  away_club_id: number;
  away_club_name: string;
  home_goals: number;
  away_goals: number;
  result: MatchOutcome;
  played_at: string;
};

export type DuelAttribute =
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending";

export type Duelist = {
  player_id: number;
  name: string;
  position: Position;
  condition: PlayerCondition;
  attribute: DuelAttribute;
  value: number;
};

export type MatchDuel = {
  order: number;
  attacker: Duelist;
  defender: Duelist;
  goal: boolean;
};

export type Match = MatchSummary & {
  home_formation: Formation;
  away_formation: Formation;
  duels: MatchDuel[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
