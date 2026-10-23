"use client";

import { AlertCircle, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  ALL_PLAYERS,
  TransactionsFilters,
  type PlayerOption,
} from "@/components/clubs/transactions-filters";
import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from "@/components/clubs/transactions-table";
import { TransactionsSummary } from "@/components/clubs/transactions-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { INITIAL_CLUB_CASH } from "@/lib/club";
import { formatCoins } from "@/lib/format";
import type {
  ClubTransactions,
  Transaction,
  TransactionType,
  TransactionsSummary as TransactionsSummaryData,
} from "@/lib/types";

const TRANSACTION_TYPES: TransactionType[] = ["COMPRA", "VENDA"];

function buildQuery(types: TransactionType[], playerId: string) {
  const params = new URLSearchParams();

  if (types.length === 1) {
    params.set("type", types[0]);
  }

  if (playerId !== ALL_PLAYERS) {
    params.set("player_id", playerId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function collectPlayerOptions(transactions: Transaction[]): PlayerOption[] {
  const playersById = new Map<number, string>();

  transactions.forEach((transaction) => {
    playersById.set(transaction.player_id, transaction.player_name);
  });

  return Array.from(playersById, ([id, name]) => ({ id, name })).sort(
    (first, second) => first.name.localeCompare(second.name, "pt-BR"),
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível carregar o histórico.";
}

type ClubTransactionsHistoryProps = {
  clubId: number;
  cash: number;
};

export function ClubTransactionsHistory({
  clubId,
  cash,
}: ClubTransactionsHistoryProps) {
  const toastManager = useToast();
  const [types, setTypes] = useState<TransactionType[]>(TRANSACTION_TYPES);
  const [playerId, setPlayerId] = useState(ALL_PLAYERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionsSummaryData | null>(null);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(
    () => buildQuery(types, playerId),
    [types, playerId],
  );

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    apiFetch<ClubTransactions>(
      `/api/v1/clubs/${clubId}/transactions${query}`,
    )
      .then((response) => {
        if (!isActive) return;

        setTransactions(response.data);
        setSummary(response.summary);

        if (query === "") {
          setPlayers(collectPlayerOptions(response.data));
        }
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;

        setTransactions([]);
        setSummary(null);
        setError(getErrorMessage(fetchError));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [clubId, query, reloadKey]);

  const handleToggleType = (type: TransactionType) => {
    setTypes((current) =>
      current.includes(type)
        ? current.filter((currentType) => currentType !== type)
        : [...current, type],
    );
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/v1/clubs/${clubId}/transactions/export${query}`,
      );

      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => null)) as { message?: string } | null;

        throw new Error(
          body?.message ?? "Não foi possível exportar o histórico.",
        );
      }

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");

      link.href = url;
      link.download = `historico-transacoes-clube-${clubId}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toastManager.add({
        title: "Histórico exportado",
        description: "O arquivo CSV foi baixado com os filtros aplicados.",
        type: "success",
      });
    } catch (exportError) {
      toastManager.add({
        title: "Não foi possível exportar",
        description:
          exportError instanceof Error
            ? exportError.message
            : "Tente novamente.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mt-6 w-full gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading-card text-foreground">
            Histórico de transações
          </h2>
          <p className="text-caption text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do
            momento de cada operação.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="h-9 hover:cursor-pointer"
        >
          <Download />
          {isExporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </div>

      <TransactionsFilters
        types={types}
        onToggleType={handleToggleType}
        playerId={playerId}
        onPlayerChange={setPlayerId}
        players={players}
      />

      {isLoading ? (
        <TransactionsTableSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-body-sm-medium text-foreground">
              Não foi possível carregar o histórico
            </p>
            <p className="text-body-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setReloadKey((key) => key + 1)}
            className="h-9 hover:cursor-pointer"
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <TransactionsTable transactions={transactions} />
      )}

      {!error ? <TransactionsSummary summary={summary} /> : null}

      <p className="border-t border-border px-4 py-3 text-caption text-muted-foreground">
        Os totais respeitam os filtros. {formatCoins(INITIAL_CLUB_CASH)} + soma
        das variações = caixa atual ({formatCoins(cash)}).
      </p>
    </Card>
  );
}
