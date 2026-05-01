import { Plus, Search, Trash2 } from "lucide-react";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/(dashboard)/transactions/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboardedUser } from "@/lib/auth";
import { budgetBuckets, pakistanCategories, pakistanPaymentMethods } from "@/lib/constants";
import { getLocalTransactions, isLocalAuthMode } from "@/lib/local-session";
import { formatPKR, paisaToRupees } from "@/lib/pkr";
import { prisma } from "@/lib/prisma";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function TransactionFields({
  transaction,
  compact = false,
}: {
  transaction?: {
    id?: string;
    type: string;
    amountPaisa: bigint | number;
    category: string;
    bucket: string;
    paymentMethod: string;
    occurredOn: string | Date;
    note?: string | null;
    isPlanned: boolean;
    isRecurring: boolean;
    emotionalTrigger?: string | null;
    moneyType: string;
  };
  compact?: boolean;
}) {
  const occurredOn =
    transaction?.occurredOn instanceof Date
      ? transaction.occurredOn.toISOString().slice(0, 10)
      : transaction?.occurredOn ?? today();

  return (
    <div className={compact ? "grid gap-3" : "grid gap-4 sm:grid-cols-2"}>
      {transaction?.id ? <input name="id" type="hidden" value={transaction.id} /> : null}
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input name="amountRupees" type="number" inputMode="numeric" min={1} defaultValue={paisaToRupees(transaction?.amountPaisa ?? 0) || ""} required />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <select name="type" defaultValue={transaction?.type ?? "EXPENSE"} className="min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3">
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <select name="category" defaultValue={transaction?.category ?? "Groceries"} className="min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3">
          {pakistanCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Bucket</Label>
        <select name="bucket" defaultValue={transaction?.bucket ?? "needs"} className="min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3">
          {budgetBuckets.map((bucket) => (
            <option key={bucket.key} value={bucket.key}>
              {bucket.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Payment</Label>
        <select name="paymentMethod" defaultValue={transaction?.paymentMethod ?? "Cash"} className="min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3">
          {pakistanPaymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input name="occurredOn" type="date" defaultValue={occurredOn} required />
      </div>
      <div className="space-y-2">
        <Label>Emotional trigger</Label>
        <Input name="emotionalTrigger" defaultValue={transaction?.emotionalTrigger ?? ""} placeholder="Stress, family, friends..." />
      </div>
      <div className="space-y-2">
        <Label>Money type</Label>
        <Input name="moneyType" defaultValue={transaction?.moneyType ?? "cash"} />
      </div>
      <div className={compact ? "space-y-2" : "space-y-2 sm:col-span-2"}>
        <Label>Note</Label>
        <Input name="note" defaultValue={transaction?.note ?? ""} placeholder="Optional" />
      </div>
      <div className="flex gap-4 text-sm font-semibold">
        <label className="flex items-center gap-2">
          <input name="isPlanned" type="checkbox" defaultChecked={transaction?.isPlanned ?? false} className="h-5 w-5 accent-[var(--primary)]" />
          Planned
        </label>
        <label className="flex items-center gap-2">
          <input name="isRecurring" type="checkbox" defaultChecked={transaction?.isRecurring ?? false} className="h-5 w-5 accent-[var(--primary)]" />
          Recurring
        </label>
      </div>
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const { user } = await requireOnboardedUser();
  const query = (params.q ?? "").trim().toLowerCase();
  const transactions = isLocalAuthMode()
    ? await getLocalTransactions()
    : await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { occurredOn: "desc" },
        take: 50,
      });
  const filtered = transactions.filter((transaction) => {
    if (!query) {
      return true;
    }

    return [
      transaction.category,
      transaction.bucket,
      transaction.paymentMethod,
      transaction.note,
      transaction.emotionalTrigger,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <AppShell active="/transactions">
      <header className="mb-5">
        <p className="text-sm font-semibold text-[var(--accent)]">Phase 2</p>
        <h1 className="text-2xl font-bold">Entries</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Quick-add a transaction, then search or edit it below.</p>
      </header>

      <section className="space-y-4">
        {params.error ? <Card className="border-red-200 bg-red-50 text-[var(--danger)]">{params.error}</Card> : null}
        {params.success ? <Card className="border-green-200 bg-green-50 text-[var(--primary)]">{params.success}</Card> : null}

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Plus aria-hidden className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold">Quick add</h2>
          </div>
          <form action={createTransactionAction} className="space-y-4">
            <TransactionFields />
            <Button type="submit" className="w-full">
              Add transaction
            </Button>
          </form>
        </Card>

        <Card>
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search aria-hidden className="absolute left-3 top-3 h-5 w-5 text-[var(--muted-foreground)]" />
              <Input name="q" defaultValue={params.q ?? ""} className="pl-10" placeholder="Search category, note, payment..." />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <p className="font-semibold">No entries yet.</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Add one expense above to see bucket spending update.</p>
            </Card>
          ) : null}

          {filtered.map((transaction) => {
            const isUnknown = transaction.category === "Unknown";
            return (
              <Card key={transaction.id} className={isUnknown ? "border-[#e5b45b] bg-[#fff8e7]" : ""}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{transaction.category}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {transaction.paymentMethod} | {transaction.bucket} |{" "}
                      {transaction.occurredOn instanceof Date
                        ? transaction.occurredOn.toISOString().slice(0, 10)
                        : transaction.occurredOn}
                    </p>
                    {isUnknown ? <p className="mt-1 text-sm font-semibold text-[#a35f00]">Needs category review</p> : null}
                  </div>
                  <p className="text-lg font-bold">{formatPKR(transaction.amountPaisa)}</p>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm font-bold text-[var(--primary)]">Edit details</summary>
                  <form action={updateTransactionAction} className="mt-4 space-y-4">
                    <TransactionFields transaction={transaction} compact />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Save
                      </Button>
                    </div>
                  </form>
                  <form action={deleteTransactionAction} className="mt-2">
                    <input name="id" type="hidden" value={transaction.id} />
                    <Button type="submit" variant="secondary" className="w-full text-[var(--danger)]">
                      <Trash2 aria-hidden className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </details>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
