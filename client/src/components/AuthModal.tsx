import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, Github, Facebook, Linkedin, Chrome, AlertCircle } from 'lucide-react';
import '../css/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

// API service functions
const authAPI = {
  async login(email: string, password: string) {
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
  },

  async register(name: string, email: string, password: string) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, confirm_password: password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsRightPanelActive(authMode === 'register');
      setError('');
      setSuccess('');
    }
  }, [isOpen, authMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const { token } = await authAPI.login(formData.email, formData.password);
        // Store token in localStorage or context
        localStorage.setItem('authToken', token);
        login(); // Update auth context (no arguments)
        setSuccess('Login successful!');
        
        // Close modal after success
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        const { token } = await authAPI.register(
          formData.name.trim(),
          formData.email,
          formData.password
        );
        // Store token in localStorage or context
        localStorage.setItem('authToken', token);
        login(); // Update auth context (no arguments)
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
      try {
        // Try to extract server message from thrown Error where message may already be parsed
        const message = error instanceof Error ? error.message : '';
        setError(message || 'Authentication failed. Please try again.');
      } catch (_) {
        setError('Authentication failed. Please try again.');
      }
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
    });
    setError('');
    setSuccess('');
    setAuthMode('login');
    setIsRightPanelActive(false);
  };


  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const isRegisterMode = authMode === 'register';
  const passwordsMatch = !isRegisterMode || formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.password && 
    (!isRegisterMode || (formData.name && passwordsMatch));

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
            <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">Spoke Bee</h1>
              
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
              
              {isRegisterMode && (
                <div className="auth-input-container mb-4">
                  <div className="auth-input-wrapper">
                    <User className="auth-input-icon" />
                    <Input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
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
                    minLength={6}
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

              {isRegisterMode && (
                <div className="auth-password-container mb-4">
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" />
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10 pr-10"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest disabled:opacity-50"
                disabled={!isFormValid || isLoading || !!error}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isRegisterMode ? 'Create Account' : 'Sign In'
                )}
              </Button>

              {!isRegisterMode && (
                <div className="auth-pass-link">
                  <a href="/forgot-password" className="text-[#4BB6B7] hover:text-[#28CACD] text-sm transition-colors">
                    Forgot your password?
                  </a>
                </div>
              )}

              <div className="auth-terms-container">
                <a href="/terms" className="auth-terms-link">Terms and Conditions</a>
                |
                <a href="/privacy" className="auth-terms-link">Privacy Policy</a>
              </div>

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

          {/* Login Form */}
          <div className="auth-form-container auth-login-container">
            <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">Spoke Bee</h1>
              
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
                disabled={!isFormValid || isLoading || !!error}
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
                <a href="/forgot-password" className="text-[#4BB6B7] hover:text-[#28CACD] text-sm transition-colors">
                  Forgot your password?
                </a>
              </div>

              <div className="auth-terms-container">
                <a href="/terms" className="auth-terms-link">Terms and Conditions</a>
                |
                <a href="/privacy" className="auth-terms-link">Privacy Policy</a>
              </div>

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