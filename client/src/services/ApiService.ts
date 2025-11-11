/**
 * API Service for Server Integration
 * Handles all HTTP requests to the Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('speakbee_auth_token');
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const errorData = error.response.data || {};
    let errorMessage = errorData.message || 'An error occurred';
    
    // Handle timeout errors with better messaging
    if (error.response.status === 408) {
      errorMessage = errorData.message || 'Request timed out. Please check your internet connection and try again.';
    }
    
    // If there are field-specific errors, extract them
    if (errorData.errors) {
      const errorKeys = Object.keys(errorData.errors);
      if (errorKeys.length > 0) {
        const firstError = errorData.errors[errorKeys[0]];
        // If it's an array of errors, get the first one
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = firstError;
        }
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      errors: errorData.errors || null,
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      message: 'No response from server. Please check your connection.',
      errors: null,
      status: 0
    };
  } else {
    // Error in request setup
    return {
      success: false,
      message: error.message || 'An error occurred',
      errors: null,
      status: 0
    };
  }
};

// Helper function for fetch requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, timeoutMs: number = 15000) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && token !== 'local-token') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs), // Configurable timeout
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw { response: { data: error, status: response.status } };
    }

    return response.json();
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw {
        response: {
          data: { message: 'Request timed out. The server may be slow or the email service is taking longer than expected. Please try again.' },
          status: 408
        }
      };
    }
    // If it's a network error, return offline error
    if (error.name === 'TypeError') {
      throw {
        response: {
          data: { message: 'Server not reachable. Please verify your internet connection and that the Elora backend is running.' },
          status: 0
        }
      };
    }
    throw error;
  }
};


// ============= Authentication API =============
export const AuthAPI = {
  /**
   * Register new user
   */
  register: async (data: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => {
    try {
      // Use longer timeout for registration (20 seconds) since it includes email sending
      const result = await fetchWithAuth('auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 20000); // 20 second timeout for registration
      
      // CRITICAL: Only store token if account is verified
      // Unverified accounts should NOT be logged in
      if (result.token && result.verified === true) {
        localStorage.setItem('speakbee_auth_token', result.token);
      } else if (result.token) {
        // If token exists but user is not verified, DO NOT store it
        console.log('Registration successful but account not verified - not storing token');
      }
      
      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Login user
   */
  login: async (data: { email: string; password: string }) => {
    try {
      // Use standard timeout for login (15 seconds)
      const result = await fetchWithAuth('auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 15000);
      
      // Store token
      if (result.token) {
        localStorage.setItem('speakbee_auth_token', result.token);
      }
      
      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Authenticate with Google OAuth token
   */
  googleAuth: async (token: string) => {
    try {
      // Use standard timeout for Google auth (15 seconds)
      const result = await fetchWithAuth('auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }, 15000);
      
      // Store token
      if (result.token) {
        localStorage.setItem('speakbee_auth_token', result.token);
      }
      
      return {
        success: result.success || true,
        data: result,
        message: result.message || 'Google authentication successful'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const result = await fetchWithAuth('auth/profile');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: any) => {
    try {
      const result = await fetchWithAuth('auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Save individual survey step
   */
  saveSurveyStep: async (stepName: string, stepNumber: number, responseData: any) => {
    try {
      const payload = {
        step_name: stepName,
        step_number: stepNumber,
        response_data: responseData
      };
      const result = await fetchWithAuth('survey/step', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get current user info
   */
  getUserInfo: async () => {
    try {
      const result = await fetchWithAuth('auth/user');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout (clear local tokens)
   */
  logout: () => {
    localStorage.removeItem('speakbee_auth_token');
    localStorage.removeItem('speakbee_current_user');
  }
};

// ============= Admin API =============
export const AdminAPI = {
  /**
   * Get users (admin-only), supports search by email/username
   */
  getUsers: async (params?: { search?: string; page?: number; page_size?: number }) => {
    try {
      const usp = new URLSearchParams();
      if (params?.search) usp.append('search', params.search);
      if (params?.page) usp.append('page', String(params.page));
      if (params?.page_size) usp.append('page_size', String(params.page_size));
      const query = usp.toString() ? `?${usp.toString()}` : '';
      const result = await fetchWithAuth(`admin/users${query}`);
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user detail by id (admin-only)
   */
  getUserDetail: async (userId: number) => {
    try {
      const result = await fetchWithAuth(`admin/users/${userId}`);
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user by id (admin-only) — can set is_staff/is_superuser
   */
  updateUser: async (userId: number, data: any) => {
    try {
      const result = await fetchWithAuth(`admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============= User Notifications API =============
export const NotificationsAPI = {
  /**
   * Fetch notifications for authenticated user
   */
  list: async (params?: { unreadOnly?: boolean; limit?: number }) => {
    try {
      const usp = new URLSearchParams();
      if (params?.unreadOnly) usp.append('unread_only', 'true');
      if (params?.limit !== undefined) usp.append('limit', String(params.limit));
      const query = usp.toString() ? `?${usp.toString()}` : '';
      const result = await fetchWithAuth(`notifications${query}`);
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a user notification (client-triggered event)
   */
  create: async (data: {
    notification_type?: string;
    title: string;
    message: string;
    icon?: string;
    action_url?: string;
    event_key?: string;
    metadata?: Record<string, unknown>;
  }) => {
    try {
      const payload = {
        notification_type: data.notification_type || 'system',
        title: data.title,
        message: data.message,
        icon: data.icon,
        action_url: data.action_url,
        event_key: data.event_key,
        metadata: data.metadata ?? {},
      };
      const result = await fetchWithAuth('notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get unread count
   */
  unreadCount: async () => {
    try {
      const result = await fetchWithAuth('notifications/unread-count');
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark notification read/unread
   */
  markRead: async (notificationId: number, isRead: boolean = true) => {
    try {
      const result = await fetchWithAuth(`notifications/${notificationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ is_read: isRead }),
      });
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async () => {
    try {
      const result = await fetchWithAuth('notifications/mark-all-read', {
        method: 'POST',
      });
      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete notification
   */
  delete: async (notificationId: number) => {
    try {
      await fetchWithAuth(`notifications/${notificationId}/delete`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },
};


// ============= Lessons API =============
export const LessonsAPI = {
  /**
   * Get all lessons
   */
  getAll: async (filters?: { type?: string; content?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.content) params.append('content', filters.content);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await fetchWithAuth(`lessons/${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get lesson by slug
   */
  getBySlug: async (slug: string) => {
    try {
      const result = await fetchWithAuth(`lessons/${slug}/`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Progress API =============
export const ProgressAPI = {
  /**
   * Get my progress
   */
  getMyProgress: async (type?: string) => {
    try {
      const query = type ? `?type=${type}` : '';
      const result = await fetchWithAuth(`progress/${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record lesson progress
   */
  recordLesson: async (data: {
    lesson: number;
    completed?: boolean;
    score: number;
    time_spent_minutes: number;
    pronunciation_score?: number;
    fluency_score?: number;
    accuracy_score?: number;
    grammar_score?: number;
    details?: any;
  }) => {
    try {
      const result = await fetchWithAuth('progress/record', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record practice session
   */
  recordPractice: async (data: {
    session_type: string;
    lesson?: number;
    duration_minutes: number;
    score: number;
    points_earned: number;
    words_practiced?: number;
    sentences_practiced?: number;
    mistakes_count?: number;
    details?: any;
  }) => {
    try {
      const result = await fetchWithAuth('practice/record', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get practice history
   */
  getPracticeHistory: async (limit: number = 50, type?: string) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (type) params.append('type', type);
      
      const result = await fetchWithAuth(`practice/history?${params.toString()}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Vocabulary API =============
export const VocabularyAPI = {
  /**
   * Get user's vocabulary
   */
  getAll: async (filters?: { category?: string; min_mastery?: number }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.min_mastery) params.append('min_mastery', filters.min_mastery.toString());
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await fetchWithAuth(`vocabulary/${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add or update vocabulary word
   */
  addWord: async (data: {
    word: string;
    definition?: string;
    example_sentence?: string;
    difficulty?: number;
    category?: string;
    is_correct?: boolean;
  }) => {
    try {
      const result = await fetchWithAuth('vocabulary/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update vocabulary word
   */
  updateWord: async (wordId: number, data: any) => {
    try {
      const result = await fetchWithAuth(`vocabulary/${wordId}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete vocabulary word
   */
  deleteWord: async (wordId: number) => {
    try {
      await fetchWithAuth(`vocabulary/${wordId}/`, {
        method: 'DELETE',
      });
      
      return {
        success: true,
        message: 'Word deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Achievements API =============
export const AchievementsAPI = {
  /**
   * Get all available achievements
   */
  getAll: async (filters?: { category?: string; tier?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tier) params.append('tier', filters.tier);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await fetchWithAuth(`achievements/${query}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get my achievements with progress
   */
  getMy: async () => {
    try {
      const result = await fetchWithAuth('achievements/my');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check for new achievements
   */
  check: async () => {
    try {
      const result = await fetchWithAuth('achievements/check', {
        method: 'POST',
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Statistics API =============
export const StatsAPI = {
  /**
   * Get user statistics
   */
  getUserStats: async () => {
    try {
      const result = await fetchWithAuth('stats/user');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get daily progress
   */
  getDailyProgress: async (days: number = 30) => {
    try {
      const result = await fetchWithAuth(`stats/daily?days=${days}`);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Kids API (Keep existing compatibility) =============
export const KidsAPI = {
  /**
   * Get kids lessons
   */
  getLessons: async () => {
    try {
      const result = await fetchWithAuth('kids/lessons');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get kids progress
   */
  getProgress: async () => {
    try {
      const result = await fetchWithAuth('kids/progress');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update kids progress
   */
  updateProgress: async (data: { points?: number; streak?: number; details?: any }) => {
    try {
      const result = await fetchWithAuth('kids/progress/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get kids achievements
   */
  getAchievements: async () => {
    try {
      const result = await fetchWithAuth('kids/achievements');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get story enrollments
   */
  getStoryEnrollments: async () => {
    try {
      const result = await fetchWithAuth('kids/stories/enrollments');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Enroll in a story
   */
  enrollInStory: async (data: {
    story_id: string;
    story_title: string;
    story_type: string;
    score?: number;
  }) => {
    try {
      const result = await fetchWithAuth('kids/stories/enroll', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get story words
   */
  getStoryWords: async (storyId?: string) => {
    try {
      const query = storyId ? `?story_id=${storyId}` : '';
      const result = await fetchWithAuth(`kids/stories/words${query}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get story phrases
   */
  getStoryPhrases: async (storyId?: string) => {
    try {
      const query = storyId ? `?story_id=${storyId}` : '';
      const result = await fetchWithAuth(`kids/stories/phrases${query}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add/remove favorite story
   */
  toggleFavorite: async (storyId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        const result = await fetchWithAuth('kids/favorites', {
          method: 'POST',
          body: JSON.stringify({ story_id: storyId }),
        });
        return {
          success: true,
          data: result
        };
      } else {
        const result = await fetchWithAuth('kids/favorites', {
          method: 'DELETE',
          body: JSON.stringify({ story_id: storyId }),
        });
        return {
          success: true,
          data: result
        };
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get favorites
   */
  getFavorites: async () => {
    try {
      const result = await fetchWithAuth('kids/favorites');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record vocabulary practice
   */
  recordVocabularyPractice: async (data: {
    word: string;
    story_id?: string;
    score?: number;
  }) => {
    try {
      const result = await fetchWithAuth('kids/vocabulary/practice', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record pronunciation practice
   */
  recordPronunciationPractice: async (data: {
    phrase: string;
    story_id?: string;
    score?: number;
  }) => {
    try {
      const result = await fetchWithAuth('kids/pronunciation/practice', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record game session
   */
  recordGameSession: async (data: {
    game_type: string;
    game_title?: string;
    score?: number;
    points_earned?: number;
    rounds?: number;
    difficulty?: string;
    duration_seconds?: number;
    completed?: boolean;
    details?: any;
  }) => {
    try {
      const result = await fetchWithAuth('kids/games/session', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all game sessions
   */
  getGameSessions: async () => {
    try {
      const result = await fetchWithAuth('kids/games/session', {
        method: 'GET',
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Parental Controls API =============
export const ParentalControlsAPI = {
  /**
   * Fetch parental control settings and usage stats
   */
  getOverview: async () => {
    try {
      const result = await fetchWithAuth('kids/parental-controls');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Attempt to unlock parental controls with a PIN
   */
  unlock: async (pin: string) => {
    try {
      const result = await fetchWithAuth('kids/parental-controls/unlock', {
        method: 'POST',
        body: JSON.stringify({ pin })
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update parental control settings (daily limit, etc.)
   */
  updateSettings: async (data: { daily_limit_minutes: number }) => {
    try {
      const result = await fetchWithAuth('kids/parental-controls/settings', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create, update, or reset the parental control PIN
   */
  updatePin: async (data: {
    current_pin?: string;
    new_pin?: string;
    confirm_pin?: string;
    action?: 'set' | 'reset';
  }) => {
    try {
      const result = await fetchWithAuth('kids/parental-controls/pin', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Privacy & Compliance API =============
export const CookieConsentAPI = {
  /**
   * Fetch cookie consent preferences for a given consent id
   */
  get: async (consentId: string) => {
    try {
      if (!consentId) {
        return {
          success: false,
          message: 'Consent identifier is required.',
          errors: null,
          status: 400
        };
      }

      const result = await fetchWithAuth(`privacy/cookie-consent?consent_id=${encodeURIComponent(consentId)}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Persist cookie consent preferences
   */
  save: async (data: {
    consentId: string;
    preferences: {
      functional: boolean;
      statistics: boolean;
      marketing: boolean;
    };
    accepted?: boolean;
  }) => {
    try {
      const payload = {
        consent_id: data.consentId,
        preferences: {
          functional: true, // functional is always true/required
          statistics: data.preferences.statistics,
          marketing: data.preferences.marketing
        },
        accepted: data.accepted ?? true
      };

      const result = await fetchWithAuth('privacy/cookie-consent', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Waitlist API =============
export const WaitlistAPI = {
  /**
   * Sign up for waitlist
   */
  signup: async (data: {
    email: string;
    name?: string;
    interest?: string;
    source?: string;
    notes?: string;
  }) => {
    try {
      const result = await fetchWithAuth('waitlist/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};


// ============= Page Eligibility API =============
const PageEligibilityAPI = {
  /**
   * Get eligibility status for a specific page
   */
  getEligibility: async (pagePath: string) => {
    return fetchWithAuth(`page-eligibility/${encodeURIComponent(pagePath)}`, {
      method: 'GET',
    });
  },

  /**
   * Get eligibility status for all pages
   */
  getAllEligibilities: async () => {
    return fetchWithAuth('page-eligibility/', {
      method: 'GET',
    });
  },

  /**
   * Check and update eligibility (called after progress updates)
   */
  checkEligibility: async (pagePath: string) => {
    return fetchWithAuth(`page-eligibility/${encodeURIComponent(pagePath)}/check`, {
      method: 'POST',
    });
  },
};

// ============= Export all APIs =============
export const API = {
  auth: AuthAPI,
  lessons: LessonsAPI,
  progress: ProgressAPI,
  vocabulary: VocabularyAPI,
  achievements: AchievementsAPI,
  stats: StatsAPI,
  kids: KidsAPI,
  parentalControls: ParentalControlsAPI,
  cookieConsent: CookieConsentAPI,
  waitlist: WaitlistAPI,
  pageEligibility: PageEligibilityAPI,
};

export default API;

