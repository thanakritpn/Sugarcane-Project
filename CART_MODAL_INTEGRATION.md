# Cart Modal & Header Integration - Summary

## Files Created

### 1. `fontend/src/components/CartModal.tsx` (ใหม่)
Modal component สำหรับแสดงและจัดการรถเข็น
- **Props:**
  - `isOpen: boolean` - ควบคุมการแสดง/ซ่อน modal
  - `onClose: () => void` - callback เมื่อปิด modal
  - `userId: string | null` - ไอดีผู้ใช้สำหรับดึงข้อมูลรถเข็น
  - `onCheckout?: () => void` - callback เมื่อคลิกปุ่มชำระเงิน

- **Features:**
  - ✅ แสดงรายการสินค้า (รูป, ชื่อ, ราคา, ร้าน)
  - ✅ ปุ่มเพิ่ม/ลดจำนวน สินค้า
  - ✅ ปุ่มลบสินค้า
  - ✅ คำนวณรวมราคา
  - ✅ สรุปจำนวนรายการและราคารวม
  - ✅ ปุ่ม "ต้องการช้อปปิ้งต่อ" และ "ดำเนินการชำระเงิน"
  - ✅ Loading state
  - ✅ Empty state

## Files Modified

### 1. `fontend/src/components/Header.tsx`
**เพิ่มเติม:**
- เพิ่ม prop `cartCount?: number` - แสดงจำนวนสินค้าบนไอคอน
- เพิ่ม badge notification ด้านบนขวาของไอคอนรถเข็น
- แสดง badge สีแดงเมื่อมีสินค้า (max 99+)

**Code changes:**
```tsx
{cartCount > 0 && (
  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
    {cartCount > 99 ? '99+' : cartCount}
  </span>
)}
```

### 2. `fontend/src/pages/Home.tsx`
**เพิ่มเติม:**
- Import `CartModal` component
- Import `getUserCart` from API
- State `showCartModal` - ควบคุมการแสดง/ซ่อน CartModal
- State `cartCount` - เก็บจำนวนสินค้าในรถเข็น
- State `userId` - เก็บ user ID จาก localStorage
- `useEffect` hook - โหลด cart count เมื่อ login
- Function `handleOpenCart()` - ตรวจสอบ login ก่อนเปิด modal
- Function `handleCloseCart()` - ปิด modal และ reload cart count
- Update `handleLogout()` - ล้าง cart count และปิด modal เมื่อ logout
- Update `handleLogin()` - update userId state

**Props ส่งไปยัง Header:**
- `cartCount={cartCount}`
- `onCartClick={handleOpenCart}`

**JSX:**
```tsx
<CartModal
  isOpen={showCartModal}
  onClose={handleCloseCart}
  userId={userId}
  onCheckout={() => {
    alert('ระบบชำระเงินอยู่ในช่วงพัฒนา');
  }}
/>
```

## Flow การทำงาน

### 1. เมื่อผู้ใช้เปิดหน้า Home ด้วย Login
```
1. Home loads → checks localStorage for user
2. useEffect triggers → calls getUserCart()
3. cartCount state updated → Header receives prop
4. Header แสดง badge ด้วยจำนวนสินค้า
```

### 2. เมื่อผู้ใช้คลิกปุ่มรถเข็นในตะกร้า
```
1. onCartClick triggered → handleOpenCart()
2. Check if logged in
   ├─ No → show LoginModal
   └─ Yes → set showCartModal = true
3. CartModal opens → loadCart() called
4. CartItems displayed with quantity controls
5. User can:
   ├─ Increase/decrease quantity
   ├─ Delete item
   ├─ Close modal (reloads cart count)
   └─ Proceed to checkout
```

### 3. เมื่อผู้ใช้ logout
```
1. onLogoutClick triggered → handleLogout()
2. Clear localStorage user
3. Set states:
   ├─ isLoggedIn = false
   ├─ userId = null
   ├─ cartCount = 0
   └─ showCartModal = false (close if open)
```

## API Endpoints Used

- **GET** `/api/cart/:userId` - ดึงรถเข็นของผู้ใช้
- **PUT** `/api/cart/:cartId` - อัปเดตจำนวนสินค้า
- **DELETE** `/api/cart/:cartId` - ลบสินค้า

## UI Components

### Header Badge
- ตำแหน่ง: ด้านบนขวาของไอคอน FaShoppingCart
- สี: สีแดง (bg-red-500)
- ขนาด: 20x20px
- フォント: ตัวหนา, ขาว

### CartModal
- ประเภท: Modal overlay
- ขนาด: max-width 2xl
- สูงสุด: 90vh
- Background: white
- ราคา: shadow-2xl

## State Management

```
Home Component:
├── isLoggedIn (boolean) - ผู้ใช้ logged in หรือไม่
├── userId (string | null) - MongoDB user ID
├── cartCount (number) - จำนวนสินค้ารวม
├── showCartModal (boolean) - แสดง modal หรือไม่
├── showLoginModal (boolean) - แสดง login modal หรือไม่
└── favorites (string[]) - ไอดีสินค้าที่ถูกใจ

CartModal Component:
├── cartItems (CartItem[]) - รายการในรถเข็น
├── loading (boolean) - กำลังโหลด
├── updating (string | null) - cart ID ที่ปรับปรุง
└── deleting (string | null) - cart ID ที่ลบ
```

## Styling

### Colors
- Primary: `#16a34a` (เขียว)
- Dark: `#15803d` (เขียวเข้ม)
- Badge: `red-500` (แดง)

### Classes Used
- Tailwind CSS (ตามเดิม)
- `absolute` - สำหรับ badge positioning
- `rounded-full` - สำหรับ badge shape
- `flex items-center justify-center` - centering badge count

## Testing Checklist

- [ ] Header แสดง badge จำนวนสินค้า
- [ ] Badge แสดงเมื่อมีสินค้า ≥ 1
- [ ] Badge ซ่อนเมื่อไม่มีสินค้า
- [ ] ปุ่มรถเข็นเปิด CartModal
- [ ] ไม่ login → ปุ่มรถเข็นแสดง LoginModal
- [ ] CartModal แสดงสินค้าทั้งหมด
- [ ] สามารถเพิ่ม/ลดจำนวนสินค้า
- [ ] สามารถลบสินค้า
- [ ] คำนวณราคารวมถูกต้อง
- [ ] ปิด modal → cart count reload
- [ ] Logout → cart count reset

## Version Compatibility

- React 18+
- TypeScript 4.0+
- Tailwind CSS 3.0+
- React Router 6.0+
