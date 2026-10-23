import { HandCoins, ShoppingCart, type LucideIcon } from "lucide-react";

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
import {
  formatCoins,
  formatDate,
  formatSignedCoins,
  formatTime,
  getInitials,
} from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = [
  "Data e hora",
  "Tipo",
  "Jogador",
  "Valor",
  "Taxa ou comissão",
  "Multa",
  "Lucro",
  "Variação do caixa",
];

const rightAlignedColumns = [
  "Valor",
  "Taxa ou comissão",
  "Multa",
  "Lucro",
  "Variação do caixa",
];

const typeBadgeStyles: Record<TransactionType, string> = {
  COMPRA: "border-border bg-background text-foreground",
  VENDA: "border-border bg-secondary text-foreground",
};

const typeLabels: Record<TransactionType, string> = {
  COMPRA: "Compra",
  VENDA: "Venda",
};

const typeIcons: Record<TransactionType, LucideIcon> = {
  COMPRA: ShoppingCart,
  VENDA: HandCoins,
};

function headClassName(column: string) {
  return rightAlignedColumns.includes(column) ? "text-right" : undefined;
}

function valueToneClassName(value: number) {
  if (value > 0) return "text-success";
  if (value < 0) return "text-destructive";
  return "text-muted-foreground";
}

function TypeBadge({ type }: { type: TransactionType }) {
  const Icon = typeIcons[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-lg px-2 py-0.5 text-caption-medium font-medium",
        typeBadgeStyles[type],
      )}
    >
      <Icon className={type === "VENDA" ? "text-muted-foreground" : undefined} />
      {typeLabels[type]}
    </Badge>
  );
}

function ProfitValue({ profit }: { profit: number | null }) {
  if (profit === null) {
    return <span className="text-muted-foreground">–</span>;
  }

  return (
    <span className={cn("font-medium", valueToneClassName(profit))}>
      {formatSignedCoins(profit)}
    </span>
  );
}

type TransactionsTableProps = {
  transactions: Transaction[];
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
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
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhuma transação encontrada para os filtros selecionados.
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="tabular-nums lg:min-w-28">
                <div className="flex flex-col">
                  <span className="text-body-sm text-foreground">
                    {formatDate(transaction.created_at)}
                  </span>
                  <span className="text-caption-xs text-muted-foreground">
                    {formatTime(transaction.created_at)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="lg:min-w-28">
                <TypeBadge type={transaction.type} />
              </TableCell>
              <TableCell className="lg:min-w-52">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground">
                    {getInitials(transaction.player_name)}
                  </span>
                  <span className="text-body-sm-medium text-foreground">
                    {transaction.player_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-foreground lg:min-w-24">
                {formatCoins(transaction.value)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground lg:min-w-30">
                {formatCoins(transaction.fee)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground lg:min-w-20">
                {formatCoins(transaction.penalty)}
              </TableCell>
              <TableCell className="text-right tabular-nums lg:min-w-24">
                <ProfitValue profit={transaction.profit} />
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold tabular-nums lg:min-w-36",
                  valueToneClassName(transaction.cash_change),
                )}
              >
                {formatSignedCoins(transaction.cash_change)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function TransactionsTableSkeleton() {
  const cells = [
    { cell: "lg:min-w-28", bar: "h-8 w-20" },
    { cell: "lg:min-w-28", bar: "h-6 w-20 rounded-lg" },
    { cell: "lg:min-w-52", bar: "h-4 w-32" },
    { cell: "text-right lg:min-w-24", bar: "h-4 w-14" },
    { cell: "text-right lg:min-w-30", bar: "h-4 w-14" },
    { cell: "text-right lg:min-w-20", bar: "h-4 w-12" },
    { cell: "text-right lg:min-w-24", bar: "h-4 w-14" },
    { cell: "text-right lg:min-w-36", bar: "h-4 w-16" },
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
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {cells.map(({ cell, bar }, columnIndex) => (
              <TableCell key={columnIndex} className={cell}>
                <Skeleton
                  className={cn(
                    "h-4",
                    bar,
                    cell.includes("text-right") && "ml-auto",
                  )}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
