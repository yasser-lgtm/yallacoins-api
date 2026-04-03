import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface UploadTokenPayload {
  requestId: string;
  iat: number;
  exp: number;
}

/**
 * UPLOAD TOKEN SERVICE
 * 
 * Handles generation and validation of upload tokens:
 * - Generate secure tokens for withdrawal requests
 * - Validate tokens before file uploads
 * - Enforce expiration (30-60 minutes)
 * - Bind tokens to specific requests
 * 
 * Separated from WithdrawalRequestsService for single responsibility.
 */
@Injectable()
export class UploadTokenService {
  private readonly TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

  constructor(private jwtService: JwtService) {}

  /**
   * Generate upload token for a withdrawal request
   */
  generateUploadToken(requestId: string): string {
    const payload: UploadTokenPayload = {
      requestId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.TOKEN_EXPIRY_SECONDS,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validate upload token
   */
  validateUploadToken(token: string): { valid: boolean; requestId?: string; error?: string } {
    try {
      const payload = this.jwtService.verify(token) as UploadTokenPayload;

      if (!payload.requestId) {
        return { valid: false, error: 'Invalid token: missing requestId' };
      }

      return { valid: true, requestId: payload.requestId };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          return { valid: false, error: 'Upload token has expired' };
        }
        return { valid: false, error: `Invalid token: ${error.message}` };
      }
      return { valid: false, error: 'Invalid token' };
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}
