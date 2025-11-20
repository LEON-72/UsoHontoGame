// Hook Tests: useParticipantSession
// Test-Driven Development: Write FAILING tests first

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useParticipantSession } from './useParticipantSession';

// Mock the session action
vi.mock('@/app/actions/session', () => ({
  validateSessionAction: vi.fn(),
}));

describe('useParticipantSession', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useParticipantSession());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.nickname).toBeNull();
  });

  it('should fetch and return session data when valid', async () => {
    const { validateSessionAction } = await import('@/app/actions/session');
    vi.mocked(validateSessionAction).mockResolvedValue({
      valid: true,
      sessionId: 'session-123',
      nickname: 'TestUser',
      hasNickname: true,
    });

    const { result } = renderHook(() => useParticipantSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessionId).toBe('session-123');
    expect(result.current.nickname).toBe('TestUser');
    expect(result.current.isValid).toBe(true);
  });

  it('should handle invalid session', async () => {
    const { validateSessionAction } = await import('@/app/actions/session');
    vi.mocked(validateSessionAction).mockResolvedValue({
      valid: false,
      sessionId: null,
      nickname: null,
      hasNickname: false,
    });

    const { result } = renderHook(() => useParticipantSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.nickname).toBeNull();
    expect(result.current.isValid).toBe(false);
  });

  it('should handle session without nickname', async () => {
    const { validateSessionAction } = await import('@/app/actions/session');
    vi.mocked(validateSessionAction).mockResolvedValue({
      valid: true,
      sessionId: 'session-123',
      nickname: null,
      hasNickname: false,
    });

    const { result } = renderHook(() => useParticipantSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessionId).toBe('session-123');
    expect(result.current.nickname).toBeNull();
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasNickname).toBe(false);
  });
});
