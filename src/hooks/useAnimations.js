import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';
import { optimizeForPerformance, animationCleanup } from '../utils/animations';

// Custom hook for managing animation states
export const useAnimations = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
};

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    threshold, 
    once: triggerOnce,
    margin: "-50px 0px -50px 0px"
  });

  return { ref, isInView };
};

// Custom hook for staggered list animations
export const useStaggeredAnimation = (items, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const { prefersReducedMotion } = useAnimations();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleItems(items.map((_, index) => index));
      return;
    }

    setVisibleItems([]);
    
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, index * delay);
    });
  }, [items, delay, prefersReducedMotion]);

  return visibleItems;
};

// Custom hook for typing animation
export const useTypingAnimation = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { prefersReducedMotion } = useAnimations();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, prefersReducedMotion]);

  return { displayText, isComplete };
};

// Custom hook for recording pulse animation
export const useRecordingPulse = (isRecording) => {
  const [pulseClass, setPulseClass] = useState('');
  const { prefersReducedMotion } = useAnimations();

  useEffect(() => {
    if (prefersReducedMotion) {
      setPulseClass('');
      return;
    }

    if (isRecording) {
      setPulseClass('animate-recording-pulse');
    } else {
      setPulseClass('');
    }
  }, [isRecording, prefersReducedMotion]);

  return pulseClass;
};

// Custom hook for hover animations
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { prefersReducedMotion } = useAnimations();

  const hoverProps = prefersReducedMotion ? {} : {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
};

// Custom hook for loading states with animation
export const useLoadingAnimation = (isLoading) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const { prefersReducedMotion } = useAnimations();

  useEffect(() => {
    if (isLoading) {
      setShowSpinner(true);
    } else {
      // Delay hiding spinner for smooth transition
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, prefersReducedMotion ? 0 : 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, prefersReducedMotion]);

  return showSpinner;
};

// Custom hook for page transitions
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { prefersReducedMotion } = useAnimations();

  const startTransition = () => {
    if (prefersReducedMotion) return;
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
  };

  return { isTransitioning, startTransition, endTransition };
};

// Custom hook for form validation animations
export const useFormAnimation = () => {
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState({});
  const { prefersReducedMotion } = useAnimations();

  const triggerError = (fieldName, errorMessage) => {
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
    
    if (!prefersReducedMotion) {
      setIsShaking(prev => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setIsShaking(prev => ({ ...prev, [fieldName]: false }));
      }, 500);
    }
  };

  const clearError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const getFieldProps = (fieldName) => ({
    error: errors[fieldName],
    isShaking: isShaking[fieldName],
    className: isShaking[fieldName] ? 'animate-bounce-gentle' : ''
  });

  return { errors, triggerError, clearError, getFieldProps };
};

// Custom hook for toast notifications
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

// Custom hook for intersection observer animations
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once) {
            observer.unobserve(entry.target);
          }
        } else if (!options.once) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return { ref, isVisible };
};

// Hook for performance monitoring and optimization
export const usePerformanceOptimization = () => {
  const [performanceSettings, setPerformanceSettings] = useState(null);
  const [frameRate, setFrameRate] = useState(60);
  const animationFrameRef = useRef();
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Monitor frame rate
  const measureFrameRate = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      setFrameRate(frameCountRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(measureFrameRate);
  }, []);

  useEffect(() => {
    // Get optimal settings on mount
    const settings = optimizeForPerformance.getOptimalSettings();
    setPerformanceSettings(settings);

    // Start frame rate monitoring
    animationFrameRef.current = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [measureFrameRate]);

  // Adjust animation complexity based on performance
  const getOptimizedVariants = useCallback((variants) => {
    if (!performanceSettings) return variants;

    if (frameRate < 30 || !performanceSettings.enableComplexAnimations) {
      // Simplify animations for better performance
      return optimizeForPerformance.getPerformantVariants(variants);
    }

    return variants;
  }, [performanceSettings, frameRate]);

  return {
    performanceSettings,
    frameRate,
    getOptimizedVariants,
    isPerformanceGood: frameRate >= 50
  };
};

// Hook for animation cleanup
export const useAnimationCleanup = () => {
  const timersRef = useRef([]);
  const animationIdsRef = useRef([]);

  const addTimer = useCallback((id, type = 'timeout') => {
    timersRef.current.push({ id, type });
  }, []);

  const addAnimationId = useCallback((id) => {
    animationIdsRef.current.push(id);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      animationCleanup.clearTimers(timersRef.current);
      animationCleanup.cancelAnimations(animationIdsRef.current);
    };
  }, []);

  return { addTimer, addAnimationId };
};

// Hook for debounced animations
export const useDebouncedAnimation = (callback, delay = 300) => {
  const debouncedCallback = useCallback(
    optimizeForPerformance.debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback;
};

// Hook for throttled animations (useful for scroll/resize events)
export const useThrottledAnimation = (callback, limit = 16) => {
  const throttledCallback = useCallback(
    optimizeForPerformance.throttle(callback, limit),
    [callback, limit]
  );

  return throttledCallback;
};
