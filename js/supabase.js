// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://wskskkfthxcintyfijpw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nwldpv6Hcr3GyYXT0Pgryw_hJ8qafnq';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabaseClient = supabaseClient;

/**
 * Helper function to handle Supabase errors
 */
function handleSupabaseError(error) {
  console.error('Supabase error:', error);
  return {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR'
  };
}

/**
 * Helper to format API responses
 */
function formatResponse(data, error) {
  if (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      data: null
    };
  }
  return {
    success: true,
    error: null,
    data
  };
}

// Export helpers
window.supabaseHelpers = {
  handleSupabaseError,
  formatResponse,
  supabaseClient: () => supabaseClient
};
