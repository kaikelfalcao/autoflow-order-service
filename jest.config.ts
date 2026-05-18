import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/modules/order/application/use-cases/open-order/open-order.use-case.ts',
    'src/modules/order/application/use-cases/update-status/update-order-status.use-case.ts',
    'src/modules/budget/application/use-cases/generate-budget/generate-budget.use-case.ts',
    'src/modules/budget/application/use-cases/approve-budget/approve-budget.use-case.ts',
    'src/modules/budget/application/use-cases/reject-budget/reject-budget.use-case.ts',
    'src/modules/execution/application/use-cases/complete-execution/complete-execution.use-case.ts',
    'src/modules/execution/application/use-cases/get-execution-queue/get-execution-queue.use-case.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
};

export default config;

