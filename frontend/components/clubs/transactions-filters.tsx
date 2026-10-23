"use client";

import { HandCoins, Search, ShoppingCart, type LucideIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const ALL_PLAYERS = "all";

export type PlayerOption = {
  id: number;
  name: string;
};

type TypeOption = {
  value: TransactionType;
  label: string;
  icon: LucideIcon;
};

const typeOptions: TypeOption[] = [
  { value: "COMPRA", label: "Compra", icon: ShoppingCart },
  { value: "VENDA", label: "Venda", icon: HandCoins },
];

type TransactionsFiltersProps = {
  types: TransactionType[];
  onToggleType: (type: TransactionType) => void;
  playerId: string;
  onPlayerChange: (playerId: string) => void;
  players: PlayerOption[];
};

export function TransactionsFilters({
  types,
  onToggleType,
  playerId,
  onPlayerChange,
  players,
}: TransactionsFiltersProps) {
  const playerItems = [
    { value: ALL_PLAYERS, label: "Jogador: todos" },
    ...players.map((player) => ({
      value: String(player.id),
      label: player.name,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-caption text-muted-foreground">Tipo</span>
        <div className="flex items-center gap-1.5">
          {typeOptions.map(({ value, label, icon: Icon }) => {
            const isChecked = types.includes(value);

            return (
              <label
                key={value}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors hover:cursor-pointer",
                  isChecked
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleType(value)}
                  className="size-3.5 accent-primary"
                />
                <Icon
                  className={cn("size-3.5", isChecked && "text-primary")}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      <Select
        value={playerId}
        onValueChange={(nextValue) => onPlayerChange(nextValue as string)}
        items={playerItems}
      >
        <SelectTrigger
          aria-label="Filtrar por jogador"
          className="h-9! w-auto gap-1.5 hover:cursor-pointer"
        >
          <Search className="size-4 text-muted-foreground" />
          <SelectValue>
            {(selected: string | null) => {
              const option = playerItems.find(
                (item) => item.value === selected,
              );

              return option?.label ?? "Jogador: todos";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-auto! min-w-(--anchor-width)">
          {playerItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
