import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN, UserRole.FINANCE_ADMIN, UserRole.AUDITOR)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('requests')
  async getRequestsReport(@Query() filters: any) {
    return this.reportsService.generateRequestsReport(filters);
  }

  @Get('payouts')
  async getPayoutReport(@Query() filters: any) {
    return this.reportsService.generatePayoutReport(filters);
  }

  @Get('revenue')
  async getRevenueReport(@Query() filters: any) {
    return this.reportsService.generateRevenueReport(filters);
  }
}
