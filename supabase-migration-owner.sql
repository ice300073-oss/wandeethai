-- ============================================================
-- WanDeeThai — Migration: PromptPay เจ้าของ(รับเงินตรง)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table profiles add column if not exists promptpay text;
