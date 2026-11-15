create function public.heian_team_search(p_sort text default 'recent',p_offset integer default 0,p_search text default '')
returns table(id uuid,title text,note text,category text,display_name text,slots jsonb,created_at timestamptz,like_count bigint,liked boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if p_sort not in ('recent','likes') or p_offset < 0 or p_offset > 10000 or char_length(coalesce(p_search,'')) > 80 then raise exception 'Invalid search'; end if;
  return query select t.id,t.title,t.note,t.category,t.display_name,t.slots,t.created_at,
    (select count(*) from heian_private.team_likes l where l.team_id=t.id),
    exists(select 1 from heian_private.team_likes l where l.team_id=t.id and l.user_id=auth.uid())
  from heian_private.shared_teams t
  where t.hidden_at is null and (coalesce(p_search,'')='' or position(lower(p_search) in lower(t.title))>0)
  order by case when p_sort='likes' then (select count(*) from heian_private.team_likes l where l.team_id=t.id) end desc,
    t.created_at desc,t.id desc limit 20 offset p_offset;
end $$;
revoke all on function public.heian_team_search(text,integer,text) from public,anon,authenticated;
grant execute on function public.heian_team_search(text,integer,text) to anon,authenticated;
