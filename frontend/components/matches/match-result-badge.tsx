import { Badge } from "@/components/ui/badge";
import { formatMatchResult } from "@/lib/match";
import type { MatchOutcome } from "@/lib/types";

type MatchResultBadgeProps = {
  result: MatchOutcome;
};

export function MatchResultBadge({ result }: MatchResultBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="rounded-md border-border bg-background px-2 py-0.5 text-caption-medium font-medium text-foreground"
    >
      {formatMatchResult(result)}
    </Badge>
  );
}
