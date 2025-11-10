'use client';

import { useToast } from '@/contexts/ToastContext';
import { Toast } from './Toast';

/**
 * ToastContainer - Renders all active toasts from ToastContext
 * This component should be placed at the app level to display toasts globally
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
