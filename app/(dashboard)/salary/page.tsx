import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { updateSalaryAllocationAction } from "@/app/(dashboard)/salary/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboardedUser } from "@/lib/auth";
import { budgetBuckets } from "@/lib/constants";
import { getLocalAllocation, isLocalAuthMode } from "@/lib/local-session";
import { formatPKR, paisaToRupees } from "@/lib/pkr";
import { prisma } from "@/lib/prisma";

export default async function SalaryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const { user, profile } = await requireOnboardedUser();
  const allocation = isLocalAuthMode()
    ? await getLocalAllocation(profile)
    : await prisma.salaryAllocation.findFirst({
        where: { userId: user.id },
        orderBy: { month: "desc" },
        include: { bucketAllocations: true },
      });

  const rows = budgetBuckets.map((bucket) => {
    const existing = allocation?.bucketAllocations.find((item) => item.bucket === bucket.key);
    return {
      ...bucket,
      plannedRupees: paisaToRupees(existing?.plannedPaisa ?? 0),
      spentPaisa: existing?.spentPaisa ?? BigInt(0),
    };
  });
  const salaryRupees = paisaToRupees(profile.salaryPaisa);
  const allocatedRupees = rows.reduce((sum, row) => sum + row.plannedRupees, 0);
  const totalDebtRupees = isLocalAuthMode()
    ? 450000
    : paisaToRupees(
        (
          await prisma.debt.aggregate({
            where: { userId: user.id },
            _sum: { remainingAmountPaisa: true },
          })
        )._sum.remainingAmountPaisa ?? 0,
      );

  const investment = rows.find((row) => row.key === "investment")?.plannedRupees ?? 0;
  const emergency = rows.find((row) => row.key === "emergency")?.plannedRupees ?? 0;
  const personal = rows.find((row) => row.key === "personal")?.plannedRupees ?? 0;
  const warnings = [
    totalDebtRupees > 0 && investment > emergency
      ? "Investment is higher than emergency while debt exists."
      : null,
    totalDebtRupees > 0 && salaryRupees > 0 && personal / salaryRupees > 0.2
      ? "Personal bucket is above 20% while debt exists."
      : null,
    allocatedRupees !== salaryRupees ? "Allocation must equal salary before confirmation." : null,
  ].filter(Boolean);

  return (
    <AppShell active="/salary">
      <header className="mb-5">
        <p className="text-sm font-semibold text-[var(--accent)]">Phase 2</p>
        <h1 className="text-2xl font-bold">Salary allocation</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Confirm salary, then give every rupee a job.</p>
      </header>

      <section className="space-y-4">
        {params.error ? (
          <Card className="border-red-200 bg-red-50 text-[var(--danger)]">{params.error}</Card>
        ) : null}
        {params.success ? (
          <Card className="border-green-200 bg-green-50 text-[var(--primary)]">{params.success}</Card>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Salary</p>
            <p className="mt-1 text-xl font-bold">{formatPKR(profile.salaryPaisa)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Assigned</p>
            <p className="mt-1 text-xl font-bold">{formatPKR(allocatedRupees * 100)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Remaining</p>
            <p className="mt-1 text-xl font-bold">{formatPKR((salaryRupees - allocatedRupees) * 100)}</p>
          </Card>
        </div>

        {warnings.length ? (
          <Card className="border-[#e5b45b] bg-[#fff8e7]">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <AlertTriangle aria-hidden className="h-5 w-5 text-[#a35f00]" />
              Review before confirming
            </div>
            <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <div className="flex items-center gap-2 font-bold text-[var(--primary)]">
              <CheckCircle2 aria-hidden className="h-5 w-5" />
              Every rupee is assigned.
            </div>
          </Card>
        )}

        <Card>
          <form action={updateSalaryAllocationAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salaryRupees">Actual salary received</Label>
              <Input id="salaryRupees" name="salaryRupees" type="number" inputMode="numeric" defaultValue={salaryRupees} min={1} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((bucket) => (
                <div key={bucket.key} className="space-y-2">
                  <Label htmlFor={bucket.key}>{bucket.label}</Label>
                  <Input id={bucket.key} name={bucket.key} type="number" inputMode="numeric" defaultValue={bucket.plannedRupees} min={0} required />
                  <p className="text-xs text-[var(--muted-foreground)]">{formatPKR(bucket.spentPaisa)} spent so far</p>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full">
              Confirm allocation
            </Button>
          </form>
        </Card>
      </section>
    </AppShell>
  );
}
