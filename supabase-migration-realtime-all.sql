-- ============================================================
-- WanDeeThai — เปิด Realtime ให้ตารางที่เหลือ (หน้าอื่นๆ อัปเดตสด)
-- (messages/comments/bookings/notifications เปิดไปแล้วรอบก่อน)
-- รันใน Supabase > SQL Editor (รันครั้งเดียว)
-- ============================================================

do $$
begin
  begin alter publication supabase_realtime add table listings;      exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table reviews;       exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table reports;       exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table profiles;      exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table listing_views; exception when duplicate_object then null; end;
end $$;
