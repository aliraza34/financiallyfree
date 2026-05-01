# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-01)

**Core value:** Make every rupee visible: users must always know exactly how much they have to spend across each bucket, never a misleading total salary available number.
**Current focus:** Phase 2 - Salary Allocation and Transactions

## Current Position

Phase: 2 of 5 (Salary Allocation and Transactions)
Plan: 3 of 3 in current phase
Status: In progress - Phase 2 implemented in local demo mode, awaiting browser UAT and Supabase-backed verification
Last activity: 2026-05-01 - Phase 2 development added editable salary allocation, warning rules, transaction quick-add, transaction search/edit/delete, unknown-category surfacing, and dashboard spending updates.

Progress: [####------] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 4 verified in local demo, 3 implemented pending browser UAT
- Average duration: n/a
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation, Auth, and Onboarding | 4/4 local verified | n/a | n/a |
| 2. Salary Allocation and Transactions | 3/3 implemented | n/a | n/a |
| 3. Budgets, Debt, and Committees | 0/3 | n/a | n/a |
| 4. Goals and Dashboard | 0/3 | n/a | n/a |
| 5. Reports, Settings, and PWA Polish | 0/3 | n/a | n/a |

**Recent Trend:**
- Last 5 plans: none
- Trend: n/a

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Use Next.js App Router, Supabase, Prisma, Tailwind, shadcn/ui, and Recharts unless phase planning uncovers a blocker.
- Treat committee tracking, Islamic mode, PKR formatting, and Qarza framing as v1 product requirements.
- Build schema/auth/RLS/user-scoped Prisma conventions before user-facing data screens.
- Local demo mode is active through `AUTH_MODE="local"` in `.env.local`.
- Phase 2 local data is cookie-backed for temporary testing; real persistence requires Supabase env and migrations.

### Pending Todos

None yet.

### Blockers/Concerns

- Amount storage strategy chosen: paisa integer amounts stored as `BigInt` fields ending in `Paisa`.
- Supabase Prisma migration user and dual connection strings must be configured before applying migrations.
- Competitor claims and AI model IDs require fresh verification in later phases.
- Phase 1 requires real Supabase env values before auth and onboarding can be manually verified end to end.
- Phase 2 requires browser UAT for salary allocation and transaction edit/delete flows.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v2 | Leakage detector, AI Rizq Coach, net worth snapshots, fixed/flexible discovery, freedom calculator | Deferred | Initialization |
| v3 | Investments, Zakat, advanced charts, offline queue, push, CSV export, app PIN, Flutter API | Deferred | Initialization |

## Session Continuity

Last session: 2026-05-01
Stopped at: Phase 2 implementation built and verified with typecheck, lint, and production build.
Resume file: None
