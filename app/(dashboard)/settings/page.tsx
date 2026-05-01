import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";

export default async function SettingsPage() {
  const { profile } = await requireOnboardedUser();

  return (
    <AppShell active="/settings">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <Card>
        <p className="font-semibold">{profile.name ?? "MoneyMap user"}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Islamic mode: {profile.islamicMode ? "On" : "Off"} | Strict mode: {profile.strictMode ? "On" : "Off"}
        </p>
      </Card>
    </AppShell>
  );
}
