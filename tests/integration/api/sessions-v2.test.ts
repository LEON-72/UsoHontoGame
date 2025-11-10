import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/sessions-v2/route';
import { InMemoryGameSessionRepositoryV2 } from '@/server/infrastructure-v2/repositories/InMemoryGameSessionRepositoryV2';
import { createMockRequest, parseResponse } from './test-helpers';

describe('POST /api/sessions-v2 - New Game Creation Flow', () => {
  beforeEach(() => {
    InMemoryGameSessionRepositoryV2.getInstance().clearAll();
  });

  afterEach(() => {
    InMemoryGameSessionRepositoryV2.getInstance().clearAll();
  });

  describe('Success Cases', () => {
    it('should create session with episodes and return session ID', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: 'Episode 1' }, { content: 'Episode 2' }, { content: 'Episode 3' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('sessionId');
      expect(data.data).toHaveProperty('message');
      expect(data.data.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
      expect(data.data.message).toContain('Session ID: ');
    });

    it('should accept exactly 1 episode', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: 'Single episode' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should accept exactly 20 episodes', async () => {
      const episodes = Array.from({ length: 20 }, (_, i) => ({
        content: `Episode ${i + 1}`,
      }));

      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: { episodes },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should trim whitespace from episode content', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: '  Episode with spaces  ' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('Validation - Episode Count', () => {
    it('should return 400 when no episodes provided', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: { episodes: [] },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Episode count must be between 1 and 20');
    });

    it('should return 400 when more than 20 episodes provided', async () => {
      const episodes = Array.from({ length: 21 }, (_, i) => ({
        content: `Episode ${i + 1}`,
      }));

      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: { episodes },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Episode count must be between 1 and 20');
    });
  });

  describe('Validation - Episode Content', () => {
    it('should return 400 when episode content is empty', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: '' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Episode content cannot be empty');
    });

    it('should return 400 when episode content is only whitespace', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: '   ' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Episode content cannot be empty');
    });
  });

  describe('Validation - Request Body', () => {
    it('should return 400 when episodes field is missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {},
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when episodes is not an array', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: { episodes: 'not an array' },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Session Persistence', () => {
    it('should persist session in repository', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/sessions-v2', {
        body: {
          episodes: [{ content: 'Test episode' }],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      const sessionId = data.data.sessionId;
      const repository = InMemoryGameSessionRepositoryV2.getInstance();
      const session = await repository.findById(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.episodes).toHaveLength(1);
      expect(session?.episodes[0].content).toBe('Test episode');
    });
  });
});
