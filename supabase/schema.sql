
-- 🦅 STORKCRYPTO DATABASE SCHEMA v4.0 (SENTINEL & SECURITY UPGRADE)

-- 1. UPGRADE PROFILES (Add Task Tracking & Telegram ID)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='completed_tasks') then
    alter table profiles add column completed_tasks text[] default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='telegram_chat_id') then
    alter table profiles add column telegram_chat_id text;
  end if;
end $$;

-- 2. SYSTEM STATE (For Sentinel Memory)
create table if not exists system_state (
  key text primary key,
  value numeric,
  updated_at timestamp with time zone default now()
);

-- 3. SECURE TASK CLAIMING (Anti-Spam RPC)
create or replace function claim_task_reward(user_id_input text, task_id_input text, reward_amount numeric)
returns json as $$
declare
  profile_row profiles%rowtype;
begin
  -- Check user
  select * into profile_row from profiles where id = user_id_input;
  if not found then
    return json_build_object('success', false, 'message', 'User not found');
  end if;

  -- Check if task already completed
  if task_id_input = any(profile_row.completed_tasks) then
    return json_build_object('success', false, 'message', 'Task already claimed');
  end if;

  -- Execute Reward
  update profiles 
  set stork_balance = coalesce(stork_balance, 0) + reward_amount,
      xp = coalesce(xp, 0) + 50, -- XP Bonus
      completed_tasks = array_append(completed_tasks, task_id_input)
  where id = user_id_input;
  
  return json_build_object('success', true, 'new_balance', profile_row.stork_balance + reward_amount);
end;
$$ language plpgsql security definer;

-- 4. ENABLE CRON (Requires pg_cron extension on Supabase)
-- NOTE: Run 'create extension if not exists pg_cron' in Dashboard if needed.
-- Schedule Sentinel to run every 10 minutes
select
  cron.schedule(
    'sentinel-pulse',
    '*/10 * * * *', -- Every 10 mins
    $$
    select
      net.http_post(
          url:='https://ercabbqautbsktrgzbft.supabase.co/functions/v1/sentinel-bot',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      ) as request_id;
    $$
  );
