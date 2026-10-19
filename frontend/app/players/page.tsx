"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";

import {
  PlayersTable,
  PlayersTableSkeleton,
} from "@/components/players/players-table";
import { PlayersFilters } from "@/components/players/players-filters";
import {
  PlayersScopeTabs,
  type PlayerScope,
  type ScopeCounts,
} from "@/components/players/players-scope-tabs";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type {
  Club,
  PaginatedResponse,
  PaginationMeta,
  Player,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 3;

const scopeParams: Record<PlayerScope, string> = {
  all: "",
  free: "&free=true",
  club: "&free=false",
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const count = Math.min(MAX_PAGE_BUTTONS, totalPages);
  if (count === 0) return [];

  let start = Math.max(1, currentPage - Math.floor((count - 1) / 2));
  if (start + count - 1 > totalPages) {
    start = totalPages - count + 1;
  }

  return Array.from({ length: count }, (_, index) => start + index);
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsById, setClubsById] = useState<Record<number, Club>>({});
  const [scope, setScope] = useState<PlayerScope>("all");
  const [counts, setCounts] = useState<ScopeCounts | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    apiFetch<Club[]>("/api/v1/clubs")
      .then((clubs) => {
        if (!isActive) return;
        setClubs(clubs);
        setClubsById(Object.fromEntries(clubs.map((club) => [club.id, club])));
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      apiFetch<PaginatedResponse<Player>>("/api/v1/players?page=1&limit=1"),
      apiFetch<PaginatedResponse<Player>>(
        "/api/v1/players?page=1&limit=1&free=true",
      ),
      apiFetch<PaginatedResponse<Player>>(
        "/api/v1/players?page=1&limit=1&free=false",
      ),
    ])
      .then(([all, free, club]) => {
        if (!isActive) return;
        setCounts({
          all: all.meta.total_items,
          free: free.meta.total_items,
          club: club.meta.total_items,
        });
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    apiFetch<PaginatedResponse<Player>>(
      `/api/v1/players?page=${page}&limit=${PAGE_SIZE}${scopeParams[scope]}`,
    )
      .then((response) => {
        if (!isActive) return;
        setPlayers(response.data);
        setMeta(response.meta);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setPlayers([]);
        setMeta(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar os jogadores.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [page, reloadKey, scope]);

  const handleScopeChange = (nextScope: PlayerScope) => {
    setScope(nextScope);
    setPage(1);
  };

  const totalPages = meta?.total_pages ?? 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-8 py-4 md:py-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-primary-soft border border-primary rounded-xl flex items-center justify-center">
          <Users className="text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-page text-foreground font-semibold">Jogadores</h1>
          <p className="text-body-sm text-muted-foreground">
            Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.
          </p>
        </div>
      </div>

      <PlayersFilters clubs={clubs} />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <PlayersScopeTabs
            value={scope}
            onValueChange={handleScopeChange}
            counts={counts}
          />
        </div>

        {isLoading ? (
          <PlayersTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="text-body-sm-medium text-foreground">
                Não foi possível carregar os jogadores
              </p>
              <p className="text-body-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <PlayersTable players={players} clubsById={clubsById} />
        )}

        {!isLoading && !error && meta && totalPages > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-caption text-muted-foreground">
              {meta.total_items === 0
                ? "Nenhum jogador"
                : `Mostrando ${(meta.page - 1) * meta.limit + 1}-${Math.min(
                    meta.page * meta.limit,
                    meta.total_items,
                  )} de ${meta.total_items} jogador${meta.total_items === 1 ? "" : "es"}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasPreviousPage}
                className={cn(hasPreviousPage && "hover:cursor-pointer")}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Página ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                    className={cn(
                      "h-8 w-8 border-border bg-background font-medium hover:cursor-pointer",
                    )}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasNextPage}
                className={cn(hasNextPage && "hover:cursor-pointer")}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
