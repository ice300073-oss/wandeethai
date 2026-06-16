-- ============================================================
-- WanDeeThai — Migration: รายการโปรด (favorites) + ปุ่มอนุมัติ verified
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

-- ---------- FAVORITES (หัวใจบันทึกที่ชอบ) ----------
create table if not exists favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users on delete cascade,
  listing_id  uuid references listings(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, listing_id)
);

alter table favorites enable row level security;
drop policy if exists favorites_all on favorites;
create policy favorites_all on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- ฟังก์ชันอนุมัติยืนยันตัวตน (เฉพาะแอดมิน) ----------
-- ปลอดภัยกว่าเปิด RLS ให้แก้ profiles คนอื่น: เช็ค email แอดมินใน token
create or replace function set_host_verified(target_id uuid, val boolean)
returns void language plpgsql security definer as $$
begin
  if (auth.jwt() ->> 'email') = 'ice300074@gmail.com' then
    update profiles set is_verified = val where id = target_id;
  else
    raise exception 'not authorized';
  end if;
end;
$$;

grant execute on function set_host_verified(uuid, boolean) to authenticated;
