"use client";

import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_CLUBS } from "@/lib/match";
import type { Club } from "@/lib/types";

type MatchesClubFilterProps = {
  value: string;
  clubs: Club[];
  onValueChange: (value: string) => void;
};

export function MatchesClubFilter({
  value,
  clubs,
  onValueChange,
}: MatchesClubFilterProps) {
  const items = [
    { value: ALL_CLUBS, label: "Clube: todos" },
    ...clubs.map((club) => ({ value: String(club.id), label: club.name })),
  ];

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as string)}
      items={items}
    >
      <SelectTrigger
        aria-label="Filtrar partidas por clube"
        className="h-9! w-auto gap-1.5 hover:cursor-pointer hover:bg-muted"
      >
        <Search className="size-4 text-muted-foreground" />
        <SelectValue>
          {(selected: string | null) => {
            const option = items.find((item) => item.value === selected);
            return option?.label ?? "Clube: todos";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto! min-w-(--anchor-width)">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
