import { Badge } from "@/components/ui/badge";
import { formatCondition } from "@/lib/format";
import type { PlayerCondition } from "@/lib/types";
import { cn } from "@/lib/utils";

const conditionStyles: Record<PlayerCondition, string> = {
  APTO: "bg-success-soft text-success-soft-foreground border-success-soft-border",
  MAL_CONDICIONADO:
    "bg-warning-soft text-warning-soft-foreground border-warning-soft-border",
  DOENTE:
    "bg-destructive-soft text-destructive-soft-foreground border-destructive-soft-border",
};

type PlayerConditionBadgeProps = {
  condition: PlayerCondition;
  className?: string;
};

export function PlayerConditionBadge({
  condition,
  className,
}: PlayerConditionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-lg px-2 py-0.5 text-caption-medium font-medium",
        conditionStyles[condition],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatCondition(condition)}
    </Badge>
  );
}
