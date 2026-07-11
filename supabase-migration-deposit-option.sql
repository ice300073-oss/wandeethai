-- ============================================================
-- WanDeeThai — Migration: เลือกจ่ายมัดจำ 50% หรือเต็มจำนวน
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- ประเภทการจ่าย: 'full' = เต็มจำนวน, 'deposit' = จ่ายมัดจำ 50%
alter table bookings add column if not exists payment_type text default 'full';

-- ยอดที่จ่ายมาแล้วจริง (มัดจำ = ครึ่งเดียว, เต็ม = เท่า total_price)
alter table bookings add column if not exists amount_paid numeric(12,2) default 0;
