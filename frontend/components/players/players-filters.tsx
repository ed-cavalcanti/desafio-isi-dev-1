"use client";

import {
  Coins,
  HeartPulse,
  Search,
  Shield,
  Shirt,
  User,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ALL,
  ageOptions,
  conditionOptions,
  positionOptions,
  valueOptions,
  type FilterOption,
  type PlayersFilterValues,
} from "@/lib/player-filters";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

const FREE_CLUB_FILTER_WARNING =
  '"Livres" não combina com o filtro por clubes.';

type PlayersFiltersProps = {
  clubs: Club[];
  values: PlayersFilterValues;
  onChange: (values: PlayersFilterValues) => void;
  clubFilterDisabled?: boolean;
};

export function PlayersFilters({
  clubs,
  values,
  onChange,
  clubFilterDisabled = false,
}: PlayersFiltersProps) {
  const updateFilter = <Key extends keyof PlayersFilterValues>(
    key: Key,
    value: PlayersFilterValues[Key],
  ) => {
    onChange({ ...values, [key]: value });
  };

  const clubOptions: FilterOption[] = clubs.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const clubFilter = (
    <FilterSelect
      ariaLabel="Filtrar por clube"
      placeholder="Clube"
      title="Clube"
      icon={Shield}
      value={values.clubId}
      onValueChange={(value) => updateFilter("clubId", value)}
      options={clubOptions}
      allLabel="Todos os clubes"
      disabled={clubFilterDisabled}
    />
  );

  return (
    <Card className="[--card-spacing:--spacing(2)]">
      <CardContent className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={values.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Buscar jogador pelo nome"
            aria-label="Buscar jogador pelo nome"
            className="h-9! pl-8"
          />
        </div>

        <FilterSelect
          ariaLabel="Filtrar por posição"
          placeholder="Posição"
          title="Posição"
          icon={Shirt}
          value={values.position}
          onValueChange={(value) =>
            updateFilter("position", value as PlayersFilterValues["position"])
          }
          options={positionOptions}
          allLabel="Todas as posições"
        />
        <FilterSelect
          ariaLabel="Filtrar por condição"
          placeholder="Condição"
          title="Condição"
          icon={HeartPulse}
          value={values.condition}
          onValueChange={(value) =>
            updateFilter(
              "condition",
              value as PlayersFilterValues["condition"],
            )
          }
          options={conditionOptions}
          allLabel="Todas as condições"
        />

        {clubFilterDisabled ? (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              {clubFilter}
            </TooltipTrigger>
            <TooltipContent>{FREE_CLUB_FILTER_WARNING}</TooltipContent>
          </Tooltip>
        ) : (
          clubFilter
        )}

        <FilterSelect
          ariaLabel="Filtrar por idade"
          placeholder="Idade"
          title="Idade"
          icon={User}
          value={values.ageRange}
          onValueChange={(value) => updateFilter("ageRange", value)}
          options={ageOptions}
          allLabel="Qualquer idade"
        />
        <FilterSelect
          ariaLabel="Filtrar por valor de mercado"
          placeholder="Valor de mercado"
          title="Valor"
          icon={Coins}
          value={values.valueRange}
          onValueChange={(value) => updateFilter("valueRange", value)}
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
  title: string;
  icon: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
  disabled?: boolean;
  className?: string;
};

function FilterSelect({
  ariaLabel,
  placeholder,
  title,
  icon: Icon,
  value,
  onValueChange,
  options,
  allLabel,
  disabled = false,
  className,
}: FilterSelectProps) {
  const items = [{ value: ALL, label: allLabel }, ...options];

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as string)}
      items={items}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9!", className, disabled && "pointer-events-none")}
      >
        <Icon className="size-4 text-muted-foreground" />
        <SelectValue>
          {(selected: string | null) => {
            const selectedOption = items.find((item) => item.value === selected);

            if (selected === ALL || selected === null || !selectedOption) {
              return placeholder;
            }

            return `${title}: ${selectedOption.label}`;
          }}
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
