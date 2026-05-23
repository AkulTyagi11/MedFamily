-- MedFamily business functions and triggers.
-- Internal security-definer logic stays in the private schema.

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  group_name text;
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    primary_role,
    onboarding_complete
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.phone,
    new.email,
    'patient_admin',
    false
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = excluded.phone,
    email = coalesce(excluded.email, public.profiles.email);

  group_name := coalesce(nullif(new.raw_user_meta_data ->> 'group_name', ''), 'My Family');

  insert into public.family_groups (admin_id, group_name)
  select new.id, group_name
  where not exists (
    select 1
    from public.family_groups fg
    where fg.admin_id = new.id
  );

  return new;
end;
$$;

create or replace function private.sync_reminders_from_prescription()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  med jsonb;
  reminder_times text[];
begin
  delete from public.medicine_reminders
  where prescription_id = new.id;

  for med in select * from jsonb_array_elements(coalesce(new.medicines, '[]'::jsonb))
  loop
    reminder_times := array(
      select jsonb_array_elements_text(coalesce(med -> 'reminder_times', '[]'::jsonb))
    );

    insert into public.medicine_reminders (
      prescription_id,
      member_id,
      medicine_name,
      dosage,
      frequency,
      reminder_times,
      start_date,
      end_date,
      is_active
    )
    values (
      new.id,
      new.member_id,
      coalesce(med ->> 'name', 'Medicine'),
      coalesce(med ->> 'dosage', '-'),
      coalesce(med ->> 'frequency', 'Once daily'),
      coalesce(reminder_times, '{}'),
      coalesce((med ->> 'start_date')::date, new.prescription_date),
      coalesce((med ->> 'end_date')::date, new.prescription_date),
      true
    );
  end loop;

  return new;
end;
$$;

create or replace function private.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, changed_by, note)
    values (new.id, new.status, new.placed_by_user_id, 'Order created');
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by, note)
    values (new.id, new.status, auth.uid(), null);
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function private.set_updated_at();

create trigger medicine_orders_set_updated_at
before update on public.medicine_orders
for each row
execute function private.set_updated_at();

create trigger prescriptions_sync_reminders
after insert or update on public.prescriptions
for each row
execute function private.sync_reminders_from_prescription();

create trigger medicine_orders_status_history
after insert or update of status on public.medicine_orders
for each row
execute function private.log_order_status_change();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();
