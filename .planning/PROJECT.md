# MoneyMap PKR

## What This Is

MoneyMap PKR is a mobile-first Progressive Web App (PWA) for Pakistani users who earn a salary but have no visibility into where their money goes. It is a personal Islamic finance manager that helps users track every rupee, eliminate debt, build savings, and work toward financial freedom — using zero-based budgeting, behavioral spending analysis, and an AI coach grounded in Islamic finance principles.

## Core Value

Make every rupee visible: users must always know exactly how much they have to spend across each bucket — never a misleading "total salary available" number.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Auth & Onboarding**
- [ ] User can register and log in with email/password (Supabase Auth)
- [ ] User completes 5-step onboarding: name/salary, debt/savings, freedom target, preferences, salary allocation preview
- [ ] App redirects to onboarding on first login; skips on subsequent logins

**Dashboard**
- [ ] Dashboard shows "Today's Action" banner with ONE clear action
- [ ] Dashboard shows salary summary card: allocated, spent, free-to-spend (never raw salary)
- [ ] Dashboard shows 6 budget bucket cards (Needs/Debt/Emergency/Investment/Personal/Buffer) with planned vs spent
- [ ] Dashboard shows quick stats: total debt, emergency fund, investments, net worth
- [ ] Dashboard shows leakage alert when leakage score > 50
- [ ] Dashboard shows next milestone progress bar
- [ ] Dashboard shows 5 most recent transactions

**Salary Allocation**
- [ ] User can confirm actual salary received each month and allocate it across 6 buckets
- [ ] System enforces that all rupees are assigned (total must equal salary)
- [ ] System warns when debt > 0 and investment bucket > emergency fund bucket
- [ ] System warns when personal bucket > 20% of salary while debt > 0

**Transactions**
- [ ] User can add a transaction in under 15 seconds via quick-add modal (amount → category → payment method)
- [ ] User can add a full transaction with type, category, bucket, payment method, date, note, planned/recurring flags, emotional trigger, money type
- [ ] Unknown-category transactions are highlighted and surfaced for review
- [ ] Transaction list supports filter and search
- [ ] Swipe-to-delete on transaction list items

**Debt / Qarza Tracker**
- [ ] User can add debts with lender name, type, amounts, monthly payment, due date, Islamic concern flag, urgency, emotional pressure
- [ ] Debt dashboard shows total remaining, monthly obligation, estimated debt-free date
- [ ] User can log debt payments
- [ ] Payoff planner offers 3 methods: Urgent First (default), Snowball, Markup First
- [ ] New debt warning in strict mode shows impact on debt-free date

**Committee Tracker**
- [ ] User can add committees with contribution, members, receiving month, manager, risk level
- [ ] System auto-calculates total committee value, expected payout, remaining months, net position
- [ ] Warning shown when total committee burden > 30% of salary
- [ ] Warning shown when adding new committee while debt > 0

**Budget System**
- [ ] Monthly zero-based budget with planned vs actual per category
- [ ] Color-coded progress bars: green/yellow/red/dark-red by percentage used
- [ ] Smart budget messages generated automatically (e.g., "You have 87% of personal used with 8 days left")

**Emergency Fund**
- [ ] Emergency fund tracker with 5 hardcoded milestones (50k → 100k → 180k → 540k → 1.08M PKR)
- [ ] Warning shown when emergency fund < 50k and wants spending > 10k

**Goals**
- [ ] 15 system milestone goals auto-seeded during onboarding (debt payoff → emergency fund → investment → net worth → freedom)
- [ ] Goal cards show progress bar, current/target amounts, estimated date
- [ ] Celebration animation on milestone achievement
- [ ] User can add custom goals

**Reports**
- [ ] Basic monthly report: income, expenses, savings rate, debt paid, emergency/investment added
- [ ] Monthly review form: what went well, what went wrong, next month plan

**Settings**
- [ ] User can update profile: name, email, salary, salary date, freedom target
- [ ] User can toggle Islamic mode and strict mode
- [ ] User can configure reminders: salary allocation, daily entry, weekly review, debt/committee due dates
- [ ] User can change password and log out

**PWA**
- [ ] App installs on Android/iPhone as a native-feeling PWA
- [ ] PKR formatting everywhere using lakh/crore notation (₨ 1.80 L, ₨ 4.50 L, ₨ 5.00 Cr)

**Fixed Expense Discovery (Phase 2)**
- [ ] Algorithm identifies true fixed, likely fixed, flexible, leakage, and obligation categories after 2+ months of data
- [ ] "Real monthly picture" breakdown shown to user

**Leakage Detector (Phase 2)**
- [ ] Leakage score 0–100 calculated from: unknown transactions, unplanned spending, emotional triggers, cash withdrawals, weekend patterns, category overruns
- [ ] Monthly leakage report shows top 5 leaks with actionable suggestions

**Financial Freedom Calculator (Phase 2)**
- [ ] Calculator shows 5 investment scenarios with years-to-5-crore projections
- [ ] Interactive chart showing personalized roadmap

**Net Worth Tracker (Phase 2)**
- [ ] Net worth snapshot: assets (cash, bank, emergency, savings, investments, gold, property, receivables) minus liabilities (debt, committees, credit cards)
- [ ] Monthly snapshot saved automatically on first day of each month

**AI Financial Coach (Phase 2)**
- [ ] Chat interface with context-aware responses grounded in user's real numbers
- [ ] Quick prompt buttons: where did my money go, what should I do now, can I afford this, debt advice
- [ ] Every AI response ends with ONE clear next action
- [ ] AI follows Islamic finance rules: no interest products, no speculation, no haram
- [ ] AI named "Rizq Coach" — warm, encouraging, non-judgmental tone

**Reminders & Check-ins (Phase 2)**
- [ ] Daily check-in prompt (evening): expenses logged, unplanned spending, cash out, family giving
- [ ] Weekly check-in (Sunday): spending summary, budget %, debt progress, unclassified items, AI suggestion
- [ ] In-app reminder banners for salary allocation, debt/committee payments

**Investment Tracker & Education (Phase 3)**
- [ ] Investment tracker with Islamic type enforcement (mutual funds, sukuk, modarabas, KMI-30, gold, REITs, NPCs)
- [ ] Sharia status flagging on each investment
- [ ] 10-lesson progressive investment education content
- [ ] Investment milestone levels from 10k to 50M PKR

**Zakat Calculator (Phase 3)**
- [ ] Zakat calculation from cash, bank, investments, gold, receivables, business goods, minus debts due
- [ ] Disclaimer: estimate only, consult a qualified Islamic scholar

**Advanced Reports (Phase 3)**
- [ ] 10 Recharts visualizations: spending by category, planned vs actual, debt payoff progress, emergency fund growth, net worth trend, freedom progress gauge, leakage trend, salary allocation pie, fixed vs flexible, emotional spending breakdown

**PWA Polish (Phase 3)**
- [ ] Offline support
- [ ] Push notifications for reminders
- [ ] Data export (CSV)
- [ ] App PIN / security layer
- [ ] REST API layer prepared for future Flutter app

**Strict Mode (Full — Phase 3)**
- [ ] Full-screen warning before any want > 2,000 PKR while debt > 0
- [ ] Warning before adding any new debt (always)
- [ ] Warning before adding new committee while debt > 0
- [ ] Warning before spending > 100% of any bucket
- [ ] Warning before any unknown-category transaction without a note
- [ ] Dashboard badge shows "Strict Mode ON"
- [ ] Auto-alerts: no expense entry 2+ days, salary not allocated 3+ days, leakage score > 70

### Out of Scope

- Multi-currency support — PKR only in v1; adding multi-currency before product-market fit adds complexity with no user benefit
- Urdu/other languages — English only in v1; localization is post-v1 work
- Flutter/React Native app — backend must be API-first to support this later, but native apps are not in scope now
- Financial advice / Shariah rulings — app provides education and tools only; disclaimers on every projection and investment page
- Social features (sharing, groups) — personal finance tool first
- Open Banking / bank sync — manual entry only in v1; API integrations are post-PMF

## Context

MoneyMap PKR targets Pakistani salaried workers who earn a decent salary (100k–300k PKR/month) but struggle with debt, no savings, and no visibility into cash flow. The root problem is behavioral: no system, not no income. Pakistan-specific nuances shape the product significantly:

- **Committee system**: Rotating savings groups (committees) are a major monthly obligation that most finance apps ignore. This app treats committees like a first-class financial object.
- **Islamic finance**: Default Islamic mode filters out all interest-based products and recommendations. All investment education uses halal vehicles only.
- **Emotional spending triggers**: Family pressure, friends, stress spending are named explicitly — the app surfaces these patterns without shame.
- **PKR formatting**: Lakh and crore notation is standard (₨ 1.80 L, not ₨ 180,000) and must be used everywhere.
- **Low financial literacy**: Every screen needs one-line plain English explanations. The user is a beginner.

**Technical context:**
- Stack considered: Next.js 14+ (App Router), Supabase (auth + Postgres), Prisma (ORM), Recharts, React Hook Form + Zod, next-pwa, Anthropic Claude API
- Stack is open to reconsideration during research phase — the key constraint is AI code generation compatibility and fast-to-build-MVP
- Backend must be API-first (Server Actions / API routes) so a Flutter frontend can be added later with the same backend
- Supabase Row Level Security must be enabled on all user tables
- Prisma singleton pattern required to avoid connection pool issues

## Constraints

- **Islamic finance (hard)**: All investment recommendations must be halal. Never recommend interest-bearing products, margin trading, crypto speculation, or conventional insurance. If Islamic mode is ON (default), enforce everywhere.
- **PKR formatting (hard)**: `formatPKR()` utility must be used everywhere. Raw numbers without lakh/crore formatting are a UX failure.
- **Mobile-first (hard)**: Bottom nav bar (not sidebar), 44px tap targets, slide-up modals, no horizontal scrolling, large PKR number inputs.
- **No financial guarantees**: All projections labeled "estimated" or "assumed". Zakat and investment pages must carry disclaimers.
- **Transaction entry speed**: Quick-add modal must be completable in under 15 seconds on mobile.
- **Never show raw salary as "available to spend"**: Always show bucket-divided view. This is the core behavioral contract.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + Supabase + Prisma stack | Fast MVP, AI code generation compatible, scales to production, Flutter-ready backend | — Open to research |
| Zero-based budgeting as default budget type | Forces every rupee to have a job — matches the core behavioral goal | — Pending |
| Committee tracker as first-class feature (not just a debt category) | Committees are a major cash flow item in Pakistan, invisible in most finance apps | — Pending |
| Islamic mode ON by default (not opt-in) | The target market is Muslim-majority Pakistan; makes the right default the easy one | — Pending |
| Manual entry only (v1) | Reduces scope and complexity; open banking APIs in Pakistan are immature | — Pending |
| "Rizq Coach" AI persona | Warm, encouraging Islamic branding fits the cultural context and product tone | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-01 after initialization*
