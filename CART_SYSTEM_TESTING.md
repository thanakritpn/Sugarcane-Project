# Cart System - Testing Checklist

## Pre-Testing Requirements
- [ ] Backend server running (`npm run dev` in `/backend`)
- [ ] Frontend development server running (in `/fontend`)
- [ ] MongoDB Atlas connection verified
- [ ] Test user account logged in or ready to create

## Unit Tests - Backend

### Cart Model
- [ ] Cart schema created successfully
- [ ] All required fields present (userId, shopId, varietyId, price, quantity, status)
- [ ] Timestamps (createdAt, updatedAt) working

### Cart API Routes
- [ ] POST /api/cart - Create new cart item
  - [ ] With all required fields
  - [ ] With missing fields (should return error)
  - [ ] Duplicate item (should update quantity)

- [ ] GET /api/cart/:userId - Retrieve user cart
  - [ ] Return populated shop and variety data
  - [ ] Return empty array for empty cart
  - [ ] With invalid userId

- [ ] PUT /api/cart/:cartId - Update cart item
  - [ ] Update quantity
  - [ ] Update status
  - [ ] Update both
  - [ ] With invalid cartId

- [ ] DELETE /api/cart/:cartId - Remove item from cart
  - [ ] Delete existing cart item
  - [ ] With invalid cartId

- [ ] DELETE /api/cart-clear/:userId - Clear entire cart
  - [ ] Delete all items for user
  - [ ] Return correct deletedCount

## Integration Tests - Frontend

### VarietyDetail Page
- [ ] Page loads without errors
- [ ] All state variables initialized correctly
- [ ] Cart message appears after adding item
- [ ] Cart notification message:
  - [ ] Shows success message on success
  - [ ] Shows error message on failure
  - [ ] Auto-disappears after 3 seconds

### Add to Cart Flow
- [ ] User not logged in
  - [ ] Login modal appears
  - [ ] After login, item can be added
  
- [ ] User logged in
  - [ ] Click "เพิ่มไปยังรถเข็น" button
  - [ ] Button shows "กำลังเพิ่ม..."
  - [ ] Button becomes disabled
  - [ ] Success message appears
  - [ ] Button becomes enabled again

- [ ] Multiple items from same shop
  - [ ] Can add multiple items
  - [ ] Each adds to cart (or updates quantity if same item)
  - [ ] No console errors

- [ ] Multiple items from different shops
  - [ ] Can add items from multiple shops
  - [ ] Each creates separate cart entry
  - [ ] No conflicts

## Database Tests

### MongoDB Atlas Verification
- [ ] Collection `carts` exists
- [ ] Document structure correct:
  ```json
  {
    "_id": ObjectId,
    "userId": ObjectId,
    "shopId": ObjectId,
    "varietyId": ObjectId,
    "price": Number,
    "quantity": Number,
    "status": String (pending/paid/cancelled),
    "createdAt": Date,
    "updatedAt": Date
  }
  ```
- [ ] Indexes created (if applicable)
- [ ] Sample data can be retrieved

## API Integration Tests (Postman/curl)

### Authentication
- [ ] Login with test credentials
- [ ] Get userId from response
- [ ] Note userId for subsequent tests

### Shop & Variety Data
- [ ] GET /api/shops → Get shopId
- [ ] GET /api/varieties → Get varietyId

### Cart Operations
- [ ] POST /api/cart
  - [ ] Create new cart item
  - [ ] Response contains created item
  - [ ] MongoDB shows new document

- [ ] GET /api/cart/:userId
  - [ ] Returns array of cart items
  - [ ] Items contain populated shop/variety data
  - [ ] Price matches what was sent

- [ ] PUT /api/cart/:cartId
  - [ ] Update quantity to 5
  - [ ] Verify change in response
  - [ ] Verify change in MongoDB

- [ ] DELETE /api/cart/:cartId
  - [ ] Item removed from response
  - [ ] Item removed from MongoDB
  - [ ] No error on delete

- [ ] DELETE /api/cart-clear/:userId
  - [ ] All items removed
  - [ ] deletedCount is correct
  - [ ] MongoDB shows no items for that user

## UI/UX Tests

### Visual Elements
- [ ] "เพิ่มไปยังรถเข็น" button visible on each shop card
- [ ] Button styling matches design
- [ ] Button text changes during loading
- [ ] Notification toast appears at correct position
- [ ] Toast styling correct for success/error

### User Experience
- [ ] Notification message is clear and helpful
- [ ] Loading state prevents double-click
- [ ] Error messages are descriptive
- [ ] Mobile responsive (test on mobile view)
- [ ] Desktop experience smooth

### Interaction
- [ ] Button click triggers API call
- [ ] Network tab shows correct API endpoint
- [ ] Request payload correct
- [ ] Response handled correctly
- [ ] No race conditions (multiple clicks)

## Edge Cases

- [ ] Add same item multiple times
  - [ ] First time creates
  - [ ] Second time updates quantity
  
- [ ] Add with extreme prices
  - [ ] Very large number (e.g., 999999)
  - [ ] Decimal number (e.g., 500.50)
  
- [ ] Add with invalid user
  - [ ] Should return error
  
- [ ] Add with invalid shop/variety
  - [ ] Should return error or handle gracefully
  
- [ ] Network errors during API call
  - [ ] Error message shown
  - [ ] Loading state clears
  - [ ] Can retry

## Performance Tests

- [ ] Load time on VarietyDetail page
- [ ] API response time for add to cart
- [ ] No memory leaks (check DevTools)
- [ ] No unnecessary re-renders (check React DevTools)

## Browser Compatibility

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## Accessibility Tests

- [ ] Button is keyboard accessible
- [ ] Button has proper aria-labels (if applicable)
- [ ] Notification is readable by screen readers
- [ ] Color contrast sufficient
- [ ] No keyboard traps

## Security Tests

- [ ] User cannot add items without authentication
- [ ] User can only see their own cart
- [ ] Price cannot be manipulated from frontend
- [ ] API validates all inputs
- [ ] No sensitive data exposed in logs

## Documentation Verification

- [ ] CART_SYSTEM_SUMMARY.md is accurate
- [ ] CART_SYSTEM_USER_GUIDE.md is helpful
- [ ] CART_API_TEST_GUIDE.md has correct endpoints
- [ ] Code comments are clear
- [ ] No broken references

## Known Issues & Notes

- [ ] (To be filled as issues found)

## Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Ready for deployment
- [ ] Date: ___________
- [ ] Tester: ___________
