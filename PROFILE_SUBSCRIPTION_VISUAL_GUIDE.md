# Profile Subscription Feature - Visual Guide

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Profile Header (Name, Avatar, Stats)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📚 Your Learning Profile / 📊 Teaching Performance         │
│  (Existing sections)                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  💳 Subscription Plans                                       │
│                                                               │
│  ✅ ACTIVE SUBSCRIPTION (if user has subscription)          │
│  ├─ Plan: Monthly/6 Months/Yearly                           │
│  └─ Expires: Dec 31, 2025 (45 days remaining)               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Three Plan Cards (Grid Layout)                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 📅 Monthly   │  │ 📅 6 Months  │  │ 📅 Yearly    │       │
│  │ 30 days      │  │ 180 days     │  │ 365 days     │       │
│  │              │  │              │  │              │       │
│  │ ₹299         │  │ ₹1499        │  │ ₹2499        │       │
│  │ ₹9.97/day    │  │ ₹8.33/day    │  │ ₹6.84/day    │       │
│  │              │  │              │  │              │       │
│  │ [Buy Now]    │  │ [Buy Now]    │  │ [Buy Now]    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  🚪 Logout                                                   │
│  Last login: Nov 28, 02:15 PM                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Desktop (3+ columns)
```
[Plan 1] [Plan 2] [Plan 3]
```

### Tablet (2 columns)
```
[Plan 1] [Plan 2]
[Plan 3]
```

### Mobile (1 column)
```
[Plan 1]
[Plan 2]
[Plan 3]
```

---

## 🔄 Payment Flow Diagram

```
User on Profile
       ↓
    Clicks "Buy Now" (Monthly)
       ↓
Button → "Processing..."
       ↓
API Call: POST /api/payments/create-order
       ↓
Backend Creates Razorpay Order
       ↓
Returns: orderId, amount, paymentId
       ↓
Razorpay Standard Checkout Opens
       ↓
    User Selects Payment Method:
    ├─ UPI (GPay/PhonePe/Paytm)
    ├─ Card (Debit/Credit/RuPay)
    ├─ Wallet (Paytm/PhonePe)
    └─ Netbanking (60+ banks)
       ↓
User Completes Payment
       ↓
Frontend Verifies Signature
       ↓
API Call: POST /api/payments/verify-payment
       ↓
Backend Creates Subscription
       ↓
Success! Subscription Active
       ↓
Profile Refreshes to Show:
├─ ✅ Active Subscription Box
├─ Plan Type
├─ Expiry Date
└─ Days Remaining (e.g., 30 days)
```

---

## 🎯 User Journey

### First-Time Subscriber
1. Visit Profile page
2. Scroll to "💳 Subscription Plans"
3. Choose a plan (e.g., Monthly ₹299)
4. Click "Buy Now"
5. Select payment method (e.g., Google Pay)
6. Complete payment on Razorpay
7. See "✅ Active Subscription" box appear
8. Start taking unlimited tests

### Existing Subscriber
1. Visit Profile page
2. See "✅ Active Subscription" at top
3. View expiry date and remaining days
4. Can upgrade to longer plan by clicking "Buy Now" (subscription extends)
5. Renewed subscription shows updated expiry date

---

## 💾 Data Displayed

### Active Subscription Card (Green Box)
```
✅ Active Subscription
Plan: Yearly
Expires: Dec 31, 2025 (365 days)
```

### Plan Cards
```
Plan Name:    Monthly / 6 Months / Yearly
Validity:     30 / 180 / 365 days
Price:        ₹299 / ₹1499 / ₹2499
Per Day Cost: ₹9.97 / ₹8.33 / ₹6.84
Button:       Buy Now
```

---

## 🎨 Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Active Subscription Box | Green (#10b981) | Success state |
| Plan Cards | Blue (#3b82f6) | Primary action |
| Price Display | Blue (#60a5fa) | Highlight |
| Text Primary | Light (#e2e8f0) | Main text |
| Text Secondary | Gray (#94a3b8) | Helper text |
| Button | Blue Gradient | Action |
| Button Disabled | Blue (0.6 opacity) | Loading state |

---

## ⌨️ Keyboard Navigation

- **Tab**: Navigate between "Buy Now" buttons
- **Enter**: Submit selected plan
- **Escape**: Close any modals

---

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ Button labels clear
- ✅ Color contrast meets WCAG AA
- ✅ Focus indicators visible
- ✅ Loading states announced
- ✅ Error messages displayed

---

## 🧪 Testing Scenarios

### Scenario 1: No Active Subscription
1. Open Profile
2. No green "Active Subscription" box
3. Three plan cards visible with "Buy Now" buttons
4. Click "Buy Now" → payment flow starts

### Scenario 2: Active Monthly Subscription
1. Open Profile
2. Green box shows: "Plan: Monthly | Expires: Dec 31 (30 days)"
3. Can still buy other plans to extend
4. Click "Buy Now (Yearly)" → subscription extends by 365 days

### Scenario 3: Payment Failure
1. Open Profile
2. Click "Buy Now"
3. Razorpay modal opens
4. User cancels or payment fails
5. Button returns to "Buy Now"
6. No subscription created
7. Error message shown (optional)

### Scenario 4: Responsive Design
1. Desktop: 3 plan cards in one row
2. Tablet: 2 plan cards + 1 below
3. Mobile: 1 plan card per row, full width

---

## 📊 State Management

```javascript
// State
subscription: {
  _id: "...",
  plan: "monthly",          // or "6months" or "yearly"
  status: "active",         // or "expired"
  startDate: "2025-01-01",
  expiryDate: "2025-01-31",
  daysRemaining: 30
}

subscribing: null           // or "monthly" (loading state)
```

---

## 🔧 Technical Stack

- **Frontend Framework**: React
- **State Management**: useState hooks
- **API Client**: Axios (via paymentAPI)
- **Payment Gateway**: Razorpay Standard Checkout
- **Styling**: Inline CSS + existing CSS classes
- **Authentication**: JWT via API interceptor

---

## ✅ Checklist

- [x] UI components added
- [x] State management implemented
- [x] API integration working
- [x] Payment flow connected
- [x] Subscription status display
- [x] Error handling included
- [x] Loading states implemented
- [x] Responsive design
- [x] Documentation created
- [x] No breaking changes
- [x] Production-ready
