'use client';
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
  pickDefaultBranchFromList,
  pickPreferredLoginBranch,
  formatBranchMenuLabel,
  getStoreLoginOptions,
  clearAdminAuthStorage,
  BRANCH_ID_FALLBACK,
} from '@/lib/clientBranchId';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle, MapPin, ChevronDown, Building2 } from 'lucide-react';
import RestaurantAdminDashboard from './component/dashoard';
import Dashoard from './admin/page';

const ADMIN_ROLES = ['admin', 'manager', 'super_admin', 'branch_admin', 'staff', 'superadmin'];

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
        if (ADMIN_ROLES.includes(parsedUser.role)) {
          setAuthToken(token);
          setUser(parsedUser);
        } else {
          clearAdminAuthStorage();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAdminAuthStorage();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, explicitBranchId) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.saborly.es/api/v1';
      const explicit =
        explicitBranchId != null && String(explicitBranchId).trim() !== ''
          ? String(explicitBranchId).trim()
          : '';

      // Resolve branch: explicit selection first, then env default (never read old stale localStorage here)
      let branchId =
        explicit ||
        (process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || '').trim() ||
        null;

      if (!branchId) {
        const brRes = await fetch(`${apiBase}/branches/public`);
        const brData = await brRes.json().catch(() => ({}));
        if (brData.success && Array.isArray(brData.branches) && brData.branches.length) {
          branchId = pickDefaultBranchFromList(brData.branches);
        }
      }

      if (!branchId) {
        return {
          success: false,
          message:
            'Could not determine branch. Set NEXT_PUBLIC_DEFAULT_BRANCH_ID or NEXT_PUBLIC_SABADELL_BRANCH_ID, or ensure /branches/public returns at least one branch.',
        };
      }

      // Write the chosen branch BEFORE the API call so it's set even if the response is slow
      localStorage.setItem('branchId', branchId);

      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': branchId,
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (data.success && ADMIN_ROLES.includes(data.user.role)) {
        // Always overwrite with the branch the server confirmed (sessionBranchId)
        const confirmedBranch = (data.user.branchId || '').trim() || branchId;
        localStorage.setItem('branchId', confirmedBranch);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setAuthToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else if (data.success && !ADMIN_ROLES.includes(data.user.role)) {
        return { 
          success: false, 
          message: 'Access denied. Admin or staff privileges required.' 
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
    clearAdminAuthStorage();

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
    isAuthenticated: !!(authToken && user && ADMIN_ROLES.includes(user.role)),
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
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  // Pre-select Sabadell from env immediately so a branch is always chosen before API loads
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    const sab = (process.env.NEXT_PUBLIC_SABADELL_BRANCH_ID || BRANCH_ID_FALLBACK.SABADELL || '').trim();
    const def = (process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || BRANCH_ID_FALLBACK.BARCELONA || '').trim();
    return sab || def || '';
  });

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.saborly.es/api/v1';
    let cancelled = false;
    (async () => {
      try {
        const brRes = await fetch(`${apiBase}/branches/public`);
        const brData = await brRes.json().catch(() => ({}));
        if (cancelled || !brData.success || !Array.isArray(brData.branches)) return;
        const list = [...brData.branches].sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''))
        );
        setBranches(list);
      } catch {
        /* env-only store cards still work via getStoreLoginOptions */
      } finally {
        if (!cancelled) setBranchesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const storeOptions = useMemo(() => getStoreLoginOptions(branches), [branches]);
  const barcelonaBranch = storeOptions.barcelona;
  const sabadellBranch = storeOptions.sabadell;
  const showBarcelonaSabadellCards = storeOptions.showDual;

  useEffect(() => {
    if (branchesLoading) return;
    const so = getStoreLoginOptions(branches);
    setSelectedBranchId((prev) => {
      if (so.showDual && so.barcelona && so.sabadell) {
        const a = String(so.barcelona._id);
        const b = String(so.sabadell._id);
        // Keep user's explicit card pick; only auto-select if prev is not one of these two ids
        if (prev === a || prev === b) return prev;
        return b; // Default to Sabadell when branches load (no stale localStorage read)
      }
      if (prev && branches.some((x) => String(x._id) === prev)) return prev;
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem('branchId') : null;
      if (stored && branches.some((x) => String(x._id) === stored)) return stored;
      const pick = pickPreferredLoginBranch(branches);
      return pick ? String(pick) : prev;
    });
  }, [branchesLoading, branches]);

  const otherBranches = useMemo(() => {
    if (!storeOptions.showDual || !storeOptions.barcelona || !storeOptions.sabadell) return [];
    const ids = new Set([String(storeOptions.barcelona._id), String(storeOptions.sabadell._id)]);
    return branches.filter((b) => !ids.has(String(b._id)));
  }, [branches, storeOptions]);

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

    const bid = selectedBranchId.trim();
    if (!bid) {
      setMessage({ type: 'error', text: 'Please select a store location before signing in.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(
        formData.email,
        formData.password,
        bid
      );
      
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
    <div className="relative min-h-screen bg-slate-100 text-slate-900">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:grid lg:grid-cols-[1.1fr,0.9fr] lg:items-stretch lg:px-10">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saborly Admin</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">Command center for culinary operations</h1>
              <p className="mt-4 text-base text-slate-600">
                Monitor performance, update menus and resolve orders with a polished control room built for decisive teams.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-slate-700">
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

        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold">Secure Admin Sign-In</h2>
            <p className="mt-3 text-sm text-slate-500">
              Choose your store, then sign in. Organization admins use the same account for Barcelona or Sabadell.
            </p>
          </div>

          {message.text && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
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
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store location</label>

              {branchesLoading && !storeOptions.showDual ? (
                <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Loading locations…
                </p>
              ) : showBarcelonaSabadellCards ? (
                <>
                  <p className="text-sm font-medium text-slate-800">Choose Barcelona or Sabadell</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { br: barcelonaBranch, label: 'Barcelona' },
                      { br: sabadellBranch, label: 'Sabadell' },
                    ].map(({ br, label }) => {
                      const id = String(br._id);
                      const active = selectedBranchId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedBranchId(id)}
                          disabled={isLoading}
                          className={`flex flex-col items-start gap-2 rounded-lg border-2 px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60 ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2
                              className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`}
                              aria-hidden
                            />
                            <span className="text-base font-semibold tracking-tight">{label}</span>
                          </span>
                          <span
                            className={`text-xs leading-snug ${active ? 'text-slate-200' : 'text-slate-500'}`}
                          >
                            {formatBranchMenuLabel(br)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {otherBranches.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-medium text-slate-500">Other locations</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <select
                          value={
                            otherBranches.some((b) => String(b._id) === selectedBranchId)
                              ? selectedBranchId
                              : ''
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v) setSelectedBranchId(v);
                          }}
                          disabled={isLoading}
                          className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        >
                          <option value="">Select another location…</option>
                          {otherBranches.map((b) => (
                            <option key={b._id} value={String(b._id)}>
                              {formatBranchMenuLabel(b)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    disabled={isLoading || branchesLoading || branches.length === 0}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {branches.length === 0 && !branchesLoading ? (
                      <option value="">Use server default (env)</option>
                    ) : null}
                    {branches.map((b) => (
                      <option key={b._id} value={String(b._id)}>
                        {formatBranchMenuLabel(b)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-xs leading-relaxed text-slate-500">
                <span className="font-medium text-slate-700">Super-admin</span> and{' '}
                <span className="font-medium text-slate-700">platform admin</span> can use the same email and password
                for <span className="font-medium text-slate-700">either</span> location. Store staff must select their
                assigned branch.
              </p>
            </div>

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
                  className={`w-full rounded-lg border px-5 py-4 pl-12 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-900/60 ${
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
                  className={`w-full rounded-lg border px-5 py-4 pl-12 pr-14 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-900/60 ${
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
              disabled={
                isLoading ||
                !formData.email ||
                !formData.password ||
                ((storeOptions.showDual || branches.length > 0) && !selectedBranchId)
              }
              className="w-full rounded-lg bg-slate-900 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
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

  if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
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