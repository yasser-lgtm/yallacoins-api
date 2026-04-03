import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `[${method}] ${originalUrl} - IP: ${ip} - User-Agent: ${req.get('user-agent')}`,
    );

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log response
      if (statusCode >= 400) {
        this.logger.error(
          `[${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      } else {
        this.logger.log(
          `[${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }

      return originalSend.call(this, data);
    };

    next();
  }
}
