alter table heian_private.shared_teams add column if not exists souls jsonb;
alter table heian_private.shared_teams add constraint shared_teams_souls_shape check (souls is null or (jsonb_typeof(souls) = 'array' and jsonb_array_length(souls) = 10 and octet_length(souls::text) <= 12000));
create or replace function public.heian_team_publish_with_souls(p_title text, p_note text, p_category text, p_display_name text, p_slots jsonb, p_souls jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid; v jsonb; st jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_souls is null or jsonb_typeof(p_souls) <> 'array' or jsonb_array_length(p_souls) <> 10 or octet_length(p_souls::text)>12000 then raise exception 'Invalid souls'; end if;
 for v in select value from jsonb_array_elements(p_souls) loop
  if v <> 'null'::jsonb then
   if jsonb_typeof(v)<>'object' or coalesce(v->>'soulId','') !~ '^[0-9]{1,8}$' or coalesce(v->>'secondaryId','') !~ '^([0-9]{1,8})?$' or char_length(coalesce(v->>'note',''))>500 or jsonb_typeof(v->'mainStats') is distinct from 'object' then raise exception 'Invalid soul build'; end if;
   st := v->'mainStats';
   if coalesce(st->>'2','?') not in ('','spd','atk','hp','def') or coalesce(st->>'4','?') not in ('','atk','hp','def','hit','res') or coalesce(st->>'6','?') not in ('','atk','hp','def','crit','critdmg') then raise exception 'Invalid soul stat'; end if;
  end if;
 end loop;
 result := public.heian_team_publish(p_title,p_note,p_category,p_display_name,p_slots);
 update heian_private.shared_teams set souls=p_souls where id=result and author_id=auth.uid();
 return result;
end $$;
create or replace function public.heian_team_souls(p_ids uuid[])
returns table(id uuid,souls jsonb) language plpgsql security definer set search_path = '' as $$
begin
 if p_ids is null or cardinality(p_ids)>20 then raise exception 'Invalid team IDs'; end if;
 return query select t.id,t.souls from heian_private.shared_teams t where t.hidden_at is null and t.id=any(p_ids);
end $$;
revoke all on function public.heian_team_publish_with_souls(text,text,text,text,jsonb,jsonb) from public,anon;
grant execute on function public.heian_team_publish_with_souls(text,text,text,text,jsonb,jsonb) to authenticated;
revoke all on function public.heian_team_souls(uuid[]) from public;
grant execute on function public.heian_team_souls(uuid[]) to anon,authenticated;
