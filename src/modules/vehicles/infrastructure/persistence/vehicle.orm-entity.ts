import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("vehicles")
export class VehicleTypeormEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Index()
  @Column({ name: "customer_id", type: "uuid" })
  customerId: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 8 })
  plate: string;

  @Column({ type: "varchar", length: 100 })
  brand: string;

  @Column({ type: "varchar", length: 100 })
  model: string;

  @Column({ type: "smallint" })
  year: number;

  @Column({ type: "varchar", length: 50 })
  color: string;

  @Column({ name: "mileage_km", type: "integer", default: 0 })
  mileageKm: number;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
