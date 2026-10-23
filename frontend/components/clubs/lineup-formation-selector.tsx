"use client";

import { FORMATIONS, getFormationConfig } from "@/lib/lineup";
import type { Formation } from "@/lib/types";
import { cn } from "@/lib/utils";

function FormationThumbnail({ formation }: { formation: Formation }) {
  const config = getFormationConfig(formation);
  const rows = [
    { count: config.attack, y: 11 },
    { count: config.midfield, y: 18 },
    { count: config.defense, y: 25 },
  ].filter((row) => row.count > 0);

  return (
    <svg aria-hidden="true" viewBox="0 0 32 36" className="size-8 shrink-0">
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="34.5"
        rx="4"
        fill="#2E7D4F"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="0.75"
      />
      <line
        x1="1"
        y1="18"
        x2="31"
        y2="18"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="0.6"
      />
      <circle
        cx="16"
        cy="18"
        r="4"
        fill="none"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="0.6"
      />
      {rows.flatMap((row) =>
        Array.from({ length: row.count }, (_, index) => {
          const x =
            row.count === 1 ? 16 : 8 + (16 * index) / (row.count - 1);

          return (
            <circle
              key={`${row.y}-${index}`}
              cx={x}
              cy={row.y}
              r="1.6"
              fill="white"
            />
          );
        }),
      )}
    </svg>
  );
}

type LineupFormationSelectorProps = {
  value: Formation;
  onChange: (formation: Formation) => void;
};

export function LineupFormationSelector({
  value,
  onChange,
}: LineupFormationSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-body-sm-semibold text-foreground">
        Formação
      </legend>
      <p className="text-caption text-muted-foreground">
        Os números contam os jogadores de linha de trás para frente. O goleiro
        fica fora da conta.
      </p>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {FORMATIONS.map((config) => {
          const isSelected = value === config.value;

          return (
            <label
              key={config.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors",
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-background hover:bg-muted-subtle",
              )}
            >
              <input
                type="radio"
                name="lineup-formation"
                value={config.value}
                checked={isSelected}
                onChange={() => onChange(config.value)}
                className="sr-only"
              />
              <FormationThumbnail formation={config.value} />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  isSelected ? "border-primary" : "border-input",
                )}
              >
                {isSelected ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : null}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-body-sm-semibold text-foreground">
                  {config.value}
                </span>
                <span className="text-caption text-muted-foreground">
                  {config.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
