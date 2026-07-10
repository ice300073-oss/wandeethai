-- ============================================================
-- WanDeeThai — Migration: เครื่องมือเจ้าของ (walk-in booking + แก้จองชนกัน)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- 1) ชื่อผู้เข้าพักสำหรับการจองที่เจ้าของเพิ่มเอง (walk-in / จองทางโทร)
alter table bookings add column if not exists guest_name text;

-- 2) ให้ "เจ้าของที่พัก" เพิ่มการจองในที่พักของตัวเองได้ (นอกจากผู้เช่าเพิ่มเอง)
drop policy if exists bookings_owner_insert on bookings;
create policy bookings_owner_insert on bookings for insert
  with check (auth.uid() in (select owner_id from listings where listings.id = listing_id));

-- 3) ฟังก์ชันคืน "ช่วงวันที่ถูกจอง" ของที่พัก (เปิดให้ทุกคนอ่าน แต่เห็นแค่วันที่ ไม่เห็นข้อมูลส่วนตัว)
--    ใช้แก้บั๊ก: เดิม guest มองไม่เห็นวันที่คนอื่นจอง -> จองชนกันได้
create or replace function get_blocked_dates(p_listing uuid)
returns table(start_date date, end_date date)
language sql security definer stable as $$
  select b.start_date, b.end_date
  from bookings b
  where b.listing_id = p_listing
    and b.status in ('pending', 'confirmed', 'paid');
$$;
grant execute on function get_blocked_dates(uuid) to anon, authenticated;
