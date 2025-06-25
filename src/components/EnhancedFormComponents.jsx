import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedInput } from './AnimatedComponents';
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthBgColor,
  debounce 
} from '../utils/validation';

// Enhanced input with real-time validation
export const ValidatedInput = ({
  type = 'text',
  value,
  onChange,
  onValidation,
  validator,
  placeholder,
  label,
  required = false,
  className = '',
  showValidation = true,
  debounceMs = 300,
  ...props
}) => {
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((val) => {
      if (validator && isTouched) {
        const result = validator(val);
        setValidation(result);
        if (onValidation) {
          onValidation(result);
        }
      }
    }, debounceMs),
    [validator, isTouched, onValidation, debounceMs]
  );

  useEffect(() => {
    debouncedValidate(value);
  }, [value, debouncedValidate]);

  const handleChange = (e) => {
    onChange(e);
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
  };

  const hasError = isTouched && !validation.isValid;
  const showSuccess = isTouched && validation.isValid && value.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <AnimatedInput
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          error={hasError}
          className={`
            w-full px-3 py-2 bg-gray-800/50 border rounded-md text-white placeholder-gray-400
            focus:outline-none focus:ring-2 transition-all duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500/50' 
              : showSuccess 
                ? 'border-green-500 focus:ring-green-500/50'
                : 'border-gray-600 focus:ring-purple-500/50'
            }
            ${className}
          `}
          {...props}
        />
        
        {/* Validation icon */}
        <AnimatePresence>
          {isTouched && value.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {validation.isValid ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation message */}
      {showValidation && (
        <AnimatePresence>
          {isTouched && validation.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm ${hasError ? 'text-red-400' : 'text-green-400'}`}
            >
              {validation.message}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Password input with strength indicator
export const PasswordInput = ({
  value,
  onChange,
  onValidation,
  placeholder = "Enter password",
  label = "Password",
  showStrength = true,
  required = false,
  className = '',
  ...props
}) => {
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [strength, setStrength] = useState(null);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Debounced validation and strength calculation
  const debouncedValidate = useCallback(
    debounce((val) => {
      if (isTouched) {
        const validationResult = validatePassword(val);
        const strengthResult = calculatePasswordStrength(val);
        
        setValidation(validationResult);
        setStrength(strengthResult);
        
        if (onValidation) {
          onValidation({ ...validationResult, strength: strengthResult });
        }
      }
    }, 300),
    [isTouched, onValidation]
  );

  useEffect(() => {
    debouncedValidate(value);
  }, [value, debouncedValidate]);

  const handleChange = (e) => {
    onChange(e);
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const hasError = isTouched && !validation.isValid;
  const strengthPercentage = strength ? (strength.score / 6) * 100 : 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <AnimatedInput
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          error={hasError}
          className={`
            w-full px-3 py-2 pr-10 bg-gray-800/50 border rounded-md text-white placeholder-gray-400
            focus:outline-none focus:ring-2 transition-all duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-purple-500/50'
            }
            ${className}
          `}
          {...props}
        />
        
        {/* Show/Hide password toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      {showStrength && value.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {/* Strength bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full transition-all duration-300 ${
                  strength ? getPasswordStrengthBgColor(strength.strength) : 'bg-gray-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${strengthPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Strength text and feedback */}
            {strength && (
              <div className="flex justify-between items-start text-sm">
                <span className={`font-medium ${getPasswordStrengthColor(strength.strength)}`}>
                  {strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)} Password
                </span>
                {strength.feedback.length > 0 && (
                  <div className="text-gray-400 text-right">
                    {strength.feedback.map((tip, index) => (
                      <div key={index}>{tip}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Validation message */}
      <AnimatePresence>
        {isTouched && validation.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-400"
          >
            {validation.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Password confirmation input
export const PasswordConfirmInput = ({
  value,
  password,
  onChange,
  onValidation,
  placeholder = "Confirm password",
  label = "Confirm Password",
  required = false,
  className = '',
  ...props
}) => {
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [isTouched, setIsTouched] = useState(false);

  const debouncedValidate = useCallback(
    debounce((val, pass) => {
      if (isTouched) {
        const result = validatePasswordConfirmation(pass, val);
        setValidation(result);
        if (onValidation) {
          onValidation(result);
        }
      }
    }, 300),
    [isTouched, onValidation]
  );

  useEffect(() => {
    debouncedValidate(value, password);
  }, [value, password, debouncedValidate]);

  const handleChange = (e) => {
    onChange(e);
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const hasError = isTouched && !validation.isValid;
  const showSuccess = isTouched && validation.isValid && value.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <AnimatedInput
          type="password"
          value={value}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          error={hasError}
          className={`
            w-full px-3 py-2 pr-10 bg-gray-800/50 border rounded-md text-white placeholder-gray-400
            focus:outline-none focus:ring-2 transition-all duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500/50' 
              : showSuccess 
                ? 'border-green-500 focus:ring-green-500/50'
                : 'border-gray-600 focus:ring-purple-500/50'
            }
            ${className}
          `}
          {...props}
        />
        
        {/* Validation icon */}
        <AnimatePresence>
          {isTouched && value.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {validation.isValid ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {isTouched && validation.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm ${hasError ? 'text-red-400' : 'text-green-400'}`}
          >
            {validation.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
