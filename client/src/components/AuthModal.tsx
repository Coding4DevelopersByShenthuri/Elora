import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, Github, Facebook, Linkedin, Chrome, AlertCircle, ArrowLeft, FileText, Check, ExternalLink } from 'lucide-react';
import { TERMS_AND_CONDITIONS, SECURITY_QUESTIONS } from './terms-and-conditions';
import '../css/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'terms';

interface User {
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  email: string;
  name: string;
  createdAt: string;
}

// API service functions
const authAPI = {
  async login(email: string, password: string) {
    // Check localStorage for users
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (foundUser) {
      return { token: 'local-storage-token', user: foundUser };
    }

    // Fallback to API if no local user found
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  async register(name: string, email: string, password: string, securityQuestion: string, securityAnswer: string) {
    // Save to localStorage for offline use
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Create new user with security question
    const newUser: User = {
      username: email.split('@')[0],
      name: name.trim(),
      email: email.toLowerCase(),
      password: password,
      securityQuestion,
      securityAnswer: securityAnswer.toLowerCase().trim(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { token: 'local-storage-token', user: newUser };
  },

  async socialLogin(provider: string) {
    // Redirect to social login endpoint
    window.location.href = `/api/auth/${provider}`;
  }
};

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
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

  useEffect(() => {
    if (isOpen) {
      setIsRightPanelActive(authMode === 'register');
      setError('');
      setSuccess('');
    }
  }, [isOpen, authMode]);

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

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Forgot Password Functions
  const handleEmailSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (found) {
      setUser(found);
      setForgotPasswordStep(2);
      setError('');
    } else {
      setError("No account found with this email address. Please check your email or register for a new account.");
    }
  };

  const handleAnswerSubmit = () => {
    if (!user) return;
    
    const userAnswer = securityAnswer.trim().toLowerCase();
    const correctAnswer = user.securityAnswer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
      setForgotPasswordStep(3);
      setError('');
    } else {
      setError("Incorrect security answer. Please try again.");
    }
  };

  const handlePasswordReset = () => {
    if (!user) return;
    if (newPassword.trim() === "") {
      setError("Password cannot be empty!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (userIndex === -1) {
      setError("User not found in the system. Please try again.");
      return;
    }

    const updatedUser = {
      ...users[userIndex],
      password: newPassword
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    try {
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      const verifyUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const verifiedUser = verifyUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      
      if (verifiedUser && verifiedUser.password === newPassword) {
        setSuccess("Password reset successfully! You can now log in with your new password.");
        
        setTimeout(() => {
          setAuthMode('login');
          resetForgotPasswordFlow();
        }, 2000);
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (error) {
      setError("Failed to save password. Please try again.");
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordStep(1);
    setUser(null);
    setEmail("");
    setSecurityAnswer("");
    setNewPassword("");
    setError('');
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
        const { token, user: userData } = await authAPI.login(formData.email, formData.password);
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        login();
        
        setSuccess('Login successful!');
        
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        const { token, user: userData } = await authAPI.register(
          formData.name.trim(),
          formData.email,
          formData.password,
          formData.securityQuestion,
          formData.securityAnswer
        );
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        login();
        
        setSuccess('Registration successful!');
        
        setTimeout(() => {
          setAuthMode('login');
          setIsRightPanelActive(false);
          setSuccess('Registration successful! Please login.');
        }, 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await authAPI.socialLogin(provider);
    } catch (error) {
      console.error('Social login error:', error);
      setError(`Social login with ${provider} failed. Please try again.`);
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
    const scrollPercent = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setScrollPosition(scrollPercent);
  };

  const isRegisterMode = authMode === 'register';
  const isForgotPasswordMode = authMode === 'forgot-password';
  const isTermsMode = authMode === 'terms';
  const passwordsMatch = !isRegisterMode || formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.password && 
    (!isRegisterMode || (formData.name && passwordsMatch && formData.securityAnswer && acceptedTerms));

  // Modern Terms and Conditions Modal Component
  const TermsModal = () => (
    <div className="auth-form-container auth-terms-container" style={{ zIndex: 20, width: '100%' }}>
      <div className="h-full bg-[#143C3D] p-4 md:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors text-xs md:text-sm"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Back to Registration
          </button>
          <div className="flex items-center space-x-1 md:space-x-2">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#28CACD]" />
            <span className="text-white font-semibold text-xs md:text-sm">Legal</span>
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

        {/* Terms Content */}
        <div 
          className="flex-1 overflow-y-auto bg-[#022A2D] p-3 md:p-4 rounded-lg mb-3 md:mb-4 custom-scrollbar"
          onScroll={handleScroll}
        >
          <div className="text-white text-xs md:text-sm leading-relaxed whitespace-pre-line terms-content">
            {TERMS_AND_CONDITIONS}
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-[#022A2D] p-3 md:p-4 rounded-lg mb-3 md:mb-4 border border-[#4BB6B7]">
          <div className="flex items-start space-x-2 md:space-x-3">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                acceptedTerms 
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
            onClick={() => setAuthMode('register')}
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
            Questions? Contact us at <strong>support@speakbee.com</strong> or visit <strong>www.speakbee.com</strong>
          </p>
        </div>
      </div>
    </div>
  );

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

        <div className={`auth-modal-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
          {/* Terms and Conditions Modal */}
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
                    className={`w-3 h-3 md:w-4 md:h-4 rounded border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                      acceptedTerms 
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

                {authMode === 'login' && (
                  <div className="auth-pass-link mb-1 md:mb-2">
                    <button 
                      type="button"
                      onClick={() => setAuthMode('forgot-password')}
                      className="text-[#4BB6B7] hover:text-[#28CACD] text-xs transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <div className="auth-terms-container mb-1 md:mb-2 flex items-center justify-center flex-wrap gap-1">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('terms')}
                    className="auth-terms-link text-xs flex items-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Terms and Conditions
                  </button>
                  <span className="text-[#4BB6B7] text-xs">|</span>
                  <a href="/privacy" className="auth-terms-link text-xs flex items-center">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Privacy Policy
                  </a>
                </div>
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
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-[#4BB6B7] hover:text-[#28CACD] text-xs md:text-sm transition-colors font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="auth-social-container auth-compact-social">
                  {['github', 'facebook', 'google', 'linkedin'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleSocialLogin(provider)}
                      className="auth-social-icon disabled:opacity-50 transition-transform hover:scale-110"
                      disabled={isLoading}
                      type="button"
                    >
                      {provider === 'github' && <Github className="w-4 h-4 md:w-5 md:h-5" />}
                      {provider === 'facebook' && <Facebook className="w-4 h-4 md:w-5 md:h-5" />}
                      {provider === 'google' && <Chrome className="w-4 h-4 md:w-5 md:h-5" />}
                      {provider === 'linkedin' && <Linkedin className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  ))}
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
                  <span className="text-[#4BB6B7]">|</span>
                  <a href="/privacy" className="auth-terms-link flex items-center text-xs md:text-sm">
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Privacy Policy
                  </a>
                </div>
              </form>
            </div>
          )}

          {/* Forgot Password Form */}
          {!isTermsMode && isForgotPasswordMode && (
            <div className="auth-form-container auth-forgot-password-container" style={{ zIndex: 10, width: '100%' }}>
              <div className="h-full bg-[#143C3D] p-4 md:p-8 flex flex-col justify-center">
                {/* Back Button */}
                <div className="mb-3 md:mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      resetForgotPasswordFlow();
                    }}
                    className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors text-xs md:text-sm"
                  >
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Back to Login
                  </button>
                </div>

                <div className="text-center mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Speak Bee</h1>
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
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleEmailSubmit}
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={!email}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Step 2: Security Question */}
                {forgotPasswordStep === 2 && user && (
                  <div>
                    <h2 className="text-lg md:text-xl font-medium mb-2 md:mb-3 text-center text-white">
                      Security Question
                    </h2>
                    <p className="text-base md:text-lg text-white text-center mb-3 md:mb-4 font-semibold">
                      {user.securityQuestion}
                    </p>
                    <div className="auth-input-container mb-3 md:mb-4">
                      <div className="auth-input-wrapper">
                        <Input
                          type="text"
                          placeholder="Enter your answer"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="h-10 md:h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-4 text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAnswerSubmit}
                      className="w-full h-10 md:h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={!securityAnswer}
                    >
                      Verify Answer
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
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-3 w-3 md:h-4 md:w-4" /> : <Eye className="h-3 w-3 md:h-4 md:w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handlePasswordReset}
                      className="w-full h-10 md:h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:tracking-widest text-sm md:text-base"
                      disabled={!newPassword || newPassword.length < 8}
                    >
                      Reset Password
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