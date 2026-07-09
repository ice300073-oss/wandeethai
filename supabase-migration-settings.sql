-- ============================================================
-- WanDeeThai — Migration: ตั้งค่าเว็บ (แก้เองได้จากแอดมิน)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

create table if not exists site_settings (
  id            int primary key default 1,
  hero_title    text,
  hero_subtitle text,
  announcement  text,
  contact_line  text,
  contact_email text,
  contact_phone text,
  promptpay     text,
  updated_at    timestamptz default now(),
  constraint single_row check (id = 1)
);

-- สร้างแถวเดียว
insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

-- อ่านได้ทุกคน (หน้าแรกต้องอ่าน), แก้ได้เฉพาะแอดมิน
drop policy if exists settings_read  on site_settings;
create policy settings_read  on site_settings for select using (true);

drop policy if exists settings_write on site_settings;
create policy settings_write on site_settings for update
  using ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com'));
