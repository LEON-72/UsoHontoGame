import { describe, it, expect } from 'vitest';
import { generateSessionId, isValidSessionId } from '@/lib/sessionId';

describe('sessionId utilities', () => {
  describe('generateSessionId', () => {
    it('should generate a 10-character session ID', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toHaveLength(10);
    });

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid session IDs', () => {
      const sessionId = generateSessionId();
      expect(isValidSessionId(sessionId)).toBe(true);
    });

    it('should only contain valid characters', () => {
      const sessionId = generateSessionId();
      expect(/^[A-Za-z0-9_-]+$/.test(sessionId)).toBe(true);
    });
  });

  describe('isValidSessionId', () => {
    it('should accept valid 10-character alphanumeric IDs', () => {
      expect(isValidSessionId('abc123XYZ_')).toBe(true);
      expect(isValidSessionId('1234567890')).toBe(true);
      expect(isValidSessionId('Test_ID-01')).toBe(true);
    });

    it('should reject IDs that are too short', () => {
      expect(isValidSessionId('abc123')).toBe(false);
    });

    it('should reject IDs that are too long', () => {
      expect(isValidSessionId('abc1234567890')).toBe(false);
    });

    it('should reject IDs with invalid characters', () => {
      expect(isValidSessionId('abc123!@#$')).toBe(false);
      expect(isValidSessionId('abc 123456')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidSessionId('')).toBe(false);
    });
  });
});
