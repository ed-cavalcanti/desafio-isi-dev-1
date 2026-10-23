"use client";

import {
  Ellipsis,
  Eye,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPosition } from "@/lib/format";
import type { Club, Player } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PlayerAction = "view" | "edit" | "condition" | "buy" | "delete";

type PlayerActionsMenuProps = {
  player: Player;
  club: Club | null;
  onAction?: (action: PlayerAction, player: Player) => void;
};

export function PlayerActionsMenu({
  player,
  club,
  onAction,
}: PlayerActionsMenuProps) {
  const isFree = player.club_id === null;
  const availabilityHint = isFree
    ? "Disponível porque o jogador está livre."
    : "Disponível apenas para jogadores livres.";

  const handleAction = (action: PlayerAction) => {
    onAction?.(action, player);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Ações de ${player.name}`}
            className="hover:cursor-pointer"
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-64">
        <div
          role="presentation"
          className="flex flex-col gap-0.5 px-2 py-1.5"
        >
          <span className="truncate text-body-sm-semibold text-foreground">
            {player.name}
          </span>
          <span className="text-caption text-muted-foreground">
            {formatPosition(player.position)} ·{" "}
            {isFree ? "Jogador livre" : (club?.name ?? "Com clube")}
          </span>
        </div>

        <DropdownMenuItem
          className="cursor-pointer gap-2 py-1.5"
          onClick={() => handleAction("view")}
        >
          <Eye className="text-muted-foreground" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-1.5"
          onClick={() => handleAction("edit")}
        >
          <Pencil className="text-muted-foreground" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-1.5"
          onClick={() => handleAction("condition")}
        >
          <HeartPulse className="text-muted-foreground" />
          Alterar condição
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-1" />

        <DropdownMenuItem
          className={cn("gap-2 py-1.5", isFree && "cursor-pointer")}
          disabled={!isFree}
          onClick={() => handleAction("buy")}
        >
          <ShoppingCart className="text-muted-foreground" />
          Comprar
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-1" />

        <DropdownMenuItem
          variant="destructive"
          className={cn("gap-2 py-1.5", isFree && "cursor-pointer")}
          disabled={!isFree}
          onClick={() => handleAction("delete")}
        >
          <Trash2 />
          Excluir
        </DropdownMenuItem>
        <p
          role="presentation"
          className="px-2 pb-1 text-caption text-muted-foreground"
        >
          {availabilityHint}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
