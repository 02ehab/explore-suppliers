/**
 * Dashboard Script
 * Handles supplier list management
 */

let currentUser = null;
let allSuppliers = [];
let filteredSuppliers = [];
let currentPage = 1;
const pageSize = 10;

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
    document.getElementById('userEmail').textContent = user.email;
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
 * Load suppliers
 */
async function loadSuppliers(page = 1) {
  try {
    allSuppliers = await suppliersModule.getAllSuppliers();
    applyFilters();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    updateStats(allSuppliers);
    renderSuppliers(filteredSuppliers.slice(start, end));

    // Setup pagination
    const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
    setupPagination(totalPages, page);

    // Populate address filter
    populateAddressFilter(allSuppliers);
  } catch (error) {
    console.error('Error loading suppliers:', error);
    UIModule.showToast('خطأ في تحميل البيانات', 'error');
  }
}

/**
 * Update dashboard statistics
 */
function updateStats(suppliers) {
  const total = suppliers.length;
  const withEmail = suppliers.filter(s => s.email).length;
  const withPhone = suppliers.filter(s => s.mobile_1).length;
  const completionRate = total === 0 ? 0 : Math.round((withEmail / total) * 100);

  document.getElementById('totalSuppliers').textContent = total;
  document.getElementById('suppliersWithPhone').textContent = withPhone;
  document.getElementById('suppliersWithEmail').textContent = withEmail;
  document.getElementById('completionRate').textContent = completionRate + '%';
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category) {
  const categoryMap = {
    'Electronics': 'إلكترونيات',
    'Clothing': 'ملابس',
    'Food': 'طعام',
    'Construction': 'إنشاءات',
    'Medical': 'طبية',
    'Other': 'أخرى'
  };
  return categoryMap[category] || category;
}

/**
 * Render suppliers in table
 */
function renderSuppliers(suppliers) {
  const table = document.getElementById('suppliersTable');
  const emptyState = document.getElementById('emptyState');

  if (suppliers.length === 0) {
    table.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  table.innerHTML = suppliers.map(supplier => `
    <tr>
      <td class="px-6 py-4 text-sm font-medium text-gray-900">${escapeHtml(supplier.company_name)}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${supplier.category ? getCategoryDisplayName(supplier.category) : '-'}</td>
      <td class="px-6 py-4 text-sm text-gray-600 ltr">${formatPhoneDisplay(supplier.mobile_1)}</td>
      <td class="px-6 py-4 text-sm text-gray-600 ltr">${supplier.mobile_2 ? formatPhoneDisplay(supplier.mobile_2) : '-'}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${supplier.email ? escapeHtml(supplier.email) : '-'}</td>
      <td class="px-6 py-4 text-sm text-center">
        <div class="flex justify-center gap-2">
          <a href="supplier-form.html?id=${supplier.id}" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium">
            تعديل
          </a>
          <button onclick="deleteSupplier('${supplier.id}', '${escapeHtml(supplier.company_name)}')" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs font-medium">
            حذف
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Setup pagination
 */
function setupPagination(totalPages, currentPageNum) {
  currentPage = currentPageNum;

  if (totalPages <= 1) {
    document.getElementById('pagination').classList.add('hidden');
    return;
  }

  document.getElementById('pagination').classList.remove('hidden');
  document.getElementById('pageInfo').textContent = `الصفحة ${currentPageNum} من ${totalPages}`;

  document.getElementById('prevBtn').onclick = () => {
    if (currentPageNum > 1) loadSuppliers(currentPageNum - 1);
  };

  document.getElementById('nextBtn').onclick = () => {
    if (currentPageNum < totalPages) loadSuppliers(currentPageNum + 1);
  };

  document.getElementById('prevBtn').disabled = currentPageNum === 1;
  document.getElementById('nextBtn').disabled = currentPageNum === totalPages;
}

/**
 * Apply filters (search and address)
 */
function applyFilters() {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const addressFilter = document.getElementById('addressFilter').value.trim();

  filteredSuppliers = allSuppliers.filter(supplier => {
    // Search filter
    const matchesSearch = !searchQuery || (
      supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.responsible_person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.mobile_1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.mobile_2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Address filter
    const matchesAddress = !addressFilter || supplier.address.toLowerCase().includes(addressFilter.toLowerCase());

    return matchesSearch && matchesAddress;
  });
}

/**
 * Populate address filter dropdown
 */
function populateAddressFilter(suppliers) {
  const addressFilter = document.getElementById('addressFilter');
  const addresses = [...new Set(suppliers.map(s => s.address).filter(a => a))].sort();

  // Clear existing options except "جميع العناوين"
  addressFilter.innerHTML = '<option value="">جميع العناوين</option>';

  // Add address options
  addresses.forEach(address => {
    const option = document.createElement('option');
    option.value = address;
    option.textContent = address;
    addressFilter.appendChild(option);
  });
}

/**
 * Search suppliers
 */
function searchSuppliers(query) {
  applyFilters();

  currentPage = 1;
  const start = 0;
  const end = pageSize;
  renderSuppliers(filteredSuppliers.slice(start, end));

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
  setupPagination(totalPages, 1);
}

/**
 * Filter by address
 */
function filterByAddress(address) {
  applyFilters();

  currentPage = 1;
  const start = 0;
  const end = pageSize;
  renderSuppliers(filteredSuppliers.slice(start, end));

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
  setupPagination(totalPages, 1);
}

/**
 * Delete a supplier
 */
async function deleteSupplier(id, name) {
  UIModule.showConfirmModal(
    'تأكيد الحذف',
    `هل أنت متأكد من رغبتك في حذف "${name}"؟`,
    async () => {
      const btn = document.querySelector('[onclick*="' + id + '"]');
      if (btn) {
        UIModule.showLoading(btn);
      }

      try {
        await suppliersModule.deleteSupplier(id);
        UIModule.showToast('تم حذف الموردين بنجاح ✓', 'success');
        loadSuppliers(currentPage);
      } catch (error) {
        UIModule.showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  );
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await authModule.signOut();
    UIModule.showToast('تم تسجيل الخروج', 'success', 1500);
    setTimeout(() => {
      window.location.replace('login.html');
    }, 1500);
  } catch (error) {
    UIModule.showToast('خطأ في تسجيل الخروج', 'error');
  }
}

/**
 * Format phone for display
 */
function formatPhoneDisplay(phone) {
  if (!phone) return '-';
  // Format as: 0XX-XXXX-XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    const last10 = cleaned.slice(-10);
    return `0${last10.slice(0, 2)}-${last10.slice(2, 6)}-${last10.slice(6)}`;
  }
  return phone;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Initialize page
 */
async function initPage() {
  await waitForDependencies();

  // Check authentication
  const isAuth = await checkAuth();
  if (!isAuth) return;

  // Load suppliers
  await loadSuppliers();

  // Setup search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchSuppliers(e.target.value);
    });
  }

  // Setup address filter
  const addressFilter = document.getElementById('addressFilter');
  if (addressFilter) {
    addressFilter.addEventListener('change', (e) => {
      filterByAddress(e.target.value);
    });
  }

  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Refresh data every 30 seconds
  setInterval(() => {
    loadSuppliers(currentPage);
  }, 30000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
