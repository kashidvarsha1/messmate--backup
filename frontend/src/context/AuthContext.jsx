import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (isDev) {
          console.log('Loading stored user:', storedUser ? 'Yes' : 'No');
          console.log('Loading stored token:', storedToken ? 'Yes' : 'No');
        }

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (isDev) {
            console.log('User loaded from storage:', parsedUser.name, '| Role:', parsedUser.role);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, [isDev]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });

      const { token, user } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      if (!user) {
        throw new Error('No user data received from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      if (isDev) {
        console.log('Login successful. Role:', user.role);
      }

      // Return user so Login.jsx can redirect based on role
      return { success: true, user };
    } catch (error) {
      if (isDev) {
        console.error('Login error:', error.response?.data || error);
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Check your credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      if (isDev) {
        console.log('Registration successful. Role:', user.role);
      }
      return { success: true, user };
    } catch (error) {
      if (isDev) {
        console.error('Registration error:', error.response?.data || error);
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
