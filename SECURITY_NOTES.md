# Security Notes

MedFamily is designed as a secure production-ready PWA baseline, but healthcare data requires careful operational handling.

## Production Defaults

- Supabase Auth is the default auth mode.
- RLS remains enabled in production migrations.
- Storage buckets for healthcare documents are private.
- The frontend rejects service-role and secret-style Supabase keys.
- Access grants are scoped by family group, member list, permission scopes, and expiry.
- Audit logs capture sensitive access, record, reminder, appointment, order, and health actions.

## Demo Mode Boundary

`supabase/migrations/0005_optional_demo_mode.sql` is intentionally not production-safe. It keeps old demo accounts working with DB-backed auth and relaxed RLS for local presentations only.

Production deployments must use:

```env
VITE_AUTH_MODE=supabase
VITE_ENABLE_DEMO_DATA=false
```

## Data Handling

- Do not commit real PHI.
- Do not seed real medical records.
- Do not put real prescriptions or reports in `public/`.
- Do not cache private documents in the service worker.
- Use signed URLs for private files.

## Medical Disclaimer

MedFamily summaries, alerts, vitals displays, and emergency exports are informational aids only. They are not diagnostic, not a substitute for a medical record, and not a replacement for consultation with a qualified professional.

## Remaining Operational Work

- Production migrations are applied to Supabase project `rgdmzbxzzwdcesvesdqd`; rerun advisors after future schema changes.
- Configure Supabase email templates and confirmation policy.
- Decide whether doctor/hospital/chemist roles require admin approval outside self-service onboarding.
- Add monitoring for auth, storage, and database policy errors after launch.
