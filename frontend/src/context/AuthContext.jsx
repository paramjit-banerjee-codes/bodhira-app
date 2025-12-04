import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

// Generate a unique session ID for this window/tab
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const SESSION_KEY = 'auth_session_id';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify this is the same session that logged in
    const storedSessionId = sessionStorage.getItem(SESSION_KEY);
    if (!storedSessionId) {
      sessionStorage.setItem(SESSION_KEY, SESSION_ID);
    } else if (storedSessionId !== SESSION_ID) {
      // Different session - clear auth to prevent cross-tab pollution
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        // Handle both response formats
        const userData = response.data.data?.user || response.data.user;
        console.log('\n✅ ===== AUTH CHECK SUCCESS =====');
        console.log('User data from API:', userData);
        console.log('User._id:', userData?._id, 'type:', typeof userData?._id);
        console.log('==============================\n');
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Handle response format: response.data.data.token
      const { token, user } = response.data.data;
      
      console.log('\n✅ ===== LOGIN SUCCESS =====');
      console.log('Login response:', response.data.data);
      console.log('User object:', user);
      console.log('User._id:', user?._id, 'type:', typeof user?._id);
      console.log('=============================\n');
      
      localStorage.setItem('token', token);
      sessionStorage.setItem(SESSION_KEY, SESSION_ID);
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password, confirmPassword, role) => {
    try {
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        confirmPassword, 
        role 
      });
      
      // Check if OTP verification is required (new flow)
      if (response.data.data?.requiresVerification || response.data.data?.needsVerification) {
        console.log('\n✅ ===== REGISTRATION - OTP VERIFICATION REQUIRED =====');
        console.log('Email:', response.data.data.email);
        console.log('OTP expires at:', response.data.data.otpExpiresAt);
        console.log('=====================================================\n');
        
        // Don't set user or token yet - wait for OTP verification
        return response.data;
      }
      
      // Old flow: immediate login after registration
      const { token, user } = response.data.data;
      
      console.log('\n✅ ===== REGISTER SUCCESS =====');
      console.log('Register response:', response.data.data);
      console.log('User object:', user);
      console.log('User._id:', user?._id, 'type:', typeof user?._id);
      console.log('================================\n');
      
      localStorage.setItem('token', token);
      sessionStorage.setItem(SESSION_KEY, SESSION_ID);
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};