-- RingBack — Supabase schema (Run 4)
-- Schema: ringback (isolated from other apps in a shared project, or public in a dedicated project)
-- Multi-tenant self-serve AI receptionist for AU trades.

create extension if not exists "pgcrypto";

-- ─── Tenants (a trade business) ───
create table if not exists rb_tenants (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  trade text,                       -- plumber / electrician / hvac / carpenter / ...
  owner_name text,
  owner_email text unique,
  owner_mobile text,
  service_area text,                -- e.g. "Brisbane Northside"
  website_url text,
  demo_number text,                 -- temp number live instantly
  real_number text,                 -- their verified 07/02 number
  number_status text default 'demo',-- demo | verifying | live
  abn text,
  avg_job_value numeric default 650, -- for recovered-revenue math
  plan text default 'trial',        -- trial | founding | pro
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);

-- ─── Contacts (caller memory) ───
create table if not exists rb_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  name text,
  phone text not null,
  email text,
  suburb text,
  address text,
  customer_since date,
  is_vip boolean default false,
  is_blocked boolean default false,
  preferred_contact text default 'call',  -- call | sms
  notes text,
  lifetime_value numeric default 0,
  job_count int default 0,
  created_at timestamptz default now(),
  unique (tenant_id, phone)
);

-- ─── Calls ───
create table if not exists rb_calls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  contact_id uuid references rb_contacts(id) on delete set null,
  caller_phone text not null,
  caller_name text,
  suburb text,
  job_type text,                    -- "hot water system", "blocked drain", ...
  urgency text default 'routine',   -- emergency | soon | routine | spam
  outcome text,                     -- booked | message | transferred | quote | spam
  status text default 'answered',   -- answered | missed | in_progress
  summary text,                     -- AI plain-English summary
  transcript jsonb,                 -- [{speaker, text, ts}]
  recording_url text,
  duration_sec int,
  sentiment text,                   -- positive | neutral | negative
  after_hours boolean default false,
  needs_action boolean default false,
  is_spam boolean default false,
  booked_value numeric,             -- est. value if booked
  started_at timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists rb_calls_tenant_idx on rb_calls (tenant_id, started_at desc);
create index if not exists rb_calls_outcome_idx on rb_calls (tenant_id, outcome);

-- ─── Bookings ───
create table if not exists rb_bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  contact_id uuid references rb_contacts(id) on delete set null,
  call_id uuid references rb_calls(id) on delete set null,
  customer_name text,
  customer_phone text,
  address text,
  suburb text,
  job_type text,
  window_start timestamptz,         -- tradies work in windows
  window_end timestamptz,
  status text default 'confirmed',  -- confirmed | pending | completed | no_show | cancelled
  source text default 'ai_call',    -- ai_call | manual | online
  est_value numeric,
  created_at timestamptz default now()
);
create index if not exists rb_bookings_tenant_idx on rb_bookings (tenant_id, window_start);

-- ─── Activity feed ───
create table if not exists rb_activity (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  kind text,                        -- booking | sms | transfer | spam_block | transcript | match | emergency
  label text not null,
  created_at timestamptz default now()
);
create index if not exists rb_activity_tenant_idx on rb_activity (tenant_id, created_at desc);

-- RLS
alter table rb_tenants enable row level security;
alter table rb_contacts enable row level security;
alter table rb_calls enable row level security;
alter table rb_bookings enable row level security;
alter table rb_activity enable row level security;

-- Owner reads own tenant rows (match on owner_email via JWT email)
create policy rb_tenant_self on rb_tenants for select using (owner_email = auth.jwt() ->> 'email');
create policy rb_contacts_tenant on rb_contacts for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_calls_tenant on rb_calls for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_bookings_tenant on rb_bookings for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_activity_tenant on rb_activity for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));

-- Recovered-revenue helper: sum of booked_value for a tenant in a range
create or replace function rb_recovered_revenue(p_tenant uuid, p_from timestamptz, p_to timestamptz)
returns numeric language sql stable as $$
  select coalesce(sum(booked_value),0) from rb_calls
  where tenant_id = p_tenant and outcome='booked' and started_at between p_from and p_to;
$$;
