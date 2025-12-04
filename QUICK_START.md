# 🚀 Quick Start Guide - Running the Application

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Git installed

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment (if needed)

Check `.env` files exist in both directories with proper settings:

**Backend `.env`** (typically already configured):
```
MONGO_URI=mongodb://localhost:27017/ai-mock-test
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
NODE_ENV=development
```

**Frontend `.env`** (if needed):
```
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run Database Migration (One-time)

```bash
cd backend
npm run migrate-handles
```

**What this does**:
- Assigns handles to any existing users without them
- Generates handles in format: `name_XXXX`
- Safe to run multiple times

**Expected Output**:
```
Connected to MongoDB
Processing users without handles...
✅ User john@example.com assigned handle: john_5432
✅ User alice@example.com assigned handle: alice_8901
Migration complete: 2 users updated
```

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output**:
```
✅ MongoDB connected
✅ Server running on http://localhost:5000
```

**Keep this terminal open!**

### Step 5: Start Frontend Server (in new terminal)

```bash
cd frontend
npm run dev
```

**Expected Output**:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Verification Checklist

- [ ] Backend terminal shows "Server running on http://localhost:5000"
- [ ] Frontend terminal shows "Local: http://localhost:5173/"
- [ ] Open http://localhost:5173 in browser
- [ ] Can see the application interface

---

## 🧪 Quick Test

### Test 1: Register New User
1. Click "Register" button
2. Fill in details (name, email, password)
3. Submit form
4. **Expected**: User account created with auto-generated handle

### Test 2: View Profile
1. After registration, go to Profile page
2. **Expected**: See handle displayed as `@username_####`
3. Click "Edit Profile"
4. Try to edit handle field
5. **Expected**: Handle field is locked/disabled

### Test 3: Create Classroom (Teacher)
1. Switch to Teacher role
2. Create a new classroom
3. **Expected**: Classroom created successfully

### Test 4: Add Student by Handle
1. In classroom, click "Add Student"
2. Enter student handle (e.g., `@john_5678`)
3. Submit
4. **Expected**: Student enrolled successfully

### Test 5: Unauthorized Access
1. Student A logs in
2. Try to directly visit Student B's classroom URL
3. **Expected**: 403 error or redirect to home

---

## 📊 Monitoring Server Logs

Watch terminal where backend is running for these indicators:

### Success Indicators ✅
```
✅ User registered with handle: username_5678
✅ Classroom created: classroomId by teacher userId
✅ Student enrolled: username_5678 (userId) in classroom classroomId
✅ Test created: testId (CODE1234) in classroom classroomId
✅ Test accessed: testId by user userId
```

### Warning Indicators ⚠️
```
⚠️ Unauthorized enrollment attempt: user X tried to enroll in classroom Y
⚠️ Unauthorized test creation: user X tried to create test in classroom Y
⚠️ Unauthorized test access: user X tried to access test Y
⚠️ User not found by handle: username_####
```

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**:
```bash
# Make sure MongoDB is running
# Linux/Mac:
mongod

# Windows:
# Start MongoDB from Services or use MongoDB Compass
```

### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Change port in backend/src/server.js or kill the process
# On Windows PowerShell:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Linux/Mac:
lsof -i :5000
kill -9 <PID>
```

### Issue: "Port 5173 already in use"
**Solution**:
```bash
# Vite will automatically use next available port
# Or specify port:
npm run dev -- --port 5174
```

### Issue: Frontend shows "API connection failed"
**Solution**:
1. Check backend is running on http://localhost:5000
2. Check `VITE_API_URL` in frontend `.env`
3. Check network tab in DevTools for errors

### Issue: "User handle not found by handle"
**Solution**:
1. Verify user is registered
2. Run migration: `npm run migrate-handles`
3. Check database: `db.users.findOne({ email: "..." })`

---

## 📱 Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Teacher dashboard |
| `/profile` | User profile with handle |
| `/classrooms` | View classrooms |
| `/classroom/:id` | Classroom details |
| `/tests` | Test list |
| `/take-test/:code` | Take test by code |

---

## 🗄️ Database Collections

After setup, you'll have these collections:

```
ai-mock-test
├── users
├── classrooms
├── tests
├── results
└── leaderboards
```

---

## 📂 Project Structure

```
ai-mock-test-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── package.json
│   ├── migrate-handles.js ← Run this once
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── .env
├── IMPLEMENTATION_SUMMARY.md
├── TESTING_GUIDE.md
├── CHANGELOG.md
└── README.md
```

---

## 🎯 Next Steps

1. **Start the servers** (follow steps above)
2. **Register a new account** (will auto-get handle)
3. **View profile** (see handle with @ prefix)
4. **Create classroom** (as teacher)
5. **Add student** (by handle)
6. **Create test** (in classroom)
7. **Take test** (as student)
8. **Review results** (check performance)

---

## 💡 Tips

- **Don't have a test user?** Just register one - handles are auto-generated
- **Want to test teacher features?** Toggle role in database or contact admin
- **See an error?** Check server logs first - they provide detailed info
- **Want to reset data?** Drop database and re-run migrations

---

## 🆘 Need Help?

Check these files in order:
1. `IMPLEMENTATION_SUMMARY.md` - Overview of changes
2. `TESTING_GUIDE.md` - Detailed testing scenarios
3. `CHANGELOG.md` - Complete list of changes
4. Server console logs - Real-time debugging

---

## 🎉 You're Ready!

The application is now fully set up with:
- ✅ User profile system with unique handles
- ✅ Student enrollment by handle
- ✅ Complete data security & authorization
- ✅ Audit logging for security events

Happy coding! 🚀
