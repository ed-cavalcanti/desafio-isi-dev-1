import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export { Field } from "@/components/ui/field";

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
