import { cookies } from "next/headers";
import { budgetBuckets } from "@/lib/constants";
import { rupeesToPaisa } from "@/lib/pkr";

const userCookie = "moneymap_demo_user";
const profileCookie = "moneymap_demo_profile";
const allocationCookie = "moneymap_demo_allocation";
const transactionsCookie = "moneymap_demo_transactions";

export type LocalProfile = {
  id: string;
  name: string | null;
  salaryPaisa: bigint;
  salaryDay: number;
  emergencyFundPaisa: bigint;
  freedomTargetPaisa: bigint;
  islamicMode: boolean;
  strictMode: boolean;
  onboardingComplete: boolean;
};

type StoredProfile = Omit<
  LocalProfile,
  "salaryPaisa" | "emergencyFundPaisa" | "freedomTargetPaisa"
> & {
  salaryPaisa: string;
  emergencyFundPaisa: string;
  freedomTargetPaisa: string;
};

export type LocalBucketAllocation = {
  bucket: string;
  plannedPaisa: bigint;
  spentPaisa: bigint;
};

type StoredBucketAllocation = {
  bucket: string;
  plannedPaisa: string;
};

export type LocalTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amountPaisa: bigint;
  category: string;
  bucket: string;
  paymentMethod: string;
  occurredOn: string;
  note: string;
  isPlanned: boolean;
  isRecurring: boolean;
  emotionalTrigger: string;
  moneyType: string;
};

type StoredTransaction = Omit<LocalTransaction, "amountPaisa"> & {
  amountPaisa: string;
};

export function isLocalAuthMode() {
  return process.env.AUTH_MODE === "local";
}

export async function setLocalUser(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    userCookie,
    JSON.stringify({
      id: "00000000-0000-4000-8000-000000000001",
      email,
    }),
    { httpOnly: true, sameSite: "lax", path: "/" },
  );
}

export async function clearLocalUser() {
  const cookieStore = await cookies();
  cookieStore.delete(userCookie);
  cookieStore.delete(profileCookie);
  cookieStore.delete(allocationCookie);
  cookieStore.delete(transactionsCookie);
}

export async function getLocalUser() {
  const cookieStore = await cookies();
  const value = cookieStore.get(userCookie)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as { id: string; email: string };
  } catch {
    return null;
  }
}

export async function setLocalProfile(input: {
  id: string;
  name: string;
  salaryRupees: number;
  salaryDay: number;
  emergencyFundRupees: number;
  freedomTargetRupees: number;
  islamicMode: boolean;
  strictMode: boolean;
}) {
  const cookieStore = await cookies();
  const profile: StoredProfile = {
    id: input.id,
    name: input.name,
    salaryPaisa: String(rupeesToPaisa(input.salaryRupees)),
    salaryDay: input.salaryDay,
    emergencyFundPaisa: String(rupeesToPaisa(input.emergencyFundRupees)),
    freedomTargetPaisa: String(rupeesToPaisa(input.freedomTargetRupees)),
    islamicMode: input.islamicMode,
    strictMode: input.strictMode,
    onboardingComplete: true,
  };

  cookieStore.set(profileCookie, JSON.stringify(profile), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  await setLocalAllocationFromRupees(
    input.salaryRupees,
    Object.fromEntries(budgetBuckets.map((bucket) => [bucket.key, Math.round((input.salaryRupees * bucket.defaultPercent) / 100)])),
    false,
  );
}

export async function getLocalProfile(): Promise<LocalProfile | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(profileCookie)?.value;

  if (!value) {
    return null;
  }

  try {
    const stored = JSON.parse(value) as StoredProfile;
    return {
      ...stored,
      salaryPaisa: BigInt(stored.salaryPaisa),
      emergencyFundPaisa: BigInt(stored.emergencyFundPaisa),
      freedomTargetPaisa: BigInt(stored.freedomTargetPaisa),
    };
  } catch {
    return null;
  }
}

export function getLocalBucketAllocations(salaryPaisa: bigint) {
  return budgetBuckets.map((bucket) => ({
    bucket: bucket.key,
    plannedPaisa: BigInt(Math.round((Number(salaryPaisa) * bucket.defaultPercent) / 100)),
    spentPaisa: BigInt(0),
  }));
}

export async function updateLocalProfileSalary(salaryRupees: number) {
  const profile = await getLocalProfile();
  if (!profile) {
    return;
  }

  const cookieStore = await cookies();
  const stored: StoredProfile = {
    ...profile,
    salaryPaisa: String(rupeesToPaisa(salaryRupees)),
    emergencyFundPaisa: String(profile.emergencyFundPaisa),
    freedomTargetPaisa: String(profile.freedomTargetPaisa),
  };

  cookieStore.set(profileCookie, JSON.stringify(stored), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function setLocalAllocationFromRupees(
  salaryRupees: number,
  buckets: Record<string, number>,
  updateProfile = true,
) {
  const cookieStore = await cookies();
  const allocation: StoredBucketAllocation[] = budgetBuckets.map((bucket) => ({
    bucket: bucket.key,
    plannedPaisa: String(rupeesToPaisa(buckets[bucket.key] ?? 0)),
  }));

  cookieStore.set(allocationCookie, JSON.stringify(allocation), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  if (updateProfile) {
    await updateLocalProfileSalary(salaryRupees);
  }
}

async function getStoredAllocation(profile: LocalProfile) {
  const cookieStore = await cookies();
  const value = cookieStore.get(allocationCookie)?.value;

  if (!value) {
    return getLocalBucketAllocations(profile.salaryPaisa).map((bucket) => ({
      bucket: bucket.bucket,
      plannedPaisa: bucket.plannedPaisa,
    }));
  }

  try {
    return (JSON.parse(value) as StoredBucketAllocation[]).map((bucket) => ({
      bucket: bucket.bucket,
      plannedPaisa: BigInt(bucket.plannedPaisa),
    }));
  } catch {
    return getLocalBucketAllocations(profile.salaryPaisa).map((bucket) => ({
      bucket: bucket.bucket,
      plannedPaisa: bucket.plannedPaisa,
    }));
  }
}

export async function getLocalTransactions(): Promise<LocalTransaction[]> {
  const cookieStore = await cookies();
  const value = cookieStore.get(transactionsCookie)?.value;

  if (!value) {
    return [];
  }

  try {
    return (JSON.parse(value) as StoredTransaction[]).map((transaction) => ({
      ...transaction,
      amountPaisa: BigInt(transaction.amountPaisa),
    }));
  } catch {
    return [];
  }
}

async function setLocalTransactions(transactions: LocalTransaction[]) {
  const cookieStore = await cookies();
  const stored: StoredTransaction[] = transactions.slice(0, 40).map((transaction) => ({
    ...transaction,
    amountPaisa: String(transaction.amountPaisa),
  }));

  cookieStore.set(transactionsCookie, JSON.stringify(stored), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getLocalAllocation(profile: LocalProfile): Promise<{
  salaryPaisa: bigint;
  status: "DRAFT" | "CONFIRMED";
  bucketAllocations: LocalBucketAllocation[];
}> {
  const planned = await getStoredAllocation(profile);
  const transactions = await getLocalTransactions();
  const spentByBucket = new Map<string, bigint>();

  for (const transaction of transactions) {
    if (transaction.type !== "EXPENSE") {
      continue;
    }

    spentByBucket.set(
      transaction.bucket,
      (spentByBucket.get(transaction.bucket) ?? BigInt(0)) + transaction.amountPaisa,
    );
  }

  return {
    salaryPaisa: profile.salaryPaisa,
    status: "CONFIRMED",
    bucketAllocations: planned.map((bucket) => ({
      bucket: bucket.bucket,
      plannedPaisa: bucket.plannedPaisa,
      spentPaisa: spentByBucket.get(bucket.bucket) ?? BigInt(0),
    })),
  };
}

export async function addLocalTransaction(input: Omit<LocalTransaction, "id">) {
  const transactions = await getLocalTransactions();
  const transaction: LocalTransaction = {
    ...input,
    id: crypto.randomUUID(),
  };

  await setLocalTransactions([transaction, ...transactions]);
}

export async function updateLocalTransaction(id: string, input: Omit<LocalTransaction, "id">) {
  const transactions = await getLocalTransactions();
  await setLocalTransactions(
    transactions.map((transaction) => (transaction.id === id ? { ...input, id } : transaction)),
  );
}

export async function deleteLocalTransaction(id: string) {
  const transactions = await getLocalTransactions();
  await setLocalTransactions(transactions.filter((transaction) => transaction.id !== id));
}
