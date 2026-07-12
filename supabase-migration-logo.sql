-- ============================================================
-- WanDeeThai — Migration: โลโก้ + สีธีม แก้จากแอดมิน (white-label)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table site_settings add column if not exists logo_url    text;
alter table site_settings add column if not exists theme_color text;   -- เช่น #f97316
