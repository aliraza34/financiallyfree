import { cookies } from "next/headers";
import { budgetBuckets } from "@/lib/constants";
import { rupeesToPaisa } from "@/lib/pkr";

const userCookie = "moneymap_demo_user";
const profileCookie = "moneymap_demo_profile";

export type LocalProfile = {
  id: string;
  name: string;
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
