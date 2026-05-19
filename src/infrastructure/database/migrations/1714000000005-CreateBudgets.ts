import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBudgets1714000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL UNIQUE,
        total_amount NUMERIC(10,2) NOT NULL,
        discount NUMERIC(10,2) NOT NULL DEFAULT 0,
        final_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        responded_at TIMESTAMPTZ,
        valid_until TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_budgets_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT ck_budgets_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
      )
    `);

    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_budgets_order_id ON budgets (order_id)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP INDEX IF EXISTS idx_budgets_order_id");
    await queryRunner.query("DROP TABLE IF EXISTS budgets");
  }
}
