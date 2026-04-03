import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalRequest } from '../withdrawal-requests/entities/withdrawal-request.entity';
import { AppRate } from '../rates/entities/app-rate.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalRequest, AppRate])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
