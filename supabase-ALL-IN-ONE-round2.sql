-- ============================================================
-- WanDeeThai — รวม SQL รอบนี้ทั้งหมดไว้ไฟล์เดียว (รันครั้งเดียวจบ)
-- ก็อปทั้งหมดนี้ → Supabase > SQL Editor > New query > วาง → Run
-- ============================================================

-- ---------- 0) ตาราง site_settings (พลาดตกหล่น ไม่เคยถูกสร้าง — ต้องมีก่อนขั้น 6,7) ----------
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
insert into site_settings (id) values (1) on conflict (id) do nothing;
alter table site_settings enable row level security;
drop policy if exists settings_read  on site_settings;
create policy settings_read  on site_settings for select using (true);
drop policy if exists settings_write on site_settings;
create policy settings_write on site_settings for update
  using ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com'));

-- ---------- 1) กันจองชนกันจริงจัง (DB-level) ----------
create extension if not exists btree_gist;

alter table bookings add column if not exists date_range daterange
  generated always as (daterange(start_date, end_date, '[]')) stored;

alter table bookings drop constraint if exists bookings_no_overlap;
alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    listing_id with =,
    date_range with &&
  ) where (status in ('pending', 'confirmed', 'paid'));

-- ---------- 2) เปิด Realtime (แชท/คอมเมนต์/การจอง อัปเดตสด) ----------
do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table comments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table bookings;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------- 3) อนุญาตให้ลบคอมเมนต์ได้ ----------
drop policy if exists comments_delete on comments;
create policy comments_delete on comments for delete
  using (
    auth.uid() = user_id
    or auth.uid() in (select owner_id from listings where listings.id = comments.listing_id)
  );

-- ---------- 4) เช็คอินลูกค้า (ตั๋ว/รหัสจอง) ----------
alter table bookings add column if not exists checked_in_at timestamptz;

-- ---------- 5) แจ้งปัญหาทั่วไป (ปุ่มลอย) ----------
alter table reports add column if not exists page_url text;

drop policy if exists reports_insert on reports;
create policy reports_insert on reports for insert
  with check (reporter_id is null or auth.uid() = reporter_id);

-- ---------- 6) ค่าคอมมิชชั่นหลังบ้าน (ซ่อนจากลูกค้า/เจ้าของ) ----------
alter table site_settings add column if not exists commission_percent numeric(5,2) default 10;
alter table bookings add column if not exists commission_amount numeric(12,2);

create or replace function calc_booking_commission()
returns trigger language plpgsql as $$
declare
  rate numeric;
begin
  select commission_percent into rate from site_settings where id = 1;
  new.commission_amount := round(coalesce(new.total_price, 0) * coalesce(rate, 10) / 100, 2);
  return new;
end;
$$;

drop trigger if exists trg_booking_commission on bookings;
create trigger trg_booking_commission
  before insert or update of total_price on bookings
  for each row execute procedure calc_booking_commission();

update bookings set commission_amount = round(coalesce(total_price, 0) * (
  select coalesce(commission_percent, 10) from site_settings where id = 1
) / 100, 2) where commission_amount is null;

-- ---------- 7) เปลี่ยนชื่อเว็บ/พื้นหลัง hero ได้จากแอดมิน ----------
alter table site_settings add column if not exists site_name  text;
alter table site_settings add column if not exists hero_bg_url text;

-- ============================================================
-- เสร็จแล้ว! ควรขึ้น "Success" — รีเฟรชเว็บดูผลได้เลย
-- ============================================================
