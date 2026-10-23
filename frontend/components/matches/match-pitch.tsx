"use client";

import { CircleAlert, CircleDot } from "lucide-react";

import { getInitials } from "@/lib/format";
import { positionAvatarStyles } from "@/lib/lineup";
import {
  buildMatchStarters,
  formatDuelAttributeShort,
  getStarterRow,
  type DuelSide,
  type MatchStarter,
  type StarterRow,
} from "@/lib/match";
import type { Formation, Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const rowDepth: Record<StarterRow, number> = {
  goal: 8,
  defense: 21,
  midfield: 32,
  attack: 42,
};

type PitchMarker = {
  key: string;
  starter: MatchStarter;
  x: number;
  y: number;
};

function spread(count: number) {
  if (count <= 0) return [];
  if (count === 1) return [50];
  if (count === 2) return [34, 66];
  return [22, 50, 78];
}

function buildPitchMarkers(
  starters: MatchStarter[],
  formation: Formation,
  side: DuelSide,
): PitchMarker[] {
  const grouped: Record<StarterRow, MatchStarter[]> = {
    goal: [],
    defense: [],
    midfield: [],
    attack: [],
  };

  for (const starter of starters) {
    grouped[getStarterRow(starter, formation)].push(starter);
  }

  return (Object.keys(grouped) as StarterRow[]).flatMap((row) =>
    spread(grouped[row].length).map((y, index) => {
      const starter = grouped[row][index];

      return {
        key: `${side}-${starter.playerId}`,
        starter,
        x: side === "home" ? rowDepth[row] : 100 - rowDepth[row],
        y,
      };
    }),
  );
}

function PitchMarker({ marker }: { marker: PitchMarker }) {
  const { starter } = marker;
  const values = starter.uses
    .map((use) => `${formatDuelAttributeShort(use.attribute)} ${use.value}`)
    .join(" · ");

  return (
    <div
      className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
    >
      <div className="relative">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-caption-medium font-semibold shadow-md ring-2 ring-white/80",
            positionAvatarStyles[starter.position],
          )}
        >
          {getInitials(starter.name)}
        </span>
        {starter.condition === "MAL_CONDICIONADO" ? (
          <span className="absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-full bg-warning text-white ring-2 ring-white/80">
            <CircleAlert className="size-3" aria-hidden="true" />
          </span>
        ) : null}
        {starter.scored ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-zinc-900 ring-2 ring-white/80">
            <CircleDot className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <span className="rounded bg-white/95 px-1.5 text-[9px] font-semibold uppercase leading-4 tracking-wide text-zinc-700 shadow-sm">
        {starter.position}
      </span>
      <span className="w-24 truncate text-center text-[11px] font-medium leading-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {starter.name}
      </span>
      <span className="w-24 truncate text-center text-[10px] leading-3 text-white/85">
        {starter.position} · {values}
      </span>
    </div>
  );
}

function PitchLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 143"
      className="absolute inset-0 size-full"
    >
      <g
        fill="none"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      >
        <rect x="6" y="6" width="288" height="131" />
        <line x1="150" y1="6" x2="150" y2="137" />
        <circle cx="150" cy="71.5" r="19" />
        <rect x="6" y="33" width="34" height="77" />
        <rect x="6" y="51" width="13" height="41" />
        <rect x="260" y="33" width="34" height="77" />
        <rect x="281" y="51" width="13" height="41" />
        <rect x="2.5" y="57" width="3.5" height="29" />
        <rect x="294" y="57" width="3.5" height="29" />
      </g>
      <g fill="white" fillOpacity="0.7">
        <circle cx="150" cy="71.5" r="1.5" />
        <circle cx="33" cy="71.5" r="1.5" />
        <circle cx="267" cy="71.5" r="1.5" />
      </g>
    </svg>
  );
}

export function MatchPitch({ match }: { match: Match }) {
  const starters = buildMatchStarters(match);
  const markers = [
    ...buildPitchMarkers(starters.home, match.home_formation, "home"),
    ...buildPitchMarkers(starters.away, match.away_formation, "away"),
  ];

  return (
    <div className="overflow-x-auto">
      <div className="relative aspect-[2.1/1] min-w-[560px] overflow-hidden rounded-lg bg-[#2E7D4F]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 7%, transparent 7%, transparent 14%)",
          }}
        />
        <PitchLines />
        {markers.map((marker) => (
          <PitchMarker key={marker.key} marker={marker} />
        ))}
      </div>
    </div>
  );
}
