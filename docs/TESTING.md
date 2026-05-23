# Testing

## Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Current Coverage

- Auth mode selection: Supabase Auth default, demo RPC isolation, and failed sign-in handling.
- Shared member-name utility behavior.

## Manual Smoke Checklist

- Sign in with Supabase Auth in production mode.
- Sign in with seeded demo account only when `VITE_AUTH_MODE=demo`.
- Refresh `/dashboard`, `/records`, `/orders`, and `/emergency` on a Vercel preview.
- Verify mobile bottom nav does not overlap content or safe areas.
- Upload validation rejects unsupported file types and oversized files.
- Preview private files through signed URLs.
- Approve and revoke an access request.
- Move an order through chemist statuses and send a chat message.
- Print/download an emergency summary and confirm the disclaimer is visible.

## Known Test Gaps

- No Playwright E2E suite is committed yet.
- Supabase production migrations were executed against MedFamily project `rgdmzbxzzwdcesvesdqd` in `ap-south-1`.
- Browser notification behavior should be checked manually because permission prompts differ by browser.
