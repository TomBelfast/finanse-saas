/**
 * Utility functions for consistent error handling across the application
 */

import { logger } from './logger';

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Safely extract error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Log error with context and return safe error message
 */
export function handleError(error: unknown, context?: Record<string, unknown>): string {
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);
  
  logger.error('Error occurred', {
    message,
    stack,
    ...context,
  });
  
  return message;
}

/**
 * Check if error is a database connection error
 */
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('Connection lost') ||
      error.message.includes('MySQL')
    );
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.name === 'ValidationError'
    );
  }
  return false;
}

/**
 * Create standardized error response for Express routes
 */
export function createErrorResponse(
  error: unknown,
  context?: Record<string, unknown>,
  defaultMessage = 'Internal server error'
): { error: string; statusCode: number } {
  const message = handleError(error, context);
  
  // Determine appropriate status code based on error type
  let statusCode = 500;
  if (isValidationError(error)) {
    statusCode = 400;
  } else if (isDatabaseError(error)) {
    statusCode = 503; // Service Unavailable
  }
  
  return {
    error: message || defaultMessage,
    statusCode,
  };
}

