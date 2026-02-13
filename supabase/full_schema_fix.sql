
-- Copy and run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
    id text PRIMARY KEY,
    first_name text,
    username text,
    telegram_chat_id text,
    completed_tasks text[] DEFAULT '{}',
    subscription_tier text DEFAULT 'FREE',
    xp numeric DEFAULT 0,
    level numeric DEFAULT 1,
    stork_balance numeric DEFAULT 0,
    mining_rate numeric DEFAULT 0.01,
    last_claim_time text,
    storage_capacity numeric DEFAULT 8,
    last_active timestamp with time zone DEFAULT now(),
    role text DEFAULT 'USER',
    wallet_address text
);

-- Ensure RLS is active
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read, but restricted write (simplified for MVP)
DROP POLICY IF EXISTS "Public access" ON profiles;
CREATE POLICY "Public access" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- IMPORTANT: After running this, go to:
-- Project Settings -> API -> "Reload Schema Cache" (внизу сторінки)
