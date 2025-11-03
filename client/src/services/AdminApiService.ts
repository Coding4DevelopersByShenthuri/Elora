/**
 * Admin API Service
 * Handles all admin-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthToken = (): string | null => {
  const token = localStorage.getItem('speakbee_auth_token');
  // Don't use local-token for admin API calls - it means we need a real server token
  if (token === 'local-token' || !token) {
    return null;
  }
  return token;
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Always add Authorization header if we have a valid token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Sending request with Authorization header to:', endpoint);
  } else {
    // If no token, this will fail with 401 - that's expected
    console.warn('⚠️ No authentication token found. Make sure you are logged in.');
    console.warn('Current localStorage token:', localStorage.getItem('speakbee_auth_token'));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      // Log the error for debugging
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error('❌ Admin API Error:', {
        endpoint,
        status: response.status,
        error: error
      });
      
      // If 401, log token info for debugging
      if (response.status === 401) {
        console.error('🔒 401 Unauthorized - Token info:', {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPrefix: token?.substring(0, 20),
          allTokens: {
            speakbee_auth_token: localStorage.getItem('speakbee_auth_token')?.substring(0, 20),
            speakbee_is_admin: localStorage.getItem('speakbee_is_admin')
          }
        });
      }
      
      throw { response: { data: error, status: response.status } };
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' || error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw {
        response: {
          data: {
            message: 'Cannot connect to server. Please make sure the backend server is running on http://localhost:8000'
          },
          status: 0
        }
      };
    }
    throw error;
  }
};

export const AdminAPI = {
  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async (params?: { months?: number }) => {
    try {
      const query = params?.months ? `?months=${params.months}` : '';
      const result = await fetchWithAuth(`admin/dashboard/stats${query}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      // Handle 401 Unauthorized specifically
      if (error?.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('speakbee_auth_token');
        localStorage.removeItem('speakbee_is_admin');
        return {
          success: false,
          message: 'Authentication expired. Please log in again.',
          error: error,
          requiresLogin: true
        };
      }
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch dashboard stats',
        error: error
      };
    }
  },

  /**
   * Get list of users
   */
  getUsers: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    level?: string;
    active?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.level) queryParams.append('level', params.level);
      if (params?.active) queryParams.append('active', params.active);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/users${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch users',
        error: error
      };
    }
  },

  /**
   * Get user details
   */
  getUser: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/users/${userId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch user',
        error: error
      };
    }
  },

  /**
   * Update user
   */
  updateUser: async (userId: number, data: any) => {
    try {
      const result = await fetchWithAuth(`admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update user',
        error: error
      };
    }
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/users/${userId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to deactivate user',
        error: error
      };
    }
  },

  /**
   * Create superuser
   */
  createSuperuser: async (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      const result = await fetchWithAuth('admin/users/create-superuser', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create superuser',
        error: error
      };
    }
  },

  /**
   * Get analytics data
   */
  getAnalytics: async (days: number = 30) => {
    try {
      const result = await fetchWithAuth(`admin/analytics?days=${days}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch analytics',
        error: error
      };
    }
  }
};

export default AdminAPI;

