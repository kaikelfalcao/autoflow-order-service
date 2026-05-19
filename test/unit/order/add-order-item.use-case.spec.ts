import { NotFoundException } from "@nestjs/common";

import { AddOrderItemUseCase } from "../../../src/modules/order/application/use-cases/add-item/add-order-item.use-case";

describe("AddOrderItemUseCase", () => {
  const makeOrder = () => ({
    id: "order-1",
    totalAmount: "0.00",
    updatedAt: new Date(),
  });

  const makeItem = (subtotal: string) => ({ subtotal });

  it("adds an item and recalculates total amount", async () => {
    const order = makeOrder();
    const createdItem = {
      id: "item-1",
      orderId: "order-1",
      subtotal: "150.00",
    };

    const orderRepository = {
      findOne: jest.fn(async () => order),
      save: jest.fn(async (o) => o),
    };
    const orderItemRepository = {
      create: jest.fn(() => createdItem),
      save: jest.fn(async (item) => item),
      find: jest.fn(async () => [makeItem("150.00")]),
    };

    const useCase = new AddOrderItemUseCase(
      orderRepository as any,
      orderItemRepository as any,
    );

    const result = await useCase.execute({
      orderId: "order-1",
      itemType: "SERVICE",
      catalogItemId: "catalog-1",
      name: "Oil Change",
      unitPrice: 150,
      quantity: 1,
    });

    expect(result.orderId).toBe("order-1");
    expect(result.totalAmount).toBe(150);
    expect(orderRepository.save).toHaveBeenCalled();
  });

  it("defaults quantity to 1 when not provided", async () => {
    const order = makeOrder();
    const createdItem = {
      id: "item-2",
      orderId: "order-1",
      subtotal: "200.00",
    };

    const orderRepository = {
      findOne: jest.fn(async () => order),
      save: jest.fn(async (o) => o),
    };
    const orderItemRepository = {
      create: jest.fn((data) => ({ ...createdItem, ...data })),
      save: jest.fn(async (item) => item),
      find: jest.fn(async () => [makeItem("200.00")]),
    };

    const useCase = new AddOrderItemUseCase(
      orderRepository as any,
      orderItemRepository as any,
    );

    const result = await useCase.execute({
      orderId: "order-1",
      itemType: "PART",
      catalogItemId: "catalog-2",
      name: "Oil Filter",
      unitPrice: 200,
      // quantity omitted → defaults to 1
    });

    expect(result.totalAmount).toBe(200);
    expect(orderItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 1, subtotal: "200.00" }),
    );
  });

  it("throws NotFoundException when order does not exist", async () => {
    const orderRepository = {
      findOne: jest.fn(async () => null),
      save: jest.fn(),
    };
    const orderItemRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const useCase = new AddOrderItemUseCase(
      orderRepository as any,
      orderItemRepository as any,
    );

    await expect(
      useCase.execute({
        orderId: "non-existent",
        itemType: "SERVICE",
        catalogItemId: "c-1",
        name: "Test",
        unitPrice: 50,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
