"use client";

import { AlertCircle, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { PlayerConditionBadge } from "@/components/players/player-condition-badge";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCoins, formatCondition, formatPosition, getInitials } from "@/lib/format";
import type { Player, PlayerCondition } from "@/lib/types";
import { cn } from "@/lib/utils";

const CONDITION_OPTIONS: {
  value: PlayerCondition;
  description: string;
}[] = [
  {
    value: "APTO",
    description: "Sem desconto por condição.",
  },
  {
    value: "MAL_CONDICIONADO",
    description:
      "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  },
  {
    value: "DOENTE",
    description: "Desconto de 30%, com o mesmo ajuste de agilidade.",
  },
];

type PlayerConditionDialogProps = {
  player: Player | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (player: Player) => void;
};

export function PlayerConditionDialog({
  player,
  onOpenChange,
  onUpdated,
}: PlayerConditionDialogProps) {
  const [condition, setCondition] = useState<PlayerCondition | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastManager = useToast();

  useEffect(() => {
    if (!player) return;

    setCondition(player.condition);
    setApiError(null);
  }, [player]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !player || !condition) return;

    if (player.condition === "DOENTE" && condition === "APTO") return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const updated = await apiFetch<Player>(
        `/api/v1/players/${player.id}/condition`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ condition }),
        },
      );

      onUpdated(updated);
      toastManager.add({
        title: "Condição alterada",
        description: `${player.name} agora está ${formatCondition(updated.condition)}. Valor de mercado: ${formatCoins(updated.market_value)}.`,
        type: "success",
      });
      onOpenChange(false);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a condição.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRecoveryBlocked = player?.condition === "DOENTE";

  return (
    <Dialog open={player !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="gap-0 p-0 sm:max-w-md"
      >
        {player ? (
          <>
            <DialogHeader className="gap-1 px-6 py-4">
              <DialogTitle className="text-heading-dialog">
                Alterar condição física
              </DialogTitle>
              <DialogDescription className="text-body-sm text-muted-foreground">
                A condição muda o desconto do valor de mercado, recalculado ao
                salvar.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted-subtle px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground">
                      {getInitials(player.name)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-body-sm-semibold text-foreground">
                        {player.name}
                      </span>
                      <span className="truncate text-caption text-muted-foreground">
                        {player.position} · {formatPosition(player.position)} ·{" "}
                        {player.age} anos
                      </span>
                    </div>
                  </div>
                  <PlayerConditionBadge
                    condition={player.condition}
                    className="shrink-0"
                  />
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="sr-only">Condição física</legend>
                  {CONDITION_OPTIONS.map((option) => {
                    const isSelected = condition === option.value;
                    const isCurrent = player.condition === option.value;
                    const isDisabled =
                      isRecoveryBlocked && option.value === "APTO";

                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                          isSelected
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-background",
                          isDisabled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:bg-muted-subtle focus-within:border-primary",
                        )}
                      >
                        <input
                          type="radio"
                          name="player-condition"
                          value={option.value}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {
                            setCondition(option.value);
                            setApiError(null);
                          }}
                          aria-describedby={`condition-${option.value}-description`}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                            isSelected ? "border-primary" : "border-input",
                          )}
                        >
                          {isSelected ? (
                            <span className="size-2 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-body-sm-semibold text-foreground">
                              {formatCondition(option.value)}
                            </span>
                            {isCurrent ? (
                              <Badge
                                variant="secondary"
                                className="border-0 text-caption-medium"
                              >
                                Atual
                              </Badge>
                            ) : null}
                          </span>
                          <span
                            id={`condition-${option.value}-description`}
                            className="text-caption text-muted-foreground"
                          >
                            {option.description}
                          </span>
                          {isDisabled ? (
                            <span className="mt-0.5 flex items-center gap-1.5 text-caption text-muted-foreground">
                              <Lock className="size-3 shrink-0" aria-hidden="true" />
                              De Doente não passa direto para Apto.
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                {apiError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2 text-body-sm text-destructive-soft-foreground"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{apiError}</p>
                  </div>
                ) : null}
              </div>

              <DialogFooter className="flex-col items-stretch gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
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
                  disabled={isSubmitting || !condition}
                  className="h-9 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Salvando..." : "Salvar condição"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
