"use client";

import { AlertCircle, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Field, NumberField } from "@/components/players/player-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCoins, formatPosition } from "@/lib/format";
import {
  AGE_LIMITS,
  AGILITY_LIMITS,
  AGILITY_MAX_FOR_35_PLUS,
  normalizeName,
  parseInteger,
  validatePlayerName,
} from "@/lib/player-form";
import type { Player, Position } from "@/lib/types";
import { cn } from "@/lib/utils";

const POSITIONS: Position[] = ["GOL", "ZAG", "LAT", "MEI", "ATA"];

type PlayerEditFormValues = {
  name: string;
  position: Position | "";
  age: string;
  agility: string;
};

type EditableField = "name" | "position" | "age" | "agility";

type FormErrors = Partial<Record<EditableField, string>>;

type PlayerUpdatePayload = {
  name: string;
  position: Position;
  age: number;
  agility: number;
};

function formFromPlayer(player: Player): PlayerEditFormValues {
  return {
    name: player.name,
    position: player.position,
    age: String(player.age),
    agility: String(player.agility),
  };
}

function emptyForm(): PlayerEditFormValues {
  return { name: "", position: "", age: "", agility: "" };
}

function validate(values: PlayerEditFormValues, player: Player) {
  const errors: FormErrors = {};
  const nameError = validatePlayerName(values.name);

  if (nameError) {
    errors.name = nameError;
  }

  if (!values.position) {
    errors.position = "Selecione uma posição.";
  } else if (player.club_id !== null && values.position !== player.position) {
    errors.position = "Jogador com clube não muda de posição.";
  }

  const ageRaw = values.age.trim();
  const age = parseInteger(ageRaw);

  if (!ageRaw) {
    errors.age = "Informe a idade.";
  } else if (age === null) {
    errors.age = "Idade deve ser um número inteiro.";
  } else if (age < AGE_LIMITS.min || age > AGE_LIMITS.max) {
    errors.age = `Idade deve estar entre ${AGE_LIMITS.min} e ${AGE_LIMITS.max}.`;
  } else if (age < player.age) {
    errors.age = `A idade não pode ser menor que a atual (${player.age}).`;
  }

  const agilityRaw = values.agility.trim();
  const agility = parseInteger(agilityRaw);

  if (!agilityRaw) {
    errors.agility = "Informe a agilidade.";
  } else if (agility === null) {
    errors.agility = "Agilidade deve ser um número inteiro.";
  } else if (agility < AGILITY_LIMITS.min || agility > AGILITY_LIMITS.max) {
    errors.agility = `Agilidade deve estar entre ${AGILITY_LIMITS.min} e ${AGILITY_LIMITS.max}.`;
  }

  if (
    age !== null &&
    agility !== null &&
    !errors.age &&
    !errors.agility &&
    age >= 35 &&
    agility > AGILITY_MAX_FOR_35_PLUS
  ) {
    errors.agility = `Para jogadores com 35 anos ou mais, a agilidade deve ser no máximo ${AGILITY_MAX_FOR_35_PLUS}.`;
  }

  const hasErrors = Object.keys(errors).length > 0;

  const payload: PlayerUpdatePayload | null = hasErrors
    ? null
    : {
        name: normalizeName(values.name),
        position: values.position as Position,
        age: age as number,
        agility: agility as number,
      };

  return { errors, payload };
}

type PlayerEditDialogProps = {
  player: Player | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (player: Player) => void;
};

export function PlayerEditDialog({
  player,
  onOpenChange,
  onUpdated,
}: PlayerEditDialogProps) {
  const [values, setValues] = useState<PlayerEditFormValues>(() =>
    player ? formFromPlayer(player) : emptyForm(),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastManager = useToast();

  useEffect(() => {
    if (!player) return;

    setValues(formFromPlayer(player));
    setErrors({});
    setApiError(null);
  }, [player]);

  const resetForm = () => {
    setValues(emptyForm());
    setErrors({});
    setApiError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const updateField = (field: EditableField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !player) return;

    const result = validate(values, player);
    setErrors(result.errors);
    setApiError(null);

    if (!result.payload) return;

    setIsSubmitting(true);

    try {
      const updated = await apiFetch<Player>(`/api/v1/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      onUpdated(updated);
      toastManager.add({ title: "Jogador alterado", type: "success" });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPositionLocked = player !== null && player.club_id !== null;

  return (
    <Dialog open={player !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="w-150 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        {player ? (
          <>
            <DialogHeader className="px-6 py-4">
              <DialogTitle className="text-heading-dialog">
                Editar jogador
              </DialogTitle>
              <DialogDescription className="text-body-sm text-muted-foreground">
                Edite nome, posição, idade e agilidade. Os demais dados não
                mudam.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6">
                <Field
                  label="Nome"
                  htmlFor="edit-player-name"
                  caption="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
                  error={errors.name}
                >
                  <Input
                    id="edit-player-name"
                    value={values.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Ex.: João da Silva"
                    maxLength={100}
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "edit-player-name-error" : undefined
                    }
                    className="h-9! focus-visible:border-primary focus-visible:ring-0"
                  />
                </Field>

                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1.5 text-body-sm-medium text-foreground">
                    Posição
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {POSITIONS.map((position) => {
                      const isSelected = values.position === position;
                      const isDisabled =
                        isPositionLocked && position !== player.position;

                      return (
                        <label
                          key={position}
                          className={cn(
                            "flex items-center justify-center rounded-lg border px-2.5 py-2 text-center transition-colors",
                            isSelected
                              ? "border-primary bg-primary-soft text-foreground"
                              : "border-border bg-background text-muted-foreground",
                            isDisabled
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:bg-muted",
                          )}
                        >
                          <input
                            type="radio"
                            name="edit-player-position"
                            value={position}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => updateField("position", position)}
                            className="sr-only"
                          />
                          <span className="flex flex-col">
                            <span className="text-body-sm-semibold text-foreground">
                              {position}
                            </span>
                            <span className="text-caption text-muted-foreground">
                              {formatPosition(position)}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.position ? (
                    <p className="text-caption text-destructive">
                      {errors.position}
                    </p>
                  ) : isPositionLocked ? (
                    <p className="text-caption text-muted-foreground">
                      Jogador com clube não muda de posição.
                    </p>
                  ) : null}
                </fieldset>

                <div className="grid gap-3 sm:grid-cols-2">
                  <NumberField
                    id="edit-player-age"
                    label="Idade"
                    caption={`De ${player.age} a ${AGE_LIMITS.max} anos.`}
                    value={values.age}
                    min={player.age}
                    max={AGE_LIMITS.max}
                    error={errors.age}
                    onChange={(value) => updateField("age", value)}
                  />
                  <NumberField
                    id="edit-player-agility"
                    label="Agilidade"
                    caption={`De ${AGILITY_LIMITS.min} a ${AGILITY_LIMITS.max} (até ${AGILITY_MAX_FOR_35_PLUS} com 35 anos ou mais).`}
                    value={values.agility}
                    min={AGILITY_LIMITS.min}
                    max={AGILITY_LIMITS.max}
                    error={errors.agility}
                    onChange={(value) => updateField("agility", value)}
                  />
                </div>

                <Separator />

                <div
                  role="note"
                  className="flex items-start gap-2.5 rounded-xl border border-dashed border-border bg-muted-subtle px-4 py-3"
                >
                  <Lock
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <p className="text-body-sm text-muted-foreground">
                    Não mudam depois do cadastro: valor base (
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCoins(player.base_value)}
                    </span>
                    ), indicadores e potencial.
                  </p>
                </div>

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

              <DialogFooter className="flex-col items-stretch gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className="h-9 hover:cursor-pointer"
                    />
                  }
                >
                  Cancelar
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

