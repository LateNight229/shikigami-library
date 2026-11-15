create table heian_private.moderation_log (
  id bigint generated always as identity primary key,
  team_id uuid not null references heian_private.shared_teams(id),
  admin_id uuid not null references auth.users(id),
  action text not null check (action in ('hide','restore')),
  created_at timestamptz not null default now()
);
alter table heian_private.moderation_log enable row level security;
create or replace function public.heian_team_moderate(p_id uuid, p_hide boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.heian_is_admin() then raise exception 'Forbidden'; end if;
  if p_hide is null then raise exception 'Invalid action'; end if;
  update heian_private.shared_teams set hidden_at=case when p_hide then now() else null end where id=p_id;
  if not found then raise exception 'Team not found'; end if;
  insert into heian_private.moderation_log(team_id,admin_id,action) values(p_id,auth.uid(),case when p_hide then 'hide' else 'restore' end);
end $$;
