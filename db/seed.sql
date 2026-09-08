-- RingBack seed data (demo tenant: Kedron Plumbing)
-- Assumes ringback-schema.sql has run.

-- Tenant
insert into rb_tenants (id, business_name, trade, owner_name, owner_email, owner_mobile, service_area, website_url, demo_number, real_number, number_status, abn, avg_job_value, plan)
values ('11111111-1111-1111-1111-111111111111','Kedron Plumbing','plumber','Dave Kelleher','dave@kedronplumbing.com.au','0412 884 317','Brisbane Northside','kedronplumbing.com.au','(07) 3000 4182','(07) 3019 6654','verifying','51 824 753 556',780,'trial')
on conflict (id) do nothing;

-- Contacts
insert into rb_contacts (id, tenant_id, name, phone, suburb, customer_since, is_vip, job_count, lifetime_value) values
 ('c0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Sue Murphy','0412 555 019','Stafford','2024-03-11',true,4,2680),
 ('c0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Jim Taylor','0403 555 882','Chermside',null,false,0,0),
 ('c0000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Rachel Byrne','0439 555 204','Wavell Heights','2023-08-02',false,2,1150),
 ('c0000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Marco Giordano','0418 555 776','Chermside West','2025-01-19',false,1,430),
 ('c0000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Priya Patel','0422 555 631','Wavell Heights',null,false,0,0),
 ('c0000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','Tom Ng','0405 555 998','Kedron','2024-11-30',true,6,3940)
on conflict (tenant_id, phone) do nothing;

-- Calls (a realistic day + yesterday)
insert into rb_calls (tenant_id, contact_id, caller_phone, caller_name, suburb, job_type, urgency, outcome, status, summary, duration_sec, sentiment, after_hours, needs_action, is_spam, booked_value, started_at) values
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','0412 555 019','Sue Murphy','Stafford','hot water system','emergency','booked','answered','Hot water system let go, water isolated at mains. Repeat customer. Wants it today. Booked Thu 2:15pm window.',184,'neutral',false,false,false,1450, now() - interval '38 minutes'),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000002','0403 555 882','Jim Taylor','Chermside','bathroom reno rough-in','routine','quote','answered','Wants a quote for a bathroom reno rough-in. Not urgent. Booked a callback Friday to talk scope.',126,'positive',false,true,false,null, now() - interval '2 hours'),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000003','0439 555 204','Rachel Byrne','Wavell Heights','gas smell','emergency','transferred','answered','Reported a gas smell in the kitchen. Flagged emergency and warm-transferred to Dave''s mobile. On site by 7:50am.',97,'negative',false,false,false,null, now() - interval '3 hours'),
 ('11111111-1111-1111-1111-111111111111',null,'1800 000 000',null,null,null,'spam','spam','answered','Robocall: extended warranty. Detected spam pattern, ended call.',12,'neutral',false,false,true,null, now() - interval '4 hours'),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000004','0418 555 776','Marco Giordano','Chermside West','blocked stormwater drain','soon','booked','answered','Blocked stormwater drain after the rain. Returning customer. Booked Wed 7:00am first job.',203,'positive',false,false,false,380, now() - interval '1 day'),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000005','0422 555 631','Priya Patel','Wavell Heights','leaking tap','routine','booked','answered','Leaking mixer tap in the bathroom. First-time caller. Booked Fri 10:30am.',158,'positive',false,false,false,220, now() - interval '1 day'),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000006','0405 555 998','Tom Ng','Kedron','annual service + anode','routine','message','answered','VIP repeat customer. Due for annual HWS service and anode check. Asked Dave to call to schedule.',142,'positive',false,true,false,null, now() - interval '1 day 3 hours'),
 ('11111111-1111-1111-1111-111111111111',null,'0451 555 333',null,'Aspley','burst pipe','emergency','booked','answered','Burst pipe under the house, water off at mains. After-hours call. Booked first-light callout 6:00am.',167,'neutral',true,false,false,1200, now() - interval '2 days 6 hours')
on conflict do nothing;

-- Bookings
insert into rb_bookings (tenant_id, contact_id, customer_name, customer_phone, address, suburb, job_type, window_start, window_end, status, source, est_value) values
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','Sue Murphy','0412 555 019','14 Kirkland Ave','Stafford','Hot water system replacement', now() + interval '1 day 6 hours', now() + interval '1 day 8 hours','confirmed','ai_call',1450),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000005','Priya Patel','0422 555 631','27 Heather St','Wavell Heights','Leaking mixer tap', now() + interval '2 days 2 hours', now() + interval '2 days 3 hours','confirmed','ai_call',220),
 ('11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000002','Jim Taylor','0403 555 882','8 March St','Chermside','Bathroom reno rough-in (quote)', now() + interval '2 days 6 hours', now() + interval '2 days 7 hours','pending','ai_call',null)
on conflict do nothing;

-- Activity feed
insert into rb_activity (tenant_id, kind, label, created_at) values
 ('11111111-1111-1111-1111-111111111111','booking','Booked Sue Murphy into Google Calendar', now() - interval '38 minutes'),
 ('11111111-1111-1111-1111-111111111111','sms','SMS confirmation sent to caller', now() - interval '38 minutes'),
 ('11111111-1111-1111-1111-111111111111','transfer','Warm-transferred gas-smell call to your mobile', now() - interval '3 hours'),
 ('11111111-1111-1111-1111-111111111111','spam_block','Blocked a spam robocall', now() - interval '4 hours'),
 ('11111111-1111-1111-1111-111111111111','transcript','Transcript + summary delivered (Jim Taylor)', now() - interval '2 hours'),
 ('11111111-1111-1111-1111-111111111111','match','Matched repeat caller from history (Sue Murphy)', now() - interval '39 minutes'),
 ('11111111-1111-1111-1111-111111111111','emergency','After-hours burst pipe booked for first light', now() - interval '2 days 6 hours')
on conflict do nothing;
