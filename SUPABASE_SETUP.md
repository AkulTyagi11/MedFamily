# Supabase Setup

MedFamily uses the numbered files in `supabase/migrations` as the source of truth. `supabase/database.sql` is now a manifest, not the production schema to paste into SQL Editor.

## Project

The linked Supabase project is `MedFamily` in `ShreyTriesToCode's Org`:

- Project ref: `rgdmzbxzzwdcesvesdqd`
- Region: `ap-south-1`
- URL: `https://rgdmzbxzzwdcesvesdqd.supabase.co`

Recommended region for a new India-focused project: `ap-south-1` when available.

The repository includes `supabase/config.toml` with the project ref. To fully link a local Supabase CLI session, run:

```bash
npx supabase login
npx supabase link --project-ref rgdmzbxzzwdcesvesdqd
```

## Environment

Use only browser-safe values in Vite:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_AUTH_MODE=supabase
VITE_ENABLE_DEMO_DATA=false
```

Never put `SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_*`, or a service-role JWT in frontend env vars.

## Production Migrations

Apply in order through Supabase migration tooling:

1. `supabase/migrations/0001_core_schema.sql`
2. `supabase/migrations/0002_rls_and_storage_policies.sql`
3. `supabase/migrations/0003_functions_and_triggers.sql`
4. `supabase/migrations/0004_seed_demo_data.sql`
5. `supabase/migrations/0006_harden_helper_search_paths.sql`

Do not apply `0005_optional_demo_mode.sql` to production. It exists only for isolated classroom/local demos that intentionally use DB-backed demo auth.

## Storage

Production buckets are private:

| Bucket | Purpose |
| --- | --- |
| `patient-records` | medical reports and uploaded patient files |
| `prescriptions` | prescription files |
| `order-prescriptions` | medicine-order prescription attachments |
| `avatars` | optional profile images |

Storage policies tie object reads and writes back to ownership or active access grants. Private medical files should be opened through signed URLs, not public bucket URLs.

## Type Generation

Generated/maintained types live at:

```text
src/lib/database.types.ts
```

Regenerate after applying migrations:

```bash
supabase gen types typescript --project-id <medfamily-project-ref> > src/lib/database.types.ts
```

## Demo Mode

Only for local/classroom demos:

1. Apply `0005_optional_demo_mode.sql`.
2. Set `VITE_AUTH_MODE=demo`.
3. Use the seeded demo accounts from `README.md`.

Demo mode uses MD5-backed sample credentials and relaxed RLS. It is not production authentication.
