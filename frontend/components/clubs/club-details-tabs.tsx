"use client";

import { ClipboardList, History, Shirt, Users } from "lucide-react";
import Link from "next/link";

import { ClubLineupTab } from "@/components/clubs/club-lineup-tab";
import { ClubSquadTable } from "@/components/clubs/club-squad-table";
import { ClubTransactionsHistory } from "@/components/clubs/club-transactions-history";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_SQUAD_SIZE } from "@/lib/club";
import type { SquadPlayer } from "@/lib/types";

const tabTriggerClassName =
  "h-auto flex-none gap-2 rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-1 pt-1 pb-3 text-body-sm-medium text-muted-foreground hover:text-muted-foreground data-active:border-b-primary data-active:bg-transparent data-active:text-foreground dark:bg-transparent dark:text-muted-foreground dark:data-active:border-b-primary dark:data-active:text-foreground after:hidden hover:cursor-pointer";

type ClubDetailsTabsProps = {
  clubId: number;
  cash: number;
  players: SquadPlayer[];
  transactionCount: number | null;
};

export function ClubDetailsTabs({
  clubId,
  cash,
  players,
  transactionCount,
}: ClubDetailsTabsProps) {
  const squadCount = players.length;

  return (
    <Tabs defaultValue="squad">
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-6 rounded-none border-b border-border p-0"
      >
        <TabsTrigger value="squad" className={tabTriggerClassName}>
          <Shirt aria-hidden="true" className="size-4" />
          Elenco
          <span className="text-caption tabular-nums">{squadCount}</span>
        </TabsTrigger>
        <TabsTrigger value="lineup" className={tabTriggerClassName}>
          <ClipboardList aria-hidden="true" className="size-4" />
          Escalação
        </TabsTrigger>
        <TabsTrigger value="history" className={tabTriggerClassName}>
          <History aria-hidden="true" className="size-4" />
          Histórico
          <span className="text-caption tabular-nums">
            {transactionCount ?? "–"}
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="squad">
        {squadCount === 0 ? (
          <Card className="mt-6 w-full">
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Shirt
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              </div>
              <div className="flex max-w-md flex-col gap-1">
                <p className="text-body-sm-medium text-foreground">
                  Nenhum jogador no elenco
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Compre jogadores livres para montar o elenco. O limite é de{" "}
                  {MAX_SQUAD_SIZE} jogadores, e o custo de cada compra não pode
                  passar de 50% do caixa.
                </p>
              </div>
              <Button
                nativeButton={false}
                render={<Link href="/players" />}
                className="h-9 hover:cursor-pointer"
                variant="outline"
              >
                <Users />
                Ver jogadores livres
              </Button>
            </div>
          </Card>
        ) : (
          <ClubSquadTable players={players} />
        )}
      </TabsContent>
      <TabsContent value="lineup">
        <ClubLineupTab clubId={clubId} players={players} />
      </TabsContent>
      <TabsContent value="history">
        <ClubTransactionsHistory clubId={clubId} cash={cash} />
      </TabsContent>
    </Tabs>
  );
}
