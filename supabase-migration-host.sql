-- ============================================================
-- WanDeeThai — Migration: เพิ่มฟิลด์โปรไฟล์สาธารณะ (หน้า /host/[id])
-- รันใน Supabase > SQL Editor (รันครั้งเดียว ถ้ายังไม่มีคอลัมน์เหล่านี้)
-- ============================================================

alter table profiles add column if not exists line_id     text;
alter table profiles add column if not exists facebook    text;
alter table profiles add column if not exists bio         text;
alter table profiles add column if not exists is_verified boolean default false;

-- ตั้งให้บัญชีตัวเองเป็น "ยืนยันแล้ว" (ตัวอย่าง — เปลี่ยน email เป็นของคุณ)
-- update profiles set is_verified = true
-- where id = (select id from auth.users where email = 'ice300074@gmail.com');
