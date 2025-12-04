import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ClassroomGenerateTest from './pages/ClassroomGenerateTest';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import GenerateTest from './pages/GenerateTest';
import JoinTest from './pages/JoinTest';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import StudentAccess from './pages/StudentAccess';
import TestResults from './pages/TestResults';
import Profile from './pages/Profile';
import TestPreview from './pages/TestPreview';
import PublishedTestDashboard from './pages/PublishedTestDashboard';
import History from './pages/History';
import ClassroomList from './pages/ClassroomList';
import ClassroomPage from './pages/ClassroomPage';
import StudentProfileDetail from './pages/StudentProfileDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="app">
            <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />

            <Route path="/classrooms" element={
              <ProtectedRoute>
                <ClassroomList />
              </ProtectedRoute>
            } />

            <Route path="/classrooms/:id" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ClassroomPage />
                </ProtectedRoute>
              </ErrorBoundary>
            } />

            <Route path="/classrooms/:classroomId/student/:studentId" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <StudentProfileDetail />
                </ProtectedRoute>
              </ErrorBoundary>
            } />

            <Route path="/classrooms/:id/generate-test" element={
              <ProtectedRoute>
                <ClassroomGenerateTest />
              </ProtectedRoute>
            } />
            
            <Route path="/generate" element={
              <ProtectedRoute>
                <GenerateTest />
              </ProtectedRoute>
            } />

            {/* Public student access by code */}
            <Route path="/access" element={<StudentAccess />} />

            {/* Allow students to open a test by its code (no auth required) */}
            <Route path="/test/code/:testCode" element={<TakeTest />} />
            
            <Route path="/test/:testId/preview" element={
              <ProtectedRoute>
                <TestPreview />
              </ProtectedRoute>
            } />

            <Route path="/test/:testId/published" element={
              <ProtectedRoute>
                <PublishedTestDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/join" element={
              <ProtectedRoute>
                <JoinTest />
              </ProtectedRoute>
            } />
            
            <Route path="/test/:testId" element={
              <ProtectedRoute>
                <TakeTest />
              </ProtectedRoute>
            } />
            
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            
            <Route path="/results/test/:testCode" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            
            {/* Teacher view: results for a specific test code */}
            <Route path="/test/:testCode/results" element={
              <ProtectedRoute>
                <TestResults />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;