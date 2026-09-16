-- RingBack - product tables the UI grew past the Run 4 schema.
-- Safe to run after db/schema.sql on the same project.

create extension if not exists "pgcrypto";

-- ─── The agent's own configuration (My Agent screen) ───
create table if not exists rb_agent_config (
  tenant_id uuid primary key references rb_tenants(id) on delete cascade,
  voice text default 'emma',              -- emma | jack | sophie | davo
  greeting text,
  disclose_ai boolean default true,
  cautiousness int default 3,             -- 1..5 behaviour sliders
  warmth int default 4,
  pace int default 3,
  never_quote text[] default '{}',
  emergency_words text[] default '{}',
  service_suburbs text[] default '{}',
  updated_at timestamptz default now()
);

-- ─── The rulebook built during /start's interview ───
create table if not exists rb_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  block text not null,                    -- emergencies | pricing | area | escalation | words | never | stories | hours
  label text not null,
  value text not null,
  source text default 'owner',            -- owner | website | default
  created_at timestamptz default now()
);
create index if not exists rb_rules_tenant_idx on rb_rules (tenant_id, block);

-- ─── Follow-up playbooks and their queue ───
create table if not exists rb_playbooks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  key text not null,                      -- missed_call | quote_chase | no_show | review | reminder | winback
  name text not null,
  is_active boolean default true,
  steps jsonb default '[]'::jsonb,        -- [{after_minutes, channel, template}]
  guardrails jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (tenant_id, key)
);

create table if not exists rb_followups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references rb_tenants(id) on delete cascade,
  playbook_id uuid references rb_playbooks(id) on delete set null,
  contact_id uuid references rb_contacts(id) on delete set null,
  call_id uuid references rb_calls(id) on delete set null,
  channel text default 'sms',
  body text,
  due_at timestamptz,
  sent_at timestamptz,
  status text default 'scheduled',        -- scheduled | sent | cancelled | replied
  created_at timestamptz default now()
);
create index if not exists rb_followups_due_idx on rb_followups (tenant_id, due_at);

-- ─── Money ───
create table if not exists rb_subscriptions (
  tenant_id uuid primary key references rb_tenants(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'trialing',          -- trialing | active | past_due | cancelled
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- ─── Raw webhook log, so a failed provider call is debuggable ───
create table if not exists rb_webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- stripe | telephony
  event_type text,
  payload jsonb,
  received_at timestamptz default now()
);

-- RLS: owner-scoped, same shape as db/schema.sql
alter table rb_agent_config enable row level security;
alter table rb_rules enable row level security;
alter table rb_playbooks enable row level security;
alter table rb_followups enable row level security;
alter table rb_subscriptions enable row level security;
alter table rb_webhook_events enable row level security;

create policy rb_agent_config_tenant on rb_agent_config for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_rules_tenant on rb_rules for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_playbooks_tenant on rb_playbooks for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_followups_tenant on rb_followups for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
create policy rb_subscriptions_tenant on rb_subscriptions for all using (
  tenant_id in (select id from rb_tenants where owner_email = auth.jwt() ->> 'email'));
-- webhook log is service-role only: no policy means no anon or owner access
