import { nanoid } from 'nanoid';

/**
 * Session ID length configuration
 * Uses 10 characters for a good balance of uniqueness and brevity
 */
const SESSION_ID_LENGTH = 10;

/**
 * Regular expression for validating session IDs
 * Matches nanoid format: alphanumeric plus hyphen and underscore
 */
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;

/**
 * Generates a unique session ID using nanoid
 *
 * Session IDs are 10 characters long and contain:
 * - Uppercase letters (A-Z)
 * - Lowercase letters (a-z)
 * - Numbers (0-9)
 * - Hyphens (-)
 * - Underscores (_)
 *
 * @returns A unique 10-character session ID
 *
 * @example
 * const sessionId = generateSessionId();
 * // Returns: "V1StGXR8_Z" (example format)
 */
export function generateSessionId(): string {
  return nanoid(SESSION_ID_LENGTH);
}

/**
 * Validates if a string is a valid session ID
 *
 * Checks that the ID:
 * - Is exactly 10 characters long
 * - Contains only alphanumeric characters, hyphens, and underscores
 * - Matches the expected nanoid format
 *
 * @param id - The string to validate
 * @returns true if valid session ID, false otherwise
 *
 * @example
 * isValidSessionId("V1StGXR8_Z"); // true
 * isValidSessionId("invalid");    // false
 * isValidSessionId("");           // false
 */
export function isValidSessionId(id: string): boolean {
  return SESSION_ID_PATTERN.test(id);
}
