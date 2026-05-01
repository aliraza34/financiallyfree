export const budgetBuckets = [
  { key: "needs", label: "Needs", defaultPercent: 50 },
  { key: "debt", label: "Debt", defaultPercent: 20 },
  { key: "emergency", label: "Emergency", defaultPercent: 10 },
  { key: "investment", label: "Investment", defaultPercent: 5 },
  { key: "personal", label: "Personal", defaultPercent: 10 },
  { key: "buffer", label: "Buffer", defaultPercent: 5 },
] as const;

export const pakistanPaymentMethods = [
  "Cash",
  "EasyPaisa",
  "JazzCash",
  "SadaPay",
  "NayaPay",
  "Raast",
  "Bank transfer",
  "Debit card",
  "Credit card",
] as const;

export const pakistanCategories = [
  "Rent",
  "Groceries",
  "Utility bills",
  "Transport",
  "School fees",
  "Family kharch",
  "Rishta",
  "Mehndi",
  "Eid gifts",
  "Medical",
  "Qarza payment",
  "Committee",
  "Savings",
  "Unknown",
] as const;

export const systemMilestones = [
  { title: "Track first expense", targetPaisa: 0 },
  { title: "Allocate first salary", targetPaisa: 0 },
  { title: "Pay first debt installment", targetPaisa: 0 },
  { title: "Emergency fund starter", targetPaisa: 5_000_000 },
  { title: "Emergency fund 100k", targetPaisa: 10_000_000 },
  { title: "One month expenses saved", targetPaisa: 18_000_000 },
  { title: "Three month emergency fund", targetPaisa: 54_000_000 },
  { title: "Six month emergency fund", targetPaisa: 108_000_000 },
  { title: "Debt-free day", targetPaisa: 0 },
  { title: "First halal investment", targetPaisa: 10_000_00 },
  { title: "Investment 100k", targetPaisa: 10_000_000 },
  { title: "Net worth 1M", targetPaisa: 100_000_000 },
  { title: "Net worth 5M", targetPaisa: 500_000_000 },
  { title: "Net worth 10M", targetPaisa: 1_000_000_000 },
  { title: "Financial freedom 5Cr", targetPaisa: 5_000_000_000 },
] as const;
