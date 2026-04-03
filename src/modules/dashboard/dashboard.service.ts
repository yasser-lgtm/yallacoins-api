import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithdrawalRequest, WithdrawalStatus } from '../withdrawal-requests/entities/withdrawal-request.entity';
import { AppRate } from '../rates/entities/app-rate.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(WithdrawalRequest)
    private requestsRepository: Repository<WithdrawalRequest>,
    @InjectRepository(AppRate)
    private ratesRepository: Repository<AppRate>,
  ) {}

  async getDashboardSummary() {
    const [requests, totalRequests] = await this.requestsRepository.findAndCount();

    const stats = {
      totalRequests,
      pending: await this.requestsRepository.count({ where: { status: WithdrawalStatus.PENDING } }),
      underReview: await this.requestsRepository.count({ where: { status: WithdrawalStatus.UNDER_REVIEW } }),
      approved: await this.requestsRepository.count({ where: { status: WithdrawalStatus.APPROVED } }),
      needsCorrection: await this.requestsRepository.count({ where: { status: WithdrawalStatus.NEEDS_CORRECTION } }),
      rejected: await this.requestsRepository.count({ where: { status: WithdrawalStatus.REJECTED } }),
      paid: await this.requestsRepository.count({ where: { status: WithdrawalStatus.PAID } }),
    };

    const totalPayoutValue = requests
      .filter((r) => r.status === WithdrawalStatus.PAID)
      .reduce((sum, r) => sum + parseFloat(r.estimatedUSD.toString()), 0);

    return {
      stats,
      totalPayoutValue,
      timestamp: new Date(),
    };
  }

  async getRequestsByApp() {
    const query = this.requestsRepository
      .createQueryBuilder('req')
      .select('req.app', 'app')
      .addSelect('COUNT(req.id)', 'count')
      .groupBy('req.app');

    const results = await query.getRawMany();

    return results.map((r) => ({
      app: r.app,
      count: parseInt(r.count),
    }));
  }

  async getRequestsByCountry() {
    const query = this.requestsRepository
      .createQueryBuilder('req')
      .select('req.country', 'country')
      .addSelect('COUNT(req.id)', 'count')
      .groupBy('req.country');

    const results = await query.getRawMany();

    return results.map((r) => ({
      country: r.country,
      count: parseInt(r.count),
    }));
  }

  async getRequestsByStatus() {
    const query = this.requestsRepository
      .createQueryBuilder('req')
      .select('req.status', 'status')
      .addSelect('COUNT(req.id)', 'count')
      .groupBy('req.status');

    const results = await query.getRawMany();

    return results.map((r) => ({
      status: r.status,
      count: parseInt(r.count),
    }));
  }

  async getRecentRequests(limit = 10) {
    return this.requestsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAppRates() {
    return this.ratesRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async getPayoutTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.requestsRepository
      .createQueryBuilder('req')
      .select("DATE(req.createdAt)", 'date')
      .addSelect('COUNT(req.id)', 'count')
      .addSelect('SUM(CAST(req.estimatedUSD AS DECIMAL))', 'totalAmount')
      .where('req.createdAt >= :startDate', { startDate })
      .groupBy("DATE(req.createdAt)")
      .orderBy("DATE(req.createdAt)", 'ASC');

    return query.getRawMany();
  }
}
