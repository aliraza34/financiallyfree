import Link from "next/link";
import { WalletCards } from "lucide-react";
import { registerAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <WalletCards aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Start MoneyMap</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Build your PKR system in a few minutes.</p>
          </div>
        </div>
        <Card>
          <form action={registerAction} className="space-y-4">
            {params.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
                {params.error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link className="font-semibold text-[var(--primary)]" href="/login">
              Log in
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
