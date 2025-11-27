// UnauthorizedError Tests
// Tests for authorization error class

import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from './UnauthorizedError';

describe('UnauthorizedError', () => {
  it('should create error with message', () => {
    const message = 'User not authorized to perform this action';
    const error = new UnauthorizedError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe(message);
  });

  it('should set error name to UnauthorizedError', () => {
    const error = new UnauthorizedError('Unauthorized');

    expect(error.name).toBe('UnauthorizedError');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new UnauthorizedError('Only game creator can close game');
    }).toThrow(UnauthorizedError);

    expect(() => {
      throw new UnauthorizedError('Only game creator can close game');
    }).toThrow('Only game creator can close game');
  });

  it('should maintain stack trace', () => {
    const error = new UnauthorizedError('Unauthorized access');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('UnauthorizedError');
  });

  it('should handle different authorization scenarios', () => {
    const gameCloseError = new UnauthorizedError('Only game creator can close game');
    const editError = new UnauthorizedError('Only moderator can edit game');
    const deleteError = new UnauthorizedError('Only creator can delete game');

    expect(gameCloseError.message).toBe('Only game creator can close game');
    expect(editError.message).toBe('Only moderator can edit game');
    expect(deleteError.message).toBe('Only creator can delete game');
    expect(gameCloseError.name).toBe('UnauthorizedError');
  });

  it('should handle Japanese error messages', () => {
    const message = 'このゲームを変更する権限がありません';
    const error = new UnauthorizedError(message);

    expect(error.message).toBe(message);
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should be distinguishable from other error types', () => {
    const error = new UnauthorizedError('Not authorized');

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ReferenceError);
  });
});
