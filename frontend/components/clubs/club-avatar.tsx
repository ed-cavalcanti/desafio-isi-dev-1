import { cn } from "@/lib/utils";

type ClubAvatarProps = {
  acronym: string;
  className?: string;
};

export function ClubAvatar({ acronym, className }: ClubAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-caption-xs font-medium tracking-wide text-foreground",
        className,
      )}
    >
      {acronym}
    </span>
  );
}
