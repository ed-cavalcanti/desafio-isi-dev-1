import { Coins, Landmark, Shirt, Wallet, type LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { MAX_SQUAD_SIZE } from "@/lib/club";
import { formatCoins } from "@/lib/format";
import type { ClubDetails } from "@/lib/types";

type SummaryCardProps = {
  title: string;
  value: string;
  unit?: string;
  caption: string;
  icon: LucideIcon;
};

function SummaryCard({
  title,
  value,
  unit,
  caption,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-transparent p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm-medium text-muted-foreground">
          {title}
        </span>
        <Icon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </div>
      <div className="flex min-w-0 items-baseline gap-1">
        <span className="truncate text-display-kpi text-card-foreground tabular-nums">
          {value}
        </span>
        {unit ? (
          <span className="text-body-sm text-muted-foreground">{unit}</span>
        ) : null}
      </div>
      <p className="mt-auto text-caption-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

type ClubSummaryCardsProps = {
  club: ClubDetails;
};

export function ClubSummaryCards({ club }: ClubSummaryCardsProps) {
  const squadSize = club.players.length;

  return (
    <section
      aria-label="Resumo do clube"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <SummaryCard
        title="Caixa"
        value={formatCoins(club.cash)}
        unit="moedas"
        caption="Só muda por compras e vendas"
        icon={Wallet}
      />
      <SummaryCard
        title="Valor do elenco"
        value={formatCoins(club.squad_value)}
        unit="moedas"
        caption="Soma dos valores de mercado"
        icon={Coins}
      />
      <SummaryCard
        title="Patrimônio"
        value={formatCoins(club.net_worth)}
        unit="moedas"
        caption="Caixa + valor do elenco"
        icon={Landmark}
      />
      <SummaryCard
        title="Elenco"
        value={`${squadSize} de ${MAX_SQUAD_SIZE}`}
        caption="Limite de 12 jogadores"
        icon={Shirt}
      />
    </section>
  );
}

export function ClubSummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col gap-4 rounded-xl border border-border bg-transparent p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-4 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-auto h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
