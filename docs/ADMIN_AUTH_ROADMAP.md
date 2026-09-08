# Advanced Admin Authentication & Authorization Roadmap

> Single source of truth for the FUTURE Advanced Admin Auth & Authorization work.
> Status was verified against the repository on **2026-09-08**.
> Legend: `[x]` done · `[ ]` not done · `[~]` partial/hardening needed · `[→]` intentionally deferred

---

## 1. Current Status

Everything below was verified in the codebase, not assumed.

### Completed in this phase
- `[x]` **Supabase Auth integration** — PKCE flow (`src/lib/supabase/client.ts`, `flowType: 'pkce'`), `AuthProvider` wraps the app (`src/App.tsx`), `onAuthStateChange` listener, redirect callback page at `/login/callback` (`src/pages/AuthCallbackPage.tsx`).
- `[x]` **Admin-only protected routes** — `AdminRoute` (`src/components/admin/AdminRoute.tsx`) redirects unauthenticated → `/login`, `blocked` → `/login?denied=1`.
- `[~]` **Admin authorization** — identity/role come from the DB (`rpc_my_profile()`, security-definer). A central capability map exists (`src/lib/admin/permissions.ts`: `can()` + 7 `canManageX()`). **However** permissions are applied in only two places: `AdminSidebar` (menu gating) and `AdminsPage` (owner actions). The bulk of admin pages (products, feed, store, analytics, buy sessions, in-store sale, campaigns, …) only check `AdminRoute` (authenticated + not suspended), not a `canManageX()` gate.
- `[x]` **Platform owner protection** — DB-enforced (see §2).
- `[x]` **Owner email / bootstrap handling** — `platform_config.owner_email` seed + `handle_new_user()` trigger grants the owner role and locks `owner_uid` on first login.
- `[x]` **Passwordless email OTP** — `loginOtp()` / `verifyOtp()` / `resendOtp()` in `AuthContext`; 6-cell OTP UI with paste + auto-advance (`LoginPage`). **Delivery requires SMTP configured in Supabase** (deployment dependency, not code).
- `[x]` **Optional password authentication** — `login(email, password)` via `signInWithPassword`; password tab on the login page.
- `[~]` **Google authentication** — `loginGoogle()` gated by `VITE_AUTH_GOOGLE_ENABLED`, PKCE redirect to `/login/callback`, allowlist still enforced by the signup gate. **Requires the Google provider configured in Supabase** (deployment dependency). Edge cases unverified (see §3).
- `[x]` **Allowed-admin email system** — `public.allowed_admin_emails` (pending/used/revoked) + `handle_new_user()` gate consuming a `pending` invite on signup.
- `[x]` **Admin registration restrictions** — `handle_new_user()` trigger on `auth.users` raises for any non-owner, non-allowlisted email → open registration blocked at DB level.
- `[x]` **Admin session handling** — auto-refresh (Supabase), `sessionChecked` flag, expiry heartbeat in `AuthContext` (`sessionWarning` / `sessionExpiresAt`), broadcast logout.
- `[~]` **Unauthorized handling** — denied screen on `/login?denied=1` + `blocked`; **but** `sessionWarning` / `sessionExpiresAt` have **no UI consumer** (verified: zero usage outside `AuthContext`), and a cold-load `/admin` visit briefly redirects to `/login` before `sessionChecked` resolves (flash/redirect bounce on valid sessions).
- `[x]` **Admin profile identity** — `rpc_my_profile()` returns id/email/username/full_name/role/is_owner/is_suspended/last_login_at; mapped to `AdminUser` in `AuthContext`. Identity never comes from localStorage or the JWT.
- `[~]` **Dynamic sidebar identity** — footer now renders `user?.isOwner ? 'Platforma egasi' : 'Administrator'` (`AdminSidebar.tsx:262`). This fixed the bare hardcoded string, but the non-owner half is still a constant (see §8).
- `[~]` **Audit logging** — `auth_audit_log` (immutable, insert-only via `rpc_auth_audit`) and `login_history` (insert-only via `rpc_auth_log`) exist. **Only wired events:** `password_changed`, `invite_created`, `invite_revoked`, `member_role_changed`, `member_suspended/unsuspended`, plus the `login_history` stream. Business events (product deleted, campaign published, store updated, analytics exported, logout) are **not** persisted to `auth_audit_log` — they still go to the client-side `activityLogs` (localStorage) in `StoreContext.logActivity()`.
- `[x]` **RLS protection (auth tables)** — profiles, platform_config, allowed_admin_emails, auth_audit_log, login_history, auth_rate_limits all have RLS. **Two pre-existing tables are role-blind** (orders, analytics_events) — see §5 (Critical).
- `[x]` **Logout / session handling** — `logout()` posts a broadcast + storage fallback; `SignOut({scope:'global'})` "logout everywhere" from `SecurityPage`.
- `[x]` **Migrations** — 5 new (`20260909{0000,0100,0200,0300,0400}_auth_*.sql`). One legacy migration (`20260906140503_admin_auth.sql`) is now **superseded but not dropped** (`admin_invitations` table + `profiles.pending_invitation_id`, zero client references — verified).
- `[x]` **Server-side authorization helpers** — `rpc_my_profile()`, `rpc_auth_log`, `rpc_auth_audit`, `rpc_auth_try_attempt`, `rpc_auth_record_attempt` (all SECURITY DEFINER).
- `[x]` **Security utilities** — `deviceSignature()`, `isNewDevice()`, `localCooldownMs()`, `rateBucket()`, `secondsToExpiry()` (`src/lib/auth/`).

---

## 2. Main Platform Owner

**Permanent owner email:** `mrxcyb3r@proton.me`

### Verified security properties
- `[x]` **Other admins cannot delete the owner** — `protect_owner_profile()` trigger: `DELETE` on a `role='owner'` row raises (`protect_owner_profile_trg` on `public.profiles`, `20260909020000`).
- `[x]` **Other admins cannot ban/suspend the owner** — trigger blocks transitioning `is_suspended` false→true for owner rows.
- `[x]` **Other admins cannot demote the owner** — trigger blocks `role` changes away from `'owner'`; RLS `with check (role <> 'owner')` on `owner updates staff`; role CHECK constraint also blocks `'owner'` being granted to others via the `with check` of the same policy.
- `[x]` **Other admins cannot revoke owner permissions** — same trigger + RLS; `owner_uid` row in `platform_config` is additionally guarded by `guard_platform_owner_uid_trg` (blocks UPDATE/DELETE for non-postgres).
- `[x]` **Enforced server/database-side, not just hidden UI** — triggers + RLS + SECURITY DEFINER function (`handle_new_user`) are the enforcement; the UI simply reveals it.
- `[x]` **Owner resolved to immutable DB identity, not just email** — `platform_config.owner_uid` is locked on first verified login (`insert … on conflict do nothing` inside `handle_new_user`), and `rpc_my_profile()` returns `is_owner` by comparing the signed-in id to `owner_uid`.
- `[x]` **Client-controlled email/role can never claim owner privileges** — role comes only from `rpc_my_profile()`; JWT claims are never read for role; allowlist + owner email are only *used by* the DB gate.
- `[~]` **"Do not spread the literal email throughout the frontend"** — the email still appears in three mirror locations: `platform_config` seed (DB, correct), `AUTH_CONFIG.ownerEmail` default (`src/lib/auth/config.ts`), and `AdminsPage` owner-email block check (`AdminsPage.tsx:94`), plus `.env.example`. None of these are an *authorization* source (authorization always goes through `rpc_my_profile`), but the value is mirrored in shipped code. **Future cleanup:** read the owner email from `platform_config` via a read-only RPC and drop the frontend default/block.

### Remaining hardening
- `[ ]` Owner protection guards the `public.profiles` row, not the underlying `auth.users` row. A postgres/superuser (the Supabase Dashboard) could still delete the owner's auth user. Acceptable today (no client path), but document and consider a separate out-of-band guard if Dashboard abuse is a concern.
- `[~]` If a second owner-email login ever races before `owner_uid` is set, `on conflict do nothing` keeps the first lock; both rows would exist with id ≠ owner_uid and `is_owner=false` for the second — verify no scenario can create two owners (email unique in `auth.users`, so treat as theoretical).

---

## 3. Future Authentication Improvements

### Login
- `[x]` Email OTP send → verify (cooldown + DB rate limit).
- `[x]` Optional password login.
- `[~]` Google OAuth — implemented + allowlisted, but provider must be enabled in Supabase; **unverified**: non-approved Google email (signup gate should block — test), OAuth error UX, refresh after callback.
- `[x]` Allowed-email validation (DB signup gate).
- `[x]` Prevent arbitrary admin signup (trigger raises).
- `[ ]` **Expired OTP handling** — relies entirely on Supabase message expiry; no explicit UX for "code expired".
- `[x]` OTP resend cooldown (60 s local + `resend_otp` bucket).
- `[x]` Login failure handling + throttling (DB buckets).
- `[~]` **Session-expiry warning UI** — the state exists; **no banner/modal consumes it**. When auto-refresh fails, users are silently logged out at `expires_at`. Priority: High.
- `[x]` Token refresh (Supabase auto-refresh).
- `[x]` Cross-tab logout/session sync (BroadcastChannel + `storage` event fallback).
- `[~]` **Protected-route deep-link handling** — `AdminRoute` saves `from`, password login honors it (`LoginPage.tsx:132`), but **OTP and Google success paths navigate to hardcoded `/admin`**, losing the deep link (`LoginPage` redirects on `isAuthenticated` via `useEffect`, `LoginPage.tsx:37-41`).
- `[~]` **Prevent protected-page flash** — during cold load `sessionChecked` is false, so a valid session hits `/admin` → bounce to `/login` → back to `/admin` once loaded. Suspend `AdminRoute` (`return null`) until `sessionChecked` is true.
- `[ ]` **Password reset / forgot password** — not implemented (`supabase.auth.resetPasswordForEmail` never called; no UI; no `password_reset` audit path other than the reserved event type).
- `[ ]` **OTP blocked-email UX** — a non-allowlisted email surfaces the generic "SMTP not configured" error from `loginOtp`; should distinguish "email not permitted" from "code not sent".

### Admin onboarding
- `[x]` Owner-only invite/allowlist management (`AdminsPage`, policy `owner manage allowed admin emails`).
- `[x]` Allowed-email lifecycle: pending → used / revoked.
- `[ ]` **Invitation expiration** — no `expires_at` column; pending invites never expire.
- `[ ]` **Re-invite after used/revoked** — `unique(email)` blocks a second invite row for a used account; no continuous "resend invite" path.
- `[~]` Google email matching — the DB gate matches the provider email to the allowlist (works), but untested end-to-end.
- `[x]` Email OTP / password login for approved accounts (post-gate).
- `[ ]` **Invitation abuse prevention** — invite creation itself is not rate-limited (only RLS owner-gated). Add an `invite_create` bucket ×2/server-side cap.

### Account security
- `[ ]` **Admin profile page** — no dedicated page showing: current authenticated email, actual role, store association, last login, auth method (OTP/password/Google). `SecurityPage` shows the email-security stream and session device, but no "my account" profile.
- `[x]` Password setup/change — `SettingsAdminPage` → `changeCredentials()` (verify old password, `updateUser`, `password_changed` audit).
- `[ ]` Password reset (as above).
- `[x]` Logout from all sessions — `SignOut({scope:'global'})` + broadcast.
- `[→]` Session/device management (revoke a single device) — deferred; only "this device" + "logout everywhere" exist.

---

## 4. Authorization Hardening

- `[~]` **Central permission system** — `permissions.ts` exists and is cohesive, but `canManage*` gates are applied in only 2 files. Apply consistently to every admin page (route-level gate or shared hook) so new roles map cleanly.
- `[ ]` **`isPlatformOwner()` / `isAdmin()` helpers** — not exported; rely on `user.isOwner` / `role` fields directly. Add small helpers for consistency (trivial, low priority).
- `[→]` **Store ownership checks** — single-store app; `store_id` exists only on `allowed_admin_emails` (`'default'`). No multi-tenant checks needed now.
- `[~]` **Server-side authorization** — RPC-level checks exist for auth/audit/rate-limit and `rpc_my_profile` is security-definer. Business mutations rely on table RLS only (see §5 for the two role-blind tables).
- `[~]` **Supabase RLS** — audit done in §5. Two Critical findings.
- `[ ]` **Authorization denial handling** — pages mostly assume RLS success; RLS errors are swallowed as empty lists (`AdminsPage` sets a message on error, most pages do not). Surface RLS denials to the UI.
- `[x]` **Preventing privilege escalation** — role escalation via "Profiles manage own role" removed; role CHECK narrowed; owner immutability triggers. Good.
- `[x]` **Preventing client-side role manipulation** — roles never read from localStorage or JWT; only `rpc_my_profile()`.
- `[x]` **Preventing localStorage-based authorization** — no auth decision reads localStorage. (Business *data* still lives in localStorage — campaigns/buy sessions/activity — different problem, see §5.)
- `[x]` **Admin access never based on email strings alone** — allowlist and owner email feed the DB *gate*, authorization is by profile role/`owner_uid`. Good.

Future-ready for Manager/Staff/Support: the role CHECK and `CAPABILITY_ROLES` already include them; do not build the staff UI now.

---

## 5. RLS Security Audit

Audit status of every admin-relevant surface. Notes:
- The Phase 15 signup gate makes "becomes authenticated" hard, but RLS is the **defense-in-depth** layer §1/§4 require — policies must not trust `auth.role()='authenticated'` alone.

| Table | Policies (verified) | Authz vs role-aware | Status |
|---|---|---|---|
| `profiles` | own read / own update (role unchanged, not owner) / staff read (owner,admin SELECT) / owner updates staff | **role-aware** | `[x]` |
| `platform_config` | owner SELECT only | **role-aware** | `[x]` |
| `allowed_admin_emails` | owner ALL (with check owner) | **role-aware** | `[x]` |
| `auth_audit_log` | owner/admin SELECT; INSERT via RPC only (revoked) | **role-aware** | `[x]` |
| `login_history` | owner/admin SELECT; INSERT via RPC only (revoked) | **role-aware** | `[x]` |
| `auth_rate_limits` | no client access; RPCs only (revoked all) | **role-aware** | `[x]` |
| `products` | public read published; owner manage; admin manage (`exists profiles.role in ('owner','admin')`) | **role-aware** | `[x]` |
| `product_images` / `product_sizes` / `product_colors` | owner manage; admin manage (same EXISTS pattern) | **role-aware** | `[x]` |
| `categories` | public read; owner manage; admin manage | **role-aware** | `[x]` |
| `feed_posts` | public read published; owner manage; admin manage | **role-aware** | `[x]` |
| `prompts` | public read published; owner manage; admin manage | **role-aware** | `[x]` |
| `testimonials` | public read published; owner manage; admin manage | **role-aware** | `[x]` |
| `faqs` | public read published; owner manage; admin manage | **role-aware** | `[x]` |
| `homepage_cms` / `about_cms` / `contact_cms` | public read; owner manage; admin manage | **role-aware** | `[x]` |
| `homepage_slides` | public read active; admins manage | **role-aware** (per `admin` role) | `[x]` |
| `store_settings` | public read; owner manage; admin manage | **role-aware** | `[x]` |
| **`orders`** | `for all using (auth.role()='authenticated')` — **no profile role check** | **⛔ role-blind** | `[ ]` **CRITICAL** |
| `order_items` | same as `orders` | **⛔ role-blind** | `[ ]` **CRITICAL** |
| `order_status_history` | same as `orders` | **⛔ role-blind** | `[ ]` **CRITICAL** |
| **`analytics_events`** | anon INSERT (intentional, whitelisted event types); authenticated `for all using(true) with check(true)` — **no profile role check** | **⛔ role-blind** | `[ ]` **CRITICAL** |
| `storage.objects` | public read; authenticated INSERT/UPDATE/DELETE in `product-images`/`feed-media`/`store-assets`/`prompt-assets` (bucket-only check) | **⛔ role-blind** (`to authenticated`, no profile role, no per-folder owner check) | `[ ]` **HIGH** |
| `feed` likes/comments/saves (public social) | tables in `2026090317…`, `2026090514…` — need body re-read; public-write may be intentional | verify | `[~]` |
| Legacy `admin_invitations` | "Owner manage admin invitations" — **superseded**, zero client refs | — | `[→]` drop |

### Critical / High actions (do first)
- `[ ]` **Rewrite `orders` / `order_items` / `order_status_history` policies** to the `exists(select 1 from profiles p2 where p2.id=auth.uid() and p2.role in ('owner','admin'))` pattern (same as products). *Why:* any authenticated Supabase user (pre-existing accounts, OAuth edge cases, future consumer auth) currently gets full read/write over all orders.
- `[ ]` **Rewrite `analytics_events`** admin policy to that same role check (read/manage only owner/admin; keep anon INSERT as-is with the whitelist `with check`). *Why:* the axe the roadmap asked about — admin read must stay protected; today any authenticated user can read/delete all analytics.
- `[ ]` **Restrict `storage.objects` writes** to owner/admin and to the correct folder prefix (e.g., `bucket_id='feed-media' and (storage.foldername(name))[1]='feed-media'`), never bare `to authenticated` for write.

### Data-governance gap (no DB table at all → no RLS)
- `[~]` **Campaigns** (`listCampaigns()` in `src/lib/admin/ops.ts`), **buy sessions** (`BuySessionContext`), **in-store sale records**, and **activity logs** (`StoreContext.logActivity` → `activityLogs`) are **client-side only** (localStorage). They are admin-administered but have no DB row → no RLS, no cross-device truth, tamperable in localStorage, and invisible to the immutable audit. Move to Supabase tables when scheduling; medium priority (business continuity, not auth).

---

## 6. Audit Logging & Security Events

`auth_audit_log` stores (immutable, insert-only): actor_id, actor_email, action, entity, entity_id, metadata, ip, user_agent, created_at.

| Event | login_history (auth events) | auth_audit_log (business) | Wired today |
|---|---|---|---|
| login success / failure | `[x]` | — | `[x]` |
| OTP requested / verified / resent | `[x]` | — | `[x]` |
| Google login | `[x]` (`oauth_login`) | — | `[~]` success path in callback, failure path in `loginGoogle` |
| password login | `[x]` (`login_success`) | — | `[x]` |
| password changed | ID not fired | `[x]` (`password_changed`) | `[~]` audit only, no login_history row |
| password reset | reserved `[ ]` (no flow) | — | `[ ]` |
| logout | `[x]` | — | `[~]` fire-and-forget (`void`), not awaited |
| session revoked (logout everywhere) | `[x]` | — | `[x]` |
| admin invited / approved / revoked | — | `invite_created` / `invite_revoked` (used/approved implicitly) | `[x]` |
| authorization denied | `[ ]` (`login_failure` w/ reason only) | `[ ]` | `[ ]` |
| owner-protection attempt | `[ ]` | `[ ]` | `[ ]` — no audit on trigger denial |
| suspicious auth activity | `[~]` limited | `[ ]` | `[ ]` |
| product deleted / campaign published / store updated / analytics exported | — | `[ ]` | **`[ ]` — routed only to localStorage `activityLogs`** |

### Rules
- `[x]` Never log passwords, OTP codes, tokens, refresh tokens, id tokens, or secrets. Verified: metadata only ever carries reasons/emails; `verifyOtp` does **not** store the code; Supabase error `message` strings are stored (safe, e.g. "Invalid login credentials").
- `[ ]` Wire business audit calls (`logBusinessAudit`) into the destructive admin mutations (product delete/src pages, campaign publish, store update, analytics export) so they join the immutable trail.
- `[ ]` Consider logging owner-protection trigger denials from the trigger itself (SECURITY DEFINER → `rpc_auth_audit`), and auth-gate denials with `signup_blocked`.

---

## 7. Abuse Protection

Current (verified):
- DB rolling-window limiters (`auth_rate_limits` + `rpc_auth_try_attempt`/`record`) for buckets `login_password`, `login_otp`, `resend_otp`, `google_oauth`; granted to anon so pre-login paths are protected.
- 60 s local resend cooldown (`localCooldownMs`).
- Supabase dashboard throttling = the outer layer (config, not code).
- Signup gate blocks arbitrary registration at DB level.

Future hardening:
- `[ ]` `invite_create` rate bucket / server cap (invite abuse) — Priority: Medium.
- `[ ]` OTP request + failed-login throttles tuned for prod SMTP (current 5/5 min is strict for a real admin) — Priority: Medium.
- `[ ]` Suspicious repeated-attempt alerts (e.g., N failures from one email/IP in 1 h → flag in `SecurityPage`) — Priority: Low.
- `[ ]` Prefer Supabase-native + server-side mechanisms; the DB RPC limiter already is. Never move primary rate limiting to the frontend.

---

## 8. Admin UI Identity

**Discovered issue:** the admin sidebar footer hardcoded a role label:

```tsx
<p className="text-[10px] text-muted-foreground truncate leading-tight">Administrator</p>
```

**Current state (fixed this phase):** now conditional, `src/components/admin/AdminSidebar.tsx:262`:

```tsx
{user?.isOwner ? 'Platforma egasi' : 'Administrator'}
```

This removed the bare constant, but the non-owner half is still a literal string and not derived from the actual role.

**Intended behavior:**
- Platform owner → show authenticated identity + role label **"Platform Owner"**
- Other approved admins → show their actual authenticated identity + **actual role label**

**Remaining occurrences to address:**
- `[~]` `AdminSidebar.tsx:262` — non-owner label constant; map via the role → label table once manager/staff/editor exist. The reusable pattern already exists: `ROLE_META` in `src/pages/admin/AdminsPage.tsx:45-53`.
- `[~]` `AuthContext.tsx:359` — `adminUsername = user?.username || 'admin'`; fallback literal `'admin'`.
- `[~]` Non-identity but worth a sweep: `SettingsAdminPage` "Admin Sozlamalari…", `StoreAdminPage` "Administrator E-pochtasi" / "Telegram Administrator" (these are store-settings field labels, not identity — leave, but confirm during the sweep).
- `[x]` `SecurityPage` device card already uses real identity; `AdminsPage` uses `ROLE_META` (role-derived) — good pattern to copy.

---

## 9. Future Admin Management (deferred)

Already implemented: owner-only allowlist management, add approved email, revoke invite, member role change (owner→staff, non-owner only), suspend/unsuspend, member last-login display, owner card.

Deferred (do NOT build now):
- `[→]` Reactivate/expire invites (expiration policy)
- `[→]` Admin status dashboard (active/inactive, last login per admin)
- `[→]` Admin activity feed (per-user audit history UI)
- `[→]` Manager / Staff / Support role workflows (infra-ready, not built)

---

## 10. Security Secrets

Checklist (verified where possible):
- `[x]` No Supabase **service-role** key in the frontend (client uses `VITE_SUPABASE_PUBLISHABLE_KEY` only).
- `[x]` No private API keys in source. `.env.example` contains only placeholders + the (non-secret) owner email + commented-out secret lines.
- `[x]` `.env` and `.env.*` gitignored (`.gitignore:7-9`), `.env.example` exceptions.
- `[x]` Production bundle scan: `dist/assets/supabase-*.js` only contains the supabase-js *constant* `"sb_secret_"` (prefix detector in library code) — **no real secret value**.
- `[x]` Netlify: `netlify.toml` `SECRETS_SCAN_OMIT_KEYS` lists only public infra vars; real values go in the dashboard; `SITE_URL` needs the production domain to be set.
- `[ ]` Netlify `SITE_URL` is empty — set to the production domain (also feeds PKCE redirects).
- `[ ]` Verify OAuth redirect URL list in Supabase includes the production origin.
- `[ ]` Confirm Postgres "Connection pooling" / API keys page disables the deprecated legacy `sb_publishable_` if unused (optional cleanup).
- `[ ]` enable/keep secret scanning ON; never disable it to pass a deploy.
- `[ ]` If a secret was ever committed, rotate + purge git history — not applicable yet, keep on checklist.

---

## 11. Testing Matrix (future manual QA)

### Platform owner (`mrxcyb3r@proton.me`)
- Login with email OTP (needs SMTP) → success, role = owner, `is_owner=true`.
- Optional password login → success.
- Google login when enabled → success; allowlist not consulted for owner.
- Refresh the page → identity restored from `rpc_my_profile`, no `/login` bounce (see §13 flash item).
- Close/reopen browser → session restored; on expiry → clean logout.
- Logout → back to `/login`; every other tab logs out too.
- Access admin deep link logged out → `/login`; after login → lands on the deep link (see §3 gap: OTP/Google paths currently hardcode `/admin`).
- Attempt unauthorized admin actions → blocked by RLS/Capability.
- Verify owner cannot be removed/banned/demoted from `AdminsPage` (controls disabled) and directly via SQL (RSL denial + trigger error).

### Approved admin (invited email)
- Register/login with approved email → invite consumed (`used`), role `admin`.
- OTP login → success.
- Password login if enabled → success.
- Google with approved email → success.
- Google with non-approved email → signup gate raises → access denied.
- Access protected admin routes → full admin read/write.
- Attempt owner-management actions → hidden (sidebar) + RLS-denied at DB.
- Logout / session expiry → clean.

### Non-approved user
- Normal customer account / unapproved email / unapproved Google → DB gate blocks account creation (`Databaza/platform ruxsatisiz kirish bloklandi`).
- Direct `/admin` access → `/login`.
- Direct protected action (e.g., RPC/table call) → RLS denial.
- Attempt role manipulation (update own `profiles.role`) → policy `own profile update` blocks.

### Security
- Manipulate localStorage roles/identity → no effect (identity from `rpc_my_profile`).
- Direct Supabase requests as a random authenticated user → **orders / analytics_events fail** (after §5 fix); before the fix they succeed → do not ship without fixing.
- Test expired session → auto sign-out + audit `session_expired`.
- Test invalid OTP → error, `otp_verify success:false` recorded.
- Test repeated OTP requests → `resend_otp`/`login_otp` buckets trip; cooldown UI shows.
- Test unauthorized mutations (like/comment/order endpoints) → RLS denial.

---

## 12. Future Enhancements — Explicitly Deferred

`[→]` not required now, revisit only if the product grows:
- Complex staff management (« команда »-style)
- Manager/editor role *workflows* (infra is ready, UI is not)
- Multi-tenant enterprise authorization
- SSO / enterprise identity providers
- Advanced 2FA / MFA (TOTP, WebAuthn)
- SCIM
- Enterprise audit/compliance dashboards
- Complicated per-device/session management

---

## 13. Next Recommended Phase

**Task: Fix the role-blind RLS policies on `orders`, `order_items`, `order_status_history`, and `analytics_events`; then tighten `storage.objects` writes. (Section 5 changes.)**

*Why this and not a bigger feature:*
1. **Security vulnerability first** — the roadmap's priority list puts vulnerabilities above everything else. These four policies (`for all using (auth.role()='authenticated')`, no `profiles` role check, analytics even `using(true)/with check(true)`) mean **any authenticated Supabase user can read, modify, or delete all orders, order status history, and all analytics**, and write/delete any media in the configured buckets. The Phase 15 signup gate reduces exposure, but defense-in-depth is a stated requirement, and a future consumer-auth feature would instantly become a critical hole.
2. Small, high-certainty change — the correct pattern already exists on `products`/`categories` (`exists(select 1 from profiles where id=auth.uid() and role in ('owner','admin'))`); it's a re-write, not new architecture.
3. Unblocks everything else — proof that role-based RLS works end-to-end before adding Manager/Staff roles.

Same-session follow-ups (do after the fix): wire `logBusinessAudit` into destructive admin mutations (§6), add the session-expiry banner (§3/§1), and fix the deep-link + flash issues (§3).

**Explicitly NOT this phase:** support roles UI, invitation expiration, 2FA, multi-tenant.

---

## 14. Implementation Rules for Future OpenCode Sessions

1. Inspect the existing implementation first (this file + the files it references).
2. Inspect Supabase schema and migrations (`supabase/migrations/`, newest prefix = `20260909…`).
3. Inspect RLS policies *before and after* any change.
4. Inspect auth/session behavior (`AuthContext`, `lib/auth/*`, `AdminRoute`).
5. Reuse the existing architecture (`permissions.ts`, `rpc_*` security-definer functions, `ROLE_META` label map, `ConfirmDialog`, admin page layout).
6. Do NOT create a duplicate auth system.
7. Do NOT trust client-side roles or localStorage for any authorization decision.
8. Do NOT expose service-role/private secrets; never print real env values.
9. Preserve existing admin functionality (login, settings, store CMS, catalog, analytics).
10. Test the complete runtime flow (login → deep-link → reload → logout → cross-tab).
11. Run `npm run lint` (tsc --noEmit) and `npm run build` before finishing.
12. Check for regressions (run the scripts and the key flows in §11).
13. Report exact files/migrations changed.
14. Report remaining risks.

---

# Continuation Prompt

> **Use this in a future session to continue the Advanced Admin Auth work.**

```text
Goal: continue the Advanced Admin Authentication & Authorization work from the roadmap.

START BY READING docs/ADMIN_AUTH_ROADMAP.md.

Then:
1. Inspect the current implementation — do not trust the doc alone; verify what has changed
   since it was written (git status/diff, migration prefixes, RLS policies).
2. Identify the highest-priority incomplete item (check the §13 recommendation first:
   role-blind RLS on orders/analytics_events, then storage.objects).
3. Verify it still needs work (re-read the actual policies in supabase/migrations/).
4. Implement ONLY that one item. Do not batch unrelated features.
5. Preserve all existing admin functionality and the Phase 15 auth architecture
   (PKCE, rpc_my_profile identity, signup gate, owner immutability, permissions.ts).
6. Write a migration following docs/MIGRATIONS.md rules (newest UTC prefix, re-runnable,
   drop-before-create policies) and update the client where needed.
7. Test the runtime behavior: affected flows from §11 (login, admin access, RLS denial
   for a non-owner authenticated user).
8. Run npm run lint (tsc --noEmit) and npm run build.
9. Update docs/ADMIN_AUTH_ROADMAP.md: flip the completed checkboxes, note exact files/migrations
   changed, and note any new risks.
10. Report exactly: files/migrations changed, what remains, and any Critical/High findings.
```