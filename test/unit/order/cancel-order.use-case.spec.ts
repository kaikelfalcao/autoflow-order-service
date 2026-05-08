import { CancelOrderUseCase } from '../../../src/modules/order/application/use-cases/cancel-order/cancel-order.use-case';

describe('CancelOrderUseCase', () => {
  const makeOrderStatusHistoryService = (status = 'CANCELLED') => ({
    transitionStatus: jest.fn(async () => ({
      id: 'order-1',
      status,
      updatedAt: new Date(),
    })),
  });

  const makeEventPublisher = () => ({
    publish: jest.fn(async () => undefined),
  });

  it('cancels order and publishes OS_CANCELLED event', async () => {
    const orderStatusHistoryService = makeOrderStatusHistoryService();
    const orderEventPublisher = makeEventPublisher();

    const useCase = new CancelOrderUseCase(
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute({
      orderId: 'order-1',
      changedBy: 'api:user',
      reason: 'Customer requested cancellation',
    });

    expect(result.status).toBe('CANCELLED');
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'OS_CANCELLED',
        routingKey: 'order.cancelled',
        correlationId: 'order-1',
      }),
    );
  });

  it('uses defaults when changedBy and reason are not provided', async () => {
    const orderStatusHistoryService = makeOrderStatusHistoryService();
    const orderEventPublisher = makeEventPublisher();

    const useCase = new CancelOrderUseCase(
      orderStatusHistoryService as any,
      orderEventPublisher as any,
    );

    await useCase.execute({ orderId: 'order-2' });

    expect(orderStatusHistoryService.transitionStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        changedBy: 'api:user',
        reason: 'Cancelled by request',
      }),
    );
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ reason: 'Cancelled by request' }),
      }),
    );
  });
});

