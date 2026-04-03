import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnvironment } from './config/env.validation';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
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

  // Verify database connection
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const urlParts = databaseUrl.split('@');
    const safeUrl = urlParts.length > 1 ? `postgresql://***:***@${urlParts[1]}` : '***';
    console.log(`[Database] Connection URL: ${safeUrl}`);
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
