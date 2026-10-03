"use server";

import { redirect } from "next/navigation";

import { ADMIN_PATH } from "@/lib/admin/paths";
import { createServerSupabase } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

// Generic on purpose: never reveal whether an account exists. Brute force is throttled by Supabase Auth.
const INVALID_CREDENTIALS = "Identifiants invalides.";

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return { error: INVALID_CREDENTIALS };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { error: INVALID_CREDENTIALS };

  redirect(ADMIN_PATH);
}
