-- ============================================================
-- WanDeeThai — Database Schema (ฉบับเต็ม ตรงกับโค้ดทุกหน้า)
-- รันใน Supabase Dashboard > SQL Editor > New Query > Run
-- โปรเจค Supabase: iledkzfrududfepistio (บัญชีใหม่ของ WanDeeThai)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text default 'renter',          -- 'renter' | 'host'
  full_name   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz default now()
);

-- สร้าง profile อัตโนมัติเมื่อสมัครสมาชิก
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- LISTINGS ----------
create table if not exists listings (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid references auth.users on delete cascade,
  title            text not null,
  description      text,
  category         text,                        -- homestay|villa|hotel|resort|guesthouse|guide
  price_per_day    numeric(12,2),
  price_per_month  numeric(12,2),
  rental_type      text default 'daily',
  min_stay_days    int,
  max_guests       int,
  location         text,
  is_available     boolean default true,
  images           text[] default '{}',
  details          jsonb,
  created_at       timestamptz default now()
);

-- ---------- BOOKINGS ----------
create table if not exists bookings (
  id                uuid primary key default uuid_generate_v4(),
  listing_id        uuid references listings(id) on delete cascade,
  renter_id         uuid references auth.users on delete cascade,
  start_date        date not null,
  end_date          date not null,
  total_price       numeric(12,2),
  status            text default 'pending',     -- pending|paid|confirmed|cancelled|completed
  slip_url          text,
  deposit_amount    numeric(12,2),
  insurance_amount  numeric(12,2),
  deposit_status    text,                        -- pending|paid|returned|disputed
  deposit_returned  boolean default false,
  damage_report     text,
  created_at        timestamptz default now()
);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete cascade,
  reviewer_id  uuid references auth.users on delete cascade,
  booking_id   uuid references bookings(id) on delete set null,
  rating       int check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);

-- ---------- COMMENTS (ถาม-ตอบใต้ประกาศ) ----------
create table if not exists comments (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete cascade,
  user_id      uuid references auth.users on delete cascade,
  content      text not null,
  created_at   timestamptz default now()
);

-- ---------- MESSAGES (แชท) ----------
create table if not exists messages (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete cascade,
  sender_id    uuid references auth.users on delete cascade,
  receiver_id  uuid references auth.users on delete cascade,
  content      text not null,
  created_at   timestamptz default now()
);

-- ---------- LISTING_VIEWS (นับยอดเข้าชม) ----------
create table if not exists listing_views (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete cascade,
  viewer_id    uuid,
  created_at   timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles      enable row level security;
alter table listings      enable row level security;
alter table bookings      enable row level security;
alter table reviews       enable row level security;
alter table comments      enable row level security;
alter table messages      enable row level security;
alter table listing_views enable row level security;

-- PROFILES: อ่านได้ทุกคน, แก้ของตัวเอง
drop policy if exists profiles_read   on profiles;
drop policy if exists profiles_write  on profiles;
drop policy if exists profiles_insert on profiles;
create policy profiles_read   on profiles for select using (true);
create policy profiles_insert on profiles for insert with check (auth.uid() = id);
create policy profiles_write  on profiles for update using (auth.uid() = id);

-- LISTINGS: อ่านได้ทุกคน, เจ้าของจัดการของตัวเอง
drop policy if exists listings_read   on listings;
drop policy if exists listings_insert on listings;
drop policy if exists listings_update on listings;
drop policy if exists listings_delete on listings;
create policy listings_read   on listings for select using (true);
create policy listings_insert on listings for insert with check (auth.uid() = owner_id);
create policy listings_update on listings for update using (auth.uid() = owner_id);
create policy listings_delete on listings for delete using (auth.uid() = owner_id);

-- BOOKINGS: ผู้เช่า + เจ้าของที่พักเห็น/แก้ได้
drop policy if exists bookings_select on bookings;
drop policy if exists bookings_insert on bookings;
drop policy if exists bookings_update on bookings;
create policy bookings_select on bookings for select using (
  auth.uid() = renter_id
  or auth.uid() in (select owner_id from listings where listings.id = bookings.listing_id)
);
create policy bookings_insert on bookings for insert with check (auth.uid() = renter_id);
create policy bookings_update on bookings for update using (
  auth.uid() = renter_id
  or auth.uid() in (select owner_id from listings where listings.id = bookings.listing_id)
);

-- REVIEWS: อ่านได้ทุกคน, เขียนเป็นของตัวเอง
drop policy if exists reviews_read   on reviews;
drop policy if exists reviews_insert on reviews;
create policy reviews_read   on reviews for select using (true);
create policy reviews_insert on reviews for insert with check (auth.uid() = reviewer_id);

-- COMMENTS: อ่านได้ทุกคน, เขียนเป็นของตัวเอง
drop policy if exists comments_read   on comments;
drop policy if exists comments_insert on comments;
create policy comments_read   on comments for select using (true);
create policy comments_insert on comments for insert with check (auth.uid() = user_id);

-- MESSAGES: เห็นเฉพาะคู่สนทนา, ส่งเป็นของตัวเอง
drop policy if exists messages_select on messages;
drop policy if exists messages_insert on messages;
create policy messages_select on messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy messages_insert on messages for insert with check (auth.uid() = sender_id);

-- LISTING_VIEWS: อ่าน/นับได้ทุกคน, เพิ่ม view ได้ทุกคน
drop policy if exists views_read   on listing_views;
drop policy if exists views_insert on listing_views;
create policy views_read   on listing_views for select using (true);
create policy views_insert on listing_views for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS (รูปภาพ / สลิป / เอกสารยืนยันตัวตน)
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('listing-images', 'listing-images', true),
  ('slips',          'slips',          true),
  ('verifications',  'verifications',  false)
on conflict (id) do nothing;

-- listing-images: ใครก็อ่านได้, ผู้ล็อกอินอัปโหลดได้
drop policy if exists "listing_images_read"   on storage.objects;
drop policy if exists "listing_images_write"  on storage.objects;
create policy "listing_images_read"  on storage.objects for select
  using ( bucket_id = 'listing-images' );
create policy "listing_images_write" on storage.objects for insert
  with check ( bucket_id = 'listing-images' and auth.role() = 'authenticated' );

-- slips: ผู้ล็อกอินอ่าน/อัปโหลดได้
drop policy if exists "slips_read"  on storage.objects;
drop policy if exists "slips_write" on storage.objects;
create policy "slips_read"  on storage.objects for select
  using ( bucket_id = 'slips' and auth.role() = 'authenticated' );
create policy "slips_write" on storage.objects for insert
  with check ( bucket_id = 'slips' and auth.role() = 'authenticated' );

-- verifications: ผู้ล็อกอินอ่าน/อัปโหลดได้ (ส่วนตัว)
drop policy if exists "verif_read"  on storage.objects;
drop policy if exists "verif_write" on storage.objects;
create policy "verif_read"  on storage.objects for select
  using ( bucket_id = 'verifications' and auth.role() = 'authenticated' );
create policy "verif_write" on storage.objects for insert
  with check ( bucket_id = 'verifications' and auth.role() = 'authenticated' );

-- ============================================================
-- เสร็จแล้ว! ควรขึ้น "Success. No rows returned"
-- ============================================================
