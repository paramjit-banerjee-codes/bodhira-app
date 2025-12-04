import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Connected to:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🔴 API Error Interceptor:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserByHandle: (handle) => api.get(`/auth/users/${handle}`),
};

// Test APIs
export const testAPI = {
  generateTestRequest: (data) => api.post('/tests/generate', data),
  generateTest: (data) => {
    const { signal, ...payload } = data;
    return api.post('/tests/generate', payload, { signal });
  },
  getGenerationStatus: (requestId) => api.get(`/tests/generate/status/${requestId}`),
  getTest: (testId) => api.get(`/tests/${testId}`),
  getTestByCode: (testCode) => api.get(`/tests/code/${encodeURIComponent(testCode)}`),
  getTeacherTests: () => api.get('/tests/my-tests'),
  getTestPreview: (testId) => api.get(`/tests/${testId}/preview`),
  publishTest: (testId, data = {}) => api.put(`/tests/${testId}/publish`, data),
  linkTestToClassroom: (testId, classroomId) => api.put(`/tests/${testId}/link-classroom`, { classroomId }),
  deleteTest: (testId) => api.delete(`/tests/${testId}`),
  submitTest: (testId, data) => api.post('/tests/submit', { testId, ...data }),
  getResult: (resultId) => api.get(`/tests/result/${resultId}`),
  getTestResults: (testCode) => api.get(`/tests/test/${encodeURIComponent(testCode)}/results`),
  getTestWithAnswers: (testCode) => api.get(`/tests/test/${encodeURIComponent(testCode)}/full`),
  getTestAnalytics: (testId) => api.get(`/tests/${testId}/analytics`),
  getQuotaStatus: () => api.get('/tests/quota'),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getLeaderboardByCode: (testCode) => api.get(`/leaderboard/code/${encodeURIComponent(testCode)}`),
  getTopicLeaderboard: (topic) => api.get(`/leaderboard/topic/${encodeURIComponent(topic)}`),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  deleteAllHistory: () => api.delete('/profile/history/all'),
};

// Classroom APIs
export const classroomAPI = {
  createClassroom: (data) => api.post('/classrooms', data),
  getClassrooms: () => api.get('/classrooms'),
  getClassroom: (classroomId) => api.get(`/classrooms/${classroomId}`),
  updateClassroom: (classroomId, data) => api.put(`/classrooms/${classroomId}`, data),
  deleteClassroom: (classroomId) => api.delete(`/classrooms/${classroomId}`),
  getClassroomStats: (classroomId) => api.get(`/classrooms/${classroomId}/stats`),
  addStudent: (classroomId, data) => api.post(`/classrooms/${classroomId}/students`, data),
  enrollStudent: (classroomId, data) => api.post(`/classrooms/${classroomId}/enroll`, data),
  getStudents: (classroomId) => api.get(`/classrooms/${classroomId}/students`),
  getClassroomTests: (classroomId) => api.get(`/classrooms/${classroomId}/tests`),
  getTests: (classroomId) => api.get(`/classrooms/${classroomId}/tests`), // Alias for getClassroomTests
  generateClassroomTest: (classroomId, data) => api.post(`/classrooms/${classroomId}/tests/generate`, data),
  createClassroomTest: (classroomId, data) => api.post(`/classrooms/${classroomId}/tests`, data),
  removeStudent: (classroomId, studentId) => api.delete(`/classrooms/${classroomId}/students/${studentId}`),
  getStudentProgress: (classroomId, studentId) => api.get(`/classrooms/${classroomId}/students/${studentId}`),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify-payment', data),
  getSubscription: () => api.get('/payments/subscription'),
  getFreeTests: () => api.get('/payments/free-tests'),
  getPaymentHistory: (query = {}) => api.get('/payments/history', { params: query }),
};

export default api;