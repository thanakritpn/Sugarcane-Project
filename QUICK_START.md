# 🌾 ระบบแนะนำพันธุ์อ้อย - Quick Start Guide

## ✅ สิ่งที่เสร็จสมบูรณ์แล้ว

### Frontend
- ✅ React 18 + TypeScript + Vite
- ✅ React Router สำหรับนำทาง
- ✅ Redux Toolkit สำหรับจัดการ state
- ✅ Axios สำหรับเรียก API
- ✅ Tailwind CSS สำหรับ styling
- ✅ หน้า Home พร้อมระบบค้นหา (ดิน, แมลง, โรค)
- ✅ หน้า Detail แสดงรายละเอียดพันธุ์อ้อย
- ✅ Loading และ Error states
- ✅ การแสดงผลภาษาไทยถูกต้อง (UTF-8)

### Backend
- ✅ Express.js + TypeScript
- ✅ MongoDB Atlas (Cloud Database)
- ✅ Mongoose Schema สำหรับพันธุ์อ้อย
- ✅ CRUD API ครบถ้วน (7 endpoints)
- ✅ Seed API สำหรับข้อมูลเริ่มต้น 6 พันธุ์
- ✅ CORS enabled
- ✅ Static file serving สำหรับรูปภาพ

---

## 🚀 การเริ่มต้นใช้งาน

### 1️⃣ เริ่ม Backend (Terminal 1)

```powershell
# เข้าโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# เริ่มเซิร์ฟเวอร์
npm start
```

✅ Server จะรันที่: `http://localhost:5001`  
✅ จะเห็นข้อความ: `✓ Connected to MongoDB Atlas`

---

### 2️⃣ Seed ข้อมูลเริ่มต้น (Terminal 2)

```powershell
# ใช้ PowerShell เรียก Seed API
Invoke-RestMethod -Uri "http://localhost:5001/api/seed" -Method Post
```

หรือใช้ curl:
```bash
curl -X POST http://localhost:5001/api/seed
```

✅ จะได้ response:
```json
{
  "message": "Seeded 6 varieties successfully",
  "count": 6
}
```

**พันธุ์อ้อยที่มีในระบบ:**
1. เค 88-92
2. LK 92-11
3. ขอนแก่น 3
4. อุตรดิตถ์ 1
5. เชียงราย 60
6. สุพรรณบุรี 90

---

### 3️⃣ เริ่ม Frontend (Terminal 3)

```powershell
# เข้าโฟลเดอร์ frontend
cd fontend

# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# เริ่ม dev server
npm run dev
```

✅ จะรันที่: `http://localhost:5173`  
✅ เปิดเบราว์เซอร์ไปที่ URL ข้างต้น

---

## 📱 การใช้งานระบบ

### หน้าแรก (Home)
1. ระบบจะดึงข้อมูลพันธุ์อ้อยทั้งหมดอัตโนมัติ
2. ใช้ filter ค้นหา:
   - **ลักษณะดิน**: ดินร่วน, ดินร่วนเหนียว, ดินร่วนทราย
   - **ต้านแมลง**: หนอนเจาะลำต้น, หนอนกออ้อย, หวี่ขาว
   - **ต้านโรค**: โรคใบขาว, เหี่ยวเน่าแดง, โรคแส้ดำ, โรคกอตะไคร้, โรคจุดใบเหลือง
3. คลิก "ค้นหา" เพื่อ filter ข้อมูล
4. คลิกที่การ์ดพันธุ์อ้อยเพื่อดูรายละเอียด

### หน้ารายละเอียด (Detail)
- แสดงข้อมูลครบถ้วน:
  - ข้อมูลพื้นฐาน (ดิน, แมลง, โรค, ผลผลิต, อายุ, ความหวาน)
  - พันธุ์พ่อแม่
  - ลักษณะการเจริญเติบโต
  - คำแนะนำการปลูก
  - ความเหมาะสม
- ปุ่ม "กลับหน้าหลัก" เพื่อกลับไปค้นหาต่อ

---

## 🔧 API Endpoints ทั้งหมด

### 1. GET /api/varieties
ดึงข้อมูลพันธุ์อ้อยทั้งหมด

### 2. GET /api/varieties/:id
ดึงข้อมูลพันธุ์อ้อยเฉพาะ ID

### 3. GET /api/varieties/search?soil_type=...&pest=...&disease=...
ค้นหาพันธุ์อ้อยด้วยเงื่อนไข

### 4. POST /api/varieties
เพิ่มพันธุ์อ้อยใหม่ (สำหรับหน้า Admin ในอนาคต)

### 5. PUT /api/varieties/:id
แก้ไขข้อมูลพันธุ์อ้อย (สำหรับหน้า Admin ในอนาคต)

### 6. DELETE /api/varieties/:id
ลบพันธุ์อ้อย (สำหรับหน้า Admin ในอนาคต)

### 7. POST /api/seed
Seed ข้อมูลเริ่มต้น 6 พันธุ์

📖 **คู่มือทดสอบ API ฉบับเต็ม**: อ่านได้ที่ `API_TESTING_GUIDE.md`

---

## 🛠️ Tools สำหรับทดสอบ API

### Thunder Client (แนะนำ)
1. ติดตั้ง Extension "Thunder Client" ใน VS Code
2. คลิก Thunder Client icon
3. สร้าง New Request
4. ทดสอบ API ต่างๆ ได้ง่ายๆ

### Postman
ใช้ Postman Desktop หรือ Web

### PowerShell / curl
ดูตัวอย่างใน `API_TESTING_GUIDE.md`

---

## 📂 โครงสร้างโปรเจค

```
Sugarcane-Project/
├── backend/                  # Backend API
│   ├── src/
│   │   ├── server.ts        # Express server + API endpoints
│   │   └── models/
│   │       └── Variety.ts   # Mongoose schema
│   ├── .env                 # MongoDB connection
│   └── package.json
│
├── fontend/                 # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx     # หน้าหลัก + ค้นหา
│   │   │   └── VarietyDetail.tsx  # หน้ารายละเอียด
│   │   ├── services/
│   │   │   └── api.ts       # Axios API calls
│   │   └── store/
│   │       └── slices/
│   │           └── varietiesSlice.ts  # Redux state
│   └── package.json
│
├── API_TESTING_GUIDE.md     # คู่มือทดสอบ API
└── QUICK_START.md          # ไฟล์นี้
```

---

## 🔍 การ Debug

### ตรวจสอบ Backend
- ดู console ที่รัน `npm start` (Terminal 1)
- ต้องเห็น: `✓ Connected to MongoDB Atlas`
- ต้องเห็น: `Server running on http://localhost:5001`

### ตรวจสอบ Frontend
- ดู console ที่รัน `npm run dev` (Terminal 3)
- เปิด Browser DevTools (F12)
- ไปที่ tab "Network" ดู API calls
- ไปที่ tab "Console" ดู errors (ถ้ามี)

### ตรวจสอบ Database
- เข้า MongoDB Atlas: https://cloud.mongodb.com
- เลือก Cluster → Browse Collections
- ดูข้อมูลใน database "sugarcane" → collection "varieties"

---

## ❗ Troubleshooting

### ปัญหา: Backend ไม่ connect MongoDB
**แก้ไข:**
1. ตรวจสอบ `backend/.env` ว่ามี `DATABASE_URL` ถูกต้อง
2. ตรวจสอบ internet connection
3. ตรวจสอบ MongoDB Atlas ว่า IP whitelist ถูกต้อง (0.0.0.0/0 คือทุก IP)

### ปัญหา: Frontend ไม่แสดงข้อมูล
**แก้ไข:**
1. ตรวจสอบว่า Backend รันอยู่ที่ port 5001
2. เรียก Seed API ก่อน (POST /api/seed)
3. ดู Network tab ว่า API ถูกเรียกหรือไม่
4. ดู Console tab ว่ามี error หรือไม่

### ปัญหา: Port ถูกใช้งานแล้ว
**แก้ไข Backend (5001):**
```powershell
# หาและปิด process ที่ใช้ port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**แก้ไข Frontend (5173):**
```powershell
# หาและปิด process ที่ใช้ port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 🎯 ขั้นตอนถัดไป (Admin Panel)

ระบบพร้อมแล้วสำหรับสร้างหน้า Admin ที่สามารถ:
- ➕ เพิ่มพันธุ์อ้อยใหม่ (POST /api/varieties)
- ✏️ แก้ไขข้อมูล (PUT /api/varieties/:id)
- 🗑️ ลบพันธุ์ออก (DELETE /api/varieties/:id)
- 📤 Upload รูปภาพ

API พร้อมใช้งานแล้ว เหลือแค่สร้าง UI!

---

## 📞 สรุป

**Backend:** Express + MongoDB Atlas + TypeScript  
**Frontend:** React + Redux + TypeScript + Tailwind  
**API:** 7 endpoints พร้อมใช้งาน  
**ข้อมูล:** 6 พันธุ์อ้อยพร้อม Seed

**เริ่มใช้งาน:**
1. `cd backend && npm start`
2. `Invoke-RestMethod -Uri "http://localhost:5001/api/seed" -Method Post`
3. `cd fontend && npm run dev`
4. เปิด `http://localhost:5173`

Happy Coding! 🌾🎉
