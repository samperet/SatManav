// Database schema. Applied automatically (idempotently) the first time a server function
// touches the database, under an advisory lock so concurrent cold starts don't race.
export const SCHEMA = `
begin;
select pg_advisory_xact_lock(4207131);

create table if not exists pageviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor text not null,              -- daily-rotating anonymous hash, no raw IP stored
  path text not null,
  source text,                        -- null = internal navigation; set on entry pageviews
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
  geometric smallint check (geometric between 1 and 5),
  abstract smallint check (abstract between 1 and 5),
  eastern smallint check (eastern between 1 and 5),
  message text,
  photos text[] not null default '{}', -- private Vercel Blob pathnames
  source text,
  medium text,
  referrer_host text,
  landing_path text,
  utm_campaign text,
  country text,
  region text,
  city text,
  device text,
  visitor text
);
create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_email_idx on leads (email);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  email text,                         -- private: never shown on the site
  body text not null check (char_length(body) between 10 and 3000),
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz
);
create index if not exists testimonials_status_idx on testimonials (status, approved_at desc);

commit;
`;
