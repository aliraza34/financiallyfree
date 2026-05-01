import { redirect } from "next/navigation";
import { ShieldCheck, WalletCards } from "lucide-react";
import { completeOnboardingAction } from "@/app/(onboarding)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, requireUser } from "@/lib/auth";
import { budgetBuckets } from "@/lib/constants";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const params = await searchParams;

  if (profile?.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <WalletCards aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Set up your rupee map</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Five steps, built for salary-first budgeting.</p>
          </div>
        </div>
      </header>

      <form action={completeOnboardingAction} className="space-y-4">
        {params.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
            {params.error}
          </p>
        ) : null}

        <Card>
          <p className="mb-1 text-xs font-bold uppercase text-[var(--accent)]">Step 1</p>
          <h2 className="mb-4 text-lg font-bold">Salary basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={profile?.name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryRupees">Monthly salary</Label>
              <Input id="salaryRupees" name="salaryRupees" type="number" inputMode="numeric" defaultValue={180000} min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryDay">Salary day</Label>
              <Input id="salaryDay" name="salaryDay" type="number" inputMode="numeric" defaultValue={1} min={1} max={30} required />
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-1 text-xs font-bold uppercase text-[var(--accent)]">Step 2</p>
          <h2 className="mb-4 text-lg font-bold">Starting position</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="debtRupees">Debt / qarza</Label>
              <Input id="debtRupees" name="debtRupees" type="number" inputMode="numeric" defaultValue={450000} min={0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyFundRupees">Emergency fund</Label>
              <Input id="emergencyFundRupees" name="emergencyFundRupees" type="number" inputMode="numeric" defaultValue={0} min={0} required />
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-1 text-xs font-bold uppercase text-[var(--accent)]">Step 3</p>
          <h2 className="mb-4 text-lg font-bold">Freedom target</h2>
          <div className="space-y-2">
            <Label htmlFor="freedomTargetRupees">Target net worth</Label>
            <Input id="freedomTargetRupees" name="freedomTargetRupees" type="number" inputMode="numeric" defaultValue={50000000} min={1000000} required />
          </div>
        </Card>

        <Card>
          <p className="mb-1 text-xs font-bold uppercase text-[var(--accent)]">Step 4</p>
          <h2 className="mb-4 text-lg font-bold">Preferences</h2>
          <div className="grid gap-3">
            <label className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-white px-3 py-2">
              <span className="font-semibold">Islamic mode</span>
              <input name="islamicMode" type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--primary)]" />
            </label>
            <label className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-white px-3 py-2">
              <span className="font-semibold">Strict mode warnings</span>
              <input name="strictMode" type="checkbox" className="h-5 w-5 accent-[var(--primary)]" />
            </label>
          </div>
        </Card>

        <Card>
          <p className="mb-1 text-xs font-bold uppercase text-[var(--accent)]">Step 5</p>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck aria-hidden className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold">Allocation preview</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {budgetBuckets.map((bucket) => (
              <div key={bucket.key} className="rounded-md bg-[var(--muted)] px-3 py-2">
                <p className="font-semibold">{bucket.label}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{bucket.defaultPercent}% starter allocation</p>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Finish setup
        </Button>
      </form>
    </main>
  );
}
