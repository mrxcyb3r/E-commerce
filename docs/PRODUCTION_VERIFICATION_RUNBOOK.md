# Production Verification Runbook

Single operator-facing document for proving the auth/admin system works against a
live database and browser **before** launch. SQL guard queries live in
`docs/ADMIN_AUTH_ROADMAP.md` §15; environment values in
`docs/PRODUCTION_ENVIRONMENT_CHECKLIST.md`.

## 0. Prerequisites (done by the owner)

1. The five migrations applied in order (§15 / order below).
2. `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PLATFORM_OWNER_EMAIL`,
   `VITE_AUTH_GOOGLE_ENABLED`, `VITE_AUTH_DEV_OTP=0`, `VITE_SITE_URL` set where you build.
3. SMTP configured in Supabase Auth (OTP + reset emails deliver).
4. Supabase Allowed Redirect URLs include the domain + `/login/callback`.

## 1. Browser E2E matrix (2 sessions: normal + private window)

Record an outcome (PASS/FAIL + note) for every row. A `FAIL` = do not launch.

| # | Flow | Steps | Expected |
|---|---|---|---|
| 1 | Owner password login | `/login` → email tab still shows OTP; pick **Parol** tab (or dev pivot); enter owner email + password | Lands on `/admin` dashboard; no `/login` flash; `SessionWarningBanner` absent |
| 2 | Admin password login | same with an admin (invited) account | Lands on `/admin`; role-limited sidebar only shows permitted sections |
| 3 | OTP login | `/login` → email tab → send code → 6-digit entry | Email arrives; verifying logs in; lands on `/admin` |
| 4 | OTP resend countdown | after sending a code | "qayta yuborish (Ns)" disabled countdown; enabled again at 0 |
| 5 | Invalid OTP | wrong/old 6-digit code → verify | "Kod noto'g'ri yoki eskirgan." (or invite-gate copy); stays on page |
| 6 | Blocked email OTP | OTP to an address that is not owner and has no valid invite | non-enumerating copy mentions unapproved/expired/used invite or SMTP |
| 7 | Google login | Google button → consent (auto) | returns to `/login/callback`, then `/admin` (pending redirect honored) |
| 8 | Return URL (OTP) | deep-link `/admin/orders` → login via OTP | lands on `/admin/orders`, not `/admin` |
| 9 | Return URL (password) | deep-link `/admin/activity` → password login | lands on `/admin/activity` |
| 10 | Return URL (Google) | deep-link `/admin/campaigns` → Google | lands on `/admin/campaigns` |
| 11 | Forbidden page | login as admin WITHOUT a capability → direct `/admin/analytics` | 403 page ("Nimadir... ruxsat yo'q"), not a login redirect |
| 12 | Unauthenticated deep link | logged-out `/admin/products` | redirected to `/login`, then back after login (no loop, no flash) |
| 13 | Logout | sidebar logout | returns to `/login`; refresh stays logged out |
| 14 | Cross-tab logout | two tabs logged in → logout in tab A | tab B also logs out (broadcast + storage fallback) |
| 15 | Session expiry | shorten `AUTH_CONFIG.sessionWarnMs` temporarily; wait | mm:ss warning banner before expiry; on expiry sign-out + `/login` |
| 16 | Password reset | `/login` → "Parolni unutdingizmi?" → `/forgot-password` → email | email arrives; link opens `/reset-password`; new password works; old fails; sign-in succeeds |
| 17 | Reset link reuse | reuse the same reset link | invalid state (link used/expired) — no crash |
| 18 | Suspended/blocked session | manually suspend a staff profile in DB → their next load | `blocked` → `/login?denied=1` denied screen |
| 19 | Invite lifecycle | owner invites email → invitee OTP signup → created as admin | pending→used; expiry badge shows for expired invites; "Qayta taklif" renews |
| 20 | RLS denial (admin) | toggle an admin's role in DB to a role lacking a capability | their UI shows 403; direct table/RPC access also fails (see §15 SQL) |
| 21 | Analytics export | `/admin/analytics` → export CSV | downloads; `analytics_exported` row appears in audit log (owner view) |
| 22 | Owner immutability | owner account → try delete/demote/suspend via DB | SQL raises; owner row unchanged (see §15 guard SQL) |

## 2. Audit event mapping (Phase C)

| Business event | Stream | Writes via | Immutable? |
|---|---|---|---|
| owner/admin login, logout, OTP reque/verify, resend, password reset, failed login | `login_history` | `rpc_auth_log` (definer) | insert-only; owner-read |
| invite_created / invite_revoked / member_role_changed / member_suspended / member_unsuspended | `auth_audit_log` | `rpc_auth_audit` (definer, allowlist) | insert-only; owner-read |
| product_deleted / campaign_created/updated/deleted / store_updated / homepage_published / analytics_exported / feed_post_deleted / password_changed | `auth_audit_log` | `logBusinessAudit` → `rpc_auth_audit` | insert-only; owner-read |

Every `auth_audit_log` row carries actor_id + actor_email (derived from `auth.uid()`,
never client-supplied), action, entity, entity_id, metadata, ip, user_agent, created_at.

Client cannot `insert/update/delete/truncate` either table (grants revoked, RLS
owner-read-only). Not covered by the immutable trail (deliberate): order status
changes, buy-session cancel, and in-store sale completion — these emit analytics
events + persist in order/sale records instead (commercial stream).

## 3. Owner protection proof (Phase E)

Run in the Supabase SQL editor:

```sql
-- delete must raise
delete from public.profiles where role = 'owner';        -- expect error
-- demote / suspend must raise
update public.profiles set role = 'admin' where role = 'owner';       -- error
update public.profiles set is_suspended = true where role = 'owner';  -- error
-- client-side delete already impossible
grant-checked: anon/authenticated have NO insert/update/delete/truncate on profiles;
-- owner_uid is locked
update public.platform_config set value = md5(random()::text) where key = 'owner_uid'; -- error
select id, email, role from public.profiles where role = 'owner'; -- exactly one row, role='owner'
```

Only database-level guards protect the owner (triggers `protect_owner_profile`,
`guard_platform_owner_uid`; RLS policy; revoked grants). No frontend-only check may be
relied on — verify that none exists: `rg "isOwner" src` should only drive UI labels.

## 4. Env validation (Phase G)

| Var | Netlify | Local dev | Supabase | Browser bundle? |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | set | set | — | yes (publishable) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | set | set | — | yes (publishable) |
| `VITE_PLATFORM_OWNER_EMAIL` | set | set | must equal seed | yes |
| `VITE_SITE_URL` | set | optional (warn) | — | build-time |
| `VITE_AUTH_GOOGLE_ENABLED` | true iff Google | optional | Google provider on | yes |
| `VITE_AUTH_DEV_OTP` | NEVER `1` | `1` optional | — | dev-only |

Check the built bundle for secrets: `rg -n "sb_secret_" dist` must return nothing;
`rg -n "service_role" dist` only matches harmless strings.

## 5. Deployment checklist (Phase H)

1. **Migration order** (apply top-down, backup first):
   1. `20260909000000_auth_platform_owner.sql`
   2. `20260909010000_auth_allowed_admin_emails.sql`
   3. `20260909020000_auth_profiles_hardening.sql`
   4. `20260909030000_auth_audit_and_login.sql`
   5. `20260909040000_auth_rate_limits.sql`
   6. `20260909050000_rls_harden_orders.sql`
   7. `20260909060000_rls_harden_analytics.sql`
   8. `20260909070000_rls_harden_storage.sql`
   9. `20260910000000_auth_audit_allowlist.sql`
   10. `20260910010000_auth_invite_expiration.sql`
2. Supabase: run §15 guard SQL; verify seed owner; enable Email+SMTP; optional Google;
   buckets `products`, `feed`, `store-assets`, `prompt-assets` (with storage hardening applied).
3. Netlify: set the six env vars; build `npm run build`; publish `dist`.
4. `VITE_AUTH_DEV_OTP` = `0` everywhere; confirm `dist/robots.txt` + `sitemap.xml` use the real domain.
5. Run §1 E2E matrix — all PASS.
6. Verify audit log: owner logs in → owner login → `/admin/audit` (owner-only) shows expected rows; no client can write (SQL).

## 6. Rollback plan

- **Staging/feature-build issues** (before traffic): revert Netlify to the previous
  successful deploy — the SPA is fully client-side, so a redeploy is an instant revert.
- **Auth config breaks login** (e.g., SMTP/Google misconfig): fix Supabase Auth settings
  first (they only affect sign-in, not reads); the store front-end keeps working because
  authentication is orthogonal to public content.
- **A migration causes DB errors in prod**: roll back that migration's effects with the
  documented forward-fix style (`docs/MIGRATIONS.md` — never destructive);
  `auth_audit_log`/`login_history` are append-only so a bad write can be ignored, not undone.
- **Worst case**: restore the Supabase backup taken before the migration batch, then
  re-apply migrations one-by-one, running §15 guards after each.

## 7. Sign-off

All §3 rows PASS, §5 items complete, §1 matrix has zero FAILs, and the
built bundle ships no secrets → mark PRODUCTION READY. Any FAIL blocks launch.