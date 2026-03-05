# Bodhira - AI-Powered Mock Test Platform 🚀

> A comprehensive full-stack web application that leverages artificial intelligence to generate customized mock tests for educators and students. Built from scratch with modern web technologies, this platform addresses the real-world problem of creating quality assessment content efficiently.

---

## 📖 Table of Contents

1. [The Problem This Solves](#-the-problem-this-solves)
2. [Why I Built This](#-why-i-built-this)
3. [Core Features Overview](#-core-features-overview)
4. [Technology Stack Deep Dive](#-technology-stack-deep-dive)
5. [System Architecture](#-system-architecture)
6. [Backend Architecture](#-backend-architecture)
7. [Frontend Architecture](#-frontend-architecture)
8. [Database Design](#-database-design)
9. [Authentication & Authorization](#-authentication--authorization)
10. [API Routes & Endpoints](#-api-routes--endpoints)
11. [AI Integration Explained](#-ai-integration-explained)
12. [State Management](#-state-management)
13. [Payment System](#-payment-system)
14. [Advanced Features](#-advanced-features)
15. [Security Implementation](#-security-implementation)
16. [Error Handling & Validation](#-error-handling--validation)
17. [Local Development Setup](#-local-development-setup)
18. [Project Structure](#-project-structure)
19. [Development Tools & Workflow](#-development-tools--workflow)
20. [Future Improvements](#-future-improvements)

---

## 🎯 The Problem This Solves

In my experience as a developer learning technical concepts, I realized that:

1. **Teachers spend hours** creating quality assessment questions manually
2. **Students struggle to find** practice tests tailored to specific topics
3. **Traditional test platforms** are either too expensive or lack customization
4. **Educational institutions** need centralized systems to manage multiple classrooms and track student progress
5. **Mock test preparation** for competitive exams like GATE requires access to high-quality, topic-specific questions

**Bodhira solves all of these problems** by:
- Generating unlimited AI-powered tests on any topic in seconds
- Providing detailed performance analytics using machine learning algorithms
- Offering a classroom management system for teachers
- Enabling real-time leaderboards and rankings
- Making competitive exam preparation (GATE) more accessible
- Implementing a freemium model that's affordable for students

---

## 💡 Why I Built This

During my learning journey, I faced difficulties finding sufficient practice tests for specific programming topics. I wanted to build something that:

1. **Demonstrates full-stack capabilities** - From database design to UI/UX
2. **Integrates modern AI** - Practical use of OpenAI's GPT models
3. **Solves a real problem** - Not just a CRUD app, but something actually useful
4. **Shows scalability** - Designed to handle multiple users, classrooms, and concurrent test-taking
5. **Implements complex features** - Payment gateways, real-time analytics, ML-based insights
6. **Follows industry best practices** - Secure authentication, proper error handling, clean architecture

This project showcases my ability to build production-ready applications from scratch.

---

## ✨ Core Features Overview

### For Teachers
- ✅ **AI-Powered Test Generation** - Generate tests on any topic with custom difficulty and question count
- ✅ **Classroom Management** - Create multiple classrooms, invite students via unique codes
- ✅ **Student Analytics** - Track individual student performance with ML-powered insights
- ✅ **Test History** - View all generated tests and student submissions
- ✅ **Leaderboards** - Automatic ranking system for competitive learning
- ✅ **Premium Subscriptions** - Monetization through Razorpay payment integration

### For Students
- ✅ **Join Tests via Code** - No signup required initially, quick access
- ✅ **Timed Assessments** - Real countdown timers with auto-submission
- ✅ **Instant Results** - Score, percentage, rank, and correct answers immediately after submission
- ✅ **GATE Mock Tests** - Specialized competitive exam preparation
- ✅ **Performance Tracking** - Visualize strengths and weaknesses with interactive charts
- ✅ **Test History** - Review all past attempts with detailed analytics

### Platform Features
- ✅ **Role-Based Access Control** - Separate experiences for teachers and students
- ✅ **Dark/Light Theming** - Professional UI with theme switching
- ✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- ✅ **Real-Time Updates** - Live leaderboard updates without page refresh
- ✅ **OTP Email Verification** - Secure user registration with email confirmation
- ✅ **Unique User Handles** - Twitter-style @username system

---

## 🛠 Technology Stack Deep Dive

### Backend Technologies

#### **Node.js**
**What it is:** JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript on the server.

**Why I chose it:**
- JavaScript everywhere (frontend + backend) reduces context switching
- Asynchronous, event-driven architecture perfect for I/O-heavy operations
- Massive ecosystem with npm packages
- Great for real-time applications

**How it's used in this project:**
- Powers the entire backend server
- Handles all API requests from the frontend
- Manages database operations asynchronously
- Processes AI API calls to OpenAI without blocking

#### **Express.js**
**What it is:** Fast, unopinionated web framework for Node.js.

**Why I chose it:**
- Minimal and flexible - doesn't force a specific structure
- Powerful middleware system for request processing
- Easy routing and request handling
- Industry standard for Node.js backends

**How it's used in this project:**
- Defines all API routes (`/api/auth`, `/api/tests`, etc.)
- Middleware chain for authentication, error handling, logging
- Request body parsing with `express.json()`
- CORS configuration for cross-origin requests

#### **MongoDB with Mongoose**
**What it is:** MongoDB is a NoSQL document database; Mongoose is an ODM (Object Data Modeling) library for MongoDB.

**Why I chose it:**
- Flexible schema design - easy to evolve data models
- JSON-like documents match JavaScript objects naturally
- Horizontal scaling capabilities
- Mongoose provides schema validation and relationships

**How it's used in this project:**
- Stores all application data (users, tests, results, classrooms)
- Mongoose schemas define data structure with validation
- Referenced relationships between collections (User → Tests → Results)
- Indexes on frequently queried fields for performance

**Example Schema (User):**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  handle: { type: String, unique: true },
  role: { type: String, enum: ['teacher', 'student'] },
  generation_count: { type: Number, default: 0 }
});
```

#### **JWT (JSON Web Tokens)**
**What it is:** Compact, URL-safe token format for securely transmitting information between parties.

**Why I chose it:**
- Stateless authentication - no session storage needed
- Scalable across multiple servers
- Contains user data in the token itself
- Industry standard for REST APIs

**How it's used in this project:**
- Generated after successful login/registration
- Stored in localStorage on the client
- Sent with every API request in the `Authorization` header
- Middleware validates token and attaches user data to requests

**Token Generation:**
```javascript
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});
```

#### **bcryptjs**
**What it is:** Library for hashing and comparing passwords.

**Why I chose it:**
- One-way encryption - even I can't see user passwords
- Built-in salt generation prevents rainbow table attacks
- Adjustable work factor for future-proofing

**How it's used in this project:**
```javascript
// Hashing password on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Comparing password on login
const isMatch = await bcrypt.compare(inputPassword, user.password);
```

#### **OpenAI API**
**What it is:** Access to GPT models (I use gpt-4o-mini) for natural language processing.

**Why I chose it:**
- Generates human-quality test questions
- Understands context and difficulty levels
- Cost-effective with the mini model
- Reliable and well-documented API

**How it's used in this project:**
- Generates customized test questions based on topic and difficulty
- Formats output in JSON with questions, options, and correct answers
- Structured prompts ensure consistent, parseable responses

**Generation Example:**
```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are an expert test generator...'
    },
    {
      role: 'user',
      content: `Generate ${numberOfQuestions} ${difficulty} MCQ questions on ${topic}`
    }
  ],
  temperature: 0.7
});
```

#### **Razorpay**
**What it is:** Payment gateway for Indian markets.

**Why I chose it:**
- Easy integration with Node.js
- Supports multiple payment methods (UPI, cards, wallets)
- Test mode for development
- Webhook support for payment verification

**How it's used in this project:**
- Handles subscription payments (₹299/month, ₹1499/6 months, ₹2499/year)
- Server-side signature verification for security
- Creates and manages subscription records in database

#### **Nodemailer**
**What it is:** Module for sending emails from Node.js.

**Why I chose it:**
- Simple API for transactional emails
- Works with Gmail SMTP
- Supports HTML email templates

**How it's used in this project:**
- Sends OTP verification emails during registration
- Can be extended for password resets, notifications

---

### Frontend Technologies

#### **React**
**What it is:** JavaScript library for building user interfaces using components.

**Why I chose it:**
- Component-based architecture promotes reusability
- Virtual DOM for efficient updates
- Massive ecosystem and community
- Declarative programming makes UI logic clear

**How it's used in this project:**
- Every page is a React component (Dashboard, Profile, TakeTest, etc.)
- Reusable components (Navbar, Sidebar, ClassroomCard, etc.)
- React Hooks (useState, useEffect, useContext) for state and lifecycle

**Example Component Structure:**
```jsx
function Dashboard() {
  const [tests, setTests] = useState([]);
  
  useEffect(() => {
    // Fetch tests when component mounts
    fetchTests();
  }, []);
  
  return (
    <div className="dashboard">
      {tests.map(test => <TestCard key={test._id} test={test} />)}
    </div>
  );
}
```

#### **Vite**
**What it is:** Next-generation frontend build tool.

**Why I chose it:**
- Lightning-fast hot module replacement (HMR)
- Optimized production builds
- Out-of-the-box support for React
- Better developer experience than Create React App

**How it's used in this project:**
- Development server with instant updates
- Production bundling with tree-shaking
- Environment variable handling (`import.meta.env`)

#### **React Router DOM**
**What it is:** Library for routing and navigation in React applications.

**Why I chose it:**
- Client-side routing without page reloads
- Nested routes for complex layouts
- Protected routes for authentication
- URL parameter handling

**How it's used in this project:**
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/classrooms/:id" element={<ClassroomPage />} />
</Routes>
```

#### **Axios**
**What it is:** Promise-based HTTP client for making API requests.

**Why I chose it:**
- Cleaner syntax than fetch API
- Automatic JSON transformation
- Interceptors for global request/response handling
- Better error handling

**How it's used in this project:**
```javascript
// Centralized API client with auth header
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage in components
const response = await api.post('/tests/generate', { topic, difficulty });
```

#### **Recharts**
**What it is:** React charting library built on D3.

**Why I chose it:**
- Declarative API that fits React patterns
- Responsive and customizable
- Good documentation and examples
- Suitable for performance analytics visualization

**How it's used in this project:**
- Bar charts for test score distribution
- Line charts for performance trends over time
- Pie charts for topic-wise analysis
- Heatmaps for student performance

#### **Lucide React**
**What it is:** Beautiful, consistent icon library for React.

**Why I chose it:**
- Modern, clean icon designs
- Tree-shakeable (only imports icons you use)
- TypeScript support
- Customizable size and color

**How it's used in this project:**
- Navigation icons (Home, User, BookOpen, etc.)
- Action buttons (Trash, Edit, Download, etc.)
- Status indicators (Check, X, AlertCircle, etc.)

---

### Development Tools

#### **VS Code**
My primary code editor for the entire project.

**Extensions used:**
- ESLint - Code quality and consistency
- Prettier - Code formatting
- ES7+ React snippets - Faster component creation
- MongoDB for VS Code - Database browsing
- Thunder Client - API testing (Postman alternative)

#### **Git & GitHub**
Version control and code hosting.

**Workflow:**
- Feature branches for new features
- Commits follow conventional commit messages
- Main branch protected for stable code

#### **Postman / Thunder Client**
API testing during development.

**Usage:**
- Test all API endpoints before frontend integration
- Save request collections for different features
- Environment variables for dev/production URLs

#### **MongoDB Compass**
GUI for MongoDB database management.

**Usage:**
- Visualize database schema
- Run queries to debug issues
- Monitor document structure changes
- Create indexes for query optimization

---

## 🏗 System Architecture

Bodhira follows a **client-server architecture** with clear separation between frontend and backend:

```
┌────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          React Frontend (Vite)                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │  │
│  │  │ Pages   │ │Components│ │ Context │               │  │
│  │  │ (Views) │ │ (Reuse)  │ │ (State) │               │  │
│  │  └─────────┘ └─────────┘ └─────────┘               │  │
│  │         │           │           │                    │  │
│  │         └───────────┴───────────┘                    │  │
│  │                    │                                 │  │
│  │              Axios HTTP Client                       │  │
│  └────────────────────┼────────────────────────────────┘  │
│                       │                                    │
└───────────────────────┼────────────────────────────────────┘
                        │
                   HTTP/HTTPS
                        │
┌───────────────────────┼────────────────────────────────────┐
│                       │                                    │
│  ┌────────────────────▼───────────────────────────────┐  │
│  │          EXPRESS.JS API SERVER                     │  │
│  │                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │  Middleware  │  │   Routes     │               │  │
│  │  │  - Auth      │  │  - /api/auth │               │  │
│  │  │  - CORS      │  │  - /api/tests│               │  │
│  │  │  - Error     │  │  - /api/class│               │  │
│  │  └──────────────┘  └──────┬───────┘               │  │
│  │                           │                        │  │
│  │                    ┌──────▼───────┐               │  │
│  │                    │ Controllers  │               │  │
│  │                    └──────┬───────┘               │  │
│  │                           │                        │  │
│  │                    ┌──────▼───────┐               │  │
│  │                    │   Models     │               │  │
│  │                    │  (Mongoose)  │               │  │
│  └────────────────────┴──────┬───────┴───────────────┘  │
│                               │                          │
│                    NODE.JS RUNTIME                       │
└───────────────────────────────┼──────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼────────┐  ┌────▼─────────┐  ┌───▼──────┐
    │   MongoDB Atlas  │  │  OpenAI API  │  │ Razorpay │
    │   (Database)     │  │  (AI Tests)  │  │(Payments)│
    └──────────────────┘  └──────────────┘  └──────────┘
```

### Data Flow Example (Taking a Test)

1. **Student clicks "Join Test"** → React component renders form
2. **Student enters test code** → Form submission triggers Axios POST request
3. **Request hits Express server** → `/api/tests/code/:testCode` route
4. **Auth middleware validates JWT** → Extracts userId from token
5. **Controller queries MongoDB** → Finds test by code
6. **Test data returned** → JSON response sent to frontend
7. **React receives data** → useState updates, UI re-renders
8. **Student takes test** → Answers stored in component state
9. **Submit button clicked** → POST to `/api/tests/submit`
10. **Backend calculates score** → Creates Result document
11. **Updates leaderboard** → Calculates rank among all students
12. **Returns results** → Score, percentage, rank, correct answers
13. **React navigates to Results page** → Shows detailed breakdown

---

## 📦 Backend Architecture

The backend follows an **MVC-like pattern** (Models, Controllers, Routes) with additional layers:

### Folder Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.js         # MongoDB connection logic
│   │   └── email.js      # Nodemailer configuration
│   │
│   ├── models/           # Mongoose schemas
│   │   ├── User.js       # User schema (teachers & students)
│   │   ├── Test.js       # Test schema with questions
│   │   ├── Result.js     # Test submission results
│   │   ├── Classroom.js  # Classroom/course management
│   │   ├── Subscription.js  # Payment subscriptions
│   │   └── Payment.js    # Payment transaction records
│   │
│   ├── controllers/      # Business logic
│   │   ├── authController.js        # Login, register, OTP
│   │   ├── testController.js        # Test CRUD operations
│   │   ├── generationController.js  # AI test generation
│   │   ├── classroomController.js   # Classroom management
│   │   ├── analyticsController.js   # Performance analytics
│   │   ├── paymentController.js     # Razorpay integration
│   │   └── profileController.js     # User profile updates
│   │
│   ├── routes/           # API route definitions
│   │   ├── authRoutes.js
│   │   ├── testRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── profileRoutes.js
│   │
│   ├── middleware/       # Request processing
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── asyncHandler.js    # Error wrapper for async routes
│   │   └── errorHandler.js    # Global error handler
│   │
│   ├── utils/            # Helper functions
│   │   ├── openaiClient.js    # OpenAI API wrapper
│   │   ├── entitlements.js    # Subscription checks
│   │   ├── testGenerationHelpers.js  # Parsing AI responses
│   │   └── PerformanceAnalysisEngine.js  # ML analytics
│   │
│   └── server.js         # Entry point - Express app setup
│
├── data/                 # Static data
│   └── gateQuestions.js  # GATE exam question bank
│
├── .env                  # Environment variables
└── package.json          # Dependencies
```

### Request Flow Through Middleware

```
Incoming Request
      ↓
Express app.use(cors())           # Allow cross-origin requests
      ↓
Express app.use(express.json())   # Parse JSON body
      ↓
Route matching (/api/auth/*, /api/tests/*)
      ↓
authMiddleware (if protected route)  # Verify JWT
      ↓
Controller function                  # Business logic
      ↓
Model methods                        # Database operations
      ↓
Response sent to client
      ↓
errorHandler (if error occurs)       # Catch all errors
```

### Example: How Test Generation Works (Step-by-Step)

**1. Frontend Request:**
```javascript
// User fills form: Topic = "Data Structures", Difficulty = "medium", Questions = 10
const response = await api.post('/api/tests/generate', {
  topic: 'Data Structures',
  difficulty: 'medium',
  numberOfQuestions: 10
});
```

**2. Route Handler (testRoutes.js):**
```javascript
router.post('/generate', authMiddleware, generateTestRequest);
```

**3. Auth Middleware Execution:**
```javascript
// Extracts token from header
const token = req.header('Authorization').replace('Bearer ', '');

// Verifies token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Attaches user to request
req.userId = decoded.userId;
next(); // Proceed to controller
```

**4. Controller (generationController.js):**
```javascript
export const generateTestRequest = async (req, res) => {
  // Extract data
  const { topic, difficulty, numberOfQuestions } = req.body;
  const userId = req.userId;

  // Check subscription limits
  const limitCheck = await checkTestGenerationLimit(userId);
  if (!limitCheck.canGenerate) {
    return res.status(403).json({ error: 'Limit reached' });
  }

  // Call OpenAI
  const aiResponse = await callOpenAI(topic, difficulty, numberOfQuestions);

  // Parse response
  const questions = parseTestQuestions(aiResponse);

  // Save to database
  const test = await Test.create({
    topic,
    difficulty,
    questions,
    teacherId: userId,
    totalQuestions: numberOfQuestions,
    testCode: generateUniqueCode() // e.g., "ABC123"
  });

  // Update user's generation count
  await User.findByIdAndUpdate(userId, {
    $inc: { generation_count: 1 },
    $push: { createdTests: test._id }
  });

  // Return test
  res.status(201).json({
    success: true,
    data: { test }
  });
};
```

**5. OpenAI Integration (openaiClient.js):**
```javascript
export async function callOpenAI(topic, difficulty, numberOfQuestions) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Generate ${numberOfQuestions} ${difficulty} multiple-choice questions on ${topic}.
  
  Format as JSON array:
  [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert test creator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}
```

**6. Response to Frontend:**
```json
{
  "success": true,
  "data": {
    "test": {
      "_id": "507f1f77bcf86cd799439011",
      "topic": "Data Structures",
      "difficulty": "medium",
      "testCode": "ABC123",
      "questions": [...],
      "totalQuestions": 10,
      "duration": 15
    }
  }
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.jsx (Router & Providers)
├── ThemeProvider (Dark/Light mode)
└── AuthProvider (User state)
    │
    ├── Layout.jsx (Sidebar + Content wrapper)
    │   ├── Sidebar.jsx
    │   └── [Page Components]
    │
    ├── Navbar.jsx (Public pages)
    │
    └── Pages:
        ├── Home.jsx
        ├── Login.jsx / Register.jsx
        ├── Dashboard.jsx
        ├── GenerateTest.jsx
        ├── TakeTest.jsx
        ├── Results.jsx
        ├── Profile.jsx
        ├── ClassroomList.jsx
        └── ClassroomPage.jsx
            ├── Overview Tab
            ├── Tests Tab
            ├── Students Tab
            └── Analytics Tab
```

### State Management Strategy

I use **React Context API** instead of Redux because:
- Simpler setup for this app's scope
- Avoids boilerplate code
- Sufficient for user authentication state
- Performance is acceptable for current scale

**AuthContext:**
```javascript
// Manages:
// - user (current user object)
// - loading (auth check in progress)
// - login() function
// - register() function
// - logout() function

const { user, loading, login, logout } = useContext(AuthContext);
```

**ThemeContext:**
```javascript
// Manages:
// - theme ('dark' or 'light')
// - toggleTheme() function

const { theme, toggleTheme } = useContext(ThemeContext);
```

### Protected Routes

```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Usage:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### API Service Layer

I centralized all API calls in `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Organized by feature
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const testAPI = {
  generate: (testData) => api.post('/tests/generate', testData),
  getByCode: (code) => api.get(`/tests/code/${code}`),
  submit: (testId, answers) => api.post(`/tests/${testId}/submit`, { answers }),
};

export const classroomAPI = {
  create: (data) => api.post('/classrooms', data),
  getAll: () => api.get('/classrooms'),
  getById: (id) => api.get(`/classrooms/${id}`),
  enroll: (inviteCode) => api.post('/classrooms/enroll', { inviteCode }),
};
```

### Component Communication Patterns

**1. Props (Parent to Child):**
```jsx
<ClassroomCard 
  classroom={classroom}
  onDelete={handleDelete}
/>
```

**2. Context (Global State):**
```jsx
const { user } = useContext(AuthContext);
```

**3. Callbacks (Child to Parent):**
```jsx
function Parent() {
  const handleUpdate = (data) => {
    // Update parent state
  };
  
  return <Child onUpdate={handleUpdate} />;
}
```

---

## 🗄 Database Design

### MongoDB Collections & Relationships

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  handle: String (unique, e.g., "john_9234"),
  role: String (enum: 'teacher' | 'student'),
  generation_count: Number (lifetime test count for quota),
  free_tests_used: Number (0-5),
  createdTests: [ObjectId] (references Test),
  attemptedTests: [ObjectId] (references Result),
  classrooms: [ObjectId] (references Classroom),
  isVerified: Boolean,
  verificationOTP: String,
  otpExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Design Decisions:**
- `generation_count` is **never decremented** even when tests are deleted - this enforces the free tier limit of 5 tests
- `handle` is auto-generated as `name_XXXX` (4 random digits) for Twitter-like usernames
- `password` has `select: false` to prevent accidental exposure in queries

#### **Tests Collection**
```javascript
{
  _id: ObjectId,
  topic: String,
  difficulty: String (enum: 'easy' | 'medium' | 'hard'),
  questions: [
    {
      question: String,
      options: [String] (length 4),
      correctAnswer: String
    }
  ],
  duration: Number (minutes),
  teacherId: ObjectId (references User),
  classroomId: ObjectId (references Classroom, nullable),
  testCode: String (unique, e.g., "ABC123"),
  totalQuestions: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Design Decisions:**
- `testCode` is a 6-character unique code for easy sharing
- Questions are **embedded** (not in separate collection) because they're always fetched together
- `correctAnswer` is removed when sending test to students (security)

#### **Results Collection**
```javascript
{
  _id: ObjectId,
  testId: ObjectId (references Test),
  studentId: ObjectId (references User),
  classroomId: ObjectId (references Classroom, nullable),
  answers: [
    {
      questionIndex: Number,
      selectedAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  rank: Number,
  timeTaken: Number (seconds),
  submittedAt: Date
}
```

**Key Design Decisions:**
- Each answer includes `isCorrect` for quick analysis without re-fetching test
- `rank` is calculated at submission time by counting better scores
- Results are never deleted (for historical analytics)

#### **Classrooms Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  handle: String (unique, URL-friendly),
  subject: String (enum: predefined subjects),
  description: String,
  teacherId: ObjectId (references User),
  students: [ObjectId] (references User),
  tests: [ObjectId] (references Test),
  inviteCode: String (unique),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Subscriptions Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (references User),
  plan: String ('monthly' | '6months' | 'yearly'),
  status: String ('active' | 'expired' | 'cancelled'),
  amount: Number,
  startDate: Date,
  expiryDate: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String
}
```

### Database Indexes (Performance Optimization)

```javascript
// Users
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ handle: 1 }, { unique: true });

// Tests
testSchema.index({ testCode: 1 }, { unique: true });
testSchema.index({ teacherId: 1, createdAt: -1 }); // For teacher's test list

// Results
resultSchema.index({ testId: 1, score: -1 }); // For leaderboards
resultSchema.index({ studentId: 1, submittedAt: -1 }); // For student history

// Classrooms
classroomSchema.index({ inviteCode: 1 }, { unique: true });
classroomSchema.index({ teacherId: 1 });
```

---

## 🔐 Authentication & Authorization

### Registration Flow

```
1. User fills form (name, email, password, role)
      ↓
2. Frontend validates (matching passwords, email format)
      ↓
3. POST /api/auth/register
      ↓
4. Backend checks if email exists
      ↓
5. Hash password with bcrypt (salt rounds: 10)
      ↓
6. Generate unique @handle (e.g., john_4829)
      ↓
7. Generate 6-digit OTP
      ↓
8. Send OTP via email (Nodemailer)
      ↓
9. Return: { requiresVerification: true, email }
      ↓
10. Frontend redirects to /verify-otp
      ↓
11. User enters OTP
      ↓
12. POST /api/auth/verify-otp
      ↓
13. Backend verifies OTP & expiry time
      ↓
14. Set user.isVerified = true
      ↓
15. Generate JWT token
      ↓
16. Return: { token, user }
      ↓
17. Frontend stores token in localStorage
      ↓
18. Redirect to Dashboard
```

### Login Flow

```
1. User enters email & password
      ↓
2. POST /api/auth/login { email, password }
      ↓
3. Backend finds user by email (with password field included)
      ↓
4. Compare password with bcrypt.compare()
      ↓
5. Check if user.isVerified === true
      ↓
6. Generate JWT token
      ↓
7. Return: { token, user }
      ↓
8. Frontend stores token in localStorage
      ↓
9. AuthContext sets user state
      ↓
10. Redirect to Dashboard
```

### JWT Token Structure

```javascript
// Token payload:
{
  userId: "507f1f77bcf86cd799439011",
  iat: 1620000000, // Issued at timestamp
  exp: 1620604800  // Expires in 7 days
}

// Signed with:
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
```

### Authorization Middleware

```javascript
// authMiddleware.js
export default async function authMiddleware(req, res, next) {
  try {
    // 1. Extract token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 4. Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Role-Based Access Control

```javascript
// Teacher-only route
router.post('/classrooms', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teachers only' });
  }
  // Create classroom...
});

// Classroom ownership check
async function requireClassroomOwner(req, res, next) {
  const classroom = await Classroom.findById(req.params.id);
  
  if (classroom.teacherId.toString() !== req.userId) {
    return res.status(403).json({ error: 'Not your classroom' });
  }
  
  req.classroom = classroom;
  next();
}
```

---

## 🌐 API Routes & Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Create new user account |
| POST | `/verify-otp` | Public | Verify email with OTP |
| POST | `/login` | Public | Login existing user |
| GET | `/me` | Private | Get current user data |
| PUT | `/profile` | Private | Update user profile |

### Test Routes (`/api/tests`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/generate` | Private (Teacher) | Generate AI test |
| GET | `/quota` | Private | Check generation quota |
| GET | `/code/:testCode` | Public | Get test by code (for students) |
| GET | `/:testId` | Private | Get full test details |
| POST | `/:testId/submit` | Private | Submit test answers |
| GET | `/teacher/tests` | Private (Teacher) | Get all tests created by teacher |
| DELETE | `/:testId` | Private (Teacher) | Delete test |

### Classroom Routes (`/api/classrooms`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private (Teacher) | Create classroom |
| GET | `/` | Private | Get all user's classrooms |
| GET | `/:id` | Private | Get classroom details |
| POST | `/enroll` | Private (Student) | Join classroom with invite code |
| POST | `/:id/generate-test` | Private (Teacher) | Generate test for classroom |
| GET | `/:id/tests` | Private | Get all tests in classroom |
| GET | `/:id/students` | Private (Teacher) | Get enrolled students |

### Analytics Routes (`/api/classrooms/:id/analytics`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/overview` | Private (Teacher) | Class-wide statistics |
| GET | `/students` | Private (Teacher) | Per-student analytics with ML insights |
| GET | `/student/:studentId/history` | Private (Teacher) | Student's test history |

### Payment Routes (`/api/payments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create-order` | Private | Create Razorpay order |
| POST | `/verify` | Private | Verify payment signature |
| GET | `/subscription` | Private | Get active subscription |

### GATE Mock Test Routes (`/api/tests/gate`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/generate?subject=DSA` | Public | Generate GATE mock test |
| GET | `/subjects` | Public | List available subjects |

---

## 🤖 AI Integration Explained

### Why OpenAI Over Other Options?

I evaluated several options:
- **Custom ML model:** Too complex for this project's scope
- **Google Gemini:** Less stable API at development time
- **Claude API:** Higher cost per token
- **OpenAI GPT-4o-mini:** **Winner** - Best balance of quality, cost, and reliability

### How AI Generation Works (Technical Deep Dive)

**Step 1: User Input Processing**
```javascript
// Frontend collects:
const testConfig = {
  topic: "Binary Trees",
  difficulty: "medium",
  numberOfQuestions: 10,
  provided_content: null // Optional: User can provide custom content
};
```

**Step 2: Prompt Engineering**

This is the **most critical** part. I crafted a structured prompt:

```javascript
const systemPrompt = `You are an expert test question generator. Generate high-quality, 
technically accurate multiple-choice questions. Each question must have exactly 4 options
with only ONE correct answer. Output ONLY valid JSON, no additional text.`;

const userPrompt = `Generate ${numberOfQuestions} ${difficulty} difficulty multiple-choice 
questions on the topic: "${topic}".

STRICT FORMAT (JSON array):
[
  {
    "question": "Clear, unambiguous question text ending with?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Requirements:
- ${difficulty === 'easy' ? 'Fundamental concepts, no tricks' : 
     difficulty === 'medium' ? 'Application-level understanding' : 
     'Advanced problem-solving, edge cases'}
- No duplicate questions
- Correct answer must be one of the 4 options (exact match)
- Options should be plausible distractors`;
```

**Step 3: API Call**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.7,  // Balance between creativity and consistency
  max_tokens: 2000,  // Sufficient for 10 questions
  response_format: { type: 'json_object' } // Enforce JSON output
});

const aiResponse = completion.choices[0].message.content;
```

**Step 4: Response Parsing & Validation**

The AI sometimes returns malformed JSON or incorrect structure, so I have robust parsing:

```javascript
function parseTestQuestions(aiResponse) {
  let parsed;
  
  try {
    // Try parsing as-is
    parsed = JSON.parse(aiResponse);
  } catch (e) {
    // Try extracting JSON from markdown code blocks
    const match = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else {
      throw new Error('Invalid JSON response from AI');
    }
  }

  // Normalize structure (handle both array and object with 'questions' key)
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  // Validate each question
  return questions.map((q, index) => {
    if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
      throw new Error(`Invalid question format at index ${index}`);
    }

    if (q.options.length !== 4) {
      throw new Error(`Question ${index} must have exactly 4 options`);
    }

    if (!q.options.includes(q.correctAnswer)) {
      throw new Error(`Correct answer not in options for question ${index}`);
    }

    return {
      question: q.question.trim(),
      options: q.options.map(o => o.trim()),
      correctAnswer: q.correctAnswer.trim()
    };
  });
}
```

**Step 5: Saving to Database**

```javascript
const test = await Test.create({
  topic,
  difficulty,
  questions: parsedQuestions,
  totalQuestions: parsedQuestions.length,
  duration: Math.ceil(parsedQuestions.length * 1.5), // 1.5 min per question
  teacherId: userId,
  testCode: generateUniqueCode(),
  createdAt: new Date()
});

// Update user's generation counter (for quota enforcement)
await User.findByIdAndUpdate(userId, {
  $inc: { generation_count: 1 },
  $push: { createdTests: test._id }
});
```

### Cost Optimization

- **Use gpt-4o-mini** instead of gpt-4 (60x cheaper)
- **Limit tokens** with `max_tokens` parameter
- **Cache common prompts** (future improvement)
- **Batch requests** if generating multiple tests

**Cost example:**
- 10 questions ≈ 1500 tokens
- gpt-4o-mini: $0.15 per 1M input tokens
- Cost per test: ~$0.000225 (negligible)

---

## 📊 State Management

### Why Context API Over Redux?

**Pros of Context API (why I chose it):**
- ✅ Built into React - no extra dependencies
- ✅ Simpler mental model for this project's scale
- ✅ Less boilerplate code
- ✅ Perfect for global state like authentication

**When Redux would be better:**
- ❌ If app had 50+ components sharing state
- ❌ If complex state transitions needed middleware
- ❌ If time-travel debugging was critical

### AuthContext Implementation

```javascript
// AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await authAPI.login({ email, password });
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    setUser(user);
    
    return response.data;
  }

  async function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier usage
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Using Context in Components

```javascript
// Dashboard.jsx
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {user.role === 'teacher' && <TeacherDashboard />}
      {user.role === 'student' && <StudentDashboard />}
    </div>
  );
}
```

---

## 💳 Payment System

### Razorpay Integration (Freemium Model)

**Free Tier:**
- 5 test generations
- Basic analytics
- Single classroom

**Premium Plans:**
- ₹299/month - Unlimited tests, 5 classrooms
- ₹1,499/6 months - 20% discount
- ₹2,499/year - 30% discount

### Payment Flow

```
1. User clicks "Upgrade to Premium"
      ↓
2. Selects plan (monthly/6-month/yearly)
      ↓
3. Frontend calls POST /api/payments/create-order
      ↓
4. Backend creates Razorpay order
      ↓
5. Returns order ID to frontend
      ↓
6. Frontend opens Razorpay checkout modal
      ↓
7. User completes payment (UPI/Card/NetBanking)
      ↓
8. Razorpay returns payment response to frontend
      ↓
9. Frontend sends payment details to POST /api/payments/verify
      ↓
10. Backend verifies signature (security)
      ↓
11. Creates Subscription document
      ↓
12. Returns success to frontend
      ↓
13. User now has unlimited test generation
```

### Backend Implementation

```javascript
// paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
export async function createOrder(req, res) {
  const { plan } = req.body; // 'monthly', '6months', 'yearly'
  const userId = req.userId;

  const prices = {
    monthly: 29900,  // Paise (₹299)
    '6months': 149900,
    yearly: 249900
  };

  const order = await razorpay.orders.create({
    amount: prices[plan],
    currency: 'INR',
    receipt: `order_${userId}_${Date.now()}`
  });

  res.json({ orderId: order.id });
}

// Verify payment
export async function verifyPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;
  const userId = req.userId;

  // CRITICAL: Verify signature to prevent fake payments
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Calculate expiry date
  const durations = {
    monthly: 30,
    '6months': 180,
    yearly: 365
  };

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durations[plan]);

  // Create subscription
  await Subscription.create({
    userId,
    plan,
    status: 'active',
    startDate: new Date(),
    expiryDate,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  res.json({ success: true, message: 'Subscription activated' });
}
```

### Checking Entitlements

```javascript
// utils/entitlements.js
export async function checkTestGenerationLimit(userId) {
  // Check active subscription
  const subscription = await Subscription.findOne({
    userId,
    status: 'active',
    expiryDate: { $gt: new Date() }
  });

  if (subscription) {
    return {
      canGenerate: true,
      remaining: Infinity,
      isPaid: true
    };
  }

  // Check free tier usage
  const user = await User.findById(userId);
  const used = user.generation_count;
  const limit = 5;

  return {
    canGenerate: used < limit,
    remaining: limit - used,
    limit,
    isPaid: false
  };
}
```

---

## 🚀 Advanced Features

### 1. ML-Powered Performance Analytics

Located in `backend/src/utils/PerformanceAnalysisEngine.js`

This is a **custom-built machine learning engine** (not using external ML libraries) that analyzes student performance:

**Algorithms Implemented:**

**a) Weighted Score Calculation (Exponential Decay)**
```javascript
// Recent tests weighted more heavily than old tests
function calculateWeightedScore(results) {
  return results.map(result => {
    const daysAgo = (Date.now() - result.submittedAt) / (1000 * 60 * 60 * 24);
    const weight = Math.exp(-daysAgo / 30); // Exponential decay
    return result.percentage * weight;
  }).reduce((sum, score) => sum + score, 0) / results.length;
}
```

**b) Consistency Score (Standard Deviation)**
```javascript
// Measures reliability of performance (0-100)
function calculateConsistency(scores) {
  const mean = scores.reduce((a, b) => a + b) / scores.length;
  const variance = scores.reduce((sum, score) => 
    sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.max(0, 100 - (stdDev / 50 * 100));
}
```

**c) Improvement Trend (-100 to +100)**
```javascript
// Compares first half vs second half of tests
function calculateImprovementTrend(results) {
  const midpoint = Math.floor(results.length / 2);
  const firstHalf = results.slice(0, midpoint);
  const secondHalf = results.slice(midpoint);
  
  const avgFirst = average(firstHalf.map(r => r.percentage));
  const avgSecond = average(secondHalf.map(r => r.percentage));
  
  return avgSecond - avgFirst; // Positive = improving
}
```

**d) Multi-Factor Confidence Score**
```javascript
// Combines multiple signals into 0-100 confidence
function calculateConfidence(analysis) {
  const weights = {
    accuracy: 0.45,      // 45%
    consistency: 0.25,   // 25%
    improvement: 0.15,   // 15%
    testCount: 0.10,     // 10%
    difficulty: 0.05     // 5%
  };

  return (
    analysis.weightedScore * weights.accuracy +
    analysis.consistency * weights.consistency +
    normalizeImprovement(analysis.improvementTrend) * weights.improvement +
    normalizeTestCount(analysis.testCount) * weights.testCount +
    analysis.avgDifficulty * weights.difficulty
  );
}
```

**Visualizations Generated:**
- Topic performance heatmap (color-coded cards)
- Strength/Weakness categorization
- Learning priority ranking (where to focus study effort)
- Class-wide insights (strongest/weakest topics across all students)

### 2. GATE Mock Test System

Specialized feature for competitive exam preparation:

**Question Bank Structure:**
```javascript
// backend/data/gateQuestions.js
export const gateQuestions = [
  {
    id: "q1",
    exam: "GATE",
    subject: "DSA",
    topic: "Binary Trees",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity of...",
    options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    answer: 1 // Index of correct option
  },
  // ... 50+ questions
];
```

**Smart Generation Algorithm:**
```javascript
// Balances difficulty (30% easy, 40% medium, 30% hard)
// Ensures topic distribution (10+ topics covered)
// Mixes 1-mark and 2-mark questions
function generateGatePaper(subject, questionCount = 50) {
  const questions = gateQuestions.filter(q => q.subject === subject);
  
  // Shuffle using Fisher-Yates algorithm
  const shuffled = shuffleArray(questions);
  
  // Balance by difficulty
  const easy = shuffled.filter(q => q.difficulty === 'easy').slice(0, 15);
  const medium = shuffled.filter(q => q.difficulty === 'medium').slice(0, 20);
  const hard = shuffled.filter(q => q.difficulty === 'hard').slice(0, 15);
  
  return [...easy, ...medium, ...hard];
}
```

### 3. Real-Time Leaderboards

**Ranking Algorithm:**
```javascript
// When student submits test, calculate rank
export async function calculateRank(testId, score) {
  // Count how many students scored higher
  const higherScores = await Result.countDocuments({
    testId,
    score: { $gt: score }
  });
  
  return higherScores + 1; // Rank is count + 1
}
```

**Live Updates:**
- Leaderboard refreshes after each submission
- Ties handled by submission time (earlier submission wins)
- Pagination for tests with 100+ students

### 4. Classroom Management

**Multi-Classroom Support:**
- Teachers can create unlimited classrooms (Premium)
- Each classroom has unique invite code
- Students can be in multiple classrooms

**Student Enrollment:**
```javascript
// Backend: classroomController.js
export async function enrollStudent(req, res) {
  const { inviteCode } = req.body;
  const studentId = req.userId;

  const classroom = await Classroom.findOne({ inviteCode });
  if (!classroom) {
    return res.status(404).json({ error: 'Invalid invite code' });
  }

  // Check if already enrolled
  if (classroom.students.includes(studentId)) {
    return res.status(400).json({ error: 'Already enrolled' });
  }

  // Add student to classroom
  classroom.students.push(studentId);
  await classroom.save();

  // Add classroom to user's list
  await User.findByIdAndUpdate(studentId, {
    $push: { classrooms: classroom._id }
  });

  res.json({ success: true, classroom });
}
```

### 5. Unique User Handles

Twitter-style `@username_1234` system:

```javascript
// utils/generateUniqueHandle.js
export async function generateUniqueHandle(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);

  let attempts = 0;
  while (attempts < 10) {
    const digits = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const handle = `${base}_${digits}`;

    const exists = await User.findOne({ handle });
    if (!exists) {
      return handle;
    }

    attempts++;
  }

  throw new Error('Could not generate unique handle');
}
```

---

## 🔒 Security Implementation

### 1. Password Security

```javascript
// Never store plain text passwords
import bcrypt from 'bcryptjs';

// On registration:
const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
user.password = hashedPassword;

// On login:
const isMatch = await bcrypt.compare(inputPassword, user.password);
```

### 2. JWT Security

```javascript
// Token expiration
const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
  expiresIn: '7d' // Force re-login after 7 days
});

// Secure secret (from .env, never committed to Git)
JWT_SECRET=super_secret_random_string_min_32_chars
```

### 3. Input Validation

```javascript
// Mongoose schema validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ // Email regex
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  }
});

// Controller validation
if (!topic || !difficulty) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### 4. CORS Configuration

```javascript
// Only allow specific origins
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### 5. Rate Limiting (Future Enhancement)

```javascript
// Prevent abuse with express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Max 100 requests per IP
});

app.use('/api/', limiter);
```

### 6. Payment Signature Verification

```javascript
// CRITICAL: Prevent fake payment submissions
const generatedSignature = crypto
  .createHmac('sha256', RAZORPAY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

if (generatedSignature !== receivedSignature) {
  throw new Error('Invalid payment');
}
```

### 7. MongoDB Injection Prevention

```javascript
// Mongoose automatically sanitizes queries
// But still avoid using $where operators

// BAD:
User.find({ $where: req.body.userInput }); // Vulnerable

// GOOD:
User.findById(req.params.id); // Safe
```

---

## 🛡️ Error Handling & Validation

### Global Error Handler

```javascript
// middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
}
```

### Async Handler Wrapper

```javascript
// Eliminates try-catch boilerplate
export default function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage:
export const getTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({ teacherId: req.userId });
  res.json({ tests }); // No try-catch needed!
});
```

### Frontend Error Handling

```javascript
// services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    // Extract error message
    const message = error.response?.data?.error || 'Something went wrong';
    
    // Show user-friendly message
    toast.error(message);
    
    // Log for debugging
    console.error('API Error:', error);
    
    return Promise.reject(error);
  }
);
```

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** Atlas account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recommended editor)

### Step-by-Step Installation

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/bodhira.git
cd bodhira
```

**2. Backend Setup**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bodhira?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_random

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Server
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**3. Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

**4. Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

**5. Access Application**

Open browser: http://localhost:5173

---

## 📁 Project Structure

```
bodhira/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   └── email.js              # Nodemailer setup
│   │   │
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Test.js               # Test schema
│   │   │   ├── Result.js             # Result schema
│   │   │   ├── Classroom.js          # Classroom schema
│   │   │   ├── Subscription.js       # Subscription schema
│   │   │   └── Payment.js            # Payment schema
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js     # Auth logic
│   │   │   ├── testController.js     # Test CRUD
│   │   │   ├── generationController.js  # AI generation
│   │   │   ├── classroomController.js   # Classroom management
│   │   │   ├── analyticsController.js   # Performance analytics
│   │   │   └── paymentController.js     # Payment processing
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   ├── classroomRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── paymentRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   ├── asyncHandler.js       # Error wrapper
│   │   │   └── errorHandler.js       # Global error handler
│   │   │
│   │   ├── utils/
│   │   │   ├── openaiClient.js       # OpenAI integration
│   │   │   ├── entitlements.js       # Subscription checks
│   │   │   ├── testGenerationHelpers.js
│   │   │   └── PerformanceAnalysisEngine.js  # ML analytics
│   │   │
│   │   └── server.js                 # App entry point
│   │
│   ├── data/
│   │   └── gateQuestions.js          # GATE question bank
│   │
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout/
│   │   │   │   └── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ClassroomCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GenerateTest.jsx
│   │   │   ├── JoinTest.jsx
│   │   │   ├── TakeTest.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── History.jsx
│   │   │   ├── ClassroomList.jsx
│   │   │   ├── ClassroomPage.jsx
│   │   │   ├── GateMockTest.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User state management
│   │   │   └── ThemeContext.jsx      # Dark/Light mode
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Axios client & API calls
│   │   │
│   │   ├── styles/
│   │   │   └── [component].css       # Component styles
│   │   │
│   │   ├── App.jsx                   # Main component
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles
│   │   └── theme.css                 # CSS variables
│   │
│   ├── public/
│   │   └── logo.png
│   │
│   ├── .env                          # Environment variables
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── README.md                         # This file
└── LICENSE
```

---

## 🛠 Development Tools & Workflow

### VS Code Extensions Used

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **ES7+ React/Redux snippets** - Faster component creation
4. **MongoDB for VS Code** - Database browsing
5. **Thunder Client** - API testing (Postman alternative)
6. **GitLens** - Git visualization
7. **Auto Rename Tag** - HTML/JSX tag renaming

### Git Workflow

```bash
# Feature development
git checkout -b feature/classroom-analytics
# ... make changes ...
git add .
git commit -m "feat: Add ML-powered classroom analytics"
git push origin feature/classroom-analytics
# Create Pull Request on GitHub
```

### API Testing with Postman

**Collections created:**
- Authentication (Register, Login, Verify OTP)
- Tests (Generate, Get by Code, Submit)
- Classrooms (Create, Enroll, Get Tests)
- Payments (Create Order, Verify)

**Environment variables:**
- `BASE_URL`: http://localhost:5000/api
- `TOKEN`: Updated after login for authenticated requests

### Database Management

**MongoDB Compass:**
- View collections and documents
- Run aggregation pipelines for analytics
- Create indexes for query optimization

**Useful Indexes:**
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ handle: 1 }, { unique: true });

// Tests
db.tests.createIndex({ testCode: 1 }, { unique: true });
db.tests.createIndex({ teacherId: 1, createdAt: -1 });

// Results
db.results.createIndex({ testId: 1, score: -1 });
db.results.createIndex({ studentId: 1, submittedAt: -1 });
```

---

## 🌟 Future Improvements

### Short-Term (Next 2-3 Months)

1. **Image Support in Questions**
   - Upload diagrams/code screenshots
   - Store in Cloudinary or AWS S3

2. **Real-Time Collaboration**
   - Socket.io for live test-taking status
   - Teacher can see who's currently taking test

3. **Advanced Question Types**
   - True/False
   - Multiple correct answers
   - Fill in the blanks
   - Code execution tests (integrate Judge0 API)

4. **Mobile App**
   - React Native version
   - Push notifications for test invites

5. **Test Scheduling**
   - Schedule tests for future date/time
   - Automatic publishing

### Medium-Term (4-6 Months)

1. **AI-Powered Adaptive Testing**
   - Difficulty adjusts based on student performance
   - Personalized question selection

2. **Video Explanations**
   - Attach video solutions to questions
   - YouTube/Vimeo integration

3. **Peer Comparison**
   - Compare your performance with class average
   - Percentile rankings

4. **Detailed Test Reports**
   - PDF export with charts
   - Email to students/parents

5. **Certification System**
   - Generate certificates for completed tests
   - Digital badges

### Long-Term (6-12 Months)

1. **Multi-Language Support**
   - i18n for Hindi, Spanish, etc.
   - RTL support for Arabic

2. **Admin Dashboard**
   - Platform-wide analytics
   - User management
   - Revenue tracking

3. **Offline Mode**
   - PWA with service workers
   - Sync when back online

4. **Gamification**
   - XP points, levels, achievements
   - Leaderboards with rewards

5. **Live Classes Integration**
   - Zoom/Google Meet integration
   - Schedule classes within platform

6. **AI Tutor Chatbot**
   - Answer student questions using GPT
   - Provide study tips based on weak areas

---

## 🎓 Key Learnings & Interview Talking Points

### Technical Challenges Solved

**1. Preventing Double-Deduction Bug (Test Deletion)**
- **Problem:** Deleting tests decreased quota counter, allowing unlimited tests
- **Solution:** Introduced `generation_count` field that never decrements
- **Learning:** Database schema design requires thinking about edge cases

**2. JWT Token Not Persisting**
- **Problem:** User logged out on page refresh
- **Solution:** Store token in localStorage, check on app mount
- **Learning:** Browser storage APIs and React lifecycle management

**3. AI Response Parsing Failures**
- **Problem:** OpenAI sometimes returned malformed JSON
- **Solution:** Robust parsing with regex fallbacks and validation
- **Learning:** Never trust external API responses; always validate

**4. MongoDB Query Performance**
- **Problem:** Leaderboard queries slow with 1000+ results
- **Solution:** Added compound indexes on `(testId, score)`
- **Learning:** Database indexing significantly impacts performance

**5. Razorpay Signature Mismatch**
- **Problem:** Payment verification randomly failed
- **Solution:** Used raw body in HMAC, not JSON-parsed version
- **Learning:** Cryptographic operations require exact data formats

### Why This Project Demonstrates My Skills

1. **Full-Stack Expertise:** Comfortable with both frontend (React) and backend (Node.js/Express)
2. **Database Design:** Normalized schemas with proper relationships and indexes
3. **API Design:** RESTful endpoints with consistent response formats
4. **Authentication:** Secure JWT implementation with role-based access
5. **Third-Party Integrations:** OpenAI, Razorpay, Nodemailer
6. **Problem Solving:** Implemented custom ML algorithms without external libraries
7. **Production Thinking:** Error handling, validation, security, scalability
8. **Modern Tooling:** Vite, ES6+ modules, async/await, React Hooks

---

## 📧 Contact & Links

**Developer:** [Your Name]  
**Email:** your.email@example.com  
**GitHub:** [github.com/yourusername](https://github.com/yourusername)  
**LinkedIn:** [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)  
**Live Demo:** [Coming Soon]  

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT API access
- **MongoDB** for database hosting
- **Razorpay** for payment gateway
- **React documentation** for excellent guides
- **Stack Overflow** community for debugging help
- **GitHub Copilot** for coding assistance during development

---

**Built with ❤️ by a passionate developer learning to build real-world applications.**

*Last Updated: March 4, 2026*
