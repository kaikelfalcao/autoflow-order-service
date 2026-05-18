import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomers1714000000006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE customers (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_type   VARCHAR(4) NOT NULL,
        document_number VARCHAR(14) NOT NULL,
        name            VARCHAR(255) NOT NULL,
        email           VARCHAR(255) NOT NULL,
        phone           VARCHAR(20) NOT NULL,
        active          BOOLEAN NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT customers_document_number_unique UNIQUE (document_number)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_customers_document ON customers (document_number)`);
    await queryRunner.query(`CREATE INDEX idx_customers_active ON customers (active)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_document`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers`);
  }
}
