"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

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
import { formatPosition, getInitials } from "@/lib/format";
import type { Club, Player } from "@/lib/types";

type PlayerDeleteDialogProps = {
  player: Player | null;
  club: Club | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function PlayerDeleteDialog({
  player,
  club,
  onOpenChange,
  onDeleted,
}: PlayerDeleteDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastManager = useToast();

  useEffect(() => {
    setApiError(null);
  }, [player]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!player || isSubmitting) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      await apiFetch<void>(`/api/v1/players/${player.id}`, {
        method: "DELETE",
      });

      toastManager.add({
        title: "Jogador excluído",
        description: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
        type: "success",
      });
      onDeleted();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o jogador.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Excluir {player.name}?
              </DialogTitle>
              <DialogDescription className="text-body-sm text-muted-foreground">
                O jogador sai da lista e da busca, mas as transações e as
                partidas antigas dele continuam como foram gravadas.
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
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground"
                    >
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
                  <Badge
                    variant="secondary"
                    className="shrink-0 border-0 text-caption-medium font-medium"
                  >
                    {club?.name ?? "Livre"}
                  </Badge>
                </div>

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
                  variant="destructive"
                  disabled={isSubmitting}
                  className="h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 aria-hidden="true" />
                  {isSubmitting ? "Excluindo..." : "Excluir jogador"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
