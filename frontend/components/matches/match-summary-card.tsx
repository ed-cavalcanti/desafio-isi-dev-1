import { ClubAvatar } from "@/components/clubs/club-avatar";
import { MatchResultBadge } from "@/components/matches/match-result-badge";
import { MatchScore } from "@/components/matches/match-score";
import { formatDate, formatTime, getClubInitials } from "@/lib/format";
import type { Club, Match } from "@/lib/types";

type MatchSummaryCardProps = {
  match: Match;
  clubsById: Record<number, Club>;
};

export function MatchSummaryCard({
  match,
  clubsById,
}: MatchSummaryCardProps) {
  const homeAcronym =
    clubsById[match.home_club_id]?.acronym ??
    getClubInitials(match.home_club_name);
  const awayAcronym =
    clubsById[match.away_club_id]?.acronym ??
    getClubInitials(match.away_club_name);

  return (
    <section className="rounded-xl border border-border bg-card px-4 py-5 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-body-sm-semibold text-foreground">
              {match.home_club_name}
            </span>
            <span className="text-caption text-muted-foreground">
              Mandante · {match.home_formation}
            </span>
          </div>
          <ClubAvatar acronym={homeAcronym} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <MatchScore
            homeGoals={match.home_goals}
            awayGoals={match.away_goals}
            className="border border-border bg-background px-4 py-1 text-heading-mobile md:text-heading-page"
          />
          <span className="text-caption tabular-nums text-muted-foreground">
            {formatDate(match.played_at)}, {formatTime(match.played_at)}
          </span>
          <MatchResultBadge result={match.result} />
        </div>

        <div className="flex items-center gap-3">
          <ClubAvatar acronym={awayAcronym} />
          <div className="flex min-w-0 flex-col items-end gap-1">
            <span className="truncate text-body-sm-semibold text-foreground">
              {match.away_club_name}
            </span>
            <span className="text-caption text-muted-foreground">
              Visitante · {match.away_formation}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
