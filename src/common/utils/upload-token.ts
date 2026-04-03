import * as jwt from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';

export interface UploadTokenPayload {
  requestId: string;
  iat?: number;
  exp?: number;
}

export interface UploadTokenValidation {
  valid: boolean;
  requestId?: string;
  error?: string;
}

/**
 * Generate a secure upload token for a withdrawal request
 * Token is valid for 45 minutes by default
 * Bound to a specific requestId
 */
export function generateUploadToken(
  jwtService: JwtService,
  requestId: string,
  expiresInMinutes: number = 45,
): string {
  const payload: UploadTokenPayload = {
    requestId,
  };

  return jwtService.sign(payload, {
    expiresIn: `${expiresInMinutes}m`,
  });
}

/**
 * Validate an upload token
 * Returns validation result with requestId if valid
 */
export function validateUploadToken(
  jwtService: JwtService,
  token: string,
): UploadTokenValidation {
  try {
    const decoded = jwtService.verify(token) as UploadTokenPayload;

    if (!decoded.requestId) {
      return {
        valid: false,
        error: 'Invalid token: missing requestId',
      };
    }

    return {
      valid: true,
      requestId: decoded.requestId,
    };
  } catch (error: any) {
    let errorMessage = 'Invalid token';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Upload token has expired. Please create a new withdrawal request.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid upload token format';
    }

    return {
      valid: false,
      error: errorMessage,
    };
  }
}

/**
 * Extract upload token from Authorization header
 * Expected format: "Bearer <token>"
 */
export function extractUploadToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
