# Cross-Model Handoff

**Last updated:** 2026-05-01
**Current status:** Phase 2 complete; resume at Phase 3.

## What Is Done

- Phase 1 is complete in local demo mode: Next.js app scaffold, Prisma schema, RLS migration, auth/onboarding flow, PKR formatter, PWA manifest, protected dashboard.
- Phase 2 is complete and user-verified in browser: salary allocation, warning rules, transaction quick-add, transaction search, transaction edit/delete, unknown-category surfacing, dashboard spending updates.
- Local demo auth is active through `.env.local`:
  - Email: `demo@moneymap.local`
  - Password: `password123`

## Important Context

- The app currently runs in local demo mode with cookie-backed profile, allocation, and transaction data.
- Keep local demo mode working while adding Phase 3.
- Prisma/Supabase paths should remain ready for real persistence once Supabase env values and migrations are configured.
- Amounts are stored as paisa integers (`BigInt` / fields ending in `Paisa`).
- Use `formatPKR()` everywhere for money display.

## Resume Here

Start Phase 3: **Budgets, Debt, and Committees**.

Phase 3 requirements:
- `BUDG-01` through `BUDG-04`
- `DEBT-01` through `DEBT-05`
- `COMM-01` through `COMM-04`

Expected Phase 3 plans:
1. Generate monthly budgets from allocations and display planned-vs-actual bucket/category progress.
2. Implement Qarza/debt tracker, payment logging, payoff strategy comparison, and strict-mode debt warning.
3. Implement committee tracker, burden calculations, net position, and committee/debt warning rules.

## Verification Before Continuing

Run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Then start dev server:

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:3000/login`.
