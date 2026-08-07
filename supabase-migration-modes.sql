-- ============================================================
-- WanDeeThai — Migration: 2 แอปในเว็บเดียว (โหมด ท่องเที่ยว / เช่ารายเดือน)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- (A) แอดมินตั้งว่าเว็บนี้เปิดโหมดไหน: 'stay' | 'rent' | 'both'
alter table site_settings add column if not exists enabled_modes text default 'stay';

-- ประกาศแต่ละอันอยู่โหมดไหน: 'stay' = ที่พักท่องเที่ยว, 'rent' = เช่ารายเดือน
alter table listings add column if not exists mode text default 'stay';

-- ฟิลด์สำหรับโหมดเช่ารายเดือน (เฟส 2) — เก็บไว้พร้อมใช้
alter table listings add column if not exists rent_monthly     numeric(12,2);  -- ค่าเช่า/เดือน
alter table listings add column if not exists water_rate       numeric(10,2);  -- ค่าน้ำ (ต่อหน่วย/เหมา)
alter table listings add column if not exists electric_rate    numeric(10,2);  -- ค่าไฟต่อหน่วย
alter table listings add column if not exists common_fee       numeric(12,2);  -- ค่าส่วนกลาง/เดือน
alter table listings add column if not exists deposit_months   int default 2;  -- มัดจำกี่เดือน
alter table listings add column if not exists video_url        text;           -- วิดีโอทัวร์
