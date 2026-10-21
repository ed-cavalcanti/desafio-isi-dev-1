"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALL,
  ageOptions,
  conditionOptions,
  getFilterOptionLabel,
  initialPlayersFilters,
  positionOptions,
  SEARCH_MIN_LENGTH,
  valueOptions,
  type FilterOption,
  type PlayersFilterValues,
} from "@/lib/player-filters";
import type { Club } from "@/lib/types";

type ActiveFilter = {
  key: string;
  label: string;
  onRemove: () => void;
};

type PlayersActiveFiltersProps = {
  values: PlayersFilterValues;
  clubs: Club[];
  onChange: (values: PlayersFilterValues) => void;
};

export function PlayersActiveFilters({
  values,
  clubs,
  onChange,
}: PlayersActiveFiltersProps) {
  const searchTerm = values.search.trim();
  const hasSearch = searchTerm.length >= SEARCH_MIN_LENGTH;
  const activeFilters: ActiveFilter[] = [];

  if (values.position !== ALL) {
    activeFilters.push({
      key: "position",
      label: `Posição: ${labelFor(positionOptions, values.position)}`,
      onRemove: () => onChange({ ...values, position: ALL }),
    });
  }

  if (values.condition !== ALL) {
    activeFilters.push({
      key: "condition",
      label: `Condição: ${labelFor(conditionOptions, values.condition)}`,
      onRemove: () => onChange({ ...values, condition: ALL }),
    });
  }

  if (values.clubId !== ALL) {
    const club = clubs.find((item) => String(item.id) === values.clubId);

    activeFilters.push({
      key: "club",
      label: `Clube: ${club?.name ?? `#${values.clubId}`}`,
      onRemove: () => onChange({ ...values, clubId: ALL }),
    });
  }

  if (values.ageRange !== ALL) {
    activeFilters.push({
      key: "age",
      label: `Idade: ${labelFor(ageOptions, values.ageRange)}`,
      onRemove: () => onChange({ ...values, ageRange: ALL }),
    });
  }

  if (values.valueRange !== ALL) {
    activeFilters.push({
      key: "value",
      label: `Valor de mercado: ${labelFor(valueOptions, values.valueRange)}`,
      onRemove: () => onChange({ ...values, valueRange: ALL }),
    });
  }

  if (activeFilters.length === 0 && !hasSearch) {
    return null;
  }

  const clearFilters = () =>
    onChange({ ...initialPlayersFilters, search: values.search });
  const clearSearch = () => onChange({ ...values, search: "" });

  return (
    <div className="flex flex-col gap-1.5">
      {activeFilters.length > 0 ? (
        <ActiveFiltersGroup
          title="Filtros ativos"
          filters={activeFilters}
          actionLabel="Limpar filtros"
          onAction={clearFilters}
        />
      ) : null}

      {hasSearch ? (
        <ActiveFiltersGroup
          title="Resultado para a busca"
          filters={[
            {
              key: "search",
              label: searchTerm,
              onRemove: clearSearch,
            },
          ]}
          actionLabel="Limpar busca"
          onAction={clearSearch}
        />
      ) : null}
    </div>
  );
}

function labelFor(options: FilterOption[], value: string) {
  return getFilterOptionLabel(options, value) ?? value;
}

type ActiveFiltersGroupProps = {
  title: string;
  filters: ActiveFilter[];
  actionLabel: string;
  onAction: () => void;
};

function ActiveFiltersGroup({
  title,
  filters,
  actionLabel,
  onAction,
}: ActiveFiltersGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption-medium text-muted-foreground">{title}</span>

      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="h-6 gap-0.5 pr-0.5 pl-2 bg-muted"
        >
          {filter.label}
          <button
            type="button"
            onClick={filter.onRemove}
            aria-label={`Remover filtro ${filter.label}`}
            className="flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
          >
            <X className="size-3 hover: cursor-pointer" />
          </button>
        </Badge>
      ))}

      <Button
        variant="link"
        size="sm"
        onClick={onAction}
        className="h-6 px-1 text-caption-medium text-primary hover:cursor-pointer"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
