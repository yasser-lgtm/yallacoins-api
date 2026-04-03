import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { RequestSnapshot } from './request-snapshot.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  NEEDS_CORRECTION = 'needs_correction',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Entity('withdrawal_requests')
@Index(['creatorId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['app'])
export class WithdrawalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creatorId: string;

  @Column()
  app: string; // 'bigo', 'kiti', 'xena'

  @Column()
  accountId: string;

  @Column()
  phoneNumber: string;

  @Column()
  country: string;

  @Column()
  payoutMethod: string;

  @Column()
  payoutInfo: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountInBeans: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedUSD: number;

  @Column({ type: 'varchar', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Column({ nullable: true })
  proofFileId: string;

  @OneToOne(() => RequestSnapshot, { eager: true, cascade: true })
  @JoinColumn()
  snapshot: RequestSnapshot;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
