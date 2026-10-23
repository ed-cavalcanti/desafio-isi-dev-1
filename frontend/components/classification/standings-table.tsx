"use client";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGoalDifference } from "@/lib/format";
import type { Club, Standing } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = [
  { label: "#", numeric: true },
  { label: "Clube", numeric: false },
  { label: "J", numeric: true },
  { label: "V", numeric: true },
  { label: "E", numeric: true },
  { label: "D", numeric: true },
  { label: "GP", numeric: true },
  { label: "GC", numeric: true },
  { label: "SG", numeric: true },
  { label: "Pts", numeric: true },
];

type StandingsTableProps = {
  standings: Standing[];
  clubsById: Record<number, Club>;
};

function PositionBadge({ position }: { position: number }) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-caption-medium tabular-nums",
        position === 1
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {position}
    </span>
  );
}

export function StandingsTable({
  standings,
  clubsById,
}: StandingsTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.label}
              className={cn(
                column.numeric && "text-center",
                column.label === "Clube" && "lg:min-w-56",
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhum clube cadastrado.
            </TableCell>
          </TableRow>
        ) : (
          standings.map((row) => (
            <TableRow key={row.club_id}>
              <TableCell className="text-center">
                <PositionBadge position={row.position} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ClubAvatar
                    acronym={clubsById[row.club_id]?.acronym ?? ""}
                    className="size-8 text-caption-xs"
                  />
                  <span className="text-body-sm-medium text-foreground">
                    {row.club_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.played}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.wins}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.draws}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.losses}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.goals_for}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {row.goals_against}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {formatGoalDifference(row.goal_difference)}
              </TableCell>
              <TableCell className="text-center text-body-sm-semibold tabular-nums text-foreground">
                {row.points}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function StandingsTableSkeleton() {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.label}
              className={cn(
                column.numeric && "text-center",
                column.label === "Clube" && "lg:min-w-56",
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell className="text-center">
              <Skeleton className="mx-auto size-7 rounded-md" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
            </TableCell>
            {columns.slice(2).map((column) => (
              <TableCell key={column.label} className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
