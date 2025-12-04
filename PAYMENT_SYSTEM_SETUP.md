# Complete Payment System Setup & Implementation Guide

## 🎯 What Has Been Built

A complete **production-ready subscription payment system** using Razorpay with:

### 1. **Free Trial Model**
- Each user gets **5 free tests per month**
- Tracked via `User.free_tests_used` field
- Resets monthly (needs cron job for auto-reset)

### 2. **Subscription Plans (INR)**
- **Monthly**: ₹299 → 30 days unlimited tests
- **6 Months**: ₹1499 → 180 days unlimited tests
- **Yearly**: ₹2499 → 365 days unlimited tests

### 3. **Subscription Logic**
- Active subscription = unlimited tests
- If user buys while active → **extend** expiry date
- If expired → **create** new subscription
- Tracked via `Subscription` collection with indexes

### 4. **Entitlement Logic**
```
IF user has active subscription (now < expiryDate)
  → Allow test (unlimited)
ELSE IF free_tests_used < 5
  → Allow test + increment counter
ELSE
  → Block test (402 Payment Required)
```

---

## 📁 Files Created/Modified

### **Backend**

#### New Models:
1. **`backend/src/models/Subscription.js`** (NEW)
   - userId, status (active/expired/cancelled)
   - plan (monthly/6months/yearly)
   - startDate, expiryDate (indexed)
   - lastPaymentId reference

2. **`backend/src/models/User.js`** (MODIFIED)
   - Added: `free_tests_used` field (0-5, default 0)

3. **`backend/src/models/Payment.js`** (MODIFIED)
   - Added: `plan` field (enum: monthly/6months/yearly)

#### New Utilities:
4. **`backend/src/utils/entitlements.js`** (NEW)
   - `canStartTest(userId)` → {canStart, reason, testsRemaining}
   - `incrementFreeTestsUsed(userId)` → increments counter
   - `resetMonthlyFreeTests(userId)` → resets to 0

#### Updated Controllers:
5. **`backend/src/controllers/paymentController.js`** (REPLACED)
   - `createOrder(plan)` → Creates Razorpay order for subscription
   - `verifyPayment()` → Verifies signature + creates/extends subscription
   - `getSubscription()` → Returns current subscription status
   - `getFreeTests()` → Returns free tests remaining
   - `getPaymentHistory()` → Payment history

6. **`backend/src/controllers/testController.js`** (MODIFIED)
   - Added entitlement check in `getTest()` function
   - Calls `canStartTest()` before allowing access
   - Increments free tests if using trial
   - Returns 402 if no entitlement

#### Updated Routes:
7. **`backend/src/routes/paymentRoutes.js`** (REPLACED)
   - POST `/create-order` → Create subscription order
   - POST `/verify-payment` → Verify & activate subscription
   - GET `/subscription` → Get current subscription
   - GET `/free-tests` → Get free tests status
   - GET `/history` → Payment history

### **Frontend**

#### Updated Utilities:
8. **`frontend/src/utils/razorpay.js`** (REPLACED)
   - Exported `PLANS` object with pricing & validity
   - `openRazorpayCheckout()` → Opens Razorpay checkout modal
   - `processSubscriptionPayment(plan)` → Main payment function
   - Works with 3 plans: monthly, 6months, yearly

#### Updated Services:
9. **`frontend/src/services/api.js`** (MODIFIED)
   - Updated `paymentAPI` with new endpoints
   - New methods: `getSubscription()`, `getFreeTests()`
   - Changed verify endpoint to `/verify-payment`

#### Updated Components:
10. **`frontend/src/components/PaymentComponent.jsx`** (REPLACED)
    - Beautiful UI showing subscription status
    - Free tests remaining display
    - Plan selector (3 cards)
    - Real-time entitlement fetching

---

## ✅ Setup Steps (CRITICAL!)

### **Step 1: Backend Environment Variables**
Add to `backend/.env`:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```
Get these from: https://dashboard.razorpay.com/app/keys

### **Step 2: Frontend Environment Variables**
Add to `frontend/.env.local`:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```
(Must be same as backend KEY_ID)

### **Step 3: Verify Razorpay Package**
✅ Already installed: `npm list razorpay` shows `razorpay@2.9.6`

### **Step 4: Test the Backend**
```bash
cd backend
npm run dev
# Should start without errors
```

### **Step 5: Test the Frontend**
```bash
cd frontend
npm run dev
# Should start without errors
```

### **Step 6: Test with Razorpay Test Credentials**
Use these test cards (no real deduction):
- Card: **4111 1111 1111 1111**
- Expiry: **Any future date** (e.g., 12/25)
- CVV: **Any 3 digits** (e.g., 123)
- OTP (if asked): **123456**

---

## 🧪 Testing Workflow

### **1. Test Free Trial**
1. Create new user account
2. Try to start a test
3. ✅ Should pass (1st free test)
4. Repeat 4 more times → 5 tests passed
5. Try 6th time → ❌ Should fail with "Free tests exhausted"

### **2. Test Payment Flow**
1. Click "Subscribe to Monthly"
2. Fill Razorpay checkout with test card (4111 1111 1111 1111)
3. Complete payment
4. ✅ Subscription should activate
5. Start test → ✅ Should pass (unlimited)

### **3. Test Subscription Extension**
1. User has active subscription ending in 10 days
2. Buy another "6 Months" plan
3. New expiry should be: (old_expiry + 180 days)
4. ✅ Subscription extended, not replaced

### **4. Test Free Tests Reset**
1. Use all 5 free tests
2. Next month (simulate date change or manual reset)
3. `free_tests_used` should reset to 0
4. ✅ Can take 5 free tests again

---

## 🔌 API Endpoints Reference

### **Create Subscription Order**
```bash
POST /api/payments/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan": "monthly"  // or "6months", "yearly"
}

Response:
{
  "success": true,
  "orderId": "order_ABC123",
  "amount": 299,
  "currency": "INR",
  "plan": "monthly",
  "paymentId": "payment_doc_id"
}
```

### **Verify Payment**
```bash
POST /api/payments/verify-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_XYZ789",
  "razorpaySignature": "signature_hash"
}

Response:
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "payment": {
    "_id": "payment_doc_id",
    "amount": 299,
    "plan": "monthly",
    "status": "success"
  },
  "subscription": {
    "_id": "subscription_doc_id",
    "plan": "monthly",
    "expiryDate": "2025-01-02T...",
    "status": "active"
  }
}
```

### **Get Subscription Status**
```bash
GET /api/payments/subscription
Authorization: Bearer {token}

Response:
{
  "success": true,
  "subscription": {
    "_id": "subscription_doc_id",
    "plan": "monthly",
    "status": "active",
    "startDate": "2024-12-02T...",
    "expiryDate": "2025-01-02T...",
    "daysRemaining": 31
  }
}
```

### **Get Free Tests Status**
```bash
GET /api/payments/free-tests
Authorization: Bearer {token}

Response:
{
  "success": true,
  "freeTestsUsed": 3,
  "freeTestsRemaining": 2,
  "freeTestsTotal": 5
}
```

### **Try to Start Test (Entitlement Check)**
```bash
GET /api/tests/{testId}
Authorization: Bearer {token}

Response (No entitlement):
{
  "success": false,
  "error": "You do not have entitlement to take this test",
  "reason": "no_entitlement",
  "status": 402
}
```

---

## 📊 Database Schema

### **User Collection**
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  // ... existing fields
  free_tests_used: 2,           // (NEW) 0-5, resets monthly
  createdAt: Date,
  updatedAt: Date
}
```

### **Subscription Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // (Unique index)
  status: "active",             // active, expired, cancelled
  plan: "monthly",              // monthly, 6months, yearly
  startDate: Date,
  expiryDate: Date,             // (Indexed)
  lastPaymentId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **Payment Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: 299,
  currency: "INR",
  plan: "monthly",              // (NEW)
  status: "success",            // pending, success, failed
  razorpayOrderId: "order_ABC",
  razorpayPaymentId: "pay_XYZ",
  razorpaySignature: "sig_hash",
  description: "Monthly subscription - ₹299",
  email: "user@example.com",
  failureReason: null,
  createdAt: Date,
  completedAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Integration Examples

### **In Your App (e.g., Premium Page)**
```jsx
import PaymentComponent from './components/PaymentComponent';

export default function PremiumPage() {
  return (
    <div>
      <h1>Premium Plans</h1>
      <PaymentComponent />
    </div>
  );
}
```

### **Check Entitlement Before Showing Test**
```jsx
import { paymentAPI } from './services/api';

async function checkEntitlement() {
  try {
    const response = await paymentAPI.getSubscription();
    const subscription = response.data.subscription;
    
    if (subscription?.status === 'active') {
      console.log('✅ User has active subscription');
      return true;
    }
    
    const freeTests = await paymentAPI.getFreeTests();
    if (freeTests.data.freeTestsRemaining > 0) {
      console.log('✅ User has free tests remaining');
      return true;
    }
    
    console.log('❌ No entitlement - show payment button');
    return false;
  } catch (error) {
    console.error('Error checking entitlement:', error);
  }
}
```

### **Show Smart UI Based on Status**
```jsx
const { subscription, freeTests } = usePaymentStatus();

return (
  <>
    {subscription?.status === 'active' ? (
      <div>✅ Premium: Unlimited tests until {subscription.expiryDate}</div>
    ) : freeTests?.freeTestsRemaining > 0 ? (
      <div>⏱️  Free trial: {freeTests.freeTestsRemaining} tests left</div>
    ) : (
      <button onClick={handlePayment}>Subscribe to continue</button>
    )}
  </>
);
```

---

## 🔐 Security Checklist

✅ **Implemented:**
- HMAC SHA256 signature verification
- Double verification with Razorpay API
- JWT authentication on all payment endpoints
- No sensitive data (signatures) returned to frontend
- Proper error handling and logging
- User isolation (userId checks)

⚠️ **Recommended (Not Implemented - Optional):**
- Rate limiting on payment endpoints
- Razorpay webhook for payment reconciliation
- Email notifications on subscription changes
- Payment retry logic for failed payments
- Admin dashboard for refunds

---

## 🐛 Troubleshooting

### **Issue: Payment endpoint returns 401 Unauthorized**
**Solution:** Ensure frontend sends `Authorization: Bearer {token}` header

### **Issue: "Invalid signature" error**
**Solution:** Check RAZORPAY_KEY_SECRET is correct and same on backend

### **Issue: Test entitlement always fails**
**Solution:** 
- Check user `free_tests_used` value in database
- Check if subscription exists and `expiryDate > now`
- Check authentication middleware working

### **Issue: Razorpay script not loading**
**Solution:** Check VITE_RAZORPAY_KEY_ID is set in `frontend/.env.local`

### **Issue: Subscription not extending**
**Solution:** Check existing subscription has `status: "active"` and `expiryDate > now`

---

## 📋 Next Steps (What User Should Do)

1. ✅ **Verify Environment Variables**
   - Check `backend/.env` has RAZORPAY_KEY_ID and KEY_SECRET
   - Check `frontend/.env.local` has VITE_RAZORPAY_KEY_ID

2. ✅ **Start Backend**
   ```bash
   cd backend && npm run dev
   ```

3. ✅ **Start Frontend**
   ```bash
   cd frontend && npm run dev
   ```

4. ✅ **Test Payment Flow**
   - Create account
   - Try free tests (should pass 5 times)
   - Try 6th test (should fail)
   - Subscribe and verify unlimited access

5. 🔄 **Optional: Add Monthly Reset Cron**
   ```javascript
   // backend/src/jobs/resetFreeTests.js
   // Run once per month: User.updateMany({ free_tests_used: 0 })
   ```

6. 🔄 **Optional: Add Payment Webhooks**
   ```javascript
   // webhook for real-time reconciliation
   ```

---

## 📞 Quick Reference

**Pricing:**
- Monthly: ₹299 (30 days)
- 6 Months: ₹1499 (180 days)
- Yearly: ₹2499 (365 days)

**Free Trial:**
- 5 tests/month free
- Auto-reset needed

**Statuses:**
- `402 Payment Required` - No entitlement
- `success` - Payment processed
- `pending` - Waiting for verification
- `failed` - Payment failed
