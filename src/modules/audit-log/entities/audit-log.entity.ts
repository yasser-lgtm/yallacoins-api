import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REQUEST_SUBMITTED = 'request_submitted',
  REQUEST_STATUS_CHANGED = 'request_status_changed',
  REQUEST_APPROVED = 'request_approved',
  REQUEST_REJECTED = 'request_rejected',
  REQUEST_MARKED_PAID = 'request_marked_paid',
  RATE_UPDATED = 'rate_updated',
  PAYOUT_METHOD_CREATED = 'payout_method_created',
  PAYOUT_METHOD_UPDATED = 'payout_method_updated',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  CONTENT_UPDATED = 'content_updated',
  ADMIN_NOTE_ADDED = 'admin_note_added',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entityType'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({ type: 'varchar', enum: AuditAction })
  action: AuditAction;

  @Column()
  entityType: string; // 'withdrawal_request', 'app_rate', 'user', etc.

  @Column()
  entityId: string;

  @Column({ nullable: true, type: 'jsonb' })
  oldValue: any;

  @Column({ nullable: true, type: 'jsonb' })
  newValue: any;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
