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

export type Contract = {
  loyalty_until: string;
  days_remaining: number;
  penalty_percent: number;
  purchase_value: number;
};

export type SquadPlayer = {
  player: Player;
  contract: Contract;
};

export type ClubDetails = Club & {
  players: SquadPlayer[];
};

export type TransactionType = "COMPRA" | "VENDA";

export type Transaction = {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
};

export type TransactionsSummary = {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
};

export type ClubTransactions = {
  data: Transaction[];
  summary: TransactionsSummary;
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
