import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.AUDITOR)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(@Query() filters: any) {
    return this.auditLogService.getAuditLogs(filters);
  }

  @Get('entity/:entityType/:entityId')
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.getEntityAuditTrail(entityType, entityId);
  }

  @Get('user/:userId')
  async getUserActivity(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.auditLogService.getUserActivity(userId, limit);
  }
}
