import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, AlertCircle, ArrowLeft, FileText, Check, MailCheck } from 'lucide-react';
import { TERMS_AND_CONDITIONS, SECURITY_QUESTIONS } from '../../data/terms-and-conditions';
import { userDataService } from '@/services/UserDataService';
import { GoogleLogin } from '@react-oauth/google';
import '../../styles/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register'; // Add initialMode prop
  redirectFromKids?: boolean; // New prop to indicate redirect from kids page
  onAuthSuccess?: () => void; // New prop to handle successful authentication
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'terms';

interface User {
  id: string;
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
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
    ageRange: string;
    completedAt: string;
  };
}

// Simple encryption for local storage (basic obfuscation)
const simpleEncrypt = (text: string): string => {
  return btoa(unescape(encodeURIComponent(text)));
};

const simpleDecrypt = (text: string): string => {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    return text; // Return original if decryption fails (for backward compatibility)
  }
};

// Offline-only authentication service
const SUPPORT_EMAIL = 'elora.toinfo@gmail.com';

const authService = {
  // Generate unique ID for users
  generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Verify security answer without changing password
  async verifySecurityAnswer(email: string, securityAnswer: string): Promise<boolean> {
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    let user: any = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Legacy fallback
      const legacyUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
      const emailLc = email.toLowerCase();
      const emailLocal = emailLc.split('@')[0];
      user = Array.isArray(legacyUsers) ? legacyUsers.find((u: any) => (
        (typeof u.email === 'string' && u.email.toLowerCase() === emailLc) ||
        (typeof u.username === 'string' && (u.username.toLowerCase() === emailLc || u.username.toLowerCase() === emailLocal))
      )) : undefined;
    }

    if (!user || !user.securityAnswer) return false;

    const normalizedAnswer = securityAnswer.toLowerCase().trim();

    // Try direct comparison first (for unencrypted answers)
    if (user.securityAnswer === normalizedAnswer) return true;

    // Try hashed comparison
    const hashedInputAnswer = this.hashPassword(normalizedAnswer);
    if (user.securityAnswer === hashedInputAnswer) return true;

    // Try decrypted comparison
    try {
      const decryptedAnswer = simpleDecrypt(user.securityAnswer);
      return decryptedAnswer === normalizedAnswer;
    } catch {
      return false;
    }
  },

  // Hash password (basic implementation for offline use)
  hashPassword(password: string): string {
    return simpleEncrypt(password);
  },

  // Verify password
  verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      return password === simpleDecrypt(hashedPassword);
    } catch {
      // For backward compatibility with existing unencrypted passwords
      return password === hashedPassword;
    }
  },

  async login(email: string, password: string) {
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    const emailLc = email.toLowerCase();
    let foundUser = users.find(u => u.email.toLowerCase() === emailLc);

    // Primary: modern users
    if (foundUser && this.verifyPassword(password, foundUser.password)) {
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === foundUser!.id ? updatedUser : u);
      localStorage.setItem("speakbee_users", JSON.stringify(updatedUsers));
      return { token: 'local-token', user: { ...updatedUser, password: undefined as any } };
    }

    // Legacy fallback: users stored under 'users' with plain password and possibly username only
    const legacyUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      const localPart = emailLc.split('@')[0];
      const legacy = legacyUsers.find((u: any) => (
        (typeof u.email === 'string' && u.email.toLowerCase() === emailLc) ||
        (typeof u.username === 'string' && (u.username.toLowerCase() === emailLc || u.username.toLowerCase() === localPart))
      ));

      if (legacy && typeof legacy.password === 'string' && legacy.password === password) {
        // Migrate legacy user into speakbee_users
        const migrated: User = {
          id: this.generateId(),
          username: legacy.username || localPart,
          name: legacy.name || legacy.username || localPart,
          email: legacy.email || (localPart + '@local'),
          password: this.hashPassword(password),
          securityQuestion: legacy.securityQuestion || 'What is your favorite color?',
          securityAnswer: legacy.securityAnswer ? legacy.securityAnswer : this.hashPassword(''),
          createdAt: legacy.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profile: legacy.profile || { level: 'beginner', points: 0, streak: 0, avatar: undefined }
        };
        const newUsers = [...users, migrated];
        localStorage.setItem('speakbee_users', JSON.stringify(newUsers));
        return { token: 'local-token', user: { ...migrated, password: undefined as any } };
      }
    }

    throw new Error('Invalid email or password');
  },

  async register(name: string, email: string, password: string, securityQuestion: string, securityAnswer: string) {
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Create new user with encrypted password
    const newUser: User = {
      id: this.generateId(),
      username: email.split('@')[0],
      name: name.trim(),
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      securityQuestion,
      securityAnswer: this.hashPassword(securityAnswer.toLowerCase().trim()),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profile: {
        level: 'beginner',
        points: 0,
        streak: 0,
        avatar: undefined
      }
    };

    users.push(newUser);
    localStorage.setItem("speakbee_users", JSON.stringify(users));

    // Initialize user learning data
    try {
      await userDataService.initDB();
      await userDataService.saveUserLearningData(newUser.id, {
        userId: newUser.id,
        currentLevel: 'beginner',
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPracticeTime: 0,
        lessonsCompleted: 0,
        lessons: [],
        practiceSessions: [],
        vocabulary: [],
        achievements: [],
        settings: {
          voiceSpeed: 'normal',
          difficulty: 'medium',
          notifications: true,
          autoPlay: true,
          theme: 'auto'
        },
        notifications: []
      });
    } catch (error) {
      console.error('Error initializing user learning data:', error);
      // Continue with registration even if learning data initialization fails
    }

    return {
      token: 'local-token',
      user: {
        ...newUser,
        password: undefined // Remove password from returned user object
      }
    };
  },

  async resetPassword(email: string, securityAnswer: string, newPassword: string) {
    // Primary store
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    let userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
      const user = users[userIndex];

      // Verify security answer for modern users
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      const hashedInputAnswer = this.hashPassword(normalizedAnswer);

      let answerValid = false;

      if (user.securityAnswer === hashedInputAnswer) {
        answerValid = true;
      } else {
        try {
          const decryptedAnswer = simpleDecrypt(user.securityAnswer);
          if (decryptedAnswer === normalizedAnswer) {
            answerValid = true;
          }
        } catch {
          // If decryption fails, try direct comparison for legacy
          if (user.securityAnswer === normalizedAnswer) {
            answerValid = true;
          }
        }
      }

      if (!answerValid) {
        throw new Error('Incorrect security answer');
      }

      // Update password
      users[userIndex] = {
        ...user,
        password: this.hashPassword(newPassword)
      };
      localStorage.setItem("speakbee_users", JSON.stringify(users));
      return true;
    }

    // Legacy store fallback
    const legacyUsersRaw = localStorage.getItem('users');
    const legacyUsers: any[] = JSON.parse(legacyUsersRaw || '[]');
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      const emailLc = email.toLowerCase();
      const emailLocal = emailLc.split('@')[0];
      const legacyIndex = legacyUsers.findIndex((u: any) => (
        (typeof u.email === 'string' && u.email.toLowerCase() === emailLc) ||
        (typeof u.username === 'string' && (u.username.toLowerCase() === emailLc || u.username.toLowerCase() === emailLocal))
      ));

      if (legacyIndex !== -1) {
        const legacyUser = legacyUsers[legacyIndex];

        // For legacy users, if no security answer is set, allow reset without verification
        if (!legacyUser.securityAnswer) {
          legacyUsers[legacyIndex] = {
            ...legacyUser,
            password: newPassword
          };
          localStorage.setItem('users', JSON.stringify(legacyUsers));
          return true;
        }

        // Verify security answer for legacy users
        const normalizedAnswer = securityAnswer.toLowerCase().trim();
        let answerValid = false;

        if (legacyUser.securityAnswer === normalizedAnswer) {
          answerValid = true;
        } else {
          try {
            const decryptedAnswer = simpleDecrypt(legacyUser.securityAnswer);
            if (decryptedAnswer === normalizedAnswer) {
              answerValid = true;
            }
          } catch {
            // If decryption fails, try direct comparison
            if (legacyUser.securityAnswer === normalizedAnswer) {
              answerValid = true;
            }
          }
        }

        if (!answerValid) {
          throw new Error('Incorrect security answer');
        }

        // Update legacy password
        legacyUsers[legacyIndex] = {
          ...legacyUser,
          password: newPassword
        };
        localStorage.setItem('users', JSON.stringify(legacyUsers));
        return true;
      }
    }

    throw new Error('User not found');
  },

  async getUserByEmail(email: string) {
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return { ...user };
    }

    // Legacy fallback: search in 'users'
    const legacyUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      const emailLc = email.toLowerCase();
      const emailLocal = emailLc.split('@')[0];
      const legacy = legacyUsers.find((u: any) => (
        (typeof u.email === 'string' && u.email.toLowerCase() === emailLc) ||
        (typeof u.username === 'string' && (u.username.toLowerCase() === emailLc || u.username.toLowerCase() === emailLocal))
      ));
      if (legacy) {
        // Convert legacy user to modern format
        return {
          id: legacy.id || this.generateId(),
          username: legacy.username || emailLocal,
          name: legacy.name || legacy.username || emailLocal,
          email: legacy.email || (emailLocal + '@local'),
          password: legacy.password,
          securityQuestion: legacy.securityQuestion || 'What is your favorite color?',
          securityAnswer: legacy.securityAnswer || '',
          createdAt: legacy.createdAt || new Date().toISOString(),
          lastLogin: legacy.lastLogin || new Date().toISOString(),
          profile: legacy.profile || { level: 'beginner', points: 0, streak: 0, avatar: undefined }
        };
      }
    }

    return null;
  },

  // Check if user exists by email
  async checkUserExists(email: string): Promise<boolean> {
    const users: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) return true;

    // Legacy fallback
    const legacyUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      const emailLc = email.toLowerCase();
      const emailLocal = emailLc.split('@')[0];
      return legacyUsers.some((u: any) => (
        (typeof u.email === 'string' && u.email.toLowerCase() === emailLc) ||
        (typeof u.username === 'string' && (u.username.toLowerCase() === emailLc || u.username.toLowerCase() === emailLocal))
      ));
    }

    return false;
  }
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login', redirectFromKids = false, onAuthSuccess }: AuthModalProps) => {
  const { registerWithServer, loginWithServer, loginWithGoogle, login } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Forgot password email (used for support hand-off)
  const [email, setEmail] = useState("");

  // Registration states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });

  // Store credentials for auto-fill after registration
  const [autoFillCredentials, setAutoFillCredentials] = useState<{ email: string; password: string } | null>(null);

  // Ref for terms content container
  const termsContentRef = useRef<HTMLDivElement>(null);

  // New state for kids page redirect handling
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  // Track newly registered users for activation message
  const [newlyRegisteredEmail, setNewlyRegisteredEmail] = useState<string | null>(null);
  const [showActivationMessage, setShowActivationMessage] = useState(false);

  // Add this useEffect to handle auth mode changes specifically for forgot password
  useEffect(() => {
    if (isOpen) {
      // Check if there's a stored mode from the custom event
      const storedMode = sessionStorage.getItem('speakbee_auth_mode');
      const modeToUse = storedMode && (storedMode === 'login' || storedMode === 'register') 
        ? storedMode as AuthMode 
        : authMode;
      
      if (storedMode && (storedMode === 'login' || storedMode === 'register')) {
        setAuthMode(storedMode as AuthMode);
        sessionStorage.removeItem('speakbee_auth_mode'); // Clear it after use
      }
      
      // Update panel state based on current auth mode
      if (modeToUse === 'register' || modeToUse === 'forgot-password') {
        setIsRightPanelActive(true);
      } else {
        setIsRightPanelActive(false);
      }
      
      setError('');
      setSuccess('');

      // Auto-fill credentials when switching to login after registration
      if (modeToUse === 'login' && autoFillCredentials) {
        setFormData(prev => ({
          ...prev,
          email: autoFillCredentials.email,
          password: autoFillCredentials.password
        }));
      }
    }
  }, [isOpen, authMode, autoFillCredentials]);

  // New function to handle kids page redirect
  const handleKidsPageRedirect = async () => {
    setIsCheckingUser(true);
    setError('');
    setSuccess('');
    // Reset forgot password states when coming from kids page
    resetForgotPasswordFlow();

    try {
      // Check if there's any existing user data to determine if user might be returning
      const hasExistingUsers = await checkForExistingUsers();

      if (hasExistingUsers) {
        // If users exist, show login form with message
        setAuthMode('login');
        setIsRightPanelActive(false);
        setSuccess('Welcome back! Please sign in to continue to Kids page.');
      } else {
        // If no users exist, show registration form with message
        setAuthMode('register');
        setIsRightPanelActive(true);
      }
    } catch (error) {
      console.error('Error checking for existing users:', error);
      // Default to login on error
      setAuthMode('login');
      setIsRightPanelActive(false);
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Helper function to check if any users exist in the system
  const checkForExistingUsers = async (): Promise<boolean> => {
    // Check modern users storage
    const modernUsers: User[] = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
    if (modernUsers.length > 0) {
      return true;
    }

    // Check legacy users storage
    const legacyUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (isOpen) {
      // If redirected from kids page, determine if user exists
      if (redirectFromKids) {
        handleKidsPageRedirect();
      } else {
        setError('');
        setSuccess('');
      }
    }
  }, [isOpen, redirectFromKids]);

  // Reset scroll position when terms modal opens
  useEffect(() => {
    if (authMode === 'terms') {
      setScrollPosition(0);
      setTimeout(() => {
        if (termsContentRef.current) {
          termsContentRef.current.scrollTop = 0;
        }
      }, 100);
    }
  }, [authMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (authMode === 'register') {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!formData.securityAnswer.trim()) {
        setError('Security answer is required for password recovery');
        return false;
      }
      if (!acceptedTerms) {
        setError('You must accept the Terms and Conditions to continue');
        return false;
      }
    }

    if (authMode === 'login') {
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const resetForgotPasswordFlow = () => {
    setEmail("");
    setError('');
    setIsLoading(false);
    // Ensure we're not stuck in forgot password mode when resetting
    if (authMode === 'forgot-password') {
      setAuthMode('login');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        // Try server login first, fallback to offline if server is unavailable
        try {
          const serverResult = await loginWithServer(formData.email, formData.password);
          if (serverResult.success) {
            setSuccess('Login successful!');
            setTimeout(() => {
              if (redirectFromKids && onAuthSuccess) {
                onAuthSuccess();
              } else {
                onClose();
              }
              resetForm();
            }, 1000);
            return;
          } else {
            // Check if it's a verification error
            if (serverResult.message && serverResult.message.includes('verify your email')) {
              setError('Activate your account first. Please check your email inbox and click the verification link to activate your account.');
              setIsLoading(false);
              return;
            }
            // If server login fails due to wrong credentials, don't fallback to offline
            // Only fallback if it's a network/server error (which will be caught in catch block)
            setError(serverResult.message || 'Login failed');
            setIsLoading(false);
            return;
          }
        } catch (serverError: any) {
          // Server login failed - check if it's a network error (should try offline) or auth error (should not)
          const isNetworkError = !serverError?.response || 
                                 serverError?.response?.status === 0 || 
                                 serverError?.response?.status === 408 ||
                                 (serverError?.response?.data?.message && 
                                  (serverError.response.data.message.includes('not reachable') || 
                                   serverError.response.data.message.includes('timeout') ||
                                   serverError.response.data.message.includes('connection')));
          
          if (isNetworkError) {
            // Network/server error - try offline login as fallback
            console.log('Server login failed due to network issue, trying offline login:', serverError);
            try {
              const offlineResult = await authService.login(formData.email, formData.password);
              if (offlineResult && offlineResult.token) {
                // Use the login function from context to set user
                login(offlineResult.user);
                setSuccess('Login successful (offline mode)!');
                setTimeout(() => {
                  if (redirectFromKids && onAuthSuccess) {
                    onAuthSuccess();
                  } else {
                    onClose();
                  }
                  resetForm();
                }, 1000);
                return;
              } else {
                setError('Invalid email or password. Please check your credentials.');
                setIsLoading(false);
                return;
              }
            } catch (offlineError) {
              // Both server and offline login failed
              setError('Invalid email or password. If you registered online, please ensure your account is activated via email.');
              setIsLoading(false);
              return;
            }
          } else {
            // Authentication error (wrong credentials, etc.) - don't try offline
            const errorMsg = serverError?.response?.data?.message || 
                            serverError?.message || 
                            'Unable to connect to server. Please check your internet connection and try again.';
            setError(errorMsg);
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Try server registration first
        try {
          const serverResult = await registerWithServer({
            name: formData.name.trim(),
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword
          });

          if (serverResult.success) {
            // Track newly registered email
            setNewlyRegisteredEmail(formData.email);
            setShowActivationMessage(true);
            
            // Use the server's message which includes professional instructions
            const successMsg = serverResult.message || 'Registration successful! Please check your email to verify your account.';
            setSuccess(successMsg);
            
            // Switch to login mode immediately to show the activation message
            setAuthMode('login');
            setIsRightPanelActive(false);
            setAutoFillCredentials({
              email: formData.email,
              password: formData.password
            });
            
            // Clear the success message after 8 seconds
            setTimeout(() => {
              setSuccess('');
            }, 8000);
            return;
          } else {
            // Registration failed - display the error message from the server
            let errorMsg = serverResult.message || 'Registration failed. Please try again.';
            
            // If there are field-specific errors, format them nicely
            if ((serverResult as any).errors) {
              const errors = (serverResult as any).errors;
              const errorKeys = Object.keys(errors);
              if (errorKeys.length > 0) {
                const firstError = errors[errorKeys[0]];
                if (Array.isArray(firstError)) {
                  errorMsg = firstError[0];
                } else {
                  errorMsg = firstError;
                }
              }
            }
            
            setError(errorMsg);
            setIsLoading(false);
            return;
          }
        } catch (serverError: any) {
          // Server registration failed - user needs to be online to register
          console.error('Registration server error:', serverError);
          const errorMsg = serverError?.response?.data?.message || 
                          serverError?.message || 
                          'Unable to connect to server. Please check your internet connection and try again.';
          setError(errorMsg);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      securityQuestion: SECURITY_QUESTIONS[0],
      securityAnswer: ''
    });
    setError('');
    setSuccess('');
    setAuthMode('login');
    setIsRightPanelActive(false);
    setAcceptedTerms(false);
    setAutoFillCredentials(null);
    setNewlyRegisteredEmail(null);
    setShowActivationMessage(false);
    resetForgotPasswordFlow();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollPosition(scrollPercent);
  };

  const isRegisterMode = authMode === 'register';
  const isForgotPasswordMode = authMode === 'forgot-password';
  const isTermsMode = authMode === 'terms';
  const passwordsMatch = !isRegisterMode || formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.password &&
    (!isRegisterMode || (formData.name && passwordsMatch && formData.securityAnswer && acceptedTerms));

  // Modern Terms and Conditions Modal Component
  // Helper function to format terms content with proper HTML structure
  const formatTermsContent = (text: string) => {
    const lines = text.split('\n');
    const formattedLines: React.ReactElement[] = [];
    let currentSection: string[] = [];
    let key = 0;

    const majorHeadings = ['The Agreement', 'Introduction', 'Definitions/Terminology', 'User Obligations', 
      'Product/Service Details', 'Intellectual Property Rights', 'Service Specifications', 
      'Payment and Financial Terms', 'User Responsibilities and Conduct', 'Privacy and Data Protection',
      'Disclaimer of Warranties', 'Limitation of Liability', 'Modifications to Terms', 
      'Termination and Suspension', 'Special User Categories', 'Governing Law and Dispute Resolution',
      'Contact Information and Support', 'Entire Agreement', 'Severability', 'No Waiver', 'Assignment'];

    const subHeadings = ['Accurate Information', 'Compliance with Laws', 'Lawful Use', 'Account Security',
      'Our Intellectual Property', 'Your Content', 'License Grant', 'Technical Requirements', 
      'Offline Capabilities', 'Service Models', 'Payment Terms', 'Free Trial Offers',
      'Permitted Uses', 'Prohibited Activities', 'Data Processing Architecture', 'Data Collection',
      'Data Security', 'By You', 'By Elora', 'Effect of Termination',
      'For Parents/Guardians (Kids Module)', 'For Educational Institutions', 'For Examination Candidates',
      'Governing Law', 'Dispute Resolution', 'Class Action Waiver'];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      if (majorHeadings.includes(trimmedLine)) {
        formattedLines.push(<h1 key={key++}>{trimmedLine}</h1>);
      } else if (subHeadings.includes(trimmedLine)) {
        formattedLines.push(<h2 key={key++}>{trimmedLine}</h2>);
      } else if (trimmedLine.startsWith('- ')) {
        if (currentSection.length > 0) {
          formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
          currentSection = [];
        }
        formattedLines.push(<li key={key++}>{trimmedLine.substring(2)}</li>);
      } else if (trimmedLine.length > 0) {
        currentSection.push(trimmedLine);
      } else if (currentSection.length > 0) {
        formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
        currentSection = [];
      }
    });

    if (currentSection.length > 0) {
      formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
    }

    return formattedLines;
  };

  const TermsModal = () => {
    const scrollToTop = () => {
      if (termsContentRef.current) {
        termsContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    return (
      <div className="auth-terms-full-container">
        <div className="h-full bg-[#143C3D] p-4 md:p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Back to Login
            </button>
            <div className="flex items-center space-x-1 md:space-x-2">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#28CACD]" />
              <span className="text-white font-semibold text-xs md:text-sm">Legal Document</span>
            </div>
          </div>

          <div className="text-center mb-3 md:mb-4">
            <h1 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Terms and Conditions Agreement</h1>
            <p className="text-[#4BB6B7] text-xs">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Scroll Progress Bar */}
          <div className="w-full bg-[#022A2D] rounded-full h-1 mb-3 md:mb-4">
            <div
              className="bg-[#28CACD] h-1 rounded-full transition-all duration-300"
              style={{ width: `${scrollPosition}%` }}
            />
          </div>

          {/* Terms Content with Scroll to Top Button */}
          <div className="relative flex-1 mb-3 md:mb-4">
            <div
              ref={termsContentRef}
              className="h-full overflow-y-auto bg-[#022A2D] p-3 md:p-4 rounded-lg terms-content-container custom-scrollbar scroll-smooth"
              onScroll={handleScroll}
            >
              <div className="text-white terms-content">
                {formatTermsContent(TERMS_AND_CONDITIONS)}
              </div>
            </div>
            
            {/* Scroll to Top Button */}
            {scrollPosition > 20 && (
              <button
                onClick={scrollToTop}
                className="absolute bottom-4 right-4 bg-[#28CACD] hover:bg-[#4BB6B7] text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                aria-label="Scroll to top"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 transform rotate-90" />
              </button>
            )}
          </div>

        {/* Acceptance Section */}
        <div className="bg-[#022A2D] p-3 md:p-4 rounded-lg mb-3 md:mb-4 border border-[#4BB6B7]">
          <div className="flex items-start space-x-2 md:space-x-3">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${acceptedTerms
                  ? 'bg-[#28CACD] border-[#28CACD]'
                  : 'bg-transparent border-[#4BB6B7]'
                }`}
            >
              {acceptedTerms && <Check className="w-2 h-2 md:w-3 md:h-3 text-white" />}
            </button>
            <div className="flex-1">
              <p className="text-white text-xs md:text-sm leading-relaxed">
                <strong>I have read, understood, and agree to be bound by the Terms and Conditions Agreement.</strong> I acknowledge that this is a legal contract between me and Elora, and I understand my rights and responsibilities as outlined in this document.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 md:space-x-3">
          <Button
            onClick={() => setAuthMode('login')}
            className="flex-1 h-8 md:h-10 bg-transparent border border-[#4BB6B7] text-[#4BB6B7] hover:bg-[#4BB6B7] hover:text-white transition-all duration-300 text-xs md:text-sm"
          >
            Decline & Return
          </Button>
          <Button
            onClick={() => {
              if (acceptedTerms) {
                setAuthMode('register');
              } else {
                setError('You must accept the Terms and Conditions to create an account');
              }
            }}
            className="flex-1 h-8 md:h-10 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            disabled={!acceptedTerms}
          >
            <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Accept & Continue
          </Button>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#4BB6B7]/30">
          <p className="text-[#4BB6B7] text-xs">
            Questions? Contact us at <strong>elora.toinfo@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent 
        className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent flex items-center justify-center min-h-screen max-h-screen"
        title="Authentication"
        description="Elora authentication dialog for login and registration"
      >
        {/* Home Button */}
        <div className="auth-page-home-button">
          <button className="auth-home-button" onClick={onClose}>
            <Home className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className={`auth-modal-container ${isRightPanelActive ? 'right-panel-active' : ''} ${isTermsMode ? 'terms-mode-active' : ''}`}>
          {/* Terms and Conditions Modal - Full Screen Overlay */}
          {isTermsMode && <TermsModal />}

          {/* Register Form */}
          {!isTermsMode && (
            <div className="auth-form-container auth-register-container">
              <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-3 md:p-4 flex flex-col auth-register-content">
                <div className="text-center mb-2">
                  <h1 className="text-lg md:text-xl font-bold text-white mb-1">Elora</h1>
                  <p className="text-[#4BB6B7] text-xs">Create Your Account</p>
                </div>


                {/* Error Message */}
                {error && (
                  <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-xs">
                    <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-xs">
                    <span>{success}</span>
                  </div>
                )}

                {isCheckingUser ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4BB6B7]" />
                    <span className="ml-2 text-white text-sm">Checking your account...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                      <div className="auth-input-container">
                        <div className="auth-input-wrapper">
                          <User className="auth-input-icon" />
                          <Input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 text-xs"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="auth-input-container">
                        <div className="auth-input-wrapper">
                          <Mail className="auth-input-icon" />
                          <Input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 text-xs"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="auth-password-container">
                        <div className="auth-input-wrapper">
                          <Lock className="auth-input-icon" />
                          <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password (min. 8 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 pr-7 md:pr-8 text-xs"
                            required
                            minLength={8}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="auth-password-container">
                        <div className="auth-input-wrapper">
                          <Lock className="auth-input-icon" />
                          <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 pr-7 md:pr-8 text-xs"
                            required
                            minLength={8}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Security Question Selection */}
                      <div className="auth-input-container">
                        <div className="auth-input-wrapper">
                          <select
                            name="securityQuestion"
                            value={formData.securityQuestion}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 pr-3 md:pr-4 w-full rounded-md border text-xs"
                            required
                            disabled={isLoading}
                          >
                            {SECURITY_QUESTIONS.map((question, index) => (
                              <option key={index} value={question} className="text-xs bg-[#022A2D]">
                                {question}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="auth-input-container">
                        <div className="auth-input-wrapper">
                          <Input
                            name="securityAnswer"
                            type="text"
                            placeholder="Your answer (for password recovery)"
                            value={formData.securityAnswer}
                            onChange={handleInputChange}
                            className="h-7 md:h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-8 md:pl-10 text-xs"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms Acceptance */}
                    <div className="flex items-start space-x-1 md:space-x-2 mb-2 md:mb-3 p-1 md:p-2 bg-[#022A2D] rounded border border-[#4BB6B7]/30">
                      <button
                        type="button"
                        onClick={() => setAcceptedTerms(!acceptedTerms)}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${acceptedTerms
                            ? 'bg-[#28CACD] border-[#28CACD]'
                            : 'bg-transparent border-[#4BB6B7]'
                          }`}
                        disabled={isLoading}
                      >
                        {acceptedTerms && <Check className="w-2 h-2 md:w-3 md:h-3 text-white" />}
                      </button>
                      <span className="text-white text-xs leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate('/terms-and-conditions');
                          }}
                          className="text-[#4BB6B7] hover:text-[#28CACD] underline transition-colors font-semibold"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and acknowledge that this is a legal agreement between me and Elora.
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-7 md:h-8 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest disabled:opacity-50 text-xs mb-1 md:mb-2"
                      disabled={!isFormValid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <div className="auth-terms-container mb-1 md:mb-2 flex items-center justify-center flex-wrap gap-1">
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Login Form */}
          {!isTermsMode && (
            <div className="auth-form-container auth-login-container">
              <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-4 md:p-8 flex flex-col justify-center overflow-visible">
                <div className="text-center mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Elora</h1>
                  <p className="text-[#4BB6B7] text-sm md:text-base">Welcome back to your English learning journey</p>
                </div>

                {/* Activation Message Popup */}
                {showActivationMessage && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/30 dark:to-teal-900/30 border-2 border-teal-500 rounded-lg shadow-md">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                          <MailCheck className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Check your email
                          </h3>
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          We sent an activation link to <strong className="text-teal-600 dark:text-teal-400 font-normal">{newlyRegisteredEmail}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowActivationMessage(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Close message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                    <span className="flex-1 text-xs md:text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-3 md:mb-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-800 dark:text-green-200 rounded-lg flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                    <span className="text-xs md:text-sm leading-relaxed">{success}</span>
                  </div>
                )}

                {isCheckingUser ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4BB6B7]" />
                    <span className="ml-2 text-white text-base">Checking your account...</span>
                  </div>
                ) : (
                  <>
                    {/* Google Sign In Button - Standard placement at top */}
                    <GoogleSignInButton onSuccess={async (token) => {
                      setIsLoading(true);
                      setError('');
                      setSuccess('');
                      
                      try {
                        const result = await loginWithGoogle(token);
                        if (result.success) {
                          setSuccess('Google authentication successful!');
                          setTimeout(() => {
                            if (redirectFromKids && onAuthSuccess) {
                              onAuthSuccess();
                            } else {
                              onClose();
                            }
                            resetForm();
                          }, 1000);
                        } else {
                          setError(result.message || 'Google authentication failed');
                        }
                      } catch (error) {
                        setError('An error occurred during Google authentication');
                      } finally {
                        setIsLoading(false);
                      }
                    }} isLoading={isLoading} />

                    {/* Divider */}
                    <div className="flex items-center mb-3 md:mb-4">
                      <div className="flex-1 border-t border-[#4BB6B7]/30"></div>
                      <span className="px-3 text-xs md:text-sm text-[#4BB6B7]">OR</span>
                      <div className="flex-1 border-t border-[#4BB6B7]/30"></div>
                    </div>

                    <div className="auth-input-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 text-sm md:text-base"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="auth-password-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-9 md:pr-10 text-sm md:text-base"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-3 w-3 md:h-4 md:w-4" /> : <Eye className="h-3 w-3 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest disabled:opacity-50 text-sm md:text-base"
                      disabled={!isFormValid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin mr-1 md:mr-2" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <div className="auth-pass-link auth-compact-link">
                      <button
                        type="button"
                        onClick={() => {
                          // Prefill email from login form and clear errors for smoother recovery
                          setEmail(formData.email || '');
                          setError('');
                          setSuccess('');
                          setIsRightPanelActive(true); // Add this line
                          setAuthMode('forgot-password');
                        }}
                        className="text-[#4BB6B7] hover:text-[#28CACD] text-xs md:text-sm transition-colors font-medium"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Forgot Password Form */}
          {!isTermsMode && isForgotPasswordMode && (
            <div className="auth-form-container auth-forgot-password-container">
              <div className="h-full bg-[#143C3D] p-4 md:p-8 flex flex-col justify-center space-y-6 text-white/80 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsRightPanelActive(false);
                    resetForgotPasswordFlow();
                  }}
                  className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors text-xs md:text-sm w-fit"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Back to Login
                </button>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need a password reset?</h2>
                  <p>
                    Elora now operates entirely online. To protect your account, our support team handles password
                    resets manually. Send us an email from the address linked to your account and we&apos;ll guide you
                    through the secure reset process.
                  </p>
                </div>

                <div className="rounded-lg border border-white/15 bg-white/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">Email Support</span>
                  </div>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Password%20reset%20request&body=Hello%20Elora%20team%2C%0D%0A%0D%0APlease%20help%20me%20reset%20my%20password.%20My%20account%20email%20is%3A%20${encodeURIComponent(email || '')}`}
                    className="inline-flex items-center gap-2 text-[#4BB6B7] hover:text-[#28CACD] transition-colors"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>

                <p className="text-xs text-white/60">
                  Tip: include your account email and any recent activity to help us verify ownership quickly.
                </p>

                <div className="flex flex-col gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Your account email"
                    className="bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400"
                  />
                  <Button
                    className="bg-[#022A2D] hover:bg-[#28CACD] text-white"
                    onClick={() =>
                      window.open(
                        `mailto:${SUPPORT_EMAIL}?subject=Password%20reset%20request&body=Hello%20Elora%20team%2C%0D%0A%0D%0APlease%20help%20me%20reset%20my%20password.%20My%20account%20email%20is%3A%20${encodeURIComponent(
                          email || ''
                        )}`,
                        '_blank'
                      )
                    }
                  >
                    Email Support
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay Container - Hidden during terms view */}
          {!isTermsMode && (
            <div className="auth-overlay-container">
              <div className="auth-overlay">
                <div className="auth-overlay-panel auth-overlay-left">
                  <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Welcome Back!</h1>
                  <p className="mb-4 md:mb-6 text-sm md:text-base">To keep connected with us please login with your personal info</p>
                  <Button
                    className="ghost bg-transparent border border-white text-white hover:bg-white hover:text-[#143C3D] transition-all duration-300 text-sm md:text-base h-9 md:h-12 px-4 md:px-6"
                    onClick={() => setAuthMode('login')}
                    disabled={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
                <div className="auth-overlay-panel auth-overlay-right">
                  <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Hello, Friend!</h1>
                  <p className="mb-4 md:mb-6 text-sm md:text-base">Enter your personal details and start journey with us</p>
                  <Button
                    className="ghost bg-transparent border border-white text-white hover:bg-white hover:text-[#143C3D] transition-all duration-300 text-sm md:text-base h-9 md:h-12 px-4 md:px-6"
                    onClick={() => setAuthMode('register')}
                    disabled={isLoading}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Google Sign In Button Component
const GoogleSignInButton = ({ onSuccess, isLoading }: { onSuccess: (token: string) => void; isLoading: boolean }) => {
  return (
    <div className="w-full" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '100%', opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
        <GoogleLogin
          onSuccess={(credentialResponse: { credential?: string }) => {
            if (credentialResponse.credential) {
              // credentialResponse.credential contains the ID token
              onSuccess(credentialResponse.credential);
            }
          }}
          onError={() => {
            console.error('Google login failed');
          }}
          useOneTap={false}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          logo_alignment="left"
        />
      </div>
    </div>
  );
};

export default AuthModal;