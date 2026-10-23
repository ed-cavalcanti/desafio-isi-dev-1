"use client";

import { ArrowUpDown } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const sortOptions = [
  { value: "name", label: "Nome" },
  { value: "value_desc", label: "Maior valor de mercado" },
  { value: "value_asc", label: "Menor valor de mercado" },
  { value: "age_desc", label: "Maior idade" },
  { value: "age_asc", label: "Menor idade" },
  { value: "position", label: "Posição (GOL a ATA)" },
] as const;

export type PlayerSort = (typeof sortOptions)[number]["value"];

type PlayersSortProps = {
  value: PlayerSort;
  onValueChange: (value: PlayerSort) => void;
};

export function PlayersSort({ value, onValueChange }: PlayersSortProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as PlayerSort)}
      items={sortOptions}
    >
      <SelectTrigger
        aria-label="Ordenar jogadores"
        className="h-9! w-auto! min-w-52 hover:cursor-pointer hover:bg-muted"
      >
        <ArrowUpDown className="size-4 text-muted-foreground" />
        <SelectValue>
          {(selected: string | null) => {
            const selectedOption = sortOptions.find(
              (option) => option.value === selected,
            );

            return selectedOption
              ? `Ordenar por: ${selectedOption.label}`
              : "Ordenar por";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto! min-w-(--anchor-width)">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
