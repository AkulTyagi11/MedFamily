# MedFamily

MedFamily is a mobile-first healthcare PWA for family care coordination. It helps patients, caretakers, doctors, hospitals, and chemists manage records, prescriptions, reminders, appointments, access requests, medicine orders, notifications, and emergency summaries in one Vercel-deployable React app.

MedFamily is informational only. It does not diagnose, treat, or replace care from a qualified medical professional.

## Roles

- Patient: owns the family workspace, approves access, manages records and reminders.
- Doctor: requests consented access to review summaries, records, prescriptions, and visit context.
- Hospital: coordinates institutional access and follow-up care context.
- Caretaker: supports daily reminders, care tasks, appointments, and medicine ordering.
- Chemist: manages order queue, fulfilment states, substitutions, and order chat.

The legacy `family_member` role remains only for backward compatibility with older data and is normalized internally to Patient.

## Tech Stack

- Vite 7, React 19, TypeScript
- Tailwind CSS v4, Framer Motion, Lucide React
- React Router, React Hook Form, date-fns, react-hot-toast
- Supabase Auth, Postgres, RLS, Storage, Realtime
- Vitest and React Testing Library

## UI System

The current UI follows the Serene Care Nexus Stitch direction: a minimal family command center in light mode and a dark clinical care workspace in dark mode. Theme tokens live in `src/index.css`, while the authenticated shell is composed from `AppShell`, `SidebarNav`, `TopBar`, and `MobileBottomNav`.

Stitch HTML was used as visual reference only. The React app keeps the existing routes, hooks, Supabase access rules, and form flows as the functional source of truth.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required `.env` values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_AUTH_MODE=supabase
VITE_ENABLE_DEMO_DATA=false
```

Use `VITE_AUTH_MODE=demo` only with the optional demo migration in local/classroom demos.

## Supabase Setup

Production migrations live in `supabase/migrations`:

1. `0001_core_schema.sql`
2. `0002_rls_and_storage_policies.sql`
3. `0003_functions_and_triggers.sql`
4. `0004_seed_demo_data.sql`
5. `0006_harden_helper_search_paths.sql`

`0005_optional_demo_mode.sql` is local-demo-only. It intentionally relaxes RLS and uses database-backed demo passwords, so do not apply it to production or shared staging.

The linked Supabase project is `MedFamily` (`rgdmzbxzzwdcesvesdqd`) in `ShreyTriesToCode's Org`, region `ap-south-1`.

## Vercel Deployment

- Framework preset: Vite
- Install command: `npm install` or `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_MODE=supabase`, `VITE_ENABLE_DEMO_DATA=false`

`vercel.json` rewrites all SPA routes to `/index.html` so route refreshes work after deployment.

See `VERCEL_DEPLOYMENT.md` for the full checklist.

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run test
npm run preview
```

## Demo Accounts

Demo credentials are available only after applying `0005_optional_demo_mode.sql` and setting `VITE_AUTH_MODE=demo`.

| Role | Email | Phone | Password |
| --- | --- | --- | --- |
| Patient Admin | `familyadmin@medfamily.demo` | `+919900000001` | `family123` |
| Doctor | `doctor@medfamily.demo` | `+919900000002` | `doctor123` |
| Hospital | `hospital@medfamily.demo` | `+919900000003` | `hospital123` |
| Caretaker | `caretaker@medfamily.demo` | `+919900000004` | `caretaker123` |
| Chemist | `chemist@gmail.com` | `+919900000005` | `chemist123` |
| Patient Demo | `patient@medfamily.demo` | `+919900000006` | `patient123` |

All seeded people and records are fake demo data. Do not commit real PHI, real medical records, real credentials, or service-role keys.

## Documentation

- `SUPABASE_SETUP.md`
- `VERCEL_DEPLOYMENT.md`
- `SECURITY_NOTES.md`
- `docs/FEATURE_MATRIX.md`
- `docs/TESTING.md`
- `docs/PRD.md`

## Contributors

@SugamB1234  
@AkulTyagi11
