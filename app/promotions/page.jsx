'use client';
import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Users,
  Search,
  UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getClientBranchId } from '@/lib/clientBranchId';
import AdminShell from '../component/AdminShell';
import { adminNavigation } from '../component/navigationConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.saborly.es/api/v1';

class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const branchId = getClientBranchId();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(branchId && { 'X-Branch-Id': branchId }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file, file.name);
    const branchId = getClientBranchId();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(branchId && { 'X-Branch-Id': branchId }),
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload image');
    }
    const data = await response.json();
    return data.imageUrl;
  }

  async getRecipientCount() {
    return this.request('/promotions/recipients/count');
  }

  async getRecipients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/promotions/recipients${queryString ? `?${queryString}` : ''}`);
  }

  async sendPromotion(data) {
    return this.request('/promotions/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const NotificationDialog = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200">
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            {type === 'success' ? (
              <Check className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 text-sm">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 text-white rounded-lg font-medium transition ${
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Send', loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-fuchsia-50">
            <Send className="w-6 h-6 text-fuchsia-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 text-sm">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProviderBadge = ({ provider }) => {
  const config = {
    google: { label: 'Google', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    apple: { label: 'Apple', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    email: { label: 'Email', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  };
  const { label, className } = config[provider] || config.email;
  return (
    <span className={`inline-flex flex-shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${className}`}>
      {label}
    </span>
  );
};

const PromotionsPage = () => {
  const router = useRouter();
  const [apiService] = useState(new ApiService());
  const [recipientCount, setRecipientCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const [form, setForm] = useState({
    subject: '',
    title: '',
    message: '',
    imageUrl: '',
    ctaText: '',
    ctaUrl: '',
  });

  // Audience: 'all' subscribed users, or a hand-picked 'selected' set
  const [audienceMode, setAudienceMode] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Map()); // id -> {firstName,lastName,email} for chip display

  const [recipients, setRecipients] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientPages, setRecipientPages] = useState(1);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  useEffect(() => {
    loadRecipientCount();
  }, []);

  useEffect(() => {
    if (audienceMode !== 'selected') return;
    loadRecipients({ page: 1, search: recipientSearch });
  }, [audienceMode]);

  useEffect(() => {
    if (audienceMode !== 'selected') return;
    const t = setTimeout(() => loadRecipients({ page: 1, search: recipientSearch }), 350);
    return () => clearTimeout(t);
  }, [recipientSearch]);

  const loadRecipientCount = async () => {
    setLoadingCount(true);
    try {
      const res = await apiService.getRecipientCount();
      setRecipientCount(res.count ?? 0);
    } catch (error) {
      setRecipientCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const loadRecipients = async ({ page = 1, search = '' } = {}) => {
    setLoadingRecipients(true);
    try {
      const res = await apiService.getRecipients({ page, limit: 50, search });
      setRecipients(res.users || []);
      setRecipientPage(res.page || 1);
      setRecipientPages(res.pages || 1);
    } catch (error) {
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const toggleUserSelected = (user) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(user._id)) {
        next.delete(user._id);
      } else {
        next.add(user._id);
      }
      return next;
    });
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (next.has(user._id)) {
        next.delete(user._id);
      } else {
        next.set(user._id, user);
      }
      return next;
    });
  };

  const selectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      recipients.forEach((u) => next.add(u._id));
      return next;
    });
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      recipients.forEach((u) => next.set(u._id, u));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedUsers(new Map());
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);
    try {
      const imageUrl = await apiService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      setNotification({ isOpen: true, title: 'Upload failed', message: error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const canSend =
    form.subject.trim() &&
    (form.title.trim() || form.message.trim() || form.imageUrl) &&
    (audienceMode === 'all' || selectedIds.size > 0);

  const targetCount = audienceMode === 'all' ? recipientCount ?? 0 : selectedIds.size;

  const handleSend = async () => {
    setSending(true);
    try {
      const payload = { ...form };
      if (audienceMode === 'selected') {
        payload.userIds = Array.from(selectedIds);
      }
      const res = await apiService.sendPromotion(payload);
      setShowConfirm(false);
      setNotification({
        isOpen: true,
        title: 'Promotion sent',
        message: res.message || `Sent to ${res.sent} of ${res.total} subscribed users.`,
        type: 'success',
      });
      setForm({ subject: '', title: '', message: '', imageUrl: '', ctaText: '', ctaUrl: '' });
      clearSelection();
    } catch (error) {
      setShowConfirm(false);
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleSidebarNavigate = (item) => {
    if (item.href) {
      router.push(item.href);
      return;
    }
  };

  const statusBadges = [
    {
      label: loadingCount ? 'Loading recipients…' : `${recipientCount ?? 0} subscribed users`,
      icon: <Users className="h-3 w-3 text-slate-500" />,
    },
  ];

  return (
    <>
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, title: '', message: '', type: 'success' })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => !sending && setShowConfirm(false)}
        onConfirm={handleSend}
        title="Send promotional email?"
        message={
          audienceMode === 'all'
            ? `This will email ${recipientCount ?? 'all'} subscribed users right now. This can't be undone.`
            : `This will email ${selectedIds.size} selected user${selectedIds.size === 1 ? '' : 's'} right now. This can't be undone.`
        }
        confirmText="Send now"
        loading={sending}
      />

      <AdminShell
        title="Saborly Admin"
        subtitle="Keep markets, menus and fulfilment aligned from a single, executive workspace."
        statusBadges={statusBadges}
        showSearch={false}
        sidebarItems={adminNavigation}
        activeSidebarItem="promotions"
        onSidebarNavigate={handleSidebarNavigate}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compose promotional email</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Every field except subject is optional. Recipients who have opted out of promotional emails are
                automatically excluded.
              </p>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Send to</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAudienceMode('all')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                    audienceMode === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All subscribed users ({loadingCount ? '…' : recipientCount ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode('selected')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                    audienceMode === 'selected'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Choose specific users
                </button>
              </div>

              {audienceMode === 'selected' && (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={selectAllOnPage}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition whitespace-nowrap"
                    >
                      Select all on page
                    </button>
                    {selectedIds.size > 0 && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition whitespace-nowrap"
                      >
                        Clear ({selectedIds.size})
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {loadingRecipients ? (
                      <div className="p-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
                      </div>
                    ) : recipients.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No subscribed users found.
                      </div>
                    ) : (
                      recipients.map((user) => {
                        const checked = selectedIds.has(user._id);
                        return (
                          <label
                            key={user._id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${
                              checked ? 'bg-slate-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleUserSelected(user)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                                <span className="truncate">{user.firstName} {user.lastName}</span>
                                <ProviderBadge provider={user.authProvider} />
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {recipientPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => loadRecipients({ page: recipientPage - 1, search: recipientSearch })}
                        disabled={recipientPage === 1}
                        className="text-xs font-medium text-slate-600 disabled:opacity-40 hover:text-slate-900"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-slate-500">
                        Page {recipientPage} of {recipientPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => loadRecipients({ page: recipientPage + 1, search: recipientSearch })}
                        disabled={recipientPage === recipientPages}
                        className="text-xs font-medium text-slate-600 disabled:opacity-40 hover:text-slate-900"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {selectedIds.size > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50">
                      <UserCheck className="w-3.5 h-3.5" />
                      {selectedIds.size} user{selectedIds.size === 1 ? '' : 's'} selected
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Subject *</label>
              <input
                type="text"
                maxLength={150}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. 20% off this weekend only"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
              <input
                type="text"
                maxLength={150}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Headline shown inside the email"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
              <textarea
                rows={5}
                maxLength={2000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write the email body..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="promo-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="promo-image-upload"
                  className={`inline-flex items-center px-4 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-600" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2 text-slate-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Upload image'}
                  </span>
                </label>
                {form.imageUrl && (
                  <div className="relative">
                    <img src={form.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Button text</label>
                <input
                  type="text"
                  maxLength={40}
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="e.g. Order now"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Button link</label>
                <input
                  type="url"
                  value={form.ctaUrl}
                  onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Every email includes an unsubscribe link automatically.
              </p>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!canSend}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition"
              >
                <Send className="w-4 h-4" />
                Send to {targetCount} user{targetCount === 1 ? '' : 's'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Preview
            </h3>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white text-center py-4 text-sm font-semibold">
                Saborly
              </div>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-slate-50 flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-400">Hi there,</p>
                {form.title ? (
                  <p className="font-semibold text-slate-900">{form.title}</p>
                ) : (
                  <p className="text-slate-300 text-sm italic">Title appears here</p>
                )}
                {form.message ? (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.message}</p>
                ) : (
                  <p className="text-slate-300 text-sm italic">Message appears here</p>
                )}
                {form.ctaText && (
                  <span className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md">
                    {form.ctaText}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 bg-slate-50 text-center text-[11px] text-slate-400 border-t border-slate-100">
                Unsubscribe from promotional emails
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </>
  );
};

export const dynamic = 'force-dynamic';

export default PromotionsPage;
