# Backend Foundation - Quick Start Guide

## 🚀 5-Minute Setup

### What You Need to Know
- Backend foundation is **production-ready**
- All CRUD operations for classrooms work
- All endpoints require JWT authentication
- Database uses MongoDB with proper indexing
- Error handling is consistent across all endpoints

---

## 📍 File Locations

```
Models:        backend/src/models/Classroom.js, Student.js, LessonPlan.js
Controllers:   backend/src/controllers/classroomController.js, studentController.js
Routes:        backend/src/routes/classroomRoutes.js
Utilities:     backend/src/utils/classroomUtils.js
Docs:          backend/*.md
```

---

## ✅ Already Implemented

### ✓ Create Classroom
**Endpoint**: `POST /api/classrooms`
```bash
curl -X POST http://localhost:5000/api/classrooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced JavaScript",
    "subject": "Programming",
    "description": "Learn advanced JS concepts"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Classroom created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Advanced JavaScript",
    "handle": "advanced-javascript-8234",
    "subject": "Programming",
    "description": "Learn advanced JS concepts",
    "inviteCode": "ABC1XYZ9",
    "totalStudents": 0,
    "totalTests": 0,
    "createdAt": "2024-11-16T10:30:00Z"
  }
}
```

### ✓ List Teacher's Classrooms
**Endpoint**: `GET /api/classrooms`
```bash
curl http://localhost:5000/api/classrooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Advanced JavaScript",
      "handle": "advanced-javascript-8234",
      "subject": "Programming",
      "description": "Learn advanced JS concepts",
      "totalStudents": 0,
      "totalTests": 0,
      "avgScore": 92,
      "createdAt": "2024-11-16T10:30:00Z"
    }
  ]
}
```

### ✓ Get Classroom Details
**Endpoint**: `GET /api/classrooms/:id`
```bash
curl http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Advanced JavaScript",
    "handle": "advanced-javascript-8234",
    "subject": "Programming",
    "description": "Learn advanced JS concepts",
    "teacherId": "507f1f77bcf86cd799439022",
    "teacherName": "Jane Doe",
    "totalStudents": 2,
    "totalTests": 3,
    "avgScore": 87,
    "students": [
      {
        "_id": "507f1f77bcf86cd799439033",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active",
        "stats": {
          "totalTests": 3,
          "completedTests": 3,
          "avgScore": 85,
          "totalAttempts": 5
        }
      }
    ],
    "tests": [
      {
        "_id": "507f1f77bcf86cd799439044",
        "title": "Closures Quiz",
        "topic": "Closures",
        "status": "published",
        "isPublished": true,
        "totalQuestions": 10,
        "testCode": "JS001"
      }
    ],
    "createdAt": "2024-11-16T10:30:00Z",
    "updatedAt": "2024-11-16T10:30:00Z"
  }
}
```

### ✓ Update Classroom
**Endpoint**: `PUT /api/classrooms/:id`
```bash
curl -X PUT http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced JavaScript 2024",
    "subject": "Programming",
    "description": "Updated description"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Classroom updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Advanced JavaScript 2024",
    "handle": "advanced-javascript-2024-5391",
    "subject": "Programming",
    "description": "Updated description",
    "updatedAt": "2024-11-16T11:45:00Z"
  }
}
```

### ✓ Delete Classroom
**Endpoint**: `DELETE /api/classrooms/:id`
```bash
curl -X DELETE http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Classroom deleted successfully"
}
```

### ✓ Add Student to Classroom
**Endpoint**: `POST /api/classrooms/:id/students`
```bash
curl -X POST http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Student invitation created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439055",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "status": "pending",
    "classroomId": "507f1f77bcf86cd799439011"
  }
}
```

### ✓ Get Classroom Students
**Endpoint**: `GET /api/classrooms/:id/students`
```bash
curl http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 2,
    "active": 1,
    "pending": 1,
    "students": [
      {
        "id": "507f1f77bcf86cd799439055",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "avatar": null,
        "status": "pending",
        "stats": {
          "totalTests": 0,
          "completedTests": 0,
          "avgScore": 0,
          "totalAttempts": 0
        },
        "enrolledDate": "2024-11-16T11:00:00Z"
      }
    ]
  }
}
```

---

## 📚 Documentation Map

### For Quick Lookup
→ Read: **QUICK_REFERENCE.md**
- API endpoints table
- Database schemas
- File locations
- Important notes

### For Complete Details
→ Read: **CLASSROOM_BACKEND_DOCS.md**
- All model fields
- Controller documentation
- Error handling
- Testing guidelines

### For Implementation
→ Read: **IMPLEMENTATION_ROADMAP.md**
- Phase 2-6 features
- Code templates
- Team assignments
- Timeline estimates

### For Code Structure
→ Read: **IMPLEMENTATION_STRUCTURE.md**
- Directory tree
- File details
- Integration points
- Performance notes

---

## 🔑 Authentication

All endpoints require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login endpoint:
```bash
POST /api/auth/login
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

---

## ⚠️ Common Errors

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Authorization token missing or invalid"
}
```
**Solution**: Add valid JWT token in Authorization header

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Not authorized to manage this classroom"
}
```
**Solution**: Only the classroom teacher can modify it

### 404 - Not Found
```json
{
  "success": false,
  "error": "Classroom not found"
}
```
**Solution**: Check if classroom ID is correct

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Classroom name is required"
}
```
**Solution**: Check required fields in request body

---

## 🧪 Testing Checklist

- [ ] Create classroom
- [ ] List classrooms
- [ ] Get classroom details
- [ ] Update classroom
- [ ] Delete classroom
- [ ] Add student
- [ ] List students
- [ ] Get student progress
- [ ] Remove student

---

## 🎯 What Works Now

✅ Teachers can create classrooms  
✅ Teachers can list their classrooms  
✅ Teachers can update classroom details  
✅ Teachers can delete classrooms (soft delete)  
✅ Teachers can invite students  
✅ Teachers can view all students  
✅ Teachers can remove students  
✅ Auto-generated handles and invite codes  
✅ Full error handling  
✅ Database indexes for performance  

---

## ⏭️ What's Next (Phase 2)

The following will be added:
- Student registration and joining
- Email invitations
- Test integration
- Results collection
- Analytics

See IMPLEMENTATION_ROADMAP.md for details.

---

## 💡 Pro Tips

1. **Unique Handles**: Automatically generated and unique
2. **Soft Deletes**: Deleted classrooms stay in DB (isActive: false)
3. **Invite Codes**: 8-char codes for student joining
4. **Status Tracking**: Students can be pending, active, or inactive
5. **Scalable**: Indexes ensure fast queries even with millions of classrooms

---

## 🔍 Debugging

### Check if classroom exists
```bash
curl http://localhost:5000/api/classrooms/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer TOKEN"
```

### Check if teacher owns classroom
Look for `teacherId` in response and compare with `req.userId`

### Check database directly
```javascript
// In MongoDB
db.classrooms.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
```

---

## 📞 Quick Reference Links

- **Models**: `src/models/Classroom.js`, `Student.js`, `LessonPlan.js`
- **Controllers**: `src/controllers/classroomController.js`, `studentController.js`
- **Routes**: `src/routes/classroomRoutes.js`
- **Utils**: `src/utils/classroomUtils.js`

---

## ✨ Features

### Handle Generation
```javascript
"JavaScript Course" → "javascript-course-7392"
```

### Invite Code Generation
```javascript
→ "ABC1XYZ9" (8 alphanumeric characters)
```

### Status Tracking
- `pending`: Student invited but hasn't accepted
- `active`: Student enrolled and can take tests
- `inactive`: Student removed or left classroom

### Soft Delete
- Classrooms marked `isActive: false`
- No data loss, fully recoverable
- Removed from teacher's classroom list

---

## 🎓 Learning Path

1. Start with: QUICK_REFERENCE.md
2. Understand: Model schemas
3. Review: Controller endpoints
4. Test: Using provided examples
5. Read: IMPLEMENTATION_ROADMAP.md for next phase

---

## ✅ Production Checklist

- [x] All CRUD operations working
- [x] Error handling comprehensive
- [x] Authorization checks in place
- [x] Database indexes added
- [x] Soft deletes implemented
- [x] Input validation
- [x] Documentation complete
- [x] Ready for integration

**Status**: Ready to integrate with frontend! 🎉

---

## 📊 API Statistics

| Metric | Value |
|--------|-------|
| Total Endpoints | 10 |
| Classroom Endpoints | 6 |
| Student Endpoints | 4 |
| Required Auth | All |
| Response Format | JSON |
| Error Handling | Comprehensive |

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
