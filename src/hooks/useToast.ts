'use client';

/**
 * Custom hook for accessing Toast context
 *
 * Provides type-safe access to toast notification methods:
 * - success(message): Show success toast
 * - error(message): Show error toast
 * - warning(message): Show warning toast
 * - info(message): Show info toast
 *
 * @throws Error if used outside ToastProvider
 * @returns Toast context with notification methods
 */
export { useToast } from '@/contexts/ToastContext';
