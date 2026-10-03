"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FormState, SaveAction } from "@/lib/admin/form-state";
import type { FieldErrors } from "@/lib/cv/schemas";

import { ERROR_CLASS, PRIMARY_BUTTON_CLASS } from "./styles";

interface FormContextValue {
  fieldErrors: FieldErrors;
  setIsUploading: (isUploading: boolean) => void;
}

const FormContext = createContext<FormContextValue>({
  fieldErrors: {},
  setIsUploading: () => {},
});

export function useAdminForm(): FormContextValue {
  return use(FormContext);
}

const INITIAL_STATE: FormState = {};

// Stable identity: consumers can tell a new server response from a mere re-render.
const NO_ERRORS: FieldErrors = {};

interface AdminFormProps {
  action: SaveAction;
  children: React.ReactNode;
}

/**
 * Submits through `onSubmit` rather than the `action` prop: React resets a form
 * after an action, which would wipe what was typed when the server rejects it.
 */
export function AdminForm({ action, children }: AdminFormProps) {
  const [state, dispatch, isPending] = useActionState(action, INITIAL_STATE);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Server-side rejections land on the first invalid field, as native validation would.
  useEffect(() => {
    if (state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  return (
    <FormContext value={{ fieldErrors: state.fieldErrors ?? NO_ERRORS, setIsUploading }}>
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(() => dispatch(formData));
        }}
        className="grid max-w-2xl gap-5"
      >
        {children}
        {state.message && (
          <p
            role={state.isSuccess ? "status" : "alert"}
            className={state.isSuccess ? "font-medium text-accent" : ERROR_CLASS}
          >
            {state.message}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </FormContext>
  );
}
