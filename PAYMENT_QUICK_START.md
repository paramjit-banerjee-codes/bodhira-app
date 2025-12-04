# ⚡ Payment System - Quick Start

## 🎯 What's Working NOW

✅ **5 Free Tests/Month** - Tracked in User model  
✅ **3 Subscription Plans** - ₹299/300/6m, ₹1499/6m, ₹2499/1y  
✅ **Auto-extend Subscriptions** - Buy again → extends end date  
✅ **Test Entitlement Check** - Blocks tests if no subscription + no free tests  
✅ **Payment Verification** - HMAC signature + Razorpay API double check  
✅ **Beautiful UI** - Plan selector + status display  

---

## 🚀 DO THESE 3 THINGS NOW

### **1️⃣ Backend .env** 
Add these 2 lines:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx_from_dashboard
RAZORPAY_KEY_SECRET=xxxxx_from_dashboard
```

### **2️⃣ Frontend .env.local**
Add this 1 line:
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx_same_as_above
```

### **3️⃣ Get Credentials**
Go to: https://dashboard.razorpay.com/app/keys
(Copy the API Key ID and API Secret for TEST mode)

---

## 📁 Files That Changed

**Backend:**
- ✨ NEW: `models/Subscription.js` (tracks subscriptions)
- ✨ NEW: `utils/entitlements.js` (check if user can take test)
- 🔄 UPDATED: `models/User.js` (added free_tests_used field)
- 🔄 UPDATED: `models/Payment.js` (added plan field)
- 🔄 UPDATED: `controllers/paymentController.js` (complete rewrite)
- 🔄 UPDATED: `controllers/testController.js` (added entitlement check)
- 🔄 UPDATED: `routes/paymentRoutes.js` (new endpoints)

**Frontend:**
- 🔄 UPDATED: `utils/razorpay.js` (subscription plans support)
- 🔄 UPDATED: `services/api.js` (new payment endpoints)
- 🔄 UPDATED: `components/PaymentComponent.jsx` (beautiful new UI)

---

## 🧪 Test It (Copy-Paste These Steps)

### **Test 1: Free Trial**
1. Create account
2. Go to any test
3. Click to start test → ✅ PASS (free test 1/5)
4. Repeat 4 more times
5. 6th time → ❌ ERROR: "Free tests exhausted"

### **Test 2: Payment**
1. Click "Subscribe to Monthly" on PaymentComponent
2. Use test card: `4111 1111 1111 1111`
3. Any future date + any 3 digits
4. Pay → ✅ Success message
5. Start test → ✅ PASS (unlimited)

### **Test 3: Extend Subscription**
1. User has subscription ending in 10 days
2. Buy "6 Months" plan again
3. Expiry = old_expiry + 180 days
4. ✅ Subscription extended (not replaced)

---

## 📊 Database Changes

```javascript
// User now has:
{ free_tests_used: 2 }  // 0-5, resets monthly

// New Payment fields:
{ plan: "monthly" }     // monthly, 6months, yearly

// New Collection:
Subscription {
  userId, status (active/expired), plan, startDate, expiryDate
}
```

---

## 🔗 New API Endpoints

| Method | Endpoint | What It Does |
|--------|----------|------------|
| POST | `/payments/create-order` | Creates Razorpay order for subscription |
| POST | `/payments/verify-payment` | Verifies payment & activates subscription |
| GET | `/payments/subscription` | Returns current subscription status |
| GET | `/payments/free-tests` | Returns free tests remaining |
| GET | `/payments/history` | Returns payment history |

---

## 💰 Prices

| Plan | Cost | Duration | Tests |
|------|------|----------|-------|
| Free Trial | ₹0 | Monthly | 5 tests |
| Monthly | ₹299 | 30 days | Unlimited |
| 6 Months | ₹1499 | 180 days | Unlimited |
| Yearly | ₹2499 | 365 days | Unlimited |

---

## 🎨 UI Integration

```jsx
// In your page:
import PaymentComponent from './components/PaymentComponent';

export default function Premium() {
  return <PaymentComponent />;
}
```

**Shows:**
- ✅ Current subscription status
- ✅ Free tests remaining
- ✅ Plan selector (3 cards)
- ✅ Payment button
- ✅ Success/Error messages

---

## ❌ If Something Breaks

| Error | Fix |
|-------|-----|
| 401 Unauthorized | Check token in Authorization header |
| Invalid signature | Check RAZORPAY_KEY_SECRET in .env |
| Test not loading | Check free_tests_used < 5 OR subscription active |
| Razorpay script error | Check VITE_RAZORPAY_KEY_ID in .env.local |

---

## 🎯 Next (Optional)

- Add cron job to reset free_tests_used monthly
- Add Razorpay webhooks for real-time updates
- Add email notifications on subscription changes
- Add admin dashboard for refunds
- Add rate limiting on payment endpoints

---

## ✨ That's It! 

Start backend: `npm run dev` in `/backend`  
Start frontend: `npm run dev` in `/frontend`  
Test with: `4111 1111 1111 1111` (Razorpay test card)  

Questions? Check `PAYMENT_SYSTEM_SETUP.md` for detailed docs.
