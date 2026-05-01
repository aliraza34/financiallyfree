# Stack Research — MoneyMap PKR

**Researched:** 2026-05-01
**Overall Confidence:** HIGH (all critical claims verified against Context7/official docs)

---

## Recommended Stack

| Layer | Chosen | Version | Rationale | Confidence |
|-------|--------|---------|-----------|------------|
| Framework | Next.js App Router | 15.x stable | Verified latest production-stable; canary is at 16.x. App Router is the only supported path for PWA manifest and Server Actions. | HIGH |
| Language | TypeScript | 5.x (bundled) | Non-negotiable for AI-assisted codegen — LLMs produce far fewer bugs with typed codebases. | HIGH |
| Styling | Tailwind CSS | v4.x | v4 is the current major; ships as a CSS plugin (no PostCSS required). shadcn/ui v4 requires Tailwind v4. | HIGH |
| UI Components | shadcn/ui | shadcn@2.9.0 / v4 | Copy-paste component model means AI tools can scaffold entire screens. Excellent Radix UI accessibility base. | HIGH |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) | v1.26+ | Managed PostgreSQL with built-in auth, RLS, and real-time. `@supabase/ssr` confirmed for Next.js App Router server-side auth. Flutter client libraries exist for future mobile app. | HIGH |
| ORM | Prisma | 6.x (6.19+) | Declarative schema DSL is the best-supported ORM in LLM training data. Cursor/Claude Code generate correct Prisma schema and queries reliably. Requires singleton pattern + DATABASE_URL/DIRECT_URL split for Supabase's PgBouncer pooler. | HIGH |
| Forms | React Hook Form | v7.66+ | Minimal re-renders, native shadcn/ui integration, zero-dependency. Best-in-class for mobile form UX. | HIGH |
| Validation | Zod | v3.x | Confirmed zodResolver integration with React Hook Form. Also used for API route input validation. Single schema shared between form and API layer. | HIGH |
| Charts | Recharts | v3.3+ | React-native SVG charts, ResponsiveContainer for mobile, composable API. Sufficient for all 10 required visualisations. Active 2025 maintenance. | HIGH |
| PWA | Built-in manifest + Serwist | @serwist/next (Phase 3 only) | next-pwa is abandoned. Next.js official docs (updated 2026-04-10) use app/manifest.ts + manual public/sw.js for install/push, and explicitly recommend Serwist for offline/caching. | HIGH |
| AI Coaching | Anthropic TypeScript SDK | @anthropic-ai/sdk latest | Streaming confirmed via messages.stream(). API-key-gated server-side only. | HIGH |
| Hosting | Vercel | — | Zero-config for Next.js; serverless functions work with Prisma singleton; free tier covers MVP. | HIGH |

---

## PWA Implementation Detail

**Phase 1 (installable):** No plugin needed.
- `app/manifest.ts` — Web app manifest (built-in Next.js)
- `public/sw.js` — Hand-written service worker (push notifications)
- `public/icon-192x192.png`, `icon-512x512.png`

**Phase 3 (offline caching):** Add Serwist.
- `app/sw.ts` — Serwist service worker definition
- `next.config.mjs` — `withSerwistInit()` wrapper

Source: nextjs.org/docs/app/guides/progressive-web-apps (last updated 2026-04-10)

---

## Prisma + Supabase Critical Config

Supabase uses PgBouncer in Transaction pooler mode. Prisma requires two connection strings:

```
DATABASE_URL="postgres://user:pass@db.xxxx.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://user:pass@db.xxxx.supabase.co:5432/postgres"
```

`schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Singleton pattern (`lib/prisma.ts`):
```typescript
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Remix / SvelteKit | Smaller LLM training corpus; AI codegen less reliable for Remix. SvelteKit TypeScript ecosystem is shallower. |
| ORM | Prisma | Drizzle ORM | Drizzle is faster but has steeper AI codegen curve. Prisma is the right choice when developer velocity is the constraint. Revisit at scale. |
| Auth | Supabase Auth | Auth.js (NextAuth) | Supabase Auth is already in the bundle and has native RLS JWT integration. Adding Auth.js creates a competing auth layer that breaks RLS. |
| UI Components | shadcn/ui | MUI / Chakra / bare Radix | MUI/Chakra are heavy, limited customisation. Bare Radix requires too much styling. shadcn/ui is what AI tools generate reliably. |
| Charts | Recharts | Victory / Chart.js / Nivo | Victory: poor SSR. Chart.js: canvas-based, harder to style for mobile. Nivo: heavy. Recharts is the standard React-native SVG choice. |
| PWA plugin | Serwist (Phase 3) | next-pwa | next-pwa is abandoned since 2022, no App Router support. |
| State | React built-ins | Zustand / Redux | Server state dominates this app. Add Zustand only when client-side shared state pain is felt. Not needed in Phase 1. |

---

## What NOT to Use (and Why)

| Technology | Avoid Because |
|------------|--------------|
| next-pwa | Abandoned since 2022. No App Router support. Will break on Next.js 15. |
| Pages Router | Deprecated for new projects. No new features. All PWA/Server Actions patterns require App Router. |
| Mongoose / Sequelize | Wrong paradigm for PostgreSQL. Prisma only. |
| Firebase / Firestore | Vendor lock-in, no SQL, weak Flutter migration path. Supabase gives a real PostgreSQL database. |
| GraphQL (Apollo/URQL) | Over-engineering for MVP. REST via API routes + Server Actions is sufficient. |
| Tailwind CSS v3 | shadcn/ui v4 requires Tailwind v4. Incompatible. |
| Server Actions for AI streaming | Server Actions cannot stream to the client. Use API Routes (`app/api/ai/chat/route.ts`) with ReadableStream for the Rizq Coach chat. |

---

## Key Decisions

1. **Use Next.js 15** (not 14) — it is the current stable. "14+" in the spec covers it.
2. **Defer Serwist to Phase 3** — installable PWA (Phase 1) only needs `app/manifest.ts` + HTTPS. No plugin.
3. **Prisma over Drizzle** — AI codegen velocity wins over runtime performance at this stage.
4. **Supabase Auth directly** — native RLS integration; adding Auth.js breaks the RLS architecture.
5. **No global state library in Phase 1** — server state dominates; add Zustand when pain is felt.
6. **API Routes for Rizq Coach chat** — Server Actions cannot stream; also creates clean REST endpoint for future Flutter app.
7. **Every data mutation that Flutter will need must be an API Route**, not just a Server Action. Enforce from Phase 1.

---

## Version Pinning Notes

| Package | Pin To | Notes |
|---------|--------|-------|
| next | ^15.1.8 | Latest stable 15.x. Do not use canary 16.x. |
| prisma / @prisma/client | ^6.19.2 | Current stable. |
| @supabase/supabase-js | ^2.x | v2 is current major. |
| @supabase/ssr | ^0.x | Pre-1.0 but official and stable. |
| tailwindcss | ^4.x | Required for shadcn/ui v4. |
| react-hook-form | ^7.66.0 | v7 stable. |
| zod | ^3.x | v4 is in beta. Pin v3. |
| recharts | ^3.3.0 | v3 is current major. |
| @anthropic-ai/sdk | latest | Pin to tested version before shipping. |
| @serwist/next | ^9.x | Phase 3 only. |

---

## Installation Commands

```bash
# Create project
npx create-next-app@15 moneymap-pkr --typescript --tailwind --app --src-dir=false

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Prisma
npm install prisma @prisma/client
npx prisma init

# Forms + Validation
npm install react-hook-form @hookform/resolvers zod

# Charts
npm install recharts

# AI
npm install @anthropic-ai/sdk

# shadcn/ui (run after Tailwind setup)
npx shadcn@latest init

# Phase 3 only
npm install @serwist/next serwist
```

---

## Open Questions

- **Tailwind v4 + shadcn/ui v4**: `npx create-next-app@15` may default to Tailwind v3 — verify at init and upgrade manually if needed.
- **Anthropic model ID**: Confirm exact latest model ID from Anthropic's model list when building AI chat. Spec mentions `claude-sonnet-4-20250514` — verify it's not deprecated.
- **Flutter REST API enforcement**: Every data operation Flutter will need must be an API Route from day one. Server Actions are Next.js RPC, not callable from Flutter.
