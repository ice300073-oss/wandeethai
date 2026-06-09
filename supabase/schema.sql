-- ============================================================
-- WanDeeThai — Database Schema
-- รัน SQL นี้ใน Supabase > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---- CATEGORIES ----
create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  icon       text default '🏡'
);

insert into categories (name, slug, icon) values
  ('โฮมสเตย์',    'homestay',    '🏡'),
  ('แคมป์ปิ้ง',   'camping',     '⛺'),
  ('โรงแรม',      'hotel',       '🏨'),
  ('รีสอร์ท',     'resort',      '🌿'),
  ('เกสต์เฮาส์',  'guesthouse',  '🎒'),
  ('วิลล่า',      'villa',       '🏖️')
on conflict (slug) do nothing;

-- ---- USERS / PROFILES ----
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  bio         text,
  is_host     boolean default false,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---- LISTINGS ----
create table if not exists listings (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid references profiles(id) on delete cascade,
  category_id      uuid references categories(id),
  title            text not null,
  description      text,
  province         text not null,
  address          text,
  price_per_night  numeric(10,2) not null,
  max_guests       int default 1,
  images           text[] default '{}',
  amenities        text[] default '{}',
  is_active        boolean default true,
  rating_avg       numeric(3,2) default 0,
  review_count     int default 0,
  created_at       timestamptz default now()
);

-- ---- BOOKINGS ----
create table if not exists bookings (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references listings(id) on delete cascade,
  guest_id        uuid references profiles(id) on delete cascade,
  check_in        date not null,
  check_out       date not null,
  guests          int default 1,
  total_price     numeric(10,2) not null,
  status          text default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  payment_status  text default 'unpaid' check (payment_status in ('unpaid','paid')),
  created_at      timestamptz default now()
);

-- ---- REVIEWS ----
create table if not exists reviews (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid references listings(id) on delete cascade,
  reviewer_id  uuid references profiles(id) on delete cascade,
  booking_id   uuid references bookings(id),
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);

-- Auto-update listing rating after review
create or replace function update_listing_rating()
returns trigger language plpgsql as $$
begin
  update listings
  set
    rating_avg   = (select avg(rating) from reviews where listing_id = new.listing_id),
    review_count = (select count(*)    from reviews where listing_id = new.listing_id)
  where id = new.listing_id;
  return new;
end;
$$;

drop trigger if exists on_review_inserted on reviews;
create trigger on_review_inserted
  after insert on reviews
  for each row execute procedure update_listing_rating();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profiles  enable row level security;
alter table listings  enable row level security;
alter table bookings  enable row level security;
alter table reviews   enable row level security;

-- Profiles: users see all, edit own
create policy "profiles_read"  on profiles for select using (true);
create policy "profiles_write" on profiles for update using (auth.uid() = id);

-- Listings: anyone reads active, owner edits
create policy "listings_read"   on listings for select using (is_active = true);
create policy "listings_insert" on listings for insert with check (auth.uid() = owner_id);
create policy "listings_update" on listings for update using (auth.uid() = owner_id);

-- Bookings: guest and host see own
create policy "bookings_guest" on bookings for all using (auth.uid() = guest_id);

-- Reviews: anyone reads, reviewer writes
create policy "reviews_read"   on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (auth.uid() = reviewer_id);

-- Categories: public read
alter table categories enable row level security;
create policy "categories_read" on categories for select using (true);

-- ============================================================
-- Sample Data (Optional — ลบออกได้หลัง test)
-- ============================================================

-- insert sample listings ต้องมี owner ก่อน (สร้างหลัง login แล้ว)
