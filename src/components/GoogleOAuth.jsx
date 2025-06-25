import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { AnimatedButton } from './AnimatedComponents';
import { useUI } from '../contexts/UIContext';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Google OAuth Button Component
export const GoogleOAuthButton = ({ onSuccess, onError, text = "Continue with Google", disabled = false }) => {
  const { showError } = useUI();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        showError('Failed to load Google Sign-In. Please try again.');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        console.error('Google Identity Services not available');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
          });
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        showError('Failed to initialize Google Sign-In');
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        if (!response.credential) {
          throw new Error('No credential received from Google');
        }

        // Decode the JWT token to get user info
        const userInfo = parseJwt(response.credential);
        
        const googleUserData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          credential: response.credential
        };

        console.log('Google OAuth success:', googleUserData);
        
        if (onSuccess) {
          await onSuccess(googleUserData);
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        if (onError) {
          onError(error);
        } else {
          showError('Google Sign-In failed. Please try again.');
        }
      }
    };

    // Helper function to parse JWT token
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        throw new Error('Invalid token format');
      }
    };

    // Only load if client ID is configured
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
      loadGoogleScript();
    } else {
      console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    // Cleanup function
    return () => {
      // Remove the script if it was added
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [onSuccess, onError, showError]);

  // If Google Client ID is not configured, show a demo button that explains the setup
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedButton
          onClick={() => {
            showError('Google OAuth is not configured. Please set up your Google Client ID in the environment variables to enable Google Sign-In.');
          }}
          className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 font-semibold transition duration-300 flex items-center justify-center space-x-2"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google (Demo)</span>
        </AnimatedButton>
        <p className="text-xs text-gray-500 mt-2 text-center">
          To enable: Set VITE_GOOGLE_CLIENT_ID in your .env file
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Custom styled container for Google button */}
      <div className="relative w-full">
        {/* Google's rendered button will be placed here */}
        <div 
          ref={buttonRef} 
          className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ minHeight: '44px' }}
        />
        
        {/* Fallback custom button if Google button fails to render */}
        <AnimatedButton
          onClick={() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            } else {
              showError('Google Sign-In not available. Please refresh the page.');
            }
          }}
          disabled={disabled}
          className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-semibold transition duration-300 flex items-center justify-center space-x-2 shadow-sm hidden"
          id="fallback-google-button"
        >
          <FcGoogle className="text-xl" />
          <span>{text}</span>
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

// Google One Tap Component (for automatic sign-in)
export const GoogleOneTap = ({ onSuccess, onError }) => {
  const { showError } = useUI();

  useEffect(() => {
    const initializeOneTap = () => {
      if (!window.google?.accounts?.id) {
        console.warn('Google Identity Services not available for One Tap');
        return;
      }

      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
        console.warn('Google Client ID not configured for One Tap');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
        });

        // Show One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One Tap prompt not displayed:', notification.getNotDisplayedReason());
          }
        });
      } catch (error) {
        console.error('Error initializing Google One Tap:', error);
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        if (!response.credential) {
          throw new Error('No credential received from Google One Tap');
        }

        // Parse the JWT token
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const userInfo = JSON.parse(jsonPayload);
        
        const googleUserData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          credential: response.credential
        };

        console.log('Google One Tap success:', googleUserData);
        
        if (onSuccess) {
          await onSuccess(googleUserData);
        }
      } catch (error) {
        console.error('Google One Tap error:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    // Delay initialization to ensure the script is loaded
    const timer = setTimeout(initializeOneTap, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [onSuccess, onError]);

  // This component doesn't render anything visible
  return null;
};

// Utility function to handle Google OAuth logout
export const googleSignOut = () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
    console.log('Google auto-select disabled');
  }
};
