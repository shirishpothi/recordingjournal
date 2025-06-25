import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ValidatedInput, PasswordInput, PasswordConfirmInput } from './EnhancedFormComponents';
import { AnimatedButton, AnimatedSpinner, ScaleIn, AnimatedPage } from './AnimatedComponents';
import { useFormValidation, usePasswordValidation, useFormSubmission } from '../hooks/useFormValidation';
import { validateUsername, validatePassword } from '../utils/validation';
import { useUI } from '../contexts/UIContext';
import { GoogleOAuthButton } from './GoogleOAuth';

// Enhanced Login Form
export const EnhancedLoginForm = ({ onLogin }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUI();
  const message = location.state?.message;

  const { isLoading, error, submitForm } = useFormSubmission();

  // Check for remembered credentials on component mount
  React.useEffect(() => {
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    const rememberedUsername = localStorage.getItem('rememberedUsername');

    if (wasRemembered && rememberedUsername) {
      setRememberMe(true);
      // The username will be set in the form validation hook initialization
    }
  }, []);

  // Get remembered username for initial values
  const getInitialValues = () => {
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    const rememberedUsername = localStorage.getItem('rememberedUsername');

    return {
      username: wasRemembered && rememberedUsername ? rememberedUsername : '',
      password: ''
    };
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  } = useFormValidation(
    getInitialValues(),
    {
      username: {
        required: true,
        validator: validateUsername,
        requiredMessage: 'Username is required'
      },
      password: {
        required: true,
        validator: validatePassword,
        requiredMessage: 'Password is required'
      }
    }
  );

  const onSubmit = async (formData) => {
    await submitForm(async () => {
      const loginData = { ...formData, rememberMe };
      await onLogin(loginData);

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedUsername');
      }

      showSuccess('Login successful!');
    });
  };

  const handleGoogleSuccess = async (googleUserData) => {
    await submitForm(async () => {
      // For now, simulate Google OAuth login
      // In a real implementation, you would send the credential to your backend
      const loginData = {
        username: googleUserData.email,
        googleId: googleUserData.id,
        name: googleUserData.name,
        picture: googleUserData.picture,
        credential: googleUserData.credential,
        isGoogleAuth: true,
        rememberMe: true // Google logins are typically remembered
      };

      // Simulate backend call - replace with actual API call
      console.log('Google OAuth login data:', loginData);

      // For demo purposes, create a mock user
      const mockUser = {
        userId: googleUserData.id,
        username: googleUserData.email,
        name: googleUserData.name,
        picture: googleUserData.picture
      };

      // Store Google auth data
      localStorage.setItem('googleAuth', 'true');
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-google-token-' + Date.now());

      showSuccess(`Welcome ${googleUserData.name}!`);
      navigate('/dashboard');

      // In a real implementation:
      // await onLogin(loginData);
    });
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth error:', error);
    showError('Google Sign-In failed. Please try again.');
  };

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <ScaleIn className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </motion.div>

          {/* Success message from registration */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg text-green-400 text-center"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ValidatedInput
                type="text"
                placeholder="Enter your username"
                label="Username"
                required
                validator={validateUsername}
                {...getFieldProps('username')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ValidatedInput
                type="password"
                placeholder="Enter your password"
                label="Password"
                required
                validator={validatePassword}
                {...getFieldProps('password')}
              />
            </motion.div>

            {/* Remember Me */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <motion.input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  whileTap={{ scale: 0.95 }}
                />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>
              
              <motion.button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot password?
              </motion.button>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AnimatedButton
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <AnimatedSpinner size="sm" className="mr-2" color="text-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </motion.div>

          {/* Google OAuth Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <GoogleOAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isLoading}
              text="Sign in with Google"
            />
          </motion.div>

          {/* Register Link */}
          <motion.p
            className="text-center text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Don't have an account?{' '}
            <motion.button
              onClick={() => navigate('/register')}
              className="text-purple-400 hover:text-purple-300 underline font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create one here
            </motion.button>
          </motion.p>
        </div>
      </ScaleIn>
    </AnimatedPage>
  );
};

// Enhanced Register Form
export const EnhancedRegisterForm = ({ onRegister }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUI();
  const { isLoading, error, submitForm } = useFormSubmission();

  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    passwordValidation,
    confirmValidation,
    handlePasswordValidation,
    handleConfirmValidation,
    isPasswordValid
  } = usePasswordValidation();

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  } = useFormValidation(
    { username: '' },
    {
      username: {
        required: true,
        validator: validateUsername,
        requiredMessage: 'Username is required'
      }
    }
  );

  const formIsValid = isValid && isPasswordValid && password.length > 0 && confirmPassword.length > 0;

  const onSubmit = async (formData) => {
    await submitForm(async () => {
      await onRegister({ ...formData, password });
      showSuccess('Registration successful! Please log in.');
    });
  };

  const handleGoogleSuccess = async (googleUserData) => {
    await submitForm(async () => {
      // For Google OAuth registration, we can directly create the account
      const registerData = {
        username: googleUserData.email,
        email: googleUserData.email,
        name: googleUserData.name,
        picture: googleUserData.picture,
        googleId: googleUserData.id,
        credential: googleUserData.credential,
        isGoogleAuth: true
      };

      console.log('Google OAuth registration data:', registerData);

      // For demo purposes, simulate successful registration and auto-login
      const mockUser = {
        userId: googleUserData.id,
        username: googleUserData.email,
        name: googleUserData.name,
        picture: googleUserData.picture
      };

      // Store Google auth data
      localStorage.setItem('googleAuth', 'true');
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-google-token-' + Date.now());

      showSuccess(`Welcome ${googleUserData.name}! Account created successfully.`);
      navigate('/dashboard');

      // In a real implementation:
      // await onRegister(registerData);
    });
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth registration error:', error);
    showError('Google Sign-Up failed. Please try again.');
  };

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <ScaleIn className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Create Account
            </h2>
            <p className="text-gray-400 mt-2">Join us and start your journey</p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ValidatedInput
                type="text"
                placeholder="Choose a username"
                label="Username"
                required
                validator={validateUsername}
                {...getFieldProps('username')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onValidation={handlePasswordValidation}
                placeholder="Create a strong password"
                label="Password"
                required
                showStrength
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <PasswordConfirmInput
                value={confirmPassword}
                password={password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onValidation={handleConfirmValidation}
                placeholder="Confirm your password"
                label="Confirm Password"
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AnimatedButton
                type="submit"
                disabled={!formIsValid || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <AnimatedSpinner size="sm" className="mr-2" color="text-white" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </motion.div>

          {/* Google OAuth Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <GoogleOAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isLoading}
              text="Sign up with Google"
            />
          </motion.div>

          {/* Login Link */}
          <motion.p
            className="text-center text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Already have an account?{' '}
            <motion.button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 underline font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign in here
            </motion.button>
          </motion.p>
        </div>
      </ScaleIn>
    </AnimatedPage>
  );
};
