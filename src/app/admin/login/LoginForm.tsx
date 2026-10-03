"use client";

import { useActionState } from "react";

import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from "@/components/admin/styles";

import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);
  const describedBy = state.error ? "login-error" : undefined;

  return (
    <form action={formAction} className="grid gap-5">
      <div>
        <label htmlFor="email" className={LABEL_CLASS}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-describedby={describedBy}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="password" className={LABEL_CLASS}>
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={describedBy}
          className={INPUT_CLASS}
        />
      </div>
      {state.error && (
        <p id="login-error" role="alert" className="font-medium text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
