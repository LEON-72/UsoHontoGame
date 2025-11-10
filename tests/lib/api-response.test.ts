import { describe, it, expect } from 'vitest';
import {
  type ApiResponse,
  isSuccessResponse,
  isErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/api-response';

describe('API response utilities', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { sessionId: 'abc123' };
      const response = createSuccessResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should handle different data types', () => {
      const stringData = createSuccessResponse('test');
      const numberData = createSuccessResponse(42);
      const arrayData = createSuccessResponse([1, 2, 3]);

      expect(stringData.data).toBe('test');
      expect(numberData.data).toBe(42);
      expect(arrayData.data).toEqual([1, 2, 3]);
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with message and code', () => {
      const response = createErrorResponse('Game not found', 'GAME_NOT_FOUND');

      expect(response).toEqual({
        success: false,
        error: {
          message: 'Game not found',
          code: 'GAME_NOT_FOUND',
        },
      });
    });
  });

  describe('isSuccessResponse', () => {
    it('should return true for success responses', () => {
      const response = createSuccessResponse({ data: 'test' });
      expect(isSuccessResponse(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response = createErrorResponse('Error', 'ERROR_CODE');
      expect(isSuccessResponse(response)).toBe(false);
    });

    it('should narrow types correctly', () => {
      const response: ApiResponse<string> = createSuccessResponse('test');

      if (isSuccessResponse(response)) {
        // TypeScript should know this is a success response
        expect(response.data).toBe('test');
      }
    });
  });

  describe('isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response = createErrorResponse('Error', 'ERROR_CODE');
      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return false for success responses', () => {
      const response = createSuccessResponse({ data: 'test' });
      expect(isErrorResponse(response)).toBe(false);
    });

    it('should narrow types correctly', () => {
      const response: ApiResponse<string> = createErrorResponse('Test error', 'TEST_ERROR');

      if (isErrorResponse(response)) {
        // TypeScript should know this is an error response
        expect(response.error.message).toBe('Test error');
        expect(response.error.code).toBe('TEST_ERROR');
      }
    });
  });
});
