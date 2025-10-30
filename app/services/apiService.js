// services/apiService.js
export class ApiService {
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
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soleybackend.vercel.app/api/v1';
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        'Accept-Language': this.language,
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

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Food Items API
  async getFoodItems(params = {}) {
  const queryParams = new URLSearchParams();
  
  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.lang) queryParams.append('lang', params.lang);
  if (params.includeInactive) queryParams.append('includeInactive', params.includeInactive);
  
  // For search, use a different parameter name that doesn't trigger text search
  if (params.search) queryParams.append('q', params.search); // Use 'q' instead of 'search'
  
  const queryString = queryParams.toString();
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
  const queryParams = new URLSearchParams();
  
  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // For search, use a different parameter name
  if (params.search) queryParams.append('q', params.search); // Use 'q' instead of 'search'
  
  const queryString = queryParams.toString();
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

  // Banners API
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

  // Offers API
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

  async getDeliverySettings() {
    return this.request('/settings/delivery');
  }

  async updateDeliverySettings(data) {
    return this.request('/settings/delivery', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleDeliveryStatus(enabled, disabledMessage) {
    return this.request('/settings/delivery/toggle', {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled: enabled, disabledMessage }),
    });
  }
}