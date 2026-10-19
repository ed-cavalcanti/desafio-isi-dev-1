"use client";

import {
  CalendarDays,
  Coins,
  HeartPulse,
  Search,
  Shield,
  Shirt,
  User,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCondition, formatPosition } from "@/lib/format";
import type { Club, PlayerCondition, Position } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "all";

const positionOptions = (
  ["GOL", "ZAG", "LAT", "MEI", "ATA"] as Position[]
).map((position) => ({ value: position, label: formatPosition(position) }));

const conditionOptions = (
  ["APTO", "MAL_CONDICIONADO", "DOENTE"] as PlayerCondition[]
).map((condition) => ({ value: condition, label: formatCondition(condition) }));

const ageOptions = [
  { value: "16-21", label: "16 a 21 anos" },
  { value: "22-25", label: "22 a 25 anos" },
  { value: "26-30", label: "26 a 30 anos" },
  { value: "31-35", label: "31 a 35 anos" },
  { value: "36-45", label: "36 a 45 anos" },
];

const valueOptions = [
  { value: "0-50", label: "Até 50,00" },
  { value: "50-100", label: "50,00 a 100,00" },
  { value: "100-200", label: "100,00 a 200,00" },
  { value: "200-550", label: "Acima de 200,00" },
];

type FilterOption = { value: string; label: string };

type PlayersFiltersProps = {
  clubs: Club[];
};

export function PlayersFilters({ clubs }: PlayersFiltersProps) {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState(ALL);
  const [condition, setCondition] = useState(ALL);
  const [club, setClub] = useState(ALL);
  const [age, setAge] = useState(ALL);
  const [value, setValue] = useState(ALL);

  const clubOptions: FilterOption[] = clubs.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  return (
    <Card className="[--card-spacing:--spacing(2)]">
      <CardContent className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar jogador pelo nome"
            aria-label="Buscar jogador pelo nome"
            className="h-9! pl-8"
          />
        </div>

        <FilterSelect
          ariaLabel="Filtrar por posição"
          placeholder="Posição"
          icon={Shirt}
          value={position}
          onValueChange={setPosition}
          options={positionOptions}
          allLabel="Todas as posições"
        />
        <FilterSelect
          ariaLabel="Filtrar por condição"
          placeholder="Condição"
          icon={HeartPulse}
          value={condition}
          onValueChange={setCondition}
          options={conditionOptions}
          allLabel="Todas as condições"
        />
        <FilterSelect
          ariaLabel="Filtrar por clube"
          placeholder="Clube"
          icon={Shield}
          value={club}
          onValueChange={setClub}
          options={clubOptions}
          allLabel="Todos os clubes"
        />
        <FilterSelect
          ariaLabel="Filtrar por idade"
          placeholder="Idade"
          icon={User}
          value={age}
          onValueChange={setAge}
          options={ageOptions}
          allLabel="Qualquer idade"
        />
        <FilterSelect
          ariaLabel="Filtrar por valor de mercado"
          placeholder="Valor de mercado"
          icon={Coins}
          value={value}
          onValueChange={setValue}
          options={valueOptions}
          allLabel="Qualquer valor"
          className="min-w-44"
        />
      </CardContent>
    </Card>
  );
}

type FilterSelectProps = {
  ariaLabel: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
  className?: string;
};

function FilterSelect({
  ariaLabel,
  placeholder,
  icon: Icon,
  value,
  onValueChange,
  options,
  allLabel,
  className,
}: FilterSelectProps) {
  const items = [{ value: ALL, label: allLabel }, ...options];

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as string)}
      items={items}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9!", className)}
      >
        <Icon className="size-4 text-muted-foreground" />
        <SelectValue>
          {(selected: string | null) =>
            selected === ALL || selected === null
              ? placeholder
              : (items.find((item) => item.value === selected)?.label ??
                placeholder)
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto! min-w-(--anchor-width)">
        {items.map((item, index) => (
          <SelectItem key={item.value} value={item.value}>
            {index === 0 && <Icon className="size-4 text-muted-foreground" />}
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
