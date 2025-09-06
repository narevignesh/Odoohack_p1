// Real API services for EcoFinds
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(email, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  isAuthenticated() {
    return !!getAuthToken();
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Categories API
export const categoriesAPI = {
  async getCategories() {
    return apiRequest('/categories');
  },

  async getCategoryCount(categoryId) {
    const response = await apiRequest(`/categories/${categoryId}/count`);
    return response.count;
  }
};

// Products API
export const productsAPI = {
  async getFeaturedProducts(limit = 8) {
    return apiRequest(`/products/featured?limit=${limit}`);
  },

  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.page) {
      params.append('skip', (filters.page - 1) * (filters.limit || 20));
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    const products = await apiRequest(url);
    
    return {
      products,
      total: products.length,
      page: filters.page || 1,
      limit: filters.limit || 12
    };
  },

  async getProduct(productId) {
    return apiRequest(`/products/${productId}`);
  },

  async createProduct(productData) {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async getUserProducts(userId) {
    return apiRequest(`/users/${userId}/products`);
  },

  async updateProduct(productId, productData) {
    return apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(productId) {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  }
};

// Users API
export const usersAPI = {
  async getUser(userId) {
    return apiRequest(`/users/${userId}`);
  },

  async updateUser(userId, userData) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
};