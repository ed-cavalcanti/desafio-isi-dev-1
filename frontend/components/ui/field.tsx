import type { ReactNode } from "react";

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
