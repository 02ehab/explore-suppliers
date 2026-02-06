/**
 * Supplier Form Script
 * Handles add and edit supplier functionality
 */

let isSubmitting = false;
let editingSupplierId = null;
let currentUser = null;

// Wait for dependencies
function waitForDependencies() {
  return new Promise((resolve) => {
    const checkDeps = () => {
      if (window.authModule && window.suppliersModule && window.UIModule) {
        resolve();
      } else {
        setTimeout(checkDeps, 100);
      }
    };
    checkDeps();
  });
}

/**
 * Check authentication
 */
async function checkAuth() {
  try {
    const user = await authModule.getCurrentUser();
    if (!user) {
      window.location.replace('login.html');
      return false;
    }
    currentUser = user;
    // Hide auth loader once auth is verified
    const authLoader = document.getElementById('authLoader');
    if (authLoader) authLoader.classList.add('hidden');
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.replace('login.html');
    return false;
  }
}

/**
 * Get supplier ID from URL params
 */
function getSupplierIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * Load supplier for editing
 */
async function loadSupplierForEdit(id) {
  try {
    const supplier = await suppliersModule.getSupplierById(id);

    if (supplier) {
      editingSupplierId = supplier.id;
      document.getElementById('supplierId').value = supplier.id;
      document.getElementById('companyName').value = supplier.company_name;
      document.getElementById('responsiblePersonName').value = supplier.responsible_person_name;
      document.getElementById('address').value = supplier.address;
      document.getElementById('mobile1').value = supplier.mobile_1;
      document.getElementById('mobile2').value = supplier.mobile_2 || '';
      document.getElementById('email').value = supplier.email || '';

      // Update page title
      document.getElementById('pageTitle').textContent = 'تعديل موردين: ' + supplier.company_name;
      document.querySelector('p').textContent = 'تحديث معلومات الموردين';
    }
  } catch (error) {
    console.error('Error loading supplier:', error);
    UIModule.showToast('خطأ في تحميل البيانات', 'error');
  }
}

/**
 * Validate form inputs
 */
function validateForm() {
  const companyName = document.getElementById('companyName').value.trim();
  const responsiblePersonName = document.getElementById('responsiblePersonName').value.trim();
  const address = document.getElementById('address').value.trim();
  const mobile1 = document.getElementById('mobile1').value.trim();
  const mobile2 = document.getElementById('mobile2').value.trim();
  const email = document.getElementById('email').value.trim();

  // Reset error messages
  document.getElementById('mobile1Error').classList.add('hidden');
  document.getElementById('mobile2Error').classList.add('hidden');
  document.getElementById('emailError').classList.add('hidden');

  let hasErrors = false;

  // Validate company name
  if (!companyName) {
    UIModule.showToast('اسم الشركة مطلوب', 'error');
    return false;
  }

  // Validate responsible person name
  if (!responsiblePersonName) {
    UIModule.showToast('اسم الشخص المسؤول مطلوب', 'error');
    return false;
  }

  // Validate address
  if (!address) {
    UIModule.showToast('العنوان مطلوب', 'error');
    return false;
  }

  // Validate mobile 1
  if (!mobile1) {
    UIModule.showToast('رقم الهاتف الأساسي مطلوب', 'error');
    return false;
  }

  if (!suppliersModule.isValidEgyptianPhone(mobile1)) {
    document.getElementById('mobile1Error').textContent = 'صيغة غير صحيحة (استخدم 01024455315)';
    document.getElementById('mobile1Error').classList.remove('hidden');
    hasErrors = true;
  }

  // Validate mobile 2 if provided
  if (mobile2 && !suppliersModule.isValidEgyptianPhone(mobile2)) {
    document.getElementById('mobile2Error').textContent = 'صيغة غير صحيحة (استخدم 01024455315)';
    document.getElementById('mobile2Error').classList.remove('hidden');
    hasErrors = true;
  }

  // Validate email if provided
  if (email && !suppliersModule.isValidEmail(email)) {
    document.getElementById('emailError').textContent = 'بريد إلكتروني غير صالح';
    document.getElementById('emailError').classList.remove('hidden');
    hasErrors = true;
  }

  if (hasErrors) {
    UIModule.showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
    return false;
  }

  return true;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (isSubmitting) return;

  // Validate
  if (!validateForm()) {
    return;
  }

  isSubmitting = true;
  const submitBtn = document.getElementById('submitBtn');
  UIModule.showLoading(submitBtn);

  try {
    const supplierData = {
      company_name: document.getElementById('companyName').value.trim(),
      responsible_person_name: document.getElementById('responsiblePersonName').value.trim(),
      address: document.getElementById('address').value.trim(),
      mobile_1: document.getElementById('mobile1').value.trim(),
      mobile_2: document.getElementById('mobile2').value.trim() || null,
      email: document.getElementById('email').value.trim() || null
    };

    let result;
    if (editingSupplierId) {
      // Update existing
      result = await suppliersModule.updateSupplier(editingSupplierId, supplierData);
      UIModule.showToast('تم تحديث الموردين بنجاح ✓', 'success', 2000);
    } else {
      // Create new
      result = await suppliersModule.createSupplier(supplierData);
      UIModule.showToast('تم إضافة الموردين بنجاح ✓', 'success', 2000);
    }

    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.replace('dashboard.html');
    }, 2000);

  } catch (error) {
    UIModule.hideLoading(submitBtn);
    isSubmitting = false;

    const errorMessage = error.message || 'حدث خطأ غير متوقع';

    if (errorMessage.includes('required')) {
      UIModule.showToast('جميع الحقول المطلوبة يجب أن تملأ', 'error');
    } else if (errorMessage.includes('Invalid')) {
      UIModule.showToast('بيانات غير صالحة. تحقق من إدخالك', 'error');
    } else {
      UIModule.showToast('خطأ: ' + errorMessage, 'error');
    }

    console.error('Form submission error:', error);
  }
}

/**
 * Setup real-time validation
 */
function setupRealTimeValidation() {
  const mobile1Input = document.getElementById('mobile1');
  const mobile2Input = document.getElementById('mobile2');
  const emailInput = document.getElementById('email');

  // Mobile 1 validation
  mobile1Input.addEventListener('change', () => {
    const error = document.getElementById('mobile1Error');
    if (mobile1Input.value.trim() && !suppliersModule.isValidEgyptianPhone(mobile1Input.value)) {
      error.textContent = 'رقم هاتف غير صالح';
      error.classList.remove('hidden');
    } else {
      error.classList.add('hidden');
    }
  });

  // Mobile 2 validation
  mobile2Input.addEventListener('change', () => {
    const error = document.getElementById('mobile2Error');
    if (mobile2Input.value.trim() && !suppliersModule.isValidEgyptianPhone(mobile2Input.value)) {
      error.textContent = 'رقم هاتف غير صالح';
      error.classList.remove('hidden');
    } else {
      error.classList.add('hidden');
    }
  });

  // Email validation
  emailInput.addEventListener('change', () => {
    const error = document.getElementById('emailError');
    if (emailInput.value.trim() && !suppliersModule.isValidEmail(emailInput.value)) {
      error.textContent = 'بريد إلكتروني غير صالح';
      error.classList.remove('hidden');
    } else {
      error.classList.add('hidden');
    }
  });
}

/**
 * Initialize page
 */
async function initPage() {
  await waitForDependencies();

  // Check authentication
  const isAuth = await checkAuth();
  if (!isAuth) return;

  // Setup form handler
  const form = document.getElementById('supplierForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Setup real-time validation
  setupRealTimeValidation();

  // Check if editing
  const supplierId = getSupplierIdFromUrl();
  if (supplierId) {
    await loadSupplierForEdit(supplierId);
  }

  // Focus on first field
  document.getElementById('companyName').focus();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
