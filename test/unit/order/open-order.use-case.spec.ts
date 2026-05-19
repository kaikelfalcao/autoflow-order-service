import { OpenOrderUseCase } from "../../../src/modules/order/application/use-cases/open-order/open-order.use-case";

describe("OpenOrderUseCase", () => {
  it("creates order and publishes OS_CREATED event", async () => {
    const orderRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => ({ ...payload })),
    };

    const customerServiceClient = {
      isEnabled: jest.fn(() => false),
      getCustomerProfile: jest.fn(),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new OpenOrderUseCase(
      orderRepository as any,
      customerServiceClient as any,
      orderEventPublisher as any,
      { set: jest.fn(), get: jest.fn(), snapshot: jest.fn() } as any,
    );

    const result = await useCase.execute({
      customerCpf: "12345678900",
      customerName: "Cliente Teste",
      customerPhone: "11999999999",
      vehiclePlate: "ABC1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      vehicleYear: 2020,
    });

    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    expect(orderRepository.save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("RECEIVED");
    expect(orderEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "OS_CREATED",
        routingKey: "order.created",
      }),
    );
  });

  it("validates customer profile when integration is enabled", async () => {
    const orderRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn(async (payload) => ({ ...payload })),
    };

    const customerServiceClient = {
      isEnabled: jest.fn(() => true),
      getCustomerProfile: jest.fn(async () => ({ customerId: "c1" })),
    };

    const orderEventPublisher = {
      publish: jest.fn(async () => undefined),
    };

    const useCase = new OpenOrderUseCase(
      orderRepository as any,
      customerServiceClient as any,
      orderEventPublisher as any,
      { set: jest.fn(), get: jest.fn(), snapshot: jest.fn() } as any,
    );

    await useCase.execute({
      customerCpf: "12345678900",
      customerName: "Cliente Teste",
      customerPhone: "11999999999",
      vehiclePlate: "ABC1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      vehicleYear: 2020,
    });

    expect(customerServiceClient.getCustomerProfile).toHaveBeenCalledWith(
      "12345678900",
    );
  });
});
