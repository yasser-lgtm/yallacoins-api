import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  console.log('[CORS] Enabled for origins:', corsOrigins);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[Server] YallaCoins API running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]', err);
  process.exit(1);
});
