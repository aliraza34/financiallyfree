# MoneyMap PKR — Full AI Coding Prompt
### Complete Build Instructions for Claude Code / Codex / Cursor / Any AI Coding Tool

---

## CONTEXT: READ THIS FIRST

You are building a **production-quality, mobile-first Progressive Web App (PWA)** called **"MoneyMap PKR"** — a personal Islamic finance manager for a Pakistani user.

The user earns **180,000 PKR/month after tax**, carries **~450,000 PKR in debt/qarza/committee obligations**, has **zero savings**, **zero investments**, and **zero visibility** into where money goes. The root problem is not salary — it is **no system, no tracking, and behavioral spending patterns**. This app is the system.

**The single most important job of this app:**
> Make the user SEE every rupee, CONTROL every rupee, and BUILD toward financial freedom — step by step, milestone by milestone.

---

## ARCHITECTURE DECISION (FINAL — DO NOT CHANGE)

```
Frontend:     Next.js 14+ App Router (TypeScript, Tailwind CSS, shadcn/ui)
Backend:      Supabase (PostgreSQL database + Supabase Auth)
ORM:          Prisma (type-safe, clean schema, easy AI code generation)
Charts:       Recharts
Forms:        React Hook Form + Zod validation
PWA:          next-pwa or built-in Next.js PWA support
Hosting:      Vercel (frontend) + Supabase (database)
AI Layer:     Anthropic Claude API (claude-sonnet-4-20250514) — abstracted service
Currency:     PKR only (no multi-currency in v1)
Language:     English only (v1)
Finance Mode: Islamic (default ON, always)
```

**Why this stack:**
- Fast to build MVP, scales to production
- Prisma migrations work perfectly with Supabase Postgres
- Next.js Server Actions keep data logic server-side and secure
- PWA installs on Android/iPhone like a native app
- Flutter/React Native app can be built later reusing the same Supabase backend + APIs
- Works very well with AI coding tools (Cursor, Claude Code, Codex, etc.)

**Future mobile app strategy:**
The backend, database, and all business logic must be in API routes / server actions — NOT mixed into React components. This ensures a Flutter or React Native frontend can connect to the same backend later with minimal changes.

---

## USER PROFILE (SEED THIS INTO ONBOARDING)

```
Monthly take-home salary:    180,000 PKR
Current total debt/qarza:    ~450,000 PKR
Current savings:             0 PKR
Current investments:         0 PKR
Emergency fund:              0 PKR
Financial freedom target:    50,000,000 PKR (5 crore)
Islamic finance mode:        ON (default)
Currency:                    PKR
Tracking method:             Manual (v1)
Salary date:                 User sets during onboarding
```

---

## FOLDER STRUCTURE

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(onboarding)
    /onboarding/page.tsx
  /(dashboard)
    /dashboard/page.tsx
    /salary/page.tsx
    /transactions/page.tsx
    /transactions/new/page.tsx
    /budget/page.tsx
    /debts/page.tsx
    /debts/new/page.tsx
    /committees/page.tsx
    /committees/new/page.tsx
    /goals/page.tsx
    /emergency-fund/page.tsx
    /investments/page.tsx
    /financial-freedom/page.tsx
    /reports/page.tsx
    /ai-coach/page.tsx
    /zakat/page.tsx
    /settings/page.tsx
  /api
    /transactions/route.ts
    /debts/route.ts
    /committees/route.ts
    /goals/route.ts
    /budget/route.ts
    /reports/route.ts
    /ai-coach/route.ts
    /zakat/route.ts
/components
  /ui         (shadcn/ui components)
  /finance    (app-specific components)
  /charts     (Recharts wrappers)
  /forms      (form components)
  /layout     (navbar, sidebar, bottom nav)
/lib
  /prisma.ts       (Prisma client singleton)
  /supabase.ts     (Supabase client)
  /ai.ts           (AI service abstraction)
  /formatters.ts   (PKR formatting: ₨ 1,80,000)
  /finance.ts      (finance calculation utilities)
  /constants.ts    (categories, buckets, milestones)
/prisma
  /schema.prisma
  /seed.ts
/public
  /manifest.json   (PWA manifest)
  /icons/          (app icons)
```

---

## PRISMA DATABASE SCHEMA

Build the full schema in `/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USER PROFILE ───────────────────────────────────────────────────────────

model Profile {
  id                    String    @id @default(uuid())
  userId                String    @unique  // Supabase Auth UID
  name                  String?
  monthlySalary         Float     @default(180000)
  salaryDate            Int       @default(1)   // day of month
  totalDebt             Float     @default(450000)
  emergencyFund         Float     @default(0)
  investmentBalance     Float     @default(0)
  freedomTarget         Float     @default(50000000)
  islamicMode           Boolean   @default(true)
  strictMode            Boolean   @default(false)
  onboardingComplete    Boolean   @default(false)
  currency              String    @default("PKR")
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  transactions          Transaction[]
  salaryRecords         SalaryRecord[]
  salaryAllocations     SalaryAllocation[]
  debts                 Debt[]
  committees            Committee[]
  budgets               Budget[]
  goals                 Goal[]
  emergencyFundRecords  EmergencyFundRecord[]
  investments           Investment[]
  reminders             Reminder[]
  monthlyReviews        MonthlyReview[]
  aiConversations       AiConversation[]
  zakatCalculations     ZakatCalculation[]
  netWorthSnapshots     NetWorthSnapshot[]
  leakageReports        LeakageReport[]
}

// ─── SALARY ─────────────────────────────────────────────────────────────────

model SalaryRecord {
  id          String   @id @default(uuid())
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id])
  amount      Float
  month       Int
  year        Int
  receivedOn  DateTime
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  allocations SalaryAllocation[]
}

model SalaryAllocation {
  id             String       @id @default(uuid())
  profileId      String
  profile        Profile      @relation(fields: [profileId], references: [id])
  salaryRecordId String?
  salaryRecord   SalaryRecord? @relation(fields: [salaryRecordId], references: [id])
  month          Int
  year           Int
  totalSalary    Float
  // Default buckets
  needsFamily    Float        @default(90000)
  debtCommittee  Float        @default(50000)
  emergencyFund  Float        @default(15000)
  investment     Float        @default(15000)
  personal       Float        @default(10000)
  buffer         Float        @default(10000)
  customBuckets  Json?        // for extra user-defined buckets
  isAllocated    Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

model Transaction {
  id              String    @id @default(uuid())
  profileId       String
  profile         Profile   @relation(fields: [profileId], references: [id])
  amount          Float
  type            TransactionType
  category        String
  bucket          BucketType
  paymentMethod   PaymentMethod
  date            DateTime
  note            String?
  isPlanned       Boolean   @default(false)
  isRecurring     Boolean   @default(false)
  emotionalTrigger EmotionalTrigger @default(NORMAL)
  moneyType       MoneyType
  isUnknown       Boolean   @default(false)   // flagged until categorized
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
  DEBT_PAYMENT
  SAVING
  INVESTMENT
  COMMITTEE_PAYMENT
}

enum BucketType {
  NEEDS_FAMILY
  DEBT_COMMITTEE
  EMERGENCY_FUND
  INVESTMENT
  PERSONAL
  BUFFER
  UNKNOWN
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  DEBIT_CARD
  CREDIT_CARD
  EASYPAY
  JAZZCASH
  SADAPAY
  NAYAPAY
  OTHER
}

enum EmotionalTrigger {
  NORMAL
  STRESS
  FAMILY_PRESSURE
  FRIENDS
  IMPULSE
  EMERGENCY
  CELEBRATION
  UNKNOWN
}

enum MoneyType {
  NEED
  WANT
  FAMILY
  DEBT
  INVESTMENT
  SAVING
  UNKNOWN
}

// ─── DEBT / QARZA ───────────────────────────────────────────────────────────

model Debt {
  id                String      @id @default(uuid())
  profileId         String
  profile           Profile     @relation(fields: [profileId], references: [id])
  lenderName        String
  lenderType        LenderType
  originalAmount    Float
  remainingAmount   Float
  monthlyPayment    Float       @default(0)
  dueDate           DateTime?
  hasInterest       Boolean     @default(false)
  interestRate      Float?
  islamicConcern    Boolean     @default(false)
  urgency           PriorityLevel @default(MEDIUM)
  emotionalPressure PriorityLevel @default(MEDIUM)
  notes             String?
  status            DebtStatus  @default(ACTIVE)
  payoffMethod      PayoffMethod @default(URGENT_FIRST)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  payments          DebtPayment[]
}

model DebtPayment {
  id        String   @id @default(uuid())
  debtId    String
  debt      Debt     @relation(fields: [debtId], references: [id])
  amount    Float
  paidOn    DateTime
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum LenderType {
  FAMILY
  FRIEND
  BANK
  APP_LOAN
  COMMITTEE
  EMPLOYER
  CREDIT_CARD
  OTHER
}

enum DebtStatus {
  ACTIVE
  PAID
  PAUSED
  DISPUTED
}

enum PayoffMethod {
  SNOWBALL       // smallest balance first
  AVALANCHE      // highest interest first
  URGENT_FIRST   // family/social pressure first (default for Islamic users)
  CUSTOM
}

enum PriorityLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// ─── COMMITTEE (PAKISTAN-SPECIFIC) ──────────────────────────────────────────

model Committee {
  id                  String          @id @default(uuid())
  profileId           String
  profile             Profile         @relation(fields: [profileId], references: [id])
  name                String
  monthlyContribution Float
  totalMembers        Int
  totalMonths         Int
  monthsPaid          Int             @default(0)
  receivingMonth      Int?            // which month you receive payout (1-indexed)
  alreadyReceived     Boolean         @default(false)
  receivedAmount      Float?
  managerName         String?
  riskLevel           RiskLevel       @default(MEDIUM)
  notes               String?
  nextPaymentDate     DateTime?
  status              CommitteeStatus @default(ACTIVE)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  payments            CommitteePayment[]
}

model CommitteePayment {
  id          String    @id @default(uuid())
  committeeId String
  committee   Committee @relation(fields: [committeeId], references: [id])
  amount      Float
  paidOn      DateTime
  note        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

enum CommitteeStatus {
  ACTIVE
  COMPLETED
  PAUSED
  DEFAULTED
}

// ─── BUDGET ─────────────────────────────────────────────────────────────────

model Budget {
  id          String      @id @default(uuid())
  profileId   String
  profile     Profile     @relation(fields: [profileId], references: [id])
  month       Int
  year        Int
  type        BudgetType  @default(ZERO_BASED)
  categories  Json        // { categoryName: { planned: number, spent: number } }
  totalPlanned Float
  totalSpent   Float      @default(0)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum BudgetType {
  ZERO_BASED
  CATEGORY
  ENVELOPE
  EMERGENCY
  DEBT_ATTACK
}

// ─── GOALS ──────────────────────────────────────────────────────────────────

model Goal {
  id                  String      @id @default(uuid())
  profileId           String
  profile             Profile     @relation(fields: [profileId], references: [id])
  name                String
  targetAmount        Float
  currentAmount       Float       @default(0)
  monthlyContribution Float       @default(0)
  deadline            DateTime?
  priority            Int         @default(1)
  category            GoalCategory
  isHalal             Boolean     @default(true)
  isSystemGoal        Boolean     @default(false)  // pre-set milestone goals
  status              GoalStatus  @default(ACTIVE)
  notes               String?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  contributions       GoalContribution[]
}

model GoalContribution {
  id        String   @id @default(uuid())
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id])
  amount    Float
  date      DateTime
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum GoalCategory {
  DEBT_PAYOFF
  EMERGENCY_FUND
  INVESTMENT
  EDUCATION
  PROPERTY
  VEHICLE
  TRAVEL
  FAMILY
  FREEDOM
  OTHER
}

enum GoalStatus {
  ACTIVE
  ACHIEVED
  PAUSED
  CANCELLED
}

// ─── EMERGENCY FUND ─────────────────────────────────────────────────────────

model EmergencyFundRecord {
  id        String   @id @default(uuid())
  profileId String
  profile   Profile  @relation(fields: [profileId], references: [id])
  amount    Float
  type      String   // "deposit" | "withdrawal"
  date      DateTime
  note      String?
  balance   Float    // running balance after this entry
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── INVESTMENTS ─────────────────────────────────────────────────────────────

model Investment {
  id             String           @id @default(uuid())
  profileId      String
  profile        Profile          @relation(fields: [profileId], references: [id])
  type           InvestmentType
  name           String
  amountInvested Float
  currentValue   Float
  date           DateTime
  platform       String?
  riskLevel      RiskLevel        @default(MEDIUM)
  shariaStatus   ShariaStatus     @default(USER_CONFIRMED)
  notes          String?
  status         String           @default("active")
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

enum InvestmentType {
  ISLAMIC_MUTUAL_FUND
  SUKUK
  ISLAMIC_ETF
  SHARIAH_STOCK
  GOLD
  CASH
  MODARABA
  REIT
  INPC
  OTHER
}

enum ShariaStatus {
  USER_CONFIRMED
  UNKNOWN
  NEEDS_REVIEW
}

// ─── NET WORTH SNAPSHOTS ─────────────────────────────────────────────────────

model NetWorthSnapshot {
  id            String   @id @default(uuid())
  profileId     String
  profile       Profile  @relation(fields: [profileId], references: [id])
  date          DateTime
  cash          Float    @default(0)
  bankBalance   Float    @default(0)
  emergencyFund Float    @default(0)
  savings       Float    @default(0)
  investments   Float    @default(0)
  gold          Float    @default(0)
  property      Float    @default(0)
  receivables   Float    @default(0)
  totalAssets   Float    @default(0)
  totalDebts    Float    @default(0)
  netWorth      Float    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ─── REMINDERS ───────────────────────────────────────────────────────────────

model Reminder {
  id          String         @id @default(uuid())
  profileId   String
  profile     Profile        @relation(fields: [profileId], references: [id])
  type        ReminderType
  title       String
  message     String
  dueDate     DateTime
  isRecurring Boolean        @default(false)
  frequency   String?        // "daily" | "weekly" | "monthly"
  isDismissed Boolean        @default(false)
  relatedId   String?        // ID of debt, committee, etc.
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum ReminderType {
  SALARY_ALLOCATION
  DAILY_ENTRY
  DEBT_PAYMENT
  COMMITTEE_PAYMENT
  BILL_PAYMENT
  WEEKLY_REVIEW
  MONTHLY_REVIEW
  ZAKAT_REVIEW
  EMERGENCY_CONTRIBUTION
  INVESTMENT_CONTRIBUTION
  GOAL_DEADLINE
}

// ─── MONTHLY REVIEW ──────────────────────────────────────────────────────────

model MonthlyReview {
  id                    String   @id @default(uuid())
  profileId             String
  profile               Profile  @relation(fields: [profileId], references: [id])
  month                 Int
  year                  Int
  totalIncome           Float
  totalExpenses         Float
  savingsRate           Float    @default(0)
  debtPaid              Float    @default(0)
  emergencyAdded        Float    @default(0)
  investmentAdded       Float    @default(0)
  biggestCategory       String?
  biggestLeakage        String?
  plannedVsActualNotes  String?
  wentWell              String?
  wentWrong             String?
  nextMonthPlan         String?
  leakageScore          Int      @default(0)  // 0-100
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// ─── AI CONVERSATIONS ────────────────────────────────────────────────────────

model AiConversation {
  id        String      @id @default(uuid())
  profileId String
  profile   Profile     @relation(fields: [profileId], references: [id])
  title     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  messages  AiMessage[]
}

model AiMessage {
  id             String         @id @default(uuid())
  conversationId String
  conversation   AiConversation @relation(fields: [conversationId], references: [id])
  role           String         // "user" | "assistant"
  content        String
  createdAt      DateTime       @default(now())
}

// ─── ZAKAT ───────────────────────────────────────────────────────────────────

model ZakatCalculation {
  id              String   @id @default(uuid())
  profileId       String
  profile         Profile  @relation(fields: [profileId], references: [id])
  calculationDate DateTime
  cash            Float    @default(0)
  bankBalance     Float    @default(0)
  investments     Float    @default(0)
  gold            Float    @default(0)
  receivables     Float    @default(0)
  businessGoods   Float    @default(0)
  nisabValuePKR   Float    // current nisab in PKR (user enters manually)
  totalZakatable  Float
  zakatDue        Float    // 2.5% of total zakatable
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ─── LEAKAGE REPORTS ─────────────────────────────────────────────────────────

model LeakageReport {
  id                String   @id @default(uuid())
  profileId         String
  profile           Profile  @relation(fields: [profileId], references: [id])
  month             Int
  year              Int
  leakageScore      Int      // 0-100 (higher = worse)
  totalLeakage      Float
  unknownSpending   Float
  unplannedSpending Float
  cashWithdrawals   Float
  top5Leaks         Json     // array of { category, amount, trigger }
  suggestions       Json     // array of suggested corrections
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## MODULE SPECIFICATIONS

### MODULE 1: AUTH & ONBOARDING

**Pages:** `/login`, `/register`, `/onboarding`

**Auth:** Use Supabase Auth (email + password). On first login, redirect to `/onboarding`.

**Onboarding flow (5 steps, one screen each):**

**Step 1 — Welcome & Salary:**
```
Title: "Let's set up your money system"
Fields:
  - Your name
  - Monthly take-home salary (PKR) — default: 180,000
  - Salary arrival date (day of month) — default: 1
Explanation text: "Your real free-to-spend amount is much less than your full salary. We'll show you exactly how much."
```

**Step 2 — Current Situation:**
```
Fields:
  - Total current debt/qarza (PKR) — default: 450,000
  - Current savings (PKR) — default: 0
  - Current investments (PKR) — default: 0
  - Current emergency fund (PKR) — default: 0
Explanation: "Be honest. This is private and only helps us give you accurate guidance."
```

**Step 3 — Your Goal:**
```
Fields:
  - Financial freedom target (PKR) — default: 50,000,000
  - Target label — pre-filled: "5 Crore PKR"
Explanation: "We'll break this into small milestones so it doesn't feel overwhelming."
```

**Step 4 — Preferences:**
```
Fields:
  - Islamic finance mode? (toggle, default ON)
  - Strict mode? (toggle, default OFF — explains what it does)
  - Language: English only (v1)
```

**Step 5 — Salary Allocation Preview:**
```
Show the default 180k allocation:
  - Needs/Family: 90,000
  - Debt/Committees: 50,000
  - Emergency Fund: 15,000
  - Investment: 15,000
  - Personal: 10,000
  - Buffer: 10,000
Allow editing before saving.
CTA: "Start Tracking →"
```

---

### MODULE 2: MAIN DASHBOARD

**Page:** `/dashboard`

**Layout:** Mobile-first. Use bottom navigation bar with 5 tabs:
- 🏠 Home
- ➕ Add (opens quick-add transaction modal)
- 📊 Reports
- 💬 AI Coach
- ⚙️ Settings

**Home screen sections (top to bottom):**

```
1. TOP BANNER — "Today's Action"
   Shows ONE clear action, e.g.:
   - "Salary not allocated yet → Allocate Now"
   - "You haven't entered expenses today → Add Now"
   - "Debt payment due in 3 days → View"
   - "Great! You're on track this week ✓"

2. SALARY SUMMARY CARD
   This month: 180,000 PKR
   ├── Allocated: 165,000 ✓
   ├── Spent: 87,500
   └── Free to spend: 7,500  ← This is the ONLY number the user should think about

3. BUCKET OVERVIEW (horizontal scrollable cards)
   Each bucket shows: planned vs spent, % used
   Needs/Family | Debt | Emergency | Investment | Personal | Buffer

4. QUICK STATS ROW
   Total Debt | Emergency Fund | Investments | Net Worth

5. LEAKAGE ALERT
   If leakage score > 50: "⚠️ 12,400 PKR went to Unknown this month"

6. NEXT MILESTONE
   "Next goal: Debt below 400,000 PKR — 50,000 to go"
   Progress bar

7. RECENT TRANSACTIONS (last 5, with "View All" link)
```

**Rule:** Never show "180,000 available to spend" anywhere. Always show the bucket-divided picture.

---

### MODULE 3: SALARY ALLOCATION

**Page:** `/salary`

**Triggered automatically when a new month starts (or salary date arrives).**

**Screen flow:**
```
1. "Your salary arrived!" confirmation
   Enter actual amount received (default: 180,000)

2. Allocation screen
   Show 6 default buckets, all editable
   Live total: allocated vs remaining
   Warning if any rupee is unallocated: "X PKR is not assigned a job"
   Warning in strict mode if personal > 15% of salary

3. Confirm allocation → saved to SalaryAllocation table

4. Confirmation: "✓ Every rupee has a job. You have 10,000 PKR for personal spending."
```

**Rules to enforce:**
- Total of all buckets must equal salary amount
- Show alert if debt > 0 and investment bucket > emergency fund bucket
- Show alert if personal bucket > 20% while debt > 0

---

### MODULE 4: TRANSACTION TRACKER (FAST ENTRY)

**Pages:** `/transactions`, `/transactions/new`

**Design principle: Entry must take under 15 seconds on mobile.**

**Quick-add modal (available from ➕ bottom nav):**
```
Step 1: Amount (large number input, full width, num keypad)
Step 2: Quick category buttons (1 tap):
  [Food] [Transport] [Family] [Bill] [Committee] [Debt] [Cash Out] [Unknown]
Step 3: Payment method (1 tap): Cash | Bank | EasyPaisa | JazzCash | Card
Step 4: Optional: Note + Planned/Unplanned toggle + Emotional trigger
```

**Full form fields (for `/transactions/new`):**
```
- Amount (PKR, required)
- Type: Income | Expense | Debt Payment | Saving | Investment | Transfer | Committee Payment
- Category (dropdown + search + quick add new)
- Bucket assignment (auto-suggested from category, editable)
- Payment method
- Date (default: today)
- Note (optional)
- Planned? toggle
- Recurring? toggle (if yes: frequency)
- Emotional trigger: Normal | Stress | Family Pressure | Friends | Impulse | Emergency | Unknown
- Money type: Need | Want | Family | Debt | Saving | Investment | Unknown
```

**Unknown flag rule:**
- Any transaction with category = "Unknown" must be highlighted in red in the list
- Dashboard shows: "X unclassified transactions — tap to review"
- Remind user to classify before month-end

**Default categories (seed these):**
```
NEEDS: Rent, Electricity, Gas, Water, Groceries, Medical, Children Education, Fuel, Mobile/Internet
FAMILY: Family Support, Parents, Siblings, Relatives
FOOD: Home Cooking, Restaurant, Food Delivery, Tea/Coffee
TRANSPORT: Petrol, Rickshaw/Uber, Bus/Metro, Car Repair
DEBT: Bank Loan Payment, Qarza Return, Credit Card Payment
COMMITTEE: Committee Payment
SAVINGS: Emergency Fund, Goal Saving
INVESTMENT: Mutual Fund, Stocks, Gold, Sukuk
PERSONAL: Clothing, Haircut, Entertainment, Shopping, Subscriptions
GIVING: Sadaqah, Zakat, Donation
OTHER: Unknown, Miscellaneous
```

---

### MODULE 5: FIXED EXPENSE DISCOVERY

**Page:** part of `/budget` and `/reports`

**This module runs in the background and learns from transaction history.**

**Algorithm:**
```
After 2+ months of data, scan transactions for:
1. Same category appearing every month
2. Amount within ±20% variance
3. Date within ±5 days variance
4. Already marked "recurring"

Classify into:
- TRUE FIXED (rent, bills, loan payments)
- LIKELY FIXED (groceries similar amount)
- FLEXIBLE (food outside, shopping)
- LEAKAGE (unknown, unplanned, impulse)
- OBLIGATIONS (committee, debt payments)
```

**Show user:**
```
"Based on your last 3 months, here's your real monthly picture:"
  Fixed expenses:       ~68,000 PKR
  Committee/Debt:       ~50,000 PKR
  Flexible expenses:    ~35,000 PKR
  Leakage/Unknown:      ~15,000 PKR
  ────────────────────────────────
  Monthly survival cost: ~168,000 PKR
  
"This means you have only ~12,000 PKR truly flexible."
```

---

### MODULE 6: DEBT / QARZA TRACKER

**Page:** `/debts`

**Dashboard view:**
```
TOTAL DEBT REMAINING: 450,000 PKR
Monthly debt obligation: ~50,000 PKR
Estimated debt-free date: [calculated]

Debt list sorted by: urgency / interest / amount
Each item shows: lender, remaining, due, monthly payment, progress bar
```

**Add debt form fields:**
```
- Lender name
- Lender type: Family | Friend | Bank | App Loan | Committee | Employer | Credit Card | Other
- Original amount
- Remaining amount
- Monthly payment
- Due date
- Has interest/markup? (if YES → flag as priority + Islamic concern warning)
- Islamic concern? toggle
- Urgency: Low | Medium | High | Critical
- Emotional pressure: Low | Medium | High | Critical
- Notes
```

**Debt payoff planner:**
```
Three methods:
1. Urgent First (default for Islamic users) — pay family/social pressure debt first
2. Snowball — smallest balance first (psychological wins)
3. Markup First — if interest-bearing debt exists, pay it FIRST (Islamic obligation)

For the default user (450k debt, ~50k/month):
  Estimated debt-free: ~9 months (with no new debt)
  Show month-by-month payoff timeline
```

**NEW DEBT WARNING (strict mode):**
```
When adding new debt, show full-screen warning:
"⚠️ New Debt Warning
Adding this debt will push your debt-free date from [date] to [new date].
This delays your financial freedom goal by [X months].
Are you sure you need this debt?
[Cancel] [I understand, add anyway]"
```

---

### MODULE 7: COMMITTEE TRACKER (PAKISTAN-SPECIFIC)

**Page:** `/committees`

**This is critical for Pakistani users. Committees (rotating savings groups) are a major cash flow item.**

**Dashboard:**
```
TOTAL COMMITTEE BURDEN: X PKR/month
Remaining total obligation: Y PKR
Active committees: N
Next due payment: [date and amount]
```

**Add committee form:**
```
- Committee name (e.g., "Office Staff Committee")
- Monthly contribution amount
- Total number of members
- Your receiving month (e.g., month 6 of 12)
- Already received payout? (yes/no + amount)
- Manager/organizer name
- Risk level: Low | Medium | High
- Next payment date
- Notes
- Status: Active | Completed | Paused | Defaulted
```

**Computed fields (auto-calculate):**
```
- Total committee value (members × contribution × months)
- Your expected payout (contribution × months)
- Remaining months
- Total still owed by you
- Net position (if already received: positive; if not received yet: negative until receiving month)
```

**Warning system:**
```
If total committee burden > 30% of salary:
"⚠️ Your committees consume 33% of your salary. Consider not joining new committees."

On "Add New Committee" while debt > 0:
"⚠️ You currently have 450,000 PKR in debt. Joining a new committee increases your monthly obligations and delays debt payoff. Recommended: clear debt first."
```

---

### MODULE 8: BUDGET SYSTEM

**Page:** `/budget`

**Use zero-based budgeting as default.**

**Monthly budget setup:**
```
For each category, user sets:
- Planned amount
- System tracks: spent amount (from transactions)
- Shows: remaining amount + % used

Visual: progress bars for each category
Color coding:
  Green (0-70%): on track
  Yellow (70-90%): watch out
  Red (90-100%): at limit
  Dark Red (100%+): overspent → alert
```

**Smart budget messages (generate these automatically):**
```
"You planned 10,000 for food delivery and spent 16,500. That's 6,500 over budget."
"Your unknown/unclassified spending is 12% of your salary this month."
"You're spending more on wants than on your emergency fund."
"You have used 87% of your personal budget with 8 days left."
"Debt payments are your largest category at 27.7% of salary. This is correct — keep going."
```

---

### MODULE 9: LEAKAGE DETECTOR

**Part of `/reports` and monthly review**

**Leakage Score: 0–100 (lower is better)**

```
Scoring algorithm:
  Unknown transactions as % of salary         → 0-20 points
  Unplanned transactions as % of salary       → 0-20 points
  Emotional spending (stress/impulse/friends) → 0-15 points
  Cash withdrawals without notes              → 0-15 points
  Weekend overspending pattern                → 0-10 points
  Salary-week overspending pattern            → 0-10 points
  Category overruns                           → 0-10 points

Score bands:
  0-25:   ✅ Green — Controlled
  26-50:  🟡 Yellow — Watch your spending
  51-75:  🟠 Orange — Leaking significantly
  76-100: 🔴 Red — Serious spending problem
```

**Monthly leakage report:**
```
Top 5 leaks this month:
1. Food delivery: 8,200 PKR (impulse/stress trigger)
2. Cash withdrawals unaccounted: 5,500 PKR
3. Unknown category: 4,100 PKR
4. Friends/social: 3,800 PKR
5. Unplanned shopping: 2,600 PKR
Total leakage: 24,200 PKR (13.4% of salary)

Suggestions:
- "Set food delivery budget to 5,000 PKR and stop at limit"
- "Log cash withdrawals immediately, even small ones"
- "Classify all unknown transactions before month end"
```

---

### MODULE 10: EMERGENCY FUND TRACKER

**Page:** `/emergency-fund`

**Milestone system (hardcoded, always show next milestone):**
```
🎯 Milestone 1: 50,000 PKR       → "Starter Safety Net"
🎯 Milestone 2: 100,000 PKR      → "Basic Safety Net"
🎯 Milestone 3: 180,000 PKR      → "One Month Safety (1x salary)"
🎯 Milestone 4: 540,000 PKR      → "Three Month Safety (3x salary)"
🎯 Milestone 5: 1,080,000 PKR    → "Six Month Safety (6x salary)"
```

**Show:**
```
Current balance: 0 PKR
Next milestone: 50,000 PKR (0% progress)
Monthly contribution: 15,000 PKR (from allocation)
Months to next milestone: ~3.3 months
```

**Rules:**
```
While emergency fund < 50,000 PKR AND any wants spending > 10,000 PKR:
  Show: "⚠️ Your emergency fund is empty. Every rupee spent on wants right now increases your risk."

While emergency fund < 100,000 PKR:
  AI should not recommend increasing investment significantly
```

---

### MODULE 11: GOALS TRACKER

**Page:** `/goals`

**System-seeded default milestones (auto-created during onboarding):**
```
1.  Debt below 400,000 PKR          (DEBT_PAYOFF)
2.  Debt below 300,000 PKR          (DEBT_PAYOFF)
3.  Debt below 200,000 PKR          (DEBT_PAYOFF)
4.  Debt below 100,000 PKR          (DEBT_PAYOFF)
5.  Debt ZERO                       (DEBT_PAYOFF) ← major celebration
6.  Emergency fund 50,000 PKR       (EMERGENCY_FUND)
7.  Emergency fund 100,000 PKR      (EMERGENCY_FUND)
8.  Emergency fund 1 month (180k)   (EMERGENCY_FUND)
9.  First investment 10,000 PKR     (INVESTMENT)
10. Investment portfolio 100,000 PKR (INVESTMENT)
11. Net worth 500,000 PKR           (FREEDOM)
12. Net worth 1,000,000 PKR         (FREEDOM) ← "First Lakh goal"
13. Net worth 5,000,000 PKR         (FREEDOM)
14. Net worth 10,000,000 PKR        (FREEDOM)
15. Financial freedom 50,000,000 PKR (FREEDOM) ← ultimate goal
```

**Goal card shows:**
```
Progress bar, current amount, target, monthly contribution, estimated date
Celebration animation when milestone achieved
```

---

### MODULE 12: INVESTMENT TRACKER & EDUCATION

**Page:** `/investments`

**Islamic mode rules (always enforced when islamicMode = true):**
```
NEVER recommend:
- Interest-bearing bonds/deposits
- Margin/leveraged trading
- Crypto speculation
- Conventional mutual funds
- Insurance products with riba

ALWAYS recommend (education only, not financial advice):
- Islamic Mutual Funds (Meezan, MCB-Arif Habib, etc.)
- Sukuk (government ijarah sukuk, hybrid sukuk)
- Modarabas
- Shariah-screened stocks (KMI-30 index)
- Halal REITs (SECP-regulated)
- Islamic NPCs (National Profit Certificates)
- Physical gold / gold-backed certificates
```

**Add investment form:**
```
- Type (dropdown from InvestmentType enum)
- Name/description
- Amount invested
- Current value
- Date of investment
- Platform/provider
- Risk level: Low | Medium | High
- Sharia status: User-confirmed | Unknown | Needs review
- Notes
```

**Investment milestone targets:**
```
Level 1: 10,000 PKR invested        → "Started! 🌱"
Level 2: 25,000 PKR
Level 3: 50,000 PKR
Level 4: 100,000 PKR                → "Six-figure portfolio 🎯"
Level 5: 250,000 PKR
Level 6: 500,000 PKR                → "Half million 💪"
Level 7: 1,000,000 PKR              → "Millionaire milestone 🏆"
Long-term: 50,000,000 PKR           → "Financially Free 🕊️"
```

**Education section (static content, shown progressively):**
```
Lesson 1: Why your cash loses value (inflation context: ~7% Pakistan 2026)
Lesson 2: What is investing and why it matters
Lesson 3: Risk vs return explained simply
Lesson 4: What is a mutual fund? (with Islamic example)
Lesson 5: What are Sukuk? (Islamic bonds)
Lesson 6: KMI-30 and Shariah-screened stocks
Lesson 7: Modarabas in Pakistan
Lesson 8: Gold as an investment
Lesson 9: REITs in Pakistan
Lesson 10: Diversification explained simply
```

**Disclaimer (always visible on investment pages):**
```
"MoneyMap PKR provides educational information only. This is not financial advice. 
Returns are assumptions, not guarantees. For Shariah rulings, consult a qualified 
Islamic scholar or Shariah advisor. For investment decisions, consult a licensed 
investment adviser or SECP-regulated platform."
```

---

### MODULE 13: FINANCIAL FREEDOM CALCULATOR

**Page:** `/financial-freedom`

**Target:** 50,000,000 PKR

**Inputs:**
```
- Current net worth (auto-pulled from NetWorthSnapshot)
- Monthly investment amount (editable)
- Expected annual return % (default: 10%, Islamic conservative estimate)
- Annual salary growth % (default: 10%)
- Pakistan inflation assumption (default: 8%)
- Target amount (default: 50,000,000)
```

**Formula:**
```
FV = PV × (1+r)^n + P × [(1+r)^n - 1] / r

Where:
  PV = current net worth
  P  = monthly investment
  r  = monthly return rate (annual rate / 12)
  n  = number of months
```

**Output scenarios (show all 5 simultaneously):**
```
Monthly Investment   → Years to 5 Crore
30,000 PKR          → ~24 years
50,000 PKR          → ~20 years
70,000 PKR          → ~18 years
90,000 PKR          → ~16 years
120,000 PKR         → ~14 years
```

**Personalized roadmap for this user:**
```
Year 1: Fix behavior → zero debt → emergency fund 100k
Year 2: Invest 30-50k/month consistently
Year 3+: Increase investment as salary grows
First milestone: 1,000,000 PKR net worth within 24-30 months

Timeline shown as interactive chart (Recharts area chart)
```

**Disclaimer on this page:**
```
"Projections are based on mathematical assumptions and are NOT guaranteed. 
Actual returns depend on market conditions, inflation, and investment choices."
```

---

### MODULE 14: REPORTS

**Page:** `/reports`

**Charts to build (all using Recharts):**
```
1. Monthly spending by category — Pie chart or Bar chart
2. Planned vs Actual — Grouped bar chart (monthly)
3. Debt payoff progress — Area/line chart over time
4. Emergency fund growth — Area chart
5. Net worth trend — Line chart (monthly snapshots)
6. Financial freedom progress — Gauge / radial bar
7. Leakage trend — Line chart (monthly leakage score)
8. Salary allocation — Pie chart (buckets)
9. Fixed vs flexible expenses — Stacked bar
10. Emotional spending breakdown — Bar chart by trigger type
```

**Monthly report (auto-generated at month end):**
```
MONTH: [Month Year]
─────────────────────────────
Total income:           180,000
Total expenses:        -165,000
Savings rate:             8.3%
Debt paid this month:  -45,000
Emergency fund added:   +8,000
Investment added:        +5,000

Biggest category:    Family Support (42,000)
Biggest leakage:     Unknown/Impulse (18,500)
Leakage score:       62/100 🟠

What went well:      [user fills in]
What went wrong:     [user fills in]
Next month plan:     [user fills in]
─────────────────────────────
AI Summary: "Your debt dropped by 45,000 this month — great progress! 
Your leakage is still high at 18,500. Focus on classifying all unknown 
transactions next month."
```

---

### MODULE 15: AI FINANCIAL COACH

**Page:** `/ai-coach`
**API Route:** `/api/ai-coach`

**Implementation:**

```typescript
// lib/ai.ts — AI service abstraction layer

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function getAICoachResponse(
  userMessage: string,
  financialContext: FinancialContext,
  conversationHistory: AiMessage[]
): Promise<string> {
  
  const systemPrompt = buildSystemPrompt(financialContext);
  
  const messages = [
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage }
  ];
  
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });
  
  return response.content[0].type === "text" ? response.content[0].text : "";
}

function buildSystemPrompt(ctx: FinancialContext): string {
  return `You are a compassionate, Islamic personal finance coach named "Rizq Coach" inside the MoneyMap PKR app.

USER'S CURRENT FINANCIAL SITUATION:
- Monthly salary: PKR ${ctx.monthlySalary.toLocaleString()}
- Total debt/qarza: PKR ${ctx.totalDebt.toLocaleString()}
- Emergency fund: PKR ${ctx.emergencyFund.toLocaleString()}
- Investment portfolio: PKR ${ctx.investments.toLocaleString()}
- Net worth: PKR ${ctx.netWorth.toLocaleString()}
- This month spent: PKR ${ctx.monthSpent.toLocaleString()}
- This month's leakage score: ${ctx.leakageScore}/100
- Free to spend this month: PKR ${ctx.freeToSpend.toLocaleString()}
- Financial freedom target: PKR 50,000,000
- Islamic finance mode: ON

YOUR RULES — NEVER VIOLATE THESE:
1. Never guarantee investment returns
2. Never give specific stock tips or name specific securities as "buy this"
3. Never make Shariah/fatwa rulings — say "please consult a qualified Shariah scholar"
4. Never recommend interest-based products
5. Never use shame or harsh language
6. Never suggest haram: interest, speculation, margin trading, gambling
7. Always focus on user's actual numbers, not generic advice
8. Use simple English — the user has low financial knowledge
9. Give ONE clear next action at the end of every response
10. Keep responses concise and practical, not lecture-like

YOUR PERSONALITY:
- Warm, encouraging, non-judgmental
- Like a wise older brother who knows finance
- Celebrate small wins enthusiastically
- Be honest about problems without shame
- Ground every answer in the user's real numbers

EXAMPLE QUESTIONS YOU HANDLE WELL:
- "Where did my money go this month?"
- "Can I afford to buy X right now?"
- "Should I join another committee?"
- "How can I clear my debt faster?"
- "What should I do right after salary?"
- "Why am I still struggling at 180k salary?"
- "What is my next best financial move?"
- "How much can I invest this month?"
- "Is this investment halal?"
- "How do I start saving?"`;
}

interface FinancialContext {
  monthlySalary: number;
  totalDebt: number;
  emergencyFund: number;
  investments: number;
  netWorth: number;
  monthSpent: number;
  leakageScore: number;
  freeToSpend: number;
}
```

**AI Coach UI:**
```
Chat interface (WhatsApp-style messages)
Quick prompt buttons at top:
  [Where did my money go?] [What should I do now?] [Can I afford this?] [Debt advice]

Input: text field + send button
Each AI response includes:
  - Main answer
  - ONE next action in a highlighted box: "Your next step: ..."
```

---

### MODULE 16: ZAKAT CALCULATOR

**Page:** `/zakat`

**Fields:**
```
- Cash at home (PKR)
- Bank balance (PKR)
- Investment value (PKR) — auto-pulled
- Gold/silver value (PKR)
- Receivables owed to you (PKR)
- Business inventory (PKR, optional)
- Debts due NOW that reduce zakatable wealth (PKR)
- Nisab value in PKR (user enters manually — check current silver/gold price)

Calculated:
  Total zakatable = sum of above - debts due now
  Zakat due = 2.5% × total zakatable (if above nisab)
```

**Disclaimer:**
```
"This is an estimate only. For precise Zakat calculation, consult a qualified 
Islamic scholar. Nisab value changes with gold/silver prices — update it regularly."
```

---

### MODULE 17: DAILY & WEEKLY CHECK-INS

**Triggered by reminders system (push notification or in-app banner)**

**Daily check-in (evening, after 8pm):**
```
"Daily Money Check-in"
Did you enter all expenses today? [Yes / Add now]
Any unplanned spending? [No / Log it]
Any cash taken out? [No / Log it]
Any money given to family/friends? [No / Log it]
```

**Weekly check-in (Sunday evening):**
```
"Weekly Money Review"
This week you spent: [auto-calculated]
Budget used: [% per category]
Debt progress: [on track / behind]
Any unclassified transactions: [N items need review]
One thing to do better next week: [AI suggestion]
```

---

### MODULE 18: SETTINGS & PROFILE

**Page:** `/settings`

**Sections:**
```
Profile:
  - Name, email, salary, salary date, freedom target

Preferences:
  - Islamic mode toggle
  - Strict mode toggle
  - Language (English only, v1)
  - Currency: PKR (locked v1)
  - Default payment method

Notifications/Reminders:
  - Salary allocation reminder
  - Daily expense entry reminder (time)
  - Weekly review reminder (day + time)
  - Debt due reminders
  - Committee payment reminders

Security:
  - App PIN (placeholder for v2)
  - Change password
  - Logout

Data:
  - Export data (CSV) — placeholder
  - Delete account

About:
  - App version
  - Islamic finance disclaimer
  - Privacy note
```

---

### MODULE 19: NET WORTH TRACKER

**Component within `/dashboard` and `/reports`**

```
Assets:
  Cash:            [user enters]
  Bank balance:    [user enters]
  Emergency fund:  [auto from EmergencyFundRecord]
  Savings:         [auto from goals]
  Investments:     [auto from Investment table]
  Gold:            [user enters]
  Property:        [user enters, optional]
  Receivables:     [user enters, optional]
  ─────────────────────
  Total Assets:    [calculated]

Liabilities:
  Qarza/debt:      [auto from Debt table]
  Committees owed: [auto from Committee table]
  Credit cards:    [user enters]
  Other:           [user enters]
  ─────────────────────
  Total Liabilities: [calculated]

NET WORTH = Total Assets - Total Liabilities
(For this user at start: likely negative — show this honestly with no shame)
```

**Monthly snapshot saved automatically (first day of each month)**

---

## UX REQUIREMENTS

### Mobile-First Design Rules
```
1. All tap targets: minimum 44px height
2. Bottom navigation bar (not sidebar) on mobile
3. Large number inputs with PKR numpad on mobile
4. Swipe to delete transactions
5. Pull-to-refresh on transaction list
6. All lists: infinite scroll or pagination
7. No horizontal scrolling on main content
8. All modals: slide up from bottom (not centered popup)
9. One primary action per screen
10. Success states: celebration animations on milestones
```

### PKR Formatting (CRITICAL)
```typescript
// lib/formatters.ts
export function formatPKR(amount: number): string {
  // Pakistani lakh/crore format
  if (amount >= 10000000) {
    return `₨ ${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₨ ${(amount / 100000).toFixed(2)} L`;
  } else {
    return `₨ ${amount.toLocaleString('en-PK')}`;
  }
}

// Examples:
// 180000 → ₨ 1.80 L
// 450000 → ₨ 4.50 L
// 50000000 → ₨ 5.00 Cr
// 15000 → ₨ 15,000
```

### Color System
```
Background:    #0F0F0F or #FAFAFA (offer dark mode later)
Primary:       #16A34A (green — growth, Islamic associations)
Danger/Debt:   #DC2626 (red)
Warning:       #D97706 (amber)
Success:       #059669 (emerald)
Info:          #2563EB (blue)
Text primary:  #111827
Text secondary:#6B7280
```

### Tone Rules for All UI Text
```
❌ Don't say: "You failed your budget"
✅ Do say: "Budget exceeded in Food — adjust or catch up next week"

❌ Don't say: "You wasted 18k on food delivery"
✅ Do say: "Food delivery used 18,000 PKR this month (9,000 over plan)"

❌ Don't say: "You have zero savings — this is bad"
✅ Do say: "No emergency fund yet — this month's plan allocates 15,000 toward it"

Rule: data + context + one action. Never shame. Always forward.
```

---

## STRICT MODE BEHAVIOR

When `strictMode = true` on user profile:

```
Show modal warning BEFORE:
  1. Any "Want" transaction over 2,000 PKR while debt > 0
  2. Adding new debt (always)
  3. Adding new committee while debt > 0
  4. Spending more than 100% of any bucket
  5. Any transaction in "Unknown" category without a note

Dashboard badge shows:
  "Strict Mode ON" — show what this protects the user from

Auto-alerts (in-app):
  - No expense entry for 2+ days: "Don't forget to track your spending"
  - Salary not allocated 3+ days after salary date: "Your salary needs a plan"
  - Leakage score > 70: "Your spending is off track this week"
```

---

## DATABASE SEED DATA

In `/prisma/seed.ts`, seed these for a new user:

```typescript
// Default categories (full list from MODULE 4)
// Default system goals (full milestone list from MODULE 11)
// Default salary allocation (180k default split)
// Default reminders (salary allocation, daily entry, weekly review)
// Example first month budget template

// Example first salary record for testing:
// amount: 180000, month: current month, year: current year
```

---

## ENVIRONMENT VARIABLES

```env
# .env.local
DATABASE_URL="postgresql://..."              # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ANTHROPIC_API_KEY="..."                      # For AI coach
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## PWA CONFIGURATION

```json
// public/manifest.json
{
  "name": "MoneyMap PKR",
  "short_name": "MoneyMap",
  "description": "Your Islamic Personal Finance Manager",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0F0F0F",
  "theme_color": "#16A34A",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Install `next-pwa` and configure in `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({ /* your Next.js config */ });
```

---

## BUILD PHASES (MVP PRIORITY ORDER)

### Phase 1 — Core (Build This First)
```
✅ Supabase project setup + Prisma schema + migrations
✅ Auth (login, register, logout)
✅ Onboarding (5-step flow)
✅ Dashboard (home screen with buckets)
✅ Salary allocation screen
✅ Quick-add transaction (modal, under 15s entry)
✅ Full transaction form
✅ Transaction list with filter/search
✅ Debt tracker (add, list, payoff plan)
✅ Committee tracker (add, list, burden calc)
✅ Budget (zero-based, category tracking)
✅ Emergency fund tracker with milestones
✅ Goals list (system milestones auto-seeded)
✅ Basic monthly report
✅ Settings page
✅ PKR formatting everywhere
✅ Bottom navigation bar
✅ PWA manifest + installable
```

### Phase 2 — Intelligence (Build After Phase 1 Works)
```
⬜ Fixed expense discovery algorithm
⬜ Leakage detector + leakage score
⬜ Financial freedom calculator + scenarios
⬜ Net worth tracker + monthly snapshots
⬜ AI Coach (basic Q&A using user's real data)
⬜ Reminders system (in-app banners)
⬜ Daily/weekly check-in prompts
⬜ Charts (Recharts implementation)
⬜ Monthly review auto-generation
⬜ Strict mode full implementation
```

### Phase 3 — Polish & Expand (After Phase 2)
```
⬜ Investment tracker + education content
⬜ Zakat calculator
⬜ Advanced reports (all 10 charts)
⬜ Debt payoff timeline chart
⬜ PWA polish (offline support, push notifications)
⬜ Data export (CSV)
⬜ App PIN / security
⬜ Performance optimization
⬜ Prepare REST API layer for future Flutter app
```

---

## ACCEPTANCE CRITERIA

The app is complete for Phase 1 when a user can:

1. Register and complete 5-step onboarding in under 5 minutes
2. Enter a salary of 180,000 PKR and allocate it across all 6 buckets
3. Add a transaction in under 15 seconds from the + button
4. See exactly how much is free to spend (not the full salary number)
5. Add a debt record with lender, amount, and monthly payment
6. Add a committee with monthly contribution and receiving month
7. See their total monthly committee burden as a single number
8. See a budget with planned vs actual for each category
9. See their emergency fund progress toward the 50,000 PKR milestone
10. See all system milestone goals and current progress
11. View a basic monthly summary with income, expenses, and savings rate
12. Open the app on their phone and have it feel like a native app (PWA)
13. See all amounts in PKR with lakh/crore formatting
14. Have Islamic mode ON by default with no interest recommendations

---

## CRITICAL REMINDERS FOR THE AI CODING TOOL

1. **Never show 180,000 as "available to spend"** — always show bucket breakdown
2. **PKR formatting everywhere** — use the `formatPKR()` utility, not raw numbers
3. **Islamic mode = always ON by default** — filter all investment recommendations
4. **Committee = a real financial obligation** — treat it like debt in cash flow calculations
5. **Mobile-first means bottom nav, not sidebar** — sidebar only collapses weirdly on phones
6. **Leakage is a feeling, not just a number** — the UI must make it visible and actionable
7. **Every AI response must end with ONE next action** — not a list of 10 things
8. **Prisma client must be a singleton** — use the global pattern to prevent connection pool issues
9. **Supabase RLS** — enable Row Level Security on all user tables in Supabase dashboard
10. **No financial guarantees** — all projections must show "estimated" or "assumed" labels
11. **Seed realistic data** — use 180k salary, 450k debt as defaults in seed.ts
12. **The user is a beginner** — every screen needs one-line plain English explanations

---

## START HERE

Build in this exact order:
1. `npx create-next-app@latest moneymap-pkr --typescript --tailwind --app`
2. Install: `npm install @prisma/client prisma @supabase/supabase-js @supabase/auth-helpers-nextjs react-hook-form zod recharts @anthropic-ai/sdk next-pwa`
3. Install shadcn: `npx shadcn@latest init`
4. Set up Supabase project → get connection strings → add to `.env.local`
5. Copy schema.prisma from this document → `npx prisma migrate dev --name init`
6. Create `lib/prisma.ts`, `lib/supabase.ts`, `lib/formatters.ts`
7. Build auth pages (login/register)
8. Build onboarding flow (5 steps)
9. Build dashboard
10. Build salary allocation
11. Build transaction quick-add modal
12. Continue through Phase 1 list

**Do not skip the schema.** The schema is the foundation. Build it fully before writing any UI.
```

---

*End of prompt. Feed this entire document to your AI coding tool.*
*Estimated Phase 1 build time: 2–4 days with Claude Code / Cursor on a focused session.*
