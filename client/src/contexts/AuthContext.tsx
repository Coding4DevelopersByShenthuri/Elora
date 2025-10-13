import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  login: (userData: User) => void; // Changed to require userData
  logout: () => void;
  updateUserProfile: (updates: Partial<User['profile']>) => void;
  updateUserSurveyData: (surveyData: User['surveyData']) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('speakbee_auth_token');
    const userData = localStorage.getItem('speakbee_current_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
  }, []);

  const login = (userData: User) => {
    const updatedUser = {
      ...userData,
      lastLogin: new Date().toISOString()
    };
    setUser(updatedUser);
    localStorage.setItem('speakbee_auth_token', 'local-token');
    localStorage.setItem('speakbee_current_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('speakbee_auth_token');
    localStorage.removeItem('speakbee_current_user');
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
      logout,
      updateUserProfile,
      updateUserSurveyData,
      isAuthenticated: !!user
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