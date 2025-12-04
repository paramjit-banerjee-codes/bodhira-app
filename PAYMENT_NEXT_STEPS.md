# 🚀 PAYMENT SYSTEM - NEXT STEPS CHECKLIST

## What You Need To Do RIGHT NOW

### ✅ Step 1: Environment Variables (5 minutes)

**Backend - `backend/.env`**
```
Add these 2 lines:
RAZORPAY_KEY_ID=your_api_key_id_from_dashboard
RAZORPAY_KEY_SECRET=your_api_secret_from_dashboard
```

**Frontend - `frontend/.env.local`**
```
Add this 1 line:
VITE_RAZORPAY_KEY_ID=your_api_key_id_from_dashboard
```

**How to get credentials:**
1. Open https://dashboard.razorpay.com/app/keys
2. Make sure you're in **TEST MODE** (toggle on top right)
3. Copy "API Key ID" (starts with rzp_test_)
4. Copy "API Secret"
5. Paste into the .env files above

---

### ✅ Step 2: Start Backend (2 minutes)

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Server running on port 5000
✅ MongoDB connected
✅ Routes initialized
```

**If it fails:**
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env
- Check MongoDB connection
- Check no other app running on port 5000

---

### ✅ Step 3: Start Frontend (2 minutes)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
✅ Vite dev server running at http://localhost:5173
✅ Frontend compiled successfully
```

**If it fails:**
- Check VITE_RAZORPAY_KEY_ID in frontend/.env.local
- Check node_modules installed
- Check no other app running on port 5173

---

### ✅ Step 4: Test Free Trial (5 minutes)

1. Open http://localhost:5173
2. Create account (email, password, handle)
3. Go to take a test
4. Click "Start Test"
5. **Expected**: ✅ Test loads (Free test 1/5)
6. Back to dashboard
7. Repeat 4 more times (take 5 free tests total)
8. Try 6th test
9. **Expected**: ❌ Error message "Free tests exhausted"

**If test 1-5 works but 6th fails:**
✅ **Free trial logic is CORRECT**

**If you can take unlimited tests without payment:**
❌ **Problem**: Check free_tests_used counter in database

---

### ✅ Step 5: Test Payment (10 minutes)

1. After 5 free tests are used
2. Try to start another test
3. **Expected**: ❌ Error + "Subscribe to continue" button
4. Click subscribe button OR navigate to PaymentComponent
5. Select "Monthly" plan (₹299)
6. Click "Subscribe to Monthly - ₹299"
7. Razorpay checkout modal appears
8. Enter test card:
   - Number: `4111 1111 1111 1111`
   - Expiry: `12/25` (or any future date)
   - CVV: `123` (any 3 digits)
9. Click "Pay"
10. OTP page (if asked): Enter `123456`
11. **Expected**: ✅ Success message "Payment successful!"

**If payment succeeds:**
✅ **Payment system is WORKING**

---

### ✅ Step 6: Test Unlimited After Payment (5 minutes)

1. After payment success
2. Go to take another test
3. **Expected**: ✅ Test loads (no error)
4. Complete test
5. **Expected**: ✅ Result shows
6. Go to PaymentComponent
7. **Expected**: ✅ Shows "Subscription: Active" with expiry date

**If this works:**
✅ **Entitlement system is WORKING**

---

### ✅ Step 7: Test Subscription Extension (5 minutes)

1. User already has active subscription (ends 2025-01-02)
2. Subscribe again to "6 Months" (₹1499)
3. Pay with test card
4. **Expected**: ✅ Success (subscription extended)
5. Check database: `db.subscriptions.findOne({ userId: ... })`
6. **Expected**: `expiryDate = 2025-01-02 + 180 days`

**If expiry extended (not replaced):**
✅ **Subscription extension is WORKING**

---

## 🎯 Verification Checklist

Before marking as complete, verify:

**Backend:**
- [ ] `backend/.env` has RAZORPAY_KEY_ID
- [ ] `backend/.env` has RAZORPAY_KEY_SECRET
- [ ] `backend/src/models/Subscription.js` exists
- [ ] `backend/src/utils/entitlements.js` exists
- [ ] `npm run dev` starts without errors
- [ ] No port 5000 conflicts

**Frontend:**
- [ ] `frontend/.env.local` has VITE_RAZORPAY_KEY_ID
- [ ] `npm run dev` starts without errors
- [ ] No port 5173 conflicts
- [ ] PaymentComponent loads without errors

**Database:**
- [ ] User collection has `free_tests_used` field
- [ ] Payment collection has `plan` field
- [ ] Subscription collection created
- [ ] MongoDB connection working

**Functionality:**
- [ ] Free trial works (5 tests then blocked)
- [ ] Payment flow works (card accepted)
- [ ] Subscription activates (unlimited tests)
- [ ] Subscription extends (doesn't replace)
- [ ] Entitlement check works (blocks without payment)

---

## 🧪 Test Scenarios

### Scenario A: New User (No Subscription)
```
1. Create account
2. Try test 1 → ✅ PASS (free)
3. Try test 6 → ❌ BLOCKED (needs payment)
4. Subscribe
5. Try test 6 → ✅ PASS (paid)
```

### Scenario B: Existing Subscriber
```
1. Create account
2. Subscribe to Monthly
3. Try test 1 → ✅ PASS (unlimited)
4. Try test 100 → ✅ PASS (unlimited)
```

### Scenario C: Extension
```
1. User has subscription (expires 2025-01-02)
2. Subscribe to 6 Months
3. New expiry = 2025-07-03
4. Days extended = 180
```

---

## ❌ Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing env vars | "Razorpay key is undefined" | Add RAZORPAY_KEY_ID and KEY_SECRET to .env |
| Wrong key | "Invalid signature" error | Use TEST mode keys from dashboard |
| Database not connected | "MongoDB connection failed" | Check MongoDB running locally |
| Port conflict | "Port 5000 already in use" | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Stale code | Old behavior after changes | Clear node_modules: `rm -rf node_modules && npm install` |
| Free tests not working | Can take infinite free tests | Check `free_tests_used` field in User model |

---

## 📊 Expected Results

### Test Sequence Timeline
```
00:00 - Create account
00:05 - Take test 1 (free) → free_tests_used = 1
00:10 - Take test 2 (free) → free_tests_used = 2
00:15 - Take test 3 (free) → free_tests_used = 3
00:20 - Take test 4 (free) → free_tests_used = 4
00:25 - Take test 5 (free) → free_tests_used = 5
00:30 - Try test 6 → ❌ BLOCKED (402 Payment Required)
00:35 - Subscribe to Monthly (₹299)
00:40 - Payment verified ✅
00:45 - Try test 6 → ✅ PASS (unlimited)
00:50 - Take 10 more tests → ✅ ALL PASS
```

---

## 🎨 UI Checklist

**PaymentComponent should show:**
- [ ] Subscription status (Active/Expired/None)
- [ ] Days remaining (if active)
- [ ] Free tests used (X / 5)
- [ ] 3 plan cards (Monthly/6 Months/Yearly)
- [ ] Subscribe button
- [ ] Success/error messages

**Test page should show:**
- [ ] "Start Test" button (if entitled)
- [ ] "Subscribe" button (if not entitled)
- [ ] Error message (if blocked)

---

## 🔐 Security Verification

**Check these are implemented:**
- [ ] JWT token required on all payment endpoints
- [ ] Razorpay signature verified with HMAC
- [ ] Double verification with Razorpay API
- [ ] userId check (users can't access others' data)
- [ ] No sensitive data (signatures) returned
- [ ] Error messages don't leak sensitive info

---

## 📈 Performance Checklist

- [ ] API responses < 200ms
- [ ] Payment creation < 500ms
- [ ] Payment verification < 1000ms
- [ ] Test loading with entitlement check < 300ms
- [ ] No N+1 queries (indexes on userId, expiryDate)

---

## ✨ Completion Criteria

Mark as COMPLETE when:
1. ✅ Environment variables configured
2. ✅ Backend starts without errors
3. ✅ Frontend starts without errors
4. ✅ Free trial works (5 tests)
5. ✅ Payment flow works (card accepted)
6. ✅ Unlimited tests work after payment
7. ✅ Subscription extends on repurchase
8. ✅ All 4 test scenarios pass
9. ✅ PaymentComponent displays correctly
10. ✅ No console errors

---

## 📞 Need Help?

**Documentation:**
- `PAYMENT_IMPLEMENTATION_COMPLETE.md` - Full details
- `PAYMENT_SYSTEM_SETUP.md` - Detailed setup
- `PAYMENT_QUICK_START.md` - Quick reference

**Razorpay Docs:**
- https://razorpay.com/docs/payments/

**Check Logs:**
```bash
# Backend logs
tail -f backend/logs/*.log

# Frontend console
Open DevTools (F12) → Console tab
```

---

## 🎯 Final Steps

1. ✅ Add environment variables
2. ✅ Start backend: `npm run dev` (backend/)
3. ✅ Start frontend: `npm run dev` (frontend/)
4. ✅ Run 7-step test sequence above
5. ✅ Verify all 4 scenarios pass
6. ✅ Mark as COMPLETE

**That's it! Your payment system is live. 🚀**
