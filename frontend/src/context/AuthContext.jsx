/**
 * AuthContext — PlantBase
 * Manages authentication state + new methods for email verification & password reset.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pb_token') || null);
  const [loading, setLoading] = useState(true);

  // Auto login on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem('pb_token', data.token);
    localStorage.setItem('pb_user', JSON.stringify(data.user));

    return data.user;
  };

  // Register (no auto-login — email verification required)
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    // data = { success, message, requiresVerification }
    return data;
  };

  // Forgot password
  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  // Reset password
  const resetPassword = async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  };

  // Resend verification email
  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    if (data.data) {
      setUser(prev => ({ ...prev, ...data.data }));
      localStorage.setItem('pb_user', JSON.stringify({ ...user, ...data.data }));
    }
    return data;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pb_user');
    localStorage.removeItem('pb_token');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('pb_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        forgotPassword,
        resetPassword,
        resendVerification,
        loading,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}