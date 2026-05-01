# Architecture Research — MoneyMap PKR

**Researched:** 2026-05-01
**Overall Confidence:** HIGH (verified against official Next.js, Supabase, and Prisma documentation)

---

## Component Map

MoneyMap PKR has five distinct layers. Every arrow represents a one-way data dependency or call direction.

```
BROWSER / PWA SHELL
  Service Worker (public/sw.js)  +  React UI Layer (Client Components)
       |                                          |
       | intercepts fetch                         | calls Server Actions / Route Handlers
       ↓                                          ↓
  Next.js App Router (Server Layer)
    middleware.ts       — Supabase session refresh + auth gate
    RSC page.tsx        — direct DB reads, passes data to client
    Server Actions      — all mutations (validated, revalidatePath)
    Route Handlers      — REST API surface for Flutter (app/api/v1/**)
       |
       ↓
  Service Layer (lib/)
    lib/prisma.ts        — singleton Prisma client
    lib/supabase/        — server client, browser client
    lib/ai/context.ts    — financial context object builder
    lib/pkr.ts           — formatPKR() utility
       |
       ↓
  Data Layer
    Supabase Postgres
      auth.users         — Supabase-owned (never touched by Prisma directly)
      public.*           — Prisma-managed, RLS on every table
    Anthropic Claude API — called from Server Actions only, never client
```

| Component | Owns | Calls | Never Calls |
|---|---|---|---|
| Service Worker | Cache strategy, offline queue, push events | Browser Cache API | Any server-side code |
| RSC page.tsx | Initial data fetch, metadata | lib/prisma.ts, lib/supabase/server | useState, browser APIs |
| Client Component | Interactive UI state | Server Actions, Route Handlers | Prisma, Supabase admin directly |
| Server Action | Mutations, validated writes | lib/prisma.ts, Supabase admin | Browser APIs, client state |
| Route Handler (app/api/v1) | REST API surface | lib/prisma.ts, Supabase admin | React, JSX |
| lib/prisma.ts | DB singleton | Prisma ORM | Supabase Auth directly |
| lib/supabase/server.ts | Auth session, user identity | @supabase/ssr createServerClient | Prisma |
| lib/ai/context.ts | Financial context object | lib/prisma.ts in parallel | Anthropic SDK directly |

---

## Data Flow

**Read path (dashboard load):**
```
Browser /dashboard
  → middleware.ts: createServerClient → supabase.auth.getUser()
      if no session → redirect /login
      if onboarding_complete = false → redirect /onboarding
  → RSC page.tsx: prisma.profile + prisma.transaction (current month) in parallel
      → Server Components rendered with real data
      → serialized props passed to Client Components
  → Client Components: render interactive budget cards, quick-add modal trigger
```

**Write path (add transaction):**
```
User fills Quick-Add modal (Client Component)
  → Server Action: addTransaction(formData)
      → Zod validation
      → prisma.transaction.create({ userId: session.user.id, ... })
          → Postgres RLS enforced: auth.uid() = user_id
      → revalidatePath('/dashboard')
  → Next.js cache invalidated → RSC re-renders with fresh data
```

**AI coach path:**
```
User message (Client Component)
  → Server Action: askCoach(message)
      → lib/ai/context.ts: buildFinancialContext(userId)
          → Promise.all([profile, budget, debts, committees, transactions, goals, emergencyFund])
          → single parallel round-trip (~50ms, not 7 sequential ~350ms)
      → Anthropic API call with context + Islamic finance system prompt
      → streamed response returned
  → Client Component streams text to UI
```

**Flutter API path (Phase 3):**
```
Flutter → POST /api/v1/transactions (Route Handler)
  → extract Bearer token from Authorization header
  → supabase.auth.getUser(token) → validates JWT server-side
  → prisma.transaction.create(...)
  → returns { data: {...}, error: null }
```

---

## Auth + Profile Sync Pattern

**The core problem:** Supabase owns `auth.users` in the `auth` schema. Prisma cannot run migrations against it. The app needs a `public.profiles` table with app-specific fields that Prisma can manage.

**Solution: Postgres trigger (official Supabase docs pattern).**

```sql
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  salary          BIGINT DEFAULT 0,
  salary_day      SMALLINT DEFAULT 1,
  islamic_mode    BOOLEAN DEFAULT TRUE,
  strict_mode     BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  freedom_target  BIGINT DEFAULT 500000000,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Session handling in Next.js App Router:** Use `@supabase/ssr`. Two client variants:

- `lib/supabase/server.ts` — `createServerClient` using `cookies()` from `next/headers`. Used in RSC pages, Server Actions, Route Handlers.
- `lib/supabase/client.ts` — `createBrowserClient`. Used only in Client Components that need Supabase Realtime (rare).

**Critical rule:** Always call `supabase.auth.getUser()` (not `getSession()`) for identity verification. `getUser()` validates the JWT with the Supabase server. `getSession()` only reads the local cookie — it can be spoofed.

**Middleware must call `supabase.auth.getUser()` immediately after `createServerClient`** and return the `supabaseResponse` object unmodified. This refreshes the session token and propagates updated cookies.

**Onboarding gate:** Set `onboarding_complete` as a short-lived cookie (`onboarding_done=1`) once onboarding is complete to avoid a DB round-trip on every request for this flag.

---

## RLS Strategy

**Rule:** Every table in the `public` schema that stores user data must have RLS enabled and enforced.

**Template policy (applied to all 15+ user-owned tables):**

```sql
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.<table_name> FORCE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_row" ON public.<table_name>
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

Tables: `profiles`, `transactions`, `budgets`, `salary_allocations`, `debts`, `committees`, `goals`, `emergency_fund`, `investments`, `reminders`, `monthly_reviews`, `net_worth_snapshots`, `zakat_calculations`, `push_subscriptions`, `ai_conversations`.

**Shared lookup tables** (categories, milestone_definitions) get read-only policy:

```sql
CREATE POLICY "authenticated_read" ON public.categories
  FOR SELECT TO authenticated USING (true);
```

**Prisma + RLS ownership split:** Use the Supabase client (user JWT) for user-scoped reads/writes (RLS enforced). Reserve Prisma with `service_role` key for admin/seed operations that bypass RLS. Pass `userId` explicitly in Server Actions AND rely on RLS as a second defense layer.

---

## API-First Pattern (Flutter Readiness)

**Rule:** Server Actions serve the Next.js UI only. Every mutation Flutter will need must also exist as a Route Handler under `app/api/v1/`.

```
app/api/v1/
  transactions/
    route.ts            GET list, POST create
    [id]/route.ts       GET one, PATCH, DELETE
  budgets/route.ts
  debts/route.ts
  committees/route.ts
  goals/route.ts
  salary-allocations/route.ts
  dashboard/route.ts    GET — composite summary (single endpoint for Flutter home)
  ai/coach/route.ts     POST — streaming AI response
```

**Dual auth in Route Handlers** (handles both Next.js cookie and Flutter Bearer token):

```typescript
export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    return user
  }
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

**Response envelope:** All Route Handlers return `{ data: T | null, error: { code, message } | null }`. HTTP status codes are authoritative (`401`, `403`, `404`, `422`, `500`). Never return `200` with an error body.

---

## Build Order (Dependency Graph)

```
Layer 0: Infrastructure (no user dependencies)
  Prisma schema for ALL 20+ models (define upfront — see note)
  Supabase RLS migrations
  lib/prisma.ts (singleton)
  lib/supabase/server.ts + client.ts
  lib/pkr.ts (formatPKR)
  middleware.ts (auth gate + onboarding gate)

Layer 1: Identity (depends on Layer 0)
  auth.users trigger + public.profiles
  /login, /register
  /onboarding (5-step, seeds 15 milestone goals)

Layer 2: Core Data Entry (depends on Layer 1)
  salary_allocations + /salary-allocation
  categories seed data
  transactions + /transactions + quick-add modal
  budgets + monthly budget generation

Layer 3: Obligations (depends on Layer 2)
  debts + /debts
  committees + /committees

Layer 4: Savings Goals (depends on Layer 2)
  emergency_fund + /emergency-fund
  goals + /goals (milestone cards)

Layer 5: Dashboard (depends on Layers 2–4)
  /dashboard — composite read only, no writes

Layer 6: Intelligence (depends on Layers 2–5)
  /reports (monthly summary)
  leakage detection algorithm
  net_worth_snapshots + /net-worth
  lib/ai/context.ts + /ai-coach (Rizq Coach)
  monthly_reviews + /monthly-review
  /financial-freedom-calculator

Layer 7: Advanced Modules (depends on Layer 6)
  investments + /investments
  /zakat-calculator
  Recharts visualizations (10 charts)

Layer 8: PWA + REST API (depends on all)
  app/manifest.ts (Next.js built-in)
  public/sw.js (push events, offline cache via Serwist)
  reminders + VAPID push notifications
  app/api/v1/** Route Handlers
  Data export (CSV)
  App PIN
```

**Why define all Prisma models in Layer 0:** Migrations are additive but structural refactors mid-project are painful. Define the complete schema in Phase 1 even for features landing in Phase 3. One day of upfront schema work avoids days of migration pain.

**Why Dashboard is Layer 5:** It is a pure read aggregate. Building it before the data it reads exists means building it twice. The mock round is wasted.

**Why AI Coach is Layer 6:** The context object queries every major table. The AI is only useful when real user data exists. Building in Layer 1 means hallucinated responses with no real financial context.

---

## Recommended Phase Boundaries

**Phase 1 — Foundation + Core Loop (Layers 0–5)**
Goal: A working, installable PWA where a user can register, set salary, allocate buckets, log transactions, track debts/committees, and see the dashboard.

Modules: Auth/Onboarding, Salary Allocation, Transactions, Budgets, Dashboard, Emergency Fund, Goals, Debts, Committees, Settings, PWA manifest + install prompt.

**Phase 2 — Intelligence + Analysis (Layer 6)**
Goal: The app can tell users where their money went and offer AI-powered behavioral coaching.

Modules: Reports, Monthly Reviews, Leakage Detector, Net Worth Tracker, AI Coach (Rizq Coach), Reminders + Check-ins, Financial Freedom Calculator.

*Unlock condition:* User has at least 1 full month of transaction data. Leakage scores and AI context are meaningless before this threshold.

**Phase 3 — Advanced + Flutter Readiness (Layers 7–8)**
Goal: Investment tracking, Zakat, Recharts visualizations, full Strict Mode, REST API for Flutter, offline PWA, push notifications.

Modules: Investments, Zakat Calculator, Advanced Reports (10 charts), Strict Mode (full), push notifications, offline via Serwist, `app/api/v1/**`, data export, app PIN.

---

## Key Constraints Summary

- **Prisma Singleton is not optional.** Without it, Next.js hot reload creates a new `PrismaClient` on every request, exhausting Supabase's connection pool (25 connections free tier).
- **Two connection strings required:** `DATABASE_URL` (PgBouncer pooled, runtime), `DIRECT_URL` (direct, prisma migrate only).
- **Real-time vs polling verdict: request/response.** MoneyMap PKR is single-user. Use `revalidatePath()` in Server Actions. Reserve Realtime for a future collaborative committee feature.
- **AI context must use `Promise.all`.** 7 sequential queries at ~50ms each = 350ms. One `Promise.all` = ~50ms.
- **AI streaming via Route Handler, not Server Action.** Server Actions cannot stream. Use `app/api/ai/chat/route.ts` with ReadableStream.

---

## Open Questions

1. **onboarding_complete check in middleware:** DB read on every request vs. cookie flag. Cookie is faster but has stale-state edge cases (reset onboarding from another device). Decide at implementation.
2. **Service layer abstraction:** Consider `lib/db/transactions.ts`, `lib/db/budgets.ts` to enforce the Supabase-client-for-user / Prisma-for-admin boundary by convention and prevent accidental RLS bypasses.
3. **Vercel AI SDK vs raw Anthropic SDK:** Vercel AI SDK provides built-in streaming helpers for Next.js. Decide in Phase 2 — both work, AI SDK reduces boilerplate.
4. **Serwist + Turbopack:** Serwist currently requires webpack config. If Next.js moves fully to Turbopack before Phase 3, verify compatibility at that time.
