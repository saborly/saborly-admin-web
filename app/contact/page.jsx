'use client';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Percent,
  Settings,
  MessageSquare,
  Search,
  X,
  Menu as MenuIcon,
  Bell,
  LogOut,
  Loader2,
  Eye,
  Check,
  AlertTriangle,
  ChevronDown,
  Filter,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  FileText,
  Send,
  Archive,
  Trash2,
  RefreshCw,
  Grid3X3,
  Image as ImageIcon,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soleybackend.vercel.app/api/v1';

// API Service
class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/contact${queryString ? `?${queryString}` : ''}`);
  }

  async getContactById(id) {
    return this.request(`/contact/${id}`);
  }

  async updateContactStatus(id, status, notes) {
    return this.request(`/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async replyToContact(id, replyMessage) {
    return this.request(`/contact/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage }),
    });
  }

  async deleteContact(id) {
    return this.request(`/contact/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactStats() {
    return this.request('/contact/stats');
  }
}

// Notification Dialog
const NotificationDialog = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            {type === 'success' ? (
              <Check className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 text-white rounded-xl font-medium transition-all shadow-lg ${
              type === 'success' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Dialog
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-50">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all shadow-lg"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminContactPage = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  const [apiService] = useState(new ApiService());
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [notificationDialog, setNotificationDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'success' 
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadContacts(), loadStats()]);
  };

  const loadContacts = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...(params.status && { status: params.status }),
        ...(params.search && { search: params.search }),
      };

      const response = await apiService.getContacts(queryParams);
      setContacts(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      showNotification('Error', 'Failed to load contacts: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getContactStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const showNotification = (title, message, type = 'success') => {
    setNotificationDialog({ isOpen: true, title, message, type });
  };

  const handleViewContact = async (contact) => {
    setLoading(true);
    try {
      const response = await apiService.getContactById(contact._id);
      setSelectedContact(response.data);
      setStatusNotes(response.data.notes || '');
      setShowDetailModal(true);
      loadContacts();
    } catch (error) {
      showNotification('Error', 'Failed to load contact details: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedContact) return;
    
    setLoading(true);
    try {
      await apiService.updateContactStatus(selectedContact._id, status, statusNotes);
      showNotification('Success', 'Status updated successfully');
      setShowDetailModal(false);
      setSelectedContact(null);
      loadData();
    } catch (error) {
      showNotification('Error', 'Failed to update status: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    setLoading(true);
    try {
      await apiService.replyToContact(selectedContact._id, replyMessage);
      showNotification('Success', 'Reply sent successfully');
      setShowReplyModal(false);
      setShowDetailModal(false);
      setReplyMessage('');
      setSelectedContact(null);
      loadData();
    } catch (error) {
      showNotification('Error', 'Failed to send reply: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (contact) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact message? This action cannot be undone.',
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiService.deleteContact(contact._id);
          showNotification('Success', 'Contact deleted successfully');
          loadData();
        } catch (error) {
          showNotification('Error', 'Failed to delete contact: ' + error.message, 'error');
        } finally {
          setLoading(false);
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      }
    });
  };

  const handleSearch = () => {
    loadContacts({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    loadContacts({ status: status || undefined, page: 1 });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      read: 'bg-blue-100 text-blue-700 border-blue-300',
      replied: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      archived: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'categories', name: 'Categories', icon: Grid3X3, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'menu-items', name: 'Menu Items', icon: MenuIcon, gradient: 'from-orange-500 to-red-600' },
    { id: 'offers', name: 'Offers', icon: Percent, gradient: 'from-purple-500 to-pink-600' },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'contact', name: 'Contact Us', icon: MessageSquare, gradient: 'from-rose-500 to-pink-600' },
    { id: 'banners', name: 'Banners', icon: ImageIcon, gradient: 'from-indigo-500 to-purple-600' },
    { id: 'settings', name: 'Settings', icon: Settings, gradient: 'from-gray-500 to-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <NotificationDialog
        isOpen={notificationDialog.isOpen}
        onClose={() => setNotificationDialog({ isOpen: false, title: '', message: '', type: 'success' })}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
      />

      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Admin</h1>
              <p className="text-sm text-gray-600 font-medium">Manage your restaurant efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all">
              <Bell className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{stats.pending || 0}</span>
              </div>
            </button>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">AD</span>
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">Admin User</span>
                <p className="text-xs text-gray-500">Restaurant Owner</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <button className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-80 bg-white shadow-xl h-[calc(100vh-97px)] sticky top-[97px] border-r border-gray-100">
          <div className="p-8">
            <div className="space-y-3">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id !== 'contact') {
                      router.push('/');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 font-semibold ${
                    activeTab === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Stats Panel */}
            <div className="mt-10 p-6 bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl border border-rose-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Contact Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-bold text-gray-900">{stats.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">{stats.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Replied</span>
                  <span className="font-bold text-emerald-600">{stats.replied || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-bold text-blue-600">{stats.recent || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          {/* Filters */}
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium transition-all"
                >
                  Search
                </button>
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contacts List */}
          {loading && contacts.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-rose-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading contacts...</p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Messages Yet</h3>
                <p className="text-gray-600">
                  Contact messages from customers will appear here.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(contact.status)}`}>
                            {contact.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(contact.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <p className="font-semibold text-gray-800 mb-2">{contact.subject}</p>
                        <p className="text-gray-600 line-clamp-2">{contact.message}</p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-sm font-semibold flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                <span className="text-sm text-gray-600">
                  Showing {contacts.length} of {pagination.total} contacts
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadContacts({ page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all text-sm font-medium"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => loadContacts({ page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
         {showDetailModal && selectedContact && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50">
        <h3 className="text-2xl font-bold text-gray-900">Contact Details</h3>
        <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/60 rounded-xl transition-all">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-gray-900">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900">{selectedContact.email}</p>
              </div>
              {selectedContact.phone && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedContact.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(selectedContact.status)}`}>
                  {selectedContact.status.toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Submitted</label>
                <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-2">Subject</h4>
            <p className="text-gray-900 mb-4">{selectedContact.subject}</p>
            <h4 className="font-bold text-gray-900 mb-2">Message</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
          </div>

          {/* Reply Section */}
          {selectedContact.replied && selectedContact.replyMessage && (
            <div className="bg-emerald-50 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                Reply Sent
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.replyMessage}</p>
              <p className="text-sm text-gray-500 mt-2">
                Sent on {new Date(selectedContact.repliedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Update Status</h4>
            <div className="flex flex-wrap gap-3 mb-4">
              {['pending', 'read', 'replied', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={loading || selectedContact.status === status}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedContact.status === status
                      ? `${getStatusBadge(status)} opacity-50 cursor-not-allowed`
                      : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              placeholder="Add any notes about this contact..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setShowReplyModal(true);
              }}
              disabled={loading || selectedContact.status === 'replied'}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
              Reply
            </button>
            <button
              onClick={() => handleDelete(selectedContact)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
            <button
              onClick={() => setShowDetailModal(false)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
 {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <h3 className="text-2xl font-bold text-gray-900">Reply to {selectedContact.name}</h3>
              <button 
                onClick={() => {
                  setShowReplyModal(false);
                  setShowDetailModal(true);
                  setReplyMessage('');
                }} 
                className="p-2 hover:bg-white/60 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">Original Subject:</p>
                <p className="text-gray-900">{selectedContact.subject}</p>
              </div>

              <label className="block text-sm font-semibold text-gray-800 mb-2">Your Reply *</label>
              <textarea
                rows="8"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                placeholder="Type your reply message here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setShowDetailModal(true);
                    setReplyMessage('');
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={loading || !replyMessage.trim()}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};
 

export default AdminContactPage