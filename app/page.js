'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle, Users, Settings, BarChart3, LogOut, Crown } from 'lucide-react';
import RestaurantAdminDashboard from './component/dashoard';
import Dashoard from './admin/page';

// Auth Context
const AuthContext = createContext();

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
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component with FoodKing Theme
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
    <div className="min-h-screen  flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full"></div>
        <div 
          className="absolute inset-0 " 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>

      <div className="relative z-10 bg-white shadow-2xl rounded-3xl border border-orange-100 p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#FF005E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white bg-[#FF005E]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saorely Admin</h1>
          <p className="text-gray-900 font-medium"> Administrator Access</p>
          <div className="w-16 h-1 bg-[#FF005E] rounded-full mx-auto mt-3"></div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-gray-50 border-2 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200`}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-gray-50 border-2 ${
                  errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl pl-12 pr-14 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-[#FF005E] hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Sign In to Dashboard
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Secure access for authorized Administrators only
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Saorely Admin</h3>
        <p className="text-gray-600 text-sm">Initializing secure connection...</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
        </div>
      </div>
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