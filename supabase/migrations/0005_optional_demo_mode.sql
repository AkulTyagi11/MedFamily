-- MedFamily optional demo mode.
-- This migration is intentionally not production-safe:
-- - it exposes unauthenticated CRUD access to demo data
-- - it adds DB-backed demo password RPCs
-- Apply only in isolated local/demo environments.

create table public.demo_auth_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text,
  phone text,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_auth_accounts_identifier_check check (email is not null or phone is not null)
);

create unique index idx_demo_auth_accounts_email
on public.demo_auth_accounts (lower(email))
where email is not null;

create unique index idx_demo_auth_accounts_phone
on public.demo_auth_accounts (phone)
where phone is not null;

alter table public.demo_auth_accounts enable row level security;

create or replace function public.normalize_demo_phone(input_phone text)
returns text
language sql
immutable
as $$
  select case
    when input_phone is null or btrim(input_phone) = '' then null
    when left(regexp_replace(input_phone, '[^0-9+]', '', 'g'), 1) = '+' then regexp_replace(input_phone, '[^0-9+]', '', 'g')
    when length(regexp_replace(input_phone, '\D', '', 'g')) = 10 then '+91' || regexp_replace(input_phone, '\D', '', 'g')
    when length(regexp_replace(input_phone, '\D', '', 'g')) = 12 and regexp_replace(input_phone, '\D', '', 'g') like '91%' then '+' || regexp_replace(input_phone, '\D', '', 'g')
    else regexp_replace(input_phone, '[^0-9+]', '', 'g')
  end;
$$;

create or replace function public.register_demo_user(
  p_identifier text,
  p_password text,
  p_full_name text,
  p_primary_role public.app_role
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_identifier text := btrim(coalesce(p_identifier, ''));
  v_email text := null;
  v_phone text := null;
  v_user_id uuid := gen_random_uuid();
  v_role public.app_role := coalesce(p_primary_role, 'patient_admin');
  v_name text := nullif(btrim(coalesce(p_full_name, '')), '');
  v_group_name text;
begin
  if length(p_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  if position('@' in v_identifier) > 0 then
    v_email := lower(v_identifier);
  elsif v_identifier <> '' then
    v_phone := public.normalize_demo_phone(v_identifier);
  end if;

  if v_email is null and v_phone is null then
    raise exception 'Enter a valid email address or phone number';
  end if;

  if exists (
    select 1
    from public.demo_auth_accounts daa
    where (v_email is not null and lower(daa.email) = v_email)
       or (v_phone is not null and daa.phone = v_phone)
  ) then
    raise exception 'An account already exists with these details.';
  end if;

  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    primary_role,
    onboarding_complete
  )
  values (
    v_user_id,
    v_name,
    v_phone,
    v_email,
    v_role,
    false
  );

  insert into public.demo_auth_accounts (
    user_id,
    email,
    phone,
    password_hash
  )
  values (
    v_user_id,
    v_email,
    v_phone,
    md5(p_password || ':' || v_user_id::text)
  );

  if v_role in ('patient_admin', 'family_member') then
    v_group_name := coalesce(nullif(split_part(coalesce(v_name, ''), ' ', 1), ''), 'My') || ' Family';
    insert into public.family_groups (admin_id, group_name)
    values (v_user_id, v_group_name);
  end if;

  return jsonb_build_object(
    'id', v_user_id,
    'email', v_email,
    'phone', v_phone,
    'full_name', v_name,
    'primary_role', v_role,
    'onboarding_complete', false
  );
end;
$$;

create or replace function public.login_demo_user(
  p_identifier text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_identifier text := btrim(coalesce(p_identifier, ''));
  v_account public.demo_auth_accounts%rowtype;
  v_profile public.profiles%rowtype;
  v_normalized_phone text := public.normalize_demo_phone(v_identifier);
begin
  if position('@' in v_identifier) > 0 then
    select *
    into v_account
    from public.demo_auth_accounts
    where lower(email) = lower(v_identifier)
    limit 1;
  else
    select *
    into v_account
    from public.demo_auth_accounts
    where phone = v_normalized_phone
    limit 1;
  end if;

  if v_account.user_id is null or v_account.password_hash <> md5(p_password || ':' || v_account.user_id::text) then
    raise exception 'Invalid login credentials';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = v_account.user_id;

  return jsonb_build_object(
    'id', v_profile.id,
    'email', v_profile.email,
    'phone', v_profile.phone,
    'full_name', v_profile.full_name,
    'primary_role', v_profile.primary_role,
    'onboarding_complete', v_profile.onboarding_complete
  );
end;
$$;

create or replace function public.sync_demo_auth_identity(
  p_user_id uuid,
  p_email text default null,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.demo_auth_accounts
  set
    email = case when nullif(btrim(coalesce(p_email, '')), '') is null then email else lower(btrim(p_email)) end,
    phone = case when nullif(btrim(coalesce(p_phone, '')), '') is null then phone else public.normalize_demo_phone(p_phone) end
  where user_id = p_user_id;
end;
$$;

create or replace function public.reset_demo_password(
  p_identifier text,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_identifier text := btrim(coalesce(p_identifier, ''));
  v_user_id uuid;
  v_normalized_phone text := public.normalize_demo_phone(v_identifier);
begin
  if length(p_new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  if position('@' in v_identifier) > 0 then
    select user_id
    into v_user_id
    from public.demo_auth_accounts
    where lower(email) = lower(v_identifier)
    limit 1;
  else
    select user_id
    into v_user_id
    from public.demo_auth_accounts
    where phone = v_normalized_phone
    limit 1;
  end if;

  if v_user_id is null then
    raise exception 'No account found for that email address or phone number';
  end if;

  update public.demo_auth_accounts
  set password_hash = md5(p_new_password || ':' || v_user_id::text)
  where user_id = v_user_id;
end;
$$;

grant execute on function public.register_demo_user(text, text, text, public.app_role) to anon, authenticated;
grant execute on function public.login_demo_user(text, text) to anon, authenticated;
grant execute on function public.sync_demo_auth_identity(uuid, text, text) to anon, authenticated;
grant execute on function public.reset_demo_password(text, text) to anon, authenticated;

create trigger demo_auth_accounts_set_updated_at
before update on public.demo_auth_accounts
for each row
execute function private.set_updated_at();

insert into public.demo_auth_accounts (user_id, email, phone, password_hash)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'familyadmin@medfamily.demo',
    '+919900000001',
    md5('family123' || ':' || '11111111-1111-4111-8111-111111111111')
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'doctor@medfamily.demo',
    '+919900000002',
    md5('doctor123' || ':' || '22222222-2222-4222-8222-222222222222')
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'hospital@medfamily.demo',
    '+919900000003',
    md5('hospital123' || ':' || '33333333-3333-4333-8333-333333333333')
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'caretaker@medfamily.demo',
    '+919900000004',
    md5('caretaker123' || ':' || '44444444-4444-4444-8444-444444444444')
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'chemist@gmail.com',
    '+919900000005',
    md5('chemist123' || ':' || '55555555-5555-4555-8555-555555555555')
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'patient@medfamily.demo',
    '+919900000006',
    md5('patient123' || ':' || '66666666-6666-4666-8666-666666666666')
  );

grant select, insert, update, delete on table
  public.profiles,
  public.doctor_profiles,
  public.hospital_profiles,
  public.caretaker_profiles,
  public.chemist_profiles,
  public.family_groups,
  public.family_members,
  public.patient_records,
  public.prescriptions,
  public.medicine_reminders,
  public.reminder_logs,
  public.access_requests,
  public.access_grants,
  public.access_audit_logs,
  public.medicine_orders,
  public.medicine_order_items,
  public.order_status_history,
  public.order_chat_messages,
  public.notifications,
  public.appointments,
  public.vital_entries,
  public.care_tasks
to anon;

alter table public.profiles disable row level security;
alter table public.doctor_profiles disable row level security;
alter table public.hospital_profiles disable row level security;
alter table public.caretaker_profiles disable row level security;
alter table public.chemist_profiles disable row level security;
alter table public.family_groups disable row level security;
alter table public.family_members disable row level security;
alter table public.patient_records disable row level security;
alter table public.prescriptions disable row level security;
alter table public.medicine_reminders disable row level security;
alter table public.reminder_logs disable row level security;
alter table public.access_requests disable row level security;
alter table public.access_grants disable row level security;
alter table public.access_audit_logs disable row level security;
alter table public.medicine_orders disable row level security;
alter table public.medicine_order_items disable row level security;
alter table public.order_status_history disable row level security;
alter table public.order_chat_messages disable row level security;
alter table public.notifications disable row level security;
alter table public.appointments disable row level security;
alter table public.vital_entries disable row level security;
alter table public.care_tasks disable row level security;

drop policy "Medical storage read through linked access" on storage.objects;
drop policy "Medical storage upload to own prefix" on storage.objects;
drop policy "Medical storage update through linked access" on storage.objects;
drop policy "Medical storage delete through linked access" on storage.objects;

create policy "Demo storage read"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions'));

create policy "Demo storage insert"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions'));

create policy "Demo storage update"
on storage.objects
for update
to anon, authenticated
using (bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions'))
with check (bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions'));

create policy "Demo storage delete"
on storage.objects
for delete
to anon, authenticated
using (bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions'));
