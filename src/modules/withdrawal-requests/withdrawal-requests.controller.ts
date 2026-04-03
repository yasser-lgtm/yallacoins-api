import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('withdrawal-requests')
export class WithdrawalRequestsController {
  constructor(private requestsService: WithdrawalRequestsService) {}

  @Post()
  async createRequest(@Body() dto: CreateWithdrawalRequestDto, @Request() req) {
    // Public endpoint - no auth required
    const creatorId = req.user?.id || 'anonymous';
    return this.requestsService.createRequest(dto, creatorId);
  }

  @Get()
  async getAllRequests(@Query() filters: any) {
    return this.requestsService.getAllRequests(filters);
  }

  @Get(':id')
  async getRequest(@Param('id') id: string) {
    return this.requestsService.getRequestById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN, UserRole.FINANCE_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @Request() req,
  ) {
    return this.requestsService.updateRequestStatus(id, body.status as any, req.user.id, req.user.name, body.notes);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN)
  async rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.requestsService.rejectRequest(id, body.reason, req.user.id, req.user.name);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS_ADMIN)
  async assignRequest(
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
    @Request() req,
  ) {
    return this.requestsService.assignRequest(id, body.assignedTo, req.user.id, req.user.name);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats() {
    return this.requestsService.getDashboardStats();
  }
}
