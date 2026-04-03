import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRate } from './entities/app-rate.entity';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppRate]), AuditLogModule],
  providers: [RatesService],
  controllers: [RatesController],
  exports: [RatesService],
})
export class RatesModule {}
