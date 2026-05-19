import "dotenv/config";
import { join } from "path";
import { DataSource } from "typeorm";

// Resolve entities/migrations relativo a __dirname → funciona em src/ (ts-node) e em dist/ (js).
// O glob {.ts,.js} cobre ambos.
const isCompiled = __filename.endsWith(".js");
const root = isCompiled
  ? join(__dirname, "..", "..") // dist/infrastructure/database → dist
  : join(__dirname, "..", ".."); // src/infrastructure/database  → src

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || "order_service",
  password: process.env.DATABASE_PASSWORD || "order_service",
  database: process.env.DATABASE_NAME || "order_service",
  entities: [join(root, "modules/**/infrastructure/persistence/*.orm-entity.{ts,js}")],
  migrations: [join(__dirname, "migrations/*.{ts,js}")],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
