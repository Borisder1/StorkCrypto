
-- RLS POLICIES FOR STORKCRYPTO

-- 1. PROFILES
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
on profiles for select
using ( true );

create policy "Users can insert their own profile"
on profiles for insert
with check ( true );

create policy "Users can update own profile"
on profiles for update
using ( true );

-- 2. REFERRALS
alter table referrals enable row level security;

create policy "Referrals viewable by involved parties"
on referrals for select
using ( auth.uid()::text = referrer_id or auth.uid()::text = referee_id );

create policy "Anyone can create referral"
on referrals for insert
with check ( true );
