"use client";

import { CircleCheck, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { formatCondition, formatCoins, formatPosition } from "@/lib/format";
import type { Player } from "@/lib/types";

type PlayerCreatedDialogProps = {
  player: Player | null;
  onOpenChange: (open: boolean) => void;
};

export function PlayerCreatedDialog({
  player,
  onOpenChange,
}: PlayerCreatedDialogProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={player !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0">
        {player ? (
          <>
            <DialogHeader className="gap-2 px-6 pt-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
                <CircleCheck className="size-5" aria-hidden="true" />
              </span>
              <DialogTitle className="text-heading-dialog">Jogador cadastrado</DialogTitle>
              <DialogDescription className="text-body-sm text-muted-foreground">
                {player.name} entrou livre e{" "}
                {formatCondition(player.condition)}. Valores em moedas,
                calculados pela API ao salvar.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5">
              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="py-3 px-3.5 bg-muted-subtle">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body-sm-semibold text-foreground">
                            Valor base
                          </span>
                          <span className="text-caption text-muted-foreground">
                            Calculado no cadastro; não muda depois.
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right text-heading-card font-semibold tabular-nums text-foreground">
                        {formatCoins(player.base_value)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="py-3 px-3.5">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body-sm text-muted-foreground">
                            Valor de mercado
                          </span>
                          <span className="text-caption text-muted-foreground">
                            Com condição, agilidade e idade.
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right text-body-sm-medium font-semibold tabular-nums text-foreground">
                        {formatCoins(player.market_value)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="py-3 px-3.5">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body-sm text-muted-foreground">
                            Overall
                          </span>
                          <span className="text-caption text-muted-foreground">
                            Pelos pesos da posição{" "}
                            {formatPosition(player.position)}.
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right text-body-sm-medium font-semibold tabular-nums text-foreground">
                        {player.overall}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="px-6 pb-6">
              <Button
                variant="secondary"
                type="button"
                onClick={close}
                className="h-9 border border-border transition-colors hover:bg-muted-subtle hover:cursor-pointer"
              >
                <Eye aria-hidden="true" />
                Ver detalhes
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={close}
                className="h-9 hover:cursor-pointer"
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
