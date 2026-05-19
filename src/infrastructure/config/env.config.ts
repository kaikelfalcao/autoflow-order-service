export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT ?? "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  },
  customerService: {
    url: process.env.CUSTOMER_SERVICE_URL,
    timeout: parseInt(process.env.CUSTOMER_SERVICE_TIMEOUT ?? "3000", 10),
    retries: parseInt(process.env.CUSTOMER_SERVICE_RETRIES ?? "1", 10),
  },
  newRelic: {
    appName: process.env.NEW_RELIC_APP_NAME || "order-service",
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  },
});
