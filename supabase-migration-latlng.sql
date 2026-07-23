-- ============================================================
-- WanDeeThai — Migration: พิกัดที่พัก (ปักหมุดเป๊ะ)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table listings add column if not exists lat double precision;
alter table listings add column if not exists lng double precision;
