"use client";

import {
  AlertCircle,
  CalendarDays,
  Clock,
  Info,
  Loader2,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { PlayerPurchaseSuccess } from "@/components/players/player-purchase-success";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { formatCoins, formatPosition, getInitials } from "@/lib/format";
import {
  getDefaultLoyalty,
  getLoyaltyDateLimits,
  toLoyaltyUntil,
  validateLoyaltyUntil,
} from "@/lib/purchase";
import type { Club, Player, Purchase } from "@/lib/types";

type PurchaseFormValues = {
  clubId: string;
  date: string;
  time: string;
};

type FormErrors = Partial<Record<"clubId" | "loyalty", string>>;

type PurchaseApiError = {
  title: string;
  description: string;
};

function emptyForm(): PurchaseFormValues {
  const defaultLoyalty = getDefaultLoyalty();

  return {
    clubId: "",
    date: defaultLoyalty.date,
    time: defaultLoyalty.time,
  };
}

function validate(values: PurchaseFormValues) {
  const errors: FormErrors = {};

  if (!values.clubId) {
    errors.clubId = "Escolha o clube comprador.";
  }

  const loyaltyError = validateLoyaltyUntil(values.date, values.time);

  if (loyaltyError) {
    errors.loyalty = loyaltyError;
  }

  return errors;
}

function resolveApiError(error: unknown): PurchaseApiError {
  if (error instanceof TypeError) {
    return {
      title: "Sem conexão",
      description:
        "A compra não foi confirmada. Verifique a conexão e tente de novo.",
    };
  }

  return {
    title: "Compra recusada",
    description:
      error instanceof Error
        ? error.message
        : "Não foi possível concluir a compra.",
  };
}

type PlayerPurchaseDialogProps = {
  player: Player | null;
  clubs: Club[];
  onOpenChange: (open: boolean) => void;
  onPurchased: (purchase: Purchase) => void;
};

export function PlayerPurchaseDialog({
  player,
  clubs,
  onOpenChange,
  onPurchased,
}: PlayerPurchaseDialogProps) {
  const [values, setValues] = useState<PurchaseFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<PurchaseApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [purchasedClubName, setPurchasedClubName] = useState("");

  useEffect(() => {
    if (!player) return;

    setValues(emptyForm());
    setErrors({});
    setApiError(null);
    setPurchase(null);
    setPurchasedClubName("");
  }, [player]);

  const selectedClub =
    clubs.find((club) => String(club.id) === values.clubId) ?? null;
  const dateLimits = getLoyaltyDateLimits();
  const clubItems = clubs.map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym}) · caixa ${formatCoins(club.cash)}`,
  }));

  const cashCaption = selectedClub
    ? `Caixa atual: ${formatCoins(selectedClub.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
    : "O custo total (valor + taxa) pode ir até 50% do caixa.";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const updateValue = (
    field: "clubId" | "date" | "time",
    value: string,
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field === "clubId" ? "clubId" : "loyalty"]: undefined,
    }));
    setApiError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !player) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const result = await apiFetch<Purchase>(
        `/api/v1/players/${player.id}/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_id: Number(values.clubId),
            loyalty_until: toLoyaltyUntil(values.date, values.time),
          }),
        },
      );

      setPurchasedClubName(
        clubs.find((club) => club.id === result.club_id)?.name ??
          `Clube #${result.club_id}`,
      );
      setPurchase(result);
      onPurchased(result);
    } catch (error) {
      setApiError(resolveApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={player !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="gap-0 p-0 sm:max-w-lg"
      >
        {player ? (
          purchase ? (
            <PlayerPurchaseSuccess
              playerName={player.name}
              clubName={purchasedClubName}
              purchase={purchase}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <DialogHeader className="gap-1 px-6 py-4">
                <DialogTitle className="text-heading-dialog">
                  Comprar jogador
                </DialogTitle>
                <DialogDescription className="text-body-sm text-muted-foreground">
                  Escolha o clube comprador e até quando vai a fidelidade do
                  contrato.
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
                      {apiError.title}
                    </p>
                    <p className="text-caption text-destructive-soft-foreground">
                      {apiError.description}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted-subtle px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-caption-medium font-semibold text-muted-foreground"
                    >
                      {getInitials(player.name)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-body-sm-semibold text-foreground">
                        {player.name}
                      </span>
                      <span className="truncate text-caption text-muted-foreground">
                        {player.position} · {formatPosition(player.position)} ·{" "}
                        {player.age} anos
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-caption text-muted-foreground">
                      Valor de mercado
                    </span>
                    <span className="text-heading-card text-foreground tabular-nums">
                      {formatCoins(player.market_value)}
                    </span>
                  </div>
                </div>

                <Field
                  label="Clube comprador"
                  htmlFor="purchase-club"
                  caption={cashCaption}
                  error={errors.clubId}
                >
                  <Select
                    value={values.clubId}
                    onValueChange={(value) =>
                      updateValue("clubId", value as string)
                    }
                    items={clubItems}
                    disabled={clubs.length === 0}
                  >
                    <SelectTrigger
                      id="purchase-club"
                      aria-label="Clube comprador"
                      aria-invalid={Boolean(errors.clubId)}
                      aria-describedby={
                        errors.clubId ? "purchase-club-error" : undefined
                      }
                      className="h-9! w-full hover:cursor-pointer"
                    >
                      <Shield className="size-4 shrink-0 text-muted-foreground" />
                      <SelectValue>
                        {(selected: string | null) =>
                          clubItems.find((item) => item.value === selected)
                            ?.label ??
                          (clubs.length === 0
                            ? "Nenhum clube cadastrado"
                            : "Selecione o clube comprador")
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

                <div className="flex flex-col gap-1.5">
                  <span className="text-body-sm-medium text-foreground">
                    Fim da fidelidade
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
                    <div className="relative">
                      <CalendarDays
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="date"
                        aria-label="Data do fim da fidelidade"
                        value={values.date}
                        min={dateLimits.min}
                        max={dateLimits.max}
                        onChange={(event) =>
                          updateValue("date", event.target.value)
                        }
                        aria-invalid={Boolean(errors.loyalty)}
                        aria-describedby={
                          errors.loyalty
                            ? "purchase-loyalty-error"
                            : "purchase-loyalty-caption"
                        }
                        className="h-9! pl-9 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                    <div className="relative">
                      <Clock
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="time"
                        aria-label="Hora do fim da fidelidade"
                        value={values.time}
                        onChange={(event) =>
                          updateValue("time", event.target.value)
                        }
                        aria-invalid={Boolean(errors.loyalty)}
                        aria-describedby={
                          errors.loyalty
                            ? "purchase-loyalty-error"
                            : "purchase-loyalty-caption"
                        }
                        className="h-9! pl-9 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <p
                    id="purchase-loyalty-caption"
                    className="text-caption text-muted-foreground"
                  >
                    Depois do momento da compra e até 1.095 dias. Horário de
                    Brasília; enviado com o fuso (-03:00).
                  </p>
                  {errors.loyalty ? (
                    <p
                      id="purchase-loyalty-error"
                      className="text-caption text-destructive"
                    >
                      {errors.loyalty}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-2 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-muted-foreground">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="text-body-sm">
                    A taxa é de 5% do valor de mercado, só quando ele passa de
                    30,00. Taxa, custo e novo caixa são calculados ao confirmar.
                  </span>
                </div>

                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2 rounded-[10px] border border-border bg-muted-subtle px-3 py-2.5 text-muted-foreground">
                    <Loader2
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-body-sm">
                      Enviando a compra. Os botões ficam desabilitados até a
                      resposta.
                    </span>
                  </div>
                ) : null}
              </div>

              <Separator className="mx-6" />

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
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ShoppingCart />
                  )}
                  {isSubmitting ? "Comprando..." : "Confirmar compra"}
                </Button>
              </DialogFooter>
            </form>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
