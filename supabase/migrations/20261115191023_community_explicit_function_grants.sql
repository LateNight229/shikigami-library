revoke execute on function public.heian_team_list(text,integer), public.heian_team_publish(text,text,text,text,jsonb), public.heian_team_like(uuid,boolean), public.heian_is_admin(), public.heian_team_moderate(uuid,boolean), public.heian_admin_list() from anon, authenticated;
grant execute on function public.heian_team_list(text,integer) to anon,authenticated;
grant execute on function public.heian_team_publish(text,text,text,text,jsonb), public.heian_team_like(uuid,boolean), public.heian_is_admin(), public.heian_team_moderate(uuid,boolean), public.heian_admin_list() to authenticated;
