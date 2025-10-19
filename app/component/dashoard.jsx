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
  MessageSquare,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Euro,
  PhoneCallIcon,
  LocationEdit,
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation'; // For Next.js, or use equivalent for your framework

// Add these imports to your RestaurantAdminDashboard component
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import NotificationBell from './notification';
// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soleybackend.vercel.app/api/v1';

// API Service Class
class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    this.language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
  }

  setLanguage(lang) {
    this.language = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        'Accept-Language': this.language, // Add language header
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

  // Auth methods
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Vercel Blob Upload
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

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Categories API
  async createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id, data) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/categories${query ? `?${query}` : ''}`);
  }
  async getBanners(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/banners/getall${queryString ? `?${queryString}` : ''}`);
  }

  async getBanner(id) {
    return this.request(`/banners/${id}`);
  }

  async createBanner(data) {
    return this.request('/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(id, data) {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBanner(id) {
    return this.request(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleBannerStatus(id) {
    return this.request(`/banners/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderBanners(bannerOrders) {
    return this.request('/banners/reorder', {
      method: 'POST',
      body: JSON.stringify({ bannerOrders }),
    });
  }

  async deleteCategory(id) {
    console.log('Deleting category with IDssss:', id);
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
  // Offers API
  // Offers API
  async getOffers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/offer${queryString ? `?${queryString}` : ''}`);
  }

  async getItemsWithOffers() {
    return this.request('/offer/items-with-offers');
  }
  getLocalized(lang) {
    return {
      ...this,
      name: this.name && typeof this.name === 'object' ? this.name[lang] || this.name.en || 'Unnamed' : 'Unnamed',
      description: this.description && typeof this.description === 'object' ? this.description[lang] || this.description.en || 'No description' : 'No description',
    };
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

  async removeOfferFromItems(offerId, itemIds) {
    return this.request(`/offer/${offerId}/remove-from-items`, {
      method: 'DELETE',
      body: JSON.stringify({ itemIds }),
    });
  }

  // Food Items API
  async getFoodItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/food-items/getallitems${queryString ? `?${queryString}` : ''}`);
  }

  async getFoodItem(id) {
    return this.request(`/food-items/${id}`);
  }

  async createFoodItem(data) {
    return this.request('/food-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFoodItem(id, data) {
    return this.request(`/food-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFoodItem(id) {
    console.log("checking", id)
    return this.request(`/food-items/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStock(id, quantity, operation) {
    return this.request(`/food-items/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation }),
    });
  }


  // Orders API
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/getall${queryString ? `?${queryString}` : ''}`);
  }

  async updateOrderStatus(id, status, message) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message }),
    });
  }

  async getOrderStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/stats${queryString ? `?${queryString}` : ''}`);
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Enhanced Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all border-0 overflow-hidden">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50' : 'bg-amber-50'
            }`}>
            {type === 'danger' ? (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 hover:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg ${type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
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

// Enhanced Success/Error Dialog Component
const NotificationDialog = ({ isOpen, onClose, title, message, type = "success" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all border-0 overflow-hidden">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
            {type === 'success' ? (
              <Check className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg ${type === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              : 'bg-red-600 hover:bg-red-700 shadow-red-200'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Image Upload Component
const ImageUpload = ({ value, onChange, className = "", multiple = false, id }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(multiple ? (value || []) : (value || ''));
  const [apiService] = useState(new ApiService());

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      console.log(`No files selected for input ID: ${id}`);
      return;
    }

    if (files.some(file => !file.type.startsWith('image/'))) {
      console.error(`Invalid file type for input ID: ${id}`);
      return;
    }
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      console.error(`File too large for input ID: ${id}`);
      return;
    }

    setUploading(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`Preview updated for input ID: ${id}, URL: ${e.target.result}`);
        setPreview(multiple ? [...(Array.isArray(preview) ? preview : []), e.target.result] : e.target.result);
      };
      reader.readAsDataURL(file);

      const imageUrl = await apiService.uploadToVercelBlob(file);
      console.log(`Image uploaded for input ID: ${id}, URL: ${imageUrl}`);
      onChange(multiple ? [...(Array.isArray(value) ? value : []), imageUrl] : imageUrl);
    } catch (error) {
      console.error(`Upload failed for input ID: ${id}:`, error);
      setPreview(value || (multiple ? [] : ''));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexOrUrl) => {
    console.log(`Removing image for input ID: ${id}, index/URL: ${indexOrUrl}`);
    if (multiple) {
      const newImages = Array.isArray(value) ? value.filter((_, i) => i !== indexOrUrl) : [];
      onChange(newImages);
      setPreview(newImages);
    } else {
      onChange('');
      setPreview('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            id={id} // Use unique ID
            disabled={uploading}
          />
          <label
            htmlFor={id}
            className={`inline-flex items-center px-6 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all duration-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
            ) : (
              <Upload className="w-5 h-5 mr-3 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : `Upload Image${multiple ? 's' : ''}`}
            </span>
          </label>
        </div>
        {!multiple && (
          <div className="flex-1">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => {
                console.log(`URL input changed for ID: ${id}, new value: ${e.target.value}`);
                onChange(e.target.value);
                setPreview(e.target.value);
              }}
              placeholder="Or paste image URL"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={uploading}
            />
          </div>
        )}
      </div>
      {preview && (
        <div className="space-y-3">
          {multiple ? (
            <div className="grid grid-cols-3 gap-3">
              {(Array.isArray(preview) ? preview : []).map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-gray-100 group-hover:border-gray-200 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-100"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => removeImage()}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) return null; // Optionally hide for single page

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

// Dynamic Form Array Component
const FormArrayField = ({ items, onChange, fieldConfig, title }) => {
  const addItem = () => {
    const newItem = fieldConfig.defaultItem();
    console.log(`Adding new ${title.slice(0, -1)}:`, newItem);
    onChange([...items, newItem]);
  };

  const updateItem = (index, updatedItem) => {
    console.log(`Updating ${title.slice(0, -1)} at index ${index}:`, updatedItem);
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  const removeItem = (index) => {
    console.log(`Removing ${title.slice(0, -1)} at index ${index}`);
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-800">{title}</label>
        <button
          type="button"
          onClick={addItem}
          className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-all duration-200 border border-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add {title.slice(0, -1)}</span>
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfig.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={
                      field.key.includes('.')
                        ? item[field.key.split('.')[0]]?.[field.key.split('.')[1]] || ''
                        : item[field.key] || ''
                    }
                    onChange={(e) => {
                      if (field.key.includes('.')) {
                        const [parentKey, childKey] = field.key.split('.');
                        updateItem(index, {
                          ...item,
                          [parentKey]: {
                            ...item[parentKey],
                            [childKey]: e.target.value,
                          },
                        });
                      } else {
                        updateItem(index, { ...item, [field.key]: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={field.placeholder}
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item[field.key] || 0}
                    onChange={(e) => updateItem(index, { ...item, [field.key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={field.placeholder}
                  />
                )}
                {field.type === 'image' && (
                  <ImageUpload
                    value={item[field.key] || ''}
                    onChange={(url) => updateItem(index, { ...item, [field.key]: url })}
                    id={`addon-image-upload-${index}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-sm">No {title.toLowerCase()} added yet.</p>
          <p className="text-xs text-gray-400">Click "Add {title.slice(0, -1)}" to get started.</p>
        </div>
      )}
    </div>
  );
};

const RestaurantAdminDashboard = () => {
  const [modalType, setModalType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [apiService] = useState(new ApiService());
  const [selectedLanguage, setSelectedLanguage] = useState(apiService.language);

  const [banners, setBanners] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [notificationDialog, setNotificationDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [dashboardStats, setDashboardStats] = useState({
    revenue: { current: 0, growth: 0, period: 'month' },
    orders: { current: 0, growth: 0, period: 'week' },
    customers: { current: 0, growth: 0, period: 'month' },
    menuItems: { current: 0, growth: 0, period: 'month' },
    activeOffers: { current: 0, growth: 0, period: 'month' },
  });
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const searchParams = useSearchParams()
  const {
    fcmToken,
    notification,
    permissionStatus,
    initializeNotifications,
    requestPermission,
    clearNotification,
    deleteFCMToken
  } = useAdminNotifications(apiService);


  const [settings, setSettings] = useState({
    restaurantName: 'Delicious Bites Restaurant',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Food Street, Delicious City, DC 12345',
    operatingHours: 'Monday - Friday: 11:00 AM - 10:00 PM\nSaturday - Sunday: 10:00 AM - 11:00 PM',
    paymentGateway: 'stripe',
    apiKey: '',
    secretKey: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOffers: 0,
  });
  const [orderPagination, setOrderPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });
  useEffect(() => {
    if (activeTab === 'menu-items') {
      Promise.all([loadCategories(), loadFoodItems()]).then(() => loadOffers());
    }
  }, [activeTab]);
  const loadOfferStats = async () => {
    try {
      const response = await apiService.getOffers();
      setDashboardStats((prev) => ({
        ...prev,
        activeOffers: { current: response.totalOffers || 0, growth: 10, period: 'month' },
      }));
    } catch (error) {
      console.error('Error loading offer stats:', error);
    }
  };

  useEffect(() => {
    loadOfferStats();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          await loadDashboardData();
          break;
        case 'categories':
          await loadCategories();
          break;
        case 'menu-items':
          await loadFoodItems();
          break;
        case 'offers':
          await loadOffers();
          break;
        case 'banners':
          await loadBanners();
          break;
        case 'orders':
          await loadOrders();
          break;
        case 'settings':
          await loadSettings();
          break;
      }
    } catch (error) {
      showNotificationDialog('Error', 'Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse, categoriesResponse, itemsResponse, offersResponse] = await Promise.all([
        apiService.getOrderStats().catch(() => ({ stats: null })),
        apiService.getOrders({ limit: 5 }).catch(() => ({ orders: [] })),
        apiService.getCategories().catch(() => ({ categories: [] })),
        apiService.getFoodItems({ limit: 5 }).catch(() => ({ items: [] })),
        apiService.getOffers({ limit: 5 }).catch(() => ({ offers: [] })),
      ]);


      setDashboardStats({
        revenue: { current: statsResponse.stats?.totalRevenue || 45250.75, growth: 15.3, period: 'month' },
        orders: { current: statsResponse.stats?.totalOrders || 2847, growth: 12.8, period: 'week' },
        customers: { current: statsResponse.stats?.uniqueCustomers || 1456, growth: 8.7, period: 'month' },
        menuItems: { current: itemsResponse.count || 68, growth: 5.2, period: 'month' },
        activeOffers: { current: offersResponse.totalOffers || 0, growth: 10, period: 'month' },
      });
      console.log("statsResponse", statsResponse)
      setOrders(ordersResponse.orders || []);
      setOffers(offersResponse.offers || []);
    } catch (error) {
      console.error('Dashboard data error:', error);
    }
  };
  const getLocalized = (category, lang) => ({
    ...category,
    name: category.name
      ? typeof category.name === 'object'
        ? category.name[lang] || category.name.en || 'Unnamed'
        : category.name
      : 'Unnamed',
    description: category.description
      ? typeof category.description === 'object'
        ? category.description[lang] || category.description.en || 'No description'
        : category.description
      : 'No description',
  });

 const loadCategories = async () => {
    try {
        const response = await apiService.getCategories();
        console.log('Raw categories response:', response);

        // Store raw categories with _multilingual data
        const categories = Array.isArray(response.categories) ? response.categories : [];
        setCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotificationDialog('Error', 'Error loading categories: ' + error.message, 'error');
    }
};
  const getLocalizedFoodItem = (item, lang) => ({
    ...item,
    name:
      typeof item.name === 'object' && item.name
        ? item.name[lang] || item.name.en || Object.values(item.name)[0] || 'Unnamed'
        : item.name || 'Unnamed',
    description:
      typeof item.description === 'object' && item.description
        ? item.description[lang] || item.description.en || Object.values(item.description)[0] || 'No description'
        : item.description || 'No description',
    category: item.category
      ? {
        ...item.category,
        name:
          typeof item.category.name === 'object' && item.category.name
            ? item.category.name[lang] || item.category.name.en || Object.values(item.category.name)[0] || 'No category'
            : item.category.name || 'No category',
      }
      : null,
  });
const loadFoodItems = async (params = {}) => {
    setLoading(true);
    try {
        const queryParams = {
            page: params.page || foodItemsPagination.currentPage,
            limit: params.limit || 10,
            search: params.search || searchTerm,
            includeInactive: true,
            lang: apiService.language,
        };
        const response = await apiService.getFoodItems(queryParams);
        console.log('Raw Food Items Response:', response);

        // Transform food items to ensure name is a localized string
        const localizedItems = Array.isArray(response.items)
            ? response.items.map(item => ({
                ...item,
                name: item._multilingual?.name?.[apiService.language] || 
                      item._multilingual?.name?.en || 
                      Object.values(item._multilingual?.name || {})[0] || 
                      item.name || 
                      'Unnamed',
                description: item._multilingual?.description?.[apiService.language] || 
                             item._multilingual?.description?.en || 
                             Object.values(item._multilingual?.description || {})[0] || 
                             item.description || 
                             'No description',
                // Preserve the category data as well
                category: item.category ? {
                    ...item.category,
                    name: item.category._multilingual?.name?.[apiService.language] || 
                          item.category._multilingual?.name?.en || 
                          item.category.name || 
                          'No category'
                } : null,
            }))
            : [];
        setFoodItems(localizedItems);
        setFoodItemsPagination({
            currentPage: response.currentPage || 1,
            totalPages: response.totalPages || Math.ceil(response.totalItems / (queryParams.limit || 10)),
            totalItems: response.totalItems || response.count,
        });
    } catch (error) {
        console.error('Error loading food items:', error);
        showNotificationDialog('Error', 'Error loading menu items: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
};
const getSafeName = (name, language) => {
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object') {
        return name[language] || name.en || Object.values(name)[0] || 'Unnamed';
    }
    return 'Unnamed';
};
  const loadOffers = async (params = {}) => {
    setLoading(true);
    try {
      // Ensure only valid parameters are sent
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
    } catch (error) {
      showNotificationDialog('Error', 'Error loading offers: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const loadBanners = async (params = {}) => {
    const response = await apiService.getBanners(params);
    setBanners(response.data || []);
  };
  const loadOrders = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      const response = await apiService.getOrders(queryParams);
      setOrders(response.orders || []);
      setOrderPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalOrders: response.totalOrders,
      });
    } catch (error) {
      showNotificationDialog('Error', 'Error loading orders: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await apiService.getSettings();
      setSettings({ ...settings, ...response.settings });
    } catch (error) {
      console.log('Settings endpoint not available, using defaults');
    }
  };

  const showNotificationDialog = (title, message, type = 'success') => {
    setNotificationDialog({ isOpen: true, title, message, type });
  };

  const showConfirmDialog = (title, message, onConfirm, confirmText = "Delete") => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, confirmText });
  };

  // Utility functions
  const formatCurrency = useCallback((amount, currency = 'EUR') => {
    if (isNaN(amount)) return '€0.00'; // handle invalid input gracefully
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'out-for-delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  // Modal management
  const openModal = useCallback((type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setModalType('');
  }, []);

  // CRUD operations
  const handleSave = async (data, type) => {
    setLoading(true);
    try {
      if (editingItem) {
        switch (type) {
          case 'category':
            await apiService.updateCategory(editingItem._id, data);
            break;
          case 'menu-item':
            await apiService.updateFoodItem(editingItem._id, data);
            break;
          case 'offer':
            await apiService.updateOffer(editingItem._id, data);
            break;
          case 'settings':
            await apiService.updateSettings(data);
            break;
        }
        showNotificationDialog('Success!', `${type} updated successfully`);
      } else {
        switch (type) {
          case 'category':
            await apiService.createCategory(data);
            break;
          case 'menu-item':
            await apiService.createFoodItem(data);
            break;
          case 'offer':
            await apiService.createOffer(data);
            break;
        }
        showNotificationDialog('Success!', `${type} created successfully`);
      }
      closeModal();
      loadData();
    } catch (error) {
      showNotificationDialog('Error', 'Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    console.log('Deleting', type, 'with IDs:', id);
    showConfirmDialog(
      'Confirm Deletion',
      `Are you sure you want to delete this ${type}? This action cannot be undone.`,
      async () => {
        setLoading(true);
        try {
          switch (type) {
            case 'categorie': // Fixed typo from 'categorie'
              await apiService.deleteCategory(id);
              break;
              break;
            case 'menu item':
              await apiService.deleteFoodItem(id);
              break;
            case 'food-item':
              await apiService.deleteFoodItem(id);
              break;
            case 'offer':
              await apiService.deleteOffer(id);
              break;
            case 'banner':
              await apiService.deleteBanner(id);
              break;
          }
          showNotificationDialog('Success!', `${type} deleted successfully`);
          loadData();
        } catch (error) {
          showNotificationDialog('Error', 'Error: ' + error.message, 'error');
        } finally {
          setLoading(false);
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      }
    );
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus}`);
      showNotificationDialog('Success!', 'Order status updated successfully');
      loadOrders();
    } catch (error) {
      showNotificationDialog('Error', 'Error updating order status: ' + error.message, 'error');
    }
  };
  const router = useRouter();

  // Navigation items
  const [foodItemsPagination, setFoodItemsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
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
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'NOTIFICATION_CLICK') {
        const { type, orderId } = event.data.data;
        if (type === 'new_order' && orderId) {
          setActiveTab('orders');
          router.push(`/admin?tab=orders&orderId=${orderId}`); // Optional: sync URL
          setTimeout(() => {
            const order = orders.find(o => o._id === orderId);
            if (order) {
              openModal('order-details', order);
            } else {
              showNotificationDialog('Error', 'Order not found', 'error');
              loadOrders();
            }
          }, 500);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [orders, router]);

  // Enhanced Dashboard Stats Component
  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
      {[
        {
          title: 'Total Revenue',
          value: formatCurrency(dashboardStats.revenue.current),
          growth: `+${dashboardStats.revenue.growth}%`,
          icon: Euro,
          gradient: 'from-emerald-500 to-emerald-600',
          bgGradient: 'from-emerald-50 to-emerald-100',
          iconBg: 'bg-emerald-500',
        },
        {
          title: 'Total Orders',
          value: dashboardStats.orders.current.toLocaleString(),
          growth: `+${dashboardStats.orders.growth}%`,
          icon: ShoppingBag,
          gradient: 'from-blue-500 to-blue-600',
          bgGradient: 'from-blue-50 to-blue-100',
          iconBg: 'bg-blue-500',
        },
        {
          title: 'Active Customers',
          value: dashboardStats.customers.current.toLocaleString(),
          growth: `+${dashboardStats.customers.growth}%`,
          icon: Users,
          gradient: 'from-purple-500 to-purple-600',
          bgGradient: 'from-purple-50 to-purple-100',
          iconBg: 'bg-purple-500',
        },
        {
          title: 'Menu Items',
          value: dashboardStats.menuItems.current,
          growth: `${categories.length} categories`,
          icon: Package,
          gradient: 'from-orange-500 to-orange-600',
          bgGradient: 'from-orange-50 to-orange-100',
          iconBg: 'bg-orange-500',
        },
        {
          title: 'Active Offers',
          value: dashboardStats.activeOffers.current,
          growth: `+${dashboardStats.activeOffers.growth}%`,
          icon: Percent,
          gradient: 'from-purple-500 to-pink-600',
          bgGradient: 'from-purple-50 to-pink-100',
          iconBg: 'bg-purple-500',
        },
      ].map((stat, index) => (
        <div
          key={index}
          className={`relative p-8 rounded-3xl shadow-lg border-0 bg-gradient-to-br ${stat.bgGradient} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
        >

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-3 leading-none">{stat.value}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-70 rounded-full">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">{stat.growth}</span>
                </div>
              </div>
            </div>
            <div className={`${stat.iconBg} p-4 rounded-2xl shadow-lg`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Enhanced Modal Component
  const Modal = ({ children, title, size = 'max-w-7xl' }) => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className={`bg-white rounded-3xl ${size} w-full max-h-[90vh] overflow-hidden shadow-2xl border-0`}>
          <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={closeModal}
              className="p-3 hover:bg-white hover:bg-opacity-60 rounded-2xl transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Food Item Form
// Enhanced Food Item Form
const FoodItemForm = ({ onClose }) => {
  const [apiService] = useState(new ApiService());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const router = useRouter();

  const showNotificationDialog = (title, message, type) => {
    setNotificationDialog({ isOpen: true, title, message, type });
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'ca', label: 'Catalan' },
    { code: 'ar', label: 'Arabic' },
  ];

  const [formData, setFormData] = useState({
    name: editingItem?._multilingual?.name || {
      en: editingItem?.name || '',
      es: '',
      ca: '',
      ar: '',
    },
    description: editingItem?._multilingual?.description || {
      en: editingItem?.description || '',
      es: '',
      ca: '',
      ar: '',
    },
    price: editingItem?.price || 0,
    originalPrice: editingItem?.originalPrice || 0,
    imageUrl: editingItem?.imageUrl || '',
    images: editingItem?.images || [],
    category: editingItem?.category?._id || '',
    isVeg: editingItem?.isVeg || false,
    isVegan: editingItem?.isVegan || false,
    isGlutenFree: editingItem?.isGlutenFree || false,
    isNutFree: editingItem?.isNutFree || false,
    spiceLevel: editingItem?.spiceLevel || 'none',
    isFeatured: editingItem?.isFeatured || false,
    isPopular: editingItem?.isPopular || false,
    isActive: editingItem?.isActive !== false,
    isAvailable: editingItem?.isAvailable !== false,
    preparationTime: editingItem?.preparationTime || 15,
    stockQuantity: editingItem?.stockQuantity || 0,
    lowStockAlert: editingItem?.lowStockAlert || 10,
    sku: editingItem?.sku || `SKU-${Date.now()}`,
    barcode: editingItem?.barcode || `BC-${Date.now()}`,
    servingSize: editingItem?.servingSize || '',
    weight: editingItem?.weight || 0,
    tags: editingItem?.tags?.map(tag => tag.en).join(', ') || '',
    availableFrom: editingItem?.availableFrom ? new Date(editingItem.availableFrom).toISOString().slice(0, 16) : '',
    availableUntil: editingItem?.availableUntil ? new Date(editingItem.availableUntil).toISOString().slice(0, 16) : '',
    mealSizes: editingItem?.mealSizes?.map(size => ({
      ...size,
      name: size._multilingual?.name || {
        en: size.name || '',
        es: '',
        ca: '',
        ar: '',
      },
      additionalPrice: size.additionalPrice || 0,
    })) || [],
    extras: editingItem?.extras?.map(extra => ({
      ...extra,
      name: extra._multilingual?.name || {
        en: extra.name || '',
        es: '',
        ca: '',
        ar: '',
      },
      price: extra.price || 0,
    })) || [],
    addons: editingItem?.addons?.map(addon => ({
      ...addon,
      name: addon._multilingual?.name || {
        en: addon.name || '',
        es: '',
        ca: '',
        ar: '',
      },
      price: addon.price || 0,
      imageUrl: addon.imageUrl || '',
    })) || [],
    ingredients: editingItem?.ingredients?.map(ingredient => ({
      ...ingredient,
      name: ingredient._multilingual?.name || {
        en: ingredient.name || '',
        es: '',
        ca: '',
        ar: '',
      },
    })) || [],
    allergens: editingItem?.allergens || [],
    nutrition: editingItem?.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    seoData: {
      metaTitle: editingItem?.seoData?._multilingual?.metaTitle || {
        en: editingItem?.seoData?.metaTitle || '',
        es: '',
        ca: '',
        ar: '',
      },
      metaDescription: editingItem?.seoData?._multilingual?.metaDescription || {
        en: editingItem?.seoData?.metaDescription || '',
        es: '',
        ca: '',
        ar: '',
      },
      keywords: editingItem?.seoData?.keywords?.map(keyword => keyword.en).join(', ') || '',
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        showNotificationDialog('Error', 'Failed to load categories.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [apiService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name.en || !formData.description.en || !formData.category) {
        showNotificationDialog('Error', 'English name, description, and category are required.', 'error');
        return;
      }

      const payload = {
        ...formData,
        name: formData.name.en, // Fallback for non-multilingual APIs
        description: formData.description.en, // Fallback for non-multilingual APIs
        _multilingual: {
          name: formData.name,
          description: formData.description,
        },
        seoData: {
          ...formData.seoData,
          metaTitle: formData.seoData.metaTitle.en, // Fallback
          metaDescription: formData.seoData.metaDescription.en, // Fallback
          _multilingual: {
            metaTitle: formData.seoData.metaTitle,
            metaDescription: formData.seoData.metaDescription,
          },
          keywords: formData.seoData.keywords ? formData.seoData.keywords.split(',').map(k => ({ en: k.trim() })) : [],
        },
        mealSizes: formData.mealSizes.map(size => ({
          ...size,
          name: size.name.en, // Fallback
          _multilingual: { name: size.name },
        })),
        extras: formData.extras.map(extra => ({
          ...extra,
          name: extra.name.en, // Fallback
          _multilingual: { name: extra.name },
        })),
        addons: formData.addons.map(addon => ({
          ...addon,
          name: addon.name.en, // Fallback
          _multilingual: { name: addon.name },
        })),
        ingredients: formData.ingredients.map(ingredient => ({
          ...ingredient,
          name: ingredient.name.en, // Fallback
          _multilingual: { name: ingredient.name },
        })),
        tags: formData.tags ? formData.tags.split(',').map(tag => ({ en: tag.trim() })) : [],
      };

      if (editingItem) {
        await apiService.updateFoodItem(editingItem._id, payload);
        showNotificationDialog('Success', 'Item updated successfully!', 'success');
      } else {
        await apiService.createFoodItem(payload);
        showNotificationDialog('Success', 'Item created successfully!', 'success');
      }
      router.push('/items');
      onClose();
    } catch (error) {
      showNotificationDialog('Error', 'Failed to save item. Please try again.', 'error');
    }
  };

  const mealSizesConfig = {
    defaultItem: () => ({
      name: { en: '', es: '', ca: '', ar: '' },
      additionalPrice: 0,
    }),
    fields: [
      ...languages.map(lang => ({
        key: `name.${lang.code}`,
        label: `Meal Size Name (${lang.label})`,
        type: 'text',
        placeholder: `e.g., Small, Medium, Large in ${lang.label}`,
      })),
      { key: 'additionalPrice', label: 'Additional Price', type: 'number', placeholder: 'e.g., 9.9' },
    ],
  };

  const extrasConfig = {
    defaultItem: () => ({
      name: { en: '', es: '', ca: '', ar: '' },
      price: 0,
    }),
    fields: [
      ...languages.map(lang => ({
        key: `name.${lang.code}`,
        label: `Extra Name (${lang.label})`,
        type: 'text',
        placeholder: `e.g., Extra Cheese, Extra Sauce in ${lang.label}`,
      })),
      { key: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2.5' },
    ],
  };

  const ingredientsConfig = {
    defaultItem: () => ({
      name: { en: '', es: '', ca: '', ar: '' },
    }),
    fields: [
      ...languages.map(lang => ({
        key: `name.${lang.code}`,
        label: `Ingredient Name (${lang.label})`,
        type: 'text',
        placeholder: `e.g., Tomato, Cheese in ${lang.label}`,
      })),
    ],
  };

  const addonsConfig = {
    defaultItem: () => ({
      name: { en: '', es: '', ca: '', ar: '' },
      price: 0,
      imageUrl: '',
    }),
    fields: [
      ...languages.map(lang => ({
        key: `name.${lang.code}`,
        label: `Addon Name (${lang.label})`,
        type: 'text',
        placeholder: `e.g., Coca-Cola, French Fries in ${lang.label}`,
      })),
      { key: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 3.0' },
      { key: 'imageUrl', label: 'Image', type: 'image' },
    ],
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Item Name ({lang.label}) {lang.code === 'en' && '*'}
              </label>
              <input
                type="text"
                required={lang.code === 'en'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.name[lang.code] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: { ...formData.name, [lang.code]: e.target.value },
                  })
                }
                placeholder={`Enter item name in ${lang.label}`}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Category *</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat._multilingual?.name?.[apiService.language] || cat.name || 'Unnamed'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Description ({lang.label}) {lang.code === 'en' && '*'}
              </label>
              <textarea
                rows="4"
                required={lang.code === 'en'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                value={formData.description[lang.code] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...formData.description, [lang.code]: e.target.value },
                  })
                }
                placeholder={`Item description in ${lang.label}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Images
        </h4>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          id="primary-image-upload"
        />
      </div>

      {/* SEO Data */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          SEO Data
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Meta Title ({lang.label}) {lang.code === 'en' && '*'}
              </label>
              <input
                type="text"
                required={lang.code === 'en'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.seoData.metaTitle[lang.code] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seoData: {
                      ...formData.seoData,
                      metaTitle: {
                        ...formData.seoData.metaTitle,
                        [lang.code]: e.target.value,
                      },
                    },
                  })
                }
                placeholder={`Enter meta title in ${lang.label}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Meta Description ({lang.label}) {lang.code === 'en' && '*'}
              </label>
              <textarea
                rows="4"
                required={lang.code === 'en'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                value={formData.seoData.metaDescription[lang.code] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seoData: {
                      ...formData.seoData,
                      metaDescription: {
                        ...formData.seoData.metaDescription,
                        [lang.code]: e.target.value,
                      },
                    },
                  })
                }
                placeholder={`Enter meta description in ${lang.label}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Keywords</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            value={formData.seoData.keywords || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                seoData: {
                  ...formData.seoData,
                  keywords: e.target.value,
                },
              })
            }
            placeholder="Enter keywords (comma-separated)"
          />
        </div>
      </div>

      {/* Array Fields */}
      <FormArrayField
        items={formData.mealSizes}
        onChange={(mealSizes) => setFormData({ ...formData, mealSizes })}
        fieldConfig={mealSizesConfig}
        title="Meal Sizes"
      />
      <FormArrayField
        items={formData.extras}
        onChange={(extras) => setFormData({ ...formData, extras })}
        fieldConfig={extrasConfig}
        title="Extras"
      />
      <FormArrayField
        items={formData.ingredients}
        onChange={(ingredients) => setFormData({ ...formData, ingredients })}
        fieldConfig={ingredientsConfig}
        title="Ingredients"
      />
      <FormArrayField
        items={formData.addons}
        onChange={(addons) => setFormData({ ...formData, addons })}
        fieldConfig={addonsConfig}
        title="Addons"
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Save
        </button>
      </div>

      <NotificationDialog
        isOpen={notificationDialog.isOpen}
        onClose={() => setNotificationDialog({ isOpen: false, title: '', message: '', type: 'success' })}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
    </form>
  );
};

  // Enhanced Category Form Component
const CategoryForm = () => {
    const [formData, setFormData] = useState({
        name: editingItem?._multilingual?.name || { en: '', es: '', ca: '', ar: '' },
        description: editingItem?._multilingual?.description || { en: '', es: '', ca: '', ar: '' },
        imageUrl: editingItem?.imageUrl || '',
        icon: editingItem?.icon || '',
        isActive: editingItem?.isActive !== false,
        sortOrder: editingItem?.sortOrder || 0,
    });

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Spanish' },
        { code: 'ca', label: 'Catalan' },
        { code: 'ar', label: 'Arabic' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave(formData, 'category');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Category Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {languages.map(lang => (
                        <div key={lang.code}>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Category Name ({lang.label}) {lang.code === 'en' && '*'}
                            </label>
                            <input
                                type="text"
                                required={lang.code === 'en'}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                value={formData.name[lang.code] || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: { ...formData.name, [lang.code]: e.target.value },
                                    })
                                }
                                placeholder={`Enter category name in ${lang.label}`}
                            />
                        </div>
                    ))}
                    {languages.map(lang => (
                        <div key={lang.code}>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Description ({lang.label}) {lang.code === 'en' && '*'}
                            </label>
                            <textarea
                                rows="4"
                                required={lang.code === 'en'}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                                value={formData.description[lang.code] || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: { ...formData.description, [lang.code]: e.target.value },
                                    })
                                }
                                placeholder={`Category description in ${lang.label}`}
                            />
                        </div>
                    ))}
                </div>
                    <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Category Image *</label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => {
              console.log(`Updating category imageUrl: ${url}`);
              setFormData({ ...formData, imageUrl: url });
            }}
            id="category-image-upload"
          />
        </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">Icon</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="e.g., 🍔"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">Sort Order</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                            value={formData.sortOrder}
                            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Status</label>
                    <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                        value={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-3 font-semibold transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <Save className="w-5 h-5" />
                    <span>{editingItem ? 'Update' : 'Create'} Category</span>
                </button>
            </div>
        </form>
    );
};
  const BannerForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      description: editingItem?.description || '',
      imageUrl: editingItem?.imageUrl || '',
      category: editingItem?.category || '',
      isActive: editingItem?.isActive !== false,
      order: editingItem?.order || 0,
      link: editingItem?.link || '',
      startDate: editingItem?.startDate ? new Date(editingItem.startDate).toISOString().slice(0, 16) : '',
      endDate: editingItem?.endDate ? new Date(editingItem.endDate).toISOString().slice(0, 16) : '',
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const submitData = {
          ...formData,
          order: parseInt(formData.order) || 0,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? formData.endDate ? new Date(formData.endDate).toISOString() : null : null,
        };

        if (editingItem) {
          await apiService.updateBanner(editingItem._id, submitData);
          showNotificationDialog('Success!', 'Banner updated successfully');
        } else {
          await apiService.createBanner(submitData);
          showNotificationDialog('Success!', 'Banner created successfully');
        }
        closeModal();
        loadData();
      } catch (error) {
        showNotificationDialog('Error', 'Error: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Details */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-200">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            Banner Details
          </h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Banner Title *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Description</label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none bg-white"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Banner description"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Banner Image *</label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Category</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {['promotional', 'seasonal', 'featured', 'general'].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Link URL</label>
              <input
                type="url"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Status */}
        <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-2xl border border-pink-200">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            Schedule & Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Start Date</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">End Date</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Display Order</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-800">
                  Active Banner
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-8 mt-1">Make this banner visible to customers</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-8 py-4 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 font-semibold transition-all duration-200 hover:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3 font-semibold transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-rose-200"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{editingItem ? 'Update' : 'Create'} Banner</span>
          </button>
        </div>
      </form>
    );
  };
  const OrderDetails = ({ order }) => {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Order #{order.orderNumber || order._id?.slice(-6)}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Customer</label>
              <p className="text-gray-900">{order.userId?.fullName || order.customerName || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Delivery Type</label>
              <p className="text-gray-900">{order.deliveryType}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
              {order.deliveryType === 'delivery' ? (
                <p className="font-semibold text-gray-900">{order.deliveryAddress.address},<br />{order.deliveryAddress.apartment}</p>
              ) : (
                <p className="text-gray-900">Pickup</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Total</label>
              <p className="text-gray-900">{formatCurrency(order.total)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <p
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}
              >
                {order.status}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Order Items</label>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof item.foodItem?.name === 'object' && item.foodItem?.name
                          ? item.foodItem.name[apiService.language] || item.foodItem.name.en || Object.values(item.foodItem.name)[0] || 'Unknown Item'
                          : item.foodItem?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500">Special Instruction: {item.specialInstructions}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Created At</label>
              <p className="text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="px-8 py-4 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 font-semibold transition-all duration-200 hover:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  const SettingsForm = () => {
    const [formData, setFormData] = useState(settings);

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSave(formData, 'settings');
      setSettings(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Restaurant Info */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Restaurant Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Restaurant Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Contact Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Address</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Operating Hours</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
            />
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-200">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Payment Gateway Settings
          </h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Payment Gateway</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                value={formData.paymentGateway}
                onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">API Key</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-mono"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Secret Key</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-mono"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                  placeholder="*****"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-3 font-semibold transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    );
  };

  // Enhanced Data Grid Component
  const DataGrid = ({ data, title, columns, onEdit, onDelete, actions, onAdd, pagination, onPageChange }) => {
    return (
      <div className="space-y-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your {title.toLowerCase()}</p>
          </div>
          {onAdd && (
            <button
              onClick={() => onAdd()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-3 transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Add {title.slice(0, -1)}</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th key={col.header} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {col.header}
                  </th>
                ))}
                {actions.length > 0 && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id} className="border-t border-gray-200">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {actions && actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          className={`p-2 rounded-xl hover:bg-${action.color}-50 transition-all duration-200 text-${action.color}-600 hover:text-${action.color}-900 hover:scale-110`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item._id || item.id, title.toLowerCase().slice(0, -1))}
                          className="p-2 rounded-xl text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>
            <span className="text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= (pagination.totalPages || 1)}
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const DataGrids = ({ data, columns, onEdit, onDelete, onAdd, title, actions }) => (
    <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your {title.toLowerCase()}</p>
          </div>
          {onAdd && (
            <button
              onClick={() => onAdd()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-3 transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Add {title.slice(0, -1)}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.filter(item => {
              if (!searchTerm) return true;
              const searchableFields = ['name', 'title', 'orderNumber', 'email'];
              return searchableFields.some(field =>
                item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }).map((item, index) => (
              <tr key={item._id || item.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-all duration-200">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-8 py-6 text-sm text-gray-900">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {actions && actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(item)}
                        className={`p-2 rounded-xl hover:bg-${action.color}-50 transition-all duration-200 text-${action.color}-600 hover:text-${action.color}-900 hover:scale-110`}
                        title={action.label}
                      >
                        <action.icon className="w-4 h-4" />
                      </button>
                    ))}
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item._id || item.id, title.toLowerCase().slice(0, -1))}
                        className="p-2 rounded-xl text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {data.length} of {pagination.totalOffers} offers
            </p>
            <div className="flex items-center gap-4">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => loadOffers({ page: pagination.currentPage - 1 })}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-900">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => loadOffers({ page: pagination.currentPage + 1 })}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {data.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {title.toLowerCase()} found</h3>
            <p className="text-sm text-gray-500">Get started by creating your first {title.toLowerCase().slice(0, -1)}.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-10">
            <DashboardStats />

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl shadow-lg border-0 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{order.orderNumber || `Order #${order._id?.slice(-6)}`}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4" />
                          {order.userId?.fullName || order.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</p>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Manage Categories',
                  description: 'Add or edit menu categories',
                  icon: Grid3X3,
                  gradient: 'from-emerald-500 to-teal-600',
                  action: () => setActiveTab('categories')
                },
                {
                  title: 'View Orders',
                  description: 'Manage customer orders',
                  icon: ShoppingBag,
                  gradient: 'from-blue-500 to-cyan-600',
                  action: () => setActiveTab('orders')
                },
                {
                  title: 'Manage Banners',
                  description: 'Control promotional banners',
                  icon: ImageIcon,
                  gradient: 'from-rose-500 to-pink-600',
                  action: () => setActiveTab('banners')
                },

              ].map((action, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${action.gradient} p-8 rounded-3xl text-white cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group`}
                  onClick={action.action}
                >
                  <div className="relative">
                    <action.icon className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-bold mb-3">{action.title}</h3>
                    <p className="text-white text-opacity-90 text-sm leading-relaxed">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <button
                onClick={() => openModal('category')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm">No categories found.</p>
              </div>
            ) : (
              <DataGrids
                data={categories}
                title="Categories"
                onEdit={(item) => openModal('category', item)}
                onDelete={handleDelete}
                onAdd={() => openModal('category')}
                columns={[
                  {
                    header: 'Image',
                    key: 'imageUrl',
                    render: (item) => (
                      <img
                        src={item.imageUrl}
                        alt={item.name || 'Unnamed'}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ),
                  },
                  {
                    header: 'Name',
                    key: 'name',
                    render: (item) => (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.description || 'No description'}
                        </p>
                      </div>
                    ),
                  },
                  {
                    header: 'Icon',
                    key: 'icon',
                    render: (item) => <span className="text-2xl">{item.icon}</span>,
                  },
                  {
                    header: 'Status',
                    key: 'isActive',
                    render: (item) => (
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    ),
                  },
                  {
                    header: 'Sort Order',
                    key: 'sortOrder',
                    render: (item) => item.sortOrder,
                  },
                ]}
              />
            )}
          </div>
        );
      case 'menu-items':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
              <button
                onClick={() => openModal('menu-item')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading menu items...</p>
              </div>
            ) : foodItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm">No menu items found.</p>
              </div>
            ) : (
              <DataGrid
                data={foodItems}
                title="Menu Items"
                onEdit={(item) => openModal('menu-item', item)}
                onDelete={(item) => handleDelete(item._id, 'food-item')}
                pagination={foodItemsPagination}
                onPageChange={(page) => loadFoodItems({ page })}
                columns={[
                  {
                    header: 'Image',
                    key: 'imageUrl',
                    render: (item) => (
                      <img
                        src={item.imageUrl}
                        alt={item.name || 'Unnamed'}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ),
                  },
        {
    header: 'Name',
    key: 'name',
    render: (item) => (
        <div>
            <p className="font-semibold text-gray-900">
                {getSafeName(item._multilingual?.name || item.name, apiService.language)}
            </p>
            <p className="text-xs text-gray-500">
                {getSafeName(item.category?._multilingual?.name || item.category?.name, apiService.language)}
            </p>
        </div>
    ),
},
                  {
                    header: 'Price',
                    key: 'price',
                    render: (item) => formatCurrency(item.price),
                  },
                  {
                    header: 'Stock',
                    key: 'stockQuantity',
                    render: (item) => (
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${item.stockQuantity > item.lowStockAlert
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                      >
                        {item.stockQuantity || 0}
                      </span>
                    ),
                  },
                  {
                    header: 'Status',
                    key: 'status',
                    render: (item) => (
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-1">
                          {item.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                          {item.isPopular && (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  },
                ]}
                actions={[
                 
                ]}
              />
            )}
          </div>
        );

      case 'orders':
        return (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm">No orders found.</p>
              </div>
            ) : (
              <DataGrid
                data={orders}
                title="Orders"
                onEdit={(item) => openModal('order-details', item)}
                onDelete={() => { }}
                pagination={orderPagination}
                onPageChange={(page) => loadOrders({ page })}
                columns={[
                  {
                    header: 'Order #',
                    key: 'orderNumber',
                    render: (item) => (
                      <div>
                        <p className="font-bold text-gray-900">{item.orderNumber || `#${item._id?.slice(-6)}`}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    header: 'Customer',
                    key: 'userId',
                    render: (item) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.userId?.fullName || item.customerName || 'Unknown'}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Address',
                    key: 'userId',
                    render: (item) => (
                      item.deliveryType === 'delivery' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <LocationEdit className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.deliveryAddress.address},<br />{item.deliveryAddress.apartment}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <LocationEdit className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.deliveryType}</p>
                          </div>
                        </div>
                      )
                    ),
                  },
                  {
                    header: 'Phone',
                    key: 'userId',
                    render: (item) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <PhoneCallIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          {item.userId?.phone || item.customerName ? (
                            <a
                              href={`tel:${item.userId?.phone || ''}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {item.userId?.phone || item.customerName}
                            </a>
                          ) : (
                            <p className="font-semibold text-gray-900">Unknown</p>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Items',
                    key: 'items',
                    render: (item) => (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 font-medium">
                          {item.items?.slice(0, 2).map((orderItem) => (
                            typeof orderItem.foodItem?.name === 'object' && orderItem.foodItem?.name
                              ? orderItem.foodItem.name[apiService.language] || orderItem.foodItem.name.en || Object.values(orderItem.foodItem.name)[0] || 'Unknown Item'
                              : orderItem.foodItem?.name || 'Unknown Item'
                          )).join(', ')}
                          {item.items?.length > 2 && <span className="text-gray-500"> +{item.items.length - 2} more</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{item.items?.length || 0} items total</p>
                        {item.items?.some(orderItem => orderItem.specialInstructions) && (
                          <p className="text-xs text-gray-500">
                            Special Instruction: {item.items.slice(0, 2).map((orderItem) => orderItem.specialInstructions || 'None').join(', ')}
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: 'Total',
                    key: 'total',
                    render: (item) => (
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(item.total)}
                        </p>
                        {item.deliveryType === 'delivery' && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            Delivery fee included ({formatCurrency(item.deliveryFee)})
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: 'Status',
                    key: 'status',
                    render: (item) => (
                      <select
                        className={`text-xs font-semibold rounded-xl px-3 py-2 border-0 cursor-pointer transition-all hover:shadow-md ${getStatusColor(item.status)}`}
                        value={item.status}
                        onChange={(e) => handleOrderStatusUpdate(item._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out-for-delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ),
                  },
                ]}
                actions={[
                  {
                    icon: Eye,
                    label: 'View Details',
                    color: 'blue',
                    onClick: (item) => openModal('order-details', item),
                  },
                ]}
              />
            )}
          </div>
        );

      case 'settings':
        return (
          <SettingsForm />

        );

      default:
        return <div>Content not found</div>;
    }
  };

  // Get modal content based on type
  const getModalContent = () => {
    const modalConfigs = {
      category: { title: `${editingItem ? 'Edit' : 'Add'} Category`, component: <CategoryForm />, size: 'max-w-4xl' },
      'menu-item': { title: `${editingItem ? 'Edit' : 'Add'} Menu Item`, component: <FoodItemForm />, size: 'max-w-6xl' },
      banner: { title: `${editingItem ? 'Edit' : 'Add'} Banner Item`, component: <BannerForm />, size: 'max-w-6xl' },
      'order-details': { title: 'Order Details', component: <OrderDetails order={editingItem} />, size: 'max-w-5xl' },

    };
    const config = modalConfigs[modalType];
    return config ? { title: config.title, component: config.component, size: config.size } : null;
  };

  const modalContent = getModalContent();


  useEffect(() => {
    const initNotifications = async () => {
      try {
        await initializeNotifications();
        console.log('Notifications initialized for admin');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();

    // Cleanup on unmount
    return () => {
      deleteFCMToken();
    };
  }, []);

  // Handle incoming notifications
  useEffect(() => {
    if (notification) {
      console.log('New notification received:', notification);

      // Handle different notification types
      if (notification.data?.type === 'new_order') {
        // Reload orders if on orders tab
        if (activeTab === 'orders') {
          loadOrders();
        }

        // Update dashboard stats
        loadDashboardData();

        // Show toast notification (you can add a toast library)
        showNotificationDialog(
          'New Order!',
          `Order ${notification.data.orderNumber} has been placed`,
          'success'
        );
      }
    }
  }, [notification, activeTab]);

  // Handle notification clickconst {
  const handleNotificationClick = (notif) => {
    if (notif.data?.type === 'new_order' && notif.data?.orderId) {
      // Navigate to orders tab
      setActiveTab('orders');

      // Optionally, open the order details modal
      setTimeout(() => {
        const order = orders.find(o => o._id === notif.data.orderId);
        if (order) {
          openModal('order-details', order);
        }
      }, 500);
    }

    clearNotification();
  };

  // Notification permission banner
  const NotificationPermissionBanner = () => {
    if (permissionStatus === 'granted' || permissionStatus === 'denied') {
      return null;
    }

    return (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 mb-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <p className="font-semibold">Enable Notifications</p>
              <p className="text-sm text-blue-100">
                Get instant alerts for new orders and updates
              </p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    );
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    apiService.setLanguage(lang);
    loadData(); // Reload all data
    loadCategories(); // Explicitly reload categories
    loadFoodItems(); // Explicitly reload food items
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ca', label: 'Català' },
    { code: 'ar', label: 'العربية' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
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
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <NotificationBell
              notification={notification}
              onClear={clearNotification}
              onNotificationClick={handleNotificationClick}
              fcmToken={fcmToken}
              permissionStatus={permissionStatus}
              requestPermission={requestPermission}
            />
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
                    if (item.id === "offers") {
                      router.push("/offer");
                    } else if (item.id === "contact") {
                      router.push("/contact");
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 font-semibold ${activeTab === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-[1.01]"
                    }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === item.id ? "bg-gray-900 bg-opacity-20" : "bg-gray-100"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
        <main className="flex-1 p-8 overflow-auto">
          <NotificationPermissionBanner />
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading your data...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {modalContent && (
        <Modal title={modalContent.title} size={modalContent.size}>
          {modalContent.component}
        </Modal>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
      />
      <NotificationDialog
        isOpen={notificationDialog.isOpen}
        onClose={() => setNotificationDialog({ isOpen: false, title: '', message: '', type: 'success' })}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
    </div>
  );
};


export default RestaurantAdminDashboard;