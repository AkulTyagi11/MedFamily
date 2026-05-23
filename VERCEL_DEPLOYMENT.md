# Vercel Deployment

MedFamily deploys as a Vite React single-page app.

## Build Settings

- Framework preset: Vite
- Install command: `npm install` or `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

## Environment Variables

Add these in Vercel Project Settings:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_AUTH_MODE=supabase
VITE_ENABLE_DEMO_DATA=false
```

Do not add service-role keys to Vercel frontend variables.

## SPA Refresh Support

`vercel.json` rewrites all app routes to `/index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This keeps `/dashboard`, `/records`, `/orders`, and other React Router routes working after refresh.

## Deployment Steps

1. Create or confirm the MedFamily Supabase project.
2. Apply migrations `0001` through `0004`.
3. Generate/update `src/lib/database.types.ts`.
4. Import the GitHub repo into Vercel.
5. Set the Vite build settings above.
6. Add env vars.
7. Deploy a preview and verify login, dashboard, records, reminders, orders, emergency summary, and direct route refresh.

## Common Issues

| Problem | Fix |
| --- | --- |
| Blank page at startup | Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist in Vercel |
| Browser rejects Supabase key | Replace service-role or `sb_secret_*` keys with anon/publishable key |
| Deep links 404 | Confirm `vercel.json` is included and Vercel redeployed |
| Demo accounts fail | Demo accounts require `VITE_AUTH_MODE=demo` and optional migration `0005`; do not use this in production |
| Private files do not preview | Confirm storage buckets and policies from `0002` are applied |
