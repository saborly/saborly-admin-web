'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Percent,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Search,
  Upload,
  X,
  Star,
  DollarSign,
  TrendingUp,
  Grid3X3,
  Menu as MenuIcon,
  Bell,
  LogOut,
  Loader2,
  Save,
  Eye,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Layers,
} from 'lucide-react';
import { useRouter } from "next/navigation";



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soleybackend.vercel.app/api/v1';

// API Service Class
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

  async uploadToVercelBlob(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getCategories() {
    return this.request('/categories/all');
  }

  async getFoodItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/food-items/getallitems${queryString ? `?${queryString}` : ''}`);
  }

  async getOffers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/offer${queryString ? `?${queryString}` : ''}`);
  }

  async createOffer(data) {
    return this.request('/offer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOffer(id, data) {
    return this.request(`/offer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOffer(id) {
    return this.request(`/offer/${id}`, {
      method: 'DELETE',
    });
  }

  async applyOfferToItems(offerId, itemIds) {
    return this.request(`/offer/${offerId}/apply-to-items`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }
}

// Confirmation Dialog
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-0">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-50' : 'bg-amber-50'
          }`}>
            {type === 'danger' ? (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
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
              className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all shadow-lg ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Dialog
const NotificationDialog = ({ isOpen, onClose, title, message, type = "success" }) => {
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

// Image Upload Component
const ImageUpload = ({ value, onChange, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [apiService] = useState(new ApiService());

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      const imageUrl = await apiService.uploadToVercelBlob(file);
      onChange(imageUrl);
      setPreview(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className={`inline-flex items-center px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
          ) : (
            <Upload className="w-5 h-5 mr-3 text-blue-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : 'Upload Image'}
          </span>
        </label>
        
        <input
          type="url"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setPreview(e.target.value);
          }}
          placeholder="Or paste image URL"
          className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={uploading}
        />
      </div>

      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setPreview('');
              }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Offers = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [activeTab, setActiveTab] = useState('offers');
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [apiService] = useState(new ApiService());
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [notificationDialog, setNotificationDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOffers: 0,
  });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'offers') {
        await Promise.all([loadCategories(), loadFoodItems(), loadOffers()]);
      }
    } catch (error) {
      showNotificationDialog('Error', 'Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const response = await apiService.getCategories();
    setCategories(response.categories || []);
  };

  const loadFoodItems = async () => {
    const response = await apiService.getFoodItems();
    setFoodItems(response.items || []);
  };

  const loadOffers = async (params = {}) => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 20,
    };
    if (params.featured !== undefined && params.featured !== null) {
      queryParams.featured = params.featured;
    }
    if (params.type) {
      queryParams.type = params.type;
    }

    const response = await apiService.getOffers(queryParams);
    setOffers(response.offers || []);
    setPagination({
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      totalOffers: response.totalOffers,
    });
  };

  const showNotificationDialog = (title, message, type = 'success') => {
    setNotificationDialog({ isOpen: true, title, message, type });
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalType('');
  };

  const handleSaveOffer = async (data) => {
    setLoading(true);
    try {
      if (editingItem) {
        await apiService.updateOffer(editingItem._id, data);
        showNotificationDialog('Success!', 'Offer updated successfully');
      } else {
        await apiService.createOffer(data);
        showNotificationDialog('Success!', 'Offer created successfully');
      }
      closeModal();
      loadOffers();
    } catch (error) {
      showNotificationDialog('Error', 'Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    showConfirmDialog(
      'Confirm Deletion',
      'Are you sure you want to delete this offer? This action cannot be undone.',
      async () => {
        setLoading(true);
        try {
          await apiService.deleteOffer(id);
          showNotificationDialog('Success!', 'Offer deleted successfully');
          loadOffers();
        } catch (error) {
          showNotificationDialog('Error', 'Error: ' + error.message, 'error');
        } finally {
          setLoading(false);
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      }
    );
  };
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'categories', name: 'Categories', icon: Grid3X3, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'menu-items', name: 'Menu Items', icon: MenuIcon, gradient: 'from-orange-500 to-red-600' },
    { id: 'offers', name: 'Offers', icon: Percent, gradient: 'from-purple-500 to-pink-600' },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'banners', name: 'Banners', icon: ImageIcon, gradient: 'from-rose-500 to-pink-600' }, // New banner navigation item
    { id: 'settings', name: 'Settings', icon: Settings, gradient: 'from-gray-500 to-gray-700' },
  ];

  // Enhanced Offer Form with Combo Support
  const OfferForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      description: editingItem?.description || '',
      subtitle: editingItem?.subtitle || '',
      imageUrl: editingItem?.imageUrl || '',
      bannerColor: editingItem?.bannerColor || '#E91E63',
      type: editingItem?.type || 'percentage',
      value: editingItem?.value || 0,
      minOrderAmount: editingItem?.minOrderAmount || 0,
      maxDiscountAmount: editingItem?.maxDiscountAmount || 0,
      usageLimit: editingItem?.usageLimit || '',
      userUsageLimit: editingItem?.userUsageLimit || 1,
      appliedToCategories: editingItem?.appliedToCategories?.map(cat => cat._id) || [],
      appliedToItems: editingItem?.appliedToItems?.map(item => item._id) || [],
      comboItems: editingItem?.comboItems || [],
      comboPrice: editingItem?.comboPrice || 0,
      deliveryTypes: editingItem?.deliveryTypes || [],
      isActive: editingItem?.isActive !== false,
      isFeatured: editingItem?.isFeatured || false,
      startDate: editingItem?.startDate ? new Date(editingItem.startDate).toISOString().slice(0, 16) : '',
      endDate: editingItem?.endDate ? new Date(editingItem.endDate).toISOString().slice(0, 16) : '',
      priority: editingItem?.priority || 1,
      termsAndConditions: editingItem?.termsAndConditions?.join('\n') || '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        termsAndConditions: formData.termsAndConditions.split('\n').map(t => t.trim()).filter(t => t),
        value: formData.value ? parseFloat(formData.value) : undefined,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        comboPrice: formData.type === 'combo' ? parseFloat(formData.comboPrice) || 0 : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit) || 1,
        priority: parseInt(formData.priority) || 1,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };
      handleSaveOffer(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Title *</label>
              <input
                type="text"
                required
                maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter offer title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Subtitle</label>
              <input
                type="text"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter offer subtitle"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description *</label>
            <textarea
              rows="3"
              required
              maxLength={1000}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Offer description"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Image *</label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Banner Color</label>
            <input
              type="color"
              className="w-full h-12 border border-gray-300 rounded-xl"
              value={formData.bannerColor}
              onChange={(e) => setFormData({ ...formData, bannerColor: e.target.value })}
            />
          </div>
        </div>

        {/* Offer Details */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Offer Details
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Type *</label>
              <select
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, value: 0 })}
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed-amount">Fixed Amount Discount</option>
                <option value="buy-one-get-one">Buy One Get One</option>
                <option value="free-delivery">Free Delivery</option>
                <option value="combo">Combo Deal</option>
              </select>
            </div>
            {['percentage', 'fixed-amount'].includes(formData.type) && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Value *</label>
                <input
                  type="number"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.type === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 5 for $5 off'}
                />
              </div>
            )}
            {formData.type === 'combo' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Combo Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={formData.comboPrice}
                  onChange={(e) => setFormData({ ...formData, comboPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25.99"
                />
              </div>
            )}
          </div>

          {/* Combo Items Section */}
          {formData.type === 'combo' && (
            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-dashed border-purple-300">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Combo Items *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newComboItem = { foodItem: '', quantity: 1 };
                    setFormData({ ...formData, comboItems: [...formData.comboItems, newComboItem] });
                  }}
                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              {formData.comboItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Add items to create a combo deal
                </p>
              )}
              <div className="space-y-3">
                {formData.comboItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <select
                      required
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={item.foodItem}
                      onChange={(e) => {
                        const newComboItems = [...formData.comboItems];
                        newComboItems[index] = { ...item, foodItem: e.target.value };
                        setFormData({ ...formData, comboItems: newComboItems });
                      }}
                    >
                      <option value="">Select item</option>
                      {foodItems.map((foodItem) => (
                        <option key={foodItem._id} value={foodItem._id}>
                          {foodItem.name} - ${foodItem.price}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={item.quantity}
                      onChange={(e) => {
                        const newComboItems = [...formData.comboItems];
                        newComboItems[index] = { ...item, quantity: parseInt(e.target.value) || 1 };
                        setFormData({ ...formData, comboItems: newComboItems });
                      }}
                      placeholder="Qty"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newComboItems = formData.comboItems.filter((_, i) => i !== index);
                        setFormData({ ...formData, comboItems: newComboItems });
                      }}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Min Order Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Start Date *</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">End Date *</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Applicability - Only show for non-combo offers */}
        {formData.type !== 'combo' && (
                      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Apply To
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Categories</label>
                <select
                  multiple
                  size="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.appliedToCategories}
                  onChange={(e) => setFormData({
                    ...formData,
                    appliedToCategories: Array.from(e.target.selectedOptions, option => option.value),
                  })}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="py-2">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Items</label>
                <select
                  multiple
                  size="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.appliedToItems}
                  onChange={(e) => setFormData({
                    ...formData,
                    appliedToItems: Array.from(e.target.selectedOptions, option => option.value),
                  })}
                >
                  {foodItems.map((item) => (
                    <option key={item._id} value={item._id} className="py-2">
                      {item.name} - ${item.price}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
          </div>
        )}

        {/* Status & Settings */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Status & Settings
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-400 transition-all">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-gray-800">Active</span>
            </label>
            <label className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-yellow-400 transition-all">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-sm font-semibold text-gray-800">Featured</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{editingItem ? 'Update' : 'Create'} Offer</span>
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Modal Component
  const Modal = ({ children, title, size = 'max-w-5xl' }) => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
        <div className={`bg-white rounded-3xl ${size} w-full max-h-[90vh] overflow-hidden shadow-2xl my-8`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 sticky top-0 z-10">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <button 
              onClick={closeModal} 
              className="p-2 hover:bg-white/60 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Offer Filters
  const OfferFilters = () => {
    const [filters, setFilters] = useState({
      featured: null,
      type: '',
      page: 1,
      limit: 20,
    });

    const handleFilterChange = (key, value) => {
      const newFilters = { ...filters, [key]: value, page: 1 };
      setFilters(newFilters);

      const queryParams = { page: newFilters.page, limit: newFilters.limit };
      if (newFilters.featured !== null) queryParams.featured = newFilters.featured;
      if (newFilters.type) queryParams.type = newFilters.type;

      loadOffers(queryParams);
    };

    return (
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">Filters:</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={filters.featured === null ? '' : filters.featured}
          onChange={(e) => handleFilterChange('featured', e.target.value === '' ? null : e.target.value === 'true')}
        >
          <option value="">All Offers</option>
          <option value="true">Featured Only</option>
          <option value="false">Non-Featured</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed-amount">Fixed Amount</option>
          <option value="buy-one-get-one">BOGO</option>
          <option value="free-delivery">Free Delivery</option>
          <option value="combo">Combo Deal</option>
        </select>
         <button
            onClick={() => openModal('offer')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-semibold shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Offer</span>
          </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all text-sm font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page === pagination.totalPages}
            className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Offers Grid
  const OffersGrid = () => {
    const getOfferTypeIcon = (type) => {
      switch(type) {
        case 'percentage': return <Percent className="w-4 h-4" />;
        case 'fixed-amount': return <DollarSign className="w-4 h-4" />;
        case 'combo': return <Layers className="w-4 h-4" />;
        case 'buy-one-get-one': return <Tag className="w-4 h-4" />;
        default: return <Package className="w-4 h-4" />;
      }
    };

    const getOfferTypeBadge = (type) => {
      const badges = {
        percentage: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        'fixed-amount': 'bg-blue-100 text-blue-700 border-blue-300',
        combo: 'bg-purple-100 text-purple-700 border-purple-300',
        'buy-one-get-one': 'bg-pink-100 text-pink-700 border-pink-300',
        'free-delivery': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      };
      return badges[type] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {offer.isFeatured && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOfferTypeBadge(offer.type)} shadow-lg flex items-center gap-1`}>
                  {getOfferTypeIcon(offer.type)}
                  {offer.type.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                  {offer.title}
                </h3>
                {offer.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-1">{offer.subtitle}</p>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{offer.description}</p>

              <div className="space-y-2 mb-4">
                {offer.type === 'combo' && offer.comboPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Combo Price:</span>
                    <span className="font-bold text-purple-600">${offer.comboPrice}</span>
                  </div>
                )}
                {['percentage', 'fixed-amount'].includes(offer.type) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-bold text-emerald-600">{offer.discountDisplay}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Expires:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(offer.endDate).toLocaleDateString()}
                  </span>
                </div>
                {offer.appliedToItems?.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Applied to:</span>
                    <span className="font-semibold text-gray-900">
                      {offer.appliedToItems.length} items
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('offer', offer)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      <NotificationDialog
        isOpen={notificationDialog.isOpen}
        onClose={() => setNotificationDialog({ isOpen: false, title: '', message: '', type: 'success' })}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />

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
               <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                 <Bell className="w-6 h-6" />
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                   <span className="text-xs text-white font-bold">3</span>
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
               <button className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200">
                 <LogOut className="w-6 h-6" />
               </button>
             </div>

           </div>
         
         </header>
   
         <div className="flex">
           <nav className="w-80 bg-white shadow-xl h-[calc(100vh-97px)] sticky top-[97px] border-r border-gray-100 backdrop-blur-md bg-opacity-90">
             <div className="p-8">
               <div className="space-y-3">
                 {navigationItems.map((item) => (
           <button
             key={item.id}
             onClick={() => {
               if (item.id != "offers") {
                 router.push("/"); // Navigate to /offers page
               } else {
                 setActiveTab(item.id);
               }
             }}
             className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 font-semibold ${
               activeTab === item.id
                 ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]`
                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-[1.01]"
             }`}
           >
             <div
               className={`p-2 rounded-xl ${
                 activeTab === item.id ? "bg-gray-900 bg-opacity-20" : "bg-gray-100"
               }`}
             >
               <item.icon className="w-5 h-5" />
             </div>
             <span>{item.name}</span>
           </button>
         ))}
       
               </div>
               <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
                 <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Today's Orders</span>
                     <span className="font-bold text-blue-600">24</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Revenue</span>
                     <span className="font-bold text-emerald-600">$1,240</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Active Items</span>
                     <span className="font-bold text-purple-600">{foodItems.length}</span>
                   </div>
                 </div>
               </div>
             </div>
           </nav>
                 {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
        {loading && offers.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading offers...</p>
            </div>
          </div>
        ) : (
          <>
            <OfferFilters />
            {offers.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Percent className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Offers Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start creating amazing offers to boost your sales and attract more customers.
                  </p>
                  <button
                    onClick={() => openModal('offer')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-semibold shadow-lg mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Offer
                  </button>
                </div>
              </div>
            ) : (
              <OffersGrid />
            )}
          </>
        )}
      </main>
         </div>
    

      {/* Modal */}
      {showModal && modalType === 'offer' && (
        <Modal title={`${editingItem ? 'Edit' : 'Create'} Offer`} size="max-w-4xl">
          <OfferForm />
        </Modal>
      )}
    </div>
  );
};

export default Offers;