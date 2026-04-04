import { TypeOrmModuleOptions } from '@nestjs/typeorm';
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
      family: 4, // Force IPv4 to avoid IPv6 ENETUNREACH errors on Railway
    },
  };
};
