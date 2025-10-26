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
    completedAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  loginWithServer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerWithServer: (data: { name: string; email: string; password: string; confirm_password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User['profile']>) => void;
  updateUserSurveyData: (surveyData: User['surveyData']) => void;
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
    
    if (token && userData) {
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
    }
  }, [isOnline]);

  const login = (userData: User) => {
    const updatedUser = {
      ...userData,
      lastLogin: new Date().toISOString()
    };
    setUser(updatedUser);
    localStorage.setItem('speakbee_auth_token', 'local-token');
    localStorage.setItem('speakbee_current_user', JSON.stringify(updatedUser));
  };

  const loginWithServer = async (email: string, password: string) => {
    try {
      const response = await API.auth.login({ email, password });
      
      if (response.success && 'data' in response && response.data) {
        const userData = response.data.user;
        const transformedUser: User = {
          id: userData.id.toString(),
          username: userData.username,
          email: userData.email,
          name: userData.name,
          createdAt: userData.date_joined || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profile: {
            level: userData.profile?.level || 'beginner',
            points: userData.profile?.points || 0,
            streak: userData.profile?.current_streak || 0,
            avatar: userData.profile?.avatar
          },
          surveyData: userData.profile ? {
            ageRange: userData.profile.age_range,
            nativeLanguage: userData.profile.native_language,
            englishLevel: userData.profile.english_level,
            learningPurpose: userData.profile.learning_purpose,
            completedAt: userData.profile.survey_completed_at
          } : undefined
        };
        
        login(transformedUser);
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const registerWithServer = async (data: { name: string; email: string; password: string; confirm_password: string }) => {
    try {
      const response = await API.auth.register(data);
      
      if (response.success) {
        // Check if we have data property
        if ('data' in response && response.data) {
          // The API returns user data directly in response.data, not nested under 'user'
          const userData = (response.data as any).user || response.data;
          
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
      return { 
        success: false, 
        message: response.message || 'Registration failed. Please try again.' 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
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
            }
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

  const updateUserSurveyData = (surveyData: User['surveyData']) => {
    if (user) {
      const mergedSurveyData = {
        ...(user.surveyData || {}),
        ...surveyData
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
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithServer,
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