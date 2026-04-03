import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithdrawalRequest, WithdrawalStatus } from '../withdrawal-requests/entities/withdrawal-request.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(WithdrawalRequest)
    private requestsRepository: Repository<WithdrawalRequest>,
  ) {}

  async generateRequestsReport(filters?: {
    startDate?: Date;
    endDate?: Date;
    app?: string;
    country?: string;
    status?: WithdrawalStatus;
  }) {
    const query = this.requestsRepository.createQueryBuilder('req');

    if (filters?.startDate) {
      query.andWhere('req.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('req.createdAt <= :endDate', { endDate: filters.endDate });
    }
    if (filters?.app) {
      query.andWhere('req.app = :app', { app: filters.app });
    }
    if (filters?.country) {
      query.andWhere('req.country = :country', { country: filters.country });
    }
    if (filters?.status) {
      query.andWhere('req.status = :status', { status: filters.status });
    }

    const requests = await query.orderBy('req.createdAt', 'DESC').getMany();

    const totalRequests = requests.length;
    const totalAmount = requests.reduce((sum, r) => sum + parseFloat(r.estimatedUSD.toString()), 0);
    const averageAmount = totalRequests > 0 ? totalAmount / totalRequests : 0;

    const statusBreakdown = {
      pending: requests.filter((r) => r.status === WithdrawalStatus.PENDING).length,
      underReview: requests.filter((r) => r.status === WithdrawalStatus.UNDER_REVIEW).length,
      approved: requests.filter((r) => r.status === WithdrawalStatus.APPROVED).length,
      needsCorrection: requests.filter((r) => r.status === WithdrawalStatus.NEEDS_CORRECTION).length,
      rejected: requests.filter((r) => r.status === WithdrawalStatus.REJECTED).length,
      paid: requests.filter((r) => r.status === WithdrawalStatus.PAID).length,
    };

    const appBreakdown = {};
    requests.forEach((r) => {
      appBreakdown[r.app] = (appBreakdown[r.app] || 0) + 1;
    });

    const countryBreakdown = {};
    requests.forEach((r) => {
      countryBreakdown[r.country] = (countryBreakdown[r.country] || 0) + 1;
    });

    return {
      summary: {
        totalRequests,
        totalAmount,
        averageAmount,
        period: {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      },
      statusBreakdown,
      appBreakdown,
      countryBreakdown,
      requests,
    };
  }

  async generatePayoutReport(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.requestsRepository.createQueryBuilder('req').where('req.status = :status', { status: WithdrawalStatus.PAID });

    if (filters?.startDate) {
      query.andWhere('req.paidAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('req.paidAt <= :endDate', { endDate: filters.endDate });
    }

    const requests = await query.getMany();

    const totalPayouts = requests.length;
    const totalAmount = requests.reduce((sum, r) => sum + parseFloat(r.estimatedUSD.toString()), 0);

    const payoutsByMethod = {};
    requests.forEach((r) => {
      payoutsByMethod[r.payoutMethod] = (payoutsByMethod[r.payoutMethod] || 0) + 1;
    });

    const payoutsByCountry = {};
    requests.forEach((r) => {
      payoutsByCountry[r.country] = (payoutsByCountry[r.country] || 0) + 1;
    });

    return {
      summary: {
        totalPayouts,
        totalAmount,
        averagePayoutAmount: totalPayouts > 0 ? totalAmount / totalPayouts : 0,
        period: {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      },
      payoutsByMethod,
      payoutsByCountry,
      requests,
    };
  }

  async generateRevenueReport(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.requestsRepository.createQueryBuilder('req');

    if (filters?.startDate) {
      query.andWhere('req.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('req.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const requests = await query.getMany();

    let totalAppFees = 0;
    let totalPayoutFees = 0;

    requests.forEach((r) => {
      if (r.snapshot?.calculationSnapshot) {
        totalAppFees += r.snapshot.calculationSnapshot.appFeeAmount;
        totalPayoutFees += r.snapshot.calculationSnapshot.payoutFeeAmount;
      }
    });

    return {
      summary: {
        totalRequests: requests.length,
        totalAppFees,
        totalPayoutFees,
        totalFees: totalAppFees + totalPayoutFees,
        period: {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      },
      breakdown: {
        appFees: totalAppFees,
        payoutFees: totalPayoutFees,
      },
    };
  }
}
