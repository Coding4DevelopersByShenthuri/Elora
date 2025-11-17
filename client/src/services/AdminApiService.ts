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
    ...((options.headers as Record<string, string>) || {}),
  };
  
  // Only set Content-Type if it's not FormData (for file uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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
   * Get platform settings
   */
  getSettings: async () => {
    try {
      const result = await fetchWithAuth('admin/settings');
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch settings',
        error,
      };
    }
  },

  /**
   * Update platform settings (partial update)
   */
  updateSettings: async (data: Record<string, any>) => {
    try {
      const result = await fetchWithAuth('admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update settings',
        error,
      };
    }
  },

  /**
   * Upload admin avatar
   */
  uploadAvatar: async (avatarData: string) => {
    try {
      // Increase timeout for large base64 data (30 seconds)
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📤 Uploading avatar to server...', { 
        dataLength: avatarData.length,
        preview: avatarData.substring(0, 50) + '...'
      });

      const response = await fetch(`${API_BASE_URL}/admin/avatar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ avatar: avatarData }),
        signal: AbortSignal.timeout(30000), // 30 second timeout for large files
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        console.error('❌ Avatar upload failed:', {
          status: response.status,
          error: error
        });
        throw { 
          response: { 
            data: error, 
            status: response.status 
          } 
        };
      }

      const result = await response.json();
      console.log('✅ Avatar upload successful:', result);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Failed to upload avatar. Please check your connection and try again.';
      return {
        success: false,
        message: errorMessage,
        error,
      };
    }
  },

  /**
   * Remove admin avatar
   */
  removeAvatar: async () => {
    try {
      const result = await fetchWithAuth('admin/avatar', {
        method: 'DELETE',
      });
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to remove avatar',
        error,
      };
    }
  },
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
        // Clear admin flag but preserve auth token to prevent unwanted logout
        // The token might still be valid for regular user operations
        // Only clear token if it's explicitly invalidated by the server
        localStorage.removeItem('speakbee_is_admin');
        console.warn('Admin access denied - clearing admin flag but preserving user session');
        return {
          success: false,
          message: 'Admin access expired. Please log in again.',
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
   * Get detailed information for a specific activity
   */
  getActivityDetail: async (activityId: string) => {
    try {
      const result = await fetchWithAuth(`admin/activities/${activityId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch activity details',
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
  },

  /**
   * Get list of lessons for admin management
   */
  getLessons: async (params?: {
    lesson_type?: string;
    content_type?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.lesson_type) queryParams.append('lesson_type', params.lesson_type);
      if (params?.content_type) queryParams.append('content_type', params.content_type);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/lessons${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch lessons',
        error: error
      };
    }
  },

  /**
   * Get lesson statistics
   */
  getLessonsStats: async () => {
    try {
      const result = await fetchWithAuth('admin/lessons/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch lesson statistics',
        error: error
      };
    }
  },

  /**
   * Get a specific lesson by ID
   */
  getLesson: async (lessonId: number) => {
    try {
      const result = await fetchWithAuth(`admin/lessons/${lessonId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch lesson',
        error: error
      };
    }
  },

  /**
   * Create a new lesson
   */
  createLesson: async (data: any) => {
    try {
      const result = await fetchWithAuth('admin/lessons/create', {
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
        message: error?.response?.data?.message || 'Failed to create lesson',
        error: error
      };
    }
  },

  /**
   * Update a lesson
   */
  updateLesson: async (lessonId: number, data: any) => {
    try {
      const result = await fetchWithAuth(`admin/lessons/${lessonId}`, {
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
        message: error?.response?.data?.message || 'Failed to update lesson',
        error: error
      };
    }
  },

  /**
   * Delete (deactivate) a lesson
   */
  deleteLesson: async (lessonId: number) => {
    try {
      const result = await fetchWithAuth(`admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete lesson',
        error: error
      };
    }
  },

  /**
   * Get list of practice sessions for admin
   */
  getPracticeSessions: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    session_type?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.session_type) queryParams.append('session_type', params.session_type);
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/practice${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch practice sessions',
        error: error
      };
    }
  },

  /**
   * Get practice session statistics
   */
  getPracticeStats: async () => {
    try {
      const result = await fetchWithAuth('admin/practice/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch practice statistics',
        error: error
      };
    }
  },

  /**
   * Get detailed information about a specific practice session
   */
  getPracticeSession: async (sessionId: number) => {
    try {
      const result = await fetchWithAuth(`admin/practice/${sessionId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch practice session',
        error: error
      };
    }
  },

  /**
   * Get list of lesson progress for admin
   */
  getProgressRecords: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    user_id?: string;
    lesson_id?: string;
    lesson_type?: string;
    content_type?: string;
    completed?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      if (params?.lesson_id) queryParams.append('lesson_id', params.lesson_id);
      if (params?.lesson_type) queryParams.append('lesson_type', params.lesson_type);
      if (params?.content_type) queryParams.append('content_type', params.content_type);
      if (params?.completed) queryParams.append('completed', params.completed);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/progress${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch progress records',
        error: error
      };
    }
  },

  /**
   * Get progress statistics
   */
  getProgressStats: async () => {
    try {
      const result = await fetchWithAuth('admin/progress/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch progress statistics',
        error: error
      };
    }
  },

  /**
   * Get detailed information about a specific progress record
   */
  getProgressRecord: async (progressId: number) => {
    try {
      const result = await fetchWithAuth(`admin/progress/${progressId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch progress record',
        error: error
      };
    }
  },

  /**
   * Get list of vocabulary words for admin
   */
  getVocabularyWords: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    user_id?: string;
    category?: string;
    difficulty?: string;
    mastery_min?: string;
    mastery_max?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params?.mastery_min) queryParams.append('mastery_min', params.mastery_min);
      if (params?.mastery_max) queryParams.append('mastery_max', params.mastery_max);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/vocabulary${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch vocabulary words',
        error: error
      };
    }
  },

  /**
   * Get vocabulary statistics
   */
  getVocabularyStats: async () => {
    try {
      const result = await fetchWithAuth('admin/vocabulary/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch vocabulary statistics',
        error: error
      };
    }
  },

  /**
   * Get detailed information about a specific vocabulary word
   */
  getVocabularyWord: async (wordId: number) => {
    try {
      const result = await fetchWithAuth(`admin/vocabulary/${wordId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch vocabulary word',
        error: error
      };
    }
  },

  /**
   * Get list of achievements for admin
   */
  getAchievements: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    category?: string;
    tier?: string;
    is_active?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.tier) queryParams.append('tier', params.tier);
      if (params?.is_active) queryParams.append('is_active', params.is_active);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/achievements${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch achievements',
        error: error
      };
    }
  },

  /**
   * Get achievement statistics
   */
  getAchievementsStats: async () => {
    try {
      const result = await fetchWithAuth('admin/achievements/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch achievement statistics',
        error: error
      };
    }
  },

  /**
   * Get a specific achievement by ID
   */
  getAchievement: async (achievementId: number) => {
    try {
      const result = await fetchWithAuth(`admin/achievements/${achievementId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch achievement',
        error: error
      };
    }
  },

  /**
   * Create a new achievement
   */
  createAchievement: async (data: any) => {
    try {
      const result = await fetchWithAuth('admin/achievements/create', {
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
        message: error?.response?.data?.message || 'Failed to create achievement',
        error: error
      };
    }
  },

  /**
   * Update an achievement
   */
  updateAchievement: async (achievementId: number, data: any) => {
    try {
      const result = await fetchWithAuth(`admin/achievements/${achievementId}`, {
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
        message: error?.response?.data?.message || 'Failed to update achievement',
        error: error
      };
    }
  },

  /**
   * Delete (deactivate) an achievement
   */
  deleteAchievement: async (achievementId: number) => {
    try {
      const result = await fetchWithAuth(`admin/achievements/${achievementId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete achievement',
        error: error
      };
    }
  },

  /**
   * Get user achievements for admin
   */
  getUserAchievements: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    user_id?: string;
    achievement_id?: string;
    unlocked?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      if (params?.achievement_id) queryParams.append('achievement_id', params.achievement_id);
      if (params?.unlocked) queryParams.append('unlocked', params.unlocked);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/user-achievements${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch user achievements',
        error: error
      };
    }
  },

  /**
   * Get list of surveys for admin
   */
  getSurveys: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    completed?: string;
    age_range?: string;
    english_level?: string;
    native_language?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.completed) queryParams.append('completed', params.completed);
      if (params?.age_range) queryParams.append('age_range', params.age_range);
      if (params?.english_level) queryParams.append('english_level', params.english_level);
      if (params?.native_language) queryParams.append('native_language', params.native_language);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/surveys${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch surveys',
        error: error
      };
    }
  },

  /**
   * Get survey statistics
   */
  getSurveysStats: async () => {
    try {
      const result = await fetchWithAuth('admin/surveys/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch survey statistics',
        error: error
      };
    }
  },

  /**
   * Get detailed information about a specific survey
   */
  getSurveyDetail: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/surveys/${userId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch survey details',
        error: error
      };
    }
  },

  /**
   * Update survey data for a specific user
   */
  updateSurvey: async (userId: number, surveyData: {
    age_range?: string | null;
    native_language?: string | null;
    english_level?: string | null;
    learning_purpose?: string[];
    interests?: string[];
    mark_complete?: boolean;
    survey_completed_at?: boolean | null;
  }) => {
    try {
      const result = await fetchWithAuth(`admin/surveys/${userId}/update`, {
        method: 'PUT',
        body: JSON.stringify(surveyData),
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update survey',
        error: error
      };
    }
  },

  /**
   * Delete/reset survey data for a specific user
   */
  deleteSurvey: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/surveys/${userId}/delete`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete survey',
        error: error
      };
    }
  },

  /**
   * Get all survey step responses for a specific user
   */
  getSurveySteps: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/surveys/${userId}/steps`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch survey steps',
        error: error
      };
    }
  },

  /**
   * ============= Video Lessons Management =============
   */
  
  /**
   * Get list of video lessons for admin
   */
  getVideos: async (params?: {
    search?: string;
    page?: number;
    page_size?: number;
    difficulty?: string;
    category?: string;
    is_active?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.is_active) queryParams.append('is_active', params.is_active);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await fetchWithAuth(`admin/videos${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch videos',
        error: error
      };
    }
  },

  /**
   * Get video statistics
   */
  getVideosStats: async () => {
    try {
      const result = await fetchWithAuth('admin/videos/stats');
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch video statistics',
        error: error
      };
    }
  },

  /**
   * Get a specific video by ID
   */
  getVideo: async (videoId: number) => {
    try {
      const result = await fetchWithAuth(`admin/videos/${videoId}`);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch video',
        error: error
      };
    }
  },

  /**
   * Create a new video lesson (supports file uploads)
   */
  createVideo: async (data: any, files?: { thumbnail?: File; video_file?: File }) => {
    try {
      const formData = new FormData();
      
      // Add all data fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (key === 'tags' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Add files if provided
      if (files?.thumbnail) {
        formData.append('thumbnail', files.thumbnail);
      }
      if (files?.video_file) {
        formData.append('video_file', files.video_file);
      }
      
      const result = await fetchWithAuth('admin/videos/create', {
        method: 'POST',
        body: formData,
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create video',
        error: error
      };
    }
  },

  /**
   * Update a video lesson (supports file uploads)
   */
  updateVideo: async (videoId: number, data: any, files?: { thumbnail?: File; video_file?: File }) => {
    try {
      const formData = new FormData();
      
      // Add all data fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (key === 'tags' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Add files if provided
      if (files?.thumbnail) {
        formData.append('thumbnail', files.thumbnail);
      }
      if (files?.video_file) {
        formData.append('video_file', files.video_file);
      }
      
      const result = await fetchWithAuth(`admin/videos/${videoId}`, {
        method: 'PUT',
        body: formData,
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update video',
        error: error
      };
    }
  },

  /**
   * Delete a video lesson
   */
  deleteVideo: async (videoId: number) => {
    try {
      const result = await fetchWithAuth(`admin/videos/${videoId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete video',
        error: error
      };
    }
  },
};

export default AdminAPI;

