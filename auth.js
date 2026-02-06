/**
 * Authentication Module
 * Handles login, logout, and session management
 */

const authModule = {
  /**
   * Sign up a new admin user
   */
  async signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      return null;
    }
    
    return user;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      return null;
    }
    
    return session;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * Reset password
   */
  async resetPassword(email) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/public/update-password.html'
    });
    
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }
};

// Export auth module
window.authModule = authModule;
