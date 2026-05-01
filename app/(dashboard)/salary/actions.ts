"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOnboardedUser } from "@/lib/auth";
import { budgetBuckets } from "@/lib/constants";
import { isLocalAuthMode, setLocalAllocationFromRupees } from "@/lib/local-session";
import { prisma } from "@/lib/prisma";
import { rupeesToPaisa } from "@/lib/pkr";

const allocationSchema = z.object({
  salaryRupees: z.coerce.number().int().positive(),
  needs: z.coerce.number().int().min(0),
  debt: z.coerce.number().int().min(0),
  emergency: z.coerce.number().int().min(0),
  investment: z.coerce.number().int().min(0),
  personal: z.coerce.number().int().min(0),
  buffer: z.coerce.number().int().min(0),
});

export async function updateSalaryAllocationAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const parsed = allocationSchema.safeParse({
    salaryRupees: formData.get("salaryRupees"),
    needs: formData.get("needs"),
    debt: formData.get("debt"),
    emergency: formData.get("emergency"),
    investment: formData.get("investment"),
    personal: formData.get("personal"),
    buffer: formData.get("buffer"),
  });

  if (!parsed.success) {
    redirect("/salary?error=Use whole rupee amounts for salary and all buckets.");
  }

  const { salaryRupees, ...bucketRupees } = parsed.data;
  const allocated = Object.values(bucketRupees).reduce((sum, amount) => sum + amount, 0);

  if (allocated !== salaryRupees) {
    redirect(`/salary?error=${encodeURIComponent("Every rupee must be assigned before confirming salary.")}`);
  }

  if (isLocalAuthMode()) {
    await setLocalAllocationFromRupees(salaryRupees, bucketRupees);
    revalidatePath("/salary");
    revalidatePath("/dashboard");
    redirect("/salary?success=Salary allocation confirmed.");
  }

  const salaryPaisa = rupeesToPaisa(salaryRupees);
  const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  await prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.id },
      data: { salaryPaisa },
    });

    const allocation = await tx.salaryAllocation.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month,
        },
      },
      create: {
        userId: user.id,
        month,
        salaryPaisa,
        status: "CONFIRMED",
      },
      update: {
        salaryPaisa,
        status: "CONFIRMED",
      },
    });

    await tx.bucketAllocation.deleteMany({
      where: {
        userId: user.id,
        salaryAllocationId: allocation.id,
      },
    });

    await tx.bucketAllocation.createMany({
      data: budgetBuckets.map((bucket) => ({
        userId: user.id,
        salaryAllocationId: allocation.id,
        bucket: bucket.key,
        plannedPaisa: rupeesToPaisa(bucketRupees[bucket.key]),
      })),
    });
  });

  revalidatePath("/salary");
  revalidatePath("/dashboard");
  redirect("/salary?success=Salary allocation confirmed.");
}
