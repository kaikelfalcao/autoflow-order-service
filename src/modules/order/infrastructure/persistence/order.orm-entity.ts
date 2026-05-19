import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { OrderItemOrmEntity } from "./order-item.orm-entity";
import { OrderStatusHistoryOrmEntity } from "./order-status-history.orm-entity";

@Entity({ name: "orders" })
export class OrderOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ name: "customer_cpf", length: 14 })
  customerCpf: string;

  @Column({ name: "customer_name", length: 255 })
  customerName: string;

  @Column({ name: "customer_phone", length: 30 })
  customerPhone: string;

  @Column({ name: "vehicle_plate", length: 10 })
  vehiclePlate: string;

  @Column({ name: "vehicle_brand", length: 100 })
  vehicleBrand: string;

  @Column({ name: "vehicle_model", length: 100 })
  vehicleModel: string;

  @Column({ name: "vehicle_year", type: "int" })
  vehicleYear: number;

  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId: string | null;

  @Column({ length: 40, default: "RECEIVED" })
  status: string;

  @Column({
    name: "total_amount",
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: string;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order, { cascade: false })
  items: OrderItemOrmEntity[];

  @OneToMany(() => OrderStatusHistoryOrmEntity, (history) => history.order, {
    cascade: false,
  })
  statusHistory: OrderStatusHistoryOrmEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
