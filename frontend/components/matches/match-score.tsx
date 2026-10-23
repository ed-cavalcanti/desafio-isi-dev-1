import { cn } from "@/lib/utils";

type MatchScoreProps = {
  homeGoals: number;
  awayGoals: number;
  className?: string;
};

export function MatchScore({
  homeGoals,
  awayGoals,
  className,
}: MatchScoreProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-body-sm-semibold tabular-nums text-foreground",
        className,
      )}
    >
      <span>{homeGoals}</span>
      <span className="text-muted-foreground">×</span>
      <span>{awayGoals}</span>
    </span>
  );
}
