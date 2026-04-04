/**
 * CRITICAL: DNS Interceptor MUST be imported FIRST
 * This ensures ALL DNS lookups are intercepted before any modules load
 */
import './config/dns-interceptor';

import { NestFactory } from '@nestjs/core';
import * as dns from 'dns';
import { AppModule } from './app.module';
import { validateEnvironment } from './config/env.validation';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  // CRITICAL: Force IPv4 DNS resolution to prevent IPv6 ENETUNREACH on Railway
  console.log('[Bootstrap] Configuring DNS resolution...');
  dns.setDefaultResultOrder('ipv4first');
  console.log('[Bootstrap] ✅ DNS configured: IPv4 prioritized');

  // VALIDATE ENVIRONMENT FIRST - FAIL FAST
  console.log('[Bootstrap] Validating environment variables...');
  const env = validateEnvironment();
  console.log('[Bootstrap] ✅ Environment validation passed');

  const app = await NestFactory.create(AppModule);

  // Request/response logging
  const { LoggingMiddleware } = await import('./common/middleware/logging.middleware');
  app.use(LoggingMiddleware);

  // Global validation pipe for all requests
  app.useGlobalPipes(new GlobalValidationPipe());

  // CORS Configuration - Using validated origins
  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  console.log('[CORS] Enabled for origins:', env.CORS_ORIGINS);

  // Verify database connection and resolve hostname
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const urlParts = databaseUrl.split('@');
    const safeUrl = urlParts.length > 1 ? `postgresql://***:***@${urlParts[1]}` : '***';
    console.log(`[Database] Connection URL: ${safeUrl}`);

    // Extract hostname from DATABASE_URL for DNS resolution check
    try {
      const hostMatch = databaseUrl.match(/postgresql:\/\/[^@]+@([^:]+)/);
      if (hostMatch) {
        const hostname = hostMatch[1];
        console.log(`[Database] Resolving hostname: ${hostname}`);
        dns.lookup(hostname, { family: 4 }, (err, address, family) => {
          if (err) {
            console.error(`[Database] ⚠️  IPv4 resolution failed: ${err.message}`);
          } else {
            console.log(`[Database] ✅ Resolved to IPv4: ${address} (family: ${family})`);
          }
        });
      }
    } catch (e) {
      console.warn('[Database] Could not extract hostname for DNS check');
    }
  }

  await app.listen(env.PORT);
  console.log(`[Server] YallaCoins API running on port ${env.PORT}`);
  console.log(`[Server] Environment: ${env.NODE_ENV}`);
  console.log('[Server] ✅ All systems initialized successfully');
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]', err);
  process.exit(1);
});
