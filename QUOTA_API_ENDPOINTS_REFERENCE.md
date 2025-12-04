# API Endpoints Reference

## New Endpoint Added

### Get Test Generation Quota Status

**Endpoint:** `GET /api/tests/quota`

**Authentication:** Required - Bearer token in Authorization header

**Request:**
```
GET /api/tests/quota
Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "canGenerate": true,
    "remaining": 3,
    "limit": 5,
    "isPaid": false,
    "message": "You can generate 3 more test(s) (Free tier limit: 5)"
  }
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch quota status"
}
```

**Response Unauthorized (401):**
```json
{
  "success": false,
  "error": "Invalid token. Authorization denied."
}
```

---

## Related Endpoints (Existing, Uses Quota)

### Generate Test

**Endpoint:** `POST /api/tests/generate`

**Authentication:** Required

**Request:**
```json
{
  "topic": "Mathematics",
  "difficulty": "medium",
  "numberOfQuestions": 10,
  "provided_content": ""
}
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Test generated successfully",
  "data": {
    "_id": "...",
    "testId": "...",
    "testCode": "ABC123",
    "title": "Math Quiz",
    "topic": "Mathematics",
    "difficulty": "medium",
    "questions": [...],
    "totalQuestions": 10,
    "duration": 60,
    "isPublished": false,
    "createdAt": "2025-12-03T..."
  }
}
```

**Response Error - Quota Exceeded (403 Forbidden):**
```json
{
  "success": false,
  "error": "Test generation limit reached. Upgrade to Premium for unlimited generation",
  "limitReached": true,
  "isPaid": false,
  "remaining": 0,
  "limit": 5
}
```

### Generate Classroom Test

**Endpoint:** `POST /api/classrooms/:classroomId/tests/generate`

**Authentication:** Required

**Request:**
```json
{
  "topic": "Science",
  "difficulty": "hard",
  "numberOfQuestions": 20,
  "provided_content": ""
}
```

**Response:** Same as Generate Test (also respects quota limit)

**Response Error - Quota Exceeded (403):**
```json
{
  "success": false,
  "error": "Test generation limit reached. Upgrade to Premium for unlimited generation",
  "limitReached": true
}
```

---

## Common Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Quota check successful |
| 201 | Created | Test generated successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Quota limit exceeded |
| 500 | Server Error | Backend error |

---

## Frontend API Usage

### JavaScript/React Example

```javascript
import { testAPI } from '../services/api';

// Check quota
try {
  const response = await testAPI.getQuotaStatus();
  const quotaData = response.data?.data;
  
  console.log(`Tests used: ${quotaData.limit - quotaData.remaining}/${quotaData.limit}`);
  console.log(`Remaining: ${quotaData.remaining}`);
  console.log(`Can generate: ${quotaData.canGenerate}`);
  console.log(`Message: ${quotaData.message}`);
} catch (error) {
  console.error('Failed to fetch quota:', error);
}
```

### Generate Test with Quota Check

```javascript
// Check quota first
const quotaResponse = await testAPI.getQuotaStatus();
if (!quotaResponse.data?.data?.canGenerate) {
  alert('Quota limit reached. Please upgrade.');
  return;
}

// If quota OK, generate test
try {
  const response = await testAPI.generateTestRequest({
    topic: 'Math',
    difficulty: 'medium',
    numberOfQuestions: 10,
    provided_content: ''
  });
  
  console.log('Test generated:', response.data?.data);
} catch (error) {
  if (error.response?.status === 403) {
    alert('Quota limit reached!');
  } else {
    console.error('Generation failed:', error);
  }
}
```

---

## Curl Examples

### Check Quota

```bash
# Set token variable
TOKEN="your_jwt_token_here"

# Make request
curl -X GET http://localhost:5000/api/tests/quota \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Generate Test

```bash
curl -X POST http://localhost:5000/api/tests/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Programming",
    "difficulty": "intermediate",
    "numberOfQuestions": 15
  }'
```

---

## Response Data Fields

### Quota Status Response

| Field | Type | Description |
|-------|------|-------------|
| `canGenerate` | boolean | Whether user can generate more tests |
| `remaining` | number | Tests remaining (0-5 for free, Infinity for paid) |
| `limit` | number | Total quota limit (5 for free, Infinity for paid) |
| `isPaid` | boolean | Whether user has active subscription |
| `message` | string | Human-readable message about quota status |

### Test Response

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | MongoDB document ID |
| `testId` | string | Test identifier (same as _id) |
| `testCode` | string | Shareable test code (e.g., "ABC123") |
| `title` | string | Auto-generated test title |
| `topic` | string | Topic provided by user |
| `difficulty` | string | Difficulty level |
| `questions` | array | Array of question objects |
| `totalQuestions` | number | Number of questions |
| `duration` | number | Test duration in minutes |
| `isPublished` | boolean | Whether test is published |
| `createdAt` | string | ISO timestamp of creation |

---

## API Call Flow

```
Client                          Server
  │                               │
  ├─ GET /api/tests/quota ────────→ Check subscription
  │                               ├─ If paid: return unlimited
  │                               ├─ If free: count tests
  │ {quota status} ←───────────────┤ Return quota info
  │                               │
  ├─ POST /api/tests/generate ──────→ checkTestGenerationLimit()
  │   {topic, difficulty...}       ├─ Check quota
  │                               ├─ If exceeded: return 403
  │ {test object} ←───────────────┤ If OK: generate test
  │                               │ Return test object
  │
```

---

## Status Codes in Detail

### 200 - OK (Quota Check)
User successfully retrieved quota information. Check `canGenerate` field to determine if they can generate a test.

### 201 - Created (Test Generated)
Test was successfully generated and saved. Test object returned with all details.

### 400 - Bad Request
Malformed request (missing required fields, invalid format, etc.).

### 401 - Unauthorized
- Missing Authorization header
- Invalid/expired JWT token
- Token verification failed

### 403 - Forbidden
- Quota limit exceeded for free users
- Cannot perform action (specific to endpoint)

### 500 - Internal Server Error
Server-side error. Check server logs for details.

---

## Rate Limiting (if applicable)

Currently no rate limiting on quota endpoint.
May be added in future for:
- More than 10 quota checks per minute
- More than 5 test generations per hour
- DDoS protection

---

## Quota Calculation Formula

**For Free Users:**
```
testCount = count of all Test documents where teacherId = userId
remaining = max(0, 5 - testCount)
canGenerate = remaining > 0
```

**For Paid Users:**
```
hasActiveSubscription = Subscription.status == "active" AND expiryDate > now
canGenerate = hasActiveSubscription
remaining = Infinity
```

---

## Error Messages

| Error | HTTP Code | Cause | Solution |
|-------|-----------|-------|----------|
| "Invalid token. Authorization denied." | 401 | Missing/invalid token | Provide valid JWT token |
| "Test generation limit reached..." | 403 | Quota exceeded | Upgrade to premium |
| "Failed to fetch quota status" | 500 | Server error | Retry or contact support |
| "Invalid input" | 400 | Bad request body | Check request format |

---

## Endpoint Discovery

To see all test-related endpoints:

```bash
grep -r "router\." backend/src/routes/testRoutes.js
```

Expected output:
```
router.get('/code/:testCode', getTestByCode);
router.get('/quota', getQuotaStatus);
router.post('/generate', generateTestRequest);
router.post('/submit', submitTest);
router.get('/result/:resultId', getResult);
router.get('/test/:testCode/results', getTestResults);
router.get('/my-tests', getTeacherTests);
router.get('/:testId/preview', getTestPreview);
router.put('/:testId/publish', publishTest);
router.put('/:testId/link-classroom', linkTestToClassroom);
router.delete('/:testId', deleteTest);
router.get('/:testId', getTest);
```

---

## Development vs Production

### Development (localhost:5000)
```
GET http://localhost:5000/api/tests/quota
```

### Production (example.com)
```
GET https://api.example.com/api/tests/quota
```

Change base URL via environment variable:
```
VITE_API_URL=https://api.example.com
```

---

## Testing Tools

### Postman
1. Create GET request
2. URL: `http://localhost:5000/api/tests/quota`
3. Headers: `Authorization: Bearer <token>`
4. Send

### Curl
```bash
curl -X GET http://localhost:5000/api/tests/quota \
  -H "Authorization: Bearer <token>"
```

### JavaScript Fetch
```javascript
fetch('http://localhost:5000/api/tests/quota', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

**Last Updated:** December 3, 2025  
**API Version:** 1.0  
**Status:** Production Ready ✅
