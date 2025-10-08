import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, Github, Facebook, Linkedin, Chrome, AlertCircle, ArrowLeft } from 'lucide-react';
import '../css/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

interface User {
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  email: string;
  name: string;
  createdAt: string;
}

// Security questions for user registration
const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What is the name of your first pet?",
  "What was your favorite school teacher's name?",
  "What is your favorite movie?",
  "What is your favorite book?",
  "What is the name of the street you grew up on?",
  "What is your favorite food?",
  "What is your dream job?",
  "What is your favorite vacation spot?"
];

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
      password: password, // Store the current password
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
    // Clear errors when user starts typing
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
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Forgot Password Functions
  const handleEmailSubmit = () => {
    // Basic email validation
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

    // Force a fresh read from localStorage to avoid caching issues
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Find the user index to ensure we're updating the correct user
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (userIndex === -1) {
      setError("User not found in the system. Please try again.");
      return;
    }

    // Create updated user object with new password - this will replace the old password permanently
    const updatedUser = {
      ...users[userIndex],
      password: newPassword // This becomes the new permanent password
    };

    // Update the users array
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    // Save back to localStorage - this permanently replaces the old password
    try {
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Verify the change was saved by reading it back
      const verifyUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const verifiedUser = verifyUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      
      if (verifiedUser && verifiedUser.password === newPassword) {
        setSuccess("Password reset successfully! You can now log in with your new password.");
        
        // Reset state after success
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
        // Show loading state properly
        const { token, user: userData } = await authAPI.login(formData.email, formData.password);
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        login(); // Update auth context
        
        setSuccess('Login successful!');
        
        // Close modal after success
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        // Registration flow
        const { token, user: userData } = await authAPI.register(
          formData.name.trim(),
          formData.email,
          formData.password, // This becomes the permanent password until changed
          formData.securityQuestion,
          formData.securityAnswer
        );
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        login(); // Update auth context
        
        setSuccess('Registration successful!');
        
        // Auto-switch to login mode after successful registration
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
      // The social login will redirect, so we don't need to handle the response here
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
    resetForgotPasswordFlow();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const isRegisterMode = authMode === 'register';
  const isForgotPasswordMode = authMode === 'forgot-password';
  const passwordsMatch = !isRegisterMode || formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.password && 
    (!isRegisterMode || (formData.name && passwordsMatch && formData.securityAnswer));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 bg-transparent flex items-center justify-center min-h-screen">
        {/* Home Button */}
        <div className="auth-page-home-button">
          <button className="auth-home-button" onClick={onClose}>
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className={`auth-modal-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
          {/* Register Form */}
          <div className="auth-form-container auth-register-container">
            <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-4 flex flex-col justify-center overflow-visible">
              <h1 className="text-xl font-bold text-white mb-2 text-center">Speak Bee</h1>
              
              {/* Error Message */}
              {error && (
                <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mb-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-xs">
                  <span>{success}</span>
                </div>
              )}
              
              <div className="auth-input-container mb-2">
                <div className="auth-input-wrapper">
                  <User className="auth-input-icon" />
                  <Input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="auth-input-container mb-2">
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="auth-password-container mb-2">
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min. 8 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-8 text-xs"
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

              <div className="auth-password-container mb-2">
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-8 text-xs"
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
              <div className="auth-input-container mb-2">
                <div className="auth-input-wrapper">
                  <select
                    name="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-4 w-full rounded-md border text-xs"
                    required
                    disabled={isLoading}
                  >
                    {SECURITY_QUESTIONS.map((question, index) => (
                      <option key={index} value={question} className="text-xs">
                        {question}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-input-container mb-3">
                <div className="auth-input-wrapper">
                  <Input
                    name="securityAnswer"
                    type="text"
                    placeholder="Your answer (for password recovery)"
                    value={formData.securityAnswer}
                    onChange={handleInputChange}
                    className="h-8 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-8 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest disabled:opacity-50 text-xs mb-2"
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
                <div className="auth-pass-link mb-2">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-[#4BB6B7] hover:text-[#28CACD] text-xs transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <div className="auth-terms-container mb-2">
                <a href="/terms" className="auth-terms-link text-xs">Terms and Conditions</a>
                <span className="text-[#4BB6B7] mx-1 text-xs">|</span>
                <a href="/privacy" className="auth-terms-link text-xs">Privacy Policy</a>
              </div>

              {/* Social icons REMOVED from register form */}
            </form>
          </div>

          {/* Login Form */}
          <div className="auth-form-container auth-login-container">
            <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">Speak Bee</h1>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                  <span className="text-sm">{success}</span>
                </div>
              )}
              
              <div className="auth-input-container mb-4">
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="auth-password-container mb-4">
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest disabled:opacity-50"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="auth-pass-link">
                <button 
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-[#4BB6B7] hover:text-[#28CACD] text-sm transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="auth-terms-container">
                <a href="/terms" className="auth-terms-link">Terms and Conditions</a>
                |
                <a href="/privacy" className="auth-terms-link">Privacy Policy</a>
              </div>

              {/* Social icons KEPT in login form */}
              <div className="auth-social-container">
                {['github', 'facebook', 'google', 'linkedin'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => handleSocialLogin(provider)}
                    className="auth-social-icon disabled:opacity-50"
                    disabled={isLoading}
                    type="button"
                  >
                    {provider === 'github' && <Github className="w-5 h-5" />}
                    {provider === 'facebook' && <Facebook className="w-5 h-5" />}
                    {provider === 'google' && <Chrome className="w-5 h-5" />}
                    {provider === 'linkedin' && <Linkedin className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Forgot Password Form */}
          {isForgotPasswordMode && (
            <div className="auth-form-container auth-forgot-password-container" style={{ zIndex: 10 }}>
              <div className="h-full bg-[#143C3D] p-8 flex flex-col justify-center">
                {/* Back Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      resetForgotPasswordFlow();
                    }}
                    className="flex items-center text-[#4BB6B7] hover:text-[#28CACD] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </button>
                </div>

                <h1 className="text-3xl font-bold text-white mb-6 text-center">Speak Bee</h1>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {/* Step 1: Email Verification */}
                {forgotPasswordStep === 1 && (
                  <div>
                    <div className="auth-input-container mb-4">
                      <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleEmailSubmit}
                      className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest"
                      disabled={!email}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Step 2: Security Question */}
                {forgotPasswordStep === 2 && user && (
                  <div>
                    <h2 className="text-xl font-medium mb-3 text-center text-white">
                      Security Question
                    </h2>
                    <p className="text-lg text-white text-center mb-4 font-semibold">
                      {user.securityQuestion}
                    </p>
                    <div className="auth-input-container mb-4">
                      <div className="auth-input-wrapper">
                        <Input
                          type="text"
                          placeholder="Enter your answer"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-4"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAnswerSubmit}
                      className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest"
                      disabled={!securityAnswer}
                    >
                      Verify Answer
                    </Button>
                  </div>
                )}

                {/* Step 3: Reset Password */}
                {forgotPasswordStep === 3 && (
                  <div>
                    <div className="auth-password-container mb-4">
                      <div className="auth-input-wrapper">
                        <Lock className="auth-input-icon" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password (min. 8 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-10"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handlePasswordReset}
                      className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest"
                      disabled={!newPassword || newPassword.length < 8}
                    >
                      Reset Password
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overlay Container */}
          <div className="auth-overlay-container">
            <div className="auth-overlay">
              <div className="auth-overlay-panel auth-overlay-left">
                <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                <p className="mb-6">To keep connected with us please login with your personal info</p>
                <Button
                  className="ghost bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#143C3D]"
                  onClick={() => setAuthMode('login')}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </div>
              <div className="auth-overlay-panel auth-overlay-right">
                <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
                <p className="mb-6">Enter your personal details and start journey with us</p>
                <Button
                  className="ghost bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#143C3D]"
                  onClick={() => setAuthMode('register')}
                  disabled={isLoading}
                >
                  Register
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;