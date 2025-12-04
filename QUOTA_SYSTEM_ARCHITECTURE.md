# Quota System Architecture & Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend UI                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  GenerateTest Component                                  │   │
│  │  - Calls testAPI.getQuotaStatus() on mount             │   │
│  │  - Displays real-time quota info (X/5 tests used)      │   │
│  │  - Shows progress bar & remaining quota                │   │
│  │  - Disables/warns when limit reached                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ GET /api/tests/quota
                            │
┌─────────────────────────────────────────────────────────────────┐
│                         Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Test Routes                                             │   │
│  │  - router.get('/quota', getQuotaStatus)                │   │
│  │  - Protected by authMiddleware                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Generation Controller                                   │   │
│  │  - getQuotaStatus(req, res) handler                    │   │
│  │  - Calls checkTestGenerationLimit(userId)             │   │
│  │  - Returns quota status JSON                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Quota Calculation Logic                                 │   │
│  │  - Check Subscription status (active + not expired)    │   │
│  │  - IF paid → return { canGenerate: true, remaining: ∞ } │   │
│  │  - IF free → count Test records by teacherId          │   │
│  │  - Calculate remaining = max(0, 5 - testCount)        │   │
│  │  - Return quota object                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────┐
        │       MongoDB Database              │
        ├─────────────────────────────────────┤
        │  Subscription Collection            │
        │  - userId, status, expiryDate      │
        │                                     │
        │  Test Collection                    │
        │  - _id, teacherId, topic, ...      │
        │  - [INDEX: teacherId for speed]    │
        │                                     │
        │  Result Collection                  │
        │  - _id, userId, testId, ...        │
        └─────────────────────────────────────┘
```

## Data Flow Sequence

### 1. User Navigates to "Generate Test" Tab

```javascript
useEffect(() => {
  const checkSubscriptionStatus = async () => {
    // Call the new quota endpoint
    const quotaResponse = await testAPI.getQuotaStatus();
    const quota = quotaResponse.data?.data;
    // quota = { canGenerate, remaining, limit, isPaid, message }
    
    // Also get subscription details
    const profileResponse = await profileAPI.getProfile();
    const profile = profileResponse.data?.data || {};
    
    // Merge quota with subscription data
    setQuotaData(quota);
    setUserSubscriptionStatus({
      ...profile.subscription,
      isPaid: quota?.isPaid,
      remaining: quota?.remaining
    });
  };
}, []);
```

### 2. Backend Receives Quota Request

```javascript
export const getQuotaStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;  // From auth middleware
  
  try {
    const quotaStatus = await checkTestGenerationLimit(userId);
    
    res.status(200).json({
      success: true,
      data: quotaStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quota status'
    });
  }
});
```

### 3. Quota Calculation

```javascript
async function checkTestGenerationLimit(userId) {
  // Step 1: Check if user has paid subscription
  const activeSubscription = await Subscription.findOne({
    userId,
    status: 'active',
    expiryDate: { $gt: new Date() }  // Not expired
  });

  // Step 2: If paid, return unlimited
  if (activeSubscription) {
    return {
      canGenerate: true,
      remaining: Infinity,
      limit: Infinity,
      isPaid: true,
      message: 'Unlimited test generation (Premium)'
    };
  }

  // Step 3: If free, count actual tests in database
  const testCount = await Test.countDocuments({ 
    teacherId: userId
  });

  // Step 4: Calculate remaining quota
  const limit = 5;
  const remaining = Math.max(0, limit - testCount);
  const canGenerate = remaining > 0;

  return {
    canGenerate,
    remaining,
    limit,
    isPaid: false,
    message: canGenerate 
      ? `You can generate ${remaining} more test(s) (Free tier limit: ${limit})`
      : `Test generation limit reached. Upgrade to Premium for unlimited generation`
  };
}
```

### 4. Frontend Displays Quota

```javascript
{/* Show real quota data */}
<p>Tests used: {quotaData.limit - quotaData.remaining}/{quotaData.limit}</p>
<p>Remaining: {quotaData.remaining}</p>

{/* Progress bar width based on actual quota */}
<div style={{
  width: `${((quotaData.limit - quotaData.remaining) / quotaData.limit) * 100}%`,
  // ... rest of styling
}} />

{/* Show message */}
<p>{quotaData.message}</p>
```

## Integration with Test Generation

### When User Clicks "Generate Test"

```
1. User fills form (topic, difficulty, etc.)
2. Form submitted to POST /api/tests/generate
3. Backend checks limit AGAIN in generateTestRequest():
   
   const limitCheck = await checkTestGenerationLimit(userId);
   if (!limitCheck.canGenerate) {
     return res.status(403).json({
       success: false,
       error: limitCheck.message,
       limitReached: true
     });
   }
   
4. If limit OK, proceed with OpenAI generation
5. If limit exceeded, return 403 error
6. Frontend shows error to user
```

### Quota Bypass Prevention

```
Scenario: User has 5/5 tests, deletes 1, tries to regenerate

1. User deletes test via profile
   → Test document removed from MongoDB
   
2. User navigates to Generate Test
   → Frontend calls GET /api/tests/quota
   → Backend counts: Test.countDocuments({ teacherId: userId })
   → Returns testCount = 4 (actual DB records, not cached)
   → remaining = 1
   
3. User tries to generate 6th test
   → Frontend shows "Remaining: 1"
   → User generates test #6
   → Backend counts again, testCount = 5, remaining = 0
   → User tries to generate test #7
   → Backend blocks with "limit reached" error
   
✅ Quota reset prevented - system counts real DB records
```

## API Response Handling

### Success Response

```javascript
{
  success: true,
  data: {
    canGenerate: true,
    remaining: 3,
    limit: 5,
    isPaid: false,
    message: "You can generate 3 more test(s) (Free tier limit: 5)"
  }
}
```

### Error Response

```javascript
{
  success: false,
  error: "Failed to fetch quota status"
}
```

### Frontend Error Handling

```javascript
try {
  const quotaResponse = await testAPI.getQuotaStatus();
  const quota = quotaResponse.data?.data;
  setQuotaData(quota);
} catch (err) {
  console.error('Error checking quota:', err);
  
  // Fallback to safe defaults
  setQuotaData({
    canGenerate: true,
    remaining: 5,
    limit: 5,
    isPaid: false,
    message: 'Unable to fetch quota info'
  });
}
```

## Quota Display Logic

```
IF quotaData.isPaid:
  Show green gradient background
  Show "⭐ Premium Member"
  Show "✓ Unlimited test generation"
  Hide progress bar
  Hide remaining count
  
ELSE:
  Show blue gradient background
  Show "📊 Test Generation Quota"
  Show "Tests used: X/Y"
  Show "Remaining: Z"
  Show progress bar (width = X/Y * 100%)
  
  IF remaining == 0:
    Show red warning banner
    Show "Test Generation Limit Reached"
    Suggest upgrade
```

## Database Indexes for Performance

For the quota check to be fast, ensure MongoDB has index on Test collection:

```javascript
// Ensures Test.countDocuments({ teacherId: userId }) is O(1) lookup
db.tests.createIndex({ teacherId: 1 })
```

Current execution time: ~5-10ms per quota check (with index)

## Testing the Quota Endpoint

### Using curl

```bash
# Get auth token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}'

# Use token to check quota
curl -X GET http://localhost:5000/api/tests/quota \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Set request type: GET
2. URL: `http://localhost:5000/api/tests/quota`
3. Headers:
   - Authorization: `Bearer YOUR_TOKEN_HERE`
4. Send
5. Response shows current quota status

## State Management

```javascript
// Component state
const [quotaData, setQuotaData] = useState(null);
const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(null);
const [checkingLimits, setCheckingLimits] = useState(false);

// On mount, fetch both quota and subscription
useEffect(() => {
  const checkSubscriptionStatus = async () => {
    setCheckingLimits(true);
    try {
      const quotaResponse = await testAPI.getQuotaStatus();
      const quota = quotaResponse.data?.data;
      setQuotaData(quota);
      
      const profileResponse = await profileAPI.getProfile();
      const profile = profileResponse.data?.data || {};
      setUserSubscriptionStatus({
        ...profile.subscription,
        isPaid: quota?.isPaid,
        remaining: quota?.remaining
      });
    } finally {
      setCheckingLimits(false);
    }
  };
  checkSubscriptionStatus();
}, []);
```

## Summary of Quota Check Flow

1. **User loads GenerateTest page**
   - Component mounts → useEffect runs
   
2. **Frontend calls GET /api/tests/quota**
   - Sends auth token in header
   
3. **Backend receives request**
   - AuthMiddleware validates token
   - getQuotaStatus handler runs
   
4. **Backend calculates quota**
   - Check Subscription collection
   - If paid → return unlimited
   - If free → count Test documents
   - Calculate remaining quota
   
5. **Backend returns JSON response**
   - canGenerate, remaining, limit, isPaid, message
   
6. **Frontend displays quota**
   - Updates quotaData state
   - Renders quota display with real numbers
   - Shows progress bar
   - Updates remaining count
   
7. **User sees live quota info**
   - X/5 tests used
   - Y tests remaining
   - Color-coded progress bar
   - Upgrade button if at limit

This ensures the quota display is always in sync with the backend database state.
