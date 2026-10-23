"use client";

import { CircleCheck, History } from "lucide-react";

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
import { SummaryRow } from "@/components/ui/summary-row";
import { formatCoins, formatSignedCoins } from "@/lib/format";
import type { Sale } from "@/lib/types";
import { cn } from "@/lib/utils";

type PlayerSaleSuccessProps = {
  playerName: string;
  clubName: string;
  sale: Sale;
  onShowHistory: () => void;
};

function contractBadgeStyle(isRescinded: boolean) {
  return isRescinded
    ? "border-warning-soft-border bg-warning-soft text-warning-soft-foreground"
    : "border-border bg-muted text-muted-foreground";
}

export function PlayerSaleSuccess({
  playerName,
  clubName,
  sale,
  onShowHistory,
}: PlayerSaleSuccessProps) {
  const isRescinded = sale.days_remaining > 0;
  const hasProfit = sale.profit > 0;

  const penaltyCaption = isRescinded
    ? `${sale.penalty_percent}% do valor de venda, com teto de 10,00`
    : "Fidelidade cumprida: sem multa";

  const commissionCaption = hasProfit
    ? "10% do lucro até 10,00 + 20% do que passar"
    : "Sem lucro: sem comissão";

  const profitClassName =
    sale.profit === 0
      ? "text-foreground"
      : hasProfit
        ? "text-success"
        : "text-destructive";

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
          Venda concluída
        </DialogTitle>
        <DialogDescription className="text-body-sm text-muted-foreground">
          {playerName} voltou a ficar livre e saiu da escalação.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <SummaryRow
            label="Valor de compra"
            value={formatCoins(sale.purchase_value)}
          />
          <Separator />
          <SummaryRow
            label="Valor de venda"
            caption="Valor de mercado no momento da venda"
            value={formatCoins(sale.sale_value)}
          />
          <Separator />
          <SummaryRow
            label="Dias restantes"
            value={String(sale.days_remaining)}
          />
          <Separator />
          <SummaryRow
            label="Multa"
            caption={penaltyCaption}
            value={formatCoins(sale.penalty)}
          />
          <Separator />
          <SummaryRow
            label="Lucro"
            value={formatSignedCoins(sale.profit)}
            valueClassName={profitClassName}
          />
          <Separator />
          <SummaryRow
            label="Comissão"
            caption={commissionCaption}
            value={formatCoins(sale.commission)}
          />
          <Separator />
          <SummaryRow
            label="Crédito no caixa"
            caption="Valor de venda − multa − comissão"
            value={formatSignedCoins(sale.credit)}
            emphasis
          />
          <Separator />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-body-sm text-foreground">Contrato</span>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 gap-1.5 rounded-md px-2 py-0.5 text-caption-medium font-medium",
                contractBadgeStyle(isRescinded),
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isRescinded ? "bg-warning" : "bg-muted-foreground",
                )}
              />
              {isRescinded ? "RESCINDIDO" : "ENCERRADO"}
            </Badge>
          </div>
          <Separator />
          <SummaryRow
            label={`Novo caixa do ${clubName}`}
            value={formatCoins(sale.cash)}
            emphasis
          />
        </div>
      </div>

      <DialogFooter className="flex-col items-stretch gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onShowHistory}
          className="h-9 hover:cursor-pointer"
        >
          <History />
          Ver histórico
        </Button>
        <DialogClose
          render={
            <Button type="button" className="h-9 hover:cursor-pointer" />
          }
        >
          Fechar
        </DialogClose>
      </DialogFooter>
    </>
  );
}
