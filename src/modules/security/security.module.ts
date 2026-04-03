import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

/**
 * SECURITY MODULE - Centralized security configuration
 * 
 * This module provides:
 * - Global JWT configuration with real environment variables
 * - Centralized security setup
 * - Single source of truth for JWT settings
 * 
 * All other modules import JwtModule from this module or use it globally.
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: {
        expiresIn: '24h',
        algorithm: 'HS256',
      },
      global: true,
    }),
  ],
  exports: [JwtModule],
})
export class SecurityModule {}
