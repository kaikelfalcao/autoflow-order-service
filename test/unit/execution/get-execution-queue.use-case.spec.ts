import { GetExecutionQueueUseCase } from '../../../src/modules/execution/application/use-cases/get-execution-queue/get-execution-queue.use-case';

describe('GetExecutionQueueUseCase', () => {
  it('returns prioritized queue payload', async () => {
    const chain = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(async () => [
        {
          id: 'order-1',
          customerCpf: '12345678900',
          customerName: 'Cliente Teste',
          customerPhone: '11999999999',
          vehiclePlate: 'ABC1234',
          vehicleBrand: 'Toyota',
          vehicleModel: 'Corolla',
          vehicleYear: 2020,
          branchId: null,
          status: 'IN_EXECUTION',
          totalAmount: '300.00',
          notes: null,
          createdAt: new Date('2026-01-01T10:00:00.000Z'),
          updatedAt: new Date('2026-01-01T10:01:00.000Z'),
        },
      ]),
    };

    const orderRepository = {
      createQueryBuilder: jest.fn(() => chain),
    };

    const useCase = new GetExecutionQueueUseCase(orderRepository as any);
    const result = await useCase.execute();

    expect(orderRepository.createQueryBuilder).toHaveBeenCalledWith('orders');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('IN_EXECUTION');
    expect(result[0].totalAmount).toBe(300);
  });
});

