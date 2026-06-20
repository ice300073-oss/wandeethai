-- ============================================================
-- WanDeeThai — Migration: ระบบรายงานประกาศ (กันมิจฉาชีพ)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid references listings(id) on delete cascade,
  reporter_id uuid references auth.users on delete set null,
  reason      text not null,
  status      text default 'open',   -- open | reviewed | dismissed
  created_at  timestamptz default now()
);

alter table reports enable row level security;

-- ใครก็รายงานได้ (ล็อกอินแล้ว) แต่ดู/จัดการได้เฉพาะแอดมิน
drop policy if exists reports_insert on reports;
create policy reports_insert on reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists reports_admin on reports;
create policy reports_admin on reports for select
  using ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com'));
