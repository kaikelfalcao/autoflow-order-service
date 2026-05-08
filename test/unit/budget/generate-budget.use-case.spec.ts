import { GenerateBudgetUseCase } from '../../../src/modules/budget/application/use-cases/generate-budget/generate-budget.use-case';

describe('GenerateBudgetUseCase', () => {
  it('calculates totals, persists budget and publishes BUDGET_GENERATED', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => null),
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => payload),
    };

    const orderRepository = {
      findOne: jest.fn(async () => ({
        id: 'order-1',
        customerCpf: '12345678900',
        customerName: 'Cliente Teste',
        customerPhone: '11999999999',
        status: 'DIAGNOSIS',
        totalAmount: '0.00',
        updatedAt: new Date(),
      })),
      save: jest.fn(async (payload) => payload),
    };

    const orderItemRepository = {
      find: jest.fn(async () => [
        {
          catalogItemId: 'item-1',
          itemType: 'SERVICE',
          name: 'Troca de oleo',
          quantity: 2,
          subtotal: '300.00',
        },
      ]),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest.fn(async () => undefined),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new GenerateBudgetUseCase(
      budgetRepository as any,
      orderRepository as any,
      orderItemRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute({
      orderId: 'order-1',
      discount: 50,
      validDays: 7,
    });

    expect(result.totalAmount).toBe(300);
    expect(result.finalAmount).toBe(250);
    expect(orderStatusHistoryService.transitionStatus).toHaveBeenCalledWith(
      expect.objectContaining({ nextStatus: 'AWAITING_APPROVAL' }),
    );
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'BUDGET_GENERATED',
        routingKey: 'order.budget.generated',
      }),
    );
  });

  it('throws when order does not exist', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => null),
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => payload),
    };

    const orderRepository = {
      findOne: jest.fn(async () => null),
      save: jest.fn(async (payload) => payload),
    };

    const orderItemRepository = {
      find: jest.fn(async () => []),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest.fn(async () => undefined),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new GenerateBudgetUseCase(
      budgetRepository as any,
      orderRepository as any,
      orderItemRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    await expect(useCase.execute({ orderId: 'order-404' })).rejects.toThrow('Order not found');
  });

  it('does not transition status when order is already awaiting approval', async () => {
    const budgetRepository = {
      findOne: jest.fn(async () => ({
        id: 'budget-1',
        sentAt: new Date('2026-01-01T10:00:00.000Z'),
      })),
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => payload),
    };

    const orderRepository = {
      findOne: jest.fn(async () => ({
        id: 'order-1',
        customerCpf: '12345678900',
        customerName: 'Cliente Teste',
        customerPhone: '11999999999',
        status: 'AWAITING_APPROVAL',
        totalAmount: '0.00',
        updatedAt: new Date(),
      })),
      save: jest.fn(async (payload) => payload),
    };

    const orderItemRepository = {
      find: jest.fn(async () => []),
    };

    const orderStatusHistoryService = {
      transitionStatus: jest.fn(async () => undefined),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new GenerateBudgetUseCase(
      budgetRepository as any,
      orderRepository as any,
      orderItemRepository as any,
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    await useCase.execute({ orderId: 'order-1' });

    expect(orderStatusHistoryService.transitionStatus).not.toHaveBeenCalled();
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'BUDGET_GENERATED' }),
    );
  });
});

