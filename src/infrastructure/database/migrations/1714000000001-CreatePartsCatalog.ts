import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartsCatalog1714000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS parts_catalog (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        min_stock INT NOT NULL DEFAULT 0,
        supplier VARCHAR(255),
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS parts_catalog');
  }
}

