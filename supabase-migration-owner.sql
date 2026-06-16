-- ============================================================
-- WanDeeThai — Migration: PromptPay เจ้าของ(รับเงินตรง)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table profiles add column if not exists promptpay     text;
alter table profiles add column if not exists verify_status text default 'none';  -- none | pending | approved
