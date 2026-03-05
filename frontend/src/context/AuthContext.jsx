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

    // Use AbortController to prevent duplicate requests in StrictMode
    const abortController = new AbortController();
    checkAuth(abortController.signal);
    
    return () => abortController.abort();
  }, []);

  const checkAuth = async (signal) => {
    try {
      const token = localStorage.getItem('token');
      console.log('\n🔍 ===== AUTH CHECK =====');
      console.log('Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'NONE');
      
      if (!token) {
        console.log('No token found - user is NOT authenticated');
        setUser(null);
        setLoading(false);
        return;
      }
      
      console.log('Token found - fetching user data...');
      const response = await authAPI.getCurrentUser(signal);
      const userData = response.data.data?.user || response.data.user;
      
      if (!userData) {
        console.error('No user data in response');
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }
      
      console.log('✅ User authenticated:', userData.name);
      console.log('User._id:', userData._id);
      console.log('========================\n');
      setUser(userData);
    } catch (error) {
      // Ignore abort errors from cleanup
      if (error.name !== 'AbortError') {
        console.error('❌ Auth check failed:', error.message);
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      console.log('\n✅ ===== LOGIN RESPONSE =====');
      console.log('Full response.data:', response.data);
      console.log('Full response.data.data:', response.data.data);
      
      // Try multiple response formats
      let token, user;
      
      // Most likely format from backend
      if (response.data?.data?.token) {
        token = response.data.data.token;
        user = response.data.data.user;
        console.log('✅ Found token in response.data.data');
      } 
      // Fallback format
      else if (response.data?.token) {
        token = response.data.token;
        user = response.data.user;
        console.log('✅ Found token in response.data');
      } 
      // Error case
      else {
        console.error('❌ NO TOKEN FOUND IN RESPONSE');
        console.error('response.data keys:', Object.keys(response.data || {}));
        console.error('response.data.data keys:', Object.keys(response.data?.data || {}));
        throw new Error('No token in login response');
      }
      
      if (!token) {
        throw new Error('Token is empty: ' + token);
      }
      
      console.log('Token received:', `${token.substring(0, 20)}...`);
      console.log('User object:', user);
      
      localStorage.setItem('token', token);
      const stored = localStorage.getItem('token');
      console.log('✅ Token stored in localStorage:', stored ? `${stored.substring(0, 20)}...` : 'STORAGE FAILED');
      
      sessionStorage.setItem(SESSION_KEY, SESSION_ID);
      setUser(user);
      
      console.log('=============================\n');
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.message);
      console.error('Response error:', error.response?.data);
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