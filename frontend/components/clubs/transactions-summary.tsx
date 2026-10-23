import {
  HandCoins,
  Percent,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCoins, formatSignedCoins } from "@/lib/format";
import type { TransactionsSummary as TransactionsSummaryData } from "@/lib/types";
import { cn } from "@/lib/utils";

type SummaryItem = {
  label: string;
  caption: string;
  value: string;
  icon: LucideIcon;
  tone?: string;
};

function SummaryCell({ label, caption, value, icon: Icon, tone }: SummaryItem) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <span
        className={cn(
          "text-heading-card tabular-nums text-card-foreground",
          tone,
        )}
      >
        {value}
      </span>
      <span className="text-caption-xs text-muted-foreground">{caption}</span>
    </div>
  );
}

function SummarySkeletonCell() {
  return (
    <div className="flex flex-col gap-1.5 bg-card px-4 py-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

type TransactionsSummaryProps = {
  summary: TransactionsSummaryData | null;
};

export function TransactionsSummary({ summary }: TransactionsSummaryProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SummarySkeletonCell key={index} />
        ))}
      </div>
    );
  }

  const profitTone =
    summary.total_profit > 0
      ? "text-success"
      : summary.total_profit < 0
        ? "text-destructive"
        : "text-muted-foreground";

  const items: SummaryItem[] = [
    {
      label: "Total pago em compras",
      caption: "Valor + taxa",
      value: formatCoins(summary.total_spent),
      icon: Wallet,
    },
    {
      label: "Total recebido em vendas",
      caption: "Crédito líquido",
      value: formatCoins(summary.total_received),
      icon: HandCoins,
    },
    {
      label: "Taxas e comissões",
      caption: "Soma das taxas",
      value: formatCoins(summary.total_fees),
      icon: Percent,
    },
    {
      label: "Multas",
      caption: "Por fidelidade",
      value: formatCoins(summary.total_penalties),
      icon: TriangleAlert,
    },
    {
      label: "Lucro total",
      caption: "Soma dos lucros, com sinal",
      value: formatSignedCoins(summary.total_profit),
      icon: summary.total_profit < 0 ? TrendingDown : TrendingUp,
      tone: profitTone,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <SummaryCell key={item.label} {...item} />
      ))}
    </div>
  );
}
