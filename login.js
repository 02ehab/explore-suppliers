/**
 * Login Page Script
 * Handles admin authentication
 */

let isSubmitting = false;

// Wait for dependencies
function waitForDependencies() {
  return new Promise((resolve) => {
    const checkDeps = () => {
      if (window.authModule && window.UIModule && window.supabaseClient) {
        resolve();
      } else {
        setTimeout(checkDeps, 100);
      }
    };
    checkDeps();
  });
}

/**
 * Check if user is already logged in
 */
async function checkExistingSession() {
  try {
    const isAuth = await authModule.isAuthenticated();
    if (isAuth) {
      // Open dashboard in new tab
      window.open('dashboard.html', '_blank');
    }
  } catch (error) {
    console.warn('Session check error:', error);
  }
}

/**
 * Handle form submission
 */
async function handleLogin(e) {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  const submitBtn = document.getElementById('submitBtn');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  // Validation
  if (!email || !password) {
    UIModule.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    isSubmitting = false;
    return;
  }

  if (!isValidEmail(email)) {
    UIModule.showToast('البريد الإلكتروني غير صالح', 'error');
    isSubmitting = false;
    return;
  }

  // Show loading state
  UIModule.showLoading(submitBtn);

  try {
    // Attempt login
    const session = await authModule.signIn(email, password);

    if (session && session.user) {
      // Save preferences
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      UIModule.showToast('تم تسجيل الدخول بنجاح ✓', 'success', 2000);

      // Open dashboard in new tab after brief delay
      setTimeout(() => {
        window.open('dashboard.html', '_blank');
      }, 1500);
    }
  } catch (error) {
    UIModule.hideLoading(submitBtn);
    isSubmitting = false;

    // Handle specific error messages
    const errorMessage = error.message || 'حدث خطأ في تسجيل الدخول';

    if (errorMessage.includes('Invalid login credentials')) {
      UIModule.showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    } else if (errorMessage.includes('Email not confirmed')) {
      UIModule.showToast('لم يتم تأكيد بريدك الإلكتروني بعد', 'error');
    } else if (errorMessage.includes('Too many requests')) {
      UIModule.showToast('عدد محاولات كثير جداً. حاول لاحقاً', 'error');
    } else {
      UIModule.showToast('خطأ: ' + errorMessage, 'error');
    }

    console.error('Login error:', error);
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Restore remembered email
 */
function restoreRememberedEmail() {
  const email = localStorage.getItem('rememberEmail');
  if (email) {
    document.getElementById('email').value = email;
    document.getElementById('rememberMe').checked = true;
  }
}

/**
 * Initialize page
 */
async function initPage() {
  await waitForDependencies();

  // Check if already logged in
  await checkExistingSession();

  // Set up form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Restore email if it was remembered
  restoreRememberedEmail();

  // Auto-focus on email if empty
  const emailInput = document.getElementById('email');
  if (emailInput && !emailInput.value) {
    emailInput.focus();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
