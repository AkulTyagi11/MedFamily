-- Optional seed data for local demo and QA environments.
-- Do not use this file for production customer data.

insert into public.profiles (
  id,
  full_name,
  phone,
  email,
  primary_role,
  address,
  blood_group,
  allergies,
  chronic_conditions,
  emergency_contact_name,
  emergency_contact_phone,
  onboarding_complete
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Rahul Sharma',
    '+919900000001',
    'familyadmin@medfamily.demo',
    'patient_admin',
    '24 Green Avenue, Pune',
    'B+',
    array['Penicillin'],
    array['Type 2 Diabetes'],
    'Neha Sharma',
    '+919922334455',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Dr. Arjun Mehta',
    '+919900000002',
    'doctor@medfamily.demo',
    'doctor',
    'Mehta Family Clinic, Pune',
    null,
    '{}',
    '{}',
    null,
    null,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Sunrise Care Hospital',
    '+919900000003',
    'hospital@medfamily.demo',
    'hospital',
    'Sunrise Care Hospital, Baner, Pune',
    null,
    '{}',
    '{}',
    null,
    null,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Anita Joshi',
    '+919900000004',
    'caretaker@medfamily.demo',
    'caretaker',
    'Support Care Services, Pune',
    null,
    '{}',
    '{}',
    null,
    null,
    true
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'QuickMeds Chemist',
    '+919900000005',
    'chemist@gmail.com',
    'chemist',
    'QuickMeds Pharmacy, Kothrud, Pune',
    null,
    '{}',
    '{}',
    null,
    null,
    true
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Aanya Khanna',
    '+919900000006',
    'patient@medfamily.demo',
    'patient_admin',
    '18 Lake View Society, Pune',
    'O+',
    '{}',
    '{}',
    'Rohit Khanna',
    '+919933221100',
    true
  );

insert into public.doctor_profiles (user_id, specialization, clinic_name, license_number, address, consultation_note)
values (
  '22222222-2222-4222-8222-222222222222',
  'Internal Medicine',
  'Mehta Family Clinic',
  'DOC-MH-1021',
  'Baner, Pune',
  'Focuses on chronic care, diabetes follow-up, and family medicine.'
);

insert into public.hospital_profiles (user_id, hospital_name, department, registration_number, address)
values (
  '33333333-3333-4333-8333-333333333333',
  'Sunrise Care Hospital',
  'General Medicine',
  'HSP-4452',
  'Baner, Pune'
);

insert into public.caretaker_profiles (user_id, relation, address)
values (
  '44444444-4444-4444-8444-444444444444',
  'Professional caretaker',
  'Support Care Services, Pune'
);

insert into public.chemist_profiles (user_id, store_name, license_number, address, service_area)
values (
  '55555555-5555-4555-8555-555555555555',
  'QuickMeds Chemist',
  'PH-7781',
  'Kothrud, Pune',
  'Kothrud, Baner, Aundh, Pashan'
);

insert into public.family_groups (id, admin_id, group_name, share_code)
values
  ('a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1', '11111111-1111-4111-8111-111111111111', 'Sharma Family', 'SHARMA01'),
  ('a2a2a2a2-a2a2-42a2-82a2-a2a2a2a2a2a2', '66666666-6666-4666-8666-666666666666', 'Khanna Household', 'KHANNA02');

insert into public.family_members (
  id,
  group_id,
  name,
  relation,
  date_of_birth,
  phone,
  blood_group,
  allergies,
  chronic_conditions,
  emergency_contact_name,
  emergency_contact_phone,
  notes
)
values
  (
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'Rahul Sharma',
    'Self',
    '1992-06-14',
    '+919900000001',
    'B+',
    array['Penicillin'],
    array['Type 2 Diabetes'],
    'Neha Sharma',
    '+919922334455',
    'Needs regular glucose tracking and monthly medicine refill.'
  ),
  (
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'Sushma Sharma',
    'Mother',
    '1960-11-02',
    '+919944556677',
    'O+',
    array['Sulfa drugs'],
    array['Hypertension', 'Arthritis'],
    'Rahul Sharma',
    '+919900000001',
    'Uses walking support on long clinic days and needs BP follow-ups.'
  ),
  (
    'b3b3b3b3-b3b3-43b3-83b3-b3b3b3b3b3b3',
    'a2a2a2a2-a2a2-42a2-82a2-a2a2a2a2a2a2',
    'Aanya Khanna',
    'Self',
    '1998-02-21',
    '+919900000006',
    'O+',
    array[]::text[],
    array['Migraine'],
    'Rohit Khanna',
    '+919933221100',
    'Sample family-member account for UI walkthroughs.'
  );

insert into public.patient_records (
  id,
  member_id,
  file_url,
  file_name,
  file_type,
  record_type,
  notes,
  upload_date,
  uploaded_by
)
values
  (
    'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d1d1d1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    '/demo/lab-report.svg',
    'cbc-lab-report.svg',
    'image/svg+xml',
    'Lab Report',
    'Routine diabetes and HbA1c review uploaded for doctor access.',
    '2026-03-06T09:00:00+05:30',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    'd2d2d2d2-d2d2-42d2-82d2-d2d2d2d2d2d2',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    '/demo/chest-scan.svg',
    'joint-mobility-follow-up.svg',
    'image/svg+xml',
    'Other',
    'Physiotherapy and mobility follow-up summary for arthritis management.',
    '2026-03-10T12:15:00+05:30',
    '11111111-1111-4111-8111-111111111111'
  );

insert into public.prescriptions (
  id,
  member_id,
  file_url,
  doctor_name,
  prescription_date,
  medicines,
  uploaded_by,
  created_at
)
values
  (
    'c1c1c1c1-c1c1-41c1-81c1-c1c1c1c1c1c1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    '/demo/prescription-note.svg',
    'Dr. Arjun Mehta',
    '2026-03-05',
    '[
      {"name":"Metformin","dosage":"500 mg","frequency":"Twice daily","reminder_times":["08:00","20:00"],"start_date":"2026-03-05","end_date":"2026-04-05","notes":"After meals"},
      {"name":"Vitamin D3","dosage":"60,000 IU weekly","frequency":"As needed","reminder_times":["09:00"],"start_date":"2026-03-05","end_date":"2026-03-29","notes":"Once every Sunday"}
    ]'::jsonb,
    '11111111-1111-4111-8111-111111111111',
    '2026-03-05T11:00:00+05:30'
  ),
  (
    'c2c2c2c2-c2c2-42c2-82c2-c2c2c2c2c2c2',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    '/demo/prescription-note.svg',
    'Dr. Arjun Mehta',
    '2026-03-08',
    '[
      {"name":"Amlodipine","dosage":"5 mg","frequency":"Once daily","reminder_times":["09:00"],"start_date":"2026-03-08","end_date":"2026-04-08","notes":"Morning after breakfast"},
      {"name":"Calcium","dosage":"500 mg","frequency":"Once daily","reminder_times":["20:30"],"start_date":"2026-03-08","end_date":"2026-04-08","notes":"Evening tablet"}
    ]'::jsonb,
    '11111111-1111-4111-8111-111111111111',
    '2026-03-08T14:10:00+05:30'
  );

insert into public.access_requests (
  id,
  requester_id,
  requester_name,
  requester_phone,
  requester_organization,
  target_group_id,
  requester_role,
  status,
  reason,
  requested_scopes,
  member_ids,
  consent_code,
  expires_at,
  reviewed_at,
  reviewed_by,
  created_at
)
values
  (
    'e1e1e1e1-e1e1-41e1-81e1-e1e1e1e1e1e1',
    '22222222-2222-4222-8222-222222222222',
    'Dr. Arjun Mehta',
    '+919900000002',
    'Mehta Family Clinic',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'doctor',
    'approved',
    'Routine diabetes consultation and medicine review.',
    array['summary', 'records', 'prescriptions', 'emergency'],
    array['b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1']::uuid[],
    '482913',
    '2026-04-15T23:59:00+05:30',
    '2026-03-05T09:20:00+05:30',
    '11111111-1111-4111-8111-111111111111',
    '2026-03-05T08:55:00+05:30'
  ),
  (
    'e2e2e2e2-e2e2-42e2-82e2-e2e2e2e2e2e2',
    '44444444-4444-4444-8444-444444444444',
    'Anita Joshi',
    '+919900000004',
    'Support Care Services',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'caretaker',
    'approved',
    'Daily medicine support and appointment assistance for Sushma Sharma.',
    array['summary', 'records', 'prescriptions', 'reminders', 'reminders_management', 'medicine_ordering'],
    array['b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2']::uuid[],
    '650244',
    '2026-04-12T23:59:00+05:30',
    '2026-03-09T10:00:00+05:30',
    '11111111-1111-4111-8111-111111111111',
    '2026-03-09T09:20:00+05:30'
  ),
  (
    'e3e3e3e3-e3e3-43e3-83e3-e3e3e3e3e3e3',
    '33333333-3333-4333-8333-333333333333',
    'Sunrise Care Hospital',
    '+919900000003',
    'Sunrise Care Hospital',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'hospital',
    'pending',
    'Requested access for admission desk pre-check and continuity planning.',
    array['summary', 'records', 'prescriptions'],
    array['b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2']::uuid[],
    '311204',
    null,
    null,
    null,
    '2026-03-12T16:45:00+05:30'
  );

insert into public.access_grants (
  id,
  request_id,
  grantee_user_id,
  grantee_name,
  target_group_id,
  granted_by,
  grantee_role,
  permission_scopes,
  member_ids,
  reason,
  consultation_note,
  status,
  starts_at,
  expires_at,
  created_at
)
values
  (
    'f1f1f1f1-f1f1-41f1-81f1-f1f1f1f1f1f1',
    'e1e1e1e1-e1e1-41e1-81e1-e1e1e1e1e1e1',
    '22222222-2222-4222-8222-222222222222',
    'Dr. Arjun Mehta',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    '11111111-1111-4111-8111-111111111111',
    'doctor',
    array['summary', 'records', 'prescriptions', 'emergency'],
    array['b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1']::uuid[],
    'Diabetes consultation access',
    'Review HbA1c trend and medicine adherence before April review.',
    'active',
    '2026-03-05T09:20:00+05:30',
    '2026-04-15T23:59:00+05:30',
    '2026-03-05T09:20:00+05:30'
  ),
  (
    'f2f2f2f2-f2f2-42f2-82f2-f2f2f2f2f2f2',
    'e2e2e2e2-e2e2-42e2-82e2-e2e2e2e2e2e2',
    '44444444-4444-4444-8444-444444444444',
    'Anita Joshi',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    '11111111-1111-4111-8111-111111111111',
    'caretaker',
    array['summary', 'records', 'prescriptions', 'reminders', 'reminders_management', 'medicine_ordering'],
    array['b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2']::uuid[],
    'Daily support for elderly patient',
    'Can mark doses, coordinate medicine orders, and manage follow-up reminders.',
    'active',
    '2026-03-09T10:00:00+05:30',
    '2026-04-12T23:59:00+05:30',
    '2026-03-09T10:00:00+05:30'
  );

insert into public.appointments (
  id,
  family_group_id,
  member_id,
  title,
  appointment_type,
  provider_name,
  provider_contact,
  provider_role,
  scheduled_for,
  location,
  mode,
  notes,
  status,
  follow_up_date,
  diagnosis,
  visit_summary,
  advice_summary,
  booked_by,
  updated_by,
  created_at
)
values
  (
    '12121212-1212-4212-8212-121212121212',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    'Diabetes follow-up review',
    'follow_up',
    'Dr. Arjun Mehta',
    '+919900000002',
    'doctor',
    '2026-03-28T10:30:00+05:30',
    'Mehta Family Clinic, Baner',
    'clinic',
    'Carry latest HbA1c report and fasting sugar note.',
    'scheduled',
    '2026-04-25',
    null,
    null,
    null,
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '2026-03-18T08:45:00+05:30'
  ),
  (
    '13131313-1313-4313-8313-131313131313',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    'Joint mobility consultation',
    'consultation',
    'Dr. Arjun Mehta',
    '+919900000002',
    'doctor',
    '2026-03-16T16:00:00+05:30',
    'Video follow-up',
    'video',
    'Review home exercise compliance and pain diary.',
    'completed',
    '2026-03-30',
    'Stable arthritis flare',
    'Mobility improved compared with last visit. Continue light exercise.',
    'Continue evening calcium and use support brace during longer walks.',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '2026-03-16T16:00:00+05:30'
  );

insert into public.vital_entries (
  id,
  family_group_id,
  member_id,
  metric_type,
  value_primary,
  value_secondary,
  unit,
  symptoms,
  notes,
  recorded_at,
  recorded_by
)
values
  (
    '14141414-1414-4414-8414-141414141414',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    'sugar',
    '148',
    null,
    'mg/dL',
    array['fatigue'],
    'Post-breakfast reading',
    '2026-03-20T09:15:00+05:30',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '15151515-1515-4515-8515-151515151515',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    'blood_pressure',
    '128',
    '84',
    'mmHg',
    array['mild dizziness'],
    'Recorded after work',
    '2026-03-22T19:40:00+05:30',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '16161616-1616-4616-8616-161616161616',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    'blood_pressure',
    '142',
    '88',
    'mmHg',
    array['joint stiffness'],
    'Morning reading before walk',
    '2026-03-22T08:10:00+05:30',
    '44444444-4444-4444-8444-444444444444'
  ),
  (
    '17171717-1717-4717-8717-171717171717',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    'weight',
    '63',
    null,
    'kg',
    array[]::text[],
    'Weekly weight note',
    '2026-03-21T07:45:00+05:30',
    '44444444-4444-4444-8444-444444444444'
  );

insert into public.care_tasks (
  id,
  family_group_id,
  member_id,
  title,
  description,
  due_at,
  assigned_to_user_id,
  created_by,
  status,
  completed_at,
  created_at
)
values
  (
    '18181818-1818-4818-8818-181818181818',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    'Check evening BP',
    'Caretaker should log the reading after dinner and confirm medication.',
    '2026-03-25T20:30:00+05:30',
    '44444444-4444-4444-8444-444444444444',
    '11111111-1111-4111-8111-111111111111',
    'pending',
    null,
    '2026-03-23T18:00:00+05:30'
  ),
  (
    '19191919-1919-4919-8919-191919191919',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    'Upload lab report before review',
    'Attach latest HbA1c report ahead of consultation.',
    '2026-03-24T11:00:00+05:30',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'completed',
    '2026-03-24T09:15:00+05:30',
    '2026-03-22T09:00:00+05:30'
  );

insert into public.medicine_orders (
  id,
  order_number,
  family_group_id,
  patient_member_id,
  placed_by_user_id,
  placed_by_name,
  placed_for_name,
  placed_for_phone,
  receiver_name,
  receiver_phone,
  delivery_address,
  location_text,
  notes,
  source_prescription_id,
  uploaded_prescription_url,
  chemist_id,
  chemist_name,
  status,
  total_items,
  created_at,
  updated_at
)
values
  (
    '20202020-2020-4020-8020-202020202020',
    'MED-DEMO-1001',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2',
    '11111111-1111-4111-8111-111111111111',
    'Rahul Sharma',
    'Sushma Sharma',
    '+919944556677',
    'Anita Joshi',
    '+919900000004',
    '24 Green Avenue, Pune',
    'Near main gate, second floor',
    'Please call caretaker before delivery.',
    'c2c2c2c2-c2c2-42c2-82c2-c2c2c2c2c2c2',
    '/demo/prescription-note.svg',
    '55555555-5555-4555-8555-555555555555',
    'QuickMeds Chemist',
    'preparing',
    2,
    '2026-03-23T10:10:00+05:30',
    '2026-03-23T11:20:00+05:30'
  ),
  (
    '21212121-2121-4121-8121-212121212121',
    'MED-DEMO-1002',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1',
    'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1',
    '44444444-4444-4444-8444-444444444444',
    'Anita Joshi',
    'Rahul Sharma',
    '+919900000001',
    'Rahul Sharma',
    '+919900000001',
    '24 Green Avenue, Pune',
    'Building C lobby',
    'Reorder of diabetes medicines.',
    'c1c1c1c1-c1c1-41c1-81c1-c1c1c1c1c1c1',
    null,
    '55555555-5555-4555-8555-555555555555',
    'QuickMeds Chemist',
    'delivered',
    2,
    '2026-03-12T09:05:00+05:30',
    '2026-03-12T18:30:00+05:30'
  );

delete from public.order_status_history
where order_id in (
  '20202020-2020-4020-8020-202020202020',
  '21212121-2121-4121-8121-212121212121'
);

insert into public.medicine_order_items (
  id,
  order_id,
  medicine_name,
  dosage,
  quantity,
  instructions,
  source,
  is_substitute,
  substitute_for
)
values
  ('22222222-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '20202020-2020-4020-8020-202020202020', 'Amlodipine', '5 mg', '30 tablets', 'Morning dose', 'prescription', false, null),
  ('23232323-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '20202020-2020-4020-8020-202020202020', 'Calcium', '500 mg', '30 tablets', 'Evening dose', 'prescription', false, null),
  ('24242424-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '21212121-2121-4121-8121-212121212121', 'Metformin', '500 mg', '60 tablets', 'After meals', 'prescription', false, null),
  ('25252525-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '21212121-2121-4121-8121-212121212121', 'Vitamin D3', '60,000 IU', '4 sachets', 'Weekly dose', 'prescription', false, null);

insert into public.order_status_history (id, order_id, status, note, changed_by, created_at)
values
  ('26262626-2626-4626-8626-262626262626', '20202020-2020-4020-8020-202020202020', 'accepted', 'Order reviewed by chemist.', '55555555-5555-4555-8555-555555555555', '2026-03-23T10:25:00+05:30'),
  ('27272727-2727-4727-8727-272727272727', '20202020-2020-4020-8020-202020202020', 'preparing', 'Packing medicines and confirming stock.', '55555555-5555-4555-8555-555555555555', '2026-03-23T11:20:00+05:30'),
  ('28282828-2828-4828-8828-282828282828', '21212121-2121-4121-8121-212121212121', 'accepted', 'Repeat order accepted.', '55555555-5555-4555-8555-555555555555', '2026-03-12T09:20:00+05:30'),
  ('29292929-2929-4929-8929-292929292929', '21212121-2121-4121-8121-212121212121', 'out_for_delivery', 'Sent with delivery partner.', '55555555-5555-4555-8555-555555555555', '2026-03-12T15:10:00+05:30'),
  ('30303030-3030-4030-8030-303030303030', '21212121-2121-4121-8121-212121212121', 'delivered', 'Delivered successfully.', '55555555-5555-4555-8555-555555555555', '2026-03-12T18:30:00+05:30');

insert into public.order_chat_messages (id, order_id, sender_id, sender_name, message, created_at)
values
  (
    '31313131-3131-4131-8131-313131313131',
    '20202020-2020-4020-8020-202020202020',
    '55555555-5555-4555-8555-555555555555',
    'QuickMeds Chemist',
    'Amlodipine is available. Calcium will be packed in the same order.',
    '2026-03-23T10:30:00+05:30'
  ),
  (
    '32323232-3232-4232-8232-323232323232',
    '20202020-2020-4020-8020-202020202020',
    '11111111-1111-4111-8111-111111111111',
    'Rahul Sharma',
    'Please hand over the package to Anita Joshi, our caretaker.',
    '2026-03-23T10:36:00+05:30'
  );

insert into public.notifications (id, user_id, title, body, category, entity_type, entity_id, is_read, created_at)
values
  (
    '33333333-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'New hospital access request',
    'Sunrise Care Hospital requested access for Sushma Sharma.',
    'access_request',
    'access_request',
    'e3e3e3e3-e3e3-43e3-83e3-e3e3e3e3e3e3',
    false,
    '2026-03-12T16:46:00+05:30'
  ),
  (
    '34343434-3434-4434-8434-343434343434',
    '22222222-2222-4222-8222-222222222222',
    'Access approved',
    'The Sharma family approved your review access for Rahul Sharma.',
    'access_update',
    'access_grant',
    'f1f1f1f1-f1f1-41f1-81f1-f1f1f1f1f1f1',
    false,
    '2026-03-05T09:22:00+05:30'
  ),
  (
    '35353535-3535-4535-8535-353535353535',
    '55555555-5555-4555-8555-555555555555',
    'New medicine order placed',
    'Rahul Sharma placed a medicine order for Sushma Sharma.',
    'order_update',
    'medicine_order',
    '20202020-2020-4020-8020-202020202020',
    false,
    '2026-03-23T10:12:00+05:30'
  ),
  (
    '36363636-3636-4636-8636-363636363636',
    '11111111-1111-4111-8111-111111111111',
    'Caretaker health update',
    'Anita Joshi logged a new blood pressure reading for Sushma Sharma.',
    'system',
    'vital_entry',
    '16161616-1616-4616-8616-161616161616',
    true,
    '2026-03-22T08:15:00+05:30'
  );
