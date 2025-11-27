// ValidationError Tests
// Tests for domain validation error class

import { describe, expect, it } from 'vitest';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('should create error with message', () => {
    const message = 'Invalid value provided';
    const error = new ValidationError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe(message);
  });

  it('should set error name to ValidationError', () => {
    const error = new ValidationError('Test error');

    expect(error.name).toBe('ValidationError');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ValidationError('Test error');
    }).toThrow(ValidationError);

    expect(() => {
      throw new ValidationError('Test error');
    }).toThrow('Test error');
  });

  it('should maintain stack trace', () => {
    const error = new ValidationError('Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ValidationError');
  });

  it('should handle empty message', () => {
    const error = new ValidationError('');

    expect(error.message).toBe('');
    expect(error.name).toBe('ValidationError');
  });

  it('should handle special characters in message', () => {
    const message = 'Error: <script>alert("XSS")</script>';
    const error = new ValidationError(message);

    expect(error.message).toBe(message);
  });

  it('should handle Japanese characters in message', () => {
    const message = 'ゲーム名が無効です';
    const error = new ValidationError(message);

    expect(error.message).toBe(message);
    expect(error.name).toBe('ValidationError');
  });
});
