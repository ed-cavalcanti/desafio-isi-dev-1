"use client";

import { AlertCircle, Plus, Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { ClubCreateDialog } from "@/components/clubs/club-create-dialog";
import { ClubsSort, type ClubSort } from "@/components/clubs/clubs-sort";
import { ClubsTable, ClubsTableSkeleton } from "@/components/clubs/clubs-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { Club } from "@/lib/types";

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [sort, setSort] = useState<ClubSort>("name");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    apiFetch<Club[]>(`/api/v1/clubs?sort=${sort}`)
      .then((response) => {
        if (!isActive) return;
        setClubs(response);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setClubs([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar os clubes.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey, sort]);

  const handleClubCreated = () => {
    setReloadKey((key) => key + 1);
  };

  const handleSortChange = (nextSort: ClubSort) => {
    setSort(nextSort);
  };

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-8 py-4 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary bg-primary-soft">
            <Shield className="text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-page text-foreground font-semibold">
              Clubes
            </h1>
            <p className="text-body-sm text-muted-foreground">
              Cada clube começa com 300,00 em caixa e sem jogadores. A liga
              aceita no máximo 20 clubes.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 hover:cursor-pointer"
        >
          <Plus />
          Adicionar clube
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <span className="text-body-sm-medium text-foreground">
              Clubes da liga
            </span>
          </div>
          <ClubsSort value={sort} onValueChange={handleSortChange} />
        </div>

        {isLoading ? (
          <ClubsTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="text-body-sm-medium text-foreground">
                Não foi possível carregar os clubes
              </p>
              <p className="text-body-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              className="h-9 hover:cursor-pointer"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <ClubsTable clubs={clubs} />
        )}

        {!isLoading && !error ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-caption text-muted-foreground">
              {clubs.length === 0
                ? "Nenhum clube cadastrado"
                : `${clubs.length} clube${clubs.length === 1 ? "" : "s"}`}
            </p>
          </div>
        ) : null}
      </section>

      <ClubCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleClubCreated}
      />
    </main>
  );
}
