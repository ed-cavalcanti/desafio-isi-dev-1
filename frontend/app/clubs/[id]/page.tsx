"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ClubDetailsHeader } from "@/components/clubs/club-details-header";
import { ClubDetailsTabs } from "@/components/clubs/club-details-tabs";
import {
  ClubSummaryCards,
  ClubSummaryCardsSkeleton,
} from "@/components/clubs/club-summary-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { ClubDetails, ClubTransactions } from "@/lib/types";

function ClubDetailsHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-9 w-40 rounded-lg" />
    </div>
  );
}

export default function ClubDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);
    setTransactionCount(null);

    apiFetch<ClubDetails>(`/api/v1/clubs/${id}`)
      .then((response) => {
        if (!isActive) return;
        setClub(response);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setClub(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar o clube.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    apiFetch<ClubTransactions>(`/api/v1/clubs/${id}/transactions`)
      .then((response) => {
        if (!isActive) return;
        setTransactionCount(response.data.length);
      })
      .catch(() => {
        if (isActive) setTransactionCount(null);
      });

    return () => {
      isActive = false;
    };
  }, [id, reloadKey]);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-8 py-4 md:py-6">
      {isLoading ? (
        <>
          <ClubDetailsHeaderSkeleton />
          <ClubSummaryCardsSkeleton />
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-body-sm-medium text-foreground">
              Não foi possível carregar o clube
            </p>
            <p className="text-body-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              className="h-9 hover:cursor-pointer"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Tentar novamente
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/clubs" />}
              className="h-9 hover:cursor-pointer"
            >
              <ArrowLeft />
              Voltar para os clubes
            </Button>
          </div>
        </div>
      ) : club ? (
        <>
          <ClubDetailsHeader club={club} />
          <ClubSummaryCards club={club} />
          <ClubDetailsTabs
            clubId={club.id}
            cash={club.cash}
            players={club.players}
            transactionCount={transactionCount}
          />
        </>
      ) : null}
    </main>
  );
}
