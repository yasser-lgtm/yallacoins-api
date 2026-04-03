import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATIONS_ADMIN = 'operations_admin',
  FINANCE_ADMIN = 'finance_admin',
  RATE_MANAGER = 'rate_manager',
  SUPPORT_AGENT = 'support_agent',
  AUDITOR = 'auditor',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', enum: UserRole, default: UserRole.SUPPORT_AGENT })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLogin: Date;
}
