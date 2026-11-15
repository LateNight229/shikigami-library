-- Community team tables and RPCs.
create schema if not exists heian_private;
revoke all on schema heian_private from public, anon, authenticated;

create table heian_private.team_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table heian_private.shared_teams (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  title text not null check (char_length(trim(title)) between 1 and 80),
  note text not null default '' check (char_length(note) <= 1000),
  category text not null default '' check (category in ('','pvp','pve','other')),
  display_name text not null default '' check (char_length(display_name) <= 60),
  slots jsonb not null check (jsonb_typeof(slots) = 'array' and jsonb_array_length(slots) = 10),
  created_at timestamptz not null default now(),
  hidden_at timestamptz
);
create table heian_private.team_likes (
  team_id uuid not null references heian_private.shared_teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(team_id,user_id)
);
alter table heian_private.team_admins enable row level security;
alter table heian_private.shared_teams enable row level security;
alter table heian_private.team_likes enable row level security;
create index shared_teams_visible_recent on heian_private.shared_teams(created_at desc,id desc) where hidden_at is null;
create index shared_teams_author_recent on heian_private.shared_teams(author_id,created_at desc);

-- Only this narrow API is exposed. No user identifiers are returned in public lists.
create function public.heian_team_list(p_sort text default 'recent', p_offset integer default 0)
returns table(id uuid,title text,note text,category text,display_name text,slots jsonb,created_at timestamptz,like_count bigint,liked boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if p_sort not in ('recent','likes') or p_offset < 0 or p_offset > 10000 then raise exception 'Invalid pagination'; end if;
  return query select t.id,t.title,t.note,t.category,t.display_name,t.slots,t.created_at,
    (select count(*) from heian_private.team_likes l where l.team_id=t.id),
    exists(select 1 from heian_private.team_likes l where l.team_id=t.id and l.user_id=auth.uid())
  from heian_private.shared_teams t where t.hidden_at is null
  order by case when p_sort='likes' then (select count(*) from heian_private.team_likes l where l.team_id=t.id) end desc,
    t.created_at desc,t.id desc limit 20 offset p_offset;
end $$;

create function public.heian_team_publish(p_title text,p_note text,p_category text,p_display_name text,p_slots jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_slots is null or jsonb_typeof(p_slots) <> 'array' or jsonb_array_length(p_slots) <> 10 then raise exception 'Invalid slots'; end if;
  if exists(select 1 from jsonb_array_elements(p_slots) s where s <> 'null'::jsonb and (jsonb_typeof(s) <> 'string' or (s #>> '{}') !~ '^[0-9]{1,8}$')) then raise exception 'Invalid hero ID'; end if;
  if not exists(select 1 from jsonb_array_elements(p_slots) s where s <> 'null'::jsonb) then raise exception 'Team is empty'; end if;
  if (select count(*) from heian_private.shared_teams where author_id=v_user and created_at > now()-interval '10 minutes') >= 5 then raise exception 'Rate limit'; end if;
  insert into heian_private.shared_teams(author_id,title,note,category,display_name,slots)
    values(v_user,trim(p_title),coalesce(p_note,''),coalesce(p_category,''),coalesce(p_display_name,''),p_slots) returning id into result;
  return result;
end $$;

create function public.heian_team_like(p_id uuid, p_liked boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from heian_private.shared_teams where id=p_id and hidden_at is null) then raise exception 'Team not found'; end if;
  if p_liked then insert into heian_private.team_likes(team_id,user_id) values(p_id,v_user) on conflict do nothing;
  else delete from heian_private.team_likes where team_id=p_id and user_id=v_user; end if;
  return p_liked;
end $$;

create function public.heian_is_admin() returns boolean language sql security definer set search_path = '' as $$
  select auth.uid() is not null and exists(select 1 from heian_private.team_admins a where a.user_id=auth.uid())
$$;
create function public.heian_team_moderate(p_id uuid, p_hide boolean) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.heian_is_admin() then raise exception 'Forbidden'; end if;
  update heian_private.shared_teams set hidden_at=case when p_hide then now() else null end where id=p_id;
end $$;
create function public.heian_admin_list() returns table(id uuid,title text,note text,created_at timestamptz,hidden_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.heian_is_admin() then raise exception 'Forbidden'; end if;
  return query select t.id,t.title,t.note,t.created_at,t.hidden_at from heian_private.shared_teams t order by t.created_at desc,t.id desc limit 100;
end $$;

revoke all on function public.heian_team_list(text,integer) from public;
revoke all on function public.heian_team_publish(text,text,text,text,jsonb) from public;
revoke all on function public.heian_team_like(uuid,boolean) from public;
revoke all on function public.heian_is_admin() from public;
revoke all on function public.heian_team_moderate(uuid,boolean) from public;
revoke all on function public.heian_admin_list() from public;
grant execute on function public.heian_team_list(text,integer) to anon,authenticated;
grant execute on function public.heian_team_publish(text,text,text,text,jsonb) to authenticated;
grant execute on function public.heian_team_like(uuid,boolean) to authenticated;
grant execute on function public.heian_is_admin() to authenticated;
grant execute on function public.heian_team_moderate(uuid,boolean) to authenticated;
grant execute on function public.heian_admin_list() to authenticated;
