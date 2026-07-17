-- ============================================================
-- WanDeeThai — FIX ความปลอดภัย: profiles เดิมเปิด public ทุกคอลัมน์
-- (ใครก็ดึงเบอร์/LINE ของทุกคนได้ → ผิด PDPA)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- 1) ล็อก base table: อ่านได้เฉพาะ ตัวเอง / แอดมิน / เจ้าของที่พักอ่านโปรไฟล์แขกที่จองห้องตัวเอง
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select using (
  auth.uid() = id
  or (auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com', 'admin@wandeethai.app')
  or exists (
    select 1 from bookings b
    join listings l on l.id = b.listing_id
    where b.renter_id = profiles.id and l.owner_id = auth.uid()
  )
);

-- 2) view สาธารณะ: เปิดเฉพาะข้อมูลปลอดภัย (ชื่อ/รูป/ยืนยัน/บ่อ) — ไม่มี เบอร์/พร้อมเพย์
--    LINE/FB เปิดเฉพาะ "เจ้าของที่พัก" (ธุรกิจ) ไม่เปิดของแขกทั่วไป
drop view if exists public_profiles;
create view public_profiles as
select
  p.id, p.full_name, p.avatar_url, p.is_verified, p.bio, p.created_at,
  case when exists (select 1 from listings l where l.owner_id = p.id) then p.line_id  else null end as line_id,
  case when exists (select 1 from listings l where l.owner_id = p.id) then p.facebook else null end as facebook
from profiles p;

grant select on public_profiles to anon, authenticated;

-- 3) RPC: ข้อมูลรับเงินของเจ้าของที่พัก (ให้หน้าจ่ายเงินใช้) — เปิดแค่ promptpay/qr ไม่เปิดเบอร์
create or replace function get_owner_payment(p_listing uuid)
returns table(promptpay text, qr_image_url text)
language sql security definer stable as $$
  select p.promptpay, p.qr_image_url
  from listings l join profiles p on p.id = l.owner_id
  where l.id = p_listing;
$$;
grant execute on function get_owner_payment(uuid) to anon, authenticated;
