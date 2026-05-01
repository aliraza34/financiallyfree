import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function requireOnboardedUser() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  return { user, profile };
}
