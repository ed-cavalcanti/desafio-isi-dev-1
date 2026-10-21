import { cn } from "@/lib/utils";
import {
  formatCoins,
  formatCondition,
  formatPosition,
  getClubInitials,
  getInitials,
} from "@/lib/format";
import { AgilityBar } from "@/components/players/agility-bar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Club, Player, PlayerCondition } from "@/lib/types";

const conditionStyles: Record<PlayerCondition, string> = {
  APTO: "bg-success-soft text-success-soft-foreground border-success-soft-border",
  MAL_CONDICIONADO:
    "bg-warning-soft text-warning-soft-foreground border-warning-soft-border",
  DOENTE:
    "bg-destructive-soft text-destructive-soft-foreground border-destructive-soft-border",
};

const columns = [
  "Jogador",
  "Posição",
  "Overall",
  "Agilidade",
  "Idade",
  "Condição",
  "Valor base",
  "Valor de mercado",
  "Clube",
  "",
];

const rightAlignedColumns = [
  "Overall",
  "Agilidade",
  "Idade",
  "Valor base",
  "Valor de mercado",
];

function headClassName(column: string) {
  return rightAlignedColumns.includes(column) ? "text-right" : undefined;
}

type PlayersTableProps = {
  players: Player[];
  clubsById: Record<number, Club>;
};

export function PlayersTable({ players, clubsById }: PlayersTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className={headClassName(column)}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhum jogador encontrado.
            </TableCell>
          </TableRow>
        ) : (
          players.map((player) => {
            const club =
              player.club_id !== null ? clubsById[player.club_id] : null;

            return (
              <TableRow key={player.id}>
                <TableCell className="lg:min-w-60">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground">
                      {getInitials(player.name)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {player.name}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {formatPosition(player.position)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="lg:min-w-15"><span className="py-0.5 px-2 font-medium border border-border w-fit rounded-lg">{player.position}</span></TableCell>
                <TableCell className="font-semibold text-right tabular-nums lg:min-w-16">
                  {player.overall}
                </TableCell>
                <TableCell className="tabular-nums lg:min-w-21">
                  <div className="flex items-center justify-end gap-2">
                    <AgilityBar agility={player.agility} />
                    {player.agility}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums lg:min-w-13">
                  {player.age}
                </TableCell>
                <TableCell className="lg:min-w-33">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-lg px-2 py-0.5 text-caption-medium font-medium",
                      conditionStyles[player.condition],
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {formatCondition(player.condition)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums lg:min-w-22">
                  {formatCoins(player.base_value)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-foreground lg:min-w-33">
                  {formatCoins(player.market_value)}
                </TableCell>
                <TableCell className="lg:min-w-26">
                  {club ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="border-0 text-caption-medium font-semibold"
                      >
                        {getClubInitials(club.name)}
                      </Badge>
                      {club.name}
                    </div>
                  ) : player.club_id === null ? (
                    <Badge
                      variant="default"
                      className="border-0 bg-secondary text-caption-medium"
                    >
                      Livre
                    </Badge>
                  ) : (
                    `Clube #${player.club_id}`
                  )}
                </TableCell>
                <TableCell className="lg:min-w-35"></TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export function PlayersTableSkeleton() {
  const cells = [
    { cell: "lg:min-w-60", bar: "h-4 w-32" },
    { cell: "lg:min-w-15", bar: "h-6 w-14 rounded-lg" },
    { cell: "text-right lg:min-w-16", bar: "h-4 w-6" },
    { cell: "flex items-center justify-end lg:min-w-21", bar: "h-4 w-20" },
    { cell: "text-right lg:min-w-13", bar: "h-4 w-6" },
    { cell: "lg:min-w-33", bar: "h-6 w-28 rounded-lg" },
    { cell: "text-right lg:min-w-22", bar: "h-4 w-14" },
    { cell: "text-right lg:min-w-33", bar: "h-4 w-16" },
    { cell: "lg:min-w-26", bar: "h-4 w-20" },
    { cell: "lg:min-w-35", bar: "h-4 w-16" },
  ];

  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className={headClassName(column)}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {cells.map(({ cell, bar }, columnIndex) => (
              <TableCell key={columnIndex} className={cell}>
                {columnIndex === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : (
                  <Skeleton
                    className={cn(
                      "h-4",
                      bar,
                      cell.includes("text-right") && "ml-auto",
                    )}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
