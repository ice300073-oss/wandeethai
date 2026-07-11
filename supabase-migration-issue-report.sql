-- ============================================================
-- WanDeeThai — Migration: แจ้งปัญหาทั่วไป (ปุ่มลอยทุกหน้า)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table reports add column if not exists page_url text;

-- อนุญาตให้แจ้งปัญหาได้แม้ไม่ได้ล็อกอิน (reporter_id เป็น null ได้)
drop policy if exists reports_insert on reports;
create policy reports_insert on reports for insert
  with check (reporter_id is null or auth.uid() = reporter_id);
