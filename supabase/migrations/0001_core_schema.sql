-- MedFamily core schema
-- Apply before any RLS, trigger, or demo-mode migrations.

create extension if not exists "pgcrypto";

create schema if not exists private;
comment on schema private is 'Internal authorization and trigger helpers. Keep this schema out of exposed API schemas.';

create type public.app_role as enum (
  'patient_admin',
  'family_member',
  'caretaker',
  'doctor',
  'hospital',
  'chemist'
);

create type public.access_request_status as enum (
  'pending',
  'approved',
  'rejected',
  'revoked',
  'expired'
);

create type public.access_grant_status as enum (
  'active',
  'revoked',
  'expired'
);

create type public.order_status as enum (
  'placed',
  'awaiting_chemist_approval',
  'accepted',
  'preparing',
  'packed',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'rejected'
);

create type public.notification_category as enum (
  'access_request',
  'access_update',
  'order_update',
  'chat_message',
  'reminder',
  'system',
  'appointment',
  'health_alert'
);

create or replace function public.generate_share_code()
returns text
language sql
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create or replace function public.generate_consent_code()
returns text
language sql
as $$
  select lpad(((random() * 999999)::int)::text, 6, '0');
$$;

create or replace function public.generate_order_number()
returns text
language sql
as $$
  select 'MED-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

create table public.profiles (
  id uuid primary key,
  full_name text,
  phone text,
  email text,
  primary_role public.app_role not null default 'patient_admin',
  avatar_url text,
  address text,
  date_of_birth date,
  gender text,
  blood_group text,
  allergies text[] not null default '{}',
  chronic_conditions text[] not null default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  specialization text,
  clinic_name text,
  license_number text,
  address text,
  consultation_note text,
  created_at timestamptz not null default now()
);

create table public.hospital_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  hospital_name text,
  department text,
  registration_number text,
  address text,
  created_at timestamptz not null default now()
);

create table public.caretaker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  relation text,
  address text,
  created_at timestamptz not null default now()
);

create table public.chemist_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  store_name text,
  license_number text,
  address text,
  service_area text,
  created_at timestamptz not null default now()
);

create table public.family_groups (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  group_name text not null default 'My Family',
  share_code text not null unique default public.generate_share_code(),
  created_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.family_groups(id) on delete cascade,
  name text not null,
  relation text not null,
  date_of_birth date,
  phone text,
  blood_group text,
  allergies text[] not null default '{}',
  chronic_conditions text[] not null default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.patient_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  record_type text not null,
  notes text,
  upload_date timestamptz not null default now(),
  uploaded_by uuid not null references public.profiles(id)
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  file_url text,
  doctor_name text,
  prescription_date date not null,
  medicines jsonb not null default '[]'::jsonb,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.medicine_reminders (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid references public.prescriptions(id) on delete set null,
  member_id uuid not null references public.family_members(id) on delete cascade,
  medicine_name text not null,
  dosage text not null,
  frequency text not null,
  reminder_times text[] not null default '{}',
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.medicine_reminders(id) on delete cascade,
  scheduled_time timestamptz not null,
  taken_at timestamptz,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  unique (reminder_id, scheduled_time)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  title text not null,
  appointment_type text not null default 'consultation',
  provider_name text,
  provider_contact text,
  provider_role text,
  scheduled_for timestamptz not null,
  location text,
  mode text,
  notes text,
  status text not null default 'scheduled',
  follow_up_date date,
  diagnosis text,
  visit_summary text,
  advice_summary text,
  booked_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vital_entries (
  id uuid primary key default gen_random_uuid(),
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  metric_type text not null,
  value_primary text not null,
  value_secondary text,
  unit text,
  symptoms text[] not null default '{}',
  notes text,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null
);

create table public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  assigned_to_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  requester_name text,
  requester_phone text,
  requester_organization text,
  target_group_id uuid not null references public.family_groups(id) on delete cascade,
  requester_role public.app_role not null,
  status public.access_request_status not null default 'pending',
  reason text,
  requested_scopes text[] not null default '{}',
  member_ids uuid[] not null default '{}',
  consent_code text not null default public.generate_consent_code(),
  expires_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.access_requests(id) on delete set null,
  grantee_user_id uuid not null references public.profiles(id) on delete cascade,
  grantee_name text,
  target_group_id uuid not null references public.family_groups(id) on delete cascade,
  granted_by uuid not null references public.profiles(id) on delete cascade,
  grantee_role public.app_role not null,
  permission_scopes text[] not null default '{}',
  member_ids uuid[] not null default '{}',
  reason text,
  consultation_note text,
  status public.access_grant_status not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.access_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  target_group_id uuid references public.family_groups(id) on delete set null,
  member_id uuid references public.family_members(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.medicine_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  patient_member_id uuid references public.family_members(id) on delete set null,
  placed_by_user_id uuid not null references public.profiles(id) on delete cascade,
  placed_by_name text,
  placed_for_name text not null,
  placed_for_phone text,
  receiver_name text not null,
  receiver_phone text,
  delivery_address text not null,
  location_text text,
  map_link text,
  notes text,
  source_prescription_id uuid references public.prescriptions(id) on delete set null,
  uploaded_prescription_url text,
  chemist_id uuid references public.profiles(id) on delete set null,
  chemist_name text,
  status public.order_status not null default 'placed',
  total_items integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.medicine_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.medicine_orders(id) on delete cascade,
  medicine_name text not null,
  dosage text,
  quantity text,
  instructions text,
  source text not null default 'manual',
  is_substitute boolean not null default false,
  substitute_for text,
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.medicine_orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.order_chat_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.medicine_orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category public.notification_category not null,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_family_groups_admin on public.family_groups(admin_id);
create index idx_family_groups_share_code on public.family_groups(share_code);
create index idx_family_members_group on public.family_members(group_id);
create index idx_patient_records_member on public.patient_records(member_id);
create index idx_patient_records_uploaded_by on public.patient_records(uploaded_by);
create index idx_prescriptions_member on public.prescriptions(member_id);
create index idx_reminders_member on public.medicine_reminders(member_id);
create index idx_reminders_active on public.medicine_reminders(is_active);
create index idx_reminder_logs_reminder on public.reminder_logs(reminder_id);
create index idx_reminder_logs_date on public.reminder_logs(scheduled_time);
create index idx_appointments_group on public.appointments(family_group_id);
create index idx_appointments_member on public.appointments(member_id);
create index idx_appointments_schedule on public.appointments(scheduled_for);
create index idx_vital_entries_group on public.vital_entries(family_group_id);
create index idx_vital_entries_member on public.vital_entries(member_id);
create index idx_vital_entries_recorded_at on public.vital_entries(recorded_at desc);
create index idx_care_tasks_group on public.care_tasks(family_group_id);
create index idx_care_tasks_member on public.care_tasks(member_id);
create index idx_care_tasks_status on public.care_tasks(status);
create index idx_access_requests_group on public.access_requests(target_group_id);
create index idx_access_requests_requester on public.access_requests(requester_id);
create index idx_access_requests_status on public.access_requests(status);
create index idx_access_grants_group on public.access_grants(target_group_id);
create index idx_access_grants_grantee on public.access_grants(grantee_user_id);
create index idx_access_grants_status on public.access_grants(status);
create index idx_access_audit_logs_group on public.access_audit_logs(target_group_id);
create index idx_access_audit_logs_actor on public.access_audit_logs(actor_id);
create index idx_medicine_orders_group on public.medicine_orders(family_group_id);
create index idx_medicine_orders_member on public.medicine_orders(patient_member_id);
create index idx_medicine_orders_status on public.medicine_orders(status);
create index idx_medicine_orders_chemist on public.medicine_orders(chemist_id);
create index idx_medicine_order_items_order on public.medicine_order_items(order_id);
create index idx_order_status_history_order on public.order_status_history(order_id);
create index idx_order_chat_messages_order on public.order_chat_messages(order_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, is_read);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
revoke all on all tables in schema public from anon;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;

comment on table public.family_groups is 'One shareable family vault with a unique MedFamily ID per admin.';
comment on table public.access_requests is 'Doctor, hospital, and caretaker access requests awaiting patient or family approval.';
comment on table public.access_grants is 'Approved, time-bound access grants with permission scopes and optional member limits.';
comment on table public.medicine_orders is 'Medicine ordering workflow for families, caretakers, and chemists.';
comment on table public.notifications is 'In-app notification feed for access, reminders, orders, and chat activity.';
