/*
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navMenu");

  // تأمين في حالة الموبايل فقط
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
});
 */
/**
 * Landing Page Script
 * Handles supplier display and search
 */

let allSuppliers = [];
let filteredSuppliers = [];
let currentPage = 1;
const pageSize = 12; // For landing page, show more per page

// Wait for Supabase to be available
function waitForSupabase() {
  return new Promise((resolve) => {
    const checkSupabase = () => {
      if (window.supabaseClient && window.suppliersModule) {
        resolve();
      } else {
        setTimeout(checkSupabase, 100);
      }
    };
    checkSupabase();
  });
}

/**
 * Load suppliers from Supabase
 */
async function loadSuppliers() {
  try {
    allSuppliers = await suppliersModule.getAllSuppliers();
    applyFilters();
    renderSuppliers(filteredSuppliers);
    populateCityFilter(allSuppliers);
  } catch (error) {
    console.error('Error loading suppliers:', error);
    UIModule.showToast('خطأ في تحميل البيانات: ' + error.message, 'error');
    document.getElementById('suppliersContainer').innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600 font-semibold">حدث خطأ في تحميل البيانات</p>
        <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          إعادة محاولة
        </button>
      </div>
    `;
  }
}

/**
 * Render suppliers in the grid
 */
function renderSuppliers(suppliers) {
  const container = document.getElementById('suppliersContainer');
  const emptyState = document.getElementById('emptyState');

  if (suppliers.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = suppliers.map(supplier => createSupplierCard(supplier)).join('');
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category) {
  const categoryMap = {
    // Food & Beverage
    food_supplies: 'مواد غذائية',
    beverages: 'مشروبات',
    meat_poultry: 'لحوم ودواجن',
    seafood: 'أسماك ومأكولات بحرية',
    bakery: 'مخبوزات',
    dairy: 'ألبان ومنتجاتها',
    fruits_vegetables: 'خضروات وفاكهة',

    // Housekeeping
    cleaning_supplies: 'مواد تنظيف',
    laundry_services: 'مغاسل وكي الملابس',
    amenities: 'مستلزمات غرف النزلاء',

    // Maintenance & Engineering
    electrical: 'كهرباء',
    plumbing: 'سباكة',
    hvac: 'تكييف وتبريد',
    construction: 'مقاولات وإنشاءات',
    spare_parts: 'قطع غيار وصيانة',

    // Furniture & Equipment
    furniture: 'أثاث فندقي',
    kitchen_equipment: 'معدات مطابخ',
    laundry_equipment: 'معدات مغاسل',
    electronics: 'أجهزة إلكترونية',
    it_systems: 'أنظمة وشبكات IT',

    // Security & Safety
    security_services: 'خدمات أمن',
    fire_safety: 'أنظمة إطفاء وحريق',
    cctv: 'كاميرات مراقبة',

    // Services
    transportation: 'نقل ولوجستيات',
    waste_management: 'إدارة مخلفات',
    pest_control: 'مكافحة آفات',
    medical_supplies: 'مستلزمات طبية',

    // Marketing & Operations
    printing: 'طباعة ودعاية',
    uniforms: 'زي موحد للموظفين',
    event_services: 'تنظيم مؤتمرات وحفلات',

    // Other
    other: 'أخرى'
  };

  return categoryMap[category] || 'غير محدد';
}


/**
 * Create a supplier card HTML element
 */
function createSupplierCard(supplier) {
  return `
    <div class="supplier-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg fade-in">
      <div class="relative">
        <img src="https://i.ibb.co/wF501f6F/images.png" alt="images" border="0"></a>
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div class="p-6">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-xl font-bold text-gray-900 mb-1">${escapeHtml(supplier.company_name)}</h3>
          <p class="text-sm text-gray-600 mb-1">${escapeHtml(supplier.responsible_person_name)}</p>
          ${supplier.category ? `<span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">${getCategoryDisplayName(supplier.category)}</span>` : ''}
          <p class="text-sm text-gray-500">${supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('ar-EG') : ''}</p>
        </div>

        <!-- Address -->
        <div class="mb-4 pb-4 border-b border-gray-200">
          <p class="text-sm text-gray-700">
            <span class="font-semibold">العنوان:</span> ${escapeHtml(supplier.address)}
          </p>
        </div>

        <!-- Contact Details -->
        <div class="space-y-3">
          <!-- Mobile 1 -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.321.844.773 1.612 1.402 2.24.63.63 1.396 1.082 2.24 1.402l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2.694a13 13 0 01-13-13V3z"></path>
            </svg>
            <a href="tel:${formatPhoneForLink(supplier.mobile_1)}" class="text-blue-600 hover:text-blue-800 transition">
              ${UIModule.formatPhone(supplier.mobile_1)}
            </a>
            <button onclick="copyToClipboard('${supplier.mobile_1}')" class="ml-2 p-1 text-gray-400 hover:text-gray-600 transition" title="نسخ">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 000 2h.093l.812 4.406a.5.5 0 01-.492.594h-.383A1.75 1.75 0 006.25 10.5v6A1.75 1.75 0 008 18.25h8a1.75 1.75 0 001.75-1.75v-6a1.75 1.75 0 00-1.75-1.75h-.383a.5.5 0 01-.492-.594L14.907 4h.093a1 1 0 000-2H8zm0 7.5a.75.75 0 100 1.5h8a.75.75 0 100-1.5H8z"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile 2 -->
          ${supplier.mobile_2 ? `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.321.844.773 1.612 1.402 2.24.63.63 1.396 1.082 2.24 1.402l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2.694a13 13 0 01-13-13V3z"></path>
              </svg>
              <a href="tel:${formatPhoneForLink(supplier.mobile_2)}" class="text-blue-600 hover:text-blue-800 transition">
                ${UIModule.formatPhone(supplier.mobile_2)}
              </a>
              <button onclick="copyToClipboard('${supplier.mobile_2}')" class="ml-2 p-1 text-gray-400 hover:text-gray-600 transition" title="نسخ">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2a1 1 0 000 2h.093l.812 4.406a.5.5 0 01-.492.594h-.383A1.75 1.75 0 006.25 10.5v6A1.75 1.75 0 008 18.25h8a1.75 1.75 0 001.75-1.75v-6a1.75 1.75 0 00-1.75-1.75h-.383a.5.5 0 01-.492-.594L14.907 4h.093a1 1 0 000-2H8zm0 7.5a.75.75 0 100 1.5h8a.75.75 0 100-1.5H8z"></path>
                </svg>
              </button>
            </div>
          ` : ''}

          <!-- Email -->
          ${supplier.email ? `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <a href="mailto:${supplier.email}" class="text-blue-600 hover:text-blue-800 transition break-all">
                ${escapeHtml(supplier.email)}
              </a>
              <button onclick="copyToClipboard('${supplier.email}')" class="ml-2 p-1 text-gray-400 hover:text-gray-600 transition" title="نسخ">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2a1 1 0 000 2h.093l.812 4.406a.5.5 0 01-.492.594h-.383A1.75 1.75 0 006.25 10.5v6A1.75 1.75 0 008 18.25h8a1.75 1.75 0 001.75-1.75v-6a1.75 1.75 0 00-1.75-1.75h-.383a.5.5 0 01-.492-.594L14.907 4h.093a1 1 0 000-2H8zm0 7.5a.75.75 0 100 1.5h8a.75.75 0 100-1.5H8z"></path>
                </svg>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Apply filters (search and city)
 */
function applyFilters() {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const cityFilter = document.getElementById('cityFilter').value.trim();

  filteredSuppliers = allSuppliers.filter(supplier => {
    // Search filter
    const matchesSearch = !searchQuery || (
      supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.responsible_person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.mobile_1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.mobile_2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // City filter
    const matchesCity = !cityFilter || supplier.city === cityFilter;

    return matchesSearch && matchesCity;
  });
}

/**
 * Populate city filter dropdown
 */
function populateCityFilter(suppliers) {
  const cityFilter = document.getElementById('cityFilter');
  const cities = [...new Set(suppliers.map(s => s.city).filter(c => c))].sort();

  // Clear existing options except "جميع المدن"
  cityFilter.innerHTML = '<option value="">جميع المدن</option>';

  // Add city options
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

/**
 * Search suppliers
 */
function searchSuppliers(query) {
  applyFilters();
  renderSuppliers(filteredSuppliers);
}

/**
 * Filter by city
 */
function filterByCity(city) {
  applyFilters();
  renderSuppliers(filteredSuppliers);
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    UIModule.showToast('تم النسخ بنجاح ✓', 'success', 2000);
  }).catch(() => {
    UIModule.showToast('فشل النسخ', 'error');
  });
}

/**
 * Format phone number for tel: link
 */
function formatPhoneForLink(phone) {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // If 10 digits, prepend 20 for Egypt
  if (cleaned.length === 10) {
    return '+20' + cleaned;
  }
  // If 11 digits starting with 0, replace with 20
  if (cleaned.length === 11 && cleaned[0] === '0') {
    return '+20' + cleaned.slice(1);
  }
  // If 12 digits with 201, add +
  if (cleaned.length === 12 && cleaned.startsWith('201')) {
    return '+' + cleaned;
  }
  return '+' + cleaned;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
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
  await waitForSupabase();
  await loadSuppliers();

  // Setup search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchSuppliers(e.target.value);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
