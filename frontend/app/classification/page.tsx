"use client";

import { AlertCircle, ListOrdered, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { LatestMatchesCard } from "@/components/classification/latest-matches-card";
import { StandingsLegend } from "@/components/classification/standings-legend";
import { StandingsOrderCard } from "@/components/classification/standings-order-card";
import {
  StandingsTable,
  StandingsTableSkeleton,
} from "@/components/classification/standings-table";
import { MatchPlayDialog } from "@/components/matches/match-play-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatMatchScore } from "@/lib/match";
import type { Club, Match, MatchSummary, Standing } from "@/lib/types";

function LatestMatchesSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </section>
  );
}

export default function ClassificationPage() {
  const toastManager = useToast();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isPlayOpen, setIsPlayOpen] = useState(false);

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

    Promise.all([
      apiFetch<Standing[]>("/api/v1/standings"),
      apiFetch<MatchSummary[]>("/api/v1/matches").catch(
        () => [] as MatchSummary[],
      ),
    ])
      .then(([standingsResponse, matchesResponse]) => {
        if (!isActive) return;
        setStandings(standingsResponse);
        setMatches(matchesResponse);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setStandings([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar a classificação.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const clubsById = Object.fromEntries(
    clubs.map((club) => [club.id, club]),
  ) as Record<number, Club>;

  const handleMatchPlayed = (match: Match) => {
    setIsPlayOpen(false);
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

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary bg-primary-soft">
            <ListOrdered className="text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-page font-semibold text-foreground">
              Classificação
            </h1>
            <p className="text-body-sm text-muted-foreground">
              Todos os clubes, com 3 pontos por vitória e 1 por empate.
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <StandingsTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <div className="flex flex-col gap-1">
                <p className="text-body-sm-medium text-foreground">
                  Não foi possível carregar a classificação
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
            <>
              <StandingsTable standings={standings} clubsById={clubsById} />
              <StandingsLegend />
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {isLoading ? (
            <LatestMatchesSkeleton />
          ) : error ? null : (
            <LatestMatchesCard matches={matches} />
          )}
          <StandingsOrderCard />
        </aside>
      </div>

      <p className="text-caption text-muted-foreground">
        {standings.length > 0
          ? `Classificação de 1 a ${standings.length}, com os clubes sem partidas zerados. `
          : ""}
        Pontos, saldo e posição são calculados a cada consulta, nunca gravados
        (RN21).
      </p>

      <MatchPlayDialog
        open={isPlayOpen}
        clubs={clubs}
        onOpenChange={setIsPlayOpen}
        onPlayed={handleMatchPlayed}
      />
    </main>
  );
}
