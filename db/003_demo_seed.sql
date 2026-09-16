-- RingBack - demo tenant seed.
-- Optional. Gives a signed-in owner the same business the fixtures show, so a
-- live install still demos well before real calls land. Idempotent.

insert into rb_tenants (business_name, trade, owner_name, owner_email, owner_mobile,
                        service_area, website_url, demo_number, number_status,
                        avg_job_value, plan, trial_ends_at)
values ('Kedron Plumbing', 'plumber', 'Dave Kelleher', 'demo@ringback.com.au', '+61402111902',
        'Brisbane Northside', 'https://kedronplumbing.com.au', '+61730004182', 'demo',
        650, 'trial', now() + interval '7 days')
on conflict (owner_email) do nothing;

with t as (select id from rb_tenants where owner_email = 'demo@ringback.com.au')
insert into rb_contacts (tenant_id, name, phone, suburb, job_count, lifetime_value)
select t.id, v.name, v.phone, v.suburb, v.jobs, v.ltv
from t, (values
  ('Sue Murphy',    '+61401222333', 'Stafford',        2, 1840::numeric),
  ('Jim Taylor',    '+61402333444', 'Wavell Heights',  1, 620::numeric),
  ('Rachel Byrne',  '+61403444555', 'Chermside',       0, 0::numeric),
  ('Priya Patel',   '+61404555666', 'Wavell Heights',  3, 2310::numeric),
  ('Marco Gallo',   '+61405666777', 'Chermside West',  1, 480::numeric)
) as v(name, phone, suburb, jobs, ltv)
on conflict (tenant_id, phone) do nothing;

-- today's calls
with t as (select id from rb_tenants where owner_email = 'demo@ringback.com.au')
insert into rb_calls (tenant_id, caller_phone, caller_name, suburb, job_type, urgency,
                      outcome, status, summary, duration_sec, needs_action, booked_value, started_at)
select t.id, v.phone, v.name, v.suburb, v.job, v.urgency, v.outcome, 'answered',
       v.summary, v.secs, v.needs, v.value, date_trunc('day', now()) + v.at
from t, (values
  ('+61401222333','Sue Murphy','Stafford','Hot water system','emergency','booked',
   'Hot water system let go, water off at the mains. Booked 2:15pm today.', 184, false, 1450::numeric, interval '9 hours 42 minutes'),
  ('+61402333444','Jim Taylor','Wavell Heights','Reno rough-in quote','soon','message',
   'Measured last week, promised the quote by end of day.', 141, true, null::numeric, interval '9 hours 4 minutes'),
  ('+61403444555','Rachel Byrne','Chermside','Gas smell','emergency','transferred',
   'Warm transfer did not land, callback slot held.', 96, true, null::numeric, interval '7 hours 31 minutes'),
  ('+61400000000','Unknown caller',null,'Extended warranty','spam','spam',
   'Robocall, blocked before it rang through.', 12, false, null::numeric, interval '7 hours 2 minutes'),
  ('+61405666777','Marco Gallo','Chermside West','Blocked stormwater','soon','booked',
   'Booked Wednesday 7am.', 162, false, 520::numeric, interval '6 hours 55 minutes')
) as v(phone, name, suburb, job, urgency, outcome, summary, secs, needs, value, at)
where not exists (
  select 1 from rb_calls c where c.tenant_id = t.id and c.started_at >= date_trunc('day', now())
);

-- today's bookings
with t as (select id from rb_tenants where owner_email = 'demo@ringback.com.au')
insert into rb_bookings (tenant_id, customer_name, customer_phone, suburb, job_type,
                         window_start, window_end, status, source, est_value)
select t.id, v.name, v.phone, v.suburb, v.job,
       date_trunc('day', now()) + v.at, date_trunc('day', now()) + v.at + interval '2 hours',
       'confirmed', 'ai_call', v.value
from t, (values
  ('Priya Patel','+61404555666','Wavell Heights','Leaking mixer',        interval '9 hours 30 minutes', 320::numeric),
  ('Marco Gallo','+61405666777','Chermside West','Blocked stormwater',   interval '12 hours 15 minutes', 520::numeric),
  ('Sue Murphy','+61401222333','Stafford','Hot water system replacement',interval '14 hours 15 minutes', 1450::numeric),
  ('Jim Taylor','+61402333444','Wavell Heights','Reno rough-in quote',   interval '16 hours', 0::numeric)
) as v(name, phone, suburb, job, at, value)
where not exists (
  select 1 from rb_bookings b where b.tenant_id = t.id and b.window_start >= date_trunc('day', now())
);

-- the agent's own config + a starting rulebook
with t as (select id from rb_tenants where owner_email = 'demo@ringback.com.au')
insert into rb_agent_config (tenant_id, voice, greeting, never_quote, emergency_words, service_suburbs)
select t.id, 'emma',
       'G''day, you''ve reached Kedron Plumbing, this is Emma. How can I help?',
       array['hot water system replacement','full bathroom reno'],
       array['burst','gas smell','no water','flooding','sewage'],
       array['Stafford','Chermside','Wavell Heights','Kedron','Everton Park']
from t
on conflict (tenant_id) do nothing;
