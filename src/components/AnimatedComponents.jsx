import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeInVariants, 
  slideUpVariants, 
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  buttonVariants,
  iconButtonVariants,
  recordingButtonVariants,
  modalVariants,
  overlayVariants,
  toastVariants,
  containerVariants,
  listItemVariants
} from '../utils/animations';

// Animated container for page content
export const AnimatedPage = ({ children, className = "", ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={fadeInVariants}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated container with staggered children
export const StaggerContainer = ({ children, className = "", delay = 0.1, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated list item
export const AnimatedListItem = ({ children, className = "", ...props }) => (
  <motion.div
    variants={listItemVariants}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Fade in animation wrapper
export const FadeIn = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide up animation wrapper
export const SlideUp = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideUpVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide down animation wrapper
export const SlideDown = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideDownVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide left animation wrapper
export const SlideLeft = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideLeftVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide right animation wrapper
export const SlideRight = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideRightVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Scale in animation wrapper
export const ScaleIn = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={scaleVariants}
    transition={{ delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated button with hover and tap effects
export const AnimatedButton = ({ 
  children, 
  className = "", 
  onClick,
  disabled = false,
  variant = "default",
  ...props 
}) => (
  <motion.button
    variants={buttonVariants}
    whileHover={!disabled ? "hover" : {}}
    whileTap={!disabled ? "tap" : {}}
    onClick={onClick}
    disabled={disabled}
    className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated icon button
export const AnimatedIconButton = ({ 
  children, 
  className = "", 
  onClick,
  disabled = false,
  ...props 
}) => (
  <motion.button
    variants={iconButtonVariants}
    whileHover={!disabled ? "hover" : {}}
    whileTap={!disabled ? "tap" : {}}
    onClick={onClick}
    disabled={disabled}
    className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated recording button with special pulse effect
export const AnimatedRecordingButton = ({ 
  children, 
  className = "", 
  onClick,
  isRecording = false,
  disabled = false,
  ...props 
}) => (
  <motion.button
    variants={recordingButtonVariants}
    animate={isRecording ? "recording" : "idle"}
    whileHover={!disabled ? "hover" : {}}
    whileTap={!disabled ? "tap" : {}}
    onClick={onClick}
    disabled={disabled}
    className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated card with hover effects
export const AnimatedCard = ({ 
  children, 
  className = "", 
  onClick,
  hoverable = true,
  ...props 
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={scaleVariants}
    whileHover={hoverable ? { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.2 }
    } : {}}
    onClick={onClick}
    className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
    {...props}
  >
    {children}
  </motion.div>
);



// Animated toast notification
export const AnimatedToast = ({ 
  children, 
  isVisible, 
  onClose,
  type = "info",
  className = "",
  ...props 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400';
      case 'error':
        return 'bg-red-500/90 border-red-400';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400';
      default:
        return 'bg-blue-500/90 border-blue-400';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={toastVariants}
          className={`
            fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-lg text-white
            ${getTypeStyles()} ${className}
          `}
          {...props}
        >
          {children}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-white/80 hover:text-white"
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated loading spinner
export const AnimatedSpinner = ({ 
  size = "md", 
  className = "",
  color = "text-purple-500",
  ...props 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} ${color} ${className}`}
      {...props}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Animated input with focus effects
export const AnimatedInput = ({ 
  className = "", 
  error,
  ...props 
}) => (
  <motion.input
    whileFocus={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className={`
      ${className} 
      ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'}
      transition-all duration-200
    `}
    {...props}
  />
);

// Animated textarea with focus effects
export const AnimatedTextarea = ({
  className = "",
  error,
  ...props
}) => (
  <motion.textarea
    whileFocus={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className={`
      ${className}
      ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'}
      transition-all duration-200
    `}
    {...props}
  />
);

// Animated waveform visualization for recording
export const AnimatedWaveform = ({
  isRecording = false,
  className = "",
  bars = 5,
  ...props
}) => {
  const waveformVariants = {
    idle: {
      scaleY: 0.3,
      transition: { duration: 0.5 }
    },
    recording: {
      scaleY: [0.3, 1, 0.5, 0.8, 0.4, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`} {...props}>
      {Array.from({ length: bars }).map((_, index) => (
        <motion.div
          key={index}
          variants={waveformVariants}
          animate={isRecording ? "recording" : "idle"}
          transition={{
            delay: index * 0.1,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-1 h-8 bg-gradient-to-t from-purple-600 to-pink-500 rounded-full"
          style={{
            transformOrigin: "bottom"
          }}
        />
      ))}
    </div>
  );
};

// Animated recording status indicator
export const AnimatedRecordingStatus = ({
  isRecording = false,
  className = "",
  ...props
}) => {
  const statusVariants = {
    idle: {
      scale: 1,
      opacity: 0.7,
      transition: { duration: 0.3 }
    },
    recording: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={statusVariants}
      animate={isRecording ? "recording" : "idle"}
      className={`flex items-center space-x-2 ${className}`}
      {...props}
    >
      <motion.div
        className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-500'}`}
        animate={isRecording ? {
          boxShadow: [
            "0 0 0 0 rgba(239, 68, 68, 0.7)",
            "0 0 0 10px rgba(239, 68, 68, 0)",
            "0 0 0 0 rgba(239, 68, 68, 0)"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
      <span className={`text-sm font-medium ${isRecording ? 'text-red-400' : 'text-gray-400'}`}>
        {isRecording ? 'Recording...' : 'Ready'}
      </span>
    </motion.div>
  );
};

// Animated microphone icon with pulse effect
export const AnimatedMicIcon = ({
  isRecording = false,
  className = "",
  size = 24,
  ...props
}) => {
  const micVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.3 }
    },
    recording: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={micVariants}
      animate={isRecording ? "recording" : "idle"}
      className={className}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </motion.div>
  );
};

// Animated recording timer
export const AnimatedRecordingTimer = ({
  isRecording = false,
  startTime = null,
  className = "",
  ...props
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isRecording && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          variants={timerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={`flex items-center space-x-2 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full backdrop-blur-sm ${className}`}
          {...props}
        >
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.span
            className="text-red-400 font-mono text-sm font-medium"
            animate={{
              color: ["#f87171", "#ef4444", "#f87171"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {formatTime(elapsedTime)}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Global page transition wrapper
export const PageTransition = ({ children, className = "" }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// Enhanced loading overlay
export const LoadingOverlay = ({
  isVisible = false,
  message = "Loading...",
  className = "",
  ...props
}) => {
  const overlayVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: "blur(0px)"
    },
    visible: {
      opacity: 1,
      backdropFilter: "blur(8px)"
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
          {...props}
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex flex-col items-center space-y-4">
              <AnimatedSpinner size="lg" color="text-purple-500" />
              <motion.p
                className="text-white text-lg font-medium"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {message}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast notification component
export const Toast = ({
  type = "info",
  message = "",
  isVisible = false,
  onClose = () => {},
  duration = 4000,
  className = "",
  ...props
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const toastVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95
    }
  };

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-500/50 text-green-100";
      case "error":
        return "bg-red-900/90 border-red-500/50 text-red-100";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500/50 text-yellow-100";
      default:
        return "bg-blue-900/90 border-blue-500/50 text-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border backdrop-blur-lg shadow-xl ${getToastStyles()} ${className}`}
          {...props}
        >
          <div className="flex items-center space-x-3">
            <motion.span
              className="text-lg font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getIcon()}
            </motion.span>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <motion.button
              onClick={onClose}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated modal component
export const AnimatedModal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  className = "",
  ...props
}) => {
  const overlayVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
          {...props}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Responsive interaction feedback wrapper
export const InteractiveElement = ({
  children,
  className = "",
  hoverScale = 1.02,
  tapScale = 0.98,
  disabled = false,
  ...props
}) => {
  const interactionVariants = {
    hover: disabled ? {} : { scale: hoverScale },
    tap: disabled ? {} : { scale: tapScale }
  };

  return (
    <motion.div
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      variants={interactionVariants}
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Ripple effect component for touch feedback
export const RippleEffect = ({
  children,
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.3)",
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={createRipple}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced focus indicator for accessibility
export const FocusIndicator = ({
  children,
  className = "",
  focusColor = "ring-purple-500",
  ...props
}) => {
  return (
    <motion.div
      className={`focus-within:ring-2 focus-within:${focusColor} focus-within:ring-opacity-50 rounded-lg transition-all duration-200 ${className}`}
      whileFocus={{ scale: 1.01 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
