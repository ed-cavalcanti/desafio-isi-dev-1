"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCoins, formatDate, formatTime } from "@/lib/format";
import type { Purchase } from "@/lib/types";

type PurchaseSummaryRowProps = {
  label: string;
  caption?: string;
  value: string;
  emphasis?: boolean;
};

function PurchaseSummaryRow({
  label,
  caption,
  value,
  emphasis = false,
}: PurchaseSummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={
            emphasis
              ? "text-body-sm-semibold text-foreground"
              : "text-body-sm text-foreground"
          }
        >
          {label}
        </span>
        {caption ? (
          <span className="text-caption text-muted-foreground">{caption}</span>
        ) : null}
      </div>
      <span
        className={
          emphasis
            ? "shrink-0 text-body-sm-semibold tabular-nums text-foreground"
            : "shrink-0 text-body-sm tabular-nums text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

type PlayerPurchaseSuccessProps = {
  playerName: string;
  clubName: string;
  purchase: Purchase;
};

export function PlayerPurchaseSuccess({
  playerName,
  clubName,
  purchase,
}: PlayerPurchaseSuccessProps) {
  const feeCaption =
    purchase.fee > 0
      ? "5% do valor, porque passa de 30,00"
      : "Sem taxa: o valor não passa de 30,00";

  return (
    <>
      <DialogHeader className="gap-1 px-6 py-4">
        <span
          aria-hidden="true"
          className="mb-2 flex size-10 items-center justify-center rounded-full border border-success-soft-border bg-success-soft"
        >
          <CircleCheck className="size-5 text-success" />
        </span>
        <DialogTitle className="text-heading-dialog">
          Compra concluída
        </DialogTitle>
        <DialogDescription className="text-body-sm text-muted-foreground">
          {playerName} agora é do {clubName}.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <PurchaseSummaryRow
            label="Valor"
            caption="Valor de mercado no momento da compra"
            value={formatCoins(purchase.value)}
          />
          <Separator />
          <PurchaseSummaryRow
            label="Taxa"
            caption={feeCaption}
            value={formatCoins(purchase.fee)}
          />
          <Separator />
          <PurchaseSummaryRow
            label="Custo total"
            caption="Valor + taxa"
            value={formatCoins(purchase.total_cost)}
            emphasis
          />
          <Separator />
          <PurchaseSummaryRow
            label="Fim da fidelidade"
            value={`${formatDate(purchase.contract.loyalty_until)}, ${formatTime(purchase.contract.loyalty_until)}`}
          />
          <Separator />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-body-sm text-foreground">Contrato</span>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 rounded-md border-success-soft-border bg-success-soft px-2 py-0.5 text-caption-medium font-medium text-success-soft-foreground"
            >
              <span className="size-1.5 rounded-full bg-success" />
              ATIVO
            </Badge>
          </div>
          <Separator />
          <PurchaseSummaryRow
            label={`Novo caixa do ${clubName}`}
            value={formatCoins(purchase.club_cash)}
            emphasis
          />
        </div>
      </div>

      <DialogFooter className="flex-col items-stretch gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={`/clubs/${purchase.club_id}`} />}
          className="h-9 hover:cursor-pointer"
        >
          Ver clube
          <ArrowRight />
        </Button>
        <DialogClose
          render={
            <Button
              type="button"
              className="h-9 hover:cursor-pointer"
            />
          }
        >
          Fechar
        </DialogClose>
      </DialogFooter>
    </>
  );
}
