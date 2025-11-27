// NotFoundError Tests
// Tests for resource not found error class

import { describe, expect, it } from 'vitest';
import { NotFoundError } from './NotFoundError';

describe('NotFoundError', () => {
  it('should create error with message', () => {
    const message = 'Game not found';
    const error = new NotFoundError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe(message);
  });

  it('should set error name to NotFoundError', () => {
    const error = new NotFoundError('Resource not found');

    expect(error.name).toBe('NotFoundError');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new NotFoundError('Game game-123 not found');
    }).toThrow(NotFoundError);

    expect(() => {
      throw new NotFoundError('Game game-123 not found');
    }).toThrow('Game game-123 not found');
  });

  it('should maintain stack trace', () => {
    const error = new NotFoundError('Presenter not found');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('NotFoundError');
  });

  it('should handle descriptive messages for different resources', () => {
    const gameError = new NotFoundError('Game game-123 not found');
    const presenterError = new NotFoundError('Presenter presenter-456 not found');
    const sessionError = new NotFoundError('Session not found');

    expect(gameError.message).toBe('Game game-123 not found');
    expect(presenterError.message).toBe('Presenter presenter-456 not found');
    expect(sessionError.message).toBe('Session not found');
  });

  it('should handle Japanese error messages', () => {
    const message = 'ゲームが見つかりません';
    const error = new NotFoundError(message);

    expect(error.message).toBe(message);
    expect(error.name).toBe('NotFoundError');
  });

  it('should be distinguishable from other error types', () => {
    const error = new NotFoundError('Test');

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ReferenceError);
  });
});
