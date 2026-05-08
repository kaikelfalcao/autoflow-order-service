import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1714000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        customer_cpf VARCHAR(14) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(30) NOT NULL,
        vehicle_plate VARCHAR(10) NOT NULL,
        vehicle_brand VARCHAR(100) NOT NULL,
        vehicle_model VARCHAR(100) NOT NULL,
        vehicle_year INT NOT NULL,
        branch_id UUID,
        status VARCHAR(40) NOT NULL DEFAULT 'RECEIVED',
        total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_orders_status');
    await queryRunner.query('DROP TABLE IF EXISTS orders');
  }
}

