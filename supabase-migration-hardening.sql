-- ============================================================
-- WanDeeThai — Migration: กันจองชนกัน (DB-level) + realtime + ลบคอมเมนต์
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- ---------- 1) กันจองชนกันจริงจัง (กันแม้กดพร้อมกันเป๊ะๆ) ----------
-- ใช้ exclusion constraint ระดับฐานข้อมูล: ห้ามมี booking ที่ยัง active (pending/confirmed/paid)
-- ของ listing เดียวกัน วันที่ทับซ้อนกัน — การันตีแม้ recheck ฝั่งแอปจะพลาดจากการกดพร้อมกัน
create extension if not exists btree_gist;

alter table bookings add column if not exists date_range daterange
  generated always as (daterange(start_date, end_date, '[]')) stored;

alter table bookings drop constraint if exists bookings_no_overlap;
alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    listing_id with =,
    date_range with &&
  ) where (status in ('pending', 'confirmed', 'paid'));

-- ---------- 2) เปิด Realtime ให้ตารางที่ต้องอัปเดตสด (แชท/คอมเมนต์/การจอง) ----------
-- ครอบด้วย DO block กัน error ถ้าเพิ่มไปแล้ว (รันซ้ำได้)
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

-- ---------- 3) อนุญาตให้ลบคอมเมนต์ได้ (เจ้าของคอมเมนต์ หรือ เจ้าของที่พัก) ----------
drop policy if exists comments_delete on comments;
create policy comments_delete on comments for delete
  using (
    auth.uid() = user_id
    or auth.uid() in (select owner_id from listings where listings.id = comments.listing_id)
  );
