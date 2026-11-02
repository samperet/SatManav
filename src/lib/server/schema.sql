-- Sat Manav website schema (Neon Postgres via Vercel).
-- Applied automatically the first time the site talks to an empty database
-- (see db.ts). Every statement must be idempotent and end with ";" on its own line.

create table if not exists pageviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor text not null,
  path text not null,
  source text,
  medium text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  region text,
  city text,
  device text,
  browser text,
  os text
);

create index if not exists pageviews_created_at_idx on pageviews (created_at);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  stage text not null default 'email' check (stage in ('email', 'details')),
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'archived')),
  first_name text,
  last_name text,
  phone text,
  intention text,
  geometric smallint,
  abstract smallint,
  eastern smallint,
  message text,
  photos text[] not null default '{}',
  source text,
  medium text,
  referrer_host text,
  utm_campaign text,
  landing_path text,
  country text,
  region text,
  city text,
  device text,
  visitor text
);

create index if not exists leads_created_at_idx on leads (created_at);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text,
  body text not null,
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz
);

create index if not exists testimonials_status_idx on testimonials (status, approved_at desc);
