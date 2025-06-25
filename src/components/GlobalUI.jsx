import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUI } from '../contexts/UIContext';
import { Toast, LoadingOverlay } from './AnimatedComponents';

export const GlobalUI = () => {
  const { 
    toasts, 
    removeToast, 
    isGlobalLoading, 
    loadingMessage 
  } = useUI();

  return (
    <>
      {/* Global Loading Overlay */}
      <LoadingOverlay 
        isVisible={isGlobalLoading}
        message={loadingMessage}
      />

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              isVisible={toast.isVisible}
              onClose={() => removeToast(toast.id)}
              duration={0} // Duration is handled by the context
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
