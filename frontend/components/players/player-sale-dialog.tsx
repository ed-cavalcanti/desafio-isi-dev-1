"use client";

import {
  AlertCircle,
  AlertTriangle,
  HandCoins,
  Info,
  Loader2,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { ContractPenaltyBadge } from "@/components/clubs/contract-penalty-badge";
import { PlayerSaleSuccess } from "@/components/players/player-sale-success";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SummaryRow } from "@/components/ui/summary-row";
import { apiFetch } from "@/lib/api";
import {
  formatCoins,
  formatDate,
  formatPosition,
  formatTime,
  getInitials,
} from "@/lib/format";
import type { Lineup, Sale, SquadPlayer } from "@/lib/types";

type SaleApiError = {
  title: string;
  description: string;
};

function resolveApiError(error: unknown): SaleApiError {
  if (error instanceof TypeError) {
    return {
      title: "Sem conexão",
      description:
        "A venda não foi confirmada. Verifique a conexão e tente de novo.",
    };
  }

  return {
    title: "A venda foi recusada",
    description:
      error instanceof Error
        ? error.message
        : "Não foi possível concluir a venda.",
  };
}

type PlayerSaleDialogProps = {
  clubId: number;
  clubName: string;
  squadPlayer: SquadPlayer | null;
  onOpenChange: (open: boolean) => void;
  onSold: (sale: Sale) => void;
  onShowHistory: () => void;
};

export function PlayerSaleDialog({
  clubId,
  clubName,
  squadPlayer,
  onOpenChange,
  onSold,
  onShowHistory,
}: PlayerSaleDialogProps) {
  const [isTitular, setIsTitular] = useState(false);
  const [apiError, setApiError] = useState<SaleApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    setApiError(null);
    setSale(null);
    setIsTitular(false);

    if (!squadPlayer) return;

    let isActive = true;
    const playerId = squadPlayer.id;

    apiFetch<Lineup>(`/api/v1/clubs/${clubId}/lineup`)
      .then((lineup) => {
        if (!isActive) return;
        setIsTitular(lineup.players.some((titular) => titular.id === playerId));
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [clubId, squadPlayer]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!squadPlayer || isSubmitting) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const result = await apiFetch<Sale>(
        `/api/v1/players/${squadPlayer.id}/sell`,
        { method: "POST" },
      );

      setSale(result);
      onSold(result);
    } catch (error) {
      setApiError(resolveApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={squadPlayer !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="gap-0 p-0 sm:max-w-lg"
      >
        {squadPlayer ? (
          sale ? (
            <PlayerSaleSuccess
              playerName={squadPlayer.name}
              clubName={clubName}
              sale={sale}
              onShowHistory={onShowHistory}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <DialogHeader className="gap-1 px-6 py-4">
                <DialogTitle className="text-heading-dialog">
                  Vender {squadPlayer.name}?
                </DialogTitle>
                <DialogDescription className="text-body-sm text-muted-foreground">
                  O jogador sai do elenco de {clubName} e volta a ficar livre.
                </DialogDescription>
              </DialogHeader>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
                {apiError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive-soft-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-body-sm-medium text-destructive-soft-foreground">
                        {apiError.title}
                      </p>
                      <p className="text-caption text-destructive-soft-foreground">
                        {apiError.description}
                      </p>
                    </div>
                  </div>
                ) : null}

                {isTitular ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-warning-soft-border bg-warning-soft px-3 py-2 text-warning-soft-foreground"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-body-sm-medium font-semibold">
                        {squadPlayer.name} é titular
                      </p>
                      <p className="text-body-sm">
                        Ao vender, ele sai da escalação, e o {clubName} só volta
                        a jogar partidas depois de escalar de novo os 5
                        titulares.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted-subtle px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground"
                    >
                      {getInitials(squadPlayer.name)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-body-sm-semibold text-foreground">
                        {squadPlayer.name}
                      </span>
                      <span className="truncate text-caption text-muted-foreground">
                        {squadPlayer.position} ·{" "}
                        {formatPosition(squadPlayer.position)} ·{" "}
                        {squadPlayer.age} anos
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-caption text-muted-foreground">
                      Valor de mercado
                    </span>
                    <span className="text-heading-card text-foreground tabular-nums">
                      {formatCoins(squadPlayer.market_value)}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  <SummaryRow
                    label="Valor de compra"
                    value={formatCoins(squadPlayer.contract.purchase_value)}
                  />
                  <Separator />
                  <SummaryRow
                    label="Fim da fidelidade"
                    value={`${formatDate(
                      squadPlayer.contract.loyalty_until,
                    )}, ${formatTime(squadPlayer.contract.loyalty_until)}`}
                  />
                  <Separator />
                  <SummaryRow
                    label="Dias restantes"
                    value={String(squadPlayer.contract.remaining_days)}
                  />
                  <Separator />
                  <SummaryRow
                    label="% de multa se vender agora"
                    value={
                      <ContractPenaltyBadge
                        penaltyPercent={squadPlayer.contract.penalty_rate}
                      />
                    }
                  />
                </div>

                <div className="flex items-start gap-2 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-muted-foreground">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="text-body-sm">
                    A venda é pelo valor de mercado do momento. Multa (teto de
                    10,00), lucro, comissão e crédito são calculados ao
                    confirmar.
                  </span>
                </div>

                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-muted-foreground">
                    <Loader2
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-body-sm">
                      Enviando a venda. Os botões ficam desabilitados até a
                      resposta.
                    </span>
                  </div>
                ) : null}
              </div>

              <Separator className="mx-6" />

              <DialogFooter className="flex-col items-stretch gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className="h-9 hover:cursor-pointer"
                    />
                  }
                >
                  Cancelar
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <HandCoins />
                  )}
                  {isSubmitting ? "Vendendo..." : "Confirmar venda"}
                </Button>
              </DialogFooter>
            </form>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
