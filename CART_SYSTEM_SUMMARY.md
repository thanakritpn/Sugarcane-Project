# ระบบรถเข็น (Cart System) - สรุปการเปลี่ยนแปลง

## การเปลี่ยนแปลงที่ทำ

### 1. Backend Model - Cart (ใหม่)
**ไฟล์:** `backend/src/models/Cart.ts`

สร้างโมเดล MongoDB สำหรับเก็บข้อมูลรถเข็นพร้อมกับฟิลด์:
- `userId` - ไอดีผู้ใช้ (reference ไปยัง User)
- `shopId` - ไอดีร้านค้า (reference ไปยัง Shop)
- `varietyId` - ไอดีสินค้า/พันธุ์อ้อย (reference ไปยัง Variety)
- `price` - ราคา (บาท/ไร่)
- `quantity` - จำนวน
- `status` - สถานะ (pending, paid, cancelled)
- `createdAt` & `updatedAt` - เวลาสร้างและแก้ไข

### 2. Backend API Routes - Cart APIs
**ไฟล์:** `backend/src/server.ts`

เพิ่มไลบรารี Cart import และสร้าง API endpoints:

#### Endpoints:
- **POST** `/api/cart` - เพิ่มสินค้าไปยังรถเข็น
  - Body: `{ userId, shopId, varietyId, price, quantity }`
  - หากสินค้าเดียวกันจากร้านเดียวกันมีอยู่แล้ว จะ update quantity

- **GET** `/api/cart/:userId` - ดึงข้อมูลรถเข็นของผู้ใช้
  - Return: array ของ cart items พร้อมข้อมูล shop และ variety

- **PUT** `/api/cart/:cartId` - แก้ไขรถเข็น (เปลี่ยนจำนวนหรือสถานะ)
  - Body: `{ quantity?, status? }`

- **DELETE** `/api/cart/:cartId` - ลบสินค้าออกจากรถเข็น

- **DELETE** `/api/cart-clear/:userId` - ลบทั้งรถเข็น

### 3. Frontend API Services - Cart Functions
**ไฟล์:** `fontend/src/services/api.ts`

เพิ่มฟังก์ชัน API ที่ใช้ axios:
- `addToCart(userId, shopId, varietyId, price, quantity)` - เพิ่มสินค้า
- `getUserCart(userId)` - ดึงรถเข็นของผู้ใช้
- `updateCartItem(cartId, quantity?, status?)` - แก้ไข
- `removeFromCart(cartId)` - ลบสินค้า
- `clearCart(userId)` - ลบทั้งรถเข็น

และเพิ่มไทป์ `CartItem` interface สำหรับ type safety

### 4. Frontend VarietyDetail Page - Integration
**ไฟล์:** `fontend/src/pages/VarietyDetail.tsx`

#### เพิ่ม State:
- `addingToCart` - tracking กำลังเพิ่มสินค้าจากร้านไหน
- `cartMessage` - แสดง success/error message

#### เพิ่ม Function:
- `handleAddToCart(shopId, shopName, price)` - handler เมื่อคลิกปุ่ม
  - ตรวจสอบ login status
  - เรียก API `addToCart()`
  - แสดง notification message

#### เปลี่ยนแปลง UI:
- เปลี่ยนปุ่ม "เพิ่มไปยังรถเข็น" จาก static เป็น interactive
- เพิ่ม `onClick` handler
- เพิ่ม loading state (disabled + "กำลังเพิ่ม...")
- เพิ่ม notification toast สำหรับแสดง success/error message

#### Flow:
1. ผู้ใช้คลิกปุ่ม "เพิ่มไปยังรถเข็น"
2. ระบบตรวจสอบว่า login แล้วหรือไม่
   - ถ้ายัง: แสดง login modal
   - ถ้าแล้ว: ดำเนินการต่อ
3. ส่ง request ไปยัง API `/api/cart` พร้อมข้อมูล:
   - userId (จาก localStorage)
   - shopId (จากร้านค้านั้น)
   - varietyId (สินค้าปัจจุบัน)
   - price (ราคาจากร้านค้านั้น)
   - quantity (เริ่มต้น 1)
4. API บันทึกลงฐานข้อมูล
5. แสดง notification message เมื่อสำเร็จ

## Database Schema

```
carts collection
├── userId (ObjectId, required) → User._id
├── shopId (ObjectId, required) → Shop._id
├── varietyId (ObjectId, required) → Variety._id
├── price (Number, required)
├── quantity (Number, required, default: 1)
├── status (String, enum: ['pending', 'paid', 'cancelled'], default: 'pending')
├── createdAt (Date)
└── updatedAt (Date)
```

## ขั้นตอนการทดสอบ

1. **ทดสอบ API ด้วย Postman/curl:**
   ```bash
   POST /api/cart
   Body: {
     "userId": "user_id_here",
     "shopId": "shop_id_here",
     "varietyId": "variety_id_here",
     "price": 500,
     "quantity": 1
   }
   ```

2. **ทดสอบใน Frontend:**
   - ไปที่หน้ารายละเอียดสินค้า
   - ล็อกอิน
   - คลิกปุ่ม "เพิ่มไปยังรถเข็น"
   - ตรวจสอบ message notification
   - เปิด DevTools > Network ดูว่า API ส่งข้อมูลถูกต้องหรือไม่
   - ตรวจสอบ MongoDB Atlas ว่ามีข้อมูลใน collection `carts` หรือไม่

## ความสำคัญ

✅ ระบบการพิสูจน์ตัวตนถูกตรวจสอบ (ต้อง login ก่อน)
✅ ข้อมูลบันทึกลงฐานข้อมูลแล้ว (ไม่เพียง local state)
✅ Support การเพิ่มสินค้าเดียวกันจากร้านเดียวกัน (update quantity)
✅ มี notification ให้ผู้ใช้ทราบผล
✅ Loading state เพื่อป้องกาน double-click

## ขั้นตอนต่อไป (ถ้าต้องการ)

1. สร้างหน้า Cart / Shopping Cart เพื่อดูสินค้าที่เพิ่มไปแล้ว
2. เพิ่มระบบ Checkout
3. เพิ่มระบบ Payment
4. เพิ่มระบบ Order tracking
