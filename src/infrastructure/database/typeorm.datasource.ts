import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'order_service',
  password: process.env.DATABASE_PASSWORD || 'order_service',
  database: process.env.DATABASE_NAME || 'order_service',
  // Mantem configuracao simples: o TypeORM resolve entidades/migrations automaticamente.
  entities: [
    'src/modules/**/infrastructure/persistence/*.orm-entity.ts',
  ],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
