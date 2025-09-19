// Categories Management
class CategoriesManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
    }

    setupEventListeners() {
        // Add category form
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCategory();
            });
        }

        // Edit category form
        const editCategoryForm = document.getElementById('editCategoryForm');
        if (editCategoryForm) {
            editCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateCategory();
            });
        }
    }

    async loadCategories() {
        try {
            const response = await api.getCategories();
            this.categories = response.results || response;
            this.renderCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
            showToast('Failed to load categories', 'error', 'Error');
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesList');
        if (!container) return;

        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                    <i class="fas fa-tags" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3 style="color: #666; margin-bottom: 0.5rem;">No categories found</h3>
                    <p style="color: #999;">Start by creating your first category!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.categories.map(category => this.createCategoryCard(category)).join('');
    }

    createCategoryCard(category) {
        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-header">
                    <h3 class="category-name">${category.name}</h3>
                    <div class="category-actions">
                        <button class="btn btn-primary btn-sm" onclick="categoriesManager.editCategory('${category.slug}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="categoriesManager.deleteCategory('${category.slug}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
                <div class="category-stats">
                    <span class="category-count">${category.posts_count || 0} products</span>
                    <span class="category-date">Created ${formatDate(category.created_at)}</span>
                </div>
            </div>
        `;
    }

    async createCategory() {
        try {
            showLoading();
            const form = document.getElementById('addCategoryForm');
            const formData = new FormData(form);
            
            const categoryData = {
                name: formData.get('name'),
                description: formData.get('description') || ''
            };

            await api.createCategory(categoryData);
            showToast('Category created successfully!', 'success', 'Success');
            this.closeModal('addCategoryModal');
            form.reset();
            this.loadCategories();
            // Also reload categories in products manager
            if (window.productsManager) {
                productsManager.loadCategories();
            }
            hideLoading();
        } catch (error) {
            console.error('Failed to create category:', error);
            showToast(error.message || 'Failed to create category', 'error', 'Error');
            hideLoading();
        }
    }

    async editCategory(slug) {
        try {
            showLoading();
            const category = await api.getCategory(slug);
            this.populateEditForm(category);
            this.showModal('editCategoryModal');
            hideLoading();
        } catch (error) {
            console.error('Failed to load category:', error);
            showToast('Failed to load category details', 'error', 'Error');
            hideLoading();
        }
    }

    populateEditForm(category) {
        const form = document.getElementById('editCategoryForm');
        form.id.value = category.id;
        form.name.value = category.name;
        form.description.value = category.description || '';
    }

    async updateCategory() {
        try {
            showLoading();
            const form = document.getElementById('editCategoryForm');
            const formData = new FormData(form);
            const categoryId = formData.get('id');
            
            // Find the category to get its slug
            const category = this.categories.find(cat => cat.id == categoryId);
            if (!category) {
                throw new Error('Category not found');
            }
            
            const categoryData = {
                name: formData.get('name'),
                description: formData.get('description') || ''
            };

            await api.updateCategory(category.slug, categoryData);
            showToast('Category updated successfully!', 'success', 'Success');
            this.closeModal('editCategoryModal');
            this.loadCategories();
            // Also reload categories in products manager
            if (window.productsManager) {
                productsManager.loadCategories();
            }
            hideLoading();
        } catch (error) {
            console.error('Failed to update category:', error);
            showToast(error.message || 'Failed to update category', 'error', 'Error');
            hideLoading();
        }
    }

    async deleteCategory(slug) {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            showLoading();
            await api.deleteCategory(slug);
            showToast('Category deleted successfully!', 'success', 'Success');
            this.loadCategories();
            // Also reload categories in products manager
            if (window.productsManager) {
                productsManager.loadCategories();
            }
            hideLoading();
        } catch (error) {
            console.error('Failed to delete category:', error);
            showToast(error.message || 'Failed to delete category', 'error', 'Error');
            hideLoading();
        }
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

    showAddCategoryModal() {
        this.showModal('addCategoryModal');
    }
}

// Global functions for HTML onclick handlers
function showAddCategoryModal() {
    categoriesManager.showAddCategoryModal();
}

// Create global categories manager
const categoriesManager = new CategoriesManager();
