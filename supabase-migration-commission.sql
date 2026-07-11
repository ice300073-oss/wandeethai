-- ============================================================
-- WanDeeThai — Migration: ค่าคอมมิชชั่นหลังบ้าน (ลูกค้า/เจ้าของไม่เห็น)
-- คำนวณอัตโนมัติทุกครั้งที่มีการจอง เก็บไว้ดูเฉพาะแอดมิน
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- อัตราค่าคอม (%) ตั้งค่าได้จากแอดมิน > ตั้งค่าเว็บ
alter table site_settings add column if not exists commission_percent numeric(5,2) default 10;

-- ยอดค่าคอมต่อการจอง (คำนวณอัตโนมัติ ห้ามแก้จากฝั่งลูกค้า)
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

-- คำนวณย้อนหลังให้ booking เก่าที่มีอยู่แล้วด้วย
update bookings set commission_amount = round(coalesce(total_price, 0) * (
  select coalesce(commission_percent, 10) from site_settings where id = 1
) / 100, 2) where commission_amount is null;
