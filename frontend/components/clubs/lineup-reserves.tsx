import { BedDouble } from "lucide-react";

import { PlayerConditionBadge } from "@/components/players/player-condition-badge";
import { Card } from "@/components/ui/card";
import { formatPosition, getInitials } from "@/lib/format";
import { positionAvatarStyles } from "@/lib/lineup";
import type { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

type LineupReservesProps = {
  players: Player[];
};

export function LineupReserves({ players }: LineupReservesProps) {
  const hasSickPlayer = players.some(
    (player) => player.condition === "DOENTE",
  );

  return (
    <Card className="w-full gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
        <h2 className="text-heading-card text-foreground">Reservas</h2>
        <p className="text-caption text-muted-foreground">
          Jogadores do elenco fora da escalação.
        </p>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3">
        {players.length === 0 ? (
          <p className="text-caption text-muted-foreground">
            Nenhum jogador reserva.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-caption-xs font-semibold",
                      positionAvatarStyles[player.position],
                    )}
                  >
                    {getInitials(player.name)}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-body-sm-medium text-foreground">
                      {player.name}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatPosition(player.position)}
                    </span>
                  </div>
                </div>
                {player.condition !== "APTO" ? (
                  <PlayerConditionBadge
                    condition={player.condition}
                    className="shrink-0"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {hasSickPlayer ? (
          <div className="flex items-start gap-2 border-t border-border pt-3 text-caption text-muted-foreground">
            <BedDouble
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>Doente não pode ser escalado.</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
