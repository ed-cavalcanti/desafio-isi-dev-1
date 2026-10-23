"use client";

import { AlertCircle, Plus, Swords } from "lucide-react";
import { useEffect, useState } from "react";

import { LatestMatchCard } from "@/components/matches/latest-match-card";
import { MatchDuelsDialog } from "@/components/matches/match-duels-dialog";
import { MatchPlayDialog } from "@/components/matches/match-play-dialog";
import { MatchesClubFilter } from "@/components/matches/matches-club-filter";
import {
  MatchesTable,
  MatchesTableSkeleton,
} from "@/components/matches/matches-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { ALL_CLUBS, formatMatchScore } from "@/lib/match";
import type { Club, Match, MatchSummary } from "@/lib/types";

type ViewingMatch = {
  id: number;
  data?: Match;
};

export default function MatchesPage() {
  const toastManager = useToast();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState<string>(ALL_CLUBS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [viewingMatch, setViewingMatch] = useState<ViewingMatch | null>(null);

  useEffect(() => {
    let isActive = true;

    apiFetch<Club[]>("/api/v1/clubs")
      .then((response) => {
        if (isActive) setClubs(response);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    const query =
      clubId === ALL_CLUBS ? "" : `?club_id=${encodeURIComponent(clubId)}`;

    apiFetch<MatchSummary[]>(`/api/v1/matches${query}`)
      .then((response) => {
        if (!isActive) return;
        setMatches(response);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setMatches([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar as partidas.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [clubId, reloadKey]);

  const clubsById = Object.fromEntries(
    clubs.map((club) => [club.id, club]),
  ) as Record<number, Club>;

  const latestMatch = matches[0] ?? null;

  const handleMatchPlayed = (match: Match) => {
    setIsPlayOpen(false);
    setViewingMatch({ id: match.id, data: match });
    setReloadKey((key) => key + 1);

    toastManager.add({
      title: "Partida jogada",
      description: `${match.home_club_name} ${formatMatchScore(
        match.home_goals,
        match.away_goals,
      )} ${match.away_club_name}`,
      type: "success",
    });
  };

  const handleViewDuels = (match: MatchSummary) => {
    setViewingMatch({ id: match.id });
  };

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-8 py-4 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary bg-primary-soft">
            <Swords className="text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-page font-semibold text-foreground">
              Partidas
            </h1>
            <p className="text-body-sm text-muted-foreground">
              Jogue partidas entre clubes com os 5 titulares escalados e
              acompanhe o histórico.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsPlayOpen(true)}
          className="h-9 hover:cursor-pointer"
        >
          <Plus />
          Nova partida
        </Button>
      </div>

      {!isLoading && !error && latestMatch ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-body-sm-medium text-muted-foreground">
            Última partida
          </h2>
          <LatestMatchCard
            match={latestMatch}
            clubsById={clubsById}
            onViewDuels={handleViewDuels}
          />
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-body-sm-medium text-foreground">
              Histórico de partidas
            </h2>
            <p className="text-caption text-muted-foreground">
              Da mais recente para a mais antiga.
            </p>
          </div>
          <MatchesClubFilter
            value={clubId}
            clubs={clubs}
            onValueChange={setClubId}
          />
        </div>

        {isLoading ? (
          <MatchesTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="text-body-sm-medium text-foreground">
                Não foi possível carregar as partidas
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
        ) : (
          <MatchesTable
            matches={matches}
            clubsById={clubsById}
            onViewDuels={handleViewDuels}
          />
        )}

        {!isLoading && !error ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-caption text-muted-foreground">
              {matches.length === 0
                ? "Nenhuma partida"
                : `${matches.length} partida${matches.length === 1 ? "" : "s"}`}
            </p>
          </div>
        ) : null}
      </section>

      <p className="text-caption text-muted-foreground">
        Partidas da mais recente para a mais antiga, com filtro por clube. “Ver
        duelos” abre a partida.
      </p>

      <MatchPlayDialog
        open={isPlayOpen}
        clubs={clubs}
        onOpenChange={setIsPlayOpen}
        onPlayed={handleMatchPlayed}
      />

      <MatchDuelsDialog
        matchId={viewingMatch?.id ?? null}
        initialMatch={viewingMatch?.data ?? null}
        clubsById={clubsById}
        onOpenChange={(open) => {
          if (!open) setViewingMatch(null);
        }}
      />
    </main>
  );
}
