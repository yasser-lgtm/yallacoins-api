import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { SecurityModule } from './modules/security/security.module';
import { AuthModule } from './modules/auth/auth.module';
import { WithdrawalRequestsModule } from './modules/withdrawal-requests/withdrawal-requests.module';
import { RatesModule } from './modules/rates/rates.module';
import { CountriesModule } from './modules/countries/countries.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SecurityModule,
    TypeOrmModule.forRoot(databaseConfig()),
    HealthModule,
    AuthModule,
    WithdrawalRequestsModule,
    RatesModule,
    CountriesModule,
    FileUploadModule,
    AuditLogModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule {}
