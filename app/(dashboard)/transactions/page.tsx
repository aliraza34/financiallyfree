import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";

export default async function TransactionsPage() {
  await requireOnboardedUser();

  return (
    <AppShell active="/transactions">
      <h1 className="mb-4 text-2xl font-bold">Entries</h1>
      <Card>
        <p className="font-semibold">Transaction logging starts in Phase 2.</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">The schema and navigation are ready for quick-add work.</p>
      </Card>
    </AppShell>
  );
}
