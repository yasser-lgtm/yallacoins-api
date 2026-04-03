import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalRequest } from './entities/withdrawal-request.entity';
import { RequestSnapshot } from './entities/request-snapshot.entity';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';
import { WithdrawalPricingService } from './services/withdrawal-pricing.service';
import { UploadTokenService } from './services/upload-token.service';
import { RatesModule } from '../rates/rates.module';
import { CountriesModule } from '../countries/countries.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WithdrawalRequest, RequestSnapshot]),
    RatesModule,
    CountriesModule,
    AuditLogModule,
  ],
  providers: [
    WithdrawalRequestsService,
    WithdrawalPricingService,
    UploadTokenService,
  ],
  controllers: [WithdrawalRequestsController],
  exports: [
    WithdrawalRequestsService,
    WithdrawalPricingService,
    UploadTokenService,
  ],
})
export class WithdrawalRequestsModule {}
