import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ClassroomGenerateTest from './pages/ClassroomGenerateTest';
import Navbar from './components/Navbar';
import Layout from './components/Layout/Layout';
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
import ExamCenter from './pages/ExamCenter';
import GateExamStart from './pages/GateExamStart';
import GateMockTest from './pages/GateMockTest';
import GateTestResults from './pages/GateTestResults';
import GateHistory from './pages/GateHistory';
import Settings from './pages/Settings';
import Help from './pages/Help';
import MockTestBrowse from './pages/MockTestBrowse';
import ExamStartScreen from './pages/ExamStartScreen';

// Component to conditionally show navbar or sidebar
const AppContent = () => {
  const location = useLocation();
  
  // Routes that should show old navbar (public pages)
  const publicRoutes = ['/', '/login', '/register', '/verify-otp'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="app">
      <ErrorBoundary>
        {isPublicRoute && <Navbar />}
      </ErrorBoundary>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes - No Sidebar */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Protected Routes - With Sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

                <Route path="/history" element={
                  <ProtectedRoute>
                    <Layout><History /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/classrooms" element={
                  <ProtectedRoute>
                    <Layout><ClassroomList /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/classrooms/:id" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Layout><ClassroomPage /></Layout>
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />

                <Route path="/classrooms/:classroomId/student/:studentId" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Layout><StudentProfileDetail /></Layout>
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />

                <Route path="/classrooms/:id/generate-test" element={
                  <ProtectedRoute>
                    <Layout><ClassroomGenerateTest /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/generate" element={
                  <ProtectedRoute>
                    <Layout><GenerateTest /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/access" element={<StudentAccess />} />

                <Route path="/test/code/:testCode" element={<TakeTest />} />
                
                <Route path="/test/:testId/preview" element={
                  <ProtectedRoute>
                    <Layout><TestPreview /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/test/:testId/published" element={
                  <ProtectedRoute>
                    <Layout><PublishedTestDashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/join" element={
                  <ProtectedRoute>
                    <Layout><JoinTest /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/test/:testId" element={
                  <ProtectedRoute>
                    <Layout><TakeTest /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/results" element={
                  <ProtectedRoute>
                    <Layout><Results /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/results/:resultId" element={
                  <ProtectedRoute>
                    <Layout><Results /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/results/test/:testCode" element={
                  <ProtectedRoute>
                    <Layout><Results /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Layout><Leaderboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/test/:testCode/results" element={
                  <ProtectedRoute>
                    <Layout><TestResults /></Layout>
                  </ProtectedRoute>
                } />

                {/* Mock Exams Routes */}
                <Route path="/test-center" element={
                  <ProtectedRoute>
                    <Layout><ExamCenter /></Layout>
                  </ProtectedRoute>
                } />

                {/* New Premium Mock Test System */}
                <Route path="/mock-tests" element={
                  <ProtectedRoute>
                    <Layout><MockTestBrowse /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/mock-tests/:examId" element={
                  <ProtectedRoute>
                    <ExamStartScreen />
                  </ProtectedRoute>
                } />

                {/* Gate Exam Start Page (with Start button) */}
                <Route path="/mock-exam" element={
                  <ProtectedRoute>
                    <Layout><GateExamStart /></Layout>
                  </ProtectedRoute>
                } />

                {/* Gate Exam Actual Test (only when started) */}
                <Route path="/mock-exam/start" element={
                  <ProtectedRoute>
                    <GateMockTest />
                  </ProtectedRoute>
                } />

                <Route path="/gate-results" element={
                  <ProtectedRoute>
                    <Layout><GateTestResults /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/gate-history" element={
                  <ProtectedRoute>
                    <Layout><GateHistory /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout><Help /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </div>
        );
      };

      function App() {
        return (
          <Router>
            <AuthProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </AuthProvider>
          </Router>
        );
      }

      export default App;