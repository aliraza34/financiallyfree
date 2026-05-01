"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isLocalAuthMode, setLocalProfile } from "@/lib/local-session";
import { completeOnboarding } from "@/lib/onboarding";

const onboardingSchema = z.object({
  name: z.string().min(2),
  salaryRupees: z.coerce.number().int().positive(),
  salaryDay: z.coerce.number().int().min(1).max(30),
  debtRupees: z.coerce.number().int().min(0),
  emergencyFundRupees: z.coerce.number().int().min(0),
  freedomTargetRupees: z.coerce.number().int().min(1_000_000),
  islamicMode: z.coerce.boolean().default(true),
  strictMode: z.coerce.boolean().default(false),
});

export async function completeOnboardingAction(formData: FormData) {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    salaryRupees: formData.get("salaryRupees"),
    salaryDay: formData.get("salaryDay"),
    debtRupees: formData.get("debtRupees"),
    emergencyFundRupees: formData.get("emergencyFundRupees"),
    freedomTargetRupees: formData.get("freedomTargetRupees"),
    islamicMode: formData.get("islamicMode") === "on",
    strictMode: formData.get("strictMode") === "on",
  });

  if (!parsed.success) {
    redirect("/onboarding?error=Please check the amounts and salary day.");
  }

  if (isLocalAuthMode()) {
    await setLocalProfile({
      id: user.id,
      ...parsed.data,
    });
    redirect("/dashboard");
  }

  await completeOnboarding({
    userId: user.id,
    ...parsed.data,
  });

  redirect("/dashboard");
}
