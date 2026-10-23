import { CircleCheck } from "lucide-react";
import { Fragment } from "react";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClubInitials } from "@/lib/format";
import {
  formatDuelAttribute,
  formatLineLabel,
  getDuelRoles,
  groupMatchDuels,
  type MatchDuelGroup,
} from "@/lib/match";
import type { Club, Duelist, Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = ["Duelo", "Atacante", "Ataque", "Defensor", "Defesa", "Resultado"];

type MatchDuelsCardProps = {
  match: Match;
  clubsById: Record<number, Club>;
};

function getAcronym(
  clubsById: Record<number, Club>,
  clubId: number,
  clubName: string,
) {
  return clubsById[clubId]?.acronym ?? getClubInitials(clubName);
}

function DuelistInfo({
  duelist,
  line,
  clubName,
}: {
  duelist: Duelist;
  line: number | null;
  clubName: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-body-sm-medium text-foreground">
        {duelist.player_name}
      </span>
      <span className="text-caption-xs text-muted-foreground">
        {line === null
          ? `Goleiro · ${clubName}`
          : `${duelist.position}, ${formatLineLabel(line)} · ${clubName}`}
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

function DuelGroupRows({
  group,
  match,
}: {
  group: MatchDuelGroup;
  match: Match;
}) {
  const opponentName =
    group.side === "home" ? match.away_club_name : match.home_club_name;

  return group.duels.map((duel) => {
    const roles = getDuelRoles(duel.order);

    return (
      <TableRow key={duel.order}>
        <TableCell className="lg:min-w-24">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-7 w-1 rounded-full",
                group.side === "home" ? "bg-primary" : "bg-zinc-400",
              )}
            />
            <span className="text-body-sm-medium tabular-nums text-foreground">
              {duel.order}
            </span>
          </div>
        </TableCell>
        <TableCell className="lg:min-w-44">
          <DuelistInfo
            duelist={duel.attacker}
            line={roles?.attacker.line ?? null}
            clubName={group.clubName}
          />
        </TableCell>
        <TableCell className="lg:min-w-28">
          <DuelValue duelist={duel.attacker} />
        </TableCell>
        <TableCell className="lg:min-w-44">
          <DuelistInfo
            duelist={duel.defender}
            line={roles?.defender.line ?? null}
            clubName={opponentName}
          />
        </TableCell>
        <TableCell className="lg:min-w-28">
          <DuelValue duelist={duel.defender} />
        </TableCell>
        <TableCell className="text-right lg:min-w-24">
          {duel.goal ? (
            <Badge
              variant="outline"
              className="gap-1 rounded-md border-success-soft-border bg-success-soft px-2 py-0.5 text-caption-medium font-medium text-success-soft-foreground"
            >
              <CircleCheck aria-hidden="true" />
              Gol
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-md border-border bg-background px-2 py-0.5 text-caption-medium font-medium text-muted-foreground"
            >
              Sem gol
            </Badge>
          )}
        </TableCell>
      </TableRow>
    );
  });
}

export function MatchDuelsCard({ match, clubsById }: MatchDuelsCardProps) {
  const groups = groupMatchDuels(match);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-0.5 px-4 py-3">
        <h2 className="text-heading-card text-foreground">Duelos</h2>
        <p className="max-w-4xl text-caption text-muted-foreground">
          Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de
          linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem
          do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
        </p>
      </div>

      <Table>
        <TableHeader className="bg-muted-subtle">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(column === "Resultado" && "text-right")}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.side}>
              <TableRow className="bg-muted-subtle hover:bg-muted-subtle">
                <TableCell colSpan={columns.length} className="px-2 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ClubAvatar
                        acronym={getAcronym(
                          clubsById,
                          group.clubId,
                          group.clubName,
                        )}
                        className="size-6 rounded-md text-[10px]"
                      />
                      <span className="text-body-sm-medium text-foreground">
                        Ataques do {group.clubName} (
                        {group.side === "home" ? "mandante" : "visitante"})
                      </span>
                    </div>
                    <span className="text-body-sm-medium tabular-nums text-foreground">
                      {group.goals} gol{group.goals === 1 ? "" : "s"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <DuelGroupRows group={group} match={match} />
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
