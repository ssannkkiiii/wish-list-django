// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// API Helper Functions
class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('access_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(email, password) {
        const data = await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (data.access) {
            this.setToken(data.access);
        }
        
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        if (data.access) {
            this.setToken(data.access);
        }
        
        return data;
    }

    async logout() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                await this.request('/auth/logout/', {
                    method: 'POST',
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    async getProfile() {
        return await this.request('/auth/profile/');
    }

    async updateProfile(profileData) {
        return await this.request('/auth/profile/', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async changePassword(passwordData) {
        return await this.request('/auth/change-password/', {
            method: 'POST',
            body: JSON.stringify(passwordData),
        });
    }

    // Product endpoints
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/tasks/products/?${queryString}` : '/tasks/products/';
        return await this.request(endpoint);
    }

    async getProduct(id) {
        return await this.request(`/tasks/products/${id}/`);
    }

    async createProduct(productData) {
        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
            if (productData[key] !== null && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        return await this.request('/tasks/products/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });
    }

    async updateProduct(id, productData) {
        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
            if (productData[key] !== null && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        return await this.request(`/tasks/products/${id}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });
    }

    async deleteProduct(id) {
        return await this.request(`/tasks/products/${id}/`, {
            method: 'DELETE',
        });
    }

    // Category endpoints
    async getCategories() {
        return await this.request('/tasks/categories/');
    }

    async getCategory(slug) {
        return await this.request(`/tasks/categories/${slug}/`);
    }

    async createCategory(categoryData) {
        return await this.request('/tasks/categories/', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }

    async updateCategory(slug, categoryData) {
        return await this.request(`/tasks/categories/${slug}/`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    }

    async deleteCategory(slug) {
        return await this.request(`/tasks/categories/${slug}/`, {
            method: 'DELETE',
        });
    }

    // Refresh token
    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const data = await this.request('/auth/token/refresh/', {
            method: 'POST',
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (data.access) {
            this.setToken(data.access);
        }

        return data;
    }
}

// Create global API instance
const api = new API();

// Utility functions
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

function showToast(message, type = 'info', title = '') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="toast-icon ${icons[type]}"></i>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <i class="toast-close fas fa-times" onclick="this.parentElement.remove()"></i>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error', 'Error');
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error', 'Error');
});
