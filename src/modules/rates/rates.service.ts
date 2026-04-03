import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRate, RateStatus } from './entities/app-rate.entity';
import { CreateAppRateDto } from './dto/create-app-rate.dto';
import { UpdateAppRateDto } from './dto/update-app-rate.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(AppRate)
    private ratesRepository: Repository<AppRate>,
    private auditLogService: AuditLogService,
  ) {}

  async createRate(dto: CreateAppRateDto) {
    const existingRate = await this.ratesRepository.findOne({
      where: { appName: dto.appName },
    });

    if (existingRate) {
      throw new BadRequestException(`Rate for ${dto.appName} already exists`);
    }

    const rate = this.ratesRepository.create({
      ...dto,
      versionHistory: [
        {
          version: 1,
          rate: dto.publicRate,
          fee: dto.feeValue,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          reason: 'Initial rate',
        },
      ],
    });

    return this.ratesRepository.save(rate);
  }

  async getRateByAppName(appName: string) {
    const rate = await this.ratesRepository.findOne({
      where: { appName, status: RateStatus.ACTIVE },
    });

    if (!rate) {
      throw new NotFoundException(`Rate not found for app: ${appName}`);
    }

    return rate;
  }

  async getAllRates() {
    return this.ratesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateRate(id: string, dto: UpdateAppRateDto, adminId: string, adminName: string) {
    const rate = await this.ratesRepository.findOne({ where: { id } });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    const oldRate = { ...rate };

    // Add to version history
    const newVersion = (rate.versionHistory?.length || 0) + 1;
    const versionEntry = {
      version: newVersion,
      rate: dto.publicRate || rate.publicRate,
      fee: dto.feeValue || rate.feeValue,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
      reason: dto.reason || 'Rate update',
    };

    rate.versionHistory = [...(rate.versionHistory || []), versionEntry];

    Object.assign(rate, dto);

    const updated = await this.ratesRepository.save(rate);

    // Log audit
    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.RATE_UPDATED,
      entityType: 'app_rate',
      entityId: id,
      oldValue: oldRate,
      newValue: updated,
      comment: dto.reason,
    });

    return updated;
  }

  async getRateHistory(id: string) {
    const rate = await this.ratesRepository.findOne({ where: { id } });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    return rate.versionHistory || [];
  }

  async disableRate(id: string, adminId: string, adminName: string) {
    const rate = await this.ratesRepository.findOne({ where: { id } });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    rate.status = RateStatus.DISABLED;

    const updated = await this.ratesRepository.save(rate);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.RATE_UPDATED,
      entityType: 'app_rate',
      entityId: id,
      oldValue: { status: RateStatus.ACTIVE },
      newValue: { status: RateStatus.DISABLED },
      comment: 'Rate disabled',
    });

    return updated;
  }
}
