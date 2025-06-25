import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ValidatedInput, PasswordInput, PasswordConfirmInput } from './EnhancedFormComponents';
import { AnimatedButton, AnimatedSpinner, ScaleIn, AnimatedPage } from './AnimatedComponents';
import { useFormValidation, useFormSubmission, usePasswordValidation } from '../hooks/useFormValidation';
import { validateEmail } from '../utils/validation';
import { useUI } from '../contexts/UIContext';

// Forgot Password Form
export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUI();
  const [emailSent, setEmailSent] = useState(false);

  const { isLoading, error, submitForm } = useFormSubmission();

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
    { email: '' },
    {
      email: {
        required: true,
        validator: validateEmail,
        requiredMessage: 'Email is required'
      }
    }
  );

  const onSubmit = async (formData) => {
    await submitForm(async () => {
      // For now, simulate the API call since we don't have email functionality
      // In a real app, this would call the backend to send a reset email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setEmailSent(true);
      showSuccess('Password reset instructions sent to your email!');
      
      // In a real implementation:
      // await api.post('/auth/forgot-password', { email: formData.email });
    });
  };

  if (emailSent) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
        <ScaleIn className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            {/* Success Icon */}
            <motion.div
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Check Your Email
            </motion.h2>

            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We've sent password reset instructions to{' '}
              <span className="text-purple-400 font-medium">{values.email}</span>
            </motion.p>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AnimatedButton
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300"
              >
                Back to Login
              </AnimatedButton>

              <AnimatedButton
                onClick={() => {
                  setEmailSent(false);
                }}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition duration-300"
              >
                Try Different Email
              </AnimatedButton>
            </motion.div>
          </div>
        </ScaleIn>
      </AnimatedPage>
    );
  }

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
              Reset Password
            </h2>
            <p className="text-gray-400 mt-2">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
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
                type="email"
                placeholder="Enter your email address"
                label="Email Address"
                required
                validator={validateEmail}
                {...getFieldProps('email')}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatedButton
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <AnimatedSpinner size="sm" className="mr-2" color="text-white" />
                    Sending Instructions...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>

          {/* Back to Login Link */}
          <motion.p
            className="text-center text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Remember your password?{' '}
            <motion.button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 underline font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Login
            </motion.button>
          </motion.p>
        </div>
      </ScaleIn>
    </AnimatedPage>
  );
};

// Reset Password Form (for when user clicks the reset link)
export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUI();
  const [resetComplete, setResetComplete] = useState(false);

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

  const formIsValid = isPasswordValid && password.length > 0 && confirmPassword.length > 0;

  const onSubmit = async () => {
    await submitForm(async () => {
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResetComplete(true);
      showSuccess('Password reset successfully!');
      
      // In a real implementation:
      // const token = new URLSearchParams(window.location.search).get('token');
      // await api.post('/auth/reset-password', { token, password });
    });
  };

  if (resetComplete) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
        <ScaleIn className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <motion.div
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Password Reset Complete
            </motion.h2>

            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your password has been successfully reset. You can now log in with your new password.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AnimatedButton
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300"
              >
                Continue to Login
              </AnimatedButton>
            </motion.div>
          </div>
        </ScaleIn>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <ScaleIn className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Set New Password
            </h2>
            <p className="text-gray-400 mt-2">
              Choose a strong password for your account.
            </p>
          </motion.div>

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

          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
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
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onValidation={handlePasswordValidation}
                placeholder="Enter new password"
                label="New Password"
                required
                showStrength
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PasswordConfirmInput
                value={confirmPassword}
                password={password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onValidation={handleConfirmValidation}
                placeholder="Confirm new password"
                label="Confirm New Password"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AnimatedButton
                type="submit"
                disabled={!formIsValid || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <AnimatedSpinner size="sm" className="mr-2" color="text-white" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>
        </div>
      </ScaleIn>
    </AnimatedPage>
  );
};
