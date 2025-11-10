'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

/**
 * Toast component - Notification toast with Portal rendering
 * Features:
 * - Renders outside DOM hierarchy using Portal
 * - Auto-dismisses after 5 seconds (default)
 * - Manually dismissible after 3 seconds
 * - Animated entrance and exit
 * - Uses Tailwind CSS v4
 */
export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger animation immediately
    const animationTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Enable manual dismissal after 3 seconds
    const dismissTimer = setTimeout(() => {
      setCanDismiss(true);
    }, 3000);

    // Auto-dismiss after duration
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(dismissTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [duration, handleClose]);

  const handleClick = () => {
    if (canDismiss) {
      handleClose();
    }
  };

  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-600 text-white',
  };

  const toastElement = (
    <div
      className={`
        fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50
        transform transition-all duration-300 ease-in-out
        ${typeStyles[type]}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        ${canDismiss ? 'cursor-pointer hover:shadow-xl' : ''}
      `}
      role="alert"
      onClick={handleClick}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">{message}</p>
        {canDismiss && (
          <button
            type="button"
            onClick={handleClose}
            className="ml-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  // Use portal to render outside the DOM hierarchy
  if (typeof window === 'undefined') return null;

  return createPortal(toastElement, document.body);
}
