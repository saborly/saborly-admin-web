'use client';

import React, { useEffect, useState } from 'react';
import { getClientBranchId, clearAdminAuthStorage } from '@/lib/clientBranchId';
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
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [logout, setLogout] = useState(() => propLogout || (() => {
    if (typeof window !== 'undefined') {
      clearAdminAuthStorage();
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

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    setActiveBranchId(localStorage.getItem('branchId'));
    const u = user;
    const superUser = u?.role === 'super_admin' || u?.role === 'superadmin';
    if (!superUser) return;
    const token = localStorage.getItem('authToken');
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://api.saborly.es/api/v1';
    const bid = getClientBranchId();
    fetch(`${api}/branches`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(bid && { 'X-Branch-Id': bid }),
      },
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.branches)) setBranches(d.branches);
      })
      .catch(() => {});
  }, [mounted, user?.role]);
  
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
        <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
          <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-200">
            <div>
              {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <div className="p-3">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = item.id === activeSidebarItem;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSidebarNavigate?.(item)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="border-b border-slate-200 bg-white p-4 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {showSearch && (
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchValue}
                      onChange={handleSearchChange}
                      placeholder="Search menus, orders or customers"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}
                <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                {languageOptions.length > 0 && (
                  <select
                    value={languageValue}
                    onChange={(e) => onLanguageChange?.(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                )}
                {(user?.role === 'super_admin' || user?.role === 'superadmin') &&
                  branches.length > 0 && (
                    <select
                      value={activeBranchId || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        localStorage.setItem('branchId', v);
                        setActiveBranchId(v);
                        window.location.reload();
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none max-w-[220px]"
                      title="Branch"
                    >
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  )}
              </div>
              <div className="flex items-center gap-2">
                {statusBadges.map((badge) => (
                  <span key={badge.label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {badge.icon}
                    {badge.label}
                  </span>
                ))}
                <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrator' : user?.role || 'User'}</p>
                  </div>
                </div>
                <button className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100">
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            {headerChildren && <div className="mt-4 space-y-4">{headerChildren}</div>}
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;


