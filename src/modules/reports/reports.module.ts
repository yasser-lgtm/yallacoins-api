import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalRequest } from '../withdrawal-requests/entities/withdrawal-request.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalRequest])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
