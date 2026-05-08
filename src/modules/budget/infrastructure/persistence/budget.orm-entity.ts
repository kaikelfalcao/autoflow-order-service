import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'budgets' })
export class BudgetOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  discount: string;

  @Column({ name: 'final_amount', type: 'numeric', precision: 10, scale: 2 })
  finalAmount: string;

  @Column({ length: 20, default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ name: 'sent_at', type: 'timestamptz' })
  sentAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;

  @Column({ name: 'valid_until', type: 'timestamptz' })
  validUntil: Date;
}
