import { Shirt, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { ClubAvatar } from "@/components/clubs/club-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_SQUAD_SIZE } from "@/lib/club";
import type { ClubDetails } from "@/lib/types";

type ClubDetailsHeaderProps = {
  club: ClubDetails;
};

export function ClubDetailsHeader({ club }: ClubDetailsHeaderProps) {
  const squadSize = club.players.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <ClubAvatar
          acronym={club.acronym}
          className="size-12 rounded-xl text-body-sm-medium"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-heading-page font-semibold text-foreground">
            {club.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-lg px-2 py-0.5 text-caption-medium font-medium"
            >
              <span className="text-muted-foreground">Sigla</span>
              <span className="font-semibold text-foreground">
                {club.acronym}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-lg px-2 py-0.5 text-caption-medium font-medium"
            >
              <Shirt aria-hidden="true" />
              <span className="tabular-nums">
                {squadSize} de {MAX_SQUAD_SIZE} jogadores
              </span>
            </Badge>
          </div>
        </div>
      </div>
      <Button
        nativeButton={false}
        render={<Link href="/players" />}
        className="h-9 hover:cursor-pointer"
      >
        <ShoppingCart />
        Comprar jogadores
      </Button>
    </div>
  );
}
