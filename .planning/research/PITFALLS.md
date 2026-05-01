# Pitfalls Research — MoneyMap PKR

**Domain:** Pakistani Islamic personal finance PWA
**Stack:** Next.js 14 App Router + Supabase (PostgreSQL + Auth) + Prisma ORM + Anthropic Claude API
**Researched:** 2026-05-01
**Overall confidence:** HIGH for stack-specific pitfalls (verified via Context7 + official Supabase/Prisma docs); MEDIUM for PWA/iOS pitfalls (training data + known public documentation as of Aug 2025)

---

## Critical Pitfalls (Will Cause Failure if Ignored)

These pitfalls either silently corrupt data, permanently break authentication, exhaust database connections in production, or make the app un-deployable.

---

### CRITICAL-1: Supabase + Prisma — Wrong Connection String for Migrations

**Source:** Supabase official docs (supabase.com/docs/guides/database/prisma), verified via Context7 `/supabase/supabase` — HIGH confidence

**What goes wrong:**
Using the same connection string (Supavisor transaction-mode pooler, port 6543) for both runtime queries AND Prisma CLI migrations. `prisma migrate dev` uses a shadow database, and shadow database creation is incompatible with PgBouncer/Supavisor transaction mode. The migration silently fails or throws `ERROR: prepared statement already exists`.

**Why it happens:**
Developers copy the connection string from Supabase dashboard (which gives the pooled URL by default) and paste it as `DATABASE_URL` everywhere — including the Prisma `datasource` block used by CLI commands.

**Consequences:**
- `prisma migrate dev` fails to create shadow database
- Migrations cannot be applied in CI/CD
- `prisma db push` works (it does not use shadow database) but bypasses migration history — dangerous in production
- Production schema drifts from local schema with no audit trail

**Prevention — required configuration:**

```env
# .env — TWO separate URLs are mandatory

# Port 6543 = Supavisor transaction mode (pooled) — used by Prisma Client at runtime
DATABASE_URL="postgres://[DB-USER].[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Port 5432 = direct connection or session mode — used by Prisma CLI for migrations
DIRECT_URL="postgres://[DB-USER].[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

```prisma
// schema.prisma — BOTH url and directUrl required
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Warning signs:**
- Only one `DATABASE_URL` in `.env` file
- `schema.prisma` has only `url`, no `directUrl`
- `prisma migrate dev` throws `permission denied to create database`
- Team uses `prisma db push` in production instead of `prisma migrate deploy`

**Phase to address:** Phase 1 (project scaffolding). This must be correct before writing a single model.

---

### CRITICAL-2: Prisma Migration User Missing `bypassrls createdb` Privileges

**Source:** Supabase troubleshooting docs (`apps/docs/content/troubleshooting/prisma-error-management-Cm5P_o.mdx`), verified via Context7 — HIGH confidence

**What goes wrong:**
Prisma CLI connects as the default Supabase `postgres` role or as the `anon` / `service_role` Supabase API credentials. The `postgres` role on Supabase managed Postgres does not have permission to create databases (needed for shadow database). Even if it could create a shadow database, RLS policies applied to the main schema interfere with migration introspection.

**Why it happens:**
Developers assume the Supabase `postgres` user has unrestricted superuser access. It does not — Supabase restricts it on their managed platform.

**Consequences:**
- `prisma migrate dev` fails locally against remote Supabase
- Shadow database cannot be created → migrations abort
- Applying RLS before migrations are stable causes drift between migration and runtime behavior

**Prevention — required SQL setup (run once in Supabase SQL editor):**

```sql
-- Create a dedicated Prisma migration user
CREATE USER "prisma" WITH PASSWORD 'your_secure_migration_password' BYPASSRLS CREATEDB;

-- Grant it to postgres so Supabase Dashboard shows objects
GRANT "prisma" TO "postgres";

-- Full schema access
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
```

The `DIRECT_URL` in `.env` must use this `prisma` user's credentials, not the `postgres` user or Supabase API keys.

**Warning signs:**
- `DIRECT_URL` uses the same credentials as Supabase anon key or service_role key (those are HTTP API keys, not PostgreSQL credentials)
- Error: `ERROR: permission denied to create database` during `prisma migrate dev`
- Error: `42501` privilege error during `supabase db push`

**Phase to address:** Phase 1. The Prisma migration user must be provisioned before any schema work.

---

### CRITICAL-3: Supabase Auth — Using `getSession()` for Server-Side Authorization

**Source:** Official Supabase warning (`apps/docs/content/_partials/get_session_warning.mdx`), verified via Context7 `/supabase/supabase` — HIGH confidence

**What goes wrong:**
`supabase.auth.getSession()` reads the session token from local storage / cookies **without verifying it against the Supabase Auth server**. In server components and API routes, the session data can be tampered by the client. An attacker can craft a fake JWT and impersonate any user.

**Why it happens:**
The official older examples (and many blog posts from 2023) use `getSession()` in middleware and server components. The API looks correct and does not throw errors — it just silently trusts tampered tokens.

**Consequences:**
- Horizontal privilege escalation: User A can read User B's financial data
- All RLS protection becomes irrelevant if the wrong `user_id` is passed as trusted
- Entire multi-tenant isolation model collapses

**Prevention:**

```typescript
// WRONG — never use for server-side authorization
const { data: { session } } = await supabase.auth.getSession()
const userId = session?.user?.id  // DO NOT TRUST THIS SERVER-SIDE

// CORRECT — always use getUser() on the server
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) redirect('/login')
const userId = user.id  // This is verified against Supabase Auth server
```

**Correct middleware pattern (from Supabase official docs):**
```typescript
// middleware.ts — DO NOT put any code between createServerClient and getUser()
const supabase = createServerClient(url, key, { cookies: { getAll, setAll } })

// getUser() MUST be called immediately — no other code in between
const { data: { user } } = await supabase.auth.getUser()

// MUST return supabaseResponse unchanged (not a new NextResponse.next())
return supabaseResponse
```

**Warning signs:**
- `getSession()` appearing in any server component, Route Handler, or middleware
- Any server route using `session.user.id` instead of `user.id` from `getUser()`
- Middleware that creates a new `NextResponse.next()` without copying cookies from `supabaseResponse`

**Phase to address:** Phase 1 (auth scaffolding). The middleware pattern must be correct from day one.

---

### CRITICAL-4: Prisma Client Singleton Missing in Next.js — Connection Exhaustion

**Source:** Prisma official docs (`apps/docs/content/docs/guides/frameworks/nextjs.mdx`), verified via Context7 `/prisma/web` — HIGH confidence

**What goes wrong:**
In Next.js development, hot module replacement (HMR) re-executes module code on every file save. Without a singleton pattern, each HMR cycle creates a new `PrismaClient` instance with its own connection pool. After ~20 file saves, the Supabase free tier connection limit (20–25 connections) is exhausted. In production with serverless deployments, each warm Lambda/Edge invocation creates a new client if instantiation is inside the handler function.

**Why it happens:**
Developers follow simple tutorials that show `new PrismaClient()` at module level without the `globalThis` guard. Next.js docs don't always emphasize this Prisma-specific requirement.

**Consequences:**
- Development: `too many clients` errors within an hour of starting
- Production: connection limit hit under moderate traffic; all queries fail
- Supabase free tier allows ~20 direct connections — this fills up in seconds under serverless concurrency

**Prevention:**

```typescript
// lib/prisma.ts — the singleton pattern is mandatory
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Never import `PrismaClient` and instantiate it directly in route handlers, server actions, or server components.

**Warning signs:**
- `new PrismaClient()` appears anywhere outside `lib/prisma.ts`
- `PrismaClient` created inside an async function or route handler
- Error: `too many clients already` after running dev server for a while

**Phase to address:** Phase 1 (scaffolding). The singleton must be in place before any Prisma queries are written.

---

### CRITICAL-5: RLS Active on Table but Prisma Uses Database-Level Connection (Bypasses User Context)

**Source:** Supabase RLS documentation, verified via Context7 `/supabase/supabase` — HIGH confidence; Prisma + Supabase RLS integration pattern — MEDIUM confidence (multiple consistent sources)

**What goes wrong:**
RLS policies use `auth.uid()` to filter rows by the current authenticated user. But `auth.uid()` is set by Supabase's PostgREST layer from the JWT passed with each HTTP request. Prisma connects **directly to PostgreSQL** via a database-level connection, bypassing PostgREST entirely. This means `auth.uid()` returns `NULL` for all Prisma queries, causing:
- RLS SELECT policies to return zero rows (silent empty results instead of an error)
- RLS INSERT/UPDATE policies with `WITH CHECK` to block all writes (silent failures)
- Or if `service_role` is used as the connection user: full RLS bypass, all users can see each other's data

**Why it happens:**
Developers assume that because Supabase RLS exists, the Prisma queries automatically respect it. They test in Supabase Studio (which uses PostgREST + user JWT) and data looks correct. Prisma path never sets JWT context.

**Consequences:**
- In production, every Prisma query returns empty data (if `anon` user) or all users' data (if `service_role`)
- Multi-tenant isolation completely breaks — this is a security catastrophe for a financial app
- Very hard to detect in development if testing with a single user

**Prevention — two valid architectural choices:**

**Option A (Recommended): Prisma for data logic, RLS enforced at application layer**
Use Prisma with the database migration user (which bypasses RLS via `bypassrls`). Enforce tenant isolation in application code — every Prisma query MUST include `where: { userId: session.user.id }`. Never issue a `findMany` without a user scope.

```typescript
// Every query MUST scope by userId
const transactions = await prisma.transaction.findMany({
  where: { userId: user.id }  // MANDATORY — never omit this
})
```

**Option B: Set JWT context per-transaction for Prisma to use RLS**
Pass the user JWT to Supabase's `set_config` before each Prisma query using a middleware function:

```typescript
async function withUserContext<T>(userId: string, jwt: string, fn: () => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${JSON.stringify({ sub: userId })}, true)`
    return fn()
  })
}
```

Option A is simpler and less error-prone for a team. Option B is more correct but adds complexity.

**Warning signs:**
- Prisma queries work in Supabase Studio but return different results through Next.js routes
- A user can see all records in the database (RLS bypassed)
- All Prisma queries return empty results for authenticated users (null `auth.uid()`)

**Phase to address:** Phase 1 (data model design). The choice of Option A vs B must be made before writing any Prisma queries. Enforce it via code review checklist.

---

## Significant Pitfalls (Cause Major Rework)

These pitfalls typically manifest in Phase 2–4 and require architectural changes if discovered late.

---

### SIGNIFICANT-1: Supabase Auth Middleware — Breaking Session Refresh by Returning Wrong Response

**Source:** Official Supabase Next.js guide, verified via Context7 `/supabase/supabase` — HIGH confidence

**What goes wrong:**
The middleware's `createServerClient` call sets response cookies to refresh the Supabase session token. If the middleware returns any response other than the exact `supabaseResponse` object (e.g., a new `NextResponse.next()`, a redirect that drops cookies, or a response that doesn't copy `supabaseResponse.cookies`), session tokens are never refreshed. Users get randomly logged out, sometimes within minutes.

**Specific failure modes:**
1. Middleware creates a redirect (`NextResponse.redirect()`) without copying session cookies — user logs back in but session was not refreshed
2. Middleware creates a new `NextResponse.next({ request })` instead of returning `supabaseResponse` — cookies never written to browser
3. Code inserted between `createServerClient` and `supabase.auth.getUser()` — subtle timing issues with token refresh

**Prevention:**

```typescript
// middleware.ts — the supabaseResponse object is sacred
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })  // Step 1

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })  // Recreate with new request
        cookies.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      }
    }
  })

  // NOTHING between createServerClient and getUser()
  const { data: { user } } = await supabase.auth.getUser()

  // If you need a redirect, copy cookies before returning
  if (!user && requiresAuth(request.nextUrl.pathname)) {
    const redirect = NextResponse.redirect(new URL('/login', request.url))
    supabaseResponse.cookies.getAll().forEach(c => redirect.cookies.set(c.name, c.value, c))
    return redirect
  }

  return supabaseResponse  // Always return supabaseResponse unless redirecting
}
```

**Warning signs:**
- Users report being logged out 5–15 minutes after login
- Session works in Chrome but fails in Safari (which is stricter about cookie handling)
- Auth works on first page load but fails on navigation

**Phase to address:** Phase 1 (auth setup). Must be tested with long-lived sessions before Phase 2 begins.

---

### SIGNIFICANT-2: Prisma Migrations in Production — Using `migrate dev` Instead of `migrate deploy`

**Source:** Prisma official docs, verified via Context7 `/prisma/web` — HIGH confidence

**What goes wrong:**
`prisma migrate dev` is designed for local development. It creates shadow databases, prompts interactively, and may reset data. Running it against a production Supabase database can drop tables, reset sequences, or create unintended migration history conflicts.

**Prevention:**
- Local / development: `prisma migrate dev`
- CI/CD / production: `prisma migrate deploy` (applies pending migrations, no shadow database, no destructive resets)
- Never run `prisma db push` in production — it bypasses migration history
- Use Supabase CLI `supabase db push` only for managed Supabase migrations (not Prisma migrations)

```yaml
# GitHub Actions production deployment
- name: Apply Prisma migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}  # DIRECT_URL value for migrations
```

**Warning signs:**
- `migrate dev` is referenced in CI/CD scripts
- `db push` used in production deployment pipeline
- No `prisma/migrations/` directory in the repo (means migrations are not tracked)

**Phase to address:** Phase 1 (CI/CD setup). Migration strategy must be locked before any schema changes go to production.

---

### SIGNIFICANT-3: RLS Policies — Missing `TO authenticated` and Unoptimized `auth.uid()` Calls

**Source:** Supabase RLS documentation (`apps/docs/content/guides/database/postgres/row-level-security.mdx`), verified via Context7 — HIGH confidence. Performance benchmarks cited as 99.78% improvement.

**What goes wrong:**
Three distinct RLS mistakes that each degrade performance or break security:

**Mistake A — Calling `auth.uid()` without `SELECT` wrapper:**
```sql
-- SLOW: auth.uid() called for every row
USING (auth.uid() = user_id)

-- FAST: PostgreSQL caches the result with initPlan (called once per statement)
USING ((SELECT auth.uid()) = user_id)
```

**Mistake B — Missing `TO authenticated`:**
```sql
-- BAD: Policy runs for anon users too, evaluating auth.uid() (which returns NULL)
CREATE POLICY "user_select" ON transactions USING ((SELECT auth.uid()) = user_id);

-- GOOD: Policy stops immediately for anon users before evaluating condition
CREATE POLICY "user_select" ON transactions
TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

**Mistake C — Missing index on `user_id`:**
RLS policies filter every row for `user_id = auth.uid()`. Without a B-tree index, PostgreSQL does a full table scan on every query. A user with 1,000 transactions triggers a scan of all users' transactions.

```sql
CREATE INDEX idx_transactions_user_id ON transactions USING btree (user_id);
CREATE INDEX idx_budgets_user_id ON budgets USING btree (user_id);
-- Repeat for every table with user_id RLS
```

**Mistake D — JOIN in RLS policy instead of IN:**
```sql
-- SLOW: JOIN in RLS policy
USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid() AND tm.team_id = team_id)
)

-- FAST: IN operator
USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = (SELECT auth.uid()))
)
```

**Warning signs:**
- RLS policies defined without `TO authenticated`
- `auth.uid()` called without `SELECT` wrapper
- No `user_id` indexes in migration files
- Query times grow linearly as user data grows

**Phase to address:** Phase 1 (data model). These patterns must be in templates/snippets used for every new table.

---

### SIGNIFICANT-4: RLS INSERT/UPDATE — Missing `WITH CHECK` Clause Allows Data Spoofing

**Source:** Supabase RLS documentation, verified via Context7 `/supabase/supabase` — HIGH confidence

**What goes wrong:**
For `INSERT` operations, only `WITH CHECK` matters (not `USING`). For `UPDATE`, both `USING` (which rows can be updated) and `WITH CHECK` (what values can be written) are needed. Omitting `WITH CHECK` allows a user to insert or update records with `user_id` pointing to another user.

```sql
-- INCOMPLETE: User can insert a transaction with any user_id
CREATE POLICY "insert_transaction" ON transactions
FOR INSERT TO authenticated
USING (TRUE);  -- USING does nothing for INSERT

-- COMPLETE: WITH CHECK ensures user_id matches the authenticated user
CREATE POLICY "insert_transaction" ON transactions
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- UPDATE needs both clauses
CREATE POLICY "update_transaction" ON transactions
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)       -- can only see own rows
WITH CHECK ((SELECT auth.uid()) = user_id); -- cannot change user_id to someone else's
```

**Warning signs:**
- INSERT/UPDATE policies using only `USING` with no `WITH CHECK`
- Unit tests don't check cross-user write attempts
- No test that attempts to write a record with another user's `user_id`

**Phase to address:** Phase 1 (data model). Write tests that attempt cross-user injection before Phase 2.

---

### SIGNIFICANT-5: next-pwa with Next.js 14 App Router — Compatibility Issues

**Source:** Training data (known community issue as of Aug 2025) — MEDIUM confidence. Verify before PWA phase.

**What goes wrong:**
`next-pwa` (the most common PWA library for Next.js) was designed for the Pages Router and has incomplete support for the App Router. Specific issues:

1. The default Workbox configuration in `next-pwa` caches `_next/static` chunks but not App Router RSC payloads correctly
2. Service worker registration conflicts with Next.js App Router's client-side navigation
3. The `sw.js` file gets placed in the wrong output directory under App Router build
4. Some versions generate a service worker that pre-caches everything including API routes, causing stale API responses

**Known workarounds as of late 2024:**
- Use `@ducanh2912/next-pwa` (fork with better App Router support) instead of the unmaintained `next-pwa`
- Or use `serwist` (successor to `next-pwa`, actively maintained, App Router compatible)
- Manual Workbox configuration to exclude API routes and RSC endpoints from pre-caching

**Prevention:**
Before writing any PWA code, verify the chosen library's GitHub issues for App Router compatibility with the exact Next.js version in use. Create a spike that confirms service worker registration, offline fallback, and cache invalidation all work correctly before building features on top.

**Warning signs:**
- Using `next-pwa` (the original, not the fork) with Next.js 14+
- Service worker registered but PWA install prompt never appears
- App shows stale API data after deployment (service worker cached old responses)
- `next build` produces a service worker in the wrong directory

**Phase to address:** Phase 2 (PWA setup). Confirm library choice with a working spike before any other PWA features.

---

### SIGNIFICANT-6: Prisma N+1 Queries with Deeply Nested Relations (20+ Models)

**Source:** Prisma official docs (`apps/docs/content/docs/orm/prisma-client/queries/advanced/query-optimization-performance.mdx`), verified via Context7 `/prisma/web` — HIGH confidence

**What goes wrong:**
With 20+ Prisma models and many relations (transactions → categories → budget_allocations → monthly_budgets → user), naive queries inside loops create N+1 patterns. The dashboard query that loads a user's monthly summary can easily trigger 50–100 individual SQL queries.

**Common pattern for MoneyMap PKR specifically:**
```typescript
// DANGER: Monthly review page loading all category summaries
const categories = await prisma.category.findMany({ where: { userId } })
for (const cat of categories) {
  // THIS FIRES ONE QUERY PER CATEGORY
  const total = await prisma.transaction.aggregate({
    where: { categoryId: cat.id, userId },
    _sum: { amount: true }
  })
}
```

**Prevention:**
```typescript
// CORRECT: Single aggregation query with groupBy
const totals = await prisma.transaction.groupBy({
  by: ['categoryId'],
  where: { userId, month: currentMonth },
  _sum: { amount: true }
})

// Or use include for relation loading
const categoriesWithTotals = await prisma.category.findMany({
  where: { userId },
  include: {
    transactions: {
      where: { month: currentMonth },
      select: { amount: true }
    }
  }
})
```

Use `relationLoadStrategy: 'join'` for single-query relation loading when the dataset is large:
```typescript
const result = await prisma.monthlyBudget.findMany({
  relationLoadStrategy: 'join',
  include: { allocations: { include: { category: true } } }
})
```

**Warning signs:**
- Any `for` or `forEach` loop that contains `await prisma.*` inside
- Dashboard page takes >2 seconds to load locally (even with a small dataset)
- Logging shows 20+ SQL queries for a single page render

**Phase to address:** Phase 2–3 (data layer). Enable Prisma query logging during development. Add query count assertions in integration tests.

---

### SIGNIFICANT-7: iOS Safari PWA — Service Workers, Notifications, and Storage Limits

**Source:** Training data (Apple Developer documentation, browser compatibility tables as of Aug 2025) — MEDIUM confidence. iOS 16.4+ improved PWA support significantly; verify current Safari version support before PWA phase.

**What goes wrong:**

**Issue A — Push Notifications:**
Web Push on iOS requires iOS 16.4+ AND the PWA must be added to the Home Screen. PWAs accessed through Safari browser (not installed) cannot receive push notifications regardless of iOS version. A significant portion of Pakistani iPhone users may be on iOS < 16.4 (particularly older devices).

**Issue B — Service Worker Scope and Storage:**
- iOS Safari limits service worker storage to ~50MB per origin (much lower than desktop Chrome)
- Safari aggressively clears service worker caches when storage pressure is high — offline data can disappear
- Background sync API is not fully supported on iOS

**Issue C — Installation UX:**
There is no native "Add to Home Screen" prompt on iOS Safari (unlike Android Chrome's beforeinstallprompt). The user must manually tap Share → Add to Home Screen. Discoverability is very low; the app must explicitly instruct iOS users how to install it.

**Issue D — Splash Screen and Status Bar:**
iOS requires specific `<meta>` tags and icons for proper splash screen and status bar appearance. Missing these makes the PWA look unpolished:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">
```

**Prevention:**
- Design notifications as optional (not critical path) and provide in-app alternatives for iOS users
- Test on a real iPhone — iOS Simulator does not accurately simulate service worker behavior
- Keep service worker cache small; prioritize caching app shell only, not transaction data
- Show an explicit "Install this app" guide specifically for iOS users with Safari share button animation

**Warning signs:**
- Notification feature tested only in Chrome/Android
- Service worker precaching every API response (will hit storage limits on iOS)
- No iOS-specific install prompt guidance in the onboarding flow

**Phase to address:** Phase 2 (PWA setup). Build the iOS install guide in the onboarding flow. Test push notifications on a real iOS device before shipping.

---

### SIGNIFICANT-8: Anthropic API — Rate Limits and Cost Explosion in Chat-Heavy Features

**Source:** Training data (Anthropic API documentation as of Aug 2025) — MEDIUM confidence. Verify current rate limits at platform.anthropic.com before the AI coaching phase.

**What goes wrong:**
The Claude API (claude-3-5-sonnet or similar) charges per input+output token. A behavioral finance coaching feature that sends the user's full transaction history as context on every message will burn credits extremely fast. Key failure modes:

**Issue A — Unbounded context window:**
Sending all 500+ transactions as context for every coaching message. At ~4 tokens per transaction record JSON, 500 transactions = ~2,000 tokens of context on every request. At 10 requests/session × 30 DAU = 300 requests/day × 2,000 context tokens = 600,000 input tokens/day, before counting output tokens.

**Issue B — No streaming — perceived slowness:**
Non-streaming responses on a long Claude output (500+ tokens) take 5–15 seconds. On a mobile PWA this feels broken. Users assume the app crashed.

**Issue C — No rate limit handling:**
Anthropic enforces per-minute and per-day token limits. Without exponential backoff and user-visible error messages, rate limit hits produce cryptic failures.

**Issue D — No spending cap:**
Without a hard spending cap set in the Anthropic console, a viral moment or a bug that loops API calls can incur hundreds of dollars in charges overnight.

**Prevention:**
- Summarize transaction history before sending to Claude: "Spent PKR 45,000 on food in March, PKR 12,000 on transport" rather than raw JSON
- Implement session-level context windowing: keep only the last 10 messages in history
- Use streaming (`stream: true`) on all Claude responses for perceived performance
- Implement per-user daily coaching call limits (e.g., 5 AI coaching queries/day on free tier)
- Set a hard monthly budget cap in Anthropic console immediately
- Cache repeated coaching insights (same spending pattern → same advice) with a hash key

**Warning signs:**
- Full transaction list serialized to JSON and included in every prompt
- No streaming implemented
- No per-user rate limiting in the application layer
- No Anthropic spend alert configured

**Phase to address:** Phase 3–4 (AI coaching). Design the context compression strategy before writing any prompt code.

---

## Minor Pitfalls (Nice to Know)

These are annoyances or technical debt creators but rarely cause project failure.

---

### MINOR-1: Financial Calculations Using JavaScript `number` Instead of `Decimal`

**Source:** Prisma official docs, verified via Context7 `/prisma/web` — HIGH confidence for the Prisma/DB side; standard CS knowledge for JS float behavior.

**What goes wrong:**
JavaScript `number` is IEEE 754 double-precision floating point. Financial calculations accumulate rounding errors:
```typescript
0.1 + 0.2           // → 0.30000000000000004 (not 0.3)
1500.50 + 2499.50   // → 3999.9999999999995 (not 4000)
```

For PKR amounts this matters less at whole-rupee granularity but becomes critical for:
- Loan interest calculations (monthly compounding)
- Category percentage splits of salary
- Running balance across many transactions

**Prevention — use integers or Decimal:**

**Option A (recommended for PKR):** Store all amounts as integers representing paisas (1 PKR = 100 paisas). `15050` means PKR 150.50. All arithmetic is integer arithmetic — no precision loss.

**Option B:** Use `Prisma.Decimal` with the `Decimal.js` library:
```prisma
// schema.prisma
model Transaction {
  amount Decimal @db.Decimal(12, 2)  // 12 total digits, 2 decimal places
}
```
```typescript
import { Prisma } from '@prisma/client'
const total = new Prisma.Decimal(transaction.amount).plus(new Prisma.Decimal(fee))
```

Never convert `Decimal` to `number` for calculations — only convert at the display layer.

**Warning signs:**
- `amount Float` in Prisma schema (should be `Decimal`)
- PKR amounts stored as `number` type in TypeScript
- Any arithmetic done with `+` on monetary values without Decimal library

**Phase to address:** Phase 1 (data model). Choose the strategy (integer paisas vs Decimal) and enforce it consistently. Paisas is simpler; Decimal is more explicit.

---

### MINOR-2: Zero-Based Budgeting UX — Why Finance Apps Lose Users in Week 2

**Source:** Training data (UX research on financial app abandonment, YNAB/Mint post-mortems) — MEDIUM confidence

**What goes wrong:**
The most common abandonment pattern in personal finance apps:

1. **Onboarding friction:** User must set up all budget categories before they can log anything. If initial setup takes >5 minutes, 60%+ of users abandon.
2. **Salary timing mismatch:** Pakistani salaries arrive irregularly (25th, 30th, or next working day after EID). A fixed monthly budget that starts on the 1st doesn't match when users actually receive money.
3. **Unbudgeted spending shame:** When a user overspends a category, apps that show red numbers prominently cause users to stop using the app rather than deal with the discomfort.
4. **Missing "why should I care" moment:** Users need to see a concrete insight within the first session — not just empty categories. "You could save PKR 8,000/month if you reduce food spending by 20%" is the hook.

**Prevention:**
- Provide 5 sensible default categories for Pakistan context (Food & Groceries, Transport, Utilities, Rishta/Family, Savings) that work without customization
- Allow salary date configuration (not hard-coded to 1st of month)
- Use progress bars instead of red numbers for over-budget categories
- Surface one insight on the dashboard before the user has entered more than 3 transactions
- Design an under-5-minute onboarding path; defer full budget setup to later

**Warning signs:**
- Zero-state dashboard shows nothing but empty categories
- Budget setup requires filling all fields before proceeding
- Month always starts January 1 regardless of user's pay cycle
- Overspending shown in red without constructive framing

**Phase to address:** Phase 2 (core UX). Test the onboarding flow with 5 non-technical Pakistani users before launch.

---

### MINOR-3: Prisma Schema Drift Between Environments

**What goes wrong:**
Supabase auto-generates tables in the `auth` and `storage` schemas. When `prisma db pull` (introspection) is run on a Supabase database, it pulls ALL tables including Supabase-internal ones into `schema.prisma`. This creates false schema drift warnings on every `migrate dev` run.

**Prevention:**
Exclude Supabase internal schemas from introspection:
```prisma
// schema.prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
  schemas           = ["public"]  // Only manage the public schema
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}
```

Never run `prisma db pull` on a production Supabase database without filtering to `public` schema only.

**Warning signs:**
- `schema.prisma` contains models like `AuthUsers`, `StorageObjects`, `StorageBuckets`
- `migrate dev` always shows schema drift even after applying migrations

**Phase to address:** Phase 1 (scaffolding).

---

### MINOR-4: PKR Number Formatting Inconsistency

**What goes wrong:**
Pakistan uses the South Asian numbering system: 1 lakh = 100,000 and 1 crore = 10,000,000. Standard JavaScript `toLocaleString('en-PK')` does not always produce the expected lakh/crore format. Different browsers interpret locale strings differently.

**Prevention:**
Write a `formatPKR()` utility function and use it exclusively throughout the codebase. Never use raw `toLocaleString` for amounts:

```typescript
export function formatPKR(amount: number | Prisma.Decimal): string {
  const n = typeof amount === 'number' ? amount : amount.toNumber()
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000) return `PKR ${(n / 100_000).toFixed(2)} L`
  if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(1)}K`
  return `PKR ${n.toLocaleString('en-PK')}`
}
```

**Warning signs:**
- `toLocaleString` used directly in JSX
- Amount display inconsistent between pages (some show 150,000 others show 1.5L)

**Phase to address:** Phase 1 (utilities). Create `formatPKR` before any UI components are written.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 1: Scaffolding | Database setup | Missing `DIRECT_URL` — migration failures from day one | Set both `DATABASE_URL` and `DIRECT_URL` before writing first model |
| Phase 1: Scaffolding | Migration user | Default postgres user lacks `createdb bypassrls` | Run Prisma user SQL setup in Supabase SQL editor on day one |
| Phase 1: Auth setup | Session security | `getSession()` used server-side instead of `getUser()` | Code review checklist: grep for `getSession` in server files |
| Phase 1: Auth setup | Middleware | Middleware returns wrong response object, sessions break | Copy the exact middleware template from Supabase official docs |
| Phase 1: Data model | RLS security | INSERT/UPDATE policies missing `WITH CHECK` | Template snippet for every new RLS policy; test with cross-user writes |
| Phase 1: Data model | RLS performance | Missing `TO authenticated`, unwrapped `auth.uid()`, no indexes | Standard policy template includes all three patterns |
| Phase 1: Data model | Monetary precision | `Float` type used for PKR amounts | Schema convention: `Decimal @db.Decimal(12,2)` for all amount fields |
| Phase 1: Data model | Prisma-RLS gap | Prisma bypasses PostgREST; `auth.uid()` returns NULL | Decision logged: use application-layer user scoping (Option A from CRITICAL-5) |
| Phase 2: PWA setup | next-pwa | Original `next-pwa` incompatible with App Router | Spike: test `@ducanh2912/next-pwa` or `serwist` before any PWA work |
| Phase 2: PWA setup | iOS Safari | Push notifications require Home Screen install + iOS 16.4+ | Make notifications optional; test on real iPhone |
| Phase 2: Core UX | Onboarding | >5-min setup causes abandonment | Pakistan-local default categories; defer advanced setup |
| Phase 3: AI coaching | Anthropic costs | Unbounded context → cost explosion | Compress transaction history to summaries; per-user daily limits |
| Phase 3: AI coaching | Rate limits | No retry/backoff logic → silent failures | Implement streaming + exponential backoff before shipping AI features |
| Phase 3: Queries | Prisma N+1 | Dashboard fires 30+ queries per page load | Enable query logging; `groupBy` and `include` instead of loops |
| Phase 3: Queries | Relation over-fetching | `include` without `select` returns entire related models | Use nested `select` in all includes; select only needed fields |
| Phase 4: Production | Migration deployment | `migrate dev` run against production | CI/CD pipeline uses only `migrate deploy`; never `migrate dev` in CI |
| Phase 4: Production | Connection exhaustion | Multiple PrismaClient instances under serverless | Confirm singleton pattern; monitor connection count in Supabase dashboard |

---

## Sources

- Supabase Prisma integration guide: `https://supabase.com/docs/guides/database/prisma` (via Context7 `/supabase/supabase`)
- Supabase RLS documentation: `https://supabase.com/docs/guides/database/postgres/row-level-security` (via Context7)
- Supabase RLS performance best practices: `https://supabase.com/docs/troubleshooting/rls-performance-and-best-practices-Z5Jjwv` (via Context7)
- Supabase Prisma error management: `https://supabase.com/docs/troubleshooting/prisma-error-management-Cm5P_o` (via Context7)
- Supabase Next.js auth tutorial: `https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs` (via Context7)
- Supabase `getSession` vs `getUser` warning: `https://supabase.com/docs/_partials/get_session_warning` (via Context7)
- Prisma connection pooling + pgBouncer: `https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer` (via Context7 `/prisma/web`)
- Prisma shadow database: `https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database` (via Context7)
- Prisma Next.js guide (singleton): `https://www.prisma.io/docs/guides/frameworks/nextjs` (via Context7)
- Prisma N+1 optimization: `https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance` (via Context7)
- Prisma Decimal type: `https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types` (via Context7)
- iOS PWA limitations: Apple Developer documentation (training data, Aug 2025)
- Finance app abandonment patterns: YNAB/Mint UX research (training data, Aug 2025)
- Anthropic Claude API rate limits and pricing: platform.anthropic.com (training data, Aug 2025 — verify current limits before AI coaching phase)
