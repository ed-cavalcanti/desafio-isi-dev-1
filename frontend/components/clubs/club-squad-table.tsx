import { HandCoins } from "lucide-react";

import { ContractPenaltyBadge } from "@/components/clubs/contract-penalty-badge";
import { PlayerConditionBadge } from "@/components/players/player-condition-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCoins, formatDate, formatTime, getInitials } from "@/lib/format";
import type { SquadPlayer } from "@/lib/types";

const columns = [
  "Jogador",
  "Posição",
  "Overall",
  "Condição",
  "Valor de mercado",
  "Valor de compra",
  "Fim da fidelidade",
  "Dias restantes",
  "% de multa",
  "",
];

const rightAlignedColumns = [
  "Overall",
  "Valor de mercado",
  "Valor de compra",
  "Dias restantes",
];

function headClassName(column: string) {
  return rightAlignedColumns.includes(column) ? "text-right" : undefined;
}

type ClubSquadTableProps = {
  players: SquadPlayer[];
};

export function ClubSquadTable({ players }: ClubSquadTableProps) {
  return (
    <Card className="mt-6 w-full gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
        <h2 className="text-heading-card text-foreground">Elenco</h2>
        <p className="text-caption text-muted-foreground">
          Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome.
          Contrato calculado para uma venda agora.
        </p>
      </div>
      <Table>
        <TableHeader className="bg-muted-subtle">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className={headClassName(column)}>
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map(({ player, contract }) => (
            <TableRow key={player.id}>
              <TableCell className="lg:min-w-52">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground">
                    {getInitials(player.name)}
                  </span>
                  <span className="text-body-sm-medium text-foreground">
                    {player.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="lg:min-w-18">
                <span className="w-fit rounded-lg border border-border px-2 py-0.5 font-medium">
                  {player.position}
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums lg:min-w-16">
                {player.overall}
              </TableCell>
              <TableCell className="lg:min-w-36">
                <PlayerConditionBadge condition={player.condition} />
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-foreground lg:min-w-30">
                {formatCoins(player.market_value)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground lg:min-w-28">
                {formatCoins(contract.purchase_value)}
              </TableCell>
              <TableCell className="tabular-nums lg:min-w-36">
                <div className="flex flex-col">
                  <span className="text-body-sm text-foreground">
                    {formatDate(contract.loyalty_until)}
                  </span>
                  <span className="text-caption-xs text-muted-foreground">
                    {formatTime(contract.loyalty_until)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums lg:min-w-28">
                {contract.days_remaining}
              </TableCell>
              <TableCell className="lg:min-w-20">
                <ContractPenaltyBadge
                  penaltyPercent={contract.penalty_percent}
                />
              </TableCell>
              <TableCell className="text-right lg:min-w-28">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 hover:cursor-pointer"
                >
                  <HandCoins />
                  Vender
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
