/**
 * Standard error structure for API responses
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code for client handling */
  code: string;
}

/**
 * Success response type for API endpoints
 * @template T - The type of data returned on success
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Error response type for API endpoints
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * Generic API response type that can be either success or error
 * @template T - The type of data returned on success
 *
 * @example
 * type GameResponse = ApiResponse<{ sessionId: string }>;
 *
 * // Success case:
 * const success: GameResponse = {
 *   success: true,
 *   data: { sessionId: "abc123" }
 * };
 *
 * // Error case:
 * const error: GameResponse = {
 *   success: false,
 *   error: { message: "Game not found", code: "GAME_NOT_FOUND" }
 * };
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type guard to check if an API response is successful
 *
 * @param response - The API response to check
 * @returns true if response is successful, false otherwise
 *
 * @example
 * const response = await fetchGame();
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // TypeScript knows this is success type
 * } else {
 *   console.error(response.error); // TypeScript knows this is error type
 * }
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if an API response is an error
 *
 * @param response - The API response to check
 * @returns true if response is an error, false otherwise
 *
 * @example
 * const response = await fetchGame();
 * if (isErrorResponse(response)) {
 *   console.error(response.error.message);
 * }
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Helper to create a success response
 *
 * @param data - The data to return in the response
 * @returns A properly formatted success response
 *
 * @example
 * return createSuccessResponse({ sessionId: "abc123" });
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper to create an error response
 *
 * @param message - Human-readable error message
 * @param code - Machine-readable error code
 * @returns A properly formatted error response
 *
 * @example
 * return createErrorResponse("Game not found", "GAME_NOT_FOUND");
 */
export function createErrorResponse(message: string, code: string): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
    },
  };
}
