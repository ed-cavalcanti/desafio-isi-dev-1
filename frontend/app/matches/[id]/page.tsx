"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useBreadcrumbLabel } from "@/components/breadcrumb-label";
import { MatchDuelsCard } from "@/components/matches/match-duels-card";
import { MatchFieldCard } from "@/components/matches/match-field-card";
import { MatchSummaryCard } from "@/components/matches/match-summary-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatMatchScore } from "@/lib/match";
import type { Club, Match } from "@/lib/types";

function MatchDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="aspect-[2.1/1] w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { setLabel } = useBreadcrumbLabel();
  const [match, setMatch] = useState<Match | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const breadcrumbLabel = match
    ? `${match.home_club_name} ${formatMatchScore(
        match.home_goals,
        match.away_goals,
      )} ${match.away_club_name}`
    : null;

  useEffect(() => {
    setLabel(breadcrumbLabel ? { pathname, label: breadcrumbLabel } : null);
  }, [breadcrumbLabel, pathname, setLabel]);

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

    apiFetch<Match>(`/api/v1/matches/${id}`)
      .then((response) => {
        if (!isActive) return;
        setMatch(response);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setMatch(null);
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
  }, [id, reloadKey]);

  const clubsById = Object.fromEntries(
    clubs.map((club) => [club.id, club]),
  ) as Record<number, Club>;

  return (
    <main className="flex flex-1 flex-col gap-4 bg-background px-4 py-4 md:px-8 md:py-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/matches" />}
        className="-ml-2 w-fit text-body-sm-medium hover:cursor-pointer"
      >
        <ArrowLeft />
        Voltar para partidas
      </Button>

      {isLoading ? (
        <MatchDetailsSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-12 text-center shadow-sm">
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
        <>
          <MatchSummaryCard match={match} clubsById={clubsById} />
          <MatchFieldCard match={match} />
          <MatchDuelsCard match={match} clubsById={clubsById} />
          <p className="text-caption text-muted-foreground">
            Mesma tela logo depois de jogar e ao abrir uma partida do histórico,
            com as formações dos dois clubes e os 6 duelos. Os valores e a
            condição de cada titular vêm gravados nos duelos devolvidos pela
            API; mal condicionado joga com 15% a menos (RN20).
          </p>
        </>
      ) : null}
    </main>
  );
}
