const fs = require('fs');
const path = 'd:\\Ali Raza\\github alichack34\\finance-app\\financiallyfree\\.planning\\research\\SUMMARY.md';

const content = `# Research Summary - MoneyMap PKR

**Synthesized:** 2026-05-01
**Source files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall confidence:** HIGH (stack/architecture verified against official docs; features MEDIUM-HIGH)

---

## Recommended Stack

| Layer | Chosen | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Next.js App Router | ^15.1.8 | Current stable; only path for PWA manifest + Server Actions; largest LLM training corpus |
| Language | TypeScript | 5.x (bundled) | Non-negotiable for AI-assisted codegen; reduces bug rate significantly |
| Styling | Tailwind CSS | ^4.x | Required by shadcn/ui v4; ships as CSS plugin, no PostCSS needed |
| UI Components | shadcn/ui | 2.9.0 / v4 | Copy-paste model; AI tools scaffold correctly; Radix accessibility base |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + RLS) | v1.26+ | Managed Postgres, built-in auth, RLS, Flutter client libs ready |
| ORM | Prisma | ^6.19.2 | Best AI codegen support; declarative schema; requires singleton + dual connection strings |
| Forms | React Hook Form | ^7.66.0 | Minimal re-renders; native shadcn/ui integration |
| Validation | Zod | ^3.x | zodResolver for forms; same schema reused at API layer |
| Charts | Recharts | ^3.3.0 | React SVG charts; ResponsiveContainer; active 2025 maintenance |
| PWA (Phase 1) | Built-in manifest.ts + manual sw.js | - | No plugin needed for installable PWA; next-pwa is abandoned |
| PWA (Phase 3) | Serwist | ^9.x | Official recommendation for offline caching in Next.js App Router |
| AI Coach | Anthropic TypeScript SDK | latest | Streaming via messages.stream(); server-side only; API-key gated |
| Hosting | Vercel | - | Zero-config Next.js; serverless works with Prisma singleton; free tier covers MVP |

Do not use: next-pwa (abandoned 2022), Pages Router, Firebase/Firestore, Auth.js alongside Supabase Auth, Tailwind v3, GraphQL/Apollo, Zustand in Phase 1.

Critical config: Prisma requires two env vars. DATABASE_URL (port 6543, pooled) for runtime and DIRECT_URL (port 5432, direct) for migrations. Both must be present before the first model is written.

---

## Table Stakes Features (must-haves for v1)

Every feature below must ship in Phase 1 or the product is not viable.

| Feature | Notes |
|---------|-------|
| Transaction logging | Manual entry; category, payment method, emotional trigger, bucket assignment |
| PKR lakh/crore formatting | formatPKR() utility; never use raw toLocaleString |
| Pakistan-local payment methods | Cash, EasyPaisa, JazzCash, SadaPay, NayaPay, Raast, bank transfer, debit/credit card |
| Salary entry with flexible date | Salary arrives 1st-30th; must not hard-code to 1st of month |
| 6-bucket ZBB allocation | Needs/Debt/Emergency/Investment/Personal/Buffer -- must sum to 100% |
| Budget view: planned vs actual | Per bucket, color-coded; progress bars not red numbers |
| Debt tracker (Qarza framing) | List, monthly payment, Islamic concern flag, emotional pressure field |
| Committee tracker | Contribution, member count, receiving month, risk level, burden warning |
| Emergency fund milestone tracker | 5 hardcoded levels from 50k to full 6-month fund |
| Goal tracker (system milestones) | 15 auto-seeded milestones from debt-free to 5Cr freedom |
| Basic monthly report | Income, expenses, savings rate, category breakdown |
| 5-step onboarding | Salary to debt to freedom target to preferences to allocation preview; under 5 minutes |
| PWA installability | app/manifest.ts + public/sw.js; Android install prompt; iOS install guide |
| Mobile-first layout | 44px tap targets, bottom nav, large number inputs |
| Auth (email/password) | Supabase Auth; getUser() not getSession() on server |
| Settings | Islamic mode (default ON), strict mode, salary day, reminders, profile |

Pakistan-specific table stakes:
- Pakistan-local expense categories: rishta, school fees, utility bills, mehndi, eid gifts, family kharch
- Cash as first-class payment method (dominant in bazaar, transport, domestic staff)
- Multiple income source support (salary + tutoring/freelance/rental from day one)
- Qarza framing for informal family loans (reduces shame; increases honest logging)

---

## Differentiators (MoneyMap PKR competitive advantages)

These are features no existing Pakistani finance app offers. They constitute the competitive moat.

### 1. Committee (Rotating Savings Group) Tracker -- HIGH confidence
Committees (bisi) are first-class financial objects in Pakistani middle-class life. No app -- SadaPay, NayaPay, YNAB, Meezan -- models them at all. MoneyMap tracks contribution, members, receiving month, manager, risk level, auto-calculated payout, net position, and fires warnings when committee burden exceeds 30% of salary or when a user adds a committee while carrying debt. This single feature makes MoneyMap irreplaceable for the target user.

### 2. Islamic Finance Mode ON by Default -- MEDIUM-HIGH confidence
96%+ of Pakistan is Muslim but no budgeting app enforces Islamic compliance across the full journey. MoneyMap makes Islamic mode the default (not an opt-in). Investment tracker allows only halal vehicles (Sukuk, Modarabas, KMI-30, Meezan funds, gold, Islamic REITs, NPS Islamic). AI Rizq Coach refuses riba-based recommendations. Debt urgency is framed through Islamic concern, not just financial logic.

### 3. Zero-Based Budgeting with Salary Buckets -- MEDIUM-HIGH confidence
YNAB does ZBB globally but costs $15/month USD, is English-only, and is Pakistan-unaware. MoneyMap forces every rupee to have a job across 6 named buckets. Dashboard never shows raw salary -- only allocated buckets. Warnings fire when bucket assignments are behaviorally dangerous (investing while emergency fund is zero).

### 4. Behavioral / Emotional Spending Intelligence -- HIGH confidence
No Pakistani app names the "pata nahi kahan chala gaya" (I do not know where it went) problem. MoneyMap adds an emotional trigger field to each transaction, computes a composite leakage score (0-100) from unknown spending, unplanned purchases, cash withdrawals, and weekend patterns, and surfaces a monthly top-5 leaks report. This turns the app into a behavioral finance coach.

### 5. Debt Payoff Planner with Islamic Awareness -- MEDIUM confidence
Multi-debt dashboard with 3 payoff strategies (Urgent First, Snowball, Markup First). Islamic concern flag per debt. Impact modeling shows how adding a new debt shifts the debt-free date. Pakistani informal debt types (Qarza, employer advance, committee obligation) modeled explicitly.

### 6. AI Rizq Coach (Phase 2) -- MEDIUM confidence
Context-aware chat grounded in the user real PKR numbers. Quick prompts (where did my money go, can I afford this). Every response ends with one clear action. Islamic compliance enforced in all advice. No equivalent exists for the PKR 100k-300k/month income segment in Pakistan.

### 7. Financial Freedom Roadmap + Milestone System -- MEDIUM confidence
15 auto-seeded system milestones from debt payoff to PKR 5Cr freedom, calibrated to Pakistani cost of living and Islamic investment vehicles. Freedom Calculator with 5 Islamic investment scenarios and interactive Recharts charts. No Pakistani app has a concrete, personalized roadmap to financial independence.

### 8. Leakage Detector with Named Categories -- HIGH confidence
Composite leakage score with 6 inputs. Monthly leakage report. Unknown category highlighting. Fixed vs flexible expense discovery after 2+ months of data. Naming the phenomenon (leakage) is itself a differentiator -- users recognize the feeling and engage with the diagnosis.

---

## Architecture Decisions (key patterns locked in)

### Auth + Profile Sync Pattern
Supabase owns auth.users. A public.profiles table (Prisma-managed) is created via a Postgres trigger (on_auth_user_created) that fires after every Supabase signup. Profile fields: salary, salary_day, islamic_mode (default true), strict_mode, onboarding_complete, freedom_target. This is the official Supabase docs pattern and must not be replaced with manual profile creation.

Always call supabase.auth.getUser() (never getSession()) for server-side identity. Middleware must return the exact supabaseResponse object unmodified -- never a new NextResponse.next() -- or session tokens never refresh and users get randomly logged out.

Onboarding gate: check onboarding_complete flag; use a short-lived cookie to avoid a DB round-trip on every request once onboarding is complete.

### RLS Strategy
RLS enabled and forced on every public.* table. Template policy must include:
- TO authenticated clause (stops anon evaluation before hitting condition)
- (SELECT auth.uid()) = user_id syntax (PostgreSQL caches the call once per statement -- 99%+ performance improvement over calling auth.uid() per row)
- WITH CHECK on all INSERT and UPDATE policies (without it, users can write records with another user_id)
- CREATE INDEX ... USING btree (user_id) on every user-owned table (without this, RLS does a full table scan per query)

Prisma connects at the database level and bypasses PostgREST, so auth.uid() returns NULL for all Prisma queries. Decision: Option A -- application-layer user scoping. Every Prisma findMany/findFirst/update/delete MUST include where: { userId: user.id }. RLS is a second defense layer but cannot be the only enforcement layer for Prisma queries.

### API-First for Flutter Readiness
Server Actions serve the Next.js UI only. Every mutation Flutter will need must also exist as a Route Handler under app/api/v1/. Enforce from Phase 1, not retrofitted. Route Handlers implement dual auth: Bearer token (Flutter JWT) and cookie (Next.js session). All responses use envelope format { data: T | null, error: { code, message } | null }. HTTP status codes are authoritative.

AI streaming MUST use a Route Handler (app/api/ai/coach/route.ts with ReadableStream). Server Actions cannot stream to the client.

### Build Order (layer dependencies)

Layer 0: Prisma schema (ALL 20+ models upfront), RLS migrations, lib/prisma.ts singleton,
         lib/supabase/server.ts + client.ts, lib/pkr.ts (formatPKR), middleware.ts

Layer 1: auth.users trigger + public.profiles, /login, /register,
         /onboarding (5-step, seeds 15 system milestones)

Layer 2: salary_allocations, categories seed data, transactions + quick-add modal, budgets

Layer 3: debts, committees (depend on Layer 2 for burden calculations)

Layer 4: emergency_fund, goals/milestones (depend on Layer 2 for progress tracking)

Layer 5: /dashboard -- pure read aggregate (do NOT build before Layers 2-4 exist)

Layer 6: /reports, leakage detection, net_worth_snapshots, lib/ai/context.ts,
         AI Rizq Coach, monthly_reviews, /financial-freedom-calculator

Layer 7: investments, zakat_calculator, advanced Recharts visualizations (10 charts)

Layer 8: Serwist offline caching, push notifications via VAPID, app/api/v1/**,
         data export (CSV), app PIN

Define ALL Prisma models in Layer 0 even for Phase 3 features. Schema refactors mid-project are painful; one day of upfront modeling avoids days of migration rework. Dashboard is Layer 5 because it is a pure read aggregate -- building it before its data sources exist means building it twice.

---

## Phase Boundaries

### Phase 1 -- Foundation + Core Loop (Layers 0-5)
Goal: Working installable PWA where a user can register, complete onboarding, set salary, allocate buckets, log transactions, track debts and committees, and view the dashboard.

Scope:
- Project scaffolding: full Prisma schema (all models), Supabase RLS, dual connection strings, Prisma migration user setup, formatPKR utility, middleware auth gate
- Auth: /login, /register, profile trigger, session middleware using getUser()
- Onboarding: 5-step flow (salary, debt entry, freedom target, Islamic/strict preferences, allocation preview) seeding 15 system milestones; must complete in under 5 minutes
- Salary allocation: 6-bucket ZBB with pending-state validation (not hard block)
- Transactions: CRUD, quick-add modal under 15 seconds, category/payment method/emotional trigger/bucket fields
- Budgets: monthly budget generation, planned vs actual per bucket, color-coded progress bars
- Debts: list with Qarza framing, Islamic concern flag, monthly payment, payoff date estimate
- Committees: contribution, members, receiving month, risk level, burden warning, net cash flow impact
- Emergency fund: 5-level milestone tracker
- Goals: 15 system milestones + custom goals
- Dashboard: composite read (bucket status, recent transactions, debt summary, committee summary, emergency fund progress)
- Settings: Islamic mode ON by default, strict mode, salary day, reminders toggle, profile
- PWA: app/manifest.ts, public/sw.js, icon-192 and icon-512, iOS install guide in onboarding

Must avoid in Phase 1: getSession() server-side, missing DIRECT_URL, missing WITH CHECK on RLS policies, Float type for PKR amounts, building dashboard before data layers exist, Prisma queries without userId scope.

### Phase 2 -- Intelligence + Analysis (Layer 6)
Goal: The app tells users where their money went and offers AI-powered behavioral coaching.

Unlock condition: User has at least 1 full month of transaction data. Leakage scores and AI context are meaningless before this threshold.

Scope:
- Monthly reports: income/expense summary, category breakdown, savings rate
- Monthly review workflow and check-ins
- Leakage detector: composite score (6 inputs), top-5 leaks list, fixed vs flexible expense discovery
- Net worth tracker: assets + liabilities snapshot
- AI Rizq Coach: Anthropic API integration, financial context via Promise.all (not sequential queries), streaming response, Islamic compliance enforcement, per-user daily call limits (5/day free tier)
- Financial freedom calculator: 5 Islamic investment scenarios, interactive Recharts charts
- Push notifications: VAPID setup, service worker push events, permission flow
- Reminders and check-in prompts

Must avoid in Phase 2: sending raw transaction JSON to Claude (compress to monthly summaries), non-streaming responses (perceived slowness on mobile), missing Anthropic spending cap, using original next-pwa instead of Serwist/manual sw.js.

### Phase 3 -- Advanced + Flutter Readiness (Layers 7-8)
Goal: Investment tracking, Zakat, full advanced analytics, Flutter API surface, offline PWA.

Unlock condition: PMF signal validated. Phase 3 features must not be built speculatively.

Scope:
- Investment tracker: manual entry only, halal instruments only (Sukuk, Modaraba, KMI-30, Meezan funds, gold, Islamic REITs, NPS Islamic), no live price sync
- Zakat calculator: nisab calculation with Islamic compliance disclaimer; legal review of copy required
- Advanced Recharts visualizations (10 chart types across full data history)
- Full strict mode: full-screen intercept warnings on all spend paths
- Serwist offline caching: app/sw.ts, withSerwistInit(), offline transaction queue with conflict resolution
- app/api/v1/** REST Route Handlers (full Flutter API surface)
- Data export (CSV)
- App PIN security

Must not build in Phase 3: crypto tracking (legal gray zone, conflicts with Islamic mode), PSX live price APIs (NCCPL membership required), Urdu RTL layout (doubles testing surface), stock execution/brokerage (SECP license required).

---

## Critical Pitfalls to Avoid (top 5 most dangerous)

All five must be addressed in Phase 1 scaffolding before any feature work begins.

### 1. Wrong Connection String for Prisma Migrations (CRITICAL)
Using the pooled Supavisor URL (port 6543) for prisma migrate commands causes shadow database creation failure. migrate dev silently fails or throws "prepared statement already exists". Teams fall back to prisma db push, which bypasses migration history and causes production schema drift with no audit trail.

Fix: Two separate env vars. DATABASE_URL at port 6543 with ?pgbouncer=true for Prisma Client runtime. DIRECT_URL at port 5432 direct for Prisma CLI. Both must appear as url and directUrl in schema.prisma before the first model is written.

### 2. Prisma Migration User Missing BYPASSRLS CREATEDB (CRITICAL)
The default Supabase postgres role cannot create databases on the managed platform. Shadow database creation fails, migrations abort, and developers reach for db push as a workaround -- dangerous in production.

Fix: Run SQL in Supabase SQL editor on day one to create a dedicated prisma user with BYPASSRLS CREATEDB, grant full schema access, and use these credentials in DIRECT_URL. Must be done before any schema work.

### 3. Using getSession() for Server-Side Authorization (CRITICAL)
getSession() reads the local cookie without verifying the JWT against Supabase Auth servers. An attacker can craft a fake JWT and impersonate any user. Horizontal privilege escalation -- User A can read User B complete financial history. RLS becomes irrelevant because the wrong user_id is passed as trusted.

Fix: Always supabase.auth.getUser() on the server. Middleware calls getUser() immediately after createServerClient with nothing in between, and returns supabaseResponse unmodified. Add a CI check that greps for getSession in server files.

### 4. Missing Prisma Client Singleton -- Connection Exhaustion (CRITICAL)
Next.js HMR re-executes module code on every file save. Without a globalThis singleton guard, each save creates a new PrismaClient with its own connection pool. Supabase free tier allows 20-25 direct connections -- exhausted within minutes of active development. In production serverless, each invocation without a singleton creates another client.

Fix: lib/prisma.ts with the globalThis singleton pattern is the first file created. Never call new PrismaClient() anywhere else in the codebase.

### 5. Prisma Bypasses RLS -- auth.uid() Returns NULL (CRITICAL)
Prisma connects directly to PostgreSQL bypassing Supabase PostgREST. auth.uid() is set by PostgREST from the JWT; Prisma never sets it. Result: RLS SELECT policies return zero rows (silent empty data), or if service_role is used, all users data is visible to everyone.

Fix (Option A, chosen): Application-layer user scoping. Every Prisma findMany/findFirst/update/delete MUST include where: { userId: user.id }. RLS remains as defense-in-depth but is not the primary enforcement mechanism for Prisma. Enforce via code review checklist.

---

## Watch Out For (significant risks per phase)

### Phase 1
- Middleware returning wrong response object: any response other than supabaseResponse breaks session token refresh -- users get randomly logged out. Copy the exact Supabase middleware template. Test with long-lived sessions before Phase 2 begins.
- RLS INSERT/UPDATE missing WITH CHECK: without it, any authenticated user can write a record with another user_id. Every INSERT/UPDATE policy must have both USING and WITH CHECK clauses.
- RLS performance traps: missing TO authenticated (evaluates condition for anon users), unwrapped auth.uid() (called per row not per statement), missing user_id B-tree index (full table scan). Use a standard policy template that bakes in all three patterns.
- Float type for PKR amounts: Float in Prisma accumulates rounding errors. Use Decimal @db.Decimal(12,2). Decide between paisa integers (simpler) or Decimal type (more explicit) before writing the first model -- mixing strategies is not allowed.
- Prisma schema drift from Supabase internals: running prisma db pull pulls auth.* and storage.* tables into schema.prisma. Scope datasource to schemas = ["public"] only.

### Phase 2
- next-pwa incompatibility: original next-pwa has no App Router support. Use Serwist or manual sw.js. Test PWA with a working spike before building any features on top of service worker behavior.
- iOS Safari PWA limitations: push notifications require iOS 16.4+ AND Home Screen installation (not browser tab). Significant portion of Pakistani iPhone users may be on older devices. Design notifications as optional. Build explicit iOS install guide. Test on a real iPhone -- Simulator does not simulate service worker behavior accurately.
- Onboarding abandonment: more than 5-minute setup causes approximately 60% abandonment. Ship with 5 Pakistan-local default categories. Defer full budget customization. Surface one concrete insight before 3 transactions are logged.
- ZBB allocation edge cases: partial allocations, rounding, mid-month salary adjustments. Use a pending state not a hard block.

### Phase 3
- Anthropic cost explosion: raw transaction JSON context at 500+ transactions burns tokens at scale. Compress to monthly summaries before sending. Implement per-user daily call limits. Set a hard monthly budget cap in the Anthropic console before enabling AI for any user.
- Prisma N+1 queries: dashboard and report pages can fire 30-100 SQL queries if loops contain await prisma.* calls. Enable Prisma query logging in development. Use groupBy, include with nested select, and relationLoadStrategy: join for relation-heavy queries.
- Serwist + Turbopack compatibility: Serwist requires webpack config. Verify compatibility if Next.js has moved to Turbopack by the time Phase 3 is reached.

### Production
- prisma migrate dev in CI/CD: use only prisma migrate deploy in pipelines. migrate dev can drop tables or create destructive history conflicts against production data.
- Connection exhaustion under load: confirm singleton pattern is in effect. Monitor Supabase connection count in dashboard -- it should stay near 1 per serverless instance, not grow over time.

---

## Open Questions

| Question | Phase | Decision Needed |
|----------|-------|----------------|
| Tailwind v4 at project init | Phase 1 | create-next-app@15 may default to Tailwind v3 -- verify version and upgrade manually before running npx shadcn@latest init |
| Anthropic model ID | Phase 2 | Spec mentions claude-sonnet-4-20250514 -- verify it is not deprecated; confirm exact model ID from Anthropic model list at implementation time |
| Flutter REST API scope | Phase 1 | Decide exactly which mutations Flutter needs and implement as Route Handlers from day one; retrofitting from Server Actions is painful. Candidates: transactions, budgets, debts, committees, goals, salary-allocations, dashboard summary |
| Vercel AI SDK vs raw Anthropic SDK | Phase 2 | Vercel AI SDK provides built-in Next.js streaming helpers; raw SDK gives more control. Decide before writing AI coach code -- switching mid-build is disruptive |
| Onboarding: cookie vs DB flag for onboarding_complete | Phase 1 | Cookie is fast but has stale-state risk (reset from another device). DB round-trip is always accurate but slower. Document the chosen approach and its stale-state recovery path |
| Service layer abstraction | Phase 1 | Consider lib/db/transactions.ts, lib/db/budgets.ts etc. to enforce user-scoped-Prisma boundary by convention and prevent accidental RLS bypasses |
| Amount storage: paisa integers vs Decimal | Phase 1 | Choose before the first model. BIGINT paisa integers are simpler with no rounding; Decimal @db.Decimal(12,2) is more explicit. Either is correct -- mixing is not |
| SadaPay and NayaPay feature validation | Pre-Phase 2 | Both may have added budgeting features in 2025 post-training-cutoff. Check current App Store listings before finalizing differentiator claims |
| Salary allocation rounding UX | Phase 1 | Users will land at 99.9% or 100.1% due to percentage rounding. Define the pending rupees state before building the allocation screen |
| Committee edge cases in v1 | Phase 1 | Start with happy path. Explicitly document which edge cases (member leaves, amount changes, manager cut) are out of scope for v1 |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All critical claims verified against official Next.js, Supabase, Prisma docs |
| Architecture | HIGH | RLS, auth, Prisma singleton, API-first pattern all confirmed via official docs |
| CRITICAL pitfalls | HIGH | Verified against official Supabase and Prisma documentation |
| PWA/iOS pitfalls | MEDIUM | Based on training data Aug 2025 -- verify iOS version support landscape before PWA phase |
| Table stakes features | HIGH | Standard personal finance patterns; Pakistan payments landscape well-documented |
| Differentiators: committee/Islamic/leakage | HIGH | Committee uniqueness is domain knowledge; Islamic finance instruments well-documented |
| Differentiators: AI coach/freedom roadmap | MEDIUM | Differentiation depends on competitor feature sets not verified post-Aug 2025 |
| Pakistan behavioral patterns | MEDIUM | Inferred from market context, not primary user research |

Gaps requiring attention:
1. No primary user research conducted. Behavioral finance patterns (emotional triggers, Qarza shame, committee behavior) are inferred. Run 5 user interviews before Phase 2.
2. SadaPay, NayaPay, and Meezan Bank app may have evolved since Aug 2025 -- verify current App Store feature sets before finalizing differentiator positioning.
3. Anthropic model IDs and rate limits change -- verify at implementation time.
4. iOS PWA push notification support on older Pakistani devices -- test on real hardware before committing push as a core feature.

---

## Sources (aggregated)

- Next.js official docs: nextjs.org/docs/app/guides/progressive-web-apps (updated 2026-04-10)
- Supabase Prisma integration: supabase.com/docs/guides/database/prisma
- Supabase RLS guide: supabase.com/docs/guides/database/postgres/row-level-security
- Supabase getSession warning: supabase.com/docs/_partials/get_session_warning
- Supabase Next.js auth tutorial: supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Prisma singleton for Next.js: prisma.io/docs/guides/frameworks/nextjs
- Prisma pgBouncer/Supavisor: prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- Prisma N+1 optimization: prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance
- Recharts v3 docs: recharts.org
- Serwist: serwist.pages.dev
- Islamic finance instruments: AAOIFI standards, Meezan Bank product documentation (training data Aug 2025)
- Pakistan payment ecosystem: EasyPaisa, JazzCash, SadaPay, NayaPay, Raast (training data Aug 2025)
- Committee/bisi domain knowledge: Pakistan financial behavior context (training data Aug 2025)
- Finance app abandonment patterns: YNAB/Mint UX research (training data Aug 2025)
- Anthropic API: platform.anthropic.com (training data Aug 2025 -- verify model IDs and rate limits at implementation)
`;

fs.writeFileSync(path, content, 'utf8');
console.log('SUMMARY.md written successfully, bytes: ' + content.length);
