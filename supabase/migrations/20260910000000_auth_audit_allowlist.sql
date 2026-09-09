-- Migration: Auth — tighten rpc_auth_audit (allowlist + caller-role gate)
--
-- Forward-fix for 20260909030000. The previous rpc_auth_audit accepted
-- free-text actions from ANY authenticated user, which let customers write
-- arbitrary (potentially forged) rows into the immutable business audit trail.
--
-- Changes:
--   * p_action is restricted to the exact set produced by the admin client
--     (src/context/*, src/pages/admin/* via logBusinessAudit). Anything else
--     is rejected with an exception (client treats it as non-fatal).
--   * The caller MUST be an approved staff member (owner/admin/manager).
--   * 'users' entity actions (member management) additionally require OWNER.
--   * service_role (server-side, no auth.uid()) may still write allowlisted
--     actions; anon remains excluded by the existing execute grants.
--
-- Re-runnable; does not touch table data, constraints, or grants below.

create or replace function public.rpc_auth_audit(
  p_action text,
  p_entity text default 'auth',
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text := '';
  v_email text := '';
  v_ip text;
  v_allowed text[] := array[
    'password_changed',
    'invite_created', 'invite_revoked',
    'member_role_changed', 'member_suspended', 'member_unsuspended',
    'campaign_created', 'campaign_updated', 'campaign_deleted',
    'store_updated',
    'product_deleted',
    'analytics_exported',
    'feed_post_deleted',
    'homepage_published'
  ];
begin
  if v_uid is not null then
    select role, email into v_role, v_email
      from public.profiles where id = v_uid;
    -- Deny customers / unapproved actors: only staff may write business audit.
    if v_role is null or v_role not in ('owner', 'admin', 'manager') then
      raise exception 'rpc_auth_audit: insufficient privileges';
    end if;
    -- Member-management events are owner-only.
    if p_entity = 'users' and v_role <> 'owner' then
      raise exception 'rpc_auth_audit: owner-only entity';
    end if;
  end if;

  -- Only allowlist-defined actions enter the immutable trail.
  if not (p_action = any (v_allowed)) then
    raise exception 'rpc_auth_audit: action ''%'' not allowed', p_action;
  end if;

  v_ip := inet_client_addr()::text;

  insert into public.auth_audit_log (actor_id, actor_email, action, entity, entity_id, metadata, ip, user_agent)
  values (v_uid, v_email, p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb), nullif(v_ip, ''), nullif(p_user_agent, ''));
end
$$;

grant execute on function public.rpc_auth_audit(text, text, text, jsonb, text) to authenticated, service_role;
revoke execute on function public.rpc_auth_audit(text, text, text, jsonb, text) from anon;

comment on function public.rpc_auth_audit(text, text, text, jsonb, text) is
  'Immutable business audit trail. Staff-only + action allowlist; actor always derived from auth.uid(); no client can update or delete rows.';