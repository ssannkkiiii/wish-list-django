// Profile Management
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Profile form is handled in auth.js
        // Change password form is handled in auth.js
        // Avatar upload is handled in auth.js
    }

    async loadProfile() {
        try {
            const user = await api.getProfile();
            this.updateProfileForm(user);
            this.updateProfileDisplay(user);
        } catch (error) {
            console.error('Failed to load profile:', error);
            showToast('Failed to load profile', 'error', 'Error');
        }
    }

    updateProfileForm(user) {
        const form = document.getElementById('profileForm');
        if (form) {
            form.first_name.value = user.first_name || '';
            form.last_name.value = user.last_name || '';
            form.bio.value = user.bio || '';
        }

        // Update avatar
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) {
            if (user.avatar) {
                avatarImg.src = user.avatar;
                avatarImg.style.display = 'block';
            } else {
                avatarImg.style.display = 'none';
            }
        }
    }

    updateProfileDisplay(user) {
        // Update user name in navigation or other places
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = user.full_name || user.username;
        });

        // Update any other profile-related displays
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(element => {
            element.textContent = user.email;
        });
    }

    async uploadAvatar(file) {
        try {
            showLoading();
            const formData = new FormData();
            formData.append('avatar', file);
            
            const updatedUser = await api.updateProfile(formData);
            this.updateProfileForm(updatedUser);
            this.updateProfileDisplay(updatedUser);
            
            showToast('Avatar updated successfully!', 'success', 'Success');
            hideLoading();
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            showToast('Failed to upload avatar', 'error', 'Error');
            hideLoading();
        }
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    showPasswordStrength(password) {
        const strengthIndicator = document.getElementById('passwordStrength');
        if (!strengthIndicator) return;

        const validation = this.validatePassword(password);
        const strength = validation.isValid ? 'strong' : 
                        password.length >= 6 ? 'medium' : 'weak';

        strengthIndicator.className = `password-strength ${strength}`;
        
        const strengthText = strengthIndicator.querySelector('.strength-text');
        if (strengthText) {
            strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
        }
    }

    setupPasswordValidation() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.showPasswordStrength(e.target.value);
            });
        });
    }
}

// Create global profile manager
const profileManager = new ProfileManager();

// Initialize password validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    profileManager.setupPasswordValidation();
});
