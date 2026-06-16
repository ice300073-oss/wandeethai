-- ============================================================
-- WanDeeThai — รวมทุกอย่างในไฟล์เดียว (รันครั้งเดียวจบ)
-- ⚠️ ต้องรัน supabase-schema.sql (ตารางหลัก) ไปแล้วก่อนหน้านี้
-- รันใน Supabase > SQL Editor > New query > วาง > Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- 1) เพิ่มคอลัมน์โปรไฟล์สาธารณะ (หน้า /host) ----------
alter table profiles add column if not exists line_id     text;
alter table profiles add column if not exists facebook    text;
alter table profiles add column if not exists bio         text;
alter table profiles add column if not exists is_verified boolean default false;

-- ---------- 2) รายการโปรด (ปุ่มหัวใจ) ----------
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

-- ---------- 3) ฟังก์ชันอนุมัติยืนยันตัวตน (เฉพาะแอดมิน) ----------
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

-- ---------- 4) ที่พักตัวอย่าง 8 หลัง (ใส่เฉพาะถ้ายังไม่มีที่พักเลย) ----------
insert into listings
  (owner_id, title, description, category, price_per_day, location, max_guests, is_available, images, details)
select u.owner_id, seed.title, seed.description, seed.category, seed.price_per_day, seed.location, seed.max_guests, true, seed.images, seed.details
from (
  values
    ('โฮมสเตย์ริมนาดอย ปาย','บ้านไม้อบอุ่นกลางทุ่งนา วิวภูเขา 360 องศา ตื่นมารับหมอกยามเช้า','homestay',850,'แม่ฮ่องสอน',2,
      array['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["WiFi","ที่จอดรถ","อาหารเช้า","วิวภูเขา"],"bedrooms":1,"bathrooms":1}'::jsonb),
    ('พูลวิลล่าส่วนตัว เชียงใหม่','วิลล่าหรูพร้อมสระว่ายน้ำส่วนตัว ใกล้นิมมานเหมินทร์','villa',4500,'เชียงใหม่',6,
      array['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["สระว่ายน้ำ","WiFi","เครื่องปรับอากาศ","ที่จอดรถ","ครัว"],"bedrooms":3,"bathrooms":3}'::jsonb),
    ('โรงแรมบูทีคย่านเมืองเก่า ภูเก็ต','โรงแรมสไตล์ชิโน-โปรตุกีส ใจกลางย่านเมืองเก่า','hotel',1800,'ภูเก็ต',2,
      array['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["WiFi","เครื่องปรับอากาศ","อาหารเช้า","ทีวี"],"bedrooms":1,"bathrooms":1}'::jsonb),
    ('รีสอร์ทริมทะเล กระบี่','ตื่นมาเจอทะเลหน้าห้อง เล่นน้ำได้เลย พร้อมพายเรือคายัค','resort',3200,'กระบี่',4,
      array['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["วิวทะเล","สระว่ายน้ำ","WiFi","อาหารเช้า","ที่จอดรถ"],"bedrooms":1,"bathrooms":1}'::jsonb),
    ('เกสต์เฮาส์แบ็คแพ็คเกอร์ ใจกลางกรุง','ห้องสะอาด ราคาเบาๆ ใกล้ BTS เดินทางสะดวก','guesthouse',550,'กรุงเทพฯ',1,
      array['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["WiFi","เครื่องปรับอากาศ","ใกล้ BTS/MRT"],"bedrooms":1,"bathrooms":1}'::jsonb),
    ('โฮมสเตย์ชุมชนริมโขง เชียงราย','สัมผัสวิถีชีวิตริมแม่น้ำโขง อาหารพื้นเมืองอร่อย','homestay',700,'เชียงราย',3,
      array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["WiFi","อาหารเช้า","ริมแม่น้ำ","ที่จอดรถ"],"bedrooms":2,"bathrooms":1}'::jsonb),
    ('รีสอร์ทกลางสวน เขาใหญ่','บ้านพักท่ามกลางธรรมชาติ อากาศเย็นสบาย ใกล้คาเฟ่ดัง','resort',2400,'นครราชสีมา',4,
      array['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":["WiFi","ที่จอดรถ","วิวภูเขา","อาหารเช้า"],"bedrooms":2,"bathrooms":2}'::jsonb),
    ('ไกด์ท้องถิ่นพาเที่ยวเชียงใหม่','ไกด์ท้องถิ่นพาตะลุยที่เที่ยวลับเฉพาะคนใน วัด ตลาด คาเฟ่ (ราคา/วัน)','guide',1200,'เชียงใหม่',4,
      array['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=70'],
      '{"amenities":[]}'::jsonb)
) as seed(title, description, category, price_per_day, location, max_guests, images, details)
cross join (select id as owner_id from auth.users order by created_at asc limit 1) u
where not exists (select 1 from listings);

-- ============================================================
-- เสร็จ! ควรขึ้น "Success" — refresh เว็บได้เลย
-- ============================================================
