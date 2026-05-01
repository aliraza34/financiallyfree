import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { formatPKR } from "@/lib/pkr";

export default async function SalaryPage() {
  const { profile } = await requireOnboardedUser();

  return (
    <AppShell active="/salary">
      <h1 className="mb-4 text-2xl font-bold">Salary</h1>
      <Card>
        <p className="text-sm text-[var(--muted-foreground)]">Monthly salary</p>
        <p className="mt-1 text-2xl font-bold">{formatPKR(profile.salaryPaisa)}</p>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">Salary day: {profile.salaryDay}</p>
      </Card>
    </AppShell>
  );
}
