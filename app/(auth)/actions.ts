"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabasePublicEnv } from "@/lib/env";
import { clearLocalUser, isLocalAuthMode, setLocalUser } from "@/lib/local-session";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(formData: FormData) {
  if (isLocalAuthMode()) {
    const parsed = authSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect("/login?error=Use a valid email and an 8 character password.");
    }

    const demoEmail = process.env.DEMO_EMAIL ?? "demo@moneymap.local";
    const demoPassword = process.env.DEMO_PASSWORD ?? "password123";

    if (parsed.data.email !== demoEmail || parsed.data.password !== demoPassword) {
      redirect("/login?error=Use the demo credentials from .env.local.");
    }

    await setLocalUser(parsed.data.email);
    redirect("/dashboard");
  }

  if (!hasSupabasePublicEnv()) {
    redirect("/login?error=Add Supabase env values to .env.local before logging in.");
  }

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=Use a valid email and an 8 character password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  if (isLocalAuthMode()) {
    const parsed = authSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect("/register?error=Use a valid email and an 8 character password.");
    }

    await setLocalUser(parsed.data.email);
    redirect("/onboarding");
  }

  if (!hasSupabasePublicEnv()) {
    redirect("/register?error=Add Supabase env values to .env.local before creating an account.");
  }

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?error=Use a valid email and an 8 character password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/onboarding");
}

export async function logoutAction() {
  if (isLocalAuthMode()) {
    await clearLocalUser();
    redirect("/login");
  }

  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
