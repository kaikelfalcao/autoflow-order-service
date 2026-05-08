import { ApproveBudgetUseCase } from '../../../src/modules/budget/application/use-cases/approve-budget/approve-budget.use-case';

describe('ApproveBudgetUseCase', () => {
  it('approves budget, updates order status and publishes BUDGET_APPROVED', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => ({
        orderId: 'order-1',
        status: 'PENDING',
        finalAmount: '250.00',
        respondedAt: null,
      })),
      save: jest.fn(async (payload) => payload),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce({ id: 'order-1', status: 'APPROVED' })
        .mockResolvedValueOnce({ id: 'order-1', status: 'IN_EXECUTION' }),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new ApproveBudgetUseCase(
      budgetRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute('order-1');

    expect(result.orderStatus).toBe('IN_EXECUTION');
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'BUDGET_APPROVED' }),
    );
  });

  it('throws when budget does not exist', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => null),
      save: jest.fn(),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest.fn(),
    };

    const orderEventPublisher = {
      publish: jest.fn(),
    };

    const useCase = new ApproveBudgetUseCase(
      budgetRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    await expect(useCase.execute('order-404')).rejects.toThrow('Budget not found');
  });
});

