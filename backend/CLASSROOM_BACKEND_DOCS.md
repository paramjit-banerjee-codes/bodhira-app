# Classroom Backend Foundation Documentation

## Overview
This document outlines the backend foundation for the Classroom Management System built with Node.js + Express + MongoDB.

## Database Models

### 1. Classroom Model
**Location**: `src/models/Classroom.js`

**Fields**:
- `name` (String, required): Classroom name (max 100 characters)
- `handle` (String, unique, required): URL-friendly handle (auto-generated)
- `subject` (String, enum): Programming, Web Development, Data Science, Mobile Development, Cloud Computing, DevOps, Other
- `description` (String): Classroom description (max 500 characters)
- `teacherId` (ObjectId, ref: User, required): Teacher who created the classroom
- `students` (Array of ObjectId, ref: Student): Array of student references
- `tests` (Array of ObjectId, ref: Test): Array of test references
- `lessonPlans` (Array of ObjectId, ref: LessonPlan): Array of lesson plan references
- `inviteCode` (String, unique): 8-character code for joining (auto-generated)
- `isActive` (Boolean, default: true): Soft delete flag
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Last update timestamp

**Features**:
- Pre-save hook auto-generates unique handle from classroom name
- Soft delete support (marks inactive instead of removing)
- Timestamps tracking

---

### 2. Student Model
**Location**: `src/models/Student.js`

**Fields**:
- `name` (String, required): Student name
- `email` (String, required): Student email
- `avatar` (String, optional): Profile picture URL
- `classroomId` (ObjectId, ref: Classroom, required): Classroom association
- `userId` (ObjectId, ref: User): User account if registered
- `stats` (Object):
  - `totalTests` (Number, default: 0): Total tests assigned
  - `completedTests` (Number, default: 0): Tests completed
  - `avgScore` (Number, default: 0): Average score across tests
  - `totalAttempts` (Number, default: 0): Total attempts made
- `weaknesses` (Array): Topics needing improvement
  - `skill` (String): Topic name
  - `score` (Number): Performance score
- `strengths` (Array): Strong areas
  - `skill` (String): Topic name
  - `score` (Number): Performance score
- `status` (String, enum: active, inactive, pending): Enrollment status
- `inviteAcceptedAt` (Date): When student joined
- `createdAt` (Date): Invite creation time
- `updatedAt` (Date): Last update timestamp

**Features**:
- Composite index on classroomId + email for quick lookups
- Status tracking (pending invites, active, inactive)
- Performance statistics tracking

---

### 3. Test Model (Updated)
**Location**: `src/models/Test.js`

**Added Fields for Classroom**:
- `classroomId` (ObjectId, ref: Classroom): Associated classroom (null for standalone tests)
- `testType` (String, enum: mcq, descriptive, mixed): Type of test
- `status` (String, enum: draft, published, scheduled, archived): Test status
- `title` (String): Test title

**Existing Fields**:
- `topic`, `difficulty`, `questions`, `duration`, `createdBy`, `testCode`, etc.

---

### 4. LessonPlan Model
**Location**: `src/models/LessonPlan.js`

**Fields**:
- `title` (String, required): Lesson plan title
- `topic` (String, required): Topic covered
- `classroomId` (ObjectId, ref: Classroom, required): Associated classroom
- `createdBy` (ObjectId, ref: User, required): Creator (teacher)
- `generatedFromTestId` (ObjectId, ref: Test): Test used to generate plan (optional)
- `content` (Object):
  - `sections` (Array): Lesson sections with title, description, duration, objectives, resources
  - `learningObjectives` (Array): Learning goals
  - `assessmentCriteria` (Array): Assessment criteria
  - `additionalNotes` (String): Extra notes
- `status` (String, enum: draft, published, archived): Publication status
- `duration` (Number): Total duration in minutes
- `difficulty` (String, enum: Beginner, Intermediate, Advanced): Level
- `numberOfSections` (Number): Number of content sections
- `isPublic` (Boolean): Whether lesson is public
- `enrolledStudents` (Array of ObjectId, ref: Student): Students taking this lesson
- `metadata` (Object):
  - `generatedWithAI` (Boolean): Whether AI generated this
  - `generationModel` (String): Model used (e.g., gemini-pro)
  - `generationPrompt` (String): Prompt used for generation
- `createdAt`, `updatedAt` (Date): Timestamps

---

## Controllers

### 1. classroomController.js
**Location**: `src/controllers/classroomController.js`

#### Endpoints:

**POST /api/classrooms**
- Creates new classroom
- Input: name, subject (optional), description (optional), handle (optional)
- Output: Classroom data with auto-generated handle and invite code
- Auth: Required (teacher)

**GET /api/classrooms**
- Lists all classrooms for logged-in teacher
- Output: Array of classroom objects with stats
- Auth: Required

**GET /api/classrooms/:id**
- Gets detailed classroom information
- Populates: students, tests, lesson plans
- Calculates: total students, total tests, average score
- Auth: Required (teacher or enrolled student)

**PUT /api/classrooms/:id**
- Updates classroom details
- Editable: name, subject, description, handle
- Auto-regenerates handle if name changes
- Auth: Required (teacher only)

**DELETE /api/classrooms/:id**
- Soft deletes classroom (marks inactive)
- Removes from teacher's profile
- Auth: Required (teacher only)

**GET /api/classrooms/:id/stats**
- Gets classroom analytics (placeholder)
- Future: Topic-wise performance, student strengths/weaknesses
- Auth: Required

---

### 2. studentController.js
**Location**: `src/controllers/studentController.js`

#### Endpoints:

**POST /api/classrooms/:id/students**
- Adds student to classroom by email
- Input: name, email, role (optional)
- Output: Student record
- Auth: Required (teacher only)
- Future: Sends email invitation

**GET /api/classrooms/:id/students**
- Lists all students in classroom
- Output: Student array with stats
- Auth: Required (teacher)

**DELETE /api/classrooms/:classroomId/students/:studentId**
- Removes student from classroom (soft delete)
- Auth: Required (teacher only)

**GET /api/classrooms/:classroomId/students/:studentId**
- Gets student's progress in classroom
- Output: Student stats, strengths, weaknesses
- Auth: Required (teacher or student themselves)

---

## Utility Functions

### classroomUtils.js
**Location**: `src/utils/classroomUtils.js`

**generateClassroomHandle(name)**
- Converts classroom name to URL-friendly handle
- Format: `lowercase-with-hyphens-XXXX`
- Ensures uniqueness
- Returns: Promise<String>

**generateInviteCode()**
- Creates 8-character alphanumeric code
- Format: A-Z0-9 only
- Returns: String

**isHandleUnique(handle, excludeId)**
- Validates handle uniqueness
- Supports excluding specific ID (for updates)
- Returns: Promise<Boolean>

---

## Routes

### classroomRoutes.js
**Location**: `src/routes/classroomRoutes.js`

```
POST   /api/classrooms              - Create classroom
GET    /api/classrooms              - List teacher's classrooms
GET    /api/classrooms/:id          - Get classroom details
PUT    /api/classrooms/:id          - Update classroom
DELETE /api/classrooms/:id          - Delete classroom
GET    /api/classrooms/:id/stats    - Get classroom stats
```

**Future Routes** (marked with TODO):
- POST /api/classrooms/:id/students - Add student
- GET /api/classrooms/:id/students - List students
- DELETE /api/classrooms/:id/students/:studentId - Remove student
- POST /api/classrooms/:id/invite-link - Generate invite link
- POST /api/classrooms/:id/tests - Create test in classroom
- GET /api/classrooms/:id/tests - List classroom tests
- POST /api/classrooms/:id/lesson-plans - Generate lesson plan
- GET /api/classrooms/:id/analytics - Get detailed analytics

---

## Authentication & Authorization

### Middleware
- `requireAuth`: Verifies JWT token, sets `req.userId`
- All classroom routes require authentication
- Teacher-only routes check classroom ownership

### Authorization Checks
- Create: Any authenticated user (future: teachers only)
- View: Teacher or enrolled student
- Update/Delete: Teacher only
- Student management: Teacher only

---

## Data Flow

### Creating a Classroom
```
Teacher sends POST /api/classrooms
↓
Controller validates input
↓
Auto-generates unique handle
↓
Auto-generates invite code
↓
Creates Classroom document
↓
Adds classroom ID to User.classrooms array
↓
Returns: Classroom with handle and inviteCode
```

### Adding Student
```
Teacher sends POST /api/classrooms/:id/students {name, email}
↓
Controller verifies teacher ownership
↓
Checks student doesn't already exist
↓
Creates Student document with status: 'pending'
↓
Adds Student._id to Classroom.students array
↓
Future: Sends email invitation
↓
Returns: Student record with pending status
```

---

## Future Enhancements

### Phase 2
1. Student joining system via invite code
2. Email invitations with accept links
3. Analytics calculations
4. Lesson plan generation with AI

### Phase 3
1. Test scheduling in classrooms
2. Automated grading and feedback
3. Attendance tracking
4. Performance predictions

### Phase 4
1. Parent/Guardian access
2. Class-wide assessments
3. Certificate generation
4. Integration with external platforms

---

## Error Handling

All endpoints use `asyncHandler` middleware for consistent error handling:
- Validation errors: 400 Bad Request
- Not found errors: 404 Not Found
- Authorization errors: 403 Forbidden
- Server errors: 500 Internal Server Error

Response format:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Database Indexes

**Classroom**:
- `handle` (unique)
- `teacherId`
- `createdAt`

**Student**:
- Composite: `classroomId + email`
- `classroomId`
- `status`

**LessonPlan**:
- Composite: `classroomId + createdAt`
- `createdBy`
- `status`

---

## Environment Variables Required

```
MONGODB_URI=mongodb://...
GEMINI_API_KEY=...
JWT_SECRET=...
NODE_ENV=development
```

---

## Testing Endpoints

### Create Classroom
```bash
POST /api/classrooms
Headers: Authorization: Bearer {token}
Body: {
  "name": "Advanced JavaScript",
  "subject": "Programming",
  "description": "Master advanced JS concepts"
}
```

### Get Classrooms
```bash
GET /api/classrooms
Headers: Authorization: Bearer {token}
```

### Add Student
```bash
POST /api/classrooms/{classroomId}/students
Headers: Authorization: Bearer {token}
Body: {
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## Notes

- All timestamps use ISO 8601 format
- Soft deletes preserve data history
- Student stats update on test completion
- Handle auto-generation is idempotent
- No cascade deletes (data preservation)
