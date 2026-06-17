-- ============================================================
-- WanDeeThai — Migration: เพิ่ม ice300073@gmail.com เป็นแอดมิน
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

create or replace function set_host_verified(target_id uuid, val boolean)
returns void language plpgsql security definer as $$
begin
  if (auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com') then
    update profiles set is_verified = val where id = target_id;
  else
    raise exception 'not authorized';
  end if;
end;
$$;
grant execute on function set_host_verified(uuid, boolean) to authenticated;
