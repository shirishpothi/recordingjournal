import { useState, useCallback, useEffect } from 'react';

// Custom hook for managing form validation state
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update a single field value
  const setValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Update a single field error
  const setError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  // Mark a field as touched
  const markFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  // Handle field change
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setValue(field, value);
    
    // Mark field as touched if it wasn't already
    if (!touched[field]) {
      markFieldTouched(field, true);
    }
  }, [setValue, touched]);

  // Handle field blur
  const handleBlur = useCallback((field) => () => {
    markFieldTouched(field, true);
  }, [markFieldTouched]);

  // Validate a single field
  const validateField = useCallback((field, value) => {
    const rule = validationRules[field];
    if (!rule) return { isValid: true, message: '' };

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return { isValid: false, message: rule.requiredMessage || `${field} is required` };
    }

    // Custom validator
    if (rule.validator && value) {
      return rule.validator(value);
    }

    return { isValid: true, message: '' };
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach(field => {
      const validation = validateField(field, values[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.message;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [values, validateField, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    const formIsValid = validateForm();
    
    if (formIsValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [values, validateForm, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props for easy integration
  const getFieldProps = useCallback((field) => ({
    value: values[field] || '',
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: touched[field] && errors[field],
    isValid: touched[field] && !errors[field] && values[field]
  }), [values, handleChange, handleBlur, touched, errors]);

  // Validate fields on value change
  useEffect(() => {
    Object.keys(values).forEach(field => {
      if (touched[field]) {
        const validation = validateField(field, values[field]);
        setError(field, validation.isValid ? '' : validation.message);
      }
    });
  }, [values, touched, validateField, setError]);

  // Update overall form validity
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error);
    const hasRequiredFields = Object.keys(validationRules).every(field => {
      const rule = validationRules[field];
      if (rule.required) {
        return values[field] && values[field].toString().trim() !== '';
      }
      return true;
    });
    
    setIsValid(!hasErrors && hasRequiredFields);
  }, [errors, values, validationRules]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    markFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    getFieldProps
  };
};

// Hook for password validation with confirmation
export const usePasswordValidation = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({ isValid: true, message: '', strength: null });
  const [confirmValidation, setConfirmValidation] = useState({ isValid: true, message: '' });

  const handlePasswordValidation = useCallback((validation) => {
    setPasswordValidation(validation);
  }, []);

  const handleConfirmValidation = useCallback((validation) => {
    setConfirmValidation(validation);
  }, []);

  const isPasswordValid = passwordValidation.isValid && confirmValidation.isValid;

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    passwordValidation,
    confirmValidation,
    handlePasswordValidation,
    handleConfirmValidation,
    isPasswordValid
  };
};

// Hook for managing form submission states
export const useFormSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submitForm = useCallback(async (submitFunction) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await submitFunction();
      setSuccess(result?.message || 'Success!');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isLoading,
    error,
    success,
    submitForm,
    clearMessages,
    setError,
    setSuccess
  };
};
