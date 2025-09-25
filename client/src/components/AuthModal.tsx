import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Home, Github, Facebook, Linkedin, Chrome } from 'lucide-react';
import '../css/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsRightPanelActive(authMode === 'register');
    }
  }, [isOpen, authMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      login();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login();
      onClose();
      resetForm();
      setIsLoading(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setAuthMode('login');
    setIsRightPanelActive(false);
  };

  const toggleAuthMode = () => {
    const newMode = authMode === 'login' ? 'register' : 'login';
    setAuthMode(newMode);
    setIsRightPanelActive(newMode === 'register');
    setFormData(prev => ({ ...prev, confirmPassword: '' }));
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
        {/* Home Button - Moved to top left corner of page */}
        <div className="auth-page-home-button">
          <button className="auth-home-button" onClick={onClose}>
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className={`auth-modal-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
          {/* Register Form */}
          <div className="auth-form-container auth-register-container">
            <form onSubmit={handleAuth} className="h-full bg-[#143C3D] p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">Vocario</h1>
              
              {isRegisterMode && (
                <div className="auth-input-container mb-4">
                  <div className="auth-input-wrapper">
                    <User className="auth-input-icon" />
                    <Input
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                      required
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
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                    required
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
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {!passwordsMatch && isRegisterMode && (
                <p className="text-red-400 text-sm mb-4">Passwords do not match</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isRegisterMode ? 'Register' : 'Login'
                )}
              </Button>

              {!isRegisterMode && (
                <div className="auth-pass-link">
                  <a href="#" className="text-[#4BB6B7] hover:text-[#28CACD] text-sm transition-colors">
                    Forgot your password?
                  </a>
                </div>
              )}

              <div className="auth-terms-container">
                <a href="#" className="auth-terms-link">Terms and Conditions</a>
                |
                <a href="#" className="auth-terms-link">Privacy Policy</a>
              </div>

              <div className="auth-social-container">
                {['github', 'facebook', 'google', 'linkedin'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => handleSocialLogin(provider)}
                    className="auth-social-icon"
                    disabled={isLoading}
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
              <h1 className="text-3xl font-bold text-white mb-6 text-center">Vocario</h1>
              
              <div className="auth-input-container mb-4">
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 bg-[#022A2D] border-[#022A2D] text-white placeholder-gray-400 pl-10"
                    required
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
                type="submit"
                className="w-full h-12 bg-[#022A2D] hover:bg-[#28CACD] text-white font-bold rounded-2xl transition-all duration-300 hover:tracking-widest"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <div className="auth-pass-link">
                <a href="#" className="text-[#4BB6B7] hover:text-[#28CACD] text-sm transition-colors">
                  Forgot your password?
                </a>
              </div>

              <div className="auth-terms-container">
                <a href="#" className="auth-terms-link">Terms and Conditions</a>
                |
                <a href="#" className="auth-terms-link">Privacy Policy</a>
              </div>

              <div className="auth-social-container">
                {['github', 'facebook', 'google', 'linkedin'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => handleSocialLogin(provider)}
                    className="auth-social-icon"
                    disabled={isLoading}
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