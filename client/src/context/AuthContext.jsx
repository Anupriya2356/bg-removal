import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return null;
      }

      setAuthToken(token);
      const { data } = await axios.get('http://localhost:4000/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/auth/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (data.token) {
        setToken(data.token);
        setAuthToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        console.error('No token in response:', data);
        return { 
          success: false, 
          message: data.message || 'Authentication failed - no token received'
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please check your credentials and try again.';
      return { 
        success: false, 
        message: errorMessage,
        status: error.response?.status
      };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      const { data } = await axios.post(
        'http://localhost:4000/api/auth/register', 
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (data.token) {
        setToken(data.token);
        setAuthToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        console.error('No token in registration response:', data);
        return { 
          success: false, 
          message: data.message || 'Registration failed - no token received'
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Registration failed. Please try again.';
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors,
        status: error.response?.status
      };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  // Check auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
