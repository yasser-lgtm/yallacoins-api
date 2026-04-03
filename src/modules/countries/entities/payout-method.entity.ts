import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Country } from './country.entity';

export enum FeeType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

@Entity('payout_methods')
@Index(['countryId', 'name'], { unique: true })
export class PayoutMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // 'Vodafone Cash', 'InstaPay', 'Bank Transfer', etc.

  @Column({ type: 'varchar', enum: FeeType, default: FeeType.FIXED })
  feeType: FeeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  feeValue: number; // amount or percentage

  @Column()
  etaText: string; // '24-48 hours', 'Instant', etc.

  @Column({ default: false })
  recommended: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Country, (country) => country.payoutMethods, { onDelete: 'CASCADE' })
  country: Country;

  @Column()
  countryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
