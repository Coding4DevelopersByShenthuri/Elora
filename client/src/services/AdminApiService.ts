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
  },

  /**
   * Get filtered admin activities list
   */
  getActivities: async (params?: {
    status?: string;
    year?: number;
    month?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/activities${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch activities',
        error: error
      };
    }
  },

  /**
   * Export filtered activities to CSV
   */
  exportActivities: async (params?: {
    status?: string;
    year?: number;
    month?: string;
    search?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month);
      if (params?.search) queryParams.append('search', params.search);
      queryParams.append('format', 'csv');

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/admin/activities${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-activities-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return {
        success: true,
        message: 'Export completed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to export activities',
        error: error
      };
    }
  },

  /**
   * Get admin notifications
   */
  getNotifications: async (params?: {
    unread_only?: boolean;
    limit?: number;
    type?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.unread_only) queryParams.append('unread_only', 'true');
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/notifications${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch notifications',
        error: error
      };
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: number) => {
    try {
      const result = await fetchWithAuth(`admin/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to mark notification as read',
        error: error
      };
    }
  },

  /**
   * Create a test notification (for testing purposes)
   */
  createTestNotification: async (data?: {
    type?: string;
    priority?: string;
    title?: string;
    message?: string;
    link?: string;
  }) => {
    try {
      const result = await fetchWithAuth('admin/notifications/test', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create test notification',
        error: error
      };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async () => {
    try {
      const result = await fetchWithAuth('admin/notifications/mark-all-read', {
        method: 'POST',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to mark all notifications as read',
        error: error
      };
    }
  },

  /**
   * Get unread count only (lightweight polling)
   */
  getUnreadCount: async () => {
    try {
      const result = await fetchWithAuth('admin/notifications/unread-count');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch unread count',
        error: error
      };
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: number) => {
    try {
      const result = await fetchWithAuth(`admin/notifications/${notificationId}/delete`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete notification',
        error: error
      };
    }
  },

  /**
   * Bulk delete notifications
   */
  bulkDeleteNotifications: async (notificationIds: number[]) => {
    try {
      const result = await fetchWithAuth('admin/notifications/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: notificationIds }),
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete notifications',
        error: error
      };
    }
  },

  /**
   * Health check for platform status
   * Note: Health endpoint doesn't require auth, so we call it directly
   */
  getHealth: async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch health status',
        error: error
      };
    }
  }
};

export default AdminAPI;

