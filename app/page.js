'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle, Users, Settings, BarChart3, LogOut } from 'lucide-react';
import RestaurantAdminDashboard from './component/dashoard';
import Dashoard from './admin/page';

// Auth Context
export const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin') {
          setAuthToken(token);
          setUser(parsedUser);
        } else {
          // Clear invalid role data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (data.success && data.user.role === 'admin') {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setAuthToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else if (data.success && data.user.role !== 'admin') {
        return { 
          success: false, 
          message: 'Access denied. Super Admin privileges required.' 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setAuthToken(null);
    setUser(null);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value = {
    user,
    authToken,
    isLoading,
    login,
    logout,
    isAuthenticated: !!authToken && !!user && user.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component with new executive visual design
const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general message
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent" />
        <div className="backdrop-grid" />
        <div className="absolute left-1/3 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/30 blur-[150px]" />
        <div className="absolute right-0 bottom-10 h-60 w-60 rounded-full bg-orange-500/20 blur-[180px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:grid lg:grid-cols-[1.1fr,0.9fr] lg:items-stretch lg:px-10">
        <section className="glass-panel bg-white p-8 text-black shadow-2xl">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-900">Saborly Admin</p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-black">Command center for culinary operations</h1>
              <p className="mt-4 text-base text-slate-700">
                Monitor performance, update menus and resolve orders with a polished control room built for decisive teams.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-slate-800">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Enterprise-grade security with MFA-ready workflows
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Real-time visibility into orders, inventory and offers
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Designed for distributed teams with localized operations
                </li>
              </ul>
            </div>

          </div>
        </section>

        <section className="glass-panel bg-white p-8 text-slate-900 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white shadow-lg">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-semibold">Secure Admin Sign-In</h2>
            <p className="mt-3 text-sm text-slate-500">Use your corporate Saborly credentials to continue.</p>
          </div>

          {message.text && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                message.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@saorely.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className={`w-full rounded-2xl border px-5 py-4 pl-12 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-900/60 ${
                    errors.email ? 'border-red-300 ring-red-200' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-2 text-xs font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`w-full rounded-2xl border px-5 py-4 pl-12 pr-14 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-900/60 ${
                    errors.password ? 'border-red-300 ring-red-200' : 'border-slate-200 bg-slate-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-2 text-xs font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Enter dashboard
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-xs text-slate-500">
            <p className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Infrastructure status: Operational
            </p>
            <p>Having trouble accessing your account? Contact the platform owner.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 text-black">
    <div className="glass-panel bg-white p-10 text-center">
      <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <h3 className="text-lg font-semibold text-black">Preparing Saborly Admin</h3>
      <p className="mt-2 text-sm text-slate-700">Initializing encrypted session...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Additional check to ensure user is superadmin
  if (user?.role !== 'admin') {
    return <LoginPage />;
  }

  return children;
};

// Main App Component
const SuperAdminApp = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
<Dashoard/>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default SuperAdminApp;