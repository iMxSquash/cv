// Borders use --palette-gray (3.8:1 on the raised surface): WCAG 1.4.11 for form controls.
const CONTROL = "min-h-11 rounded-lg border border-(--palette-gray) bg-surface-raised text-text";

export const INPUT_CLASS = `${CONTROL} w-full px-3 py-2 aria-invalid:border-red-700`;
export const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-medium text-surface disabled:opacity-50";
export const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-(--palette-gray) px-4 text-text hover:bg-surface-raised disabled:opacity-40";
export const DANGER_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-5 font-medium text-white";
export const LABEL_CLASS = "mb-1 block font-medium";
export const HINT_CLASS = "mt-1 text-caption text-text-muted";
export const ERROR_CLASS = "mt-1 text-caption font-medium text-red-700";
