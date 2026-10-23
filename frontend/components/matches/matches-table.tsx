"use client";

import { ChevronRight } from "lucide-react";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { MatchResultBadge } from "@/components/matches/match-result-badge";
import { MatchScore } from "@/components/matches/match-score";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/format";
import type { Club, MatchSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = [
  "Data e hora",
  "Mandante",
  "Placar",
  "Visitante",
  "Resultado",
  "",
];

type MatchesTableProps = {
  matches: MatchSummary[];
  clubsById: Record<number, Club>;
  onViewDuels: (match: MatchSummary) => void;
};

function getAcronym(clubsById: Record<number, Club>, clubId: number) {
  return clubsById[clubId]?.acronym ?? "";
}

export function MatchesTable({
  matches,
  clubsById,
  onViewDuels,
}: MatchesTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column}
              className={cn(
                column === "Mandante" && "text-right",
                column === "Placar" && "text-center",
                column === "Visitante" && "text-left",
                column === "" && "text-right",
              )}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhuma partida encontrada.
            </TableCell>
          </TableRow>
        ) : (
          matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell className="tabular-nums lg:min-w-32">
                <div className="flex flex-col">
                  <span className="text-body-sm text-foreground">
                    {formatDate(match.played_at)}
                  </span>
                  <span className="text-caption-xs text-muted-foreground">
                    {formatTime(match.played_at)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right lg:min-w-56">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-body-sm-medium text-foreground">
                    {match.home_club_name}
                  </span>
                  <ClubAvatar
                    acronym={getAcronym(clubsById, match.home_club_id)}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center lg:min-w-24">
                <MatchScore
                  homeGoals={match.home_goals}
                  awayGoals={match.away_goals}
                />
              </TableCell>
              <TableCell className="text-left lg:min-w-56">
                <div className="flex items-center gap-2">
                  <ClubAvatar
                    acronym={getAcronym(clubsById, match.away_club_id)}
                  />
                  <span className="text-body-sm-medium text-foreground">
                    {match.away_club_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="lg:min-w-44">
                <MatchResultBadge result={match.result} />
              </TableCell>
              <TableCell className="text-right lg:min-w-28">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-body-sm-medium text-foreground hover:cursor-pointer"
                  onClick={() => onViewDuels(match)}
                >
                  Ver duelos
                  <ChevronRight aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function MatchesTableSkeleton() {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column}
              className={cn(
                column === "Mandante" && "text-right",
                column === "Placar" && "text-center",
                column === "Visitante" && "text-left",
                column === "" && "text-right",
              )}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell className="lg:min-w-32">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-10" />
              </div>
            </TableCell>
            <TableCell className="lg:min-w-56">
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-9 rounded-lg" />
              </div>
            </TableCell>
            <TableCell className="lg:min-w-24">
              <Skeleton className="mx-auto h-7 w-14" />
            </TableCell>
            <TableCell className="lg:min-w-56">
              <div className="flex items-center gap-2">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            </TableCell>
            <TableCell className="lg:min-w-44">
              <Skeleton className="h-5 w-32 rounded-md" />
            </TableCell>
            <TableCell className="text-right lg:min-w-28">
              <Skeleton className="ml-auto h-4 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
