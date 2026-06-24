# Covelo — prototype

A click-through prototype of Covelo: landing page, signup/login, and a 4-tab
app (Portfolio, Research & Trade, Compete & Compare, Profile) with a guided
onboarding tutorial and a working Teammate invite flow.

Built with Next.js (App Router) + Supabase (Auth + Postgres), intended for
Vercel deployment.

## What's real vs. simulated

- **Auth** is real Supabase Auth (email/password).
- **Trades, portfolios, holdings** are real — backed by actual Postgres
  tables with row-level security.
- **Market data** is fully static/hardcoded (32 fake instruments, prices
  never move) — there's no live market data API in this prototype.
- **Teammate invites** are simulated in-app, not real email. When
  you invite someone, the invite is stored as a `pending` row; it resolves
  to `active` automatically when someone signs up using the matching email
  address (see "How invites resolve" below). No email is actually sent.

## Setup

### 1. Create a Supabase project

Go to supabase.com, create a new project, and wait for it to finish
provisioning.

### 2. Run the migrations

In the Supabase Dashboard, go to **SQL Editor**, and run the contents of
these two files in order:

1. `supabase/migrations/0001_init.sql` — creates all tables, RLS policies,
   and constraints.
2. `supabase/migrations/0002_seed_instruments.sql` — seeds 32 fake
   companies to trade.

(Alternatively, if you have the Supabase CLI installed and linked to your
project: `supabase db push`.)

### 3. Turn off email confirmation (recommended for a prototype)

By default, new Supabase projects require users to click an email
confirmation link before they get a session. This app handles that case
(it'll show a "check your inbox" screen), but for a faster prototype loop,
turn it off:

Dashboard → **Authentication** → **Sign In / Providers** → **Email** →
disable **Confirm email**.

If you leave it on, signup still works, but the person needs to click the
confirmation link before they can complete role selection.

### 4. Get your API credentials

Dashboard → **Settings** → **API**. Copy the **Project URL** and the
**anon/public key**.

### 5. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values from
step 4:

```bash
cp .env.local.example .env.local
```

### 6. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same two environment variables from `.env.local` in the
   Vercel project settings (Settings → Environment Variables).
4. Deploy.

No other configuration is needed — there's no separate backend to deploy;
Supabase is the entire backend.

## How invites resolve (Flow A / Flow B)

Per the Account Linking design doc, there's no real email sending in this
prototype. Instead:

- **Flow A (child invites adult):** the child enters the adult's name and
  email in the invite overlay. This creates a `journey_partner` row with
  `child_id` set and `adult_id` null, status `pending`.
- **Flow B (adult invites child):** same thing in reverse.
- **Resolution:** when *anyone* signs up with an email matching an
  `invited_email` on a pending row (and their role matches the missing
  side), the signup flow automatically claims that invite and flips it to
  `active`. This is how you test the full loop locally — invite
  `test@example.com` as the partner, then sign up a second account using
  that same email with the opposite role.

To test the whole loop, you'll need two separate accounts. Easiest way:
use the same browser in a regular window and an incognito window, or two
different browsers.

## Project structure

- `src/app/` — routes (landing, login, signup, the 4-tab app)
- `src/components/app/` — app-specific UI (overlays, tab bar, onboarding
  tour, partner banner)
- `src/components/landing/`, `src/components/ui/` — landing page and
  shared form/auth components
- `src/lib/supabase/` — Supabase client setup (browser, server, proxy)
- `src/lib/data/context.ts` — server-side data fetching helpers
- `src/lib/onboarding/steps.ts` — the guided tutorial's step content
- `src/types/database.ts` — hand-written types matching the SQL schema
- `supabase/migrations/` — the actual SQL schema and seed data

## Known limitations (by design, for a prototype)

- No real market data — prices are static.
- No real email sending for invites.
- No household/multi-child grouping yet (architecture supports it — see
  the Account States & Architecture page in the product docs — but the UI
  doesn't expose adding a second child).
- No real brokerage import for the adult's portfolio (flagged as
  out-of-scope for this build — see project discussion).
- Compete/Compare shows a real partner comparison once linked, but the
  "friends leaderboard" is a placeholder empty state.
# covelo_v2
