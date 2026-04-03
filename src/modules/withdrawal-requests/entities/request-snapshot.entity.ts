import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_snapshots')
export class RequestSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Immutable snapshot of conversion logic at time of submission
  @Column({ type: 'jsonb' })
  conversionLogic: {
    appName: string;
    conversionUnitLabel: string;
    beansToUSD: number;
  };

  // Immutable snapshot of rate used
  @Column({ type: 'jsonb' })
  rateSnapshot: {
    publicRate: number;
    internalRate: number;
    feeValue: number;
    minimumWithdrawal: number;
    etaText: string;
  };

  // Immutable snapshot of payout method
  @Column({ type: 'jsonb' })
  payoutMethodSnapshot: {
    name: string;
    feeValue: number;
    feeType: 'fixed' | 'percentage';
    etaText: string;
  };

  // Immutable calculation results
  @Column({ type: 'jsonb' })
  calculationSnapshot: {
    beansSubmitted: number;
    conversionRate: number;
    usdBeforeAppFee: number;
    appFeeAmount: number;
    appFeePercentage: number;
    usdAfterAppFee: number;
    payoutFeeAmount: number;
    payoutFeePercentage: number;
    estimatedPayout: number;
    currency: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}
