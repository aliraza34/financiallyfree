import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { budgetBuckets } from "@/lib/constants";
import { getLocalAllocation, getLocalTransactions, isLocalAuthMode } from "@/lib/local-session";
import { formatPKR } from "@/lib/pkr";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { user, profile } = await requireOnboardedUser();
  const allocation = isLocalAuthMode()
    ? await getLocalAllocation(profile)
    : await prisma.salaryAllocation.findFirst({
        where: { userId: user.id },
        orderBy: { month: "desc" },
        include: { bucketAllocations: true },
      });
  const recentTransactions = isLocalAuthMode()
    ? (await getLocalTransactions()).slice(0, 5)
    : await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { occurredOn: "desc" },
        take: 5,
      });

  if (!allocation) {
    redirect("/onboarding");
  }

  const totalPlanned = allocation.bucketAllocations.reduce((sum, bucket) => sum + Number(bucket.plannedPaisa), 0);
  const totalSpent = allocation.bucketAllocations.reduce((sum, bucket) => sum + Number(bucket.spentPaisa), 0);

  return (
    <AppShell active="/dashboard">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">MoneyMap PKR</p>
          <h1 className="text-2xl font-bold">Today&apos;s rupee map</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{profile.name ?? "Your"} budget is bucket-first.</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Log out
          </Button>
        </form>
      </header>

      <section className="space-y-4">
        <Card className="border-[var(--primary)] bg-[#eef8f1]">
          <p className="text-sm font-semibold text-[var(--primary)]">Today&apos;s Action</p>
          <h2 className="mt-1 text-xl font-bold">
            {recentTransactions.length ? "Review your latest spending." : "Add your first transaction."}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {recentTransactions.length
              ? "Bucket spending updates as you log entries."
              : "Use Entries to record where today's rupees went."}
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Allocated</p>
            <p className="mt-1 text-xl font-bold">{formatPKR(totalPlanned)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Spent</p>
            <p className="mt-1 text-xl font-bold">{formatPKR(totalSpent)}</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">Emergency fund</p>
            <p className="mt-1 text-xl font-bold">{formatPKR(profile.emergencyFundPaisa)}</p>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Starter buckets</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {budgetBuckets.map((bucket) => {
              const row = allocation.bucketAllocations.find((item) => item.bucket === bucket.key);
              const planned = Number(row?.plannedPaisa ?? 0);
              const spent = Number(row?.spentPaisa ?? 0);
              const used = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;

              return (
                <Card key={bucket.key}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-bold">{bucket.label}</h3>
                    <span className="text-sm font-semibold text-[var(--muted-foreground)]">{bucket.defaultPercent}%</span>
                  </div>
                  <p className="text-xl font-bold">{formatPKR(planned)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${used}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{formatPKR(spent)} spent</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Recent entries</h2>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <Card>
                <p className="font-semibold">No transactions logged yet.</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Add an entry to start seeing actual bucket spending.</p>
              </Card>
            ) : null}
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{transaction.category}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{transaction.paymentMethod}</p>
                </div>
                <p className="font-bold">{formatPKR(transaction.amountPaisa)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
