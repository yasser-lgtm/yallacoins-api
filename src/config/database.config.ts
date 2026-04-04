import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dns from 'dns';
import { User } from '../modules/auth/entities/user.entity';
import { WithdrawalRequest } from '../modules/withdrawal-requests/entities/withdrawal-request.entity';
import { RequestSnapshot } from '../modules/withdrawal-requests/entities/request-snapshot.entity';
import { AppRate } from '../modules/rates/entities/app-rate.entity';
import { Country } from '../modules/countries/entities/country.entity';
import { PayoutMethod } from '../modules/countries/entities/payout-method.entity';
import { FileUpload } from '../modules/file-upload/entities/file-upload.entity';
import { AuditLog } from '../modules/audit-log/entities/audit-log.entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'FATAL: DATABASE_URL environment variable is not set. ' +
      'This is required for database connectivity. ' +
      'Format: postgresql://user:password@host:port/database'
    );
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      WithdrawalRequest,
      RequestSnapshot,
      AppRate,
      Country,
      PayoutMethod,
      FileUpload,
      AuditLog,
    ],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    dropSchema: false,
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      // CRITICAL: Custom DNS lookup to force IPv4 at pg driver level
      // This prevents Railway container from attempting IPv6 connections
      // which fail with ENETUNREACH error
      lookup: (hostname: string, options: any, callback: any) => {
        console.log(`[TypeORM] DNS lookup for: ${hostname} (forcing IPv4)`);
        dns.lookup(hostname, { family: 4 }, (err, address, family) => {
          if (err) {
            console.error(`[TypeORM] DNS lookup failed for ${hostname}: ${err.message}`);
            return callback(err);
          }
          console.log(`[TypeORM] DNS resolved ${hostname} to ${address} (IPv${family})`);
          callback(null, address, family);
        });
      },
    },
  };
};
