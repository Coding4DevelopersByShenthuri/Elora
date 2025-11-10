import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API } from '@/services/ApiService';

// Make sure this interface matches exactly with AuthModal's User interface
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  profile: {
    level: 'beginner' | 'intermediate' | 'advanced';
    points: number;
    streak: number;
    avatar?: string;
  };
  surveyData?: {
    ageRange?: string;
    nativeLanguage?: string;
    englishLevel?: string;
    learningPurpose?: string[];
    interests?: string[];
    completedAt: string;
  };
  // Admin flags (optional - only present for admin users)
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, options?: { token?: string }) => void;
  loginWithServer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (token: string) => Promise<{ success: boolean; message?: string }>;
  registerWithServer: (data: { name: string; email: string; password: string; confirm_password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User['profile']>) => void;
  updateUserSurveyData: (surveyData: User['surveyData'], stepName?: string, stepNumber?: number) => Promise<void>;
  syncWithServer: () => Promise<void>;
  isAuthenticated: boolean;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('speakbee_auth_token');
    const userData = localStorage.getItem('speakbee_current_user');
    
    if (token && token !== 'local-token' && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Sync with server if online (non-blocking, won't fail app if server unavailable)
        if (isOnline && token !== 'local-token') {
          syncWithServerInternal().catch(err => {
            console.log('Server sync skipped - offline mode active:', err);
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Don't logout on parse error - could be temporary issue
      }
    } else if (token === 'local-token') {
      localStorage.removeItem('speakbee_auth_token');
      localStorage.removeItem('speakbee_current_user');
      setUser(null);
    }
  }, [isOnline]);

  const login = (userData: User, options?: { token?: string }) => {
    const updatedUser = {
      ...userData,
      lastLogin: new Date().toISOString()
    };
    setUser(updatedUser);

    let tokenToStore = options?.token;
    if (!tokenToStore) {
      tokenToStore = localStorage.getItem('speakbee_auth_token') || 'local-token';
    }

    localStorage.setItem('speakbee_auth_token', tokenToStore);
    localStorage.setItem('speakbee_current_user', JSON.stringify(updatedUser));
  };

  const loginWithServer = async (email: string, password: string) => {
    try {
      const response = await API.auth.login({ email, password });
      
      if (response.success && 'data' in response && response.data) {
        const userData = response.data.user;
        const authToken = response.data.token || localStorage.getItem('speakbee_auth_token') || '';
        
        // Check if survey is completed (has survey_completed_at)
        const hasSurveyData = userData.profile?.survey_completed_at;
        const surveyData = hasSurveyData ? {
          ageRange: userData.profile.age_range,
          nativeLanguage: userData.profile.native_language,
          englishLevel: userData.profile.english_level,
          learningPurpose: userData.profile.learning_purpose,
          interests: userData.profile.interests,
          completedAt: userData.profile.survey_completed_at
        } : undefined;

        const transformedUser: User = {
          id: userData.id.toString(),
          username: userData.username,
          email: userData.email,
          name: userData.name,
          createdAt: userData.date_joined || new Date().toISOString(),
          lastLogin: userData.last_login || new Date().toISOString(), // Use server's last_login
          profile: {
            level: userData.profile?.level || 'beginner',
            points: userData.profile?.points || 0,
            streak: userData.profile?.current_streak || 0,
            avatar: userData.profile?.avatar
          },
          surveyData: surveyData,
          // Store admin flags for SurveyManager to check
          is_staff: userData.is_staff,
          is_superuser: userData.is_superuser
        };
        
        // transformedUser is already used in login() above, no need to reference it here
        login(transformedUser, { token: authToken || undefined });
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const loginWithGoogle = async (token: string) => {
    try {
      const response = await API.auth.googleAuth(token);
      
      if (response.success && 'data' in response && response.data) {
        const userData = response.data.user;
        const authToken = response.data.token || localStorage.getItem('speakbee_auth_token') || '';
        const surveyCompletedAt = userData.profile?.survey_completed_at;
        const surveyData = surveyCompletedAt ? {
          ageRange: userData.profile?.age_range,
          nativeLanguage: userData.profile?.native_language,
          englishLevel: userData.profile?.english_level,
          learningPurpose: userData.profile?.learning_purpose,
          interests: userData.profile?.interests,
          completedAt: surveyCompletedAt
        } : undefined;
        const transformedUser: User = {
          id: userData.id.toString(),
          username: userData.username,
          email: userData.email,
          name: userData.name,
          createdAt: userData.date_joined || new Date().toISOString(),
          lastLogin: userData.last_login || new Date().toISOString(),
          profile: {
            level: userData.profile?.level || 'beginner',
            points: userData.profile?.points || 0,
            streak: userData.profile?.current_streak || 0,
            avatar: userData.profile?.avatar
          },
          surveyData
        };
        
        login(transformedUser, { token: authToken || undefined });
        return { success: true, message: response.message || 'Google authentication successful' };
      }
      
      return { success: false, message: response.message || 'Google authentication failed' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Google authentication failed. Please try again.' };
    }
  };

  const registerWithServer = async (data: { name: string; email: string; password: string; confirm_password: string }) => {
    try {
      const response = await API.auth.register(data);
      
      if (response.success) {
        // Check if we have data property
        if ('data' in response && response.data) {
          // DO NOT login the user yet - they need to verify email first
          // The email verification will activate their account
          // Only return success with the message to inform the user
          
          return { 
            success: true, 
            message: response.message || 'Registration successful! Please check your email to verify your account.',
            verified: (response.data as any).verified || false,
            email_sent: (response.data as any).email_sent || false
          };
        } else {
          // Response successful but no data returned
          return { 
            success: true, 
            message: response.message || 'Registration successful!',
            verified: false,
            email_sent: false
          };
        }
      }
      
      // Registration failed - use the error message from the API
      // Include errors object if available for field-specific errors
      const errorMessage = response.message || 'Registration failed. Please try again.';
      const errors = (response as any).errors || null;
      
      return { 
        success: false, 
        message: errorMessage,
        errors: errors
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      // If error has response data, extract the message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Registration failed. Please try again.';
      return { 
        success: false, 
        message: errorMessage,
        errors: error?.response?.data?.errors || null
      };
    }
  };

  const syncWithServer = async () => {
    await syncWithServerInternal();
  };

  const syncWithServerInternal = async () => {
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token' || !isOnline) return;
    
    try {
      const response = await API.auth.getUserInfo();
      if (response.success && 'data' in response && response.data) {
        const userData = response.data;
        
        // Check if survey is completed on server side
        const serverSurveyCompleted = userData.profile?.survey_completed_at;
        const serverSurveyData = serverSurveyCompleted ? {
          ageRange: userData.profile?.age_range,
          nativeLanguage: userData.profile?.native_language,
          englishLevel: userData.profile?.english_level,
          learningPurpose: userData.profile?.learning_purpose,
          interests: userData.profile?.interests,
          completedAt: userData.profile?.survey_completed_at
        } : undefined;

        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              level: userData.profile?.level || prev.profile.level,
              points: userData.profile?.points || prev.profile.points,
              streak: userData.profile?.current_streak || prev.profile.streak,
              avatar: userData.profile?.avatar || prev.profile.avatar
            },
            // If server has survey data, use it (server is source of truth)
            surveyData: serverSurveyData || prev.surveyData
          };
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const logout = () => {
    setUser(null);
    API.auth.logout();
  };

  const updateUserProfile = (updates: Partial<User['profile']>) => {
    if (user) {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...updates
        }
      };
      setUser(updatedUser);
      localStorage.setItem('speakbee_current_user', JSON.stringify(updatedUser));
    }
  };

  const updateUserSurveyData = async (surveyData: User['surveyData'], stepName?: string, stepNumber?: number) => {
    if (user) {
      const mergedSurveyData = {
        ...(user.surveyData || {}),
        ...surveyData,
        completedAt: new Date().toISOString() // Ensure completedAt is always set
      } as User['surveyData'];

      const updatedUser = {
        ...user,
        surveyData: mergedSurveyData
      };
      setUser(updatedUser);
      localStorage.setItem('speakbee_current_user', JSON.stringify(updatedUser));
      
      // Also update the user data in the main users storage
      try {
        const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, surveyData: mergedSurveyData } : u
        );
        localStorage.setItem("speakbee_users", JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Error updating user survey data in storage:', error);
      }

      // Sync survey data to backend server (if online and not admin user)
      // Admin users don't need to save survey data - they never take surveys
      const isAdminUser = (user as any).is_staff || (user as any).is_superuser;
      if (!isAdminUser && isOnline) {
        try {
          const token = localStorage.getItem('speakbee_auth_token');
          if (token && token !== 'local-token') {
            // Save individual step response if step info provided
            if (stepName && stepNumber !== undefined) {
              try {
                await API.auth.saveSurveyStep(stepName, stepNumber, surveyData);
                console.log(`✅ Survey step ${stepNumber} (${stepName}) saved to MySQL`);
              } catch (error) {
                console.warn(`⚠️ Failed to save survey step ${stepNumber} to MySQL:`, error);
              }
            }
            
            // Prepare survey data for backend (map frontend field names to backend field names)
            // Only set survey_completed_at if this is a complete survey submission
            // Check if all required fields are present
            const hasRequiredFields = (
              surveyData?.ageRange || 
              surveyData?.nativeLanguage || 
              surveyData?.englishLevel || 
              (surveyData?.learningPurpose && surveyData.learningPurpose.length > 0)
            );
            
            const profileUpdateData: any = {
              age_range: surveyData?.ageRange || null,
              native_language: surveyData?.nativeLanguage || null,
              english_level: surveyData?.englishLevel || null,
              learning_purpose: surveyData?.learningPurpose || [],
              interests: surveyData?.interests || [],
            };
            
            // Only set survey_completed_at if we have required survey data
            // This prevents marking incomplete surveys as completed
            if (hasRequiredFields) {
              profileUpdateData.survey_completed_at = new Date().toISOString();
            }

            // Update profile via API
            const response = await API.auth.updateProfile(profileUpdateData);
            if (response.success) {
              console.log('✅ Survey data saved to backend');
            } else {
              const errorMessage = (response as any).message || 'Unknown error';
              console.warn('⚠️ Failed to save survey data to backend:', errorMessage);
            }
          }
        } catch (error) {
          console.error('Error syncing survey data to backend:', error);
          // Don't throw - survey completion should still work offline
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithServer,
      loginWithGoogle,
      registerWithServer,
      logout,
      updateUserProfile,
      updateUserSurveyData,
      syncWithServer,
      isAuthenticated: !!user,
      isOnline
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};