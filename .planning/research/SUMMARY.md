# Project Research Summary

**Project:** MoneyMap PKR
**Domain:** Pakistan-local Islamic personal finance / budgeting PWA
**Researched:** 2026-05-01
**Confidence:** HIGH for stack and architecture, MEDIUM-HIGH for domain feature assumptions

## Executive Summary

MoneyMap PKR should be built as a mobile-first, installable Next.js App Router PWA backed by Supabase Auth/Postgres and Prisma. The research strongly supports a data-first foundation: auth, profile sync, all core Prisma models, RLS policies, PKR formatting, and user-scoped database access must be established before dashboard or analytics work begins.

The product is differentiated by Pakistan-specific money behavior rather than generic expense tracking. Committee tracking, Qarza/debt framing, Islamic finance defaults, PKR lakh/crore formatting, cash-first payments, emotional spending triggers, and zero-based salary bucket allocation are table-stakes for this audience. Generic global finance app patterns will miss the core value unless these local constraints are built into the first release.

The highest technical risks are predictable and avoidable: incorrect Supabase/Prisma connection strings, weak server-side auth via `getSession()`, missing Prisma singleton, relying on RLS alone while Prisma bypasses `auth.uid()`, and building read-heavy dashboards before the underlying data layers exist. Phase 1 should front-load these structural safeguards.

## Key Findings

### Recommended Stack

Use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Prisma, React Hook Form, Zod, Recharts, and Vercel. The stack is strongly aligned with rapid MVP delivery, AI-assisted implementation, and a future Flutter API surface.

**Core technologies:**
- Next.js App Router: PWA, Server Actions, Route Handlers, and Vercel deployment.
- Supabase: Auth, Postgres, profile trigger, and RLS defense-in-depth.
- Prisma: Typed data access, migrations, schema ownership, and predictable model evolution.
- shadcn/ui + Tailwind CSS: fast accessible UI scaffolding with mobile-first controls.
- React Hook Form + Zod: form validation shared between client and server boundaries.
- Recharts: dashboard, report, and calculator visualizations.
- Anthropic TypeScript SDK: Phase 2 AI Rizq Coach with server-side streaming.

Avoid `next-pwa`, Pages Router, Firebase/Firestore, Auth.js alongside Supabase Auth, Tailwind v3 on new shadcn v4 work, GraphQL/Apollo, and speculative global state libraries in Phase 1.

### Expected Features

**Must have for v1:**
- Email/password auth and onboarding with salary, debt, freedom target, preferences, and allocation preview.
- Zero-based salary allocation across Needs, Debt, Emergency, Investment, Personal, and Buffer buckets.
- Fast transaction logging with category, payment method, emotional trigger, and bucket assignment.
- Pakistan-local payment methods and categories, including Cash, EasyPaisa, JazzCash, SadaPay, NayaPay, Raast, school fees, eid gifts, rishta, family kharch, and utilities.
- Debt/Qarza tracker with Islamic concern flag, monthly payment, urgency, and payoff estimate.
- Committee tracker with contribution, member count, receiving month, risk level, burden warnings, and net position.
- Budget planned-vs-actual view, emergency fund milestones, system financial goals, basic monthly report, settings, PKR formatting, and installable PWA behavior.

**Should have as competitive differentiators:**
- Islamic mode ON by default with halal investment framing.
- Behavioral leakage score and monthly leak report.
- AI Rizq Coach grounded in the user actual PKR numbers.
- Financial freedom roadmap and PKR 5 crore calculator.
- Fixed/flexible expense discovery after enough transaction history exists.

**Defer until later phases:**
- Advanced investment tracking, Zakat calculator, 10-chart analytics suite, offline queue, push notifications, app PIN, CSV export, and full Flutter REST API surface.

### Architecture Approach

The app should be layered so every later feature depends on a stable foundation. Supabase owns identity, Prisma owns public app data, and every Prisma query must be scoped by authenticated `userId` at the application layer because Prisma does not set Supabase `auth.uid()`.

**Major components:**
1. Foundation: full Prisma schema, RLS migrations, dual connection strings, Prisma singleton, Supabase clients, auth middleware, and `formatPKR()`.
2. Identity and onboarding: Supabase Auth, `profiles` trigger, onboarding gate, preferences, and system milestone seeding.
3. Core money loop: salary allocations, categories, transactions, budgets, debts, committees, emergency fund, goals, and dashboard aggregate reads.
4. Intelligence layer: reports, leakage detection, net worth snapshots, monthly reviews, AI context builder, streaming AI coach, and freedom calculator.
5. Advanced platform layer: investments, Zakat, offline support, push notifications, export, security layer, and Flutter-ready REST endpoints.

### Critical Pitfalls

1. **Wrong Prisma connection string for migrations:** Use pooled `DATABASE_URL` for runtime and direct `DIRECT_URL` for migrations from day one.
2. **Missing Prisma migration role permissions:** Create a dedicated Supabase migration user with appropriate privileges before the first migration.
3. **Using `getSession()` for server authorization:** Always use `supabase.auth.getUser()` on the server and preserve the Supabase middleware response object.
4. **Missing Prisma singleton:** Create `lib/prisma.ts` first and prohibit additional `new PrismaClient()` calls.
5. **Assuming RLS protects Prisma queries:** Scope every Prisma read and write with `userId`; RLS is defense-in-depth, not the primary Prisma authorization layer.

## Implications for Roadmap

### Phase 1: Foundation + Core Loop
**Rationale:** The core behavioral promise only works when salary allocation, transaction logging, debt, committees, emergency fund, goals, and dashboard reads share the same reliable data model.
**Delivers:** Installable authenticated PWA with onboarding, ZBB buckets, transaction entry, budget status, debts, committees, emergency fund, goals, dashboard, settings, and PKR formatting.
**Addresses:** All v1 table-stakes features and the most severe auth/database/PWA risks.
**Avoids:** Schema churn, RLS bypass mistakes, dashboard rebuilds, and generic finance-app behavior.

### Phase 2: Intelligence + Analysis
**Rationale:** Leakage detection and AI advice need real transaction history; they should begin after the core loop creates useful data.
**Delivers:** Monthly reports, review workflow, leakage score, fixed/flexible discovery, net worth snapshots, AI Rizq Coach, financial freedom calculator, and reminder prompts.
**Uses:** Anthropic streaming, Recharts, compressed financial context, and daily AI call limits.
**Implements:** Behavioral finance and coaching differentiators.

### Phase 3: Advanced + Platform Readiness
**Rationale:** Advanced analytics, investment tools, Zakat, offline behavior, and Flutter API readiness should wait until PMF signals justify broader platform complexity.
**Delivers:** Halal investment tracking, Zakat calculator, advanced reports, offline PWA, push notifications, CSV export, app PIN, and REST API surface.
**Implements:** Long-term retention and future mobile-platform foundations.

### Phase Ordering Rationale

- Build identity, schema, authorization, and core money records before aggregate screens or analytics.
- Ship the visible money loop before AI so coaching is grounded in actual user data.
- Keep advanced platform investments out of v1 until the product validates that users log transactions and maintain budgets.
- Treat committee and Qarza support as Phase 1 differentiators, not optional polish.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Supabase + Prisma migration setup, RLS policy templates, auth middleware, and mobile PWA install behavior.
- **Phase 2:** Anthropic model selection, AI context compression, leakage scoring rubric, and push notification support.
- **Phase 3:** Zakat copy/legal review, Serwist/offline queue architecture, and Flutter REST API contract.

Phases with standard patterns:
- **Phase 1 UI forms:** React Hook Form + Zod + shadcn patterns are well documented.
- **Basic reports:** Recharts and grouped Prisma queries are standard once the data model is stable.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js, Supabase, Prisma, shadcn/ui, forms, validation, and charts are established choices for this MVP. |
| Features | MEDIUM-HIGH | Table stakes are clear; Pakistan-specific behavior should still be validated with target users. |
| Architecture | HIGH | Auth, profile sync, RLS, Prisma singleton, and API-first constraints are well understood. |
| Pitfalls | HIGH | The highest-risk implementation mistakes are known and can be guarded in Phase 1. |

**Overall confidence:** HIGH for moving into roadmap creation.

### Gaps to Address

- Primary user research is still missing; run at least 5 interviews before relying heavily on behavioral assumptions.
- Verify current SadaPay, NayaPay, Meezan, and local competitor feature sets before public positioning.
- Verify Anthropic model IDs, pricing, and rate limits at Phase 2 implementation time.
- Test PWA install and notification behavior on real Pakistani Android and iPhone devices.
- Decide PKR amount storage (`Decimal` vs paisa integer) before writing the first Prisma model.
- Decide the exact Phase 1 REST endpoints needed for future Flutter readiness.

## Sources

### Primary
- Next.js official PWA/App Router documentation.
- Supabase documentation for Auth, Next.js integration, Prisma integration, and RLS.
- Prisma documentation for Next.js singleton, Supavisor/pgBouncer, migrations, and query performance.
- Recharts documentation.
- Serwist documentation.

### Secondary
- shadcn/ui documentation and common App Router implementation patterns.
- Pakistan payment ecosystem and Islamic finance product context.
- Personal finance app UX patterns from YNAB/Mint-style budgeting tools.

### Needs Validation
- Current competitor feature sets for SadaPay, NayaPay, and Meezan app experiences.
- AI coach model choice and cost controls at implementation time.
- Real-device PWA support across the target user base.

---
*Research completed: 2026-05-01*
*Ready for roadmap: yes*
