// Vitest setup file
// Global configuration for tests

import '@testing-library/jest-dom/vitest';

// Set up test database URL
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/test.db';
}
