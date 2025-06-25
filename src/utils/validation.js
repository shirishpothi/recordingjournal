// Validation utilities for forms

// Password strength levels
export const PASSWORD_STRENGTH = {
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong'
};

// Validation rules
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
  },
  password: {
    minLength: 6,
    maxLength: 128,
    message: 'Password must be at least 6 characters long'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
};

// Real-time validation functions
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < VALIDATION_RULES.username.minLength) {
      errors.push(`Username must be at least ${VALIDATION_RULES.username.minLength} characters`);
    }
    if (username.length > VALIDATION_RULES.username.maxLength) {
      errors.push(`Username must be no more than ${VALIDATION_RULES.username.maxLength} characters`);
    }
    if (!VALIDATION_RULES.username.pattern.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0] || ''
  };
};

export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!VALIDATION_RULES.email.pattern.test(email)) {
    errors.push(VALIDATION_RULES.email.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0] || ''
  };
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < VALIDATION_RULES.password.minLength) {
      errors.push(`Password must be at least ${VALIDATION_RULES.password.minLength} characters`);
    }
    if (password.length > VALIDATION_RULES.password.maxLength) {
      errors.push(`Password must be no more than ${VALIDATION_RULES.password.maxLength} characters`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0] || ''
  };
};

export const validatePasswordConfirmation = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0] || ''
  };
};

// Password strength calculation
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return {
      strength: PASSWORD_STRENGTH.WEAK,
      score: 0,
      feedback: []
    };
  }

  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }
  
  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }
  
  // Determine strength level
  let strength;
  if (score <= 2) {
    strength = PASSWORD_STRENGTH.WEAK;
  } else if (score <= 3) {
    strength = PASSWORD_STRENGTH.FAIR;
  } else if (score <= 4) {
    strength = PASSWORD_STRENGTH.GOOD;
  } else {
    strength = PASSWORD_STRENGTH.STRONG;
  }
  
  return {
    strength,
    score,
    feedback: feedback.slice(0, 2) // Limit to 2 most important suggestions
  };
};

// Get strength color for UI
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case PASSWORD_STRENGTH.WEAK:
      return 'text-red-500';
    case PASSWORD_STRENGTH.FAIR:
      return 'text-yellow-500';
    case PASSWORD_STRENGTH.GOOD:
      return 'text-blue-500';
    case PASSWORD_STRENGTH.STRONG:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

// Get strength background color for progress bar
export const getPasswordStrengthBgColor = (strength) => {
  switch (strength) {
    case PASSWORD_STRENGTH.WEAK:
      return 'bg-red-500';
    case PASSWORD_STRENGTH.FAIR:
      return 'bg-yellow-500';
    case PASSWORD_STRENGTH.GOOD:
      return 'bg-blue-500';
    case PASSWORD_STRENGTH.STRONG:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const rule = rules[field];
    
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
      isValid = false;
    } else if (value && rule.validator) {
      const validation = rule.validator(value);
      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};

// Debounce function for real-time validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
