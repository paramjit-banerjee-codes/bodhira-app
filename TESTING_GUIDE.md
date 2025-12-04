# 🧪 Testing Guide - User Profile & Data Security Implementation

## 🎯 Quick Test Scenarios

### Scenario 1: New User Registration with Handle
**Expected**: User gets auto-assigned unique handle

```bash
# Backend Log Should Show:
✅ User registered with handle: john_5678

# Frontend Verification:
1. Go to Profile page
2. Verify "@john_5678" displayed prominently
3. Try to edit handle → Should be locked/disabled
4. Edit name/bio → Should work
```

---

### Scenario 2: Teacher Creates Classroom
**Expected**: Classroom linked to teacher's ID

```bash
POST /api/classrooms
{
  "name": "Math 101",
  "handle": "math101",
  "subject": "Mathematics"
}

# Backend Log Should Show:
✅ Classroom created: classroomId by teacher userId

# Database:
- Check that classroom.teacherId === current user ID
```

---

### Scenario 3: Teacher Adds Student by Handle (✨ NEW)
**Expected**: Student enrolled using handle lookup

```javascript
// AddStudentModal now sends:
POST /api/classrooms/classroomId/students
{
  "userHandle": "john_5678"  // Or "@john_5678"
}

// Backend:
1. Looks up user by handle
2. Validates teacher ownership
3. Adds student to classroom.students array
4. Updates student's classrooms array

// Backend Log Should Show:
✅ Student enrolled: john_5678 (userId) in classroom classroomId

// Verification:
- Check classroom.students includes the student ID
- Check student.classrooms includes the classroom ID
```

---

### Scenario 4: Unauthorized Access Attempt
**Expected**: 403 Forbidden response with warning log

```bash
# Scenario: Student A tries to access Student B's classroom
# From Student A's browser:
GET /api/classrooms/otherTeacherClassroomId
# Response: 403 Forbidden
# Backend Log:
⚠️ Unauthorized access: user X tried to access classroom Y

# Scenario: Student tries to add another student
POST /api/classrooms/classroomId/students
{
  "userHandle": "random_1234"
}
# Response: 403 Forbidden
# Backend Log:
⚠️ Unauthorized enrollment attempt: user X tried to enroll in classroom Y
```

---

### Scenario 5: Teacher Creates Test in Classroom
**Expected**: Test linked to teacher + classroom

```bash
POST /api/classrooms/classroomId/tests
{
  "topic": "Algebra Basics",
  "difficulty": "medium",
  "questions": [ ... ],
  "duration": 30
}

# Backend Creates Test With:
{
  createdBy: teacherId,
  teacherId: teacherId,  // ← NEW
  classroomId: classroomId,
  status: 'draft',
  isPublished: false
}

# Backend Log:
✅ Test created: testId (ABCD1234) in classroom classroomId by teacher userId
```

---

### Scenario 6: Student Takes Classroom Test
**Expected**: Only enrolled students can access

```bash
# Student 1 (enrolled):
GET /api/tests/testId
# Response: 200 OK → Test data

# Student 2 (not enrolled):
GET /api/tests/testId
# Response: 403 Forbidden

# Backend Log:
✅ Test accessed: testId by user userId
⚠️ Unauthorized test access: user X tried to access test Y
```

---

### Scenario 7: Student Submits Test
**Expected**: Only enrolled students can submit

```bash
# Enrolled student:
POST /api/tests/submit
{
  "testId": "testId",
  "answers": [...],
  "timeTaken": 1500
}
# Response: 200 OK → Result saved

# Non-enrolled student:
POST /api/tests/submit
# Response: 403 Forbidden

# Backend Log:
✅ Result saved for test testId
⚠️ Unauthorized test submission: user X tried to submit test Y
```

---

## 🔍 Database Verification Queries

### Check User Handle
```javascript
db.users.findOne({ email: "john@example.com" })
// Should show: handle: "john_5678"

// Verify handle is unique
db.users.findOne({ handle: "john_5678" })
// Should return exactly one user or null
```

### Check Classroom Ownership
```javascript
db.classrooms.findOne({ _id: ObjectId("...") })
// Should show: teacherId: ObjectId("teacher_user_id")
```

### Check Test Association
```javascript
db.tests.findOne({ _id: ObjectId("...") })
// Should show:
// {
//   createdBy: ObjectId("teacher_id"),
//   teacherId: ObjectId("teacher_id"),
//   classroomId: ObjectId("classroom_id")
// }
```

### Check Student Enrollment
```javascript
db.classrooms.findOne({ _id: ObjectId("...") })
// Should show: students: [ObjectId("student1"), ObjectId("student2"), ...]

db.users.findOne({ _id: ObjectId("student_id") })
// Should show: classrooms: [ObjectId("classroom1"), ...]
```

---

## 📊 Server Logs to Monitor

### Success Logs (✅)
```
✅ User registered with handle: username_####
✅ Classroom created: classroomId by teacher userId
✅ Student enrolled: username_#### (userId) in classroom classroomId
✅ Test created: testId (TESTCODE) in classroom classroomId by teacher userId
✅ Test accessed: testId by user userId
✅ Result saved for test testId
```

### Warning Logs (⚠️)
```
⚠️ Unauthorized access: user X tried to access resource Y
⚠️ Unauthorized enrollment attempt: user X tried to enroll in classroom Y
⚠️ Unauthorized test creation: user X tried to create test in classroom Y
⚠️ Unauthorized test access: user X tried to access test Y
⚠️ Unauthorized test submission: user X tried to submit test Y
⚠️ User not found by handle: username_####
⚠️ Duplicate enrollment: student X already in classroom Y
```

---

## 🚀 Running Tests

### Manual Testing
1. Open browser DevTools (F12)
2. Open Network tab
3. Perform actions and verify:
   - Request method and URL
   - Request payload
   - Response status code
   - Response body

### Automated Testing (if available)
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🐛 Common Issues & Fixes

### Issue: "User not found by handle"
**Cause**: Student hasn't completed registration
**Fix**: Verify user exists and has a handle assigned

### Issue: 403 Forbidden when accessing classroom
**Cause**: User is not the teacher AND not enrolled
**Fix**: Have teacher add the user to the classroom

### Issue: Test not visible to student
**Cause**: Test not published yet
**Fix**: Have teacher publish the test

### Issue: Handle includes @ but fails lookup
**Cause**: Handle stored without @, input includes @
**Fix**: AddStudentModal strips @ prefix (should work)

### Issue: Duplicate enrollment error
**Cause**: Student already enrolled
**Fix**: Remove student first, then re-add if needed

---

## ✅ Pre-Deployment Checklist

- [ ] Run migration script: `npm run migrate-handles`
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Test new user registration
- [ ] Test profile page (verify handle display)
- [ ] Test teacher creating classroom
- [ ] Test teacher adding student by handle
- [ ] Test teacher creating test in classroom
- [ ] Test student accessing test (enrolled)
- [ ] Test unauthorized access attempt
- [ ] Check server logs for errors
- [ ] Monitor database for handle uniqueness

---

## 📈 Performance Metrics

### Database Queries
- User lookup by handle: Indexed ✅
- Classroom lookup by teacher: Indexed ✅
- Test lookup by teacherId: Indexed ✅

### Response Times (Expected)
- Add student: < 200ms
- Create test: < 500ms
- Get test: < 100ms
- Authorization check: < 50ms

---

## 🆘 Troubleshooting

### Check Backend Logs
```bash
# If running with npm run dev:
# Logs appear in terminal running npm run dev
# Look for ✅, ⚠️, or ❌ prefixes
```

### Check Frontend Network
```bash
# Open DevTools (F12) → Network tab
# Filter by XHR/Fetch
# Check request/response for errors
```

### Check Database
```bash
# Connect to MongoDB
mongosh

# View users
db.users.find({ role: 'student' }).limit(5)

# View classrooms
db.classrooms.find().limit(5)

# View tests
db.tests.find().limit(5)
```

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Testing ✅
