// ไฟล์นี้สำหรับทดสอบ Cart API
// สามารถ copy/paste ไปยัง Postman หรือ curl

// ====== TEST CART APIs ======

// 1. GET ข้อมูลผู้ใช้ (เพื่อได้ userId)
GET /api/auth/login
Body: {
  "email": "aofza1508@gmail.com",
  "password": "111111"
}
Response: { "email": "...", "id": "USER_ID_HERE" }

// 2. ดึงข้อมูลร้านค้า (เพื่อได้ shopId)
GET /api/shops
Response: [
  {
    "_id": "SHOP_ID_HERE",
    "shopName": "...",
    ...
  }
]

// 3. ดึงข้อมูลสินค้า (เพื่อได้ varietyId)
GET /api/varieties
Response: [
  {
    "_id": "VARIETY_ID_HERE",
    "name": "...",
    ...
  }
]

// 4. เพิ่มสินค้าไปยังรถเข็น
POST /api/cart
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "userId": "USER_ID_FROM_STEP_1",
  "shopId": "SHOP_ID_FROM_STEP_2",
  "varietyId": "VARIETY_ID_FROM_STEP_3",
  "price": 500,
  "quantity": 1
}
Response: {
  "message": "Item added to cart successfully",
  "data": {
    "_id": "CART_ID",
    "userId": "...",
    "shopId": "...",
    "varietyId": "...",
    "price": 500,
    "quantity": 1,
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
}

// 5. ดึงข้อมูลรถเข็น
GET /api/cart/USER_ID_FROM_STEP_1
Response: {
  "message": "Cart items retrieved successfully",
  "data": [
    {
      "_id": "CART_ID",
      "userId": "...",
      "shopId": {
        "_id": "...",
        "shopName": "...",
        ...
      },
      "varietyId": {
        "_id": "...",
        "name": "...",
        ...
      },
      "price": 500,
      "quantity": 1,
      "status": "pending",
      ...
    }
  ]
}

// 6. แก้ไขจำนวนสินค้า
PUT /api/cart/CART_ID_FROM_STEP_4
Body: {
  "quantity": 2,
  "status": "pending"
}
Response: {
  "message": "Cart item updated successfully",
  "data": {
    "_id": "CART_ID",
    ...
    "quantity": 2,
    ...
  }
}

// 7. ลบสินค้าออกจากรถเข็น
DELETE /api/cart/CART_ID_FROM_STEP_4
Response: {
  "message": "Item removed from cart successfully",
  "data": {
    "_id": "CART_ID",
    ...
  }
}

// 8. ลบทั้งรถเข็น
DELETE /api/cart-clear/USER_ID_FROM_STEP_1
Response: {
  "message": "Cart cleared successfully",
  "deletedCount": 3
}

// ====== CURL EXAMPLES ======

/*
// Example 1: Add to cart
curl -X POST http://localhost:5001/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "shopId": "YOUR_SHOP_ID",
    "varietyId": "YOUR_VARIETY_ID",
    "price": 500,
    "quantity": 1
  }'

// Example 2: Get user cart
curl -X GET http://localhost:5001/api/cart/YOUR_USER_ID

// Example 3: Update cart item
curl -X PUT http://localhost:5001/api/cart/YOUR_CART_ID \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2,
    "status": "pending"
  }'

// Example 4: Remove from cart
curl -X DELETE http://localhost:5001/api/cart/YOUR_CART_ID

// Example 5: Clear cart
curl -X DELETE http://localhost:5001/api/cart-clear/YOUR_USER_ID
*/
