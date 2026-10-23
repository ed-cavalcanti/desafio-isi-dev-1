import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const penaltyStyles = {
  none: "bg-success-soft text-success-soft-foreground border-success-soft-border",
  low: "bg-warning-soft text-warning-soft-foreground border-warning-soft-border",
  high: "bg-destructive-soft text-destructive-soft-foreground border-destructive-soft-border",
} as const;

function styleFor(penaltyPercent: number) {
  if (penaltyPercent === 0) {
    return penaltyStyles.none;
  }

  return penaltyPercent < 20 ? penaltyStyles.low : penaltyStyles.high;
}

type ContractPenaltyBadgeProps = {
  penaltyPercent: number;
  className?: string;
};

export function ContractPenaltyBadge({
  penaltyPercent,
  className,
}: ContractPenaltyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-lg px-2 py-0.5 text-caption-medium font-medium",
        styleFor(penaltyPercent),
        className,
      )}
    >
      {penaltyPercent === 0 && <Check />}
      {penaltyPercent}%
    </Badge>
  );
}
