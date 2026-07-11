-- ============================================================
-- WanDeeThai — Migration: เปลี่ยนชื่อเว็บ/พื้นหลัง hero ได้จากแอดมิน
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table site_settings add column if not exists site_name  text;
alter table site_settings add column if not exists hero_bg_url text;
