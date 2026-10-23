import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";

type FieldProps = {
  label: string;
  htmlFor: string;
  caption?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, caption, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-body-sm-medium text-foreground">
        {label}
      </label>
      {children}
      {caption ? (
        <p className="text-caption text-muted-foreground">{caption}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  caption?: string;
  value: string;
  min: number;
  max: number;
  error?: string;
  onChange: (value: string) => void;
};

export function NumberField({
  id,
  label,
  caption,
  value,
  min,
  max,
  error,
  onChange,
}: NumberFieldProps) {
  return (
    <Field label={label} htmlFor={id} caption={caption} error={error}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-9! focus-visible:border-primary focus-visible:ring-0"
      />
    </Field>
  );
}
