create extension if not exists "pgcrypto";

create type "AllocationStatus" as enum ('DRAFT', 'CONFIRMED');
create type "TransactionType" as enum ('INCOME', 'EXPENSE', 'TRANSFER');
create type "DebtType" as enum ('QARZA', 'CREDIT_CARD', 'EMPLOYER_ADVANCE', 'COMMITTEE_OBLIGATION', 'OTHER');
create type "Urgency" as enum ('LOW', 'MEDIUM', 'HIGH');
create type "RiskLevel" as enum ('LOW', 'MEDIUM', 'HIGH');
create type "GoalType" as enum ('SYSTEM', 'CUSTOM');

create table "profiles" (
  "id" uuid primary key references auth.users(id) on delete cascade,
  "name" text,
  "salary_paisa" bigint not null default 0,
  "salary_day" integer not null default 1,
  "emergency_fund_paisa" bigint not null default 0,
  "freedom_target_paisa" bigint not null default 5000000000,
  "islamic_mode" boolean not null default true,
  "strict_mode" boolean not null default false,
  "onboarding_complete" boolean not null default false,
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table "salary_allocations" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "month" date not null,
  "salary_paisa" bigint not null,
  "status" "AllocationStatus" not null default 'DRAFT',
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp,
  constraint "salary_allocations_user_id_month_key" unique ("user_id", "month")
);

create table "bucket_allocations" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "salary_allocation_id" uuid not null references "salary_allocations"("id") on delete cascade,
  "bucket" text not null,
  "planned_paisa" bigint not null,
  "spent_paisa" bigint not null default 0,
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp,
  constraint "bucket_allocations_salary_allocation_id_bucket_key" unique ("salary_allocation_id", "bucket")
);

create table "transactions" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "type" "TransactionType" not null,
  "amount_paisa" bigint not null,
  "category" text not null,
  "bucket" text not null,
  "payment_method" text not null,
  "occurred_on" date not null,
  "note" text,
  "is_planned" boolean not null default false,
  "is_recurring" boolean not null default false,
  "emotional_trigger" text,
  "money_type" text not null default 'cash',
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table "debts" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "lender_name" text not null,
  "type" "DebtType" not null,
  "original_amount_paisa" bigint not null,
  "remaining_amount_paisa" bigint not null,
  "monthly_payment_paisa" bigint not null default 0,
  "due_date" date,
  "islamic_concern" boolean not null default true,
  "urgency" "Urgency" not null default 'MEDIUM',
  "emotional_pressure" text,
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table "committees" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "name" text not null,
  "contribution_paisa" bigint not null,
  "member_count" integer not null,
  "receiving_month" date not null,
  "manager_name" text,
  "risk_level" "RiskLevel" not null default 'MEDIUM',
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table "goals" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "profiles"("id") on delete cascade,
  "title" text not null,
  "target_paisa" bigint not null,
  "current_paisa" bigint not null default 0,
  "type" "GoalType" not null default 'CUSTOM',
  "sort_order" integer not null default 0,
  "achieved_at" timestamp(3),
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp,
  constraint "goals_user_id_title_key" unique ("user_id", "title")
);

create index "salary_allocations_user_id_idx" on "salary_allocations" ("user_id");
create index "bucket_allocations_user_id_idx" on "bucket_allocations" ("user_id");
create index "transactions_user_id_occurred_on_idx" on "transactions" ("user_id", "occurred_on");
create index "debts_user_id_idx" on "debts" ("user_id");
create index "committees_user_id_idx" on "committees" ("user_id");
create index "goals_user_id_idx" on "goals" ("user_id");

alter table "profiles" enable row level security;
alter table "salary_allocations" enable row level security;
alter table "bucket_allocations" enable row level security;
alter table "transactions" enable row level security;
alter table "debts" enable row level security;
alter table "committees" enable row level security;
alter table "goals" enable row level security;

alter table "profiles" force row level security;
alter table "salary_allocations" force row level security;
alter table "bucket_allocations" force row level security;
alter table "transactions" force row level security;
alter table "debts" force row level security;
alter table "committees" force row level security;
alter table "goals" force row level security;

create policy "profiles_owner_all" on "profiles"
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "salary_allocations_owner_all" on "salary_allocations"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "bucket_allocations_owner_all" on "bucket_allocations"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "transactions_owner_all" on "transactions"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "debts_owner_all" on "debts"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "committees_owner_all" on "committees"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "goals_owner_all" on "goals"
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
