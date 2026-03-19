import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, setAuthToken, clearAuthToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'Student' | 'Warden' | 'Admin';
  hostelBlock?: string;
  room?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize user from localStorage immediately to prevent logout on refresh
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user data:', e);
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a token - if yes, user should be considered authenticated
    return !!localStorage.getItem('authToken');
  });

  useEffect(() => {
    // Check for existing token in localStorage on mount
    const restoreSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🔑 Found token in localStorage, restoring session...');
        setAuthToken(token);
        // Immediately set as authenticated while fetching user data
        // This prevents logout flash on page refresh
        setIsAuthenticated(true);
        
        // Fetch user data with the existing token - don't clear token if this fails
        try {
          await fetchUserData(token);
        } catch (error) {
          console.warn('⚠️ Could not restore session, but keeping token:', error);
          // Don't clear token - might be a temporary network issue
          // User stays authenticated with token and saved user data
        }
      } else {
        console.log('❌ No token found in localStorage');
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('userData');
      }
    };
    
    restoreSession();
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      console.log('🔄 Fetching user data with token...');
      setAuthToken(token); // Ensure token is set before making request
      
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1'}/auth/me`;
      console.log('API URL:', apiUrl);
      
      // Create abort controller for timeout - increased to 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Auth response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data received:', userData.user);
        
        if (userData.user) {
          // Save user data to localStorage for immediate restore on refresh
          localStorage.setItem('userData', JSON.stringify(userData.user));
          setUser(userData.user);
          setIsAuthenticated(true);
          console.log('✅ User session restored successfully');
          return; // Success - exit early
        } else {
          throw new Error('Invalid user data received');
        }
      } else if (response.status === 401 || response.status === 403) {
        // Only clear token on actual auth errors
        const errorText = await response.text();
        console.log('❌ Auth failed (401/403), token is invalid');
        // Only clear if it's definitely an auth error
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Server error (500, etc.) - keep token, might be temporary
        console.warn('⚠️ Server error during auth check, keeping token:', response.status);
        // Don't clear token - server might be down temporarily
      }
    } catch (error: any) {
      // Network errors or timeouts - NEVER clear token on these
      if (error.name === 'AbortError') {
        console.warn('⚠️ Request timeout, keeping token - might be slow network');
        return; // Keep token, user stays logged in
      }
      
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        console.warn('⚠️ Network error, keeping token - might be offline');
        return; // Keep token, user stays logged in
      }
      
      console.error('💥 Error fetching user data:', error);
      // Only clear token if it's explicitly an auth error from the server
      // For all other errors, keep the token and user logged in
    }
  };

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      // Clear any existing token first
      clearAuthToken();
      localStorage.removeItem('authToken');
      
      const res = await apiRequest<{ token: string; user: User }>(
        'POST',
        '/auth/login',
        { email, password },
        false // Don't require auth for login
      );
      
      // Verify the user role matches what we expect
      if (res.user.role !== role) {
        console.warn('⚠️ Role mismatch: Expected', role, 'but got', res.user.role);
        // Still allow login but log warning
      }
      
      // Set new token and user
      setAuthToken(res.token);
      localStorage.setItem('authToken', res.token); // Persist token
      localStorage.setItem('userData', JSON.stringify(res.user)); // Persist user data
      setUser(res.user);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful, user data set:', res.user);
      console.log('✅ Token stored:', res.token.substring(0, 20) + '...');
      
      // Verify token is stored correctly
      const storedToken = localStorage.getItem('authToken');
      if (storedToken !== res.token) {
        console.error('❌ Token mismatch! Setting it again...');
        localStorage.setItem('authToken', res.token);
      }
      
      // Force a small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial state on error
      clearAuthToken();
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthToken();
    localStorage.removeItem('authToken'); // Clear persisted token
    localStorage.removeItem('userData'); // Clear persisted user data
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      hostelBlock: userData.hostelBlock,
      room: (userData as any).roomNumber ?? (userData as any).room,
    };
    const response = await apiRequest<{ message: string; user: User }>(
      'POST',
      '/auth/signup',
      payload
    );
    // Don't automatically log in - user needs admin verification
    return true;
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    signup,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};