// Schema Tests: Answer Schemas
// Test-Driven Development: Write FAILING tests first

import { describe, expect, it } from 'vitest';
import { SubmitAnswerSchema } from './answerSchemas';

describe('Answer Schemas', () => {
  describe('SubmitAnswerSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid submit answer data with single selection', () => {
        const validData = {
          gameId: 'game-123',
          selections: {
            'presenter-1': 'episode-1',
          },
        };

        const result = SubmitAnswerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should accept valid submit answer data with multiple selections', () => {
        const validData = {
          gameId: 'game-456',
          selections: {
            'presenter-1': 'episode-1',
            'presenter-2': 'episode-2',
            'presenter-3': 'episode-3',
          },
        };

        const result = SubmitAnswerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should accept valid submit answer data with 10 selections', () => {
        const selections: Record<string, string> = {};
        for (let i = 1; i <= 10; i++) {
          selections[`presenter-${i}`] = `episode-${i}`;
        }

        const validData = {
          gameId: 'game-789',
          selections,
        };

        const result = SubmitAnswerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept gameId with special characters', () => {
        const validData = {
          gameId: 'game-abc-123-def',
          selections: {
            'presenter-1': 'episode-1',
          },
        };

        const result = SubmitAnswerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid gameId', () => {
      it('should reject empty gameId', () => {
        const invalidData = {
          gameId: '',
          selections: {
            'presenter-1': 'episode-1',
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('Game ID');
        }
      });

      it('should reject missing gameId', () => {
        const invalidData = {
          selections: {
            'presenter-1': 'episode-1',
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('invalid selections', () => {
      it('should reject empty selections object', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: {},
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('selection');
        }
      });

      it('should reject missing selections', () => {
        const invalidData = {
          gameId: 'game-123',
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty presenter ID', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: {
            '': 'episode-1',
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        // Zod returns generic "Invalid key in record" message for empty keys
        if (!result.success) {
          const message = result.error.issues[0]?.message;
          expect(
            message === 'Presenter ID is required' || message === 'Invalid key in record'
          ).toBe(true);
        }
      });

      it('should reject empty episode ID', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: {
            'presenter-1': '',
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('Episode ID');
        }
      });
    });

    describe('edge cases', () => {
      it('should accept selections with UUID-like IDs', () => {
        const validData = {
          gameId: '550e8400-e29b-41d4-a716-446655440000',
          selections: {
            'presenter-550e8400': 'episode-e29b-41d4',
          },
        };

        const result = SubmitAnswerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject null selections', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: null,
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject undefined selections', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: undefined,
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject selections with null values', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: {
            'presenter-1': null,
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject selections with number values', () => {
        const invalidData = {
          gameId: 'game-123',
          selections: {
            'presenter-1': 123,
          },
        };

        const result = SubmitAnswerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
