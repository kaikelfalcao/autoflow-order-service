import { RejectBudgetUseCase } from '../../../src/modules/budget/application/use-cases/reject-budget/reject-budget.use-case';

describe('RejectBudgetUseCase', () => {
  it('rejects budget, cancels order and publishes compensation events', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => ({ orderId: 'order-1', status: 'PENDING', respondedAt: null })),
      save: jest.fn(async (payload) => payload),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce({ id: 'order-1', status: 'REJECTED' })
        .mockResolvedValueOnce({ id: 'order-1', status: 'CANCELLED' }),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new RejectBudgetUseCase(
      budgetRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute({ orderId: 'order-1', reason: 'client declined' });

    expect(result.orderStatus).toBe('CANCELLED');
    expect(orderEventPublisher.publish).toHaveBeenCalledTimes(2);
    expect(orderEventPublisher.publish).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ eventType: 'BUDGET_REJECTED' }),
    );
    expect(orderEventPublisher.publish).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ eventType: 'OS_CANCELLED' }),
    );
  });

  it('uses default reason when reason is not provided', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => ({ orderId: 'order-2', status: 'PENDING', respondedAt: null })),
      save: jest.fn(async (payload) => payload),
    };
    const orderStatusHistoryService = {
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce({ id: 'order-2', status: 'REJECTED' })
        .mockResolvedValueOnce({ id: 'order-2', status: 'CANCELLED' }),
    };
    const orderEventPublisher = { publish: jest.fn(async () => undefined) };

    const useCase = new RejectBudgetUseCase(
      budgetRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute({ orderId: 'order-2' }); // no reason

    expect(result.orderStatus).toBe('CANCELLED');
    expect(orderEventPublisher.publish).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ payload: expect.objectContaining({ reason: 'Budget rejected' }) }),
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

    const useCase = new RejectBudgetUseCase(
      budgetRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    await expect(useCase.execute({ orderId: 'order-404' })).rejects.toThrow('Budget not found');
  });
});

