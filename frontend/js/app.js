// Main Application
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.initializeApp();
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle form submissions
        this.setupFormHandlers();
    }

    setupFormHandlers() {
        // Prevent default form submission for all forms
        document.addEventListener('submit', (e) => {
            // Only prevent default if the form doesn't have a custom handler
            if (!e.target.hasAttribute('data-custom-handler')) {
                e.preventDefault();
            }
        });
    }

    setupNavigation() {
        // Handle navigation clicks
        const navLinks = document.querySelectorAll('.nav-link[onclick*="showPage"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const onclick = link.getAttribute('onclick');
                if (onclick) {
                    eval(onclick);
                }
            });
        });
    }

    async initializeApp() {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                // Verify token is still valid
                await api.getProfile();
                // If successful, user is authenticated
                this.showAuthenticatedUI();
            } catch (error) {
                // Token is invalid, clear it
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                this.showUnauthenticatedUI();
            }
        } else {
            this.showUnauthenticatedUI();
        }
    }

    showAuthenticatedUI() {
        // Hide auth pages
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('registerPage').classList.remove('active');
        
        // Show dashboard
        this.showPage('dashboard');
        
        // Load user data
        this.loadUserData();
    }

    showUnauthenticatedUI() {
        // Show login page
        this.showPage('login');
    }

    async loadUserData() {
        try {
            // Load user profile
            if (window.authManager) {
                await authManager.loadUserProfile();
            }
            
            // Load products
            if (window.productsManager) {
                await productsManager.loadProducts();
            }
            
            // Load categories
            if (window.categoriesManager) {
                await categoriesManager.loadCategories();
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show specific page
        const pageElement = document.getElementById(page + 'Page');
        if (pageElement) {
            pageElement.classList.add('active');
        }

        // Load page-specific data
        this.loadPageData(page);
    }

    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'products':
                this.loadProductsData();
                break;
            case 'categories':
                this.loadCategoriesData();
                break;
            case 'profile':
                this.loadProfileData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Dashboard data is loaded by productsManager.updateDashboardStats()
            // Additional dashboard-specific data can be loaded here
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadProductsData() {
        try {
            if (window.productsManager) {
                await productsManager.loadProducts();
            }
        } catch (error) {
            console.error('Failed to load products data:', error);
        }
    }

    async loadCategoriesData() {
        try {
            if (window.categoriesManager) {
                await categoriesManager.loadCategories();
            }
        } catch (error) {
            console.error('Failed to load categories data:', error);
        }
    }

    async loadProfileData() {
        try {
            if (window.profileManager) {
                await profileManager.loadProfile();
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        showToast(message, 'error', 'Error');
    }

    // Success handling
    handleSuccess(message, title = 'Success') {
        showToast(message, 'success', title);
    }
}

// Global functions for HTML onclick handlers
function showPage(page) {
    if (window.app) {
        app.showPage(page);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global app instance
    window.app = new App();
    
    // Make sure all managers are available globally
    if (typeof authManager === 'undefined') {
        console.error('AuthManager not found');
    }
    if (typeof productsManager === 'undefined') {
        console.error('ProductsManager not found');
    }
    if (typeof categoriesManager === 'undefined') {
        console.error('CategoriesManager not found');
    }
    if (typeof profileManager === 'undefined') {
        console.error('ProfileManager not found');
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.app) {
        // Page became visible, refresh data if needed
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('Page', '');
            app.loadPageData(pageId);
        }
    }
});

// Handle online/offline status
window.addEventListener('online', function() {
    showToast('Connection restored', 'success', 'Online');
});

window.addEventListener('offline', function() {
    showToast('Connection lost. Some features may not work.', 'warning', 'Offline');
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
