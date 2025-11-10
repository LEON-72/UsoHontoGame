import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHostAccess } from '@/hooks/useHostAccess';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useHostAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading true and isHost false', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isHost: false, sessionId: 'TEST42' },
        }),
      });

      const { result } = renderHook(() => useHostAccess('TEST42'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isHost).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Success Cases', () => {
    it('should set isHost to true when user is host', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isHost: true, sessionId: 'TEST42' },
        }),
      });

      const { result } = renderHook(() => useHostAccess('TEST42'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(true);
        expect(result.current.error).toBeNull();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/sessions/TEST42/host-access');
    });

    it('should set isHost to false when user is not host', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isHost: false, sessionId: 'TEST42' },
        }),
      });

      const { result } = renderHook(() => useHostAccess('TEST42'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should not make API call when sessionId is undefined', async () => {
      const { result } = renderHook(() => useHostAccess(undefined));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not make API call when sessionId is empty string', async () => {
      const { result } = renderHook(() => useHostAccess(''));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useHostAccess('TEST42'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBe('Failed to check host access');
      });
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            message: 'Session not found',
            code: 'NOT_FOUND',
          },
        }),
      });

      const { result } = renderHook(() => useHostAccess('TEST42'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBe('Session not found');
      });
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() => useHostAccess('TEST42'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isHost).toBe(false);
        expect(result.current.error).toBe('Failed to check host access');
      });
    });
  });

  describe('Session ID Changes', () => {
    it('should refetch when sessionId changes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isHost: true, sessionId: 'TEST42' },
        }),
      });

      const { result, rerender } = renderHook(({ id }) => useHostAccess(id), {
        initialProps: { id: 'TEST42' },
      });

      await waitFor(() => {
        expect(result.current.isHost).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change session ID
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isHost: false, sessionId: 'TEST99' },
        }),
      });

      rerender({ id: 'TEST99' });

      await waitFor(() => {
        expect(result.current.isHost).toBe(false);
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith('/api/sessions/TEST99/host-access');
      });
    });
  });
});
