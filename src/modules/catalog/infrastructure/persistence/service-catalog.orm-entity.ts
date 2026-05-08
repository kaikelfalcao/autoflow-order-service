import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'service_catalog' })
export class ServiceCatalogOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 })
  basePrice: string;

  @Column({ name: 'estimated_duration_minutes', type: 'int' })
  estimatedDurationMinutes: number;

  @Column({ length: 100 })
  category: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
