"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PlayerAction } from "@/components/players/player-actions-menu";
import { PlayerConditionDialog } from "@/components/players/player-condition-dialog";
import { PlayerCreateDialog } from "@/components/players/player-create-dialog";
import { PlayerCreatedDialog } from "@/components/players/player-created-dialog";
import { PlayerDetailsSheet } from "@/components/players/player-details-sheet";
import { PlayerEditDialog } from "@/components/players/player-edit-dialog";
import { PlayersActiveFilters } from "@/components/players/players-active-filters";
import { PlayersFilters } from "@/components/players/players-filters";
import {
  PlayersScopeTabs,
  type PlayerScope,
  type ScopeCounts,
} from "@/components/players/players-scope-tabs";
import {
  PlayersSort,
  type PlayerSort,
} from "@/components/players/players-sort";
import {
  PlayersTable,
  PlayersTableSkeleton,
} from "@/components/players/players-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import {
  ALL,
  initialPlayersFilters,
  SEARCH_MIN_LENGTH,
  type PlayersFilterValues,
} from "@/lib/player-filters";
import type {
  Club,
  PaginatedResponse,
  PaginationMeta,
  Player,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 3;
const SEARCH_DEBOUNCE_MS = 400;

type PlayersQueryParams = {
  page: number;
  scope: PlayerScope;
  sort: PlayerSort;
  filters: PlayersFilterValues;
  search: string;
};

function buildPlayersQuery({
  page,
  scope,
  sort,
  filters,
  search,
}: PlayersQueryParams) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort,
  });

  if (scope === "free") params.set("free", "true");
  if (scope === "club") params.set("free", "false");

  const searchTerm = search.trim();
  if (searchTerm.length >= SEARCH_MIN_LENGTH) {
    params.set("search", searchTerm);
  }

  if (filters.position !== ALL) params.set("position", filters.position);
  if (filters.condition !== ALL) params.set("condition", filters.condition);
  if (filters.clubId !== ALL && scope !== "free") {
    params.set("club_id", filters.clubId);
  }

  if (filters.ageRange !== ALL) {
    const [minAge, maxAge] = filters.ageRange.split("-");
    params.set("min_age", minAge);
    params.set("max_age", maxAge);
  }

  if (filters.valueRange !== ALL) {
    const [minValue, maxValue] = filters.valueRange.split("-");
    params.set("min_value", minValue);
    params.set("max_value", maxValue);
  }

  return `/api/v1/players?${params.toString()}`;
}

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
  const [sort, setSort] = useState<PlayerSort>("name");
  const [filters, setFilters] = useState<PlayersFilterValues>(
    initialPlayersFilters,
  );
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [counts, setCounts] = useState<ScopeCounts | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdPlayer, setCreatedPlayer] = useState<Player | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [conditionPlayer, setConditionPlayer] = useState<Player | null>(null);

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
    const timeout = setTimeout(
      () => setDebouncedSearch(filters.search),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [filters.search]);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    apiFetch<PaginatedResponse<Player>>(
      buildPlayersQuery({
        page,
        scope,
        sort,
        filters,
        search: debouncedSearch,
      }),
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
  }, [
    debouncedSearch,
    filters.ageRange,
    filters.clubId,
    filters.condition,
    filters.position,
    filters.valueRange,
    page,
    reloadKey,
    scope,
    sort,
  ]);

  const handlePlayerCreated = (player: Player) => {
    setPage(1);
    setReloadKey((key) => key + 1);
    setCreatedPlayer(player);
  };

  const handlePlayerAction = (action: PlayerAction, player: Player) => {
    if (action === "view") setViewingPlayer(player);
    if (action === "edit") setEditingPlayer(player);
    if (action === "condition") setConditionPlayer(player);
  };

  const handleDetailsEdit = (player: Player) => {
    setViewingPlayer(null);
    setEditingPlayer(player);
  };

  const handleDetailsCondition = (player: Player) => {
    setViewingPlayer(null);
    setConditionPlayer(player);
  };

  const handlePlayerUpdated = () => {
    setReloadKey((key) => key + 1);
  };

  const handleScopeChange = (nextScope: PlayerScope) => {
    setScope(nextScope);
    setPage(1);

    if (nextScope === "free" && filters.clubId !== ALL) {
      setFilters((current) => ({ ...current, clubId: ALL }));
    }
  };

  const handleFiltersChange = (nextFilters: PlayersFilterValues) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleSortChange = (nextSort: PlayerSort) => {
    setSort(nextSort);
    setPage(1);
  };

  const viewingPlayerClub =
    viewingPlayer && viewingPlayer.club_id !== null
      ? (clubsById[viewingPlayer.club_id] ?? null)
      : null;

  const totalPages = meta?.total_pages ?? 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-background px-8 py-4 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary-soft border border-primary rounded-xl flex items-center justify-center">
            <Users className="text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-page text-foreground font-semibold">
              Jogadores
            </h1>
            <p className="text-body-sm text-muted-foreground">
              Cadastre jogadores, acompanhe os indicadores e compre os que estão
              livres.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="hover:cursor-pointer h-9"
        >
          <Plus />
          Adicionar jogador
        </Button>
      </div>

      <PlayersFilters
        clubs={clubs}
        values={filters}
        onChange={handleFiltersChange}
        clubFilterDisabled={scope === "free"}
      />

      <PlayersActiveFilters
        values={filters}
        clubs={clubs}
        onChange={handleFiltersChange}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <PlayersScopeTabs
            value={scope}
            onValueChange={handleScopeChange}
            counts={counts}
          />
          <PlayersSort value={sort} onValueChange={handleSortChange} />
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
              className="h-9 hover:cursor-pointer"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <PlayersTable
            players={players}
            clubsById={clubsById}
            onPlayerAction={handlePlayerAction}
          />
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

      <PlayerDetailsSheet
        player={viewingPlayer}
        club={viewingPlayerClub}
        onOpenChange={(open) => {
          if (!open) setViewingPlayer(null);
        }}
        onEdit={handleDetailsEdit}
        onChangeCondition={handleDetailsCondition}
      />

      <PlayerCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handlePlayerCreated}
      />

      <PlayerEditDialog
        player={editingPlayer}
        onOpenChange={(open) => {
          if (!open) setEditingPlayer(null);
        }}
        onUpdated={handlePlayerUpdated}
      />

      <PlayerConditionDialog
        player={conditionPlayer}
        onOpenChange={(open) => {
          if (!open) setConditionPlayer(null);
        }}
        onUpdated={handlePlayerUpdated}
      />

      <PlayerCreatedDialog
        player={createdPlayer}
        onOpenChange={(open) => {
          if (!open) setCreatedPlayer(null);
        }}
      />
    </main>
  );
}
