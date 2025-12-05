# 📋 Shop Management API Guide

## Database Models

### 1. Shop Model (ร้านค้า)
จัดเก็บข้อมูลบัญชีและอยู่ของร้านค้า

**Schema:**
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  shopName: String,
  phone: String,
  address: String,
  district: String,
  province: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. ShopInventory Model (คลังสินค้า)
จัดเก็บข้อมูลสายพันธุ์อ้อยที่ร้านแต่ละร้านขาย ราคา และสถานะ

**Schema:**
```javascript
{
  shopId: ObjectId (reference to Shop),
  varietyId: ObjectId (reference to Variety),
  price: Number,
  status: 'available' | 'out_of_stock',
  quantity: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Features:**
- ✅ Unique constraint on (shopId, varietyId) - ป้องกัน duplicate entries
- ✅ Relation กับ Variety model (ทรงพันธุ์อ้อย)
- ✅ Relation กับ Shop model (ร้านค้า)

---

## API Endpoints

### 🔐 Shop Registration & Authentication

#### 1. Register New Shop
```
POST /api/shops/register
```

**Request Body:**
```json
{
  "username": "shop_chiangmai",
  "email": "shop.chiangmai@example.com",
  "password": "securePassword123",
  "shopName": "ร้านอ้อยเชียงใหม่",
  "phone": "053-123456",
  "address": "123 ถนนท่าแพ ตำบลศรีภูมิ",
  "district": "เมืองเชียงใหม่",
  "province": "เชียงใหม่"
}
```

**Response (201):**
```json
{
  "message": "Shop registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "shop_chiangmai",
    "email": "shop.chiangmai@example.com",
    "shopName": "ร้านอ้อยเชียงใหม่"
  }
}
```

#### 2. Shop Login
```
POST /api/shops/login
```

**Request Body:**
```json
{
  "email": "shop.chiangmai@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "shop_chiangmai",
    "email": "shop.chiangmai@example.com",
    "shopName": "ร้านอ้อยเชียงใหม่",
    "phone": "053-123456",
    "address": "123 ถนนท่าแพ ตำบลศรีภูมิ",
    "district": "เมืองเชียงใหม่",
    "province": "เชียงใหม่"
  }
}
```

---

### 🏪 Shop Management

#### 3. Get All Shops
```
GET /api/shops
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "shop_chiangmai",
    "email": "shop.chiangmai@example.com",
    "shopName": "ร้านอ้อยเชียงใหม่",
    "phone": "053-123456",
    "address": "123 ถนนท่าแพ ตำบลศรีภูมิ",
    "district": "เมืองเชียงใหม่",
    "province": "เชียงใหม่",
    "createdAt": "2024-12-05T10:00:00Z"
  }
]
```

#### 4. Get Shop by ID
```
GET /api/shops/:id
```

**Example:** `GET /api/shops/507f1f77bcf86cd799439011`

**Response (200):** Same as single shop object

#### 5. Update Shop Information
```
PUT /api/shops/:id
```

**Request Body (ส่งเฉพาะฟิลด์ที่ต้องอัพเดท):**
```json
{
  "shopName": "ร้านอ้อยเชียงใหม่ 2",
  "phone": "053-654321",
  "address": "456 ถนนใหม่",
  "district": "เมืองเชียงใหม่",
  "province": "เชียงใหม่"
}
```

**Response (200):**
```json
{
  "message": "Shop updated successfully",
  "data": { ...updated shop data }
}
```

---

### 📦 Shop Inventory Management

#### 6. Add Variety to Shop Inventory
```
POST /api/shop-inventory
```

**Request Body:**
```json
{
  "shopId": "507f1f77bcf86cd799439011",
  "varietyId": "507f1f77bcf86cd799439012",
  "price": 2500,
  "status": "available",
  "quantity": 50
}
```

**Response (201):**
```json
{
  "message": "Variety added to inventory successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "shopId": "507f1f77bcf86cd799439011",
    "varietyId": "507f1f77bcf86cd799439012",
    "price": 2500,
    "status": "available",
    "quantity": 50,
    "createdAt": "2024-12-05T10:00:00Z"
  }
}
```

#### 7. Get Shop Inventory (with Variety Details)
```
GET /api/shops/:shopId/inventory
```

**Example:** `GET /api/shops/507f1f77bcf86cd799439011/inventory`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "shopId": "507f1f77bcf86cd799439011",
    "varietyId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "พันธุ์อ้อย เค 88-92",
      "soil_type": "ดินร่วนเหนียว",
      "yield": "15-16"
    },
    "price": 2500,
    "status": "available",
    "quantity": 50
  }
]
```

#### 8. Update Inventory (Price/Status/Quantity)
```
PUT /api/shop-inventory/:id
```

**Request Body:**
```json
{
  "price": 2800,
  "status": "out_of_stock",
  "quantity": 0
}
```

**Response (200):**
```json
{
  "message": "Inventory updated successfully",
  "data": { ...updated inventory }
}
```

#### 9. Remove Variety from Inventory
```
DELETE /api/shop-inventory/:id
```

**Response (200):**
```json
{
  "message": "Inventory item removed successfully",
  "data": { ...deleted inventory item }
}
```

---

### 🔍 Search APIs

#### 9.5 Get Shop's Own Inventory
```
GET /api/shop-inventory/shop/:shopId
```

**Description:** Get all inventory items for a specific shop (grouped by shop).
This endpoint is used by shop owners to view their own inventory.

**Example:** `GET /api/shop-inventory/shop/507f1f77bcf86cd799439011`

**Response (200):**
```json
[
  {
    "shop": {
      "_id": "507f1f77bcf86cd799439011",
      "shopName": "ร้านอ้อยเชียงใหม่",
      "username": "@shop_chiangmai",
      "email": "shop@example.com",
      "phone": "053-123456",
      "address": "123 ถนนท่าแพ",
      "district": "เมืองเชียงใหม่",
      "province": "เชียงใหม่",
      "shop_image": "shop-1.jpg"
    },
    "inventories": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "variety": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "พันธุ์อ้อย เค 88-92",
          "soil_type": "ดินร่วนเหนียว",
          "yield": "15-16"
        },
        "price": 2500,
        "status": "available",
        "quantity": 50,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
]
```

#### 10. Find All Shops Selling Specific Variety
```
GET /api/shop-inventory/variety/:varietyId
```

**Example:** `GET /api/shop-inventory/variety/507f1f77bcf86cd799439012`

**Response (200):**
````
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "varietyId": "507f1f77bcf86cd799439012",
    "price": 2500,
    "status": "available",
    "shopId": {
      "_id": "507f1f77bcf86cd799439011",
      "shopName": "ร้านอ้อยเชียงใหม่",
      "phone": "053-123456",
      "address": "123 ถนนท่าแพ",
      "district": "เมืองเชียงใหม่",
      "province": "เชียงใหม่"
    }
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "varietyId": "507f1f77bcf86cd799439012",
    "price": 2700,
    "status": "available",
    "shopId": {
      "_id": "507f1f77bcf86cd799439015",
      "shopName": "ร้านอ้อยขอนแก่น",
      "phone": "043-234567",
      "address": "456 ถนนสีชัง",
      "district": "เมืองขอนแก่น",
      "province": "ขอนแก่น"
    }
  }
]
```

---

## Seed Data

เพื่อสร้างข้อมูลตัวอย่างสำหรับร้านค้า:

```bash
# ตรวจสอบว่า Variety มีข้อมูลแล้ว
node seed-with-description.js

# สร้างข้อมูลร้านค้า
node seed-shops.js
```

**ข้อมูลตัวอย่างที่สร้าง:**

**3 ร้านค้า:**
1. ร้านอ้อยเชียงใหม่ (shop_chiangmai)
2. ร้านอ้อยขอนแก่น (shop_khonkaen)
3. ร้านอ้อยนครราชสีมา (shop_nakhon)

**แต่ละร้านจะมี inventory ของสายพันธุ์อ้อยที่มีอยู่ พร้อมราคาสุ่ม**

---

## Sample Curl Commands

### Register Shop
```bash
curl -X POST http://localhost:5001/api/shops/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "shop_test",
    "email": "test@example.com",
    "password": "test123",
    "shopName": "ร้านทดสอบ",
    "phone": "0812345678",
    "address": "123 ถนนทดสอบ",
    "district": "เมืองสระบุรี",
    "province": "สระบุรี"
  }'
```

### Get All Shops
```bash
curl http://localhost:5001/api/shops
```

### Get Shop Inventory
```bash
curl http://localhost:5001/api/shops/[SHOP_ID]/inventory
```

### Add Variety to Inventory
```bash
curl -X POST http://localhost:5001/api/shop-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "[SHOP_ID]",
    "varietyId": "[VARIETY_ID]",
    "price": 3000,
    "status": "available",
    "quantity": 100
  }'
```

---

## Error Handling

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | ส่งข้อมูลไม่ครบ |
| 401 | Invalid credentials | Username/Email หรือ Password ผิด |
| 404 | Not found | ไม่พบข้อมูลที่ค้นหา |
| 409 | Already exists | Shop/Email/Username ซ้ำกับที่มีอยู่ |
| 500 | Server error | เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ |

---

## Frontend Integration Example

```typescript
// Register shop
const registerShop = async (shopData: IShopRegister) => {
  const response = await fetch('http://localhost:5001/api/shops/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shopData)
  });
  return response.json();
};

// Get shop inventory
const getShopInventory = async (shopId: string) => {
  const response = await fetch(`http://localhost:5001/api/shops/${shopId}/inventory`);
  return response.json();
};

// Find shops selling specific variety
const findShopsByVariety = async (varietyId: string) => {
  const response = await fetch(`http://localhost:5001/api/shop-inventory/variety/${varietyId}`);
  return response.json();
};
```

---

## Files Created/Modified

✅ Created:
- `/backend/src/models/Shop.ts` - Shop model definition
- `/backend/src/models/ShopInventory.ts` - ShopInventory model definition
- `/backend/seed-shops.js` - Seed script for shop data
- `/backend/SHOP_API_GUIDE.md` - This guide

📝 Modified:
- `/backend/src/server.ts` - Added Shop & ShopInventory routes and imports
