# Supabase migration workflow

This project deploys Postgres changes through versioned SQL files in
`supabase/migrations/`. Production safety outranks CLI convenience: a green
`db push` is never the goal — correct schema + honest history is.

## The one rule

**Migration history metadata ≠ schema.** `migration repair` edits history rows;
it never executes SQL. Never mark a version applied unless its SQL verifiably ran,
never mark reverted unless its effects are verifiably gone.

## Naming and ordering

- `YYYYMMDDHHMMSS_short_description.sql`, UTC timestamp prefix. Files apply in
  lexical order — the prefix IS the order. Never reuse a prefix.
- One concern per file. Prefix the area: `analytics_`, `storage_`, `orders_`,
  `auth_`, `rls_`.
- Never edit a migration after it has been applied anywhere (prod, staging,
  teammate DB). Forward-fix with a new file instead.

## Safe patterns (required in every new migration)

```sql
create table if not exists public.foo (...);
create index if not exists foo_idx on public.foo (col);
alter table public.foo add column if not exists bar text;
drop policy if exists "name" on public.foo;
create policy "name" on public.foo ...;
create or replace function ...;
drop trigger if exists trg on public.foo;
create trigger trg ...;
```

Bare `CREATE POLICY`, bare `CREATE TRIGGER`, and `CREATE POLICY/TRIGGER
IF NOT EXISTS` (invalid Postgres syntax — the whole migration aborts) are
forbidden. See "Known defects" below for what happens otherwise.

## Pre-push checklist

1. `git status` clean; migration committed; prefix is newest in the folder.
2. `npx supabase migration list` — zero unexpected remote-only versions.
   If any appear, STOP: find their source before pushing.
3. `npx supabase db diff --linked` (or against staging) — review every line.
4. Apply to **staging first**, run the app smoke test, then prod.
5. Back up prod (Dashboard → Backups, Point-in-Time) before structural changes.

## Common mistakes (all observed in this repo's history)

- Pushing from a second machine without pulling/committing → remote-only
  versions nobody can reproduce (Sep 2026: 18 versions, contents unknown).
- Bare `CREATE POLICY` in 7 files → `db push` fails on existing DBs with
  "policy already exists".
- Invalid `CREATE POLICY/TRIGGER IF NOT EXISTS` → migration aborts entirely.
- Timestamp inversion (`20260610…` sorts before `20260901…`) → RLS applied
  before its tables; overlapping privilege models.
- Shrinking an allowlist mid-chain (`…03140000` dropped valid event types) →
  `ADD CONSTRAINT` validation fails on existing rows, or silently rejects
  future writes.
- Assuming history equals schema. Always verify with guard queries.

## Recovery

- Push failed midway: inspect which versions recorded in
  `supabase_migrations.schema_migrations`, fix the file FORWARD (new migration
  that drops/recreates idempotently), never edit the failed file if it applied
  anywhere.
- Diverged history: do NOT `repair --status reverted/applied` to silence the
  CLI. Recover the missing files from git/teammates, or dump remote schema
  (`supabase db dump`) and diff.
- Bad data written: restore via Dashboard backups, not inverse migrations.

## Analytics allowlist migration (20260907120000)

Converges `analytics_events_event_type_check` + the anon INSERT policy to
exactly the `AnalyticsEventType` union (31 values), preserving the
`visitor_id`/`session_id` length guards and all RLS semantics. Re-runnable.
Live-DB probes showed production already accepts the newer feed event types,
so this file converges rather than assumes the old 20-value state.

Guard (run before AND after applying):

```sql
select pg_get_constraintdef(oid) from pg_constraint
where conname = 'analytics_events_event_type_check';
select policyname, with_check from pg_policies
where tablename = 'analytics_events'
  and policyname = 'anon insert analytics events';
```

Pass = all listed types ⊆ the 31 in
`src/types/supabase-db.ts`, length guards present, no other policies touched.

## Known defects register (do not "fix" by editing applied files)

| File | Defect | Impact | Correct fix |
|---|---|---|---|
| `20260905130000` | `CREATE POLICY IF NOT EXISTS` ×4 (invalid syntax) | Whole file aborts; CMS anon-read hardening never lands | New forward migration with `DROP IF EXISTS` + `CREATE POLICY` |
| `20260906140503` | `CREATE TRIGGER IF NOT EXISTS` (invalid) + trigger before its function | File aborts | New forward migration, function first |
| 7 files | Bare `CREATE POLICY` (~62 total) | Re-push fails on existing DBs | Forward migrations adding `DROP IF EXISTS` guards (only where policy missing remotely — verify first) |
| `20260903140000` | Shrinks allowlist to 18 (drops dwell/share/unlike/comments) | Superseded — never apply after data exists | None (superseded by `…03150000` → `…07120000`) |
| `20260903160000` | Docs-only, references `media` bucket nothing uses | Dead | None (informational) |
| `20260903190000` | Drops FKs `…03170000` never created | No-op | None (harmless) |
| `20260610141013` | Sorts before `20260901…`; overlaps `…01081143` + `…06140503` policies | Privilege widening (two models active) | Audit effective policy set per table, then one consolidating forward migration |

## Staging / backup posture (recommended, not yet present)

- Create a staging Supabase project; link as `--linked` alternative; push there first.
- Nightly Dashboard backups + pre-migration manual backup for structural changes.
- Keep `supabase db dump --schema-only` snapshots in git tags before big changes.
