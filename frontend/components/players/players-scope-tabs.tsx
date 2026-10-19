"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PlayerScope = "all" | "free" | "club";

export type ScopeCounts = { all: number; free: number; club: number };

const scopeOrder: PlayerScope[] = ["all", "free", "club"];

const scopeLabels: Record<PlayerScope, string> = {
  all: "Todos",
  free: "Livres",
  club: "Em clubes",
};

type PlayersScopeTabsProps = {
  value: PlayerScope;
  onValueChange: (scope: PlayerScope) => void;
  counts: ScopeCounts | null;
};

export function PlayersScopeTabs({
  value,
  onValueChange,
  counts,
}: PlayersScopeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as PlayerScope)}
    >
      <TabsList className="h-9!">
        {scopeOrder.map((scope) => (
          <TabsTrigger
            key={scope}
            value={scope}
            className="h-7.5 gap-1.5 px-2.5 py-1 hover:cursor-pointer"
          >
            {scopeLabels[scope]}
            <span className="text-caption font-medium text-muted-foreground tabular-nums">
              {counts ? counts[scope] : "–"}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
