"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOnboardedUser } from "@/lib/auth";
import { isLocalAuthMode, addLocalTransaction, deleteLocalTransaction, updateLocalTransaction } from "@/lib/local-session";
import { prisma } from "@/lib/prisma";
import { rupeesToPaisa } from "@/lib/pkr";

const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).default("EXPENSE"),
  amountRupees: z.coerce.number().int().positive(),
  category: z.string().min(1),
  bucket: z.string().min(1),
  paymentMethod: z.string().min(1),
  occurredOn: z.string().min(10),
  note: z.string().max(200).optional().default(""),
  isPlanned: z.coerce.boolean().default(false),
  isRecurring: z.coerce.boolean().default(false),
  emotionalTrigger: z.string().max(80).optional().default(""),
  moneyType: z.string().min(1).default("cash"),
});

function parseTransactionForm(formData: FormData) {
  return transactionSchema.safeParse({
    id: formData.get("id") || undefined,
    type: formData.get("type") || "EXPENSE",
    amountRupees: formData.get("amountRupees"),
    category: formData.get("category"),
    bucket: formData.get("bucket"),
    paymentMethod: formData.get("paymentMethod"),
    occurredOn: formData.get("occurredOn"),
    note: formData.get("note") || "",
    isPlanned: formData.get("isPlanned") === "on",
    isRecurring: formData.get("isRecurring") === "on",
    emotionalTrigger: formData.get("emotionalTrigger") || "",
    moneyType: formData.get("moneyType") || "cash",
  });
}

export async function createTransactionAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const parsed = parseTransactionForm(formData);

  if (!parsed.success) {
    redirect("/transactions?error=Check the amount, category, bucket, and payment method.");
  }

  const data = parsed.data;

  if (isLocalAuthMode()) {
    await addLocalTransaction({
      type: data.type,
      amountPaisa: BigInt(rupeesToPaisa(data.amountRupees)),
      category: data.category,
      bucket: data.bucket,
      paymentMethod: data.paymentMethod,
      occurredOn: data.occurredOn,
      note: data.note,
      isPlanned: data.isPlanned,
      isRecurring: data.isRecurring,
      emotionalTrigger: data.emotionalTrigger,
      moneyType: data.moneyType,
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    redirect("/transactions?success=Transaction added.");
  }

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: data.type,
      amountPaisa: rupeesToPaisa(data.amountRupees),
      category: data.category,
      bucket: data.bucket,
      paymentMethod: data.paymentMethod,
      occurredOn: new Date(data.occurredOn),
      note: data.note || null,
      isPlanned: data.isPlanned,
      isRecurring: data.isRecurring,
      emotionalTrigger: data.emotionalTrigger || null,
      moneyType: data.moneyType,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/transactions?success=Transaction added.");
}

export async function updateTransactionAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const parsed = parseTransactionForm(formData);

  if (!parsed.success || !parsed.data.id) {
    redirect("/transactions?error=Could not update this transaction.");
  }

  const data = parsed.data;
  const id = data.id as string;

  if (isLocalAuthMode()) {
    await updateLocalTransaction(id, {
      type: data.type,
      amountPaisa: BigInt(rupeesToPaisa(data.amountRupees)),
      category: data.category,
      bucket: data.bucket,
      paymentMethod: data.paymentMethod,
      occurredOn: data.occurredOn,
      note: data.note,
      isPlanned: data.isPlanned,
      isRecurring: data.isRecurring,
      emotionalTrigger: data.emotionalTrigger,
      moneyType: data.moneyType,
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    redirect("/transactions?success=Transaction updated.");
  }

  await prisma.transaction.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      type: data.type,
      amountPaisa: rupeesToPaisa(data.amountRupees),
      category: data.category,
      bucket: data.bucket,
      paymentMethod: data.paymentMethod,
      occurredOn: new Date(data.occurredOn),
      note: data.note || null,
      isPlanned: data.isPlanned,
      isRecurring: data.isRecurring,
      emotionalTrigger: data.emotionalTrigger || null,
      moneyType: data.moneyType,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/transactions?success=Transaction updated.");
}

export async function deleteTransactionAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/transactions?error=Could not delete this transaction.");
  }

  if (isLocalAuthMode()) {
    await deleteLocalTransaction(id);
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    redirect("/transactions?success=Transaction deleted.");
  }

  await prisma.transaction.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/transactions?success=Transaction deleted.");
}
