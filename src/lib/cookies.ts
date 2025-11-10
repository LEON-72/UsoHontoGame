/**
 * Cookie utilities for managing host authentication
 *
 * Provides functions to set, get, and clear host cookies for game sessions.
 * These cookies are used to identify the host of a game session.
 */

/**
 * Cookie configuration constants
 */
const COOKIE_PREFIX = 'game_host_';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

/**
 * Interface for cookie configuration object
 */
export interface CookieOptions {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
}

/**
 * Generates a cookie name for a specific session
 *
 * @param sessionId - The game session ID
 * @returns Cookie name in format: game_host_{sessionId}
 *
 * @example
 * getCookieName("abc123"); // "game_host_abc123"
 */
function getCookieName(sessionId: string): string {
  return `${COOKIE_PREFIX}${sessionId}`;
}

/**
 * Generates a host cookie configuration object
 *
 * This function creates a cookie configuration for server-side use.
 * For client-side operations, use setHostCookie() instead.
 *
 * @param sessionId - The game session ID
 * @param hostId - The host's unique identifier
 * @returns Cookie configuration object
 *
 * @example
 * const cookie = generateHostCookie("session123", "host456");
 * // Returns: {
 * //   name: "game_host_session123",
 * //   value: "host456",
 * //   maxAge: 86400,
 * //   path: "/",
 * //   sameSite: "lax",
 * //   secure: true
 * // }
 */
export function generateHostCookie(sessionId: string, hostId: string): CookieOptions {
  return {
    name: getCookieName(sessionId),
    value: hostId,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

/**
 * Sets a host cookie in the browser
 *
 * This function is for client-side use only.
 * Creates a cookie that identifies the host of a game session.
 *
 * @param sessionId - The game session ID
 * @param hostId - The host's unique identifier
 *
 * @example
 * setHostCookie("session123", "host456");
 * // Sets cookie: game_host_session123=host456
 */
export function setHostCookie(sessionId: string, hostId: string): void {
  if (typeof document === 'undefined') {
    console.warn('setHostCookie called in non-browser environment');
    return;
  }

  const cookie = generateHostCookie(sessionId, hostId);
  const cookieString = [
    `${cookie.name}=${cookie.value}`,
    `max-age=${cookie.maxAge}`,
    `path=${cookie.path}`,
    `samesite=${cookie.sameSite}`,
    cookie.secure ? 'secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  document.cookie = cookieString;
}

/**
 * Retrieves the host ID from a session's cookie
 *
 * This function is for client-side use only.
 * Returns null if the cookie doesn't exist or if called server-side.
 *
 * @param sessionId - The game session ID
 * @returns The host ID if found, null otherwise
 *
 * @example
 * const hostId = getHostCookie("session123");
 * if (hostId) {
 *   console.log(`Host ID: ${hostId}`);
 * }
 */
export function getHostCookie(sessionId: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieName = getCookieName(sessionId);
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
      return value || null;
    }
  }

  return null;
}

/**
 * Clears the host cookie for a specific session
 *
 * This function is for client-side use only.
 * Removes the host authentication cookie by setting its expiration to the past.
 *
 * @param sessionId - The game session ID
 *
 * @example
 * clearHostCookie("session123");
 * // Removes cookie: game_host_session123
 */
export function clearHostCookie(sessionId: string): void {
  if (typeof document === 'undefined') {
    console.warn('clearHostCookie called in non-browser environment');
    return;
  }

  const cookieName = getCookieName(sessionId);
  document.cookie = `${cookieName}=; max-age=0; path=/`;
}

/**
 * Checks if a host cookie exists for a specific session
 *
 * This function is for client-side use only.
 *
 * @param sessionId - The game session ID
 * @returns true if the host cookie exists, false otherwise
 *
 * @example
 * if (hasHostCookie("session123")) {
 *   console.log("User is the host");
 * }
 */
export function hasHostCookie(sessionId: string): boolean {
  return getHostCookie(sessionId) !== null;
}
