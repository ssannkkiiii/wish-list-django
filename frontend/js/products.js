// Products Management
class ProductsManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentPage = 1;
        this.filters = {
            search: '',
            category: '',
            ordering: '-created_at'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadProducts();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filters.search = e.target.value;
                this.loadProducts();
            }, 500));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.loadProducts();
            });
        }

        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.filters.ordering = e.target.value;
                this.loadProducts();
            });
        }

        // Add product form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createProduct();
            });
        }

        // Edit product form
        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct();
            });
        }
    }

    async loadCategories() {
        try {
            const response = await api.getCategories();
            this.categories = response.results || response;
            this.updateCategorySelects();
        } catch (error) {
            console.error('Failed to load categories:', error);
            showToast('Failed to load categories', 'error', 'Error');
        }
    }

    updateCategorySelects() {
        const selects = [
            'categoryFilter',
            'productCategory',
            'editProductCategory'
        ];

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options except the first one
                const firstOption = select.querySelector('option[value=""]');
                select.innerHTML = '';
                if (firstOption) {
                    select.appendChild(firstOption);
                }

                // Add category options
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            }
        });
    }

    async loadProducts() {
        try {
            showLoading();
            const params = {};
            
            if (this.filters.search) params.q = this.filters.search;
            if (this.filters.category) params.category = this.filters.category;
            if (this.filters.ordering) params.ordering = this.filters.ordering;

            const response = await api.getProducts(params);
            this.products = response.results || response;
            this.renderProducts();
            this.updateDashboardStats();
            hideLoading();
        } catch (error) {
            console.error('Failed to load products:', error);
            showToast('Failed to load products', 'error', 'Error');
            hideLoading();
        }
    }

    renderProducts() {
        const container = document.getElementById('productsList');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-gift" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3 style="color: #666; margin-bottom: 0.5rem;">No products found</h3>
                    <p style="color: #999;">Start by adding your first product to your wish list!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const category = this.categories.find(cat => cat.id === product.category);
        const imageUrl = product.image || 'https://via.placeholder.com/300x200?text=No+Image';
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${formatCurrency(product.price)}</div>
                    </div>
                    ${category ? `<span class="product-category">${category.name}</span>` : ''}
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="productsManager.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="productsManager.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <a href="${product.url}" target="_blank" class="btn btn-success btn-sm">
                            <i class="fas fa-external-link-alt"></i> View
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    async createProduct() {
        try {
            showLoading();
            const form = document.getElementById('addProductForm');
            const formData = new FormData(form);
            
            const productData = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                url: formData.get('url'),
                category: formData.get('category') || null,
                image: formData.get('image')
            };

            await api.createProduct(productData);
            showToast('Product created successfully!', 'success', 'Success');
            this.closeModal('addProductModal');
            form.reset();
            this.loadProducts();
            hideLoading();
        } catch (error) {
            console.error('Failed to create product:', error);
            showToast(error.message || 'Failed to create product', 'error', 'Error');
            hideLoading();
        }
    }

    async editProduct(id) {
        try {
            showLoading();
            const product = await api.getProduct(id);
            this.populateEditForm(product);
            this.showModal('editProductModal');
            hideLoading();
        } catch (error) {
            console.error('Failed to load product:', error);
            showToast('Failed to load product details', 'error', 'Error');
            hideLoading();
        }
    }

    populateEditForm(product) {
        const form = document.getElementById('editProductForm');
        form.id.value = product.id;
        form.name.value = product.name;
        form.price.value = product.price;
        form.url.value = product.url;
        form.category.value = product.category || '';
    }

    async updateProduct() {
        try {
            showLoading();
            const form = document.getElementById('editProductForm');
            const formData = new FormData(form);
            const productId = formData.get('id');
            
            const productData = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                url: formData.get('url'),
                category: formData.get('category') || null,
                image: formData.get('image')
            };

            await api.updateProduct(productId, productData);
            showToast('Product updated successfully!', 'success', 'Success');
            this.closeModal('editProductModal');
            this.loadProducts();
            hideLoading();
        } catch (error) {
            console.error('Failed to update product:', error);
            showToast(error.message || 'Failed to update product', 'error', 'Error');
            hideLoading();
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            showLoading();
            await api.deleteProduct(id);
            showToast('Product deleted successfully!', 'success', 'Success');
            this.loadProducts();
            hideLoading();
        } catch (error) {
            console.error('Failed to delete product:', error);
            showToast(error.message || 'Failed to delete product', 'error', 'Error');
            hideLoading();
        }
    }

    updateDashboardStats() {
        // Update total products
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = this.products.length;
        }

        // Update total value
        const totalValueElement = document.getElementById('totalValue');
        if (totalValueElement) {
            const totalValue = this.products.reduce((sum, product) => sum + parseFloat(product.price), 0);
            totalValueElement.textContent = formatCurrency(totalValue);
        }

        // Update recent products
        this.updateRecentProducts();
    }

    updateRecentProducts() {
        const container = document.getElementById('recentProductsList');
        if (!container) return;

        const recentProducts = this.products.slice(0, 4);
        
        if (recentProducts.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <i class="fas fa-gift" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="color: #666;">No products yet. Add your first product!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentProducts.map(product => this.createProductCard(product)).join('');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showAddProductModal() {
        this.showModal('addProductModal');
    }
}

// Global functions for HTML onclick handlers
function showAddProductModal() {
    productsManager.showAddProductModal();
}

function closeModal(modalId) {
    productsManager.closeModal(modalId);
}

// Create global products manager
const productsManager = new ProductsManager();
