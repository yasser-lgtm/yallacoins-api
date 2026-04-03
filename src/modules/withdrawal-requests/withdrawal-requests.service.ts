import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithdrawalRequest, WithdrawalStatus } from './entities/withdrawal-request.entity';
import { RequestSnapshot } from './entities/request-snapshot.entity';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { RatesService } from '../rates/rates.service';
import { CountriesService } from '../countries/countries.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class WithdrawalRequestsService {
  constructor(
    @InjectRepository(WithdrawalRequest)
    private requestsRepository: Repository<WithdrawalRequest>,
    @InjectRepository(RequestSnapshot)
    private snapshotsRepository: Repository<RequestSnapshot>,
    private ratesService: RatesService,
    private countriesService: CountriesService,
    private auditLogService: AuditLogService,
  ) {}

  async createRequest(dto: CreateWithdrawalRequestDto, creatorId: string) {
    // Get current rates
    const appRate = await this.ratesService.getRateByAppName(dto.app);
    if (!appRate) {
      throw new BadRequestException(`App rate not found for ${dto.app}`);
    }

    // Get payout method
    const payoutMethod = await this.countriesService.getPayoutMethod(dto.payoutMethod, dto.country);
    if (!payoutMethod) {
      throw new BadRequestException('Payout method not found');
    }

    // Calculate conversion
    const conversionRate = appRate.publicRate;
    const usdBeforeAppFee = dto.amountInBeans * conversionRate;
    const appFeeAmount = (usdBeforeAppFee * appRate.feeValue) / 100;
    const usdAfterAppFee = usdBeforeAppFee - appFeeAmount;

    let payoutFeeAmount = 0;
    if (payoutMethod.feeType === 'fixed') {
      payoutFeeAmount = payoutMethod.feeValue;
    } else {
      payoutFeeAmount = (usdAfterAppFee * payoutMethod.feeValue) / 100;
    }

    const estimatedPayout = usdAfterAppFee - payoutFeeAmount;

    // Create immutable snapshot
    const snapshot = this.snapshotsRepository.create({
      conversionLogic: {
        appName: appRate.appName,
        conversionUnitLabel: appRate.conversionUnitLabel,
        beansToUSD: conversionRate,
      },
      rateSnapshot: {
        publicRate: appRate.publicRate,
        internalRate: appRate.internalRate,
        feeValue: appRate.feeValue,
        minimumWithdrawal: appRate.minimumWithdrawal,
        etaText: appRate.etaText,
      },
      payoutMethodSnapshot: {
        name: payoutMethod.name,
        feeValue: payoutMethod.feeValue,
        feeType: payoutMethod.feeType,
        etaText: payoutMethod.etaText,
      },
      calculationSnapshot: {
        beansSubmitted: dto.amountInBeans,
        conversionRate,
        usdBeforeAppFee,
        appFeeAmount,
        appFeePercentage: appRate.feeValue,
        usdAfterAppFee,
        payoutFeeAmount,
        payoutFeePercentage: payoutMethod.feeType === 'percentage' ? payoutMethod.feeValue : 0,
        estimatedPayout,
        currency: (await this.countriesService.getCountry(dto.country)).currency,
      },
    });

    await this.snapshotsRepository.save(snapshot);

    // Create withdrawal request
    const request = this.requestsRepository.create({
      ...dto,
      creatorId,
      estimatedUSD: estimatedPayout,
      snapshot,
    });

    const savedRequest = await this.requestsRepository.save(request);

    // Log audit
    await this.auditLogService.log({
      userId: creatorId,
      userName: 'Creator',
      action: AuditAction.REQUEST_SUBMITTED,
      entityType: 'withdrawal_request',
      entityId: savedRequest.id,
      newValue: savedRequest,
    });

    return savedRequest;
  }

  async getRequestById(id: string) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['snapshot'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async getAllRequests(filters?: {
    status?: WithdrawalStatus;
    app?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.requestsRepository.createQueryBuilder('req');

    if (filters?.status) {
      query.andWhere('req.status = :status', { status: filters.status });
    }
    if (filters?.app) {
      query.andWhere('req.app = :app', { app: filters.app });
    }
    if (filters?.country) {
      query.andWhere('req.country = :country', { country: filters.country });
    }

    query.orderBy('req.createdAt', 'DESC');

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [requests, total] = await query.getManyAndCount();

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateRequestStatus(id: string, status: WithdrawalStatus, adminId: string, adminName: string, notes?: string) {
    const request = await this.getRequestById(id);
    const oldStatus = request.status;

    request.status = status;
    if (notes) {
      request.adminNotes = notes;
    }

    if (status === WithdrawalStatus.PAID) {
      request.paidAt = new Date();
    }

    const updated = await this.requestsRepository.save(request);

    // Log audit
    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.REQUEST_STATUS_CHANGED,
      entityType: 'withdrawal_request',
      entityId: id,
      oldValue: { status: oldStatus },
      newValue: { status },
      comment: notes,
    });

    return updated;
  }

  async rejectRequest(id: string, reason: string, adminId: string, adminName: string) {
    const request = await this.getRequestById(id);
    request.status = WithdrawalStatus.REJECTED;
    request.rejectionReason = reason;

    const updated = await this.requestsRepository.save(request);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.REQUEST_REJECTED,
      entityType: 'withdrawal_request',
      entityId: id,
      comment: reason,
    });

    return updated;
  }

  async assignRequest(id: string, assignedTo: string, adminId: string, adminName: string) {
    const request = await this.getRequestById(id);
    request.assignedTo = assignedTo;

    const updated = await this.requestsRepository.save(request);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.ADMIN_NOTE_ADDED,
      entityType: 'withdrawal_request',
      entityId: id,
      comment: `Assigned to ${assignedTo}`,
    });

    return updated;
  }

  async getDashboardStats() {
    const stats = {
      total: await this.requestsRepository.count(),
      pending: await this.requestsRepository.count({ where: { status: WithdrawalStatus.PENDING } }),
      underReview: await this.requestsRepository.count({ where: { status: WithdrawalStatus.UNDER_REVIEW } }),
      approved: await this.requestsRepository.count({ where: { status: WithdrawalStatus.APPROVED } }),
      needsCorrection: await this.requestsRepository.count({ where: { status: WithdrawalStatus.NEEDS_CORRECTION } }),
      rejected: await this.requestsRepository.count({ where: { status: WithdrawalStatus.REJECTED } }),
      paid: await this.requestsRepository.count({ where: { status: WithdrawalStatus.PAID } }),
    };

    return stats;
  }
}
