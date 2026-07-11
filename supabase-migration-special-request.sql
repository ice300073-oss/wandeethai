-- ============================================================
-- WanDeeThai — Migration: คำขอพิเศษจากลูกค้า (special request)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table bookings add column if not exists special_request text;
