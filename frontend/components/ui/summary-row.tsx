import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryRowProps = {
  label: string;
  caption?: string;
  value: ReactNode;
  emphasis?: boolean;
  valueClassName?: string;
};

export function SummaryRow({
  label,
  caption,
  value,
  emphasis = false,
  valueClassName,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "text-body-sm text-foreground",
            emphasis && "text-body-sm-semibold",
          )}
        >
          {label}
        </span>
        {caption ? (
          <span className="text-caption text-muted-foreground">{caption}</span>
        ) : null}
      </div>
      <div
        className={cn(
          "shrink-0 text-body-sm tabular-nums text-foreground",
          emphasis && "text-body-sm-semibold",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}
