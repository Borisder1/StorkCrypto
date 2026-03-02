
-- 🔧 FIX DATABASE SCHEMA
-- Run this entire block in the Supabase SQL Editor

-- 1. Add missing columns to 'profiles' table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_chat_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_tasks text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level numeric DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stork_balance numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mining_rate numeric DEFAULT 0.01;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_claim_time text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_capacity numeric DEFAULT 8;

-- 2. Force Schema Cache Reload (Comment implies manual action usually needed via UI)
-- NOTE: Go to Project Settings -> API -> "Reload Schema Cache" if errors persist.
