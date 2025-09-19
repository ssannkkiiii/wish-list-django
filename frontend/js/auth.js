// Authentication Management
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            api.setToken(token);
            this.loadUserProfile();
        } else {
            this.showAuthPage('login');
        }
    }

    async loadUserProfile() {
        try {
            showLoading();
            const userData = await api.getProfile();
            this.user = userData;
            this.isAuthenticated = true;
            this.updateUI();
            this.showPage('dashboard');
            hideLoading();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout();
        }
    }

    async login(email, password) {
        try {
            showLoading();
            const response = await api.login(email, password);
            
            if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
            }
            
            this.user = response.user;
            this.isAuthenticated = true;
            this.updateUI();
            this.showPage('dashboard');
            
            showToast('Welcome back!', 'success', 'Login Successful');
            hideLoading();
            
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            showToast(error.message || 'Login failed. Please check your credentials.', 'error', 'Login Failed');
            hideLoading();
            return false;
        }
    }

    async register(userData) {
        try {
            showLoading();
            const response = await api.register(userData);
            
            if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
            }
            
            this.user = response.user;
            this.isAuthenticated = true;
            this.updateUI();
            this.showPage('dashboard');
            
            showToast('Account created successfully!', 'success', 'Registration Successful');
            hideLoading();
            
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            showToast(error.message || 'Registration failed. Please try again.', 'error', 'Registration Failed');
            hideLoading();
            return false;
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        this.isAuthenticated = false;
        this.user = null;
        this.showAuthPage('login');
        showToast('You have been logged out', 'info', 'Logout');
    }

    async updateProfile(profileData) {
        try {
            showLoading();
            const updatedUser = await api.updateProfile(profileData);
            this.user = updatedUser;
            this.updateUI();
            showToast('Profile updated successfully!', 'success', 'Profile Updated');
            hideLoading();
            return true;
        } catch (error) {
            console.error('Profile update failed:', error);
            showToast(error.message || 'Failed to update profile', 'error', 'Update Failed');
            hideLoading();
            return false;
        }
    }

    async changePassword(passwordData) {
        try {
            showLoading();
            await api.changePassword(passwordData);
            showToast('Password changed successfully!', 'success', 'Password Changed');
            hideLoading();
            return true;
        } catch (error) {
            console.error('Password change failed:', error);
            showToast(error.message || 'Failed to change password', 'error', 'Password Change Failed');
            hideLoading();
            return false;
        }
    }

    updateUI() {
        if (this.isAuthenticated && this.user) {
            // Update user name in dashboard
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.user.full_name || this.user.username;
            }

            // Update profile form
            this.updateProfileForm();
        }
    }

    updateProfileForm() {
        if (!this.user) return;

        const form = document.getElementById('profileForm');
        if (form) {
            form.first_name.value = this.user.first_name || '';
            form.last_name.value = this.user.last_name || '';
            form.bio.value = this.user.bio || '';
        }

        // Update avatar
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg && this.user.avatar) {
            avatarImg.src = this.user.avatar;
            avatarImg.style.display = 'block';
        } else if (avatarImg) {
            avatarImg.style.display = 'none';
        }
    }

    showAuthPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show auth pages
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('registerPage').classList.remove('active');
        
        // Show specific auth page
        if (page === 'login') {
            document.getElementById('loginPage').classList.add('active');
        } else if (page === 'register') {
            document.getElementById('registerPage').classList.add('active');
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
    }
}

// Create global auth manager
const authManager = new AuthManager();

// Global functions for HTML onclick handlers
function showAuthPage(page) {
    authManager.showAuthPage(page);
}

function showPage(page) {
    authManager.showPage(page);
}

function logout() {
    authManager.logout();
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            
            await authManager.login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                password: formData.get('password'),
                password_confirm: formData.get('password_confirm')
            };
            
            // Validate password confirmation
            if (userData.password !== userData.password_confirm) {
                showToast('Passwords do not match', 'error', 'Validation Error');
                return;
            }
            
            await authManager.register(userData);
        });
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            const profileData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                bio: formData.get('bio')
            };
            
            await authManager.updateProfile(profileData);
        });
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(changePasswordForm);
            const passwordData = {
                old_password: formData.get('old_password'),
                new_password: formData.get('new_password'),
                new_password_confirm: formData.get('new_password_confirm')
            };
            
            // Validate password confirmation
            if (passwordData.new_password !== passwordData.new_password_confirm) {
                showToast('New passwords do not match', 'error', 'Validation Error');
                return;
            }
            
            await authManager.changePassword(passwordData);
            changePasswordForm.reset();
        });
    }

    // Avatar upload
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('avatar', file);
                
                try {
                    showLoading();
                    await authManager.updateProfile(formData);
                    hideLoading();
                } catch (error) {
                    console.error('Avatar upload failed:', error);
                    showToast('Failed to upload avatar', 'error', 'Upload Failed');
                    hideLoading();
                }
            }
        });
    }
});
