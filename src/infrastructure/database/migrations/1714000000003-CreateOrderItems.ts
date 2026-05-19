import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderItems1714000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL,
        item_type VARCHAR(20) NOT NULL,
        catalog_item_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        subtotal NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT ck_order_items_item_type CHECK (item_type IN ('SERVICE', 'PART'))
      )
    `);

    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP INDEX IF EXISTS idx_order_items_order_id");
    await queryRunner.query("DROP TABLE IF EXISTS order_items");
  }
}
