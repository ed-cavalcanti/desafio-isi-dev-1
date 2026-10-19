import { cn } from "@/lib/utils";

type AgilityBarProps = {
  agility: number;
  className?: string;
};

function getAgilityColor(agility: number) {
  if (agility <= 30) return "bg-destructive";
  if (agility <= 79) return "bg-muted-foreground";
  return "bg-success";
}

export function AgilityBar({ agility, className }: AgilityBarProps) {
  const value = Math.min(100, Math.max(0, agility));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full", getAgilityColor(agility))}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
