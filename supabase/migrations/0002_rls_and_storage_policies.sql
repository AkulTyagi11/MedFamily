-- MedFamily production authorization model.
-- Keeps all public tables behind authenticated access and private storage buckets.

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.current_user_role()
returns public.app_role
language sql
security definer
stable
set search_path = public, private
as $$
  select primary_role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function private.owns_group(group_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.family_groups
    where id = group_uuid
      and admin_id = auth.uid()
  );
$$;

create or replace function private.has_active_access_to_group(group_uuid uuid, required_scope text default null)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.access_grants ag
    where ag.grantee_user_id = auth.uid()
      and ag.target_group_id = group_uuid
      and ag.status = 'active'
      and (ag.expires_at is null or ag.expires_at > now())
      and (
        required_scope is null
        or cardinality(ag.permission_scopes) = 0
        or required_scope = any(ag.permission_scopes)
      )
  );
$$;

create or replace function private.can_access_member(member_uuid uuid, required_scope text default null)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.family_members fm
    join public.family_groups fg on fg.id = fm.group_id
    where fm.id = member_uuid
      and (
        fg.admin_id = auth.uid()
        or exists (
          select 1
          from public.access_grants ag
          where ag.grantee_user_id = auth.uid()
            and ag.target_group_id = fg.id
            and ag.status = 'active'
            and (ag.expires_at is null or ag.expires_at > now())
            and (
              cardinality(ag.member_ids) = 0
              or member_uuid = any(ag.member_ids)
            )
            and (
              required_scope is null
              or cardinality(ag.permission_scopes) = 0
              or required_scope = any(ag.permission_scopes)
            )
        )
      )
  );
$$;

create or replace function private.can_access_order(order_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.medicine_orders mo
    where mo.id = order_uuid
      and (
        mo.placed_by_user_id = auth.uid()
        or private.owns_group(mo.family_group_id)
        or private.has_active_access_to_group(mo.family_group_id, 'medicine_ordering')
        or mo.chemist_id = auth.uid()
        or (
          private.current_user_role() = 'chemist'
          and mo.chemist_id is null
          and mo.status in ('placed', 'awaiting_chemist_approval')
        )
      )
  );
$$;

create or replace function private.can_read_storage_object(bucket_name text, object_name text)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select case
    when bucket_name = 'patient-records' then exists (
      select 1
      from public.patient_records pr
      where pr.file_url = object_name
        and private.can_access_member(pr.member_id, 'records')
    )
    when bucket_name = 'prescriptions' then exists (
      select 1
      from public.prescriptions p
      where p.file_url = object_name
        and private.can_access_member(p.member_id, 'prescriptions')
    )
    when bucket_name = 'order-prescriptions' then exists (
      select 1
      from public.medicine_orders mo
      where mo.uploaded_prescription_url = object_name
        and private.can_access_order(mo.id)
    )
    else false
  end;
$$;

create or replace function private.can_manage_storage_object(bucket_name text, object_name text)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select case
    when bucket_name = 'patient-records' then exists (
      select 1
      from public.patient_records pr
      join public.family_members fm on fm.id = pr.member_id
      where pr.file_url = object_name
        and (
          pr.uploaded_by = auth.uid()
          or private.owns_group(fm.group_id)
        )
    )
    when bucket_name = 'prescriptions' then exists (
      select 1
      from public.prescriptions p
      join public.family_members fm on fm.id = p.member_id
      where p.file_url = object_name
        and (
          p.uploaded_by = auth.uid()
          or private.owns_group(fm.group_id)
        )
    )
    when bucket_name = 'order-prescriptions' then exists (
      select 1
      from public.medicine_orders mo
      where mo.uploaded_prescription_url = object_name
        and (
          mo.placed_by_user_id = auth.uid()
          or private.owns_group(mo.family_group_id)
          or mo.chemist_id = auth.uid()
        )
    )
    else false
  end;
$$;

grant execute on function private.current_user_role() to authenticated, service_role;
grant execute on function private.owns_group(uuid) to authenticated, service_role;
grant execute on function private.has_active_access_to_group(uuid, text) to authenticated, service_role;
grant execute on function private.can_access_member(uuid, text) to authenticated, service_role;
grant execute on function private.can_access_order(uuid) to authenticated, service_role;
grant execute on function private.can_read_storage_object(text, text) to authenticated, service_role;
grant execute on function private.can_manage_storage_object(text, text) to authenticated, service_role;

insert into storage.buckets (id, name, public)
values
  ('patient-records', 'patient-records', false),
  ('prescriptions', 'prescriptions', false),
  ('order-prescriptions', 'order-prescriptions', false)
on conflict (id) do update
set public = excluded.public;

alter table public.profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.hospital_profiles enable row level security;
alter table public.caretaker_profiles enable row level security;
alter table public.chemist_profiles enable row level security;
alter table public.family_groups enable row level security;
alter table public.family_members enable row level security;
alter table public.patient_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medicine_reminders enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.access_requests enable row level security;
alter table public.access_grants enable row level security;
alter table public.access_audit_logs enable row level security;
alter table public.medicine_orders enable row level security;
alter table public.medicine_order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.appointments enable row level security;
alter table public.vital_entries enable row level security;
alter table public.care_tasks enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Profiles can be inserted by owner"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Profiles can be updated by owner"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Doctor profiles own row"
on public.doctor_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Hospital profiles own row"
on public.hospital_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Caretaker profiles own row"
on public.caretaker_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Chemist profiles own row"
on public.chemist_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Family groups visible to owners or grantees"
on public.family_groups
for select
to authenticated
using (
  admin_id = auth.uid()
  or private.has_active_access_to_group(id, null)
);

create policy "Family groups can be created by admin"
on public.family_groups
for insert
to authenticated
with check (admin_id = auth.uid());

create policy "Family groups can be updated by admin"
on public.family_groups
for update
to authenticated
using (admin_id = auth.uid())
with check (admin_id = auth.uid());

create policy "Family members visible via grants"
on public.family_members
for select
to authenticated
using (private.can_access_member(id, null));

create policy "Family members manageable by admin"
on public.family_members
for insert
to authenticated
with check (private.owns_group(group_id));

create policy "Family members updatable by admin"
on public.family_members
for update
to authenticated
using (private.owns_group(group_id))
with check (private.owns_group(group_id));

create policy "Family members deletable by admin"
on public.family_members
for delete
to authenticated
using (private.owns_group(group_id));

create policy "Records visible through scope"
on public.patient_records
for select
to authenticated
using (private.can_access_member(member_id, 'records'));

create policy "Records insert by owner"
on public.patient_records
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and private.owns_group((select group_id from public.family_members where id = member_id))
);

create policy "Records delete by owner"
on public.patient_records
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or private.owns_group((select group_id from public.family_members where id = member_id))
);

create policy "Prescriptions visible through scope"
on public.prescriptions
for select
to authenticated
using (private.can_access_member(member_id, 'prescriptions'));

create policy "Prescriptions insert by owner"
on public.prescriptions
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and private.owns_group((select group_id from public.family_members where id = member_id))
);

create policy "Prescriptions delete by owner"
on public.prescriptions
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or private.owns_group((select group_id from public.family_members where id = member_id))
);

create policy "Reminders visible through scope"
on public.medicine_reminders
for select
to authenticated
using (
  private.can_access_member(member_id, 'reminders')
  or private.can_access_member(member_id, 'reminders_management')
);

create policy "Reminders create by owner or caretaker"
on public.medicine_reminders
for insert
to authenticated
with check (
  private.owns_group((select group_id from public.family_members where id = member_id))
  or private.can_access_member(member_id, 'reminders_management')
);

create policy "Reminders update by owner or caretaker"
on public.medicine_reminders
for update
to authenticated
using (
  private.owns_group((select group_id from public.family_members where id = member_id))
  or private.can_access_member(member_id, 'reminders_management')
)
with check (
  private.owns_group((select group_id from public.family_members where id = member_id))
  or private.can_access_member(member_id, 'reminders_management')
);

create policy "Reminder logs visible through reminder access"
on public.reminder_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.medicine_reminders mr
    where mr.id = reminder_id
      and (
        private.can_access_member(mr.member_id, 'reminders')
        or private.can_access_member(mr.member_id, 'reminders_management')
      )
  )
);

create policy "Reminder logs write by owner or caretaker"
on public.reminder_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.medicine_reminders mr
    where mr.id = reminder_id
      and (
        private.owns_group((select group_id from public.family_members where id = mr.member_id))
        or private.can_access_member(mr.member_id, 'reminders_management')
      )
  )
);

create policy "Reminder logs update by owner or caretaker"
on public.reminder_logs
for update
to authenticated
using (
  exists (
    select 1
    from public.medicine_reminders mr
    where mr.id = reminder_id
      and (
        private.owns_group((select group_id from public.family_members where id = mr.member_id))
        or private.can_access_member(mr.member_id, 'reminders_management')
      )
  )
)
with check (
  exists (
    select 1
    from public.medicine_reminders mr
    where mr.id = reminder_id
      and (
        private.owns_group((select group_id from public.family_members where id = mr.member_id))
        or private.can_access_member(mr.member_id, 'reminders_management')
      )
  )
);

create policy "Appointments visible through summary access"
on public.appointments
for select
to authenticated
using (private.can_access_member(member_id, 'summary'));

create policy "Appointments insert by owner or caretaker"
on public.appointments
for insert
to authenticated
with check (
  booked_by = auth.uid()
  and (
    private.owns_group(family_group_id)
    or private.has_active_access_to_group(family_group_id, 'summary')
  )
);

create policy "Appointments update by participants"
on public.appointments
for update
to authenticated
using (
  booked_by = auth.uid()
  or updated_by = auth.uid()
  or private.owns_group(family_group_id)
  or private.has_active_access_to_group(family_group_id, 'summary')
)
with check (
  booked_by = auth.uid()
  or updated_by = auth.uid()
  or private.owns_group(family_group_id)
  or private.has_active_access_to_group(family_group_id, 'summary')
);

create policy "Vitals visible through summary access"
on public.vital_entries
for select
to authenticated
using (private.can_access_member(member_id, 'summary'));

create policy "Vitals insert by care workspace"
on public.vital_entries
for insert
to authenticated
with check (
  recorded_by = auth.uid()
  and (
    private.owns_group(family_group_id)
    or private.has_active_access_to_group(family_group_id, 'summary')
  )
);

create policy "Care tasks visible through summary access"
on public.care_tasks
for select
to authenticated
using (private.can_access_member(member_id, 'summary'));

create policy "Care tasks insert by care workspace"
on public.care_tasks
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    private.owns_group(family_group_id)
    or private.has_active_access_to_group(family_group_id, 'summary')
  )
);

create policy "Care tasks update by care workspace"
on public.care_tasks
for update
to authenticated
using (
  created_by = auth.uid()
  or assigned_to_user_id = auth.uid()
  or private.owns_group(family_group_id)
  or private.has_active_access_to_group(family_group_id, 'summary')
)
with check (
  created_by = auth.uid()
  or assigned_to_user_id = auth.uid()
  or private.owns_group(family_group_id)
  or private.has_active_access_to_group(family_group_id, 'summary')
);

create policy "Access requests visible to requester and group owner"
on public.access_requests
for select
to authenticated
using (
  requester_id = auth.uid()
  or private.owns_group(target_group_id)
);

create policy "Access requests insert by requester"
on public.access_requests
for insert
to authenticated
with check (
  requester_id = auth.uid()
  and requester_role in ('doctor', 'hospital', 'caretaker')
);

create policy "Access requests update by group owner or requester"
on public.access_requests
for update
to authenticated
using (
  requester_id = auth.uid()
  or private.owns_group(target_group_id)
)
with check (
  requester_id = auth.uid()
  or private.owns_group(target_group_id)
);

create policy "Access grants visible to grantee and group owner"
on public.access_grants
for select
to authenticated
using (
  grantee_user_id = auth.uid()
  or private.owns_group(target_group_id)
);

create policy "Access grants insert by group owner"
on public.access_grants
for insert
to authenticated
with check (private.owns_group(target_group_id));

create policy "Access grants update by group owner"
on public.access_grants
for update
to authenticated
using (private.owns_group(target_group_id))
with check (private.owns_group(target_group_id));

create policy "Audit logs visible to owners and actors"
on public.access_audit_logs
for select
to authenticated
using (
  actor_id = auth.uid()
  or (target_group_id is not null and private.owns_group(target_group_id))
);

create policy "Audit logs insert by authenticated users"
on public.access_audit_logs
for insert
to authenticated
with check (
  auth.uid() is not null
  and (actor_id is null or actor_id = auth.uid())
);

create policy "Orders visible to participants"
on public.medicine_orders
for select
to authenticated
using (private.can_access_order(id));

create policy "Orders insert by owners or caretakers"
on public.medicine_orders
for insert
to authenticated
with check (
  placed_by_user_id = auth.uid()
  and (
    private.owns_group(family_group_id)
    or private.has_active_access_to_group(family_group_id, 'medicine_ordering')
  )
);

create policy "Orders update by owner or chemist"
on public.medicine_orders
for update
to authenticated
using (
  placed_by_user_id = auth.uid()
  or private.owns_group(family_group_id)
  or chemist_id = auth.uid()
  or (
    private.current_user_role() = 'chemist'
    and chemist_id is null
    and status in ('placed', 'awaiting_chemist_approval')
  )
)
with check (
  placed_by_user_id = auth.uid()
  or private.owns_group(family_group_id)
  or chemist_id = auth.uid()
  or (
    private.current_user_role() = 'chemist'
    and chemist_id is null
    and status in ('placed', 'awaiting_chemist_approval')
  )
);

create policy "Order items follow parent order visibility"
on public.medicine_order_items
for select
to authenticated
using (private.can_access_order(order_id));

create policy "Order items write via parent order access"
on public.medicine_order_items
for insert
to authenticated
with check (private.can_access_order(order_id));

create policy "Order history visible to participants"
on public.order_status_history
for select
to authenticated
using (private.can_access_order(order_id));

create policy "Order history write by participants"
on public.order_status_history
for insert
to authenticated
with check (
  private.can_access_order(order_id)
  and (changed_by is null or changed_by = auth.uid())
);

create policy "Order chat visible to participants"
on public.order_chat_messages
for select
to authenticated
using (private.can_access_order(order_id));

create policy "Order chat insert by participants"
on public.order_chat_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and private.can_access_order(order_id)
);

create policy "Notifications visible to owner"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "Notifications insert by authenticated users"
on public.notifications
for insert
to authenticated
with check (auth.uid() is not null);

create policy "Notifications update by owner"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Medical storage read through linked access"
on storage.objects
for select
to authenticated
using (private.can_read_storage_object(bucket_id, name));

create policy "Medical storage upload to own prefix"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Medical storage update through linked access"
on storage.objects
for update
to authenticated
using (private.can_manage_storage_object(bucket_id, name))
with check (
  bucket_id in ('patient-records', 'prescriptions', 'order-prescriptions')
  and private.can_manage_storage_object(bucket_id, name)
);

create policy "Medical storage delete through linked access"
on storage.objects
for delete
to authenticated
using (private.can_manage_storage_object(bucket_id, name));
