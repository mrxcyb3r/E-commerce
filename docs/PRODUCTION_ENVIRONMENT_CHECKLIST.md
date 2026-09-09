# Production Environment Checklist

Every required environment value, where it is used, and who must configure it.
No real secrets live in this repo or in `.env.example`.

## Required variables

| Variable | Used in | Browser-safe | Local dev | Netlify prod | Notes |
|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase/client.ts` | yes (publishable) | required | required | `https://<project-ref>.supabase.co` |
| `VITE_SITE_URL` | `scripts/generate-seo.mjs` (robots.txt + sitemap.xml, runs inside `npm run build`) | yes (build-time) | recommended | recommended (Netlify auto-sets `URL`, but be explicit) | without it the build falls back to an `https://example.com` placeholder; keep it in sync with the deploy domain |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `src/lib/supabase/client.ts`, `src/lib/supabase/storage.ts` (upload `apikey` header) | yes (publishable) | required | required | `sb_publishable_…` from Dashboard → Settings → API |
| `VITE_PLATFORM_OWNER_EMAIL` | `src/lib/auth/config.ts` (UX mirror only; DB is the gate) | yes | optional (has default) | recommended | MUST equal `platform_config.owner_email` seed in migrations/`20260909…` |
| `VITE_AUTH_GOOGLE_ENABLED` | `src/lib/auth/config.ts` (show Google button) | yes | optional | `true` only if Google provider configured | remember to set the supabase Redirect URL (`/login/callback`) in the Google/Supabase consoles |
| `VITE_AUTH_DEV_OTP` | `src/lib/auth/config.ts` | yes (dev only) | `1` optional in `npm run dev` | NEVER `1` | toggles owner password login pivot when SMTP is off; ignored in production builds |

## Server-only (never `VITE_`, never in the browser bundle)

| Name | Purpose | Where to set |
|---|---|---|
| `SUPABASE_SECRET_KEY` (service role `sb_secret_…`) | server-side scripts / edge functions only | local shell + Netlify as a normal (non-`VITE_`) env var; keep out of `src/`, `.env.example` keeps a placeholder only |

The app has **no** server/edge runtime that imports these today — the plastic-
bundle only ever ships the two publishable `VITE_` variables.

## External providers

| Provider | Required? | What to configure |
|---|---|---|
| Supabase project | required | create project, run migrations (`docs/MIGRATIONS.md`), set `VITE_SUPABASE_URL` + publishable key |
| Supabase Auth — Email/OTP | required for OTP login | Dashboard → Auth → Providers → Email enabled; **Email templates**; SMTP (custom provider) under Auth → Settings for real delivery |
| Supabase Auth — Google | optional | Dashboard → Auth → Providers → Google (Client ID/Secret from Google Cloud); add `https://<domain>/login/callback` redirect; set `VITE_AUTH_GOOGLE_ENABLED=true` |
| Storage buckets | required | `products`, `feed`, `store-assets`, `prompt-assets` + the RLS hardening migration `20260909070000` must be applied |
| ImgBB | not used | none |
| YouTube | not used as API | only URL embeds; no API key needed |

## Deploy steps (Netlify)

1. Set the five `VITE_*` vars (above) in Site settings → Environment variables
   (including `VITE_SITE_URL`; if omitted, Netlify still injects `URL`, which the
   SEO generator reads as a fallback).
2. Do **not** define `SUPABASE_SECRET_KEY` as `VITE_*`.
3. Build command `npm run build`; publish `dist`.
4. Supabase Auth redirect URLs must include the live domain.

## Before launch (developer manual actions)

1. Apply migrations — see `docs/MIGRATIONS.md` + `docs/ADMIN_AUTH_ROADMAP.md` §15
   (three `20260909…_rls_harden_*`, `20260910000000_auth_audit_allowlist`,
   `20260910010000_auth_invite_expiration`).
2. Set SMTP in Supabase Auth so OTP + password-reset emails deliver.
3. (Optional) Configure Google OAuth.
4. Run the runtime matrix (roadmap §15) in a real browser, including OAuth and
   reset-password email round trips.