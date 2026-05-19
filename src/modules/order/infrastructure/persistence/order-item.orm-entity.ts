import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { OrderOrmEntity } from "./order.orm-entity";

@Entity({ name: "order_items" })
export class OrderItemOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ name: "order_id", type: "uuid" })
  orderId: string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: OrderOrmEntity;

  @Column({ name: "item_type", length: 20 })
  itemType: "SERVICE" | "PART";

  @Column({ name: "catalog_item_id", type: "varchar", length: 64 })
  catalogItemId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: "unit_price", type: "numeric", precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  subtotal: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
