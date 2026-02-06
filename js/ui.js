/**
 * UI Utilities Module
 * Handles notifications, modals, and UI interactions
 */

const UIModule = {
  /**
   * Show toast notification
   */
  showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} p-4 rounded shadow-lg`;
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        ${this.getToastIcon(type)}
        <span>${this.escapeHtml(message)}</span>
      </div>
    `;
    
    container.appendChild(toast);
    
    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
    
    return toast;
  },

  /**
   * Create toast container if it doesn't exist
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  /**
   * Get toast icon based on type
   */
  getToastIcon(type) {
    const icons = {
      success: '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error: '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      info: '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };
    return icons[type] || icons.info;
  },

  /**
   * Show confirmation modal
   */
  showConfirmModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-slide-up">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">${this.escapeHtml(title)}</h2>
          <p class="text-gray-600 mb-6">${this.escapeHtml(message)}</p>
          <div class="flex gap-3 justify-end">
            <button class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition cancel-btn">
              إلغاء / Cancel
            </button>
            <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition confirm-btn">
              تأكيد / Confirm
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const cleanup = () => modal.remove();
    
    confirmBtn.addEventListener('click', () => {
      cleanup();
      onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
      cleanup();
      if (onCancel) onCancel();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        if (onCancel) onCancel();
      }
    });
    
    return modal;
  },

  /**
   * Show loading state
   */
  showLoading(element) {
    element.disabled = true;
    element.setAttribute('aria-busy', 'true');
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="spinner mr-2"></span>جاري التحميل...';
    element.dataset.originalContent = originalContent;
  },

  /**
   * Hide loading state
   */
  hideLoading(element) {
    element.disabled = false;
    element.setAttribute('aria-busy', 'false');
    element.innerHTML = element.dataset.originalContent || 'حفظ';
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  /**
   * Format phone number for display
   */
  formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `0${cleaned.slice(-10)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('201')) {
      return `+${cleaned}`;
    }
    return phone;
  },

  /**
   * Set page language/direction
   */
  setLanguage(lang = 'ar') {
    const html = document.documentElement;
    const isArabic = lang === 'ar';
    
    html.lang = isArabic ? 'ar' : 'en';
    html.dir = isArabic ? 'rtl' : 'ltr';
    
    localStorage.setItem('language', lang);
  },

  /**
   * Get current language
   */
  getLanguage() {
    return localStorage.getItem('language') || 'ar';
  },

  /**
   * Initialize language on page load
   */
  initLanguage() {
    const lang = this.getLanguage();
    this.setLanguage(lang);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  UIModule.initLanguage();
});

// Export UI module
window.UIModule = UIModule;
