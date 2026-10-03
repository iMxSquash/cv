"use client";

import { useAdminForm } from "./AdminForm";
import { ERROR_CLASS, HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./styles";

interface FieldProps {
  name: string;
  label: string;
  hint?: string;
}

/** Ids and ARIA wiring shared by every field: hint and error are both announced. */
function useFieldWiring(name: string, hint?: string) {
  const error = useAdminForm().fieldErrors[name];
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return {
    error,
    hintId,
    errorId,
    controlProps: { id: name, name, "aria-describedby": describedBy, "aria-invalid": !!error },
  };
}

function FieldMessages({
  hint,
  hintId,
  error,
  errorId,
}: {
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
}) {
  return (
    <>
      {hint && (
        <p id={hintId} className={HINT_CLASS}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={ERROR_CLASS}>
          {error}
        </p>
      )}
    </>
  );
}

interface TextFieldProps extends FieldProps {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "tel" | "url" | "date" | "number";
  isRequired?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  rows?: number;
  autoComplete?: string;
}

/** Single-line input, or a textarea when `rows` is set. */
export function TextField({
  name,
  label,
  hint,
  defaultValue,
  type = "text",
  isRequired = false,
  maxLength,
  min,
  max,
  rows,
  autoComplete = "off",
}: TextFieldProps) {
  const { controlProps, ...messages } = useFieldWiring(name, hint);
  const shared = {
    ...controlProps,
    defaultValue: defaultValue ?? "",
    required: isRequired,
    maxLength,
    autoComplete,
    className: INPUT_CLASS,
  };
  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
        {!isRequired && <span className="font-normal text-text-muted"> (facultatif)</span>}
      </label>
      {rows ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type={type} min={min} max={max} {...shared} />
      )}
      <FieldMessages hint={hint} {...messages} />
    </div>
  );
}

interface SelectFieldProps extends FieldProps {
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}

export function SelectField({ name, label, hint, options, defaultValue }: SelectFieldProps) {
  const { controlProps, ...messages } = useFieldWiring(name, hint);
  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
      </label>
      <select {...controlProps} defaultValue={defaultValue} required className={INPUT_CLASS}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMessages hint={hint} {...messages} />
    </div>
  );
}

interface CheckboxFieldProps extends FieldProps {
  defaultChecked?: boolean;
}

export function CheckboxField({ name, label, hint, defaultChecked = false }: CheckboxFieldProps) {
  const { controlProps, ...messages } = useFieldWiring(name, hint);
  return (
    <div>
      <div className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          {...controlProps}
          defaultChecked={defaultChecked}
          className="size-5 accent-(--palette-primary-dark)"
        />
        <label htmlFor={name} className="font-medium">
          {label}
        </label>
      </div>
      <FieldMessages hint={hint} {...messages} />
    </div>
  );
}
