"use client";

import { ArrowUpDown } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const clubSortOptions = [
  { value: "name", label: "Nome" },
  { value: "net_worth_desc", label: "Patrimônio (maior para o menor)" },
  { value: "net_worth_asc", label: "Patrimônio (maior para o menor)" },
] as const;

export type ClubSort = (typeof clubSortOptions)[number]["value"];

type ClubsSortProps = {
  value: ClubSort;
  onValueChange: (value: ClubSort) => void;
};

export function ClubsSort({ value, onValueChange }: ClubsSortProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as ClubSort)}
      items={clubSortOptions}
    >
      <SelectTrigger
        aria-label="Ordenar clubes"
        className="h-9! w-auto! min-w-52 hover:cursor-pointer hover:bg-muted"
      >
        <ArrowUpDown className="size-4 text-muted-foreground" />
        <SelectValue>
          {(selected: string | null) => {
            const selectedOption = clubSortOptions.find(
              (option) => option.value === selected,
            );

            return selectedOption
              ? `Ordenar por: ${selectedOption.label}`
              : "Ordenar por";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto! min-w-(--anchor-width)">
        {clubSortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
