"use client";

import { AlertCircle, AlertTriangle, Check, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LineupFormationSelector } from "@/components/clubs/lineup-formation-selector";
import { LineupPitch } from "@/components/clubs/lineup-pitch";
import { LineupReserves } from "@/components/clubs/lineup-reserves";
import { PlayerConditionBadge } from "@/components/players/player-condition-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import {
  buildLineupSlots,
  DEFAULT_FORMATION,
  fillLineupAssignments,
  getPlayerAttributeUses,
  isLineupComplete,
  selectedPlayerIds,
  type LineupAssignments,
} from "@/lib/lineup";
import type { Formation, Lineup, SquadPlayer } from "@/lib/types";
import { cn } from "@/lib/utils";

type SavedLineup = {
  formation: Formation;
  assignments: LineupAssignments;
};

type ClubLineupTabProps = {
  clubId: number;
  players: SquadPlayer[];
};

function joinNames(names: string[]) {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function ClubLineupTab({ clubId, players }: ClubLineupTabProps) {
  const toastManager = useToast();
  const squadPlayers = useMemo(
    () => players.map(({ player }) => player),
    [players],
  );
  const playersById = useMemo(
    () => new Map(squadPlayers.map((player) => [player.id, player])),
    [squadPlayers],
  );

  const [saved, setSaved] = useState<SavedLineup | null>(null);
  const [formation, setFormation] = useState<Formation>(DEFAULT_FORMATION);
  const [assignments, setAssignments] = useState<LineupAssignments>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    apiFetch<Lineup>(`/api/v1/clubs/${clubId}/lineup`)
      .then((response) => {
        if (!isActive) return;

        const nextFormation = response.formation ?? DEFAULT_FORMATION;
        const nextAssignments = fillLineupAssignments(
          buildLineupSlots(nextFormation),
          response.players,
        );

        setSaved({ formation: nextFormation, assignments: nextAssignments });
        setFormation(nextFormation);
        setAssignments(nextAssignments);
        setApiError(null);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar a escalação.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [clubId, reloadKey]);

  const slots = useMemo(() => buildLineupSlots(formation), [formation]);
  const selectedIds = selectedPlayerIds(assignments);
  const selectedPlayers = squadPlayers.filter((player) =>
    selectedIds.has(player.id),
  );
  const linePlayers = selectedPlayers.filter(
    (player) => player.position !== "GOL",
  );
  const lineIndexById = new Map(
    linePlayers.map((player, index) => [player.id, index]),
  );
  const reserves = squadPlayers.filter((player) => !selectedIds.has(player.id));
  const isComplete = isLineupComplete(slots, assignments);
  const malConditioned = selectedPlayers.filter(
    (player) => player.condition === "MAL_CONDICIONADO",
  );

  const handleFormationChange = (nextFormation: Formation) => {
    setFormation(nextFormation);
    setAssignments((current) => {
      const currentSelected = squadPlayers.filter((player) =>
        selectedPlayerIds(current).has(player.id),
      );

      return fillLineupAssignments(
        buildLineupSlots(nextFormation),
        currentSelected,
      );
    });
    setApiError(null);
  };

  const handleAssign = (slotKey: string, playerId: string) => {
    setAssignments((current) => {
      const next = { ...current };

      if (playerId) {
        for (const key of Object.keys(next)) {
          if (key !== slotKey && next[key] === playerId) {
            next[key] = "";
          }
        }
      }

      next[slotKey] = playerId;
      return next;
    });
    setApiError(null);
  };

  const handleCancel = () => {
    if (!saved) return;

    setFormation(saved.formation);
    setAssignments(saved.assignments);
    setApiError(null);
  };

  const handleSave = async () => {
    if (isSaving) return;

    const playerIds = slots
      .map((slot) => Number(assignments[slot.key]))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (playerIds.length !== slots.length) return;

    setIsSaving(true);
    setApiError(null);

    try {
      const response = await apiFetch<Lineup>(
        `/api/v1/clubs/${clubId}/lineup`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formation, player_ids: playerIds }),
        },
      );

      const nextFormation = response.formation ?? formation;
      const nextAssignments = fillLineupAssignments(
        buildLineupSlots(nextFormation),
        response.players,
      );

      setSaved({ formation: nextFormation, assignments: nextAssignments });
      setFormation(nextFormation);
      setAssignments(nextAssignments);
      toastManager.add({
        title: "Escalação salva",
        description: "Os 5 titulares foram atualizados.",
        type: "success",
      });
    } catch (saveError) {
      setApiError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar a escalação.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="w-full gap-3 p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-56 w-full" />
        </Card>
        <Card className="w-full gap-3 p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="aspect-[3/4] w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 w-full">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-body-sm-medium text-foreground">
              Não foi possível carregar a escalação
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
      </Card>
    );
  }

  return (
    <div className="mt-6 grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="w-full gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading-card text-foreground">Titulares</h2>
            <p className="text-caption text-muted-foreground">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar
              troca os 5 de uma vez.
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-lg px-2 py-0.5 text-caption-medium font-medium",
              isComplete
                ? "border-success-soft-border bg-success-soft text-success-soft-foreground"
                : "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
            )}
          >
            {isComplete ? <Check /> : <AlertTriangle />}
            {isComplete ? "Completa" : "Incompleta"}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <LineupFormationSelector
            value={formation}
            onChange={handleFormationChange}
          />

          <Table>
            <TableHeader className="bg-muted-subtle">
              <TableRow>
                <TableHead className="lg:min-w-20">Vaga</TableHead>
                <TableHead className="lg:min-w-56">Titular</TableHead>
                <TableHead className="lg:min-w-30">Condição</TableHead>
                <TableHead className="lg:min-w-16">Overall</TableHead>
                <TableHead className="lg:min-w-28">
                  Atributos usados
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => {
                const selectedId = assignments[slot.key] ?? "";
                const player = playersById.get(Number(selectedId)) ?? null;
                const lineIndex = player
                  ? lineIndexById.get(player.id) ?? null
                  : null;
                const attributeUses = player
                  ? getPlayerAttributeUses(player, lineIndex)
                  : [];
                const options = squadPlayers
                  .filter(
                    (candidate) =>
                      slot.positions.includes(candidate.position) &&
                      candidate.condition !== "DOENTE",
                  )
                  .map((candidate) => ({
                    value: String(candidate.id),
                    label: `${candidate.name} (${candidate.position})`,
                  }));

                return (
                  <TableRow key={slot.key}>
                    <TableCell className="align-top lg:min-w-20">
                      <div className="flex flex-col">
                        <span className="text-body-sm-medium text-foreground">
                          {slot.label}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {slot.hint}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top lg:min-w-56">
                      <Select
                        value={selectedId || null}
                        onValueChange={(value) =>
                          handleAssign(
                            slot.key,
                            typeof value === "string" ? value : "",
                          )
                        }
                        items={options}
                        disabled={options.length === 0}
                      >
                        <SelectTrigger className="h-9! w-full hover:cursor-pointer">
                          <SelectValue>
                            {(selected: string | null) => {
                              const option = options.find(
                                (item) => item.value === selected,
                              );

                              return (
                                option?.label ??
                                (options.length === 0
                                  ? "Nenhum jogador disponível"
                                  : "Selecionar jogador")
                              );
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="align-top lg:min-w-30">
                      {player ? (
                        <PlayerConditionBadge condition={player.condition} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top tabular-nums lg:min-w-16">
                      {player ? (
                        player.overall
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top lg:min-w-28">
                      {attributeUses.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {attributeUses.map((use) => (
                            <span
                              key={use.label}
                              className="flex items-baseline gap-1 text-body-sm"
                            >
                              <span className="text-muted-foreground">
                                {use.label}
                              </span>
                              <span className="font-medium tabular-nums text-foreground">
                                {use.value}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {malConditioned.length > 0 ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-warning-soft-border bg-warning-soft px-3 py-2 text-body-sm text-warning-soft-foreground"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <div className="flex flex-col gap-0.5">
                <p className="font-medium">
                  {joinNames(malConditioned.map((player) => player.name))}{" "}
                  {malConditioned.length === 1
                    ? "está mal condicionado."
                    : "estão mal condicionados."}
                </p>
                <p>
                  {malConditioned.length === 1
                    ? "Pode jogar, mas cada atributo vale"
                    : "Podem jogar, mas cada atributo vale"}{" "}
                  15% a menos durante a partida.
                </p>
              </div>
            </div>
          ) : null}

          {apiError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2 text-body-sm text-destructive-soft-foreground"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{apiError}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl text-caption text-muted-foreground">
            A escalação vale até ser trocada. Titular vendido ou que fica doente
            sai dela, e o clube só volta a jogar depois de escalar de novo.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-9 hover:cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isComplete}
              className="h-9 hover:cursor-pointer disabled:cursor-not-allowed"
            >
              <Check />
              {isSaving ? "Salvando..." : "Salvar escalação"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="w-full gap-0 overflow-hidden py-0">
          <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
            <h2 className="text-heading-card text-foreground">Em campo</h2>
            <p className="text-caption text-muted-foreground">
              Prévia da formação {formation}, do goleiro ao ataque.
            </p>
          </div>
          <div className="flex flex-col gap-3 px-4 py-3">
            <LineupPitch
              formation={formation}
              assignments={assignments}
              players={squadPlayers}
            />
            <div className="flex items-start gap-2 text-caption text-muted-foreground">
              <Info
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <p>
                Na partida, atacam os 3 jogadores de linha mais avançados e
                defendem os 2 mais recuados. É gol quando o ataque é maior que a
                defesa.
              </p>
            </div>
          </div>
        </Card>

        <LineupReserves players={reserves} />
      </div>
    </div>
  );
}
