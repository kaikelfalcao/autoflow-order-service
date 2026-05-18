import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehicles1714000000007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE vehicles (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        plate       VARCHAR(8) NOT NULL,
        brand       VARCHAR(100) NOT NULL,
        model       VARCHAR(100) NOT NULL,
        year        SMALLINT NOT NULL,
        color       VARCHAR(50) NOT NULL,
        mileage_km  INTEGER NOT NULL DEFAULT 0,
        active      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT vehicles_plate_unique UNIQUE (plate)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_vehicles_customer_id ON vehicles (customer_id)`);
    await queryRunner.query(`CREATE INDEX idx_vehicles_plate ON vehicles (plate)`);
    await queryRunner.query(`CREATE INDEX idx_vehicles_active ON vehicles (active)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vehicles_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vehicles_plate`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vehicles_customer_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS vehicles`);
  }
}
