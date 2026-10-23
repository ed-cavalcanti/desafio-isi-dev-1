"use client";

import { AlertCircle, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { MatchResultBadge } from "@/components/matches/match-result-badge";
import { MatchScore } from "@/components/matches/match-score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import {
  formatCondition,
  formatDate,
  formatPosition,
  formatTime,
} from "@/lib/format";
import { formatDuelAttribute } from "@/lib/match";
import type { Club, Duelist, Match, MatchDuel } from "@/lib/types";

const columns = ["Duelo", "Atacante", "Ataque", "Defensor", "Defesa", "Gol"];

type MatchDuelsDialogProps = {
  matchId: number | null;
  initialMatch?: Match | null;
  clubsById: Record<number, Club>;
  onOpenChange: (open: boolean) => void;
};

function getAcronym(clubsById: Record<number, Club>, clubId: number) {
  return clubsById[clubId]?.acronym ?? "";
}

function DuelistInfo({ duelist }: { duelist: Duelist }) {
  return (
    <div className="flex flex-col">
      <span className="text-body-sm-medium text-foreground">
        {duelist.name}
      </span>
      <span className="text-caption-xs text-muted-foreground">
        {formatPosition(duelist.position)}
        {duelist.condition === "APTO"
          ? ""
          : ` · ${formatCondition(duelist.condition)}`}
      </span>
    </div>
  );
}

function DuelValue({ duelist }: { duelist: Duelist }) {
  return (
    <div className="flex flex-col">
      <span className="text-caption-xs text-muted-foreground">
        {formatDuelAttribute(duelist.attribute)}
      </span>
      <span className="text-body-sm font-semibold tabular-nums text-foreground">
        {duelist.value}
      </span>
    </div>
  );
}

function DuelsTable({ duels }: { duels: MatchDuel[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="bg-muted-subtle">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className={column === "Gol" ? "text-right" : undefined}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {duels.map((duel) => (
            <TableRow key={duel.order}>
              <TableCell className="lg:min-w-24">
                <div className="flex flex-col">
                  <span className="text-body-sm-medium tabular-nums text-foreground">
                    #{duel.order}
                  </span>
                  <span className="text-caption-xs text-muted-foreground">
                    {duel.order <= 3 ? "Mandante" : "Visitante"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="lg:min-w-44">
                <DuelistInfo duelist={duel.attacker} />
              </TableCell>
              <TableCell className="lg:min-w-28">
                <DuelValue duelist={duel.attacker} />
              </TableCell>
              <TableCell className="lg:min-w-44">
                <DuelistInfo duelist={duel.defender} />
              </TableCell>
              <TableCell className="lg:min-w-28">
                <DuelValue duelist={duel.defender} />
              </TableCell>
              <TableCell className="text-right lg:min-w-20">
                {duel.goal ? (
                  <Badge
                    variant="outline"
                    className="gap-1 rounded-md border-success-soft-border bg-success-soft px-2 py-0.5 text-caption-medium font-medium text-success-soft-foreground"
                  >
                    <CircleCheck aria-hidden="true" />
                    Gol
                  </Badge>
                ) : (
                  <span className="text-caption text-muted-foreground">Não</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MatchHeader({
  match,
  clubsById,
}: {
  match: Match;
  clubsById: Record<number, Club>;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted-subtle p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <ClubAvatar acronym={getAcronym(clubsById, match.home_club_id)} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body-sm-semibold text-foreground">
              {match.home_club_name}
            </span>
            <span className="text-caption text-muted-foreground">
              Mandante · {match.home_formation}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <MatchScore
            homeGoals={match.home_goals}
            awayGoals={match.away_goals}
            className="px-3 py-0.5 text-heading-card"
          />
          <span className="text-caption text-muted-foreground tabular-nums">
            {formatDate(match.played_at)}, {formatTime(match.played_at)}
          </span>
          <MatchResultBadge result={match.result} />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="flex min-w-0 flex-col items-end">
            <span className="truncate text-body-sm-semibold text-foreground">
              {match.away_club_name}
            </span>
            <span className="text-caption text-muted-foreground">
              Visitante · {match.away_formation}
            </span>
          </div>
          <ClubAvatar acronym={getAcronym(clubsById, match.away_club_id)} />
        </div>
      </div>
    </div>
  );
}

function MatchDuelsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function MatchDuelsDialog({
  matchId,
  initialMatch = null,
  clubsById,
  onOpenChange,
}: MatchDuelsDialogProps) {
  const [match, setMatch] = useState<Match | null>(initialMatch);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (matchId === null) {
      setMatch(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (initialMatch && initialMatch.id === matchId) {
      setMatch(initialMatch);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    setMatch(null);
    setError(null);
    setIsLoading(true);

    apiFetch<Match>(`/api/v1/matches/${matchId}`)
      .then((response) => {
        if (!isActive) return;
        setMatch(response);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar a partida.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [initialMatch, matchId, reloadKey]);

  return (
    <Dialog
      open={matchId !== null}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false);
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="gap-1 px-6 py-4">
          <DialogTitle className="text-heading-dialog">
            Duelos da partida
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Placar e os seis duelos calculados pela API.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <MatchDuelsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <div className="flex flex-col gap-1">
                <p className="text-body-sm-medium text-foreground">
                  Não foi possível carregar a partida
                </p>
                <p className="text-body-sm text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                className="h-9 hover:cursor-pointer"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Tentar novamente
              </Button>
            </div>
          ) : match ? (
            <div className="flex flex-col gap-4">
              <MatchHeader match={match} clubsById={clubsById} />
              <DuelsTable duels={match.duels} />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
