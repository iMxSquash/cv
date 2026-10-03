"use client";

import { PRIMARY_BUTTON_CLASS } from "@/components/admin/styles";

// The error message and stack stay in the server logs; the digest links the two.
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="grid max-w-xl justify-items-start gap-4">
      <h1 className="title-card">Une erreur est survenue</h1>
      <p className="text-text-muted">
        L&apos;opération a échoué. Réessaie, ou consulte les logs serveur
        {error.digest ? ` (référence ${error.digest})` : ""}.
      </p>
      <button type="button" onClick={retry} className={PRIMARY_BUTTON_CLASS}>
        Réessayer
      </button>
    </div>
  );
}
