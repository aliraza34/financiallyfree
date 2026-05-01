import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";

export default async function ReportsPage() {
  await requireOnboardedUser();

  return (
    <AppShell active="/reports">
      <h1 className="mb-4 text-2xl font-bold">Reports</h1>
      <Card>
        <p className="font-semibold">Monthly reports arrive in Phase 5.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Core money records will feed this view once phases 2-4 are complete.</p>
      </Card>
    </AppShell>
  );
}
