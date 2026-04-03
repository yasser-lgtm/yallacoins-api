import { Controller, Get, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    host?: string;
    database?: string;
  };
}

@Controller('health')
export class HealthController {
  private startTime = Date.now();

  constructor(@Inject(DataSource) private dataSource: DataSource) {}

  @Get()
  async getHealth(): Promise<HealthResponse> {
    const isDbConnected = this.dataSource.isInitialized;
    const uptime = Date.now() - this.startTime;

    if (!isDbConnected) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime,
        database: {
          status: 'disconnected',
        },
      };
    }

    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');

      const options = this.dataSource.options as any;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime,
        database: {
          status: 'connected',
          host: options.host || 'unknown',
          database: options.database || 'unknown',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime,
        database: {
          status: 'disconnected',
        },
      };
    }
  }
}
