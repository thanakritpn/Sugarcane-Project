# คู่มือทดสอบ API - ระบบแนะนำพันธุ์อ้อย

## การเริ่มต้นใช้งาน

### 1. เริ่ม Backend Server
```powershell
cd backend
npm install
npm start
```
Server จะรันที่ `http://localhost:5001`

### 2. Seed ข้อมูลเริ่มต้นเข้า Database
ก่อนทดสอบ API ครั้งแรก ต้อง seed ข้อมูลพันธุ์อ้อย 6 พันธุ์เข้าไปก่อน:

**Request:**
```
POST http://localhost:5001/api/seed
```

**Response:**
```json
{
  "message": "Seeded 6 varieties successfully",
  "count": 6
}
```

---

## API Endpoints

### 1. ดึงข้อมูลพันธุ์อ้อยทั้งหมด
**Endpoint:** `GET /api/varieties`

**ตัวอย่างการใช้งาน:**
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5001/api/varieties" -Method Get
```

**หรือใช้ curl:**
```bash
curl http://localhost:5001/api/varieties
```

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "name": "พันธุ์อ้อย เค 88-92",
    "soil_type": "ดินร่วนเหนียว",
    "pest": "หนอนเจาะลำต้น",
    "disease": "โรคใบขาว",
    "yield": "15-16",
    "age": "11-12",
    "sweetness": "10-12",
    "variety_image": "sugarcane1.jpg",
    "parent_varieties": "F143 (แม่) X ROC1 (พ่อ)",
    "growth_characteristics": [...],
    "planting_tips": [...],
    "suitable_for": [...],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  ...
]
```

---

### 2. ดึงข้อมูลพันธุ์อ้อยตาม ID
**Endpoint:** `GET /api/varieties/:id`

**ตัวอย่างการใช้งาน:**
```powershell
# แทนที่ {id} ด้วย _id จริงจากการ GET ทั้งหมด
Invoke-RestMethod -Uri "http://localhost:5001/api/varieties/65abc123..." -Method Get
```

**Response:**
```json
{
  "_id": "65abc123...",
  "name": "พันธุ์อ้อย เค 88-92",
  ...
}
```

---

### 3. ค้นหาพันธุ์อ้อยด้วยเงื่อนไข
**Endpoint:** `GET /api/varieties/search?soil_type=...&pest=...&disease=...`

**ตัวอย่างการใช้งาน:**
```powershell
# ค้นหาพันธุ์ที่เหมาะกับดินร่วนเหนียว
Invoke-RestMethod -Uri "http://localhost:5001/api/varieties/search?soil_type=ดินร่วนเหนียว" -Method Get

# ค้นหาพันธุ์ที่ต้านหนอนเจาะลำต้นและโรคใบขาว
Invoke-RestMethod -Uri "http://localhost:5001/api/varieties/search?pest=หนอนเจาะลำต้น&disease=โรคใบขาว" -Method Get
```

**Response:** Array ของพันธุ์ที่ตรงเงื่อนไข

---

### 4. เพิ่มพันธุ์อ้อยใหม่
**Endpoint:** `POST /api/varieties`

**ตัวอย่างการใช้งาน:**
```powershell
$body = @{
    name = "พันธุ์ทดสอบ 01"
    soil_type = "ดินร่วน"
    pest = "หนอนกออ้อย"
    disease = "เหี่ยวเน่าแดง"
    yield = "18-20"
    age = "12-14"
    sweetness = "12-14"
    variety_image = "test.jpg"
    parent_varieties = "Test (แม่) X Test2 (พ่อ)"
    growth_characteristics = @("ทดสอบ 1", "ทดสอบ 2")
    planting_tips = @("คำแนะนำ 1")
    suitable_for = @("ทดสอบการใช้งาน")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/varieties" -Method Post -Body $body -ContentType "application/json"
```

**curl equivalent:**
```bash
curl -X POST http://localhost:5001/api/varieties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "พันธุ์ทดสอบ 01",
    "soil_type": "ดินร่วน",
    "pest": "หนอนกออ้อย",
    "disease": "เหี่ยวเน่าแดง",
    "yield": "18-20",
    "age": "12-14",
    "sweetness": "12-14",
    "variety_image": "test.jpg",
    "parent_varieties": "Test (แม่) X Test2 (พ่อ)",
    "growth_characteristics": ["ทดสอบ 1", "ทดสอบ 2"],
    "planting_tips": ["คำแนะนำ 1"],
    "suitable_for": ["ทดสอบการใช้งาน"]
  }'
```

**Response:**
```json
{
  "_id": "65abc456...",
  "name": "พันธุ์ทดสอบ 01",
  ...
}
```

---

### 5. แก้ไขข้อมูลพันธุ์อ้อย
**Endpoint:** `PUT /api/varieties/:id`

**ตัวอย่างการใช้งาน:**
```powershell
$body = @{
    name = "พันธุ์ทดสอบ 01 (แก้ไข)"
    yield = "20-22"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/varieties/65abc456..." -Method Put -Body $body -ContentType "application/json"
```

**curl equivalent:**
```bash
curl -X PUT http://localhost:5001/api/varieties/65abc456... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "พันธุ์ทดสอบ 01 (แก้ไข)",
    "yield": "20-22"
  }'
```

**Response:** ข้อมูลที่แก้ไขแล้ว

---

### 6. ลบพันธุ์อ้อย
**Endpoint:** `DELETE /api/varieties/:id`

**ตัวอย่างการใช้งาน:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/varieties/65abc456..." -Method Delete
```

**curl equivalent:**
```bash
curl -X DELETE http://localhost:5001/api/varieties/65abc456...
```

**Response:**
```json
{
  "message": "Variety deleted successfully"
}
```

---

## การทดสอบด้วย Thunder Client (VS Code Extension)

1. ติดตั้ง Extension "Thunder Client" ใน VS Code
2. คลิก Thunder Client icon ในแถบด้านซ้าย
3. คลิก "New Request"
4. ตั้งค่าดังนี้:

### ตัวอย่าง: ทดสอบ GET ทั้งหมด
- Method: `GET`
- URL: `http://localhost:5001/api/varieties`
- คลิก "Send"

### ตัวอย่าง: ทดสอบ POST เพิ่มพันธุ์
- Method: `POST`
- URL: `http://localhost:5001/api/varieties`
- Tab "Body" → เลือก "JSON"
- ใส่ JSON:
```json
{
  "name": "พันธุ์ทดสอบ Thunder",
  "soil_type": "ดินร่วน",
  "pest": "หนอนกออ้อย",
  "disease": "เหี่ยวเน่าแดง",
  "yield": "18-20",
  "age": "12-14",
  "sweetness": "12-14",
  "variety_image": "thunder.jpg"
}
```
- คลิก "Send"

---

## ลำดับการทดสอบที่แนะนำ

1. **Seed Data** (ครั้งแรกเท่านั้น)
   ```
   POST /api/seed
   ```

2. **ดึงข้อมูลทั้งหมด** (ตรวจสอบว่า seed สำเร็จ)
   ```
   GET /api/varieties
   ```

3. **ค้นหาข้อมูล** (ทดสอบ filter)
   ```
   GET /api/varieties/search?soil_type=ดินร่วน
   ```

4. **เพิ่มข้อมูลใหม่**
   ```
   POST /api/varieties
   (ใส่ body JSON)
   ```

5. **ดึงข้อมูลที่เพิ่มใหม่** (ใช้ _id จาก response ข้อ 4)
   ```
   GET /api/varieties/{id}
   ```

6. **แก้ไขข้อมูล**
   ```
   PUT /api/varieties/{id}
   (ใส่ body JSON ที่ต้องการแก้)
   ```

7. **ลบข้อมูล**
   ```
   DELETE /api/varieties/{id}
   ```

---

## Error Handling

### ข้อมูลไม่ครบ (POST/PUT)
**Response (400):**
```json
{
  "error": "Missing required fields"
}
```

### ไม่พบข้อมูล (GET/PUT/DELETE by ID)
**Response (404):**
```json
{
  "error": "Variety not found"
}
```

### Server Error
**Response (500):**
```json
{
  "error": "Error message..."
}
```

---

## การทดสอบกับ Frontend

### 1. เริ่ม Frontend
```powershell
cd fontend
npm install
npm run dev
```

### 2. ทดสอบ Flow
1. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
2. หน้าแรกจะดึงข้อมูลพันธุ์อ้อยทั้งหมดอัตโนมัติ
3. ทดสอบค้นหาด้วย filter (ดิน, แมลง, โรค)
4. คลิกที่การ์ดพันธุ์อ้อยเพื่อดูรายละเอียด
5. ตรวจสอบใน Network Tab (F12) ว่า API ถูกเรียกถูกต้อง

---

## Tips

- ใช้ Thunder Client หรือ Postman สำหรับทดสอบ API แบบละเอียด
- ใช้ Browser DevTools (F12) → Network Tab เพื่อดู API calls จาก Frontend
- ตรวจสอบ Backend console เพื่อดู request logs
- MongoDB Compass สามารถใช้ดูข้อมูลใน database โดยตรง

---

## Database Connection

Backend เชื่อมต่อกับ MongoDB Atlas ผ่าน `DATABASE_URL` ใน `.env`

ตรวจสอบ `.env` file:
```env
DATABASE_URL=mongodb+srv://...
PORT=5001
```

หากต้องการเปลี่ยนเป็น MongoDB local:
```env
DATABASE_URL=mongodb://localhost:27017/sugarcane
PORT=5001
```
