-- ============================================================
-- WanDeeThai — Migration: แจ้งเตือนในเว็บ (กระดิ่ง) หาเจ้าของเมื่อมีจอง/ชำระเงิน
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users on delete cascade,   -- ผู้รับ (เจ้าของที่พัก)
  type        text,        -- 'booking_new' | 'booking_paid'
  title       text,
  body        text,
  link        text,        -- ลิงก์ไปหน้าที่เกี่ยวข้อง
  booking_id  uuid,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

alter table notifications enable row level security;

-- เจ้าของอ่าน/อัปเดต (mark read) ได้เฉพาะของตัวเอง
drop policy if exists notif_select on notifications;
create policy notif_select on notifications for select using (auth.uid() = user_id);

drop policy if exists notif_update on notifications;
create policy notif_update on notifications for update using (auth.uid() = user_id);

-- ฟังก์ชันสร้างแจ้งเตือนหาเจ้าของ (SECURITY DEFINER — ข้าม RLS สร้างให้ user อื่นได้)
create or replace function notify_owner_on_booking()
returns trigger language plpgsql security definer as $$
declare
  owner  uuid;
  ltitle text;
  guest  text;
begin
  select owner_id, title into owner, ltitle from listings where id = NEW.listing_id;
  if owner is null then return NEW; end if;

  if (TG_OP = 'INSERT') then
    -- จองใหม่จากลูกค้าจริงเท่านั้น (ข้าม walk-in ที่เจ้าของสร้างเอง — renter_id เป็น null)
    if NEW.renter_id is null then return NEW; end if;
    guest := coalesce((select full_name from profiles where id = NEW.renter_id), NEW.guest_name, 'ลูกค้า');
    insert into notifications(user_id, type, title, body, link, booking_id)
    values (owner, 'booking_new', '📅 มีการจองใหม่',
            guest || ' จอง ' || ltitle || ' (' || NEW.start_date || ' → ' || NEW.end_date || ')',
            '/dashboard', NEW.id);

  elsif (TG_OP = 'UPDATE' and NEW.status = 'paid' and OLD.status is distinct from 'paid') then
    insert into notifications(user_id, type, title, body, link, booking_id)
    values (owner, 'booking_paid', '💳 ลูกค้าชำระเงินแล้ว',
            'มีลูกค้าชำระเงิน ' || ltitle || ' — รอคุณยืนยัน',
            '/dashboard', NEW.id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_owner on bookings;
create trigger trg_notify_owner
  after insert or update of status on bookings
  for each row execute procedure notify_owner_on_booking();

-- เปิด realtime ให้กระดิ่งเด้งสด
do $$
begin
  begin
    alter publication supabase_realtime add table notifications;
  exception when duplicate_object then null;
  end;
end $$;
