import { UpdateOrderStatusUseCase } from '../../../src/modules/order/application/use-cases/update-status/update-order-status.use-case';

describe('UpdateOrderStatusUseCase', () => {
  it('delegates status transition to history service', async () => {
    const orderStatusHistoryService = {
      transitionStatus: jest.fn(async () => ({
        id: 'order-1',
        status: 'DIAGNOSIS',
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
      })),
    };

    const useCase = new UpdateOrderStatusUseCase(orderStatusHistoryService as any);

    const result = await useCase.execute({
      orderId: 'order-1',
      status: 'DIAGNOSIS',
      changedBy: 'api:user',
      reason: 'started diagnosis',
    });

    expect(orderStatusHistoryService.transitionStatus).toHaveBeenCalledWith({
      orderId: 'order-1',
      nextStatus: 'DIAGNOSIS',
      changedBy: 'api:user',
      reason: 'started diagnosis',
    });
    expect(result.status).toBe('DIAGNOSIS');
  });

  it('uses default changedBy when it is not provided', async () => {
    const orderStatusHistoryService = {
      transitionStatus: jest.fn(async () => ({
        id: 'order-2',
        status: 'DIAGNOSIS',
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
      })),
    };

    const useCase = new UpdateOrderStatusUseCase(orderStatusHistoryService as any);

    await useCase.execute({
      orderId: 'order-2',
      status: 'DIAGNOSIS',
    });

    expect(orderStatusHistoryService.transitionStatus).toHaveBeenCalledWith(
      expect.objectContaining({ changedBy: 'api:user' }),
    );
  });
});

