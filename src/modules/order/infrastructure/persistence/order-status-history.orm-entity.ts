import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { OrderOrmEntity } from "./order.orm-entity";

@Entity({ name: "order_status_history" })
export class OrderStatusHistoryOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ name: "order_id", type: "uuid" })
  orderId: string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.statusHistory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: OrderOrmEntity;

  @Column({ name: "from_status", type: "varchar", length: 40, nullable: true })
  fromStatus: string | null;

  @Column({ name: "to_status", length: 40 })
  toStatus: string;

  @Column({ name: "changed_by", length: 120 })
  changedBy: string;

  @Column({ type: "text", nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
