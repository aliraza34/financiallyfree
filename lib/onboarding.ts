import { prisma } from "@/lib/prisma";
import { budgetBuckets, systemMilestones } from "@/lib/constants";
import { rupeesToPaisa } from "@/lib/pkr";

export type OnboardingInput = {
  userId: string;
  name: string;
  salaryRupees: number;
  salaryDay: number;
  debtRupees: number;
  emergencyFundRupees: number;
  freedomTargetRupees: number;
  islamicMode: boolean;
  strictMode: boolean;
};

export async function completeOnboarding(input: OnboardingInput) {
  const salaryPaisa = rupeesToPaisa(input.salaryRupees);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: input.userId },
      create: {
        id: input.userId,
        name: input.name,
        salaryPaisa,
        salaryDay: input.salaryDay,
        emergencyFundPaisa: rupeesToPaisa(input.emergencyFundRupees),
        freedomTargetPaisa: rupeesToPaisa(input.freedomTargetRupees),
        islamicMode: input.islamicMode,
        strictMode: input.strictMode,
        onboardingComplete: true,
      },
      update: {
        name: input.name,
        salaryPaisa,
        salaryDay: input.salaryDay,
        emergencyFundPaisa: rupeesToPaisa(input.emergencyFundRupees),
        freedomTargetPaisa: rupeesToPaisa(input.freedomTargetRupees),
        islamicMode: input.islamicMode,
        strictMode: input.strictMode,
        onboardingComplete: true,
      },
    });

    const allocation = await tx.salaryAllocation.upsert({
      where: {
        userId_month: {
          userId: input.userId,
          month,
        },
      },
      create: {
        userId: input.userId,
        month,
        salaryPaisa,
        status: "DRAFT",
      },
      update: {
        salaryPaisa,
      },
    });

    await tx.bucketAllocation.createMany({
      data: budgetBuckets.map((bucket) => ({
        userId: input.userId,
        salaryAllocationId: allocation.id,
        bucket: bucket.key,
        plannedPaisa: Math.round((salaryPaisa * bucket.defaultPercent) / 100),
      })),
      skipDuplicates: true,
    });

    if (input.debtRupees > 0) {
      await tx.debt.create({
        data: {
          userId: input.userId,
          lenderName: "Starting qarza",
          type: "QARZA",
          originalAmountPaisa: rupeesToPaisa(input.debtRupees),
          remainingAmountPaisa: rupeesToPaisa(input.debtRupees),
          monthlyPaymentPaisa: 0,
          urgency: "MEDIUM",
          islamicConcern: true,
          emotionalPressure: "Captured during onboarding",
        },
      });
    }

    await tx.goal.createMany({
      data: systemMilestones.map((milestone, index) => ({
        userId: input.userId,
        title: milestone.title,
        targetPaisa: milestone.targetPaisa,
        currentPaisa: 0,
        type: "SYSTEM",
        sortOrder: index + 1,
      })),
      skipDuplicates: true,
    });
  });
}
