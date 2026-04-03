import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('requests-by-app')
  async getRequestsByApp() {
    return this.dashboardService.getRequestsByApp();
  }

  @Get('requests-by-country')
  async getRequestsByCountry() {
    return this.dashboardService.getRequestsByCountry();
  }

  @Get('requests-by-status')
  async getRequestsByStatus() {
    return this.dashboardService.getRequestsByStatus();
  }

  @Get('recent-requests')
  async getRecentRequests(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentRequests(limit);
  }

  @Get('app-rates')
  async getAppRates() {
    return this.dashboardService.getAppRates();
  }

  @Get('payout-trends')
  async getPayoutTrends(@Query('days') days?: number) {
    return this.dashboardService.getPayoutTrends(days);
  }
}
