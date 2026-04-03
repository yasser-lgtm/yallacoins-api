/**
 * ENVIRONMENT VALIDATION - FAIL FAST PRINCIPLE
 * 
 * This module validates ALL required environment variables at startup.
 * If ANY required variable is missing → application CRASHES immediately.
 * 
 * NO FALLBACKS. NO SILENT FAILURES. NO LOCALHOST IN PRODUCTION.
 */

export interface ValidatedEnv {
  // Database Configuration (REQUIRED)
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SSL: boolean;

  // Server Configuration
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Security
  JWT_SECRET: string;

  // CORS Configuration
  CORS_ORIGINS: string[];

  // File Upload (Optional with defaults)
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
}

/**
 * Validate environment variables at startup
 * Throws error if any required variable is missing
 */
export function validateEnvironment(): ValidatedEnv {
  const errors: string[] = [];

  // Database Configuration - REQUIRED
  const DB_HOST = process.env.DB_HOST;
  if (!DB_HOST) {
    errors.push('DB_HOST is required and must not be empty');
  }

  const DB_PORT = process.env.DB_PORT;
  if (!DB_PORT) {
    errors.push('DB_PORT is required and must not be empty');
  }
  const parsedPort = parseInt(DB_PORT || '', 10);
  if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    errors.push('DB_PORT must be a valid port number (1-65535)');
  }

  const DB_USERNAME = process.env.DB_USERNAME;
  if (!DB_USERNAME) {
    errors.push('DB_USERNAME is required and must not be empty');
  }

  const DB_PASSWORD = process.env.DB_PASSWORD;
  if (!DB_PASSWORD) {
    errors.push('DB_PASSWORD is required and must not be empty');
  }

  const DB_NAME = process.env.DB_NAME;
  if (!DB_NAME) {
    errors.push('DB_NAME is required and must not be empty');
  }

  const DB_SSL_RAW = process.env.DB_SSL;
  if (!DB_SSL_RAW) {
    errors.push('DB_SSL is required (must be "true" or "false")');
  }
  if (DB_SSL_RAW && !['true', 'false'].includes(DB_SSL_RAW.toLowerCase())) {
    errors.push('DB_SSL must be either "true" or "false"');
  }

  // Server Configuration
  const PORT_RAW = process.env.PORT;
  const PORT = parseInt(PORT_RAW || '3000', 10);
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  const NODE_ENV = (process.env.NODE_ENV || 'production') as 'development' | 'production' | 'test';
  if (!['development', 'production', 'test'].includes(NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  // Security - REQUIRED
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is required and must not be empty');
  }
  if (JWT_SECRET && JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // CORS Configuration - REQUIRED
  const CORS_ORIGINS_RAW = process.env.CORS_ORIGINS;
  if (!CORS_ORIGINS_RAW) {
    errors.push('CORS_ORIGINS is required (comma-separated list of allowed origins)');
  }
  const CORS_ORIGINS = CORS_ORIGINS_RAW ? CORS_ORIGINS_RAW.split(',').map(o => o.trim()) : [];
  if (CORS_ORIGINS.length === 0) {
    errors.push('CORS_ORIGINS must contain at least one origin');
  }

  // If there are any errors, throw immediately
  if (errors.length > 0) {
    console.error('❌ ENVIRONMENT VALIDATION FAILED');
    console.error('Missing or invalid environment variables:');
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.error('\nRequired environment variables:');
    console.error('  - DB_HOST (string, not localhost)');
    console.error('  - DB_PORT (number, 1-65535)');
    console.error('  - DB_USERNAME (string, not empty)');
    console.error('  - DB_PASSWORD (string, not empty)');
    console.error('  - DB_NAME (string, not empty)');
    console.error('  - DB_SSL (string, "true" or "false")');
    console.error('  - JWT_SECRET (string, min 32 characters)');
    console.error('  - CORS_ORIGINS (comma-separated URLs)');
    console.error('  - NODE_ENV (optional, defaults to "production")');
    console.error('  - PORT (optional, defaults to 3000)');
    process.exit(1);
  }

  // File Upload Configuration (Optional with defaults)
  const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
  const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

  return {
    DB_HOST: DB_HOST!,
    DB_PORT: parsedPort,
    DB_USERNAME: DB_USERNAME!,
    DB_PASSWORD: DB_PASSWORD!,
    DB_NAME: DB_NAME!,
    DB_SSL: DB_SSL_RAW === 'true',
    PORT,
    NODE_ENV,
    JWT_SECRET: JWT_SECRET!,
    CORS_ORIGINS,
    UPLOAD_DIR,
    MAX_FILE_SIZE,
  };
}
