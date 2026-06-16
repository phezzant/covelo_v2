-- Covelo prototype schema
-- Single profiles table with role flag (not separate child/adult tables) —
-- see project notes: this keeps journey_partner FKs clean and avoids
-- duplicating auth.users mapping across two profile tables.
--
-- NOTE ON ORDERING: profiles' RLS policies reference journey_partner, and
-- journey_partner's table definition references profiles via FK. To
-- satisfy both directions, tables are created first (profiles, then
-- journey_partner), and only then do we attach policies to either —
-- policies are added in a second pass after all referenced tables exist.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS (all up front — no dependencies between them)
-- ============================================================
create type user_role as enum ('child', 'adult');
create type partner_status as enum ('pending', 'active', 'expired', 'declined');
create type invite_direction as enum ('child_invited_adult', 'adult_invited_child');
create type trade_side as enum ('buy', 'sell');

-- ============================================================
-- TABLES (created in dependency order: profiles before
-- journey_partner/portfolios, portfolios before holdings/trades)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  display_name text not null,
  username text unique,
  avatar_emoji text default '🦊',
  age_range text, -- only meaningful for child role; nullable
  onboarding_completed boolean not null default false,
  onboarding_step int not null default 0,
  created_at timestamptz not null default now()
);

-- Design constraints, per Account States & Architecture doc:
--   - one adult -> many children (siblings) is allowed
--   - one child has at most one ACTIVE partner at a time
--   - exactly one open `pending` row per child at a time
--   - supports both invite directions (Flow A: child invites adult,
--     Flow B: adult invites child) via `initiated_by`
create table journey_partner (
  id uuid primary key default gen_random_uuid(),
  adult_id uuid references profiles(id) on delete cascade,
  child_id uuid references profiles(id) on delete cascade,
  status partner_status not null default 'pending',
  initiated_by invite_direction not null,
  -- for invites sent before the counterpart has an account yet
  invited_email text,
  invited_name text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),

  constraint adult_or_email check (adult_id is not null or invited_email is not null),
  constraint child_or_email check (child_id is not null or invited_email is not null)
);

-- Exactly one ACTIVE partner per child at a time
create unique index one_active_partner_per_child
  on journey_partner (child_id)
  where (status = 'active');

-- Exactly one PENDING invite per child at a time (prevents the
-- double-invite mess the design explicitly avoids)
create unique index one_pending_invite_per_child
  on journey_partner (child_id)
  where (status = 'pending');

create table instruments (
  id uuid primary key default gen_random_uuid(),
  ticker text unique not null,
  name text not null,
  sector text not null,
  price numeric(12,2) not null,
  day_change_pct numeric(6,2) not null default 0,
  logo_emoji text not null default '📈',
  description text
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references profiles(id) on delete cascade,
  cash_balance numeric(14,2) not null default 10000.00,
  created_at timestamptz not null default now()
);

create table holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  instrument_id uuid not null references instruments(id),
  quantity numeric(14,4) not null check (quantity >= 0),
  avg_cost numeric(12,2) not null,
  unique (portfolio_id, instrument_id)
);

create table trades (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  instrument_id uuid not null references instruments(id),
  side trade_side not null,
  quantity numeric(14,4) not null check (quantity > 0),
  price numeric(12,2) not null,
  total numeric(14,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ENABLE RLS (all tables — done after all tables exist)
-- ============================================================
alter table profiles enable row level security;
alter table journey_partner enable row level security;
alter table instruments enable row level security;
alter table portfolios enable row level security;
alter table holdings enable row level security;
alter table trades enable row level security;

-- ============================================================
-- POLICIES — PROFILES
-- ============================================================
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view their linked partner's profile"
  on profiles for select
  using (
    id in (
      select adult_id from journey_partner where child_id = auth.uid() and status = 'active'
      union
      select child_id from journey_partner where adult_id = auth.uid() and status = 'active'
    )
  );

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- POLICIES — JOURNEY_PARTNER
-- ============================================================
create policy "Participants can view their own partner rows"
  on journey_partner for select
  using (auth.uid() = adult_id or auth.uid() = child_id);

create policy "Participants can create partner invites"
  on journey_partner for insert
  with check (auth.uid() = adult_id or auth.uid() = child_id);

create policy "Participants can update their own partner rows"
  on journey_partner for update
  using (auth.uid() = adult_id or auth.uid() = child_id);

-- ============================================================
-- POLICIES — INSTRUMENTS
-- ============================================================
create policy "Instruments are readable by all authenticated users"
  on instruments for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- POLICIES — PORTFOLIOS
-- ============================================================
create policy "Users can view their own portfolio"
  on portfolios for select
  using (auth.uid() = profile_id);

create policy "Users can view their partner's portfolio"
  on portfolios for select
  using (
    profile_id in (
      select adult_id from journey_partner where child_id = auth.uid() and status = 'active'
      union
      select child_id from journey_partner where adult_id = auth.uid() and status = 'active'
    )
  );

create policy "Users can update their own portfolio"
  on portfolios for update
  using (auth.uid() = profile_id);

create policy "Users can insert their own portfolio"
  on portfolios for insert
  with check (auth.uid() = profile_id);

-- ============================================================
-- POLICIES — HOLDINGS
-- ============================================================
create policy "Users can view their own holdings"
  on holdings for select
  using (portfolio_id in (select id from portfolios where profile_id = auth.uid()));

create policy "Users can view partner's holdings"
  on holdings for select
  using (
    portfolio_id in (
      select id from portfolios where profile_id in (
        select adult_id from journey_partner where child_id = auth.uid() and status = 'active'
        union
        select child_id from journey_partner where adult_id = auth.uid() and status = 'active'
      )
    )
  );

create policy "Users can manage their own holdings"
  on holdings for all
  using (portfolio_id in (select id from portfolios where profile_id = auth.uid()));

-- ============================================================
-- POLICIES — TRADES
-- ============================================================
create policy "Users can view their own trades"
  on trades for select
  using (portfolio_id in (select id from portfolios where profile_id = auth.uid()));

create policy "Users can view partner's trades"
  on trades for select
  using (
    portfolio_id in (
      select id from portfolios where profile_id in (
        select adult_id from journey_partner where child_id = auth.uid() and status = 'active'
        union
        select child_id from journey_partner where adult_id = auth.uid() and status = 'active'
      )
    )
  );

create policy "Users can create their own trades"
  on trades for insert
  with check (portfolio_id in (select id from portfolios where profile_id = auth.uid()));
