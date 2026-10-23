"use client";

import { AlertCircle, ChartBar, Info, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";

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
import { apiFetch } from "@/lib/api";
import { formatPosition } from "@/lib/format";
import {
  PLAYER_ATTRIBUTE_FIELDS,
  type PlayerAttributeField,
} from "@/lib/player-attributes";
import {
  normalizeName,
  parseInteger,
  validatePlayerName,
} from "@/lib/player-form";
import type { Player, Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

const POSITIONS: Position[] = ["GOL", "ZAG", "LAT", "MEI", "ATA"];

type NumericField = "age" | "agility" | PlayerAttributeField | "potential";

type PlayerFormValues = {
  name: string;
  position: Position | "";
} & Record<NumericField, string>;

type FormErrors = Partial<
  Record<keyof PlayerFormValues | "attributes", string>
>;

type PlayerPayload = {
  name: string;
  position: Position;
  age: number;
  agility: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
};

const NUMERIC_FIELDS: NumericField[] = [
  "age",
  "agility",
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
  "potential",
];

const NUMERIC_LIMITS: Record<
  NumericField,
  { label: string; min: number; max: number }
> = {
  age: { label: "Idade", min: 16, max: 45 },
  agility: { label: "Agilidade", min: 1, max: 100 },
  pace: { label: "Velocidade", min: 1, max: 99 },
  shooting: { label: "Finalização", min: 1, max: 99 },
  passing: { label: "Passe", min: 1, max: 99 },
  dribbling: { label: "Drible", min: 1, max: 99 },
  defending: { label: "Defesa", min: 1, max: 99 },
  physical: { label: "Físico", min: 1, max: 99 },
  potential: { label: "Potencial", min: 1, max: 99 },
};

const ATTRIBUTES_SUM_MAX = 480;

function emptyForm(): PlayerFormValues {
  return {
    name: "",
    position: "",
    age: "",
    agility: "",
    pace: "",
    shooting: "",
    passing: "",
    dribbling: "",
    defending: "",
    physical: "",
    potential: "",
  };
}

type AttributePreviewItem = {
  field: NumericField;
  label: string;
  value: number;
};

type AttributePreviewData = {
  attributes: AttributePreviewItem[];
  potential: number;
};

function getAttributePreview(
  values: PlayerFormValues,
): AttributePreviewData | null {
  const attributes: AttributePreviewItem[] = [];

  for (const { field, label } of PLAYER_ATTRIBUTE_FIELDS) {
    const value = parseInteger(values[field].trim());
    const { min, max } = NUMERIC_LIMITS[field];

    if (value === null || value < min || value > max) return null;

    attributes.push({ field, label, value });
  }

  const potential = parseInteger(values.potential.trim());
  const potentialLimits = NUMERIC_LIMITS.potential;

  if (
    potential === null ||
    potential < potentialLimits.min ||
    potential > potentialLimits.max
  ) {
    return null;
  }

  const attributesSum = attributes.reduce(
    (sum, attribute) => sum + attribute.value,
    0,
  );
  const highestAttribute = Math.max(
    ...attributes.map((attribute) => attribute.value),
  );
  const age = parseInteger(values.age.trim());

  if (
    attributesSum > ATTRIBUTES_SUM_MAX ||
    potential < highestAttribute ||
    (age !== null && age >= 33 && potential !== highestAttribute)
  ) {
    return null;
  }

  return { attributes, potential };
}

function validate(values: PlayerFormValues) {
  const errors: FormErrors = {};
  const nameError = validatePlayerName(values.name);
  const name = normalizeName(values.name);

  if (nameError) {
    errors.name = nameError;
  }

  if (!values.position) {
    errors.position = "Selecione uma posição.";
  }

  const numbers = {} as Record<NumericField, number | null>;

  for (const field of NUMERIC_FIELDS) {
    const { label, min, max } = NUMERIC_LIMITS[field];
    const raw = values[field].trim();

    if (!raw) {
      errors[field] = `Informe ${label.toLowerCase()}.`;
      numbers[field] = null;
      continue;
    }

    const parsed = parseInteger(raw);

    if (parsed === null) {
      errors[field] = `${label} deve ser um número inteiro.`;
      numbers[field] = null;
      continue;
    }

    if (parsed < min || parsed > max) {
      errors[field] = `${label} deve estar entre ${min} e ${max}.`;
      numbers[field] = null;
      continue;
    }

    numbers[field] = parsed;
  }

  const age = numbers.age;
  const agility = numbers.agility;

  if (age !== null && agility !== null && age >= 35 && agility > 85) {
    errors.agility =
      "Para jogadores com 35 anos ou mais, a agilidade deve ser no máximo 85.";
  }

  const attributeValues = PLAYER_ATTRIBUTE_FIELDS.map(
    ({ field }) => numbers[field],
  );

  if (attributeValues.every((value): value is number => value !== null)) {
    const attributesSum = attributeValues.reduce(
      (sum, value) => sum + value,
      0,
    );

    if (attributesSum > ATTRIBUTES_SUM_MAX) {
      errors.attributes = `A soma dos seis atributos não pode passar de ${ATTRIBUTES_SUM_MAX}.`;
    }

    const highestAttribute = Math.max(...attributeValues);

    if (
      numbers.potential !== null &&
      !errors.potential &&
      numbers.potential < highestAttribute
    ) {
      errors.potential =
        "O potencial deve ser maior ou igual ao maior dos seis atributos.";
    } else if (
      numbers.potential !== null &&
      !errors.potential &&
      age !== null &&
      age >= 33 &&
      numbers.potential !== highestAttribute
    ) {
      errors.potential =
        "Para jogadores com 33 anos ou mais, o potencial deve ser igual ao maior dos seis atributos.";
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  const payload: PlayerPayload | null = hasErrors
    ? null
    : {
        name,
        position: values.position as Position,
        age: numbers.age as number,
        agility: numbers.agility as number,
        pace: numbers.pace as number,
        shooting: numbers.shooting as number,
        passing: numbers.passing as number,
        dribbling: numbers.dribbling as number,
        defending: numbers.defending as number,
        physical: numbers.physical as number,
        potential: numbers.potential as number,
      };

  return { errors, payload };
}

type AttributePreviewProps = {
  data: AttributePreviewData | null;
};

function AttributePreview({ data }: AttributePreviewProps) {
  return (
    <aside className="flex min-w-61 flex-col gap-3 rounded-xl border border-border bg-muted-subtle p-4">
      <div className="flex gap-2">
        <ChartBar size={14} className="text-muted-foreground" />
        <h3 className="text-caption text-muted-foreground">
          Prévia dos atributos
        </h3>
      </div>

      {data ? (
        <>
          <div className="flex flex-col gap-2.5">
            {data.attributes.map(({ field, label, value }) => (
              <div key={field} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-caption text-muted-foreground">
                  {label}
                </span>
                <div
                  role="progressbar"
                  aria-label={`${label} na prévia`}
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={data.potential}
                  className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-primary/22"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                    style={{ width: `${(value / data.potential) * 100}%` }}
                  />
                </div>
                <span className="w-5 shrink-0 text-right text-caption-medium font-medium tabular-nums text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-auto border-t border-border pt-3 text-caption text-muted-foreground">
            Faixa clara: até o potencial ({data.potential}).
          </p>
        </>
      ) : (
        <p className="text-caption text-muted-foreground">
          Corrija os valores destacados para ver a prévia.
        </p>
      )}
    </aside>
  );
}

type PlayerCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (player: Player) => void;
};

export function PlayerCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: PlayerCreateDialogProps) {
  const [values, setValues] = useState<PlayerFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateName = (name: string) => {
    setValues((current) => ({ ...current, name }));
    setErrors((current) => ({ ...current, name: undefined }));
    setApiError(null);
  };

  const updatePosition = (position: Position) => {
    setValues((current) => ({ ...current, position }));
    setErrors((current) => ({ ...current, position: undefined }));
    setApiError(null);
  };

  const updateNumber = (field: NumericField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      attributes: undefined,
    }));
    setApiError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const result = validate(values);
    setErrors(result.errors);
    setApiError(null);

    if (!result.payload) return;

    setIsSubmitting(true);

    try {
      const created = await apiFetch<Player>("/api/v1/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      onCreated(created);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o jogador.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const attributePreview = getAttributePreview(values);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="w-210 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-heading-dialog">
            Novo jogador
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Preencha os dados e os indicadores técnicos. O valor base, o overall
            e o valor de mercado são calculados ao salvar.
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
              htmlFor="player-name"
              caption="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
              error={errors.name}
            >
              <Input
                id="player-name"
                value={values.name}
                onChange={(event) => updateName(event.target.value)}
                placeholder="Ex.: João da Silva"
                maxLength={100}
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "player-name-error" : undefined}
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

                  return (
                    <label
                      key={position}
                      className={cn(
                        "flex cursor-pointer items-center justify-center text-center rounded-lg border px-2.5 py-2 transition-colors",
                        isSelected
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <input
                        type="radio"
                        name="player-position"
                        value={position}
                        checked={isSelected}
                        onChange={() => updatePosition(position)}
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
              ) : null}
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField
                id="player-age"
                label="Idade"
                caption="De 16 a 45 anos."
                value={values.age}
                min={NUMERIC_LIMITS.age.min}
                max={NUMERIC_LIMITS.age.max}
                error={errors.age}
                onChange={(value) => updateNumber("age", value)}
              />
              <NumberField
                id="player-agility"
                label="Agilidade"
                caption="De 1 a 100 (até 85 com 35 anos ou mais)."
                value={values.agility}
                min={NUMERIC_LIMITS.agility.min}
                max={NUMERIC_LIMITS.agility.max}
                error={errors.agility}
                onChange={(value) => updateNumber("agility", value)}
              />
              <LockedField
                id="player-base-value"
                label="Valor base (moedas)"
                caption="Calculado no cadastro."
                value="Após salvar"
              />
            </div>
            
              <Separator />

            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-heading-card text-foreground">
                  Indicadores técnicos
                </h2>
                <p className="text-body-sm text-muted-foreground">
                  Seis atributos e o potencial, de 1 a 99. Não mudam depois do
                  cadastro; a soma dos seis atributos não pode passar de 480.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15.25rem]">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PLAYER_ATTRIBUTE_FIELDS.map(({ field, label }) => (
                      <NumberField
                        key={field}
                        id={`player-${field}`}
                        label={label}
                        value={values[field]}
                        min={NUMERIC_LIMITS[field].min}
                        max={NUMERIC_LIMITS[field].max}
                        error={errors[field]}
                        onChange={(value) => updateNumber(field, value)}
                      />
                    ))}
                    <NumberField
                      id="player-potential"
                      label="Potencial"
                      caption="≥ maior atributo; igual a ele com 33+ anos"
                      value={values.potential}
                      min={NUMERIC_LIMITS.potential.min}
                      max={NUMERIC_LIMITS.potential.max}
                      error={errors.potential}
                      onChange={(value) => updateNumber("potential", value)}
                    />
                    <LockedField
                      id="player-overall"
                      label="Overall"
                      caption="Calculado automaticamente."
                      value="Após salvar"
                    />
                  </div>
                  {errors.attributes ? (
                    <p className="text-caption text-destructive">
                      {errors.attributes}
                    </p>
                  ) : null}
                </div>

                <AttributePreview data={attributePreview} />
              </div>
            </section>

            {apiError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2 text-body-sm text-destructive-soft-foreground"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{apiError}</p>
              </div>
            ) : null}
            <Separator />
          </div>

          <DialogFooter className="flex-col items-stretch gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <Info className="size-4 shrink-0 " />O jogador começa livre e
              apto.
            </p>
            <div className="flex items-center gap-2">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="hover:cursor-pointer h-9"
                  />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="hover:cursor-pointer disabled:cursor-not-allowed h-9"
              >
                {isSubmitting ? "Salvando..." : "Salvar jogador"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type LockedFieldProps = {
  id: string;
  label: string;
  caption?: string;
  value: string;
};

function LockedField({ id, label, caption, value }: LockedFieldProps) {
  return (
    <Field label={label} htmlFor={id} caption={caption}>
      <div className="relative">
        <Input
          id={id}
          value={value}
          readOnly
          disabled
          className="h-9! pl-8 text-muted-foreground disabled:bg-muted disabled:opacity-100"
        />
        <Lock
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </Field>
  );
}
