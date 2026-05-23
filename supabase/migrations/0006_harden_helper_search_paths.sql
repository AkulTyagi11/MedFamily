-- Hardens public helper functions flagged by Supabase advisors.

create or replace function public.generate_share_code()
returns text
language sql
set search_path = public
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create or replace function public.generate_consent_code()
returns text
language sql
set search_path = public
as $$
  select lpad(((random() * 999999)::int)::text, 6, '0');
$$;

create or replace function public.generate_order_number()
returns text
language sql
set search_path = public
as $$
  select 'MED-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;
