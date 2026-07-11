# วิธีตั้งค่า LINE Login (ทำครั้งเดียว)

โค้ดฝั่งเว็บเขียนเสร็จแล้ว เหลือ 3 ขั้นตอนที่ **คุณต้องทำเอง** (เพราะต้องใช้บัญชี LINE + คีย์ลับ)

---

## ขั้นที่ 1 — สร้าง LINE Login channel

1. เข้า https://developers.line.biz/console/
2. ล็อกอินด้วยบัญชี LINE ของคุณ
3. สร้าง **Provider** (ถ้ายังไม่มี) — ตั้งชื่ออะไรก็ได้ เช่น "WanDeeThai"
4. ในนั้นกด **Create a new channel** → เลือก **LINE Login**
5. กรอกข้อมูล:
   - Channel name: `WanDeeThai`
   - Channel description: อะไรก็ได้
   - App types: เลือก **Web app**
6. สร้างเสร็จจะได้ **Channel ID** กับ **Channel secret** (อยู่ในแท็บ Basic settings) — เก็บไว้ใช้ขั้นที่ 3

---

## ขั้นที่ 2 — ใส่ Callback URL

ในหน้า channel → แท็บ **LINE Login** → ช่อง **Callback URL** ใส่บรรทัดนี้ (ห้ามพิมพ์ผิด):

```
https://wandeethai.vercel.app/api/auth/line/callback
```

> ถ้าอยากได้อีเมลผู้ใช้ด้วย: แท็บ **Basic settings** → เลื่อนหา **OpenID Connect / Email address permission** → กด Apply แล้วอัปโหลดเอกสารตามที่ LINE ขอ (ถ้าไม่ทำ ระบบจะใช้อีเมลจำลองแทน ยังใช้งานได้ปกติ)

---

## ขั้นที่ 3 — ใส่ค่า Environment Variables ใน Vercel

เข้า Vercel → โปรเจค wandeethai → **Settings → Environment Variables** → เพิ่ม 3 ตัวนี้:

| Name | Value | เอามาจากไหน |
|------|-------|-------------|
| `LINE_CHANNEL_ID` | (Channel ID จากขั้นที่ 1) | LINE console → Basic settings |
| `LINE_CHANNEL_SECRET` | (Channel secret จากขั้นที่ 1) | LINE console → Basic settings |
| `SUPABASE_SERVICE_ROLE_KEY` | (คีย์ service_role) | Supabase → Settings → API → **service_role** (secret) |

> ⚠️ **สำคัญมาก:** `SUPABASE_SERVICE_ROLE_KEY` เป็นกุญแจลับที่มีสิทธิ์เต็ม **ห้ามเอาไปแปะที่อื่น ห้าม commit ลงโค้ด** ใส่แค่ใน Vercel เท่านั้น (โค้ดฝั่งนี้ใช้มันเฉพาะบน server ไม่หลุดไปเบราว์เซอร์)

หา service_role key: Supabase Dashboard → โปรเจค `iledkzfrududfepistio` → ⚙️ Project Settings → API → หัวข้อ "Project API keys" → บรรทัด **service_role** → กด Reveal → Copy

ใส่ครบแล้วกด **Save** → Vercel จะ redeploy อัตโนมัติ (หรือกด Redeploy เอง)

---

## ขั้นที่ 4 — ทดสอบ

1. เปิด https://wandeethai.vercel.app/auth
2. กดปุ่มเขียว **เข้าสู่ระบบด้วย LINE**
3. อนุญาตในหน้า LINE → ควรเด้งกลับมาเว็บแบบล็อกอินอยู่

ถ้าเจอ error ให้ดูข้อความบนหน้า /auth แล้วส่งมาบอกได้เลย
