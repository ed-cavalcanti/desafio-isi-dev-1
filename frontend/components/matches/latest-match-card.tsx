"use client";

import { ChevronRight } from "lucide-react";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { MatchResultBadge } from "@/components/matches/match-result-badge";
import { MatchScore } from "@/components/matches/match-score";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/format";
import type { Club, MatchSummary } from "@/lib/types";

type LatestMatchCardProps = {
  match: MatchSummary;
  clubsById: Record<number, Club>;
  onViewDuels: (match: MatchSummary) => void;
};

function getAcronym(clubsById: Record<number, Club>, clubId: number) {
  return clubsById[clubId]?.acronym ?? "";
}

export function LatestMatchCard({
  match,
  clubsById,
  onViewDuels,
}: LatestMatchCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-6 sm:justify-start xl:justify-center">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-body-sm-medium text-foreground">
                {match.home_club_name}
              </span>
              <ClubAvatar acronym={getAcronym(clubsById, match.home_club_id)} />
            </div>
            <span className="text-caption text-muted-foreground">
              Mandante
            </span>
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

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <ClubAvatar acronym={getAcronym(clubsById, match.away_club_id)} />
              <span className="text-body-sm-medium text-foreground">
                {match.away_club_name}
              </span>
            </div>
            <span className="text-caption text-muted-foreground">
              Visitante
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-9 hover:cursor-pointer"
          onClick={() => onViewDuels(match)}
        >
          Ver duelos
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
