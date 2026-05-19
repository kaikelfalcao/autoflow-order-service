import { CompleteExecutionUseCase } from "../../../src/modules/execution/application/use-cases/complete-execution/complete-execution.use-case";

describe("CompleteExecutionUseCase", () => {
  it("transitions to COMPLETED and AWAITING_PAYMENT and publishes events", async () => {
    const orderStatusHistoryService = {
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce({
          id: "order-1",
          status: "COMPLETED",
          updatedAt: new Date("2026-01-01T10:00:00.000Z"),
        })
        .mockResolvedValueOnce({
          id: "order-1",
          status: "AWAITING_PAYMENT",
          updatedAt: new Date("2026-01-01T10:01:00.000Z"),
        }),
    };

    const orderRepository = {
      findOne: jest.fn(async () => ({
        id: "order-1",
        customerCpf: "12345678900",
        customerName: "Cliente Teste",
        totalAmount: "300.00",
      })),
    };

    const orderItemRepository = {
      find: jest.fn(async () => [
        {
          name: "Troca de oleo",
          quantity: 2,
          unitPrice: "150.00",
          subtotal: "300.00",
        },
      ]),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new CompleteExecutionUseCase(
      orderStatusHistoryService as any,
      orderRepository as any,
      orderItemRepository as any,
      orderEventPublisher as any,
    );

    const result = await useCase.execute("order-1");

    expect(orderStatusHistoryService.transitionStatus).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("AWAITING_PAYMENT");
    expect(orderEventPublisher.publish).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ eventType: "EXECUTION_COMPLETED" }),
    );
    expect(orderEventPublisher.publish).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ eventType: "PAYMENT_REQUESTED" }),
    );
  });

  it("does not publish events when order is not found", async () => {
    const orderStatusHistoryService = {
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce({
          id: "order-1",
          status: "COMPLETED",
          updatedAt: new Date("2026-01-01T10:00:00.000Z"),
        })
        .mockResolvedValueOnce({
          id: "order-1",
          status: "AWAITING_PAYMENT",
          updatedAt: new Date("2026-01-01T10:01:00.000Z"),
        }),
    };

    const orderRepository = {
      findOne: jest.fn(async () => null),
    };

    const orderItemRepository = {
      find: jest.fn(async () => []),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new CompleteExecutionUseCase(
      orderStatusHistoryService as any,
      orderRepository as any,
      orderItemRepository as any,
      orderEventPublisher as any,
    );

    await useCase.execute("order-1");

    expect(orderEventPublisher.publish).not.toHaveBeenCalled();
  });
});
