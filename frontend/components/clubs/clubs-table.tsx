import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCoins } from "@/lib/format";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = [
  "Clube",
  "Sigla",
  "Caixa",
  "Valor do elenco",
  "Patrimônio",
  "",
];

const rightAlignedColumns = ["Caixa", "Valor do elenco", "Patrimônio"];

function headClassName(column: string) {
  return rightAlignedColumns.includes(column) ? "text-right" : undefined;
}

type ClubsTableProps = {
  clubs: Club[];
};

export function ClubsTable({ clubs }: ClubsTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className={headClassName(column)}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhum clube encontrado.
            </TableCell>
          </TableRow>
        ) : (
          clubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell className="lg:min-w-64">
                <div className="flex items-center gap-3">
                  <ClubAvatar acronym={club.acronym} />
                  <span className="text-body-sm-medium text-foreground">
                    {club.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="lg:min-w-20">
                <Badge
                  variant="secondary"
                  className="border border-border bg-white rounded-lg text-caption-xs font-semibold tracking-wide"
                >
                  {club.acronym}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-body-sm tabular-nums text-foreground lg:min-w-28">
                {formatCoins(club.cash)}
              </TableCell>
              <TableCell className="text-right text-body-sm tabular-nums text-foreground lg:min-w-32">
                {formatCoins(club.squad_value)}
              </TableCell>
              <TableCell className="text-right text-body-sm font-semibold tabular-nums text-foreground lg:min-w-32">
                {formatCoins(club.net_worth)}
              </TableCell>
              <TableCell className="text-right lg:min-w-28">
                <Link
                  href={`/clubs/${club.id}`}
                  className="inline-flex items-center gap-1 text-body-sm-medium text-foreground hover:underline"
                >
                  Ver clube
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function ClubsTableSkeleton() {
  const cells = [
    { cell: "lg:min-w-64", bar: "h-4 w-36" },
    { cell: "lg:min-w-20", bar: "h-5 w-12 rounded-lg" },
    { cell: "text-right lg:min-w-28", bar: "h-4 w-20" },
    { cell: "text-right lg:min-w-32", bar: "h-4 w-20" },
    { cell: "text-right lg:min-w-32", bar: "h-4 w-20" },
    { cell: "text-right lg:min-w-28", bar: "h-4 w-20" },
  ];

  return (
    <Table>
      <TableHeader className="bg-muted-subtle">
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className={headClassName(column)}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {cells.map(({ cell, bar }, columnIndex) => (
              <TableCell key={columnIndex} className={cell}>
                {columnIndex === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-xl" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ) : (
                  <Skeleton
                    className={cn(
                      "h-4",
                      bar,
                      cell.includes("text-right") && "ml-auto",
                    )}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
