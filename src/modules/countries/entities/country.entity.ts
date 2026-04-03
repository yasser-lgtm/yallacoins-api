import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PayoutMethod } from './payout-method.entity';

@Entity('countries')
@Index(['code'], { unique: true })
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string; // 'EG', 'AE', etc.

  @Column()
  currency: string; // 'EGP', 'AED', etc.

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => PayoutMethod, (method) => method.country, { eager: true, cascade: true })
  payoutMethods: PayoutMethod[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
