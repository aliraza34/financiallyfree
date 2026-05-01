# MoneyMap PKR Agent Guide

This repo is managed with the GSD planning workflow. Read these files before planning or implementation work:

- `.planning/STATE.md` for current phase, status, blockers, and session continuity.
- `.planning/PROJECT.md` for product context, core value, constraints, and decisions.
- `.planning/REQUIREMENTS.md` for testable requirement IDs and traceability.
- `.planning/ROADMAP.md` for phase order, success criteria, and plan breakdown.
- `.planning/research/SUMMARY.md` for stack, architecture, and pitfalls.

## Current Project

MoneyMap PKR is a mobile-first PWA for Pakistani salaried users who need to see where every rupee goes. The core value is bucket-level financial visibility: never show raw salary as spendable cash when bucket allocation is the source of truth.

## Engineering Constraints

- Use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Prisma, React Hook Form, Zod, and Recharts unless a phase plan explicitly changes the stack.
- Use Supabase Auth for identity and Prisma for public app data.
- Use `supabase.auth.getUser()` for server authorization; do not trust `getSession()` on the server.
- Use a Prisma singleton. Do not create `new PrismaClient()` outside the singleton module.
- Scope every Prisma query by authenticated `userId`.
- Enable RLS on user-owned tables as defense-in-depth, including `TO authenticated`, indexed `user_id`, and `WITH CHECK`.
- Configure separate `DATABASE_URL` and `DIRECT_URL` before Prisma migrations.
- Use one `formatPKR()` utility everywhere; PKR displays must use lakh/crore notation.
- Keep the app mobile-first: bottom nav, 44px tap targets, large number inputs, and no horizontal scrolling.

## Product Constraints

- Islamic mode is ON by default.
- Committee tracking, Qarza/debt framing, PKR formatting, cash-first payment methods, and Pakistan-local categories are v1 requirements.
- Manual transaction entry is v1; bank sync is out of scope.
- AI, leakage scoring, investments, Zakat, advanced analytics, offline queue, and Flutter API expansion are deferred beyond v1.
- Financial projections and Zakat/investment features require disclaimers and must not promise guaranteed outcomes.

## Workflow

The project is initialized and ready for Phase 1 planning.

Recommended next command:

```text
$gsd-plan-phase 1
```

For extra context gathering before planning:

```text
$gsd-discuss-phase 1
```
