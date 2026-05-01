# Roadmap: MoneyMap PKR

## Overview

MoneyMap PKR starts by locking the technical foundation and onboarding path, then builds the core money loop in layers: salary allocation and transactions, budget obligations, dashboard and goals, and finally v1 reporting, settings, and PWA polish. This ordering keeps the product faithful to the core value: every rupee must be visible by bucket before analytics or coaching are added.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions, marked with INSERTED

- [ ] **Phase 1: Foundation, Auth, and Onboarding** - Establish stack, database safety, auth, profile sync, and first-run onboarding. Implementation scaffold built; Supabase verification pending.
- [ ] **Phase 2: Salary Allocation and Transactions** - Build the core money entry loop: confirmed salary, buckets, and fast transaction logging.
- [ ] **Phase 3: Budgets, Debt, and Committees** - Turn money records into actionable budget, Qarza, and committee management.
- [ ] **Phase 4: Goals and Dashboard** - Surface progress, milestones, recent activity, and bucket status in one mobile-first dashboard.
- [ ] **Phase 5: Reports, Settings, and PWA Polish** - Complete v1 with monthly review, settings, reminders, installability, and mobile ergonomics.

## Phase Details

### Phase 1: Foundation, Auth, and Onboarding
**Goal**: A secure installable project foundation exists, users can register, and first-time users can complete onboarding with salary, preferences, and seeded milestones.
**Depends on**: Nothing (first phase)
**Requirements**: [FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can register, log in, log out, refresh the browser, and remain correctly authorized.
  2. First-time user is routed through a five-step mobile onboarding flow and later bypasses it once complete.
  3. Database schema, migrations, RLS policies, Prisma singleton, and user-scoped query conventions exist before feature data screens are built.
  4. PKR formatting is centralized and available to all UI and server code.
  5. System milestones are seeded during onboarding.
**Plans**: 4 plans

Plans:
- [ ] 01-01: Scaffold Next.js, TypeScript, Tailwind, shadcn/ui, Supabase, Prisma, and environment conventions.
- [ ] 01-02: Define Prisma schema, Supabase profile trigger, RLS policy templates, migration setup, and user-scoped data access helpers.
- [ ] 01-03: Implement Supabase auth routes, middleware, session verification, profile creation, and onboarding gate.
- [ ] 01-04: Build five-step onboarding, preferences capture, salary day handling, milestone seeding, and PKR utility coverage.

### Phase 2: Salary Allocation and Transactions
**Goal**: User can confirm salary, assign every rupee to buckets, and log Pakistan-local transactions quickly on mobile.
**Depends on**: Phase 1
**Requirements**: [ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05, TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can confirm monthly salary and allocate it across six buckets with every rupee assigned.
  2. App shows allocation warnings for debt, emergency fund, investment, and personal-spending risk.
  3. User can add a common transaction on mobile in under 15 seconds.
  4. User can search, filter, edit, and delete only their own transactions.
  5. Unknown-category transactions are highlighted for review.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Build salary confirmation, six-bucket allocation data model, validation, and warning rules.
- [ ] 02-02: Build transaction CRUD, Pakistan-local categories/payment methods, emotional triggers, and strict user scoping.
- [ ] 02-03: Build mobile quick-add, transaction list search/filter, unknown-category surfacing, and edit/delete interactions.

### Phase 3: Budgets, Debt, and Committees
**Goal**: User can see planned versus actual budget state, manage debts, and model committees as first-class obligations.
**Depends on**: Phase 2
**Requirements**: [BUDG-01, BUDG-02, BUDG-03, BUDG-04, DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, COMM-01, COMM-02, COMM-03, COMM-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can see monthly planned versus actual spending per bucket and category.
  2. Budget progress uses clear color states and practical messages rather than shame-heavy copy.
  3. User can add debts, log payments, and compare payoff strategies.
  4. User can add committees and see payout, remaining months, net position, and burden warnings.
  5. Strict mode warns before risky debt or committee actions.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Generate monthly budgets from allocations and display planned-versus-actual bucket/category progress.
- [ ] 03-02: Implement Qarza/debt tracker, payment logging, payoff strategy comparison, and strict-mode debt warning.
- [ ] 03-03: Implement committee tracker, burden calculations, net position, and committee/debt warning rules.

### Phase 4: Goals and Dashboard
**Goal**: User can understand today's financial position from goals, emergency fund progress, bucket state, and recent activity without seeing raw salary as spendable cash.
**Depends on**: Phase 3
**Requirements**: [GOAL-01, GOAL-02, GOAL-03, GOAL-04, GOAL-05, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can track emergency fund progress across the five system milestones.
  2. User can view system milestone progress, create custom goals, and see milestone achievement feedback.
  3. Dashboard shows one Today's Action plus bucket, debt, emergency, investment, net worth, and recent transaction summaries.
  4. Dashboard never presents raw salary as available spending money.
  5. Dashboard is a read aggregate built from already-implemented data sources.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Build emergency fund milestones, custom goals, system milestone progress, and achievement feedback.
- [ ] 04-02: Build dashboard aggregate service for buckets, recent transactions, debt, committee, emergency, and goal status.
- [ ] 04-03: Build mobile dashboard UI with Today's Action, salary/bucket cards, quick stats, milestone progress, and recent activity.

### Phase 5: Reports, Settings, and PWA Polish
**Goal**: v1 is complete: user can review the month, adjust preferences, install the app, and use it comfortably on mobile.
**Depends on**: Phase 4
**Requirements**: [RPT-01, RPT-02, SET-01, SET-02, SET-03, PWA-01, PWA-02]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can view a basic monthly report and complete a monthly review.
  2. User can update profile, salary, salary day, freedom target, Islamic mode, strict mode, and reminder settings.
  3. App is installable as a PWA with manifest, service worker baseline, icons, and iOS install guidance.
  4. Mobile UI uses bottom navigation, 44px tap targets, large PKR inputs, and no horizontal scrolling.
  5. v1 requirements remain fully mapped and ready for verification.
**Plans**: 3 plans

Plans:
- [ ] 05-01: Build monthly report and monthly review flow.
- [ ] 05-02: Build settings, profile update, preference toggles, and reminder configuration.
- [ ] 05-03: Add PWA manifest/service-worker baseline, icons, install guidance, mobile polish pass, and v1 verification sweep.

## Deferred Milestones

### v2: Intelligence and Analysis

After users have at least one full month of transaction data, build fixed/flexible discovery, leakage scoring, net worth snapshots, AI Rizq Coach, financial freedom calculator, and check-ins.

### v3: Advanced Platform

After PMF signals, build halal investment tracking, Zakat calculator, advanced analytics, offline support, push notifications, CSV export, app PIN, and Flutter-ready REST API coverage.

## Progress

**Execution Order:**
Phases execute in numeric order: 1, 2, 3, 4, 5.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Auth, and Onboarding | 4/4 implemented | In progress | - |
| 2. Salary Allocation and Transactions | 0/3 | Not started | - |
| 3. Budgets, Debt, and Committees | 0/3 | Not started | - |
| 4. Goals and Dashboard | 0/3 | Not started | - |
| 5. Reports, Settings, and PWA Polish | 0/3 | Not started | - |
