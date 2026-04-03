import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId: string;
    userName: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    comment?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const auditLog = this.auditLogsRepository.create(data);
    return this.auditLogsRepository.save(auditLog);
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.auditLogsRepository.createQueryBuilder('log');

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }
    if (filters?.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters?.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
    }

    query.orderBy('log.createdAt', 'DESC');

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    query.skip((page - 1) * limit).take(limit);

    const [logs, total] = await query.getManyAndCount();

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getEntityAuditTrail(entityType: string, entityId: string) {
    return this.auditLogsRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: string, limit = 50) {
    return this.auditLogsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
