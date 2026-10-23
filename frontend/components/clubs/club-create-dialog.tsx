"use client";

import { AlertCircle, Shield, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";

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
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import {
  CLUB_NAME_LIMITS,
  normalizeName,
  validateClubAcronym,
  validateClubName,
} from "@/lib/club-form";
import { formatCoins } from "@/lib/format";
import type { Club } from "@/lib/types";
import { Separator } from "../ui/separator";

type ClubFormValues = {
  name: string;
  acronym: string;
};

type FormErrors = Partial<Record<keyof ClubFormValues, string>>;

type ClubPayload = {
  name: string;
  acronym: string;
};

type ClubApiError = {
  title: string;
  description: string;
  field?: keyof ClubFormValues;
};

const CREATE_CLUB_ERROR_TITLE = "Não foi possível criar o clube";

function emptyForm(): ClubFormValues {
  return { name: "", acronym: "" };
}

function validate(values: ClubFormValues) {
  const errors: FormErrors = {};
  const nameError = validateClubName(values.name);
  const acronymError = validateClubAcronym(values.acronym, values.name);

  if (nameError) errors.name = nameError;
  if (acronymError) errors.acronym = acronymError;

  const payload: ClubPayload | null =
    Object.keys(errors).length > 0
      ? null
      : { name: normalizeName(values.name), acronym: values.acronym };

  return { errors, payload };
}

type ClubCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (club: Club) => void;
};

export function ClubCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ClubCreateDialogProps) {
  const [values, setValues] = useState<ClubFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<ClubApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastManager = useToast();

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
    setErrors((current) => ({
      ...current,
      name: undefined,
      acronym: undefined,
    }));
    setApiError(null);
  };

  const updateAcronym = (acronym: string) => {
    setValues((current) => ({ ...current, acronym: acronym.toUpperCase() }));
    setErrors((current) => ({ ...current, acronym: undefined }));
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
      const created = await apiFetch<Club>("/api/v1/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      toastManager.add({
        title: "Clube cadastrado",
        description: `${created.name} (${created.acronym}) entrou na liga com ${formatCoins(created.cash)} em caixa.`,
        type: "success",
      });
      onCreated(created);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o clube.";
      const isNameConflict = description.startsWith(
        "Já existe um clube com esse nome",
      );

      setApiError({
        title: CREATE_CLUB_ERROR_TITLE,
        description: isNameConflict
          ? `Já existe um clube com o nome “${normalizeName(values.name)}”.`
          : description,
        field: isNameConflict ? "name" : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNameConflict = apiError?.field === "name";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="gap-0 p-0 sm:max-w-lg"
      >
        <DialogHeader className="gap-1 px-6 py-4">
          <DialogTitle className="text-heading-dialog">Novo clube</DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Informe o nome e a sigla. O clube começa com 300,00 em caixa.
          </DialogDescription>
        </DialogHeader>

        {apiError ? (
          <div
            id="club-create-error"
            role="alert"
            className="mx-6 mb-4 flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive-soft-foreground" />
            <div className="flex flex-col gap-0.5">
              <p className="text-body-sm-medium text-destructive-soft-foreground">
                {apiError.title}
              </p>
              <p className="text-caption text-destructive-soft-foreground">
                {apiError.description}
              </p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <Field
              label="Nome"
              htmlFor="club-name"
              caption="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
              error={errors.name}
            >
              <div className="relative">
                <Input
                  id="club-name"
                  value={values.name}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="Ex.: Santa Cruz Clube"
                  maxLength={CLUB_NAME_LIMITS.max}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.name) || hasNameConflict}
                  aria-describedby={
                    errors.name
                      ? "club-name-error"
                      : hasNameConflict
                        ? "club-create-error"
                        : undefined
                  }
                  className="h-9! pl-8 focus-visible:border-primary focus-visible:ring-0 aria-invalid:ring-0"
                />
                <Shield
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </Field>

            <Field
              label="Sigla"
              htmlFor="club-acronym"
              caption="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
              error={errors.acronym}
            >
              <Input
                id="club-acronym"
                value={values.acronym}
                onChange={(event) => updateAcronym(event.target.value)}
                placeholder="Ex.: SPF"
                maxLength={3}
                autoComplete="off"
                aria-invalid={Boolean(errors.acronym)}
                aria-describedby={
                  errors.acronym ? "club-acronym-error" : undefined
                }
                className="h-9! uppercase focus-visible:border-primary focus-visible:ring-0"
              />
            </Field>

            <div className="flex text-muted-foreground gap-1 items-center bg-muted-subtle px-2.5 py-3 justify-center border border-border rounded-[10px]">
              <Wallet size={16} />
              <span className="text-body-sm">
                O clube começa com 300,00 em caixa e sem jogadores.
              </span>
            </div>
          </div>

          <Separator className="mx-6" />

          <DialogFooter className="flex justify-end gap-3 px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex justify-end gap-2">
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
                {isSubmitting ? "Criando..." : "Criar clube"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
