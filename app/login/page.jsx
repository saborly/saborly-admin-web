'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle, Users, Settings, BarChart3, LogOut } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    // In your app, replace with: localStorage.getItem('authToken')
    const token = null; // Simulating no stored token
    const userData = null; // Simulating no stored user data
    
    if (token && userData) {
      setAuthToken(token);
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call to your backend
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock response - replace with actual API call
          if (email === 'superadmin@example.com' && password === 'password') {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                message: 'Login successful',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                  id: '507f1f77bcf86cd799439011',
                  firstName: 'Super',
                  lastName: 'Admin',
                  email: 'superadmin@example.com',
                  role: 'superadmin',
                  emailVerified: true,
                  lastLogin: new Date().toISOString()
                }
              })
            });
          } else {
            resolve({
              ok: false,
              json: () => Promise.resolve({
                success: false,
                message: 'Invalid credentials or insufficient permissions'
              })
            });
          }
        }, 1000);
      });

      const data = await response.json();

      if (data.success && data.user.role === 'superadmin') {
        // In your app, use localStorage:
        // localStorage.setItem('authToken', data.token);
        // localStorage.setItem('user', JSON.stringify(data.user));
        
        setAuthToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Access denied. Super admin privileges required.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const logout = () => {
    // In your app, use localStorage:
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('user');
    
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    authToken,
    isLoading,
    login,
    logout,
    isAuthenticated: !!authToken && !!user && user.role === 'superadmin'
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

// Login Component
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setMessage({
        type: 'error',
        text: result.message
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin</h1>
          <p className="text-gray-300">Secure administrative access</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
              : 'bg-green-500/20 border border-green-500/30 text-green-400'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                } rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border ${
                  errors.password ? 'border-red-500' : 'border-white/20'
                } rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Super Admin access only
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm mb-2">
            <strong>Demo Credentials:</strong>
          </p>
          <p className="text-blue-200 text-xs font-mono">
            Email: superadmin@example.com<br/>
            Password: password
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Active Sessions', value: '89', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
    { title: 'System Health', value: '98.5%', icon: Settings, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Super Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-400">
            Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Manage Users',
              'System Settings',
              'View Reports',
              'Security Audit'
            ].map((action, index) => (
              <button
                key={index}
                className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 text-left transition-all duration-200 group"
              >
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                  {action}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">User ID</p>
              <p className="text-white font-mono">{user?.id}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-white capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Verified</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Account Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <LoginPage />;
};

// Main App Component
const SuperAdminApp = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default SuperAdminApp;