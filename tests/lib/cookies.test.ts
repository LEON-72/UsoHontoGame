import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateHostCookie,
  setHostCookie,
  getHostCookie,
  clearHostCookie,
  hasHostCookie,
} from '@/lib/cookies';

describe('Cookie utilities', () => {
  describe('generateHostCookie', () => {
    it('should generate a cookie configuration object', () => {
      const cookie = generateHostCookie('session123', 'host456');

      expect(cookie).toMatchObject({
        name: 'game_host_session123',
        value: 'host456',
        maxAge: 86400, // 24 hours
        path: '/',
        sameSite: 'lax',
      });
      expect(cookie).toHaveProperty('secure');
    });

    it('should use correct cookie naming pattern', () => {
      const cookie1 = generateHostCookie('abc', 'host1');
      const cookie2 = generateHostCookie('xyz', 'host2');

      expect(cookie1.name).toBe('game_host_abc');
      expect(cookie2.name).toBe('game_host_xyz');
    });
  });

  describe('client-side cookie operations', () => {
    beforeEach(() => {
      // Mock document.cookie for browser environment
      Object.defineProperty(globalThis, 'document', {
        value: {
          cookie: '',
        },
        writable: true,
        configurable: true,
      });
    });

    describe('setHostCookie', () => {
      it('should set a cookie in the browser', () => {
        const mockCookieSetter = vi.fn();
        Object.defineProperty(document, 'cookie', {
          set: mockCookieSetter,
          get: () => '',
          configurable: true,
        });

        setHostCookie('session123', 'host456');

        expect(mockCookieSetter).toHaveBeenCalled();
        const cookieString = mockCookieSetter.mock.calls[0][0];
        expect(cookieString).toContain('game_host_session123=host456');
        expect(cookieString).toContain('max-age=86400');
        expect(cookieString).toContain('path=/');
        expect(cookieString).toContain('samesite=lax');
      });

      it('should handle non-browser environment gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        delete (globalThis as { document?: unknown }).document;

        setHostCookie('session123', 'host456');

        expect(consoleSpy).toHaveBeenCalledWith('setHostCookie called in non-browser environment');
        consoleSpy.mockRestore();
      });
    });

    describe('getHostCookie', () => {
      it('should retrieve a cookie value', () => {
        Object.defineProperty(document, 'cookie', {
          get: () => 'game_host_session123=host456; other_cookie=value',
          configurable: true,
        });

        const hostId = getHostCookie('session123');
        expect(hostId).toBe('host456');
      });

      it('should return null if cookie does not exist', () => {
        Object.defineProperty(document, 'cookie', {
          get: () => 'other_cookie=value',
          configurable: true,
        });

        const hostId = getHostCookie('session123');
        expect(hostId).toBe(null);
      });

      it('should return null in non-browser environment', () => {
        delete (globalThis as { document?: unknown }).document;

        const hostId = getHostCookie('session123');
        expect(hostId).toBe(null);
      });
    });

    describe('clearHostCookie', () => {
      it('should clear a cookie by setting max-age to 0', () => {
        const mockCookieSetter = vi.fn();
        Object.defineProperty(document, 'cookie', {
          set: mockCookieSetter,
          get: () => '',
          configurable: true,
        });

        clearHostCookie('session123');

        expect(mockCookieSetter).toHaveBeenCalled();
        const cookieString = mockCookieSetter.mock.calls[0][0];
        expect(cookieString).toContain('game_host_session123=');
        expect(cookieString).toContain('max-age=0');
        expect(cookieString).toContain('path=/');
      });

      it('should handle non-browser environment gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        delete (globalThis as { document?: unknown }).document;

        clearHostCookie('session123');

        expect(consoleSpy).toHaveBeenCalledWith('clearHostCookie called in non-browser environment');
        consoleSpy.mockRestore();
      });
    });

    describe('hasHostCookie', () => {
      it('should return true if cookie exists', () => {
        Object.defineProperty(document, 'cookie', {
          get: () => 'game_host_session123=host456',
          configurable: true,
        });

        expect(hasHostCookie('session123')).toBe(true);
      });

      it('should return false if cookie does not exist', () => {
        Object.defineProperty(document, 'cookie', {
          get: () => 'other_cookie=value',
          configurable: true,
        });

        expect(hasHostCookie('session123')).toBe(false);
      });
    });
  });
});
