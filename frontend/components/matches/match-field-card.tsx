import { CircleAlert, CircleDot } from "lucide-react";

import { MatchPitch } from "@/components/matches/match-pitch";
import type { Match } from "@/lib/types";

type MatchFieldCardProps = {
  match: Match;
};

function LegendItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

export function MatchFieldCard({ match }: MatchFieldCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-heading-card text-foreground">Em campo</h2>
          <p className="max-w-3xl text-caption text-muted-foreground">
            Titulares de cada clube na formação da partida e os valores usados
            nos duelos, já com o efeito da condição.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LegendItem
            icon={
              <span className="flex size-4 items-center justify-center rounded-full bg-warning text-white">
                <CircleAlert className="size-3" aria-hidden="true" />
              </span>
            }
            label="Mal condicionado"
          />
          <LegendItem
            icon={
              <span className="flex size-4 items-center justify-center rounded-full bg-white text-zinc-900 ring-1 ring-border">
                <CircleDot className="size-3.5" aria-hidden="true" />
              </span>
            }
            label="Gol no duelo"
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <MatchPitch match={match} />
      </div>
    </section>
  );
}
