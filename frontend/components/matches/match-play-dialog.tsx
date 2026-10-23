"use client";

import { AlertCircle, Swords } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import type { Club, Match } from "@/lib/types";

type MatchFormValues = {
  homeClubId: string;
  awayClubId: string;
};

type FormErrors = Partial<Record<keyof MatchFormValues, string>>;

function emptyForm(): MatchFormValues {
  return { homeClubId: "", awayClubId: "" };
}

function validate(values: MatchFormValues) {
  const errors: FormErrors = {};

  if (!values.homeClubId) {
    errors.homeClubId = "Escolha o clube mandante.";
  }

  if (!values.awayClubId) {
    errors.awayClubId = "Escolha o clube visitante.";
  } else if (values.homeClubId === values.awayClubId) {
    errors.awayClubId = "O visitante precisa ser diferente do mandante.";
  }

  return errors;
}

type MatchPlayDialogProps = {
  open: boolean;
  clubs: Club[];
  onOpenChange: (open: boolean) => void;
  onPlayed: (match: Match) => void;
};

export function MatchPlayDialog({
  open,
  clubs,
  onOpenChange,
  onPlayed,
}: MatchPlayDialogProps) {
  const [values, setValues] = useState<MatchFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clubItems = clubs.map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym})`,
  }));

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

  const updateValue = (field: keyof MatchFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const match = await apiFetch<Match>("/api/v1/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_club_id: Number(values.homeClubId),
          away_club_id: Number(values.awayClubId),
        }),
      });

      resetForm();
      onPlayed(match);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível jogar a partida.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="gap-0 p-0 sm:max-w-lg"
      >
        <DialogHeader className="gap-1 px-6 py-4">
          <DialogTitle className="text-heading-dialog">Nova partida</DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Escolha o mandante e o visitante. Os dois clubes precisam estar com a
            escalação completa.
          </DialogDescription>
        </DialogHeader>

        {apiError ? (
          <div
            role="alert"
            className="mx-6 mb-4 flex items-start gap-2 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive-soft-foreground" />
            <div className="flex flex-col gap-0.5">
              <p className="text-body-sm-medium text-destructive-soft-foreground">
                Não foi possível jogar a partida
              </p>
              <p className="text-caption text-destructive-soft-foreground">
                {apiError}
              </p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <Field
              label="Mandante"
              htmlFor="match-home-club"
              error={errors.homeClubId}
            >
              <Select
                value={values.homeClubId}
                onValueChange={(value) =>
                  updateValue("homeClubId", value as string)
                }
                items={clubItems}
              >
                <SelectTrigger
                  id="match-home-club"
                  aria-label="Clube mandante"
                  aria-invalid={Boolean(errors.homeClubId)}
                  className="h-9! w-full hover:cursor-pointer"
                >
                  <SelectValue>
                    {(selected: string | null) =>
                      clubItems.find((item) => item.value === selected)?.label ??
                      "Selecione o clube mandante"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-auto! min-w-(--anchor-width)">
                  {clubItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Visitante"
              htmlFor="match-away-club"
              error={errors.awayClubId}
            >
              <Select
                value={values.awayClubId}
                onValueChange={(value) =>
                  updateValue("awayClubId", value as string)
                }
                items={clubItems}
              >
                <SelectTrigger
                  id="match-away-club"
                  aria-label="Clube visitante"
                  aria-invalid={Boolean(errors.awayClubId)}
                  className="h-9! w-full hover:cursor-pointer"
                >
                  <SelectValue>
                    {(selected: string | null) =>
                      clubItems.find((item) => item.value === selected)?.label ??
                      "Selecione o clube visitante"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-auto! min-w-(--anchor-width)">
                  {clubItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center justify-center gap-1 rounded-[10px] border border-border bg-muted-subtle px-2.5 py-3 text-muted-foreground">
              <Swords size={16} />
              <span className="text-body-sm">
                O placar é calculado pelos atributos dos titulares.
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
                {isSubmitting ? "Jogando..." : "Jogar partida"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
