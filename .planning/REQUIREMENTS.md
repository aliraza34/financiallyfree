# Requirements: MoneyMap PKR

**Defined:** 2026-05-01
**Core Value:** Make every rupee visible: users must always know exactly how much they have to spend across each bucket, never a misleading total salary available number.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: App uses Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and Supabase as the baseline stack.
- [ ] **FOUND-02**: App defines all core Prisma models needed for v1 money records before feature UI work begins.
- [ ] **FOUND-03**: App uses separate `DATABASE_URL` and `DIRECT_URL` values for runtime queries and migrations.
- [ ] **FOUND-04**: App uses a single Prisma client singleton and never creates ad hoc Prisma clients.
- [ ] **FOUND-05**: App enables RLS on user-owned public tables with `TO authenticated`, indexed `user_id`, and `WITH CHECK` protections.
- [ ] **FOUND-06**: App scopes every Prisma read and write by authenticated user ID.
- [ ] **FOUND-07**: App formats all PKR amounts through one `formatPKR()` utility using lakh/crore notation.

### Authentication

- [ ] **AUTH-01**: User can register with email and password through Supabase Auth.
- [ ] **AUTH-02**: User can log in, log out, and keep a verified session across page refreshes.
- [ ] **AUTH-03**: Server-side auth checks use `getUser()` and never trust `getSession()` for authorization.
- [ ] **AUTH-04**: A profile row is automatically created for every new auth user.
- [ ] **AUTH-05**: First-time users are redirected to onboarding until onboarding is complete.

### Onboarding

- [ ] **ONBD-01**: User can complete onboarding in five steps: salary, debt/savings, freedom target, preferences, and allocation preview.
- [ ] **ONBD-02**: User can set salary amount and salary day without assuming the first day of the month.
- [ ] **ONBD-03**: User can choose Islamic mode and strict mode during onboarding.
- [ ] **ONBD-04**: App seeds 15 system financial milestones during onboarding.
- [ ] **ONBD-05**: Onboarding can be completed on a mobile device in under 5 minutes.

### Salary Allocation

- [ ] **ALLOC-01**: User can confirm actual salary received for a month.
- [ ] **ALLOC-02**: User can allocate salary across Needs, Debt, Emergency, Investment, Personal, and Buffer buckets.
- [ ] **ALLOC-03**: App requires every rupee of salary to be assigned before allocation is finalized.
- [ ] **ALLOC-04**: App warns when investment allocation is risky while debt exists or emergency savings are low.
- [ ] **ALLOC-05**: App warns when personal spending allocation exceeds safe thresholds while debt exists.

### Transactions

- [ ] **TXN-01**: User can add a transaction from a mobile quick-add flow in under 15 seconds.
- [ ] **TXN-02**: User can record transaction type, amount, category, bucket, payment method, date, note, planned flag, recurring flag, emotional trigger, and money type.
- [ ] **TXN-03**: User can use Pakistan-local categories and payment methods including cash, EasyPaisa, JazzCash, SadaPay, NayaPay, Raast, bank transfer, and cards.
- [ ] **TXN-04**: User can filter and search the transaction list.
- [ ] **TXN-05**: User can edit and delete their own transactions.
- [ ] **TXN-06**: App highlights unknown-category transactions for later review.

### Budgets

- [ ] **BUDG-01**: App generates a monthly zero-based budget from the confirmed salary allocation.
- [ ] **BUDG-02**: User can see planned versus actual spending per bucket and category.
- [ ] **BUDG-03**: App uses color-coded progress states instead of shame-heavy negative copy.
- [ ] **BUDG-04**: App shows smart budget messages when spending pace is risky.

### Debt and Committees

- [ ] **DEBT-01**: User can add debts with lender, type, original amount, remaining amount, monthly payment, due date, Islamic concern flag, urgency, and emotional pressure.
- [ ] **DEBT-02**: User can see total remaining debt, monthly obligation, and estimated debt-free date.
- [ ] **DEBT-03**: User can log debt payments and update remaining balances.
- [ ] **DEBT-04**: User can compare Urgent First, Snowball, and Markup First payoff strategies.
- [ ] **DEBT-05**: Strict mode warns before adding new debt and shows impact on debt-free date.
- [ ] **COMM-01**: User can add committees with contribution, member count, receiving month, manager, and risk level.
- [ ] **COMM-02**: App calculates committee value, expected payout, remaining months, and net position.
- [ ] **COMM-03**: App warns when committee burden exceeds 30% of salary.
- [ ] **COMM-04**: App warns when adding a committee while debt exists.

### Emergency Fund and Goals

- [ ] **GOAL-01**: User can track emergency fund progress across five hardcoded milestones from 50k PKR to a six-month fund.
- [ ] **GOAL-02**: App warns when emergency fund is below 50k PKR and wants spending exceeds 10k PKR.
- [ ] **GOAL-03**: User can view progress on 15 system financial milestones.
- [ ] **GOAL-04**: User can create and track custom goals.
- [ ] **GOAL-05**: App shows a milestone celebration when a goal is achieved.

### Dashboard and Reports

- [ ] **DASH-01**: Dashboard shows one clear Today's Action banner.
- [ ] **DASH-02**: Dashboard shows salary allocation, spent amount, and free-to-spend amounts without presenting raw salary as available cash.
- [ ] **DASH-03**: Dashboard shows six bucket cards with planned versus spent progress.
- [ ] **DASH-04**: Dashboard shows total debt, emergency fund, investments, and net worth quick stats.
- [ ] **DASH-05**: Dashboard shows next milestone progress and five most recent transactions.
- [ ] **RPT-01**: User can view a basic monthly report with income, expenses, savings rate, debt paid, and emergency/investment additions.
- [ ] **RPT-02**: User can complete a monthly review with what went well, what went wrong, and next month plan.

### Settings and PWA

- [ ] **SET-01**: User can update name, email, salary, salary day, and freedom target.
- [ ] **SET-02**: User can toggle Islamic mode and strict mode.
- [ ] **SET-03**: User can configure reminders for salary allocation, daily entry, weekly review, and debt/committee due dates.
- [ ] **PWA-01**: App is installable as a PWA on Android and iPhone.
- [ ] **PWA-02**: App uses mobile-first navigation with bottom nav, 44px tap targets, large amount inputs, and no horizontal scrolling.

## v2 Requirements

### Intelligence and Analysis

- **INTEL-01**: App identifies fixed, likely fixed, flexible, leakage, and obligation categories after at least two months of data.
- **INTEL-02**: App calculates a leakage score from unknown transactions, unplanned spending, emotional triggers, cash withdrawals, weekend patterns, and overruns.
- **INTEL-03**: App shows a monthly top-five leakage report with actionable suggestions.
- **INTEL-04**: App tracks net worth snapshots over time.
- **INTEL-05**: AI Rizq Coach answers user questions from compressed financial context and ends every response with one clear action.
- **INTEL-06**: Financial freedom calculator projects five Islamic investment scenarios toward a 5 crore PKR target.
- **INTEL-07**: App shows daily, weekly, and monthly check-in prompts.

## v3 Requirements

### Advanced Platform

- **ADV-01**: User can track halal investments with Sharia status flags.
- **ADV-02**: User can estimate Zakat with disclaimers to consult a qualified scholar.
- **ADV-03**: User can view advanced historical analytics across at least 10 chart types.
- **ADV-04**: App supports offline transaction entry with conflict handling.
- **ADV-05**: App supports push notifications where platform support allows.
- **ADV-06**: User can export financial data as CSV.
- **ADV-07**: App exposes REST API routes needed for a future Flutter client.
- **ADV-08**: App supports an optional app PIN/security layer.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-currency support | PKR-only keeps v1 focused and culturally specific. |
| Urdu or RTL localization | Valuable later, but doubles UI/testing scope before the core loop is validated. |
| Native Flutter or React Native app | Web PWA ships first; API-first choices keep native app possible later. |
| Bank sync or open banking | Manual entry avoids immature integrations and keeps v1 buildable. |
| Stock execution or brokerage | Requires regulatory work and is not a budgeting MVP feature. |
| Crypto tracking or speculation | Conflicts with Islamic mode and introduces legal/behavioral risk. |
| Social sharing or groups | Personal money clarity is the first product value. |
| Guaranteed financial or Shariah advice | App provides education and estimates only. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| FOUND-07 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| ONBD-01 | Phase 1 | Pending |
| ONBD-02 | Phase 1 | Pending |
| ONBD-03 | Phase 1 | Pending |
| ONBD-04 | Phase 1 | Pending |
| ONBD-05 | Phase 1 | Pending |
| ALLOC-01 | Phase 2 | Pending |
| ALLOC-02 | Phase 2 | Pending |
| ALLOC-03 | Phase 2 | Pending |
| ALLOC-04 | Phase 2 | Pending |
| ALLOC-05 | Phase 2 | Pending |
| TXN-01 | Phase 2 | Pending |
| TXN-02 | Phase 2 | Pending |
| TXN-03 | Phase 2 | Pending |
| TXN-04 | Phase 2 | Pending |
| TXN-05 | Phase 2 | Pending |
| TXN-06 | Phase 2 | Pending |
| BUDG-01 | Phase 3 | Pending |
| BUDG-02 | Phase 3 | Pending |
| BUDG-03 | Phase 3 | Pending |
| BUDG-04 | Phase 3 | Pending |
| DEBT-01 | Phase 3 | Pending |
| DEBT-02 | Phase 3 | Pending |
| DEBT-03 | Phase 3 | Pending |
| DEBT-04 | Phase 3 | Pending |
| DEBT-05 | Phase 3 | Pending |
| COMM-01 | Phase 3 | Pending |
| COMM-02 | Phase 3 | Pending |
| COMM-03 | Phase 3 | Pending |
| COMM-04 | Phase 3 | Pending |
| GOAL-01 | Phase 4 | Pending |
| GOAL-02 | Phase 4 | Pending |
| GOAL-03 | Phase 4 | Pending |
| GOAL-04 | Phase 4 | Pending |
| GOAL-05 | Phase 4 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| DASH-05 | Phase 4 | Pending |
| RPT-01 | Phase 5 | Pending |
| RPT-02 | Phase 5 | Pending |
| SET-01 | Phase 5 | Pending |
| SET-02 | Phase 5 | Pending |
| SET-03 | Phase 5 | Pending |
| PWA-01 | Phase 5 | Pending |
| PWA-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 58 total
- Mapped to phases: 58
- Unmapped: 0

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 after initial definition*
