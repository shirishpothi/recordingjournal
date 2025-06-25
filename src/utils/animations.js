// Animation utilities and Framer Motion variants

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base animation variants
export const fadeInVariants = {
  hidden: { 
    opacity: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3 }
  },
  visible: { 
    opacity: 1,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3 }
  }
};

export const slideUpVariants = {
  hidden: { 
    opacity: 0, 
    y: prefersReducedMotion() ? 0 : 20,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4, ease: "easeOut" }
  }
};

export const slideDownVariants = {
  hidden: { 
    opacity: 0, 
    y: prefersReducedMotion() ? 0 : -20,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4, ease: "easeOut" }
  }
};

export const slideLeftVariants = {
  hidden: { 
    opacity: 0, 
    x: prefersReducedMotion() ? 0 : -30,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4, ease: "easeOut" }
  }
};

export const slideRightVariants = {
  hidden: { 
    opacity: 0, 
    x: prefersReducedMotion() ? 0 : 30,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.4, ease: "easeOut" }
  }
};

export const scaleVariants = {
  hidden: { 
    opacity: 0, 
    scale: prefersReducedMotion() ? 1 : 0.9,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3 }
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3, ease: "easeOut" }
  }
};

// Container variants for staggered animations
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: prefersReducedMotion() ? 0.1 : 0.3,
      staggerChildren: prefersReducedMotion() ? 0 : 0.1,
      delayChildren: prefersReducedMotion() ? 0 : 0.1
    }
  }
};

export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    y: prefersReducedMotion() ? 0 : 10,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.2 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.2 }
  }
};

// Button hover and tap animations
export const buttonVariants = {
  hover: { 
    scale: prefersReducedMotion() ? 1 : 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  tap: { 
    scale: prefersReducedMotion() ? 1 : 0.98,
    transition: { duration: 0.1 }
  }
};

export const iconButtonVariants = {
  hover: { 
    scale: prefersReducedMotion() ? 1 : 1.1,
    rotate: prefersReducedMotion() ? 0 : 5,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  tap: { 
    scale: prefersReducedMotion() ? 1 : 0.9,
    transition: { duration: 0.1 }
  }
};

// Recording button specific animations
export const recordingButtonVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
    transition: { duration: 0.3 }
  },
  recording: {
    scale: prefersReducedMotion() ? 1 : [1, 1.1, 1],
    boxShadow: prefersReducedMotion() 
      ? "0 0 0 0 rgba(239, 68, 68, 0)"
      : [
          "0 0 0 0 rgba(239, 68, 68, 0.7)",
          "0 0 0 10px rgba(239, 68, 68, 0)",
          "0 0 0 0 rgba(239, 68, 68, 0)"
        ],
    transition: {
      duration: prefersReducedMotion() ? 0.1 : 1.5,
      repeat: prefersReducedMotion() ? 0 : Infinity,
      ease: "easeInOut"
    }
  },
  hover: {
    scale: prefersReducedMotion() ? 1 : 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: prefersReducedMotion() ? 1 : 0.95,
    transition: { duration: 0.1 }
  }
};

// Modal and overlay animations
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion() ? 1 : 0.8,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3 }
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3, ease: "easeOut" }
  }
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: prefersReducedMotion() ? 0.1 : 0.3 }
  }
};

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    x: prefersReducedMotion() ? 0 : 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: prefersReducedMotion() ? 0 : -20,
  }
};

export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: prefersReducedMotion() ? 0.1 : 0.5
};

// Form input animations
export const inputVariants = {
  focus: {
    scale: prefersReducedMotion() ? 1 : 1.02,
    transition: { duration: 0.2 }
  },
  blur: {
    scale: 1,
    transition: { duration: 0.2 }
  }
};

// Loading spinner variants
export const spinnerVariants = {
  start: {
    rotate: 0,
  },
  end: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Toast notification variants
export const toastVariants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : -50,
    scale: prefersReducedMotion() ? 1 : 0.3,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: prefersReducedMotion() ? 0.1 : 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : -50,
    scale: prefersReducedMotion() ? 1 : 0.3,
    transition: {
      duration: prefersReducedMotion() ? 0.1 : 0.3,
      ease: "easeIn"
    }
  }
};

// Utility function to create staggered children animation
export const createStaggerContainer = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : staggerDelay,
      delayChildren: prefersReducedMotion() ? 0 : 0.1
    }
  }
});

// Utility function for hover effects
export const createHoverEffect = (scale = 1.05, duration = 0.2) => ({
  scale: prefersReducedMotion() ? 1 : scale,
  transition: { duration }
});

// Get appropriate animation duration based on user preference
export const getAnimationDuration = (normalDuration = 0.3, reducedDuration = 0.1) => {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
};

// Get appropriate animation variants based on user preference
export const getReducedMotionVariants = (normalVariants, reducedVariants = {}) => {
  if (prefersReducedMotion()) {
    return {
      ...normalVariants,
      ...reducedVariants,
      // Override transitions to be faster and less complex
      transition: { duration: 0.1, ease: "linear" }
    };
  }
  return normalVariants;
};

// Performance optimization utilities
export const optimizeForPerformance = {
  // Use transform and opacity for better performance
  getPerformantVariants: (variants) => {
    const optimized = {};
    Object.keys(variants).forEach(key => {
      const variant = variants[key];
      optimized[key] = {
        ...variant,
        // Prefer transform properties over layout-affecting properties
        willChange: 'transform, opacity',
        // Use GPU acceleration
        transform: variant.transform || 'translateZ(0)',
      };
    });
    return optimized;
  },

  // Debounce function for performance-sensitive operations
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll and resize events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if device supports hardware acceleration
  supportsHardwareAcceleration: () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  },

  // Get optimal animation settings based on device capabilities
  getOptimalSettings: () => {
    const isLowEndDevice = navigator.hardwareConcurrency <= 2;
    const prefersReduced = prefersReducedMotion();
    const supportsHW = optimizeForPerformance.supportsHardwareAcceleration();

    return {
      enableComplexAnimations: !isLowEndDevice && !prefersReduced && supportsHW,
      maxConcurrentAnimations: isLowEndDevice ? 3 : 10,
      animationDuration: prefersReduced ? 0.1 : isLowEndDevice ? 0.2 : 0.3,
      enableParticleEffects: !isLowEndDevice && !prefersReduced,
      enableBlurEffects: supportsHW && !isLowEndDevice
    };
  }
};

// Animation cleanup utilities
export const animationCleanup = {
  // Clean up animation listeners
  cleanupListeners: (element) => {
    if (element) {
      element.removeEventListener('animationend', () => {});
      element.removeEventListener('transitionend', () => {});
    }
  },

  // Cancel animation frames
  cancelAnimations: (animationIds) => {
    animationIds.forEach(id => {
      if (id) cancelAnimationFrame(id);
    });
  },

  // Clear timeouts and intervals
  clearTimers: (timers) => {
    timers.forEach(timer => {
      if (timer.type === 'timeout') {
        clearTimeout(timer.id);
      } else if (timer.type === 'interval') {
        clearInterval(timer.id);
      }
    });
  }
};
