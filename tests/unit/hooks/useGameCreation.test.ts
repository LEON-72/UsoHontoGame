import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameCreation } from '@/hooks/useGameCreation';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useRouter
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock useToast
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

describe('useGameCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty episodes array', () => {
      const { result } = renderHook(() => useGameCreation());

      expect(result.current.episodes).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Episode Management', () => {
    it('should add an episode', () => {
      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
      });

      expect(result.current.episodes).toHaveLength(1);
      expect(result.current.episodes[0].content).toBe('');
    });

    it('should update episode content', () => {
      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'New content');
      });

      expect(result.current.episodes[0].content).toBe('New content');
    });

    it('should remove an episode', () => {
      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
      });

      act(() => {
        result.current.addEpisode();
      });

      act(() => {
        result.current.removeEpisode(0);
      });

      expect(result.current.episodes).toHaveLength(1);
    });

    it('should not allow more than 20 episodes', () => {
      const { result } = renderHook(() => useGameCreation());

      for (let i = 0; i < 25; i++) {
        act(() => {
          result.current.addEpisode();
        });
      }

      expect(result.current.episodes).toHaveLength(20);
    });
  });

  describe('Game Creation - Success', () => {
    it('should create game successfully and redirect', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            sessionId: 'TEST123',
            message: 'Game session created successfully. Session ID: TEST123',
          },
        }),
      });

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Test episode');
      });

      await act(async () => {
        await result.current.createGame();
      });

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Game session created successfully. Session ID: TEST123'
        );
        expect(mockPush).toHaveBeenCalledWith('/join?sessionId=TEST123');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should show toast with session ID on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            sessionId: 'ABC123',
            message: 'Session created with ID: ABC123',
          },
        }),
      });

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Episode content');
      });

      await act(async () => {
        await result.current.createGame();
      });

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
        const toastMessage = mockSuccess.mock.calls[0][0];
        expect(toastMessage).toContain('ABC123');
      });
    });
  });

  describe('Game Creation - Validation', () => {
    it('should not create game with no episodes', async () => {
      const { result } = renderHook(() => useGameCreation());

      await act(async () => {
        await result.current.createGame();
      });

      expect(mockError).toHaveBeenCalledWith('Please add at least one episode');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not create game with empty episode content', async () => {
      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
      });

      await act(async () => {
        await result.current.createGame();
      });

      expect(mockError).toHaveBeenCalledWith('All episodes must have content');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not create game with only whitespace in episode', async () => {
      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, '   ');
      });

      await act(async () => {
        await result.current.createGame();
      });

      expect(mockError).toHaveBeenCalledWith('All episodes must have content');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Game Creation - Error Handling', () => {
    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Test episode');
      });

      await act(async () => {
        await result.current.createGame();
      });

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to create game. Please try again.');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            message: 'Episode count exceeded',
            code: 'VALIDATION_ERROR',
          },
        }),
      });

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Test episode');
      });

      await act(async () => {
        await result.current.createGame();
      });

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Episode count exceeded');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle API error with missing error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
          },
        }),
      });

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Test episode');
      });

      await act(async () => {
        await result.current.createGame();
      });

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to create game');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Loading State', () => {
    it('should set loading state during API call', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useGameCreation());

      act(() => {
        result.current.addEpisode();
        result.current.updateEpisode(0, 'Test episode');
      });

      act(() => {
        result.current.createGame();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({
            success: true,
            data: { sessionId: 'TEST123', message: 'Success' },
          }),
        });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
