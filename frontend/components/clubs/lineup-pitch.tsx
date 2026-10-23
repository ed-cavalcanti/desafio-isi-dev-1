"use client";

import {
  getFormationConfig,
  positionAvatarStyles,
  type LineupAssignments,
} from "@/lib/lineup";
import { getInitials, getLastName } from "@/lib/format";
import type { Formation, Player } from "@/lib/types";
import { cn } from "@/lib/utils";

type PitchMarker = {
  key: string;
  player: Player | null;
  hint: string;
  x: number;
  y: number;
};

type LineupPitchProps = {
  formation: Formation;
  assignments: LineupAssignments;
  players: Player[];
};

function spread(count: number) {
  if (count <= 0) return [];
  if (count === 1) return [50];
  if (count === 2) return [35, 65];
  return [25, 50, 75];
}

function buildMarkers(
  formation: Formation,
  assignments: LineupAssignments,
  players: Player[],
): PitchMarker[] {
  const config = getFormationConfig(formation);
  const playersById = new Map(players.map((player) => [player.id, player]));
  const markers: PitchMarker[] = [];

  const goalkeeperId = Number(assignments.goal);
  markers.push({
    key: "goal",
    player: playersById.get(goalkeeperId) ?? null,
    hint: "GOL",
    x: 50,
    y: 86,
  });

  const rows = [
    { prefix: "defense", count: config.defense, hint: "DEF", y: 68 },
    { prefix: "midfield", count: config.midfield, hint: "MEI", y: 47 },
    { prefix: "attack", count: config.attack, hint: "ATA", y: 24 },
  ];

  for (const row of rows) {
    spread(row.count).forEach((x, index) => {
      const key = `${row.prefix}-${index}`;
      const playerId = Number(assignments[key]);

      markers.push({
        key,
        player: playersById.get(playerId) ?? null,
        hint: row.hint,
        x,
        y: row.y,
      });
    });
  }

  return markers;
}

function PitchMarker({ marker }: { marker: PitchMarker }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
    >
      {marker.player ? (
        <>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-caption-medium font-semibold shadow-sm",
              positionAvatarStyles[marker.player.position],
            )}
          >
            {getInitials(marker.player.name)}
          </span>
          <span className="max-w-20 truncate text-[11px] font-medium text-white drop-shadow">
            {getLastName(marker.player.name)}
          </span>
        </>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-white/60 bg-black/10 text-[9px] font-medium text-white/80">
          {marker.hint}
        </span>
      )}
    </div>
  );
}

export function LineupPitch({
  formation,
  assignments,
  players,
}: LineupPitchProps) {
  const markers = buildMarkers(formation, assignments, players);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#2E7D4F]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 22px, transparent 22px, transparent 44px)",
        }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 300 400"
        className="absolute inset-0 size-full"
      >
        <rect
          x="8"
          y="8"
          width="284"
          height="384"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <line
          x1="8"
          y1="200"
          x2="292"
          y2="200"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <circle
          cx="150"
          cy="200"
          r="38"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <circle cx="150" cy="200" r="2.5" fill="white" fillOpacity="0.7" />
        <rect
          x="78"
          y="8"
          width="144"
          height="54"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <rect
          x="115"
          y="8"
          width="70"
          height="22"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <circle cx="150" cy="48" r="2.5" fill="white" fillOpacity="0.7" />
        <rect
          x="78"
          y="338"
          width="144"
          height="54"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <rect
          x="115"
          y="370"
          width="70"
          height="22"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <circle cx="150" cy="352" r="2.5" fill="white" fillOpacity="0.7" />
        <rect
          x="125"
          y="2"
          width="50"
          height="6"
          fill="white"
          fillOpacity="0.7"
        />
        <rect
          x="125"
          y="392"
          width="50"
          height="6"
          fill="white"
          fillOpacity="0.7"
        />
      </svg>
      {markers.map((marker) => (
        <PitchMarker key={marker.key} marker={marker} />
      ))}
    </div>
  );
}
