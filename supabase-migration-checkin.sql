-- ============================================================
-- WanDeeThai — Migration: เช็คอินลูกค้า (ตั๋ว/รหัสจอง)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table bookings add column if not exists checked_in_at timestamptz;
