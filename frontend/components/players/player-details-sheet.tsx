"use client";

import {
  ChartColumn,
  Coins,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { PlayerConditionBadge } from "@/components/players/player-condition-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { formatCoins, getInitials } from "@/lib/format";
import { PLAYER_ATTRIBUTE_FIELDS } from "@/lib/player-attributes";
import type { Club, Player } from "@/lib/types";

type PlayerDetailsSheetProps = {
  player: Player | null;
  club: Club | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (player: Player) => void;
  onChangeCondition?: (player: Player) => void;
  onBuy?: (player: Player) => void;
};

type InfoCardProps = {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
};

function InfoCard({ label, value, caption, icon: Icon }: InfoCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-3.5">
      <div className="flex items-center justify-between gap-1.5">
        <span className="truncate text-caption text-muted-foreground">
          {label}
        </span>
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center">
        <span className="truncate text-display-kpi text-foreground tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-caption-xs text-muted-foreground">{caption}</span>
    </div>
  );
}

type AttributeBarProps = {
  label: string;
  value: number;
  potential: number;
};

function AttributeBar({ label, value, potential }: AttributeBarProps) {
  const valuePercentage = Math.min(100, (value / 99) * 100);
  const potentialPercentage = Math.min(100, (potential / 99) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-body-sm text-muted-foreground">
        {label}
      </span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={99}
        className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/20"
          style={{ width: `${potentialPercentage}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${valuePercentage}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-body-sm-medium font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

function PlayerHeader({ player, club }: { player: Player; club: Club | null }) {
  const clubLabel =
    player.club_id === null
      ? "Livre"
      : (club?.name ?? `Clube #${player.club_id}`);

  return (
    <SheetHeader className="gap-0 px-6 py-5 pr-14">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground"
        >
          {getInitials(player.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <SheetTitle className="truncate text-heading-dialog text-foreground">
            {player.name}
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-lg px-2 py-0.5 text-caption-medium font-medium"
            >
              {player.position}
            </Badge>
            <PlayerConditionBadge condition={player.condition} />
            <Badge
              variant="secondary"
              className="rounded-lg border-0 px-2 py-0.5 text-caption-medium font-medium"
            >
              {clubLabel}
            </Badge>
          </div>
        </div>
      </div>
      <SheetDescription className="sr-only">
        Detalhes de {player.name}.
      </SheetDescription>
    </SheetHeader>
  );
}

export function PlayerDetailsSheet({
  player,
  club,
  onOpenChange,
  onEdit,
  onChangeCondition,
  onBuy,
}: PlayerDetailsSheetProps) {
  const isFree = player?.club_id === null;

  return (
    <Sheet open={player !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full! gap-0 border-border p-0 sm:max-w-md!">
        {player ? (
          <>
            <PlayerHeader player={player} club={club} />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
              <section
                aria-label="Valores do jogador"
                className="grid grid-cols-2 gap-3"
              >
                <InfoCard
                  label="Valor de mercado"
                  value={formatCoins(player.market_value)}
                  caption="Calculado automaticamente"
                  icon={Coins}
                />
                <InfoCard
                  label="Valor base"
                  value={formatCoins(player.base_value)}
                  caption="Calculado no cadastro"
                  icon={Tag}
                />
                <InfoCard
                  label="Overall"
                  value={String(player.overall)}
                  caption="Calculado pela posição"
                  icon={ChartColumn}
                />
                <InfoCard
                  label="Potencial"
                  value={String(player.potential)}
                  caption="Informado no cadastro"
                  icon={TrendingUp}
                />
              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-heading-card text-foreground">
                    Indicadores técnicos
                  </h2>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    Escala de 1 a 99
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {PLAYER_ATTRIBUTE_FIELDS.map(({ field, label }) => (
                    <AttributeBar
                      key={field}
                      label={label}
                      value={player[field]}
                      potential={player.potential}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-xs bg-primary" />
                    Valor do atributo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-xs bg-primary/20" />
                    Até o potencial ({player.potential}), que nenhum atributo
                    passa
                  </span>
                </div>
              </section>

              <section
                aria-label="Dados do jogador"
                className="overflow-hidden rounded-xl border border-border"
              >
                <Table>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="text-muted-foreground">
                        Idade
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground tabular-nums">
                        {player.age} anos
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="text-muted-foreground">
                        Agilidade
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground tabular-nums">
                        {player.agility}
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="text-muted-foreground">
                        Clube
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {isFree
                          ? "Livre"
                          : (club?.name ?? `Clube #${player.club_id}`)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </section>
            </div>

            <div className="px-4 mb-6">
              <Separator />
            </div>

            <SheetFooter className="mt-0 flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-9 hover:cursor-pointer"
                onClick={() => onEdit?.(player)}
              >
                <Pencil />
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 hover:cursor-pointer mb-6"
                onClick={() => onChangeCondition?.(player)}
              >
                <HeartPulse />
                Alterar condição
              </Button>
              {isFree ? (
                <Button
                  type="button"
                  className="h-9 hover:cursor-pointer sm:ml-auto"
                  onClick={() => onBuy?.(player)}
                >
                  <ShoppingCart />
                  Comprar
                </Button>
              ) : null}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
