import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { WithdrawalRequest } from '../modules/withdrawal-requests/entities/withdrawal-request.entity';
import { RequestSnapshot } from '../modules/withdrawal-requests/entities/request-snapshot.entity';
import { AppRate } from '../modules/rates/entities/app-rate.entity';
import { Country } from '../modules/countries/entities/country.entity';
import { PayoutMethod } from '../modules/countries/entities/payout-method.entity';
import { FileUpload } from '../modules/file-upload/entities/file-upload.entity';
import { AuditLog } from '../modules/audit-log/entities/audit-log.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
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
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Note: Validation happens in main.ts before this is called
});
