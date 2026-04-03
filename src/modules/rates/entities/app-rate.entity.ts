import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RateStatus {
  ACTIVE = 'active',
  LIMITED = 'limited',
  DISABLED = 'disabled',
}

@Entity('app_rates')
@Index(['appName'], { unique: true })
export class AppRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appName: string; // 'bigo', 'kiti', 'xena'

  @Column()
  conversionUnitLabel: string; // 'Beans', 'Points', 'Coins'

  @Column()
  conversionLogic: string; // e.g., "1000 Beans = 1 USD"

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  publicRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  internalRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  feeValue: number; // percentage

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  minimumWithdrawal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maximumWithdrawal: number;

  @Column()
  etaText: string;

  @Column({ type: 'varchar', enum: RateStatus, default: RateStatus.ACTIVE })
  status: RateStatus;

  @Column({ nullable: true, type: 'text' })
  publicNote: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  versionHistory: Array<{
    version: number;
    rate: number;
    fee: number;
    updatedAt: string;
    updatedBy: string;
    reason: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
