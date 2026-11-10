// RuralConnect - API Client
const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('rc_token');
  },

  getUser() {
    const userStr = localStorage.getItem('rc_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setAuth(token, user) {
    localStorage.setItem('rc_token', token);
    localStorage.setItem('rc_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        this.clearAuth();
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
          window.location.href = '/login?msg=session_expired';
        }
      }

      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.map(e => e.message).join(', ') : 'API request failed'));
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
