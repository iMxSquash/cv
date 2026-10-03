import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

// Signed-in visitors never reach this page: the proxy sends them to /admin.
export default function LoginPage() {
  return (
    <main
      id="content"
      className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6 py-10"
    >
      <h1 className="title-card">Administration du CV</h1>
      <LoginForm />
    </main>
  );
}
