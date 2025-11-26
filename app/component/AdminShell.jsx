'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Filter, LogOut, Search, ChevronDown } from 'lucide-react';

const AdminShell = ({
  title = '',
  subtitle = '',
  statusBadges = [],
  showSearch = true,
  searchValue = '',
  onSearchChange,
  languageValue,
  languageOptions = [],
  onLanguageChange,
  sidebarItems = [],
  activeSidebarItem,
  onSidebarNavigate,
  headerChildren,
  children,
  user: propUser = null,
  logout: propLogout = null,
}) => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(propUser);
  const [logout, setLogout] = useState(() => propLogout || (() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }));

  useEffect(() => {
    setMounted(true);
    
    // Load user from localStorage if not provided as prop
    if (!propUser && typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        // Ignore
      }
    }

    // Use provided logout function or default
    if (propLogout) {
      setLogout(() => propLogout);
    }
  }, [propUser, propLogout]);
  
  const handleSearchChange = (e) => {
    onSearchChange?.(e.target.value);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Admin User';
  };

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="glass-panel w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-5 border-b border-slate-100">
            <div className="mb-4">
              {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
            </div>
            <div className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>Navigation</span>
            </div>
          </div>
          <div className="p-5 pt-0">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.id === activeSidebarItem;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSidebarNavigate?.(item)}
                    className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm font-semibold transition ${
                      isActive ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-xl p-2 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition ${isActive ? 'rotate-[-90deg] text-white' : 'rotate-[-90deg] text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="glass-panel border-b border-slate-200 p-4 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {showSearch && (
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                    <input
                      value={searchValue}
                      onChange={handleSearchChange}
                      placeholder="Search menus, orders or customers"
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                )}
                <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                {languageOptions.length > 0 && (
                  <select
                    value={languageValue}
                    onChange={(e) => onLanguageChange?.(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                {statusBadges.map((badge) => (
                  <span key={badge.label} className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {badge.icon}
                    {badge.label}
                  </span>
                ))}
                <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrator' : user?.role || 'User'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <button className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-900 hover:text-white">
                  <Bell className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:bg-red-500 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            {headerChildren && <div className="mt-4 space-y-4">{headerChildren}</div>}
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1400px] mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;


