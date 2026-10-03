"use client";

import { useId, useRef } from "react";

import { DANGER_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "./styles";

interface DeleteButtonProps {
  itemTitle: string;
  action: () => Promise<void>;
}

export function DeleteButton({ itemTitle, action }: DeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={SECONDARY_BUTTON_CLASS}
      >
        Supprimer
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-w-sm rounded-2xl bg-surface p-6 text-text shadow-elevation backdrop:bg-black/60"
      >
        <form action={action} className="grid gap-4">
          <h2 id={titleId} className="title-card">
            Supprimer « {itemTitle} » ?
          </h2>
          <p className="text-text-muted">
            La ligne et son image éventuelle disparaissent du CV. Cette action est irréversible.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={SECONDARY_BUTTON_CLASS}
            >
              Annuler
            </button>
            <button type="submit" className={DANGER_BUTTON_CLASS}>
              Supprimer définitivement
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
