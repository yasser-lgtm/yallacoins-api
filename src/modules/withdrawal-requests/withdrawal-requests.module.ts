import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { WithdrawalRequest } from './entities/withdrawal-request.entity';
import { RequestSnapshot } from './entities/request-snapshot.entity';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';
import { RatesModule } from '../rates/rates.module';
import { CountriesModule } from '../countries/countries.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WithdrawalRequest, RequestSnapshot]),
    JwtModule,
    RatesModule,
    CountriesModule,
    AuditLogModule,
  ],
  providers: [WithdrawalRequestsService],
  controllers: [WithdrawalRequestsController],
  exports: [WithdrawalRequestsService],
})
export class WithdrawalRequestsModule {}
