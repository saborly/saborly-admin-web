'use client';
import React, { useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
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
  Smartphone,
  Monitor,
  Globe,
  Award,
  Shield,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminShell from '../component/AdminShell';
import { adminNavigation } from '../component/navigationConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soleybackend.vercel.app/api/v1';

// Device ID Generator - Creates a unique device identifier
const getDeviceId = ()=> {
  if (typeof window === 'undefined') {
    return 'server-temp-device'; // fallback on server
  }

  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      localStorage.setItem('deviceId', deviceId);
    } catch (e) {
      console.warn('Failed to save deviceId to localStorage', e);
    }
  }
  return deviceId;
};

// API Service Class
class ApiService {
  constructor() {
   if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
      this.deviceId = getDeviceId(); // now safe
    }
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

  async getOffers(params = {}) {
    // Add deviceId to params for filtering claimed offers
    const queryParams = { ...params, deviceId: this.deviceId };
    const queryString = new URLSearchParams(queryParams).toString();
    return this.request(`/offer${queryString ? `?${queryString}` : ''}`);
  }

  async canClaimOffer(offerId) {
    const queryString = new URLSearchParams({ deviceId: this.deviceId }).toString();
    return this.request(`/offer/${offerId}/can-claim?${queryString}`);
  }

  async claimOffer(offerId) {
    return this.request(`/offer/${offerId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ deviceId: this.deviceId }),
    });
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

  async getCategories() {
    return this.request('/categories/all');
  }

  

  async getFoodItems(params = {}) {
    // For admin, fetch all items by setting a high limit
    const adminParams = { ...params, limit: 1000, page: 1 };
    const queryString = new URLSearchParams(adminParams).toString();
    return this.request(`/food-items/getallitems${queryString ? `?${queryString}` : ''}`);
  }
}

// Confirmation Dialog Component
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

// Notification Dialog Component
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

// Wrapper component that provides auth to AdminShell
// This wrapper is client-side only and loads auth from localStorage
const OffersWithAuth = () => {
  const [user, setUser] = useState(null);
  const [logout] = useState(() => () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  });

  useEffect(() => {
    // Load from localStorage on client side only
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return <Offers user={user} logout={logout} />;
};

const Offers = ({ user: propUser, logout: propLogout }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [apiService] = useState(new ApiService());
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [notificationDialog, setNotificationDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [offers, setOffers] = useState([]);
  const [deviceId,setDeviceId] = useState('');
  const [activeTab, setActiveTab] = useState("offers");
  const itemSearchInputRef = useRef(null);
  const itemSearchSelectionRef = useRef({ start: null, end: null });
  const itemsSelectRef = useRef(null);
  const selectScrollPositionRef = useRef(0);
  const isInputFocusedRef = useRef(false);
  useEffect(() => {
  setDeviceId(getDeviceId());
}, []);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOffers: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadFoodItems(), loadOffers()]);
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
    try {
      // Fetch all items with high limit for admin
      const response = await apiService.getFoodItems({ limit: 1000, page: 1 });
      const items = response.items || [];
      setFoodItems(items);
    } catch (error) {
      console.error('Error loading food items:', error);
      setFoodItems([]);
      setFilteredFoodItems([]);
    }
  };

  const normalizeSearchField = useCallback((value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'number') return value.toString().toLowerCase();
    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map((v) => normalizeSearchField(v))
        .join(' ');
    }
    if (typeof value === 'object') {
      return Object.values(value)
        .filter(Boolean)
        .map((v) => normalizeSearchField(v))
        .join(' ');
    }
    return '';
  }, []);

  const itemMatchesQuery = useCallback(
    (item, query) => {
      if (!query.trim()) return true;
      const normalizedQuery = query.trim().toLowerCase();

      const fieldsToSearch = [
        normalizeSearchField(item.name),
        normalizeSearchField(item.description),
        normalizeSearchField(item.subtitle),
        normalizeSearchField(item.category?.name),
        normalizeSearchField(item.badge),
        normalizeSearchField(item.type),
        item.price != null ? item.price.toString().toLowerCase() : '',
      ];

      return fieldsToSearch.some((field) => field.includes(normalizedQuery));
    },
    [normalizeSearchField]
  );

  const filteredFoodItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return foodItems;
    return foodItems.filter((item) => itemMatchesQuery(item, itemSearchQuery));
  }, [foodItems, itemSearchQuery, itemMatchesQuery]);


  // Preserve select scroll position when filtered items change - IMMEDIATE restoration
  useLayoutEffect(() => {
    if (!itemsSelectRef.current || !isInputFocusedRef.current) return;
    const select = itemsSelectRef.current;
    const savedScrollTop = selectScrollPositionRef.current;
    
    // COMPLETELY DISABLE SCROLLING by setting overflow hidden with important
    select.style.setProperty('overflow', 'hidden', 'important');
    select.style.setProperty('overflow-y', 'hidden', 'important');
    
    // IMMEDIATELY restore scroll position (before browser can scroll)
    try {
      select.scrollTop = savedScrollTop;
    } catch (e) {
      // Ignore if scrollTop is locked
    }
    
    // Force restore multiple times to override any browser scrolling
    const restoreScroll = () => {
      if (itemsSelectRef.current && isInputFocusedRef.current) {
        itemsSelectRef.current.style.setProperty('overflow', 'hidden', 'important');
        itemsSelectRef.current.style.setProperty('overflow-y', 'hidden', 'important');
        try {
          itemsSelectRef.current.scrollTop = savedScrollTop;
        } catch (e) {
          // Ignore
        }
      }
    };
    
    restoreScroll();
    requestAnimationFrame(restoreScroll);
    requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
    
    // Also restore on next tick
    setTimeout(restoreScroll, 0);
    setTimeout(restoreScroll, 10);
  }, [filteredFoodItems]);

  // Prevent scroll on select when input is focused - OVERRIDE scrollTop PROPERTY
  useEffect(() => {
    if (!itemsSelectRef.current || !itemSearchInputRef.current || !showModal) return;
    
    const select = itemsSelectRef.current;
    const input = itemSearchInputRef.current;
    let scrollTopDescriptor = null;
    let isLocked = false;
    
    const lockScroll = () => {
      if (isLocked) return;
      isLocked = true;
      isInputFocusedRef.current = true;
      selectScrollPositionRef.current = select.scrollTop;
      
      // Override scrollTop setter to prevent changes
      try {
        scrollTopDescriptor = Object.getOwnPropertyDescriptor(select, 'scrollTop');
        Object.defineProperty(select, 'scrollTop', {
          get: () => selectScrollPositionRef.current,
          set: (value) => {
            // Ignore any attempts to change scrollTop
            if (scrollTopDescriptor && scrollTopDescriptor.set) {
              scrollTopDescriptor.set.call(select, selectScrollPositionRef.current);
            }
          },
          configurable: true
        });
      } catch (e) {
        console.warn('Could not override scrollTop:', e);
      }
      
      // Also set overflow hidden with important to override any CSS
      select.style.setProperty('overflow', 'hidden', 'important');
      select.style.setProperty('overflow-y', 'hidden', 'important');
      select.style.setProperty('scroll-behavior', 'auto', 'important');
    };
    
    const unlockScroll = () => {
      if (!isLocked) return;
      isLocked = false;
      isInputFocusedRef.current = false;
      
      // Restore original scrollTop property
      if (scrollTopDescriptor) {
        try {
          Object.defineProperty(select, 'scrollTop', scrollTopDescriptor);
        } catch (e) {
          console.warn('Could not restore scrollTop:', e);
        }
      }
      
      // Restore overflow
      select.style.removeProperty('overflow');
      select.style.removeProperty('overflow-y');
    };
    
    const handleInputFocus = () => {
      lockScroll();
    };
    
    const handleInputBlur = () => {
      unlockScroll();
    };
    
    const handleScroll = (e) => {
      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };
    
    // Watch for DOM changes - lock immediately
    const observer = new MutationObserver(() => {
      if (isLocked && itemsSelectRef.current) {
        lockScroll();
        requestAnimationFrame(() => {
          if (itemsSelectRef.current && isLocked) {
            lockScroll();
          }
        });
      }
    });
    
    observer.observe(select, { childList: true, subtree: true });
    
    // Prevent all scroll events
    select.addEventListener('scroll', handleScroll, { passive: false, capture: true });
    select.addEventListener('wheel', handleScroll, { passive: false, capture: true });
    select.addEventListener('touchmove', handleScroll, { passive: false, capture: true });
    input.addEventListener('focus', handleInputFocus);
    input.addEventListener('blur', handleInputBlur);
    
    // Continuously enforce lock
    const scrollLockInterval = setInterval(() => {
      if (isLocked && itemsSelectRef.current) {
        lockScroll();
      }
    }, 1); // Maximum frequency
    
    return () => {
      unlockScroll();
      observer.disconnect();
      select.removeEventListener('scroll', handleScroll, { capture: true });
      select.removeEventListener('wheel', handleScroll, { capture: true });
      select.removeEventListener('touchmove', handleScroll, { capture: true });
      input.removeEventListener('focus', handleInputFocus);
      input.removeEventListener('blur', handleInputBlur);
      clearInterval(scrollLockInterval);
    };
  }, [showModal]);

  useLayoutEffect(() => {
    if (!showModal || !itemSearchInputRef.current) return;
    const el = itemSearchInputRef.current;
    const { start, end } = itemSearchSelectionRef.current;
    const fallbackPos = el.value.length;
    const selectionStart = typeof start === 'number' ? start : fallbackPos;
    const selectionEnd = typeof end === 'number' ? end : selectionStart;
    el.focus({ preventScroll: true });
    el.setSelectionRange(selectionStart, selectionEnd);
  }, [itemSearchQuery, showModal]);

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
    if (params.platform) {
      queryParams.platform = params.platform;
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
      console.error('Save offer error:', error);
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

  // Enhanced Offer Form with One-Time Per Device Support
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
      platforms: editingItem?.platforms || ['all'],
      isOneTimePerDevice: editingItem?.isOneTimePerDevice || false, // NEW FIELD
      isActive: editingItem?.isActive !== false,
      isFeatured: editingItem?.isFeatured || false,
      startDate: editingItem?.startDate ? new Date(editingItem.startDate).toISOString().slice(0, 16) : '',
      endDate: editingItem?.endDate ? new Date(editingItem.endDate).toISOString().slice(0, 16) : '',
      priority: editingItem?.priority || 1,
      termsAndConditions: editingItem?.termsAndConditions?.join('\n') || '',
    });

    const handlePlatformChange = (platform) => {
      setFormData(prev => {
        let newPlatforms;
        
        if (platform === 'all') {
          newPlatforms = ['all'];
        } else {
          newPlatforms = prev.platforms.filter(p => p !== 'all');
          
          if (newPlatforms.includes(platform)) {
            newPlatforms = newPlatforms.filter(p => p !== platform);
          } else {
            newPlatforms.push(platform);
          }
          
          if (newPlatforms.length === 0) {
            newPlatforms = ['all'];
          }
        }
        
        return {
          ...prev,
          platforms: newPlatforms
        };
      });
    };

    const isPlatformSelected = (platform) => {
      return formData.platforms.includes(platform);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        showNotificationDialog('Validation Error', Object.values(errors).join('\n'), 'error');
        return;
      }

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
        platforms: formData.platforms.length > 0 ? formData.platforms : ['all'],
        isOneTimePerDevice: formData.isOneTimePerDevice, // Include in submission
      };
      
      handleSaveOffer(submitData);
    };

    const validateForm = (data) => {
      const errors = {};
      
      if (!data.title?.trim()) {
        errors.title = 'Title is required';
      }
      
      if (!data.description?.trim()) {
        errors.description = 'Description is required';
      }
      
      if (!data.imageUrl) {
        errors.imageUrl = 'Image is required';
      }
      
      if (!data.startDate) {
        errors.startDate = 'Start date is required';
      }
      
      if (!data.endDate) {
        errors.endDate = 'End date is required';
      }
      
      if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
      
      if (data.type === 'combo' && (!data.comboItems || data.comboItems.length === 0)) {
        errors.comboItems = 'At least one combo item is required';
      }
      
      return errors;
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

        {/* Platform Selection */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            Platform Availability
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Select which platforms this offer should be available on
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isPlatformSelected('all')
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}>
              <input
                type="checkbox"
                checked={isPlatformSelected('all')}
                onChange={() => handlePlatformChange('all')}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">All Platforms</span>
                  <span className="text-xs text-gray-500">Mobile & Web</span>
                </div>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isPlatformSelected('mobile')
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
              <input
                type="checkbox"
                checked={isPlatformSelected('mobile')}
                onChange={() => handlePlatformChange('mobile')}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Mobile Only</span>
                  <span className="text-xs text-gray-500">App exclusive</span>
                </div>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isPlatformSelected('web')
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}>
              <input
                type="checkbox"
                checked={isPlatformSelected('web')}
                onChange={() => handlePlatformChange('web')}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Web Only</span>
                  <span className="text-xs text-gray-500">Website exclusive</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* NEW: One-Time Per Device Section */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            Device Restrictions
          </h4>
          <div className="space-y-4">
            <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              formData.isOneTimePerDevice
                ? 'border-rose-500 bg-rose-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-rose-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.isOneTimePerDevice}
                onChange={(e) => setFormData({ ...formData, isOneTimePerDevice: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-bold text-gray-900">One-Time Per Device</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                    Exclusive
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Enable this to restrict the offer to one claim per device. Each device (mobile, tablet, or computer) can only claim this offer once. 
                  Perfect for first-time customer offers and exclusive promotions.
                </p>
                {formData.isOneTimePerDevice && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Once enabled, users who have already claimed this offer on their device will not see it in their offer list.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </label>
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
                      {filteredFoodItems.length === 0 ? (
                        <option disabled>No items available</option>
                      ) : (
                        filteredFoodItems.map((foodItem) => {
                          const itemName = foodItem.name?.en || foodItem.name || 'Unnamed Item';
                          const itemPrice = foodItem.price || 0;
                          return (
                            <option key={foodItem._id} value={foodItem._id}>
                              {itemName} - ${itemPrice.toFixed(2)}
                            </option>
                          );
                        })
                      )}
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
              <label className="block text-sm font-semibold text-gray-800 mb-2">Max Discount Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Total Usage Limit</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Per User Limit</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.userUsageLimit}
                onChange={(e) => setFormData({ ...formData, userUsageLimit: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </div>

        {/* Applicability */}
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Items ({filteredFoodItems.length} available)
                </label>
                {/* Search input for items */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items by name, description, or price..."
                      value={itemSearchQuery}
                      onChange={(e) => {
                        // Save scroll position BEFORE state update and disable scrolling
                        if (itemsSelectRef.current) {
                          selectScrollPositionRef.current = itemsSelectRef.current.scrollTop;
                          // Force overflow hidden with important
                          itemsSelectRef.current.style.setProperty('overflow', 'hidden', 'important');
                          itemsSelectRef.current.style.setProperty('overflow-y', 'hidden', 'important');
                        }
                        itemSearchSelectionRef.current = {
                          start: e.target.selectionStart,
                          end: e.target.selectionEnd,
                        };
                        setItemSearchQuery(e.target.value);
                      }}
                      onFocus={() => {
                        isInputFocusedRef.current = true;
                        if (itemsSelectRef.current) {
                          selectScrollPositionRef.current = itemsSelectRef.current.scrollTop;
                          // Use setProperty with important flag to override any other styles
                          itemsSelectRef.current.style.setProperty('overflow', 'hidden', 'important');
                          itemsSelectRef.current.style.setProperty('overflow-y', 'hidden', 'important');
                        }
                      }}
                      onBlur={() => {
                        isInputFocusedRef.current = false;
                        if (itemsSelectRef.current) {
                          itemsSelectRef.current.style.removeProperty('overflow');
                          itemsSelectRef.current.style.removeProperty('overflow-y');
                        }
                      }}
                      ref={itemSearchInputRef}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {itemSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setItemSearchQuery('');
                          if (itemSearchInputRef.current) {
                            itemSearchSelectionRef.current = { start: 0, end: 0 };
                            requestAnimationFrame(() => {
                              if (!itemSearchInputRef.current) return;
                              itemSearchInputRef.current.focus({ preventScroll: true });
                              itemSearchInputRef.current.setSelectionRange(0, 0);
                            });
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <select
                  ref={itemsSelectRef}
                  multiple
                  size="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  value={formData.appliedToItems}
                  onChange={(e) => {
                    // Save scroll position BEFORE state update
                    if (itemsSelectRef.current) {
                      selectScrollPositionRef.current = itemsSelectRef.current.scrollTop;
                    }
                    setFormData({
                      ...formData,
                      appliedToItems: Array.from(e.target.selectedOptions, option => option.value),
                    });
                    // Restore scroll position after state update - multiple attempts
                    const savedScroll = selectScrollPositionRef.current;
                    if (itemsSelectRef.current) {
                      itemsSelectRef.current.scrollTop = savedScroll;
                    }
                    requestAnimationFrame(() => {
                      if (itemsSelectRef.current) {
                        itemsSelectRef.current.scrollTop = savedScroll;
                      }
                      requestAnimationFrame(() => {
                        if (itemsSelectRef.current) {
                          itemsSelectRef.current.scrollTop = savedScroll;
                        }
                      });
                    });
                  }}
                  onFocus={(e) => {
                    // Prevent auto-scroll when select gets focus
                    if (itemsSelectRef.current) {
                      const savedScrollTop = itemsSelectRef.current.scrollTop || 0;
                      if (itemsSelectRef.current) {
                        itemsSelectRef.current.scrollTop = savedScrollTop;
                      }
                      requestAnimationFrame(() => {
                        if (itemsSelectRef.current) {
                          itemsSelectRef.current.scrollTop = savedScrollTop;
                        }
                      });
                    }
                  }}
                >
                  {filteredFoodItems.length === 0 ? (
                    <option disabled className="text-gray-500 py-2">
                      {itemSearchQuery ? 'No items found matching your search' : 'No items available'}
                    </option>
                  ) : (
                    filteredFoodItems.map((item) => {
                      const itemName = item.name?.en || item.name || 'Unnamed Item';
                      const itemPrice = item.price || 0;
                      const isSelected = formData.appliedToItems.includes(item._id);
                      return (
                        <option 
                          key={item._id} 
                          value={item._id} 
                          className={`py-2 ${isSelected ? 'bg-blue-100 font-semibold' : ''}`}
                        >
                          {itemName} - ${itemPrice.toFixed(2)}
                        </option>
                      );
                    })
                  )}
                </select>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                  {formData.appliedToItems.length > 0 && (
                    <p className="text-xs text-blue-600 font-medium">
                      {formData.appliedToItems.length} item{formData.appliedToItems.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Types */}
        <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            Delivery Options
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-cyan-400 transition-all">
              <input
                type="checkbox"
                checked={formData.deliveryTypes.includes('delivery')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, deliveryTypes: [...formData.deliveryTypes, 'delivery'] });
                  } else {
                    setFormData({ ...formData, deliveryTypes: formData.deliveryTypes.filter(t => t !== 'delivery') });
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-800">Delivery</span>
            </label>
            <label className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-cyan-400 transition-all">
              <input
                type="checkbox"
                checked={formData.deliveryTypes.includes('pickup')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, deliveryTypes: [...formData.deliveryTypes, 'pickup'] });
                  } else {
                    setFormData({ ...formData, deliveryTypes: formData.deliveryTypes.filter(t => t !== 'pickup') });
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-800">Pickup</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Leave both unchecked to apply to all delivery types</p>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Terms & Conditions
          </h4>
          <textarea
            rows="4"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            placeholder="Enter terms and conditions (one per line)"
          />
          <p className="text-xs text-gray-500 mt-2">Enter each term on a new line</p>
        </div>

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
  const Modal = ({ children, title, size = 'max-w-6xl' }) => {
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
      platform: '',
      page: 1,
      limit: 20,
    });

    const handleFilterChange = (key, value) => {
      const newFilters = { ...filters, [key]: value, page: 1 };
      setFilters(newFilters);

      const queryParams = { page: newFilters.page, limit: newFilters.limit };
      if (newFilters.featured !== null) queryParams.featured = newFilters.featured;
      if (newFilters.type) queryParams.type = newFilters.type;
      if (newFilters.platform) queryParams.platform = newFilters.platform;

      loadOffers(queryParams);
    };

    return (
      <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
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
          <select
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="all">All Platforms</option>
            <option value="mobile">Mobile Only</option>
            <option value="web">Web Only</option>
          </select>
          <button
            onClick={() => openModal('offer')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-semibold shadow-lg transition-all hover:scale-105 ml-auto"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Offer</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {offers.length} of {pagination.totalOffers} offers
          </div>
          <div className="flex items-center gap-2">
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
        
        {/* Device ID Display */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Smartphone className="w-4 h-4" />
            <span>Your Device ID: <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{deviceId}</code></span>
          </div>
        </div>
      </div>
    );
  };

  // Offers Grid with Device Claim Status
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

    const getPlatformBadge = (platforms) => {
      if (!platforms || platforms.length === 0 || platforms.includes('all')) {
        return <Globe className="w-4 h-4 text-indigo-600" />;
      }
      if (platforms.includes('mobile') && platforms.includes('web')) {
        return <Globe className="w-4 h-4 text-indigo-600" />;
      }
      if (platforms.includes('mobile')) {
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      }
      if (platforms.includes('web')) {
        return <Monitor className="w-4 h-4 text-purple-600" />;
      }
      return <Globe className="w-4 h-4 text-gray-600" />;
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
              <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
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
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  {getPlatformBadge(offer.platforms)}
                  <span className="text-gray-700">
                    {!offer.platforms || offer.platforms.length === 0 || offer.platforms.includes('all') 
                      ? 'All' 
                      : offer.platforms.join(', ').toUpperCase()}
                  </span>
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${offer.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
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

  const statusBadges = [
    {
      label: deviceId ? `Device ${deviceId.slice(-6)}` : 'Device not registered',
      icon: <Smartphone className="h-3 w-3 text-slate-500" />,
    },
    {
      label: `${offers.length} offers live`,
      icon: <Percent className="h-3 w-3 text-slate-500" />,
    },
  ];

  const handleSidebarNavigate = (item) => {
    if (item.href && item.id !== 'offers') {
      router.push(item.href);
      return;
    }

    if (!item.href) {
      router.push('/');
    }
  };

  const bodyContent =
    loading && offers.length === 0 ? (
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
            <div className="max-w-2xl mx-auto">
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
    );

  return (
    <>
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

      <AdminShell
        title="Offers & campaigns"
        subtitle="Create and supervise promotions across every channel."
        statusBadges={statusBadges}
        showSearch={false}
        sidebarItems={adminNavigation}
        activeSidebarItem="offers"
        onSidebarNavigate={handleSidebarNavigate}
        user={propUser}
        logout={propLogout}
      >
        {bodyContent}
      </AdminShell>

      {showModal && modalType === 'offer' && (
        <Modal title={`${editingItem ? 'Edit' : 'Create'} Offer`} size="max-w-4xl">
          <OfferForm />
        </Modal>
      )}
    </>
  );
};

// Disable static generation to prevent prerendering errors
export const dynamic = 'force-dynamic';

export default OffersWithAuth;