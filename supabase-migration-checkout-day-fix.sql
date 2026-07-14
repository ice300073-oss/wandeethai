-- ============================================================
-- WanDeeThai — Fix: วันเช็คเอาท์ต้องว่างให้คนใหม่เช็คอินได้
-- เดิม date_range ใช้ '[]' (รวมวันเช็คเอาท์) ทำให้จองต่อวันไม่ได้
-- เปลี่ยนเป็น '[)' (นับเฉพาะคืนที่นอน ไม่รวมวันเช็คเอาท์)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- ต้อง drop constraint + column เดิมก่อน แล้วสร้างใหม่ด้วย '[)'
alter table bookings drop constraint if exists bookings_no_overlap;
alter table bookings drop column if exists date_range;

alter table bookings add column date_range daterange
  generated always as (daterange(start_date, end_date, '[)')) stored;

alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    listing_id with =,
    date_range with &&
  ) where (status in ('pending', 'confirmed', 'paid'));
