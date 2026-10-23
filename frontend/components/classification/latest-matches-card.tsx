import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MatchScore } from "@/components/matches/match-score";
import { formatDate, formatTime } from "@/lib/format";
import type { MatchSummary } from "@/lib/types";

const LATEST_MATCHES_LIMIT = 3;

type LatestMatchesCardProps = {
  matches: MatchSummary[];
};

export function LatestMatchesCard({ matches }: LatestMatchesCardProps) {
  const latestMatches = matches.slice(0, LATEST_MATCHES_LIMIT);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-body-sm-semibold text-foreground">
          Últimas partidas
        </h2>
        <p className="text-caption text-muted-foreground">
          Da mais recente para a mais antiga.
        </p>
      </div>

      {latestMatches.length === 0 ? (
        <p className="px-4 py-6 text-center text-body-sm text-muted-foreground">
          Nenhuma partida jogada.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {latestMatches.map((match) => (
            <li key={match.id} className="flex flex-col gap-1.5 px-4 py-3">
              <span className="text-caption tabular-nums text-muted-foreground">
                {formatDate(match.played_at)}, {formatTime(match.played_at)}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-sm-medium text-foreground">
                  {match.home_club_name}
                </span>
                <MatchScore
                  homeGoals={match.home_goals}
                  awayGoals={match.away_goals}
                  className="px-1.5 py-0.5 text-caption-medium"
                />
                <span className="text-body-sm-medium text-foreground">
                  {match.away_club_name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-body-sm-medium text-primary hover:underline"
        >
          Ver todas as partidas
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
