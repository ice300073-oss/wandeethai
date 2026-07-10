-- ============================================================
-- WanDeeThai — Migration: อัปโหลดรูป QR รับเงินเอง
-- สำหรับเจ้าของที่ไม่มีเลขพร้อมเพย์ส่วนตัว (เช่น บัญชีหน่วยงาน/องค์กร)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

alter table profiles add column if not exists qr_image_url text;

insert into storage.buckets (id, name, public) values
  ('payment-qr', 'payment-qr', true)
on conflict (id) do nothing;

drop policy if exists "qr_read"  on storage.objects;
drop policy if exists "qr_write" on storage.objects;
create policy "qr_read"  on storage.objects for select
  using ( bucket_id = 'payment-qr' );
create policy "qr_write" on storage.objects for insert
  with check ( bucket_id = 'payment-qr' and auth.role() = 'authenticated' );
