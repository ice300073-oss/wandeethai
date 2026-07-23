-- ============================================================
-- WanDeeThai — Migration: จุดเที่ยว/จุดปักหมุด (แอดมินเพิ่มเอง) สำหรับแผนที่เส้นทาง
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

create table if not exists attractions (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  emoji       text default '📍',
  description text,
  lat         double precision not null,
  lng         double precision not null,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

alter table attractions enable row level security;

-- อ่านได้ทุกคน (โชว์บนแผนที่), แก้ได้เฉพาะแอดมิน
drop policy if exists attractions_read on attractions;
create policy attractions_read on attractions for select using (true);

drop policy if exists attractions_admin_ins on attractions;
create policy attractions_admin_ins on attractions for insert
  with check ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com', 'admin@wandeethai.app'));

drop policy if exists attractions_admin_upd on attractions;
create policy attractions_admin_upd on attractions for update
  using ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com', 'admin@wandeethai.app'));

drop policy if exists attractions_admin_del on attractions;
create policy attractions_admin_del on attractions for delete
  using ((auth.jwt() ->> 'email') in ('ice300073@gmail.com', 'ice300074@gmail.com', 'admin@wandeethai.app'));

-- realtime (เพิ่มจุดแล้วเด้งขึ้นแผนที่เอง)
do $$
begin
  begin alter publication supabase_realtime add table attractions; exception when duplicate_object then null; end;
end $$;
