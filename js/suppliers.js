/**
 * Suppliers Module
 * Handles CRUD operations for suppliers
 */

const suppliersModule = {
  TABLE_NAME: 'suppliers',

  /**
   * Fetch all suppliers
   */
  async getAllSuppliers() {
    const { data, error } = await supabaseClient
      .from(this.TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  },

  /**
   * Fetch suppliers with pagination
   */
  async getSuppliers(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabaseClient
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      pages: Math.ceil((count || 0) / pageSize)
    };
  },

  /**
   * Search suppliers by name or phone
   */
  async searchSuppliers(query) {
    if (!query || query.trim().length === 0) {
      return this.getAllSuppliers();
    }

    const cleanQuery = query.toLowerCase().trim();

    const { data, error } = await supabaseClient
      .from(this.TABLE_NAME)
      .select('*')
      .or(`company_name.ilike.%${cleanQuery}%,responsible_person_name.ilike.%${cleanQuery}%,mobile_1.ilike.%${cleanQuery}%,mobile_2.ilike.%${cleanQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  /**
   * Get a single supplier by ID
   */
  async getSupplierById(id) {
    const { data, error } = await supabaseClient
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  /**
   * Create a new supplier
   */
  async createSupplier(supplier) {
    this.validateSupplier(supplier);

    const { data, error } = await supabaseClient
      .from(this.TABLE_NAME)
      .insert([{
        company_name: supplier.company_name.trim(),
        responsible_person_name: supplier.responsible_person_name.trim(),
        address: supplier.address.trim(),
        mobile_1: supplier.mobile_1.trim(),
        mobile_2: supplier.mobile_2?.trim() || null,
        email: supplier.email?.trim() || null,
        category: supplier.category?.trim() || null
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data?.[0] || null;
  },

  /**
   * Update an existing supplier
   */
  async updateSupplier(id, supplier) {
    this.validateSupplier(supplier);

    const { data, error } = await supabaseClient
      .from(this.TABLE_NAME)
      .update({
        company_name: supplier.company_name.trim(),
        responsible_person_name: supplier.responsible_person_name.trim(),
        address: supplier.address.trim(),
        mobile_1: supplier.mobile_1.trim(),
        mobile_2: supplier.mobile_2?.trim() || null,
        email: supplier.email?.trim() || null,
        category: supplier.category?.trim() || null
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data?.[0] || null;
  },

  /**
   * Delete a supplier
   */
  async deleteSupplier(id) {
    const { error } = await supabaseClient
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  },

  /**
   * Validate supplier data
   */
  validateSupplier(supplier) {
    // Company name validation
    if (!supplier.company_name || supplier.company_name.trim().length === 0) {
      throw new Error('Company name is required');
    }

    // Responsible person name validation
    if (!supplier.responsible_person_name || supplier.responsible_person_name.trim().length === 0) {
      throw new Error('Responsible person name is required');
    }

    // Address validation
    if (!supplier.address || supplier.address.trim().length === 0) {
      throw new Error('Address is required');
    }

    // Mobile 1 validation
    if (!supplier.mobile_1 || supplier.mobile_1.trim().length === 0) {
      throw new Error('Primary mobile number is required');
    }

    // Validate Egyptian phone format (optional but recommended)
    // Format: +20xxxxxxx or 0xxxxxxx
    if (!this.isValidEgyptianPhone(supplier.mobile_1)) {
      throw new Error('Invalid mobile number format (use 01x-xxxx-xxxx)');
    }

    // Validate Mobile 2 if provided
    if (supplier.mobile_2 && supplier.mobile_2.trim().length > 0) {
      if (!this.isValidEgyptianPhone(supplier.mobile_2)) {
        throw new Error('Invalid secondary mobile number format');
      }
    }

    // Email validation if provided
    if (supplier.email && supplier.email.trim().length > 0) {
      if (!this.isValidEmail(supplier.email)) {
        throw new Error('Invalid email address');
      }
    }
  },

  /**
   * Validate Egyptian phone number format
   * Accepts: 01x-xxxx-xxxx, 01xxxxxxxxx, +201xxxxxxxxx
   */
  isValidEgyptianPhone(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Must be exactly 11 digits for Egyptian format (01xxxxxxxxx)
    if (cleaned.length !== 11) {
      return false;
    }
    
    // Must start with 01 (without country code)
    if (!cleaned.startsWith('01')) {
      return false;
    }
    
    // Must contain only digits
    return /^\d+$/.test(cleaned);
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Export suppliers module
window.suppliersModule = suppliersModule;
