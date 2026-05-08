import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderStatusHistory1714000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL,
        from_status VARCHAR(40),
        to_status VARCHAR(40) NOT NULL,
        changed_by VARCHAR(120) NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history (order_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_order_status_history_order_id');
    await queryRunner.query('DROP TABLE IF EXISTS order_status_history');
  }
}

