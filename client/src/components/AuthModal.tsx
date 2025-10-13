import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, AlertCircle, ArrowLeft, FileText, Check } from 'lucide-react';
import { TERMS_AND_CONDITIONS, SECURITY_QUESTIONS } from '../data/terms-and-conditions';
import { userDataService } from '@/services/UserDataService';
import '../css/AuthModal.css';

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
        }
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
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Forgot password states
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);

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

  // Add this useEffect to handle auth mode changes specifically for forgot password
  useEffect(() => {
    if (isOpen) {
      // Update panel state based on current auth mode
      if (authMode === 'register' || authMode === 'forgot-password') {
        setIsRightPanelActive(true);
      } else {
        setIsRightPanelActive(false);
      }
      
      setError('');
      setSuccess('');

      // Auto-fill credentials when switching to login after registration
      if (authMode === 'login' && autoFillCredentials) {
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

  // Forgot Password Functions
  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const foundUser = await authService.getUserByEmail(email);
      if (foundUser) {
        setUser(foundUser as User);
        setForgotPasswordStep(2);
      } else {
        setError("No account found with this email address. Please check your email or register for a new account.");
      }
    } catch (error) {
      setError("Error finding user account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      const isValid = await authService.verifySecurityAnswer(user.email, securityAnswer);
      if (isValid) {
        setForgotPasswordStep(3);
      } else {
        setError('Incorrect security answer. Please try again.');
      }
    } catch (error) {
      setError('Error verifying security answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;

    if (newPassword.trim() === "") {
      setError("Password cannot be empty!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // For legacy users without security question, allow reset without answer
      const needsAnswer = !!user.securityQuestion && user.securityQuestion !== 'What is your favorite color?';

      await authService.resetPassword(
        user.email,
        needsAnswer ? securityAnswer : '',
        newPassword
      );

      setSuccess("Password reset successfully! You can now log in with your new password.");

      setTimeout(() => {
        setAuthMode('login');
        resetForgotPasswordFlow();
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordStep(1);
    setUser(null);
    setEmail("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmNewPassword("");
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
        const { token, user: userData } = await authService.login(formData.email, formData.password);

        localStorage.setItem('speakbee_auth_token', token);
        localStorage.setItem('speakbee_current_user', JSON.stringify(userData));
        login(userData); // Pass userData to login

        setSuccess('Login successful!');

        setTimeout(() => {
          // If redirected from kids page, don't close the modal but call onAuthSuccess
          if (redirectFromKids && onAuthSuccess) {
            onAuthSuccess();
          } else {
            onClose();
          }
          resetForm();
        }, 1000);
      } else {
        const { token, user: userData } = await authService.register(
          formData.name.trim(),
          formData.email,
          formData.password,
          formData.securityQuestion,
          formData.securityAnswer
        );

        localStorage.setItem('speakbee_auth_token', token);
        localStorage.setItem('speakbee_current_user', JSON.stringify(userData));

        // Store credentials for auto-fill and switch to login
        setAutoFillCredentials({
          email: formData.email,
          password: formData.password
        });

        setSuccess('Registration successful! Redirecting to login...');

        // Switch to login mode after a short delay
        setTimeout(() => {
          setAuthMode('login');
          setIsRightPanelActive(false);
        }, 1500);

        // Don't close the modal yet, let user login immediately
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
      'Data Security', 'By You', 'By Speak Bee', 'Effect of Termination',
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
                <strong>I have read, understood, and agree to be bound by the Terms and Conditions Agreement.</strong> I acknowledge that this is a legal contract between me and Speak Bee, and I understand my rights and responsibilities as outlined in this document.
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
            Questions? Contact us at <strong>support@speakbee.ai</strong>
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
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent flex items-center justify-center min-h-screen max-h-screen">
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
                  <h1 className="text-lg md:text-xl font-bold text-white mb-1">Speak Bee</h1>
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
                          onClick={() => setAuthMode('terms')}
                          className="text-[#4BB6B7] hover:text-[#28CACD] underline transition-colors font-semibold"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and acknowledge that this is a legal agreement between me and Speak Bee.
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
              <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-4 md:p-8 flex flex-col justify-center">
                <div className="text-center mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Speak Bee</h1>
                  <p className="text-[#4BB6B7] text-sm md:text-base">Welcome back to your English learning journey</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                    <span className="flex-1 text-xs md:text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-sm">
                    <span className="text-xs md:text-sm">{success}</span>
                  </div>
                )}

                {isCheckingUser ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4BB6B7]" />
                    <span className="ml-2 text-white text-base">Checking your account...</span>
                  </div>
                ) : (
                  <>
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
                          setForgotPasswordStep(1);
                          setIsRightPanelActive(true); // Add this line
                          setAuthMode('forgot-password');
                        }}
                        className="text-[#4BB6B7] hover:text-[#28CACD] text-xs md:text-sm transition-colors font-medium"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    <div className="auth-terms-container auth-compact-terms flex items-center justify-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('terms')}
                        className="auth-terms-link flex items-center text-xs md:text-sm"
                      >
                        <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Terms and Conditions
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
              <div className="h-full bg-[#143C3D] p-4 md:p-8 flex flex-col justify-center">
                {/* Back Button */}
                <div className="mb-3 md:mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setIsRightPanelActive(false); // Add this line
                      resetForgotPasswordFlow();
                    }}
                    className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors text-xs md:text-sm"
                  >
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Back to Login
                  </button>
                </div>

                <div className="text-center mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-1">Speak Bee</h1>
                  <p className="text-[#4BB6B7] text-sm md:text-base">Reset Your Password</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                    <span className="text-xs md:text-sm">{success}</span>
                  </div>
                )}

                {/* Step 1: Email Verification */}
                {forgotPasswordStep === 1 && (
                  <div>
                    <div className="auth-input-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 text-sm md:text-base"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleEmailSubmit}
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={!email || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Checking...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                )}

                {/* Step 2: Security Question */}
                {forgotPasswordStep === 2 && user && (
                  <div>
                    <h2 className="text-lg md:text-xl font-medium mb-2 md:mb-3 text-center text-white">
                      Security Question
                    </h2>
                    {user.securityQuestion ? (
                      <p className="text-base md:text-lg text-white text-center mb-3 md:mb-4 font-semibold">
                        {user.securityQuestion}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base text-[#4BB6B7] text-center mb-3 md:mb-4">
                        This account has no security question set. You can reset your password directly.
                      </p>
                    )}
                    <div className="auth-input-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Input
                          type="text"
                          placeholder="Enter your answer"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-4 text-sm md:text-base"
                          required={!!user.securityQuestion}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={user.securityQuestion ? handleAnswerSubmit : () => setForgotPasswordStep(3)}
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={(!!user.securityQuestion && !securityAnswer) || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {user.securityQuestion ? 'Verifying...' : 'Continuing...'}
                        </>
                      ) : (
                        user.securityQuestion ? 'Verify Answer' : 'Continue'
                      )}
                    </Button>
                  </div>
                )}

                {/* Step 3: Reset Password */}
                {forgotPasswordStep === 3 && (
                  <div>
                    <div className="auth-password-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password (min. 8 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-9 md:pr-10 text-sm md:text-base"
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
                          {showPassword ? <EyeOff className="h-3 w-3 md:h-4 md:w-4" /> : <Eye className="h-3 w-3 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-password-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-9 md:pr-10 text-sm md:text-base"
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
                          {showPassword ? <EyeOff className="h-3 w-3 md:h-4 md:w-4" /> : <Eye className="h-3 w-3 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handlePasswordReset}
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={!newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </div>
                )}
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

export default AuthModal;