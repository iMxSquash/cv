import type { FieldErrors } from "@/lib/cv/schemas";

/** What a save action sends back to its form: never raw database errors. */
export interface FormState {
  message?: string;
  isSuccess?: boolean;
  fieldErrors?: FieldErrors;
}

export type SaveAction = (previous: FormState, formData: FormData) => Promise<FormState>;

export const INVALID_FORM: FormState = { message: "Certains champs sont invalides." };
export const SAVE_FAILED: FormState = { message: "L'enregistrement a échoué. Réessaie." };
